import { DEFAULT_SETTINGS, type MatchRecord, type PlayerSettings } from "@/lib/gameModes";

export interface SavedProgress {
  version: 2;
  bestScore: number;
  victories: number;
  achievements: string[];
  matchHistory: MatchRecord[];
  dailyScores: Record<string, number>;
  settings: PlayerSettings;
}

const SAVE_KEY = "spider-man-fighting-arena-progress";
const EMPTY_PROGRESS: SavedProgress = { version: 2, bestScore: 0, victories: 0, achievements: [], matchHistory: [], dailyScores: {}, settings: DEFAULT_SETTINGS };
let loadCompleted = false;
let cloudSaveAvailable = false;

function sdk(): YouTubePlayablesSdk | undefined {
  return typeof ytgame === "undefined" ? undefined : ytgame;
}

function inPlayables(): boolean {
  return Boolean(sdk()?.IN_PLAYABLES_ENV);
}

function progressFrom(value: unknown): SavedProgress {
  const candidate = value && typeof value === "object" ? value as Partial<SavedProgress> : {};
  return {
    version: 2,
    bestScore: Number.isSafeInteger(candidate.bestScore) && candidate.bestScore! >= 0 ? candidate.bestScore! : 0,
    victories: Number.isSafeInteger(candidate.victories) && candidate.victories! >= 0 ? candidate.victories! : 0,
    achievements: Array.isArray(candidate.achievements) ? candidate.achievements.filter((item): item is string => typeof item === "string").slice(0, 40) : [],
    matchHistory: Array.isArray(candidate.matchHistory) ? candidate.matchHistory.filter((item): item is MatchRecord => Boolean(item && typeof item === "object")).slice(0, 12) : [],
    dailyScores: candidate.dailyScores && typeof candidate.dailyScores === "object" ? candidate.dailyScores as Record<string, number> : {},
    settings: { ...DEFAULT_SETTINGS, ...(candidate.settings && typeof candidate.settings === "object" ? candidate.settings : {}) },
  };
}

function warn() { try { sdk()?.health.logWarning(); } catch { /* Best-effort telemetry. */ } }
function error() { try { sdk()?.health.logError(); } catch { /* Best-effort telemetry. */ } }

export async function loadProgress(): Promise<SavedProgress> {
  const api = sdk();
  if (inPlayables() && api) {
    try {
      const raw = await api.game.loadData();
      cloudSaveAvailable = true;
      return progressFrom(JSON.parse(raw || "{}"));
    } catch {
      warn();
      return EMPTY_PROGRESS;
    } finally {
      // YouTube rejects saveData until loadData has settled successfully.
      loadCompleted = true;
    }
  }
  loadCompleted = true;
  try { return progressFrom(JSON.parse(window.localStorage.getItem(SAVE_KEY) || "{}")); }
  catch { return EMPTY_PROGRESS; }
}

export async function saveProgress(progress: SavedProgress): Promise<void> {
  const data = JSON.stringify(progressFrom(progress));
  if (data.length > 64 * 1024) { error(); return; }
  if (inPlayables()) {
    if (!loadCompleted || !cloudSaveAvailable) return;
    try { await sdk()?.game.saveData(data); } catch { warn(); }
  } else {
    window.localStorage.setItem(SAVE_KEY, data);
  }
}

export async function submitBestScore(score: number): Promise<void> {
  if (!inPlayables()) return;
  const value = Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.trunc(score)));
  try { await sdk()?.engagement.sendScore({ value }); } catch { warn(); }
}

export function notifyFirstFrameReady() { try { sdk()?.game.firstFrameReady(); } catch { error(); } }
export function notifyGameReady() { try { sdk()?.game.gameReady(); } catch { error(); } }

export async function applyYouTubeLanguage() {
  if (!inPlayables()) return;
  try {
    const language = await sdk()?.system.getLanguage();
    if (language) document.documentElement.lang = language;
  } catch { warn(); }
}

export function subscribeToPlayablesSystem(options: {
  onAudioEnabledChange: (enabled: boolean) => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const api = sdk();
  if (!inPlayables() || !api) return () => undefined;
  try {
    options.onAudioEnabledChange(api.system.isAudioEnabled());
    const stopAudio = api.system.onAudioEnabledChange(options.onAudioEnabledChange);
    const stopPause = api.game.onPause(options.onPause);
    const stopResume = api.game.onResume(options.onResume);
    return () => { stopAudio(); stopPause(); stopResume(); };
  } catch {
    error();
    return () => undefined;
  }
}
