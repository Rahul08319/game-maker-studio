/**
 * YouTube Playables SDK Integration
 *
 * A resilient wrapper around the YouTube Playables SDK (ytgame).
 * All APIs gracefully no-op when running outside the Playables environment,
 * so the game functions correctly in local development and standard browser
 * contexts without modification.
 *
 * Required integrations covered:
 *  - ytgame.game.firstFrameReady()
 *  - ytgame.game.gameReady()
 *  - ytgame.IN_PLAYABLES_ENV
 *  - ytgame.system.isAudioEnabled()
 *  - ytgame.system.onAudioEnabledChange()
 *  - ytgame.system.onPause()
 *  - ytgame.system.onResume()
 *  - ytgame.game.loadData()
 *  - ytgame.game.saveData()
 *
 * Recommended integrations covered:
 *  - ytgame.system.getLanguage()
 *  - ytgame.engagement.sendScore()
 *  - ytgame.engagement.openYTContent()
 *  - ytgame.health.logError()
 *  - ytgame.health.logWarning()
 *  - ytgame.ads.requestInterstitialAd()
 *  - ytgame.ads.requestRewardedAd()
 *
 * @see https://developers.google.com/youtube/gaming/playables/reference/sdk
 */

declare let ytgame: typeof import('../types/ytgame');

// ---------------------------------------------------------------------------
// Environment Detection
// ---------------------------------------------------------------------------

/**
 * Returns true if the game is running inside the YouTube Playables environment.
 * Always check this before using Playables-only features.
 */
export function isInPlayables(): boolean {
  return typeof ytgame !== 'undefined' && ytgame.IN_PLAYABLES_ENV;
}

/**
 * Returns the YouTube Playables SDK version, or null if not in Playables.
 */
export function getSdkVersion(): string | null {
  if (typeof ytgame === 'undefined') return null;
  return ytgame.SDK_VERSION ?? null;
}

// ---------------------------------------------------------------------------
// Lifecycle — REQUIRED
// ---------------------------------------------------------------------------

/**
 * REQUIRED: Call when the first game frame is rendered/visible.
 * Must be called BEFORE gameReady().
 */
export function firstFrameReady(): void {
  try {
    if (typeof ytgame !== 'undefined') {
      ytgame.game.firstFrameReady();
    }
  } catch (err) {
    ytLogError(err);
  }
}

/**
 * REQUIRED: Call when the game is fully interactive (no loading screens).
 * Must be called AFTER firstFrameReady().
 */
export function gameReady(): void {
  try {
    if (typeof ytgame !== 'undefined') {
      ytgame.game.gameReady();
    }
  } catch (err) {
    ytLogError(err);
  }
}

// ---------------------------------------------------------------------------
// Audio — REQUIRED
// ---------------------------------------------------------------------------

/**
 * REQUIRED: Returns the initial audio enabled state from YouTube settings.
 * Falls back to true (audio on) when not in Playables environment.
 */
export function isAudioEnabled(): boolean {
  try {
    if (typeof ytgame !== 'undefined') {
      return ytgame.system.isAudioEnabled();
    }
  } catch (err) {
    ytLogError(err);
  }
  return true; // Default: audio enabled
}

/**
 * REQUIRED: Listen for YouTube system-level audio toggle events.
 * Returns an unsubscribe function.
 */
export function onAudioEnabledChange(callback: (enabled: boolean) => void): () => void {
  try {
    if (typeof ytgame !== 'undefined') {
      return ytgame.system.onAudioEnabledChange(callback);
    }
  } catch (err) {
    ytLogError(err);
  }
  return () => {}; // No-op unsubscribe
}

// ---------------------------------------------------------------------------
// Pause / Resume — REQUIRED
// ---------------------------------------------------------------------------

/**
 * REQUIRED: Register a callback for YouTube-triggered pause events.
 * Called when user backgrounds the game or YouTube interrupts it.
 * Returns an unsubscribe function.
 */
export function onPause(callback: () => void): () => void {
  try {
    if (typeof ytgame !== 'undefined') {
      return ytgame.system.onPause(callback);
    }
  } catch (err) {
    ytLogError(err);
  }
  return () => {};
}

/**
 * REQUIRED: Register a callback for YouTube-triggered resume events.
 * Returns an unsubscribe function.
 */
export function onResume(callback: () => void): () => void {
  try {
    if (typeof ytgame !== 'undefined') {
      return ytgame.system.onResume(callback);
    }
  } catch (err) {
    ytLogError(err);
  }
  return () => {};
}

// ---------------------------------------------------------------------------
// Cloud Save — REQUIRED
// ---------------------------------------------------------------------------

const LOCAL_SAVE_KEY = 'SPIDER_MAN_ARENA_SAVE';

/**
 * REQUIRED: Save serialized game data to YouTube cloud storage.
 * Falls back to localStorage when not in Playables environment.
 * Data must be valid UTF-16 and <= 3 MiB.
 */
export async function saveData(data: string): Promise<void> {
  // Validate UTF-16 string (required by YouTube spec)
  if (typeof data === 'string' && typeof (data as any).isWellFormed === 'function') {
    if (!(data as any).isWellFormed()) {
      console.warn('[YTPlayables] saveData: String is not well-formed UTF-16, skipping save.');
      return;
    }
  }

  if (isInPlayables()) {
    try {
      await ytgame.game.saveData(data);
    } catch (err) {
      ytLogError(err);
      // Fallback to localStorage as a secondary backup
      try { localStorage.setItem(LOCAL_SAVE_KEY, data); } catch {}
    }
  } else {
    // Outside Playables — use localStorage
    try {
      localStorage.setItem(LOCAL_SAVE_KEY, data);
    } catch (err) {
      console.warn('[YTPlayables] localStorage save failed:', err);
    }
  }
}

/**
 * REQUIRED: Load serialized game data from YouTube cloud storage.
 * Falls back to localStorage when not in Playables environment.
 * Returns null if no save data exists.
 */
export async function loadData(): Promise<string | null> {
  if (isInPlayables()) {
    try {
      const data = await ytgame.game.loadData();
      return data ?? null;
    } catch (err) {
      ytLogError(err);
      // Try localStorage as secondary fallback
      return localStorage.getItem(LOCAL_SAVE_KEY);
    }
  } else {
    return localStorage.getItem(LOCAL_SAVE_KEY);
  }
}

// ---------------------------------------------------------------------------
// Engagement — RECOMMENDED
// ---------------------------------------------------------------------------

/**
 * RECOMMENDED: Send a best-score integer to YouTube for leaderboard display.
 * Score must be a safe integer (≤ Number.MAX_SAFE_INTEGER).
 */
export async function sendScore(score: number): Promise<void> {
  if (!Number.isInteger(score) || score > Number.MAX_SAFE_INTEGER || score < 0) {
    console.warn('[YTPlayables] sendScore: Invalid score value:', score);
    return;
  }
  try {
    if (isInPlayables()) {
      await ytgame.engagement.sendScore({ value: score });
    }
  } catch (err) {
    ytLogError(err);
  }
}

/**
 * RECOMMENDED: Open a YouTube video or Playable in the YouTube player.
 */
export async function openYTContent(id: string, contentType: 'VIDEO' | 'PLAYABLE' = 'VIDEO'): Promise<void> {
  try {
    if (isInPlayables()) {
      await ytgame.engagement.openYTContent({
        id,
        contentType: contentType === 'VIDEO'
          ? ytgame.engagement.ContentType.VIDEO
          : ytgame.engagement.ContentType.PLAYABLE,
      });
    }
  } catch (err) {
    ytLogError(err);
  }
}

// ---------------------------------------------------------------------------
// Health / Telemetry — RECOMMENDED
// ---------------------------------------------------------------------------

/**
 * RECOMMENDED: Report an error to YouTube telemetry (best-effort, rate-limited).
 */
export function logError(err?: unknown): void {
  ytLogError(err);
}

/**
 * RECOMMENDED: Report a warning to YouTube telemetry (best-effort, rate-limited).
 */
export function logWarning(msg?: string): void {
  if (msg) console.warn('[YTPlayables]', msg);
  try {
    if (typeof ytgame !== 'undefined') {
      ytgame.health.logWarning();
    }
  } catch {}
}

/** Internal error reporter — logs locally and reports to YouTube health API */
function ytLogError(err?: unknown): void {
  if (err) console.error('[YTPlayables]', err);
  try {
    if (typeof ytgame !== 'undefined') {
      ytgame.health.logError();
    }
  } catch {}
}

// ---------------------------------------------------------------------------
// Ads — RECOMMENDED
// ---------------------------------------------------------------------------

/**
 * RECOMMENDED: Request an interstitial ad at a natural breakpoint (e.g., between rounds).
 * Makes no guarantee the ad will be shown. Do NOT reward players for watching.
 */
export async function requestInterstitialAd(): Promise<void> {
  try {
    if (isInPlayables()) {
      await ytgame.ads.requestInterstitialAd();
    }
  } catch (err) {
    // Interstitial failures are expected — fail silently
    console.debug('[YTPlayables] Interstitial ad not shown:', err);
  }
}

/**
 * Reward IDs — unique stable identifiers for each reward type.
 * Per YouTube policy: must NOT contain user data, must be stable across sessions.
 */
export const REWARD_IDS = {
  REVIVE_FIGHTER: 'revive-fighter-full-health-v1',
  SPECIAL_ENERGY: 'special-energy-full-charge-v1',
} as const;

export type RewardId = typeof REWARD_IDS[keyof typeof REWARD_IDS];

/**
 * RECOMMENDED: Request a rewarded ad and return whether the reward was earned.
 * Use a stable, unique `rewardId` per reward type (no user data in the ID).
 */
export async function requestRewardedAd(rewardId: RewardId): Promise<boolean> {
  try {
    if (isInPlayables()) {
      return await ytgame.ads.requestRewardedAd(rewardId);
    }
  } catch (err) {
    console.debug('[YTPlayables] Rewarded ad failed:', err);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Locale — RECOMMENDED
// ---------------------------------------------------------------------------

/**
 * RECOMMENDED: Get the user's current YouTube locale as a BCP-47 tag.
 * Do NOT store this in cloud save; call this each time you need the language.
 */
export async function getLanguage(): Promise<string> {
  try {
    if (isInPlayables()) {
      return await ytgame.system.getLanguage();
    }
  } catch (err) {
    ytLogError(err);
  }
  // Fallback to browser locale
  return navigator.language ?? 'en-US';
}

// ---------------------------------------------------------------------------
// Save Data Schema
// ---------------------------------------------------------------------------

/** The shape of data persisted via cloud save / localStorage */
export interface GameSaveData {
  /** All-time best score (highest combo damage dealt in a match) */
  bestScore: number;
  /** Total matches won */
  totalWins: number;
  /** Total matches played */
  totalMatches: number;
  /** Current win streak */
  winStreak: number;
  /** Preferred character sprite key */
  preferredCharacter?: string;
  /** Preferred stage ID */
  preferredStage?: string;
  /** Schema version for future migration */
  version: number;
}

const SAVE_VERSION = 1;

export function createDefaultSaveData(): GameSaveData {
  return {
    bestScore: 0,
    totalWins: 0,
    totalMatches: 0,
    winStreak: 0,
    version: SAVE_VERSION,
  };
}

export async function loadGameSaveData(): Promise<GameSaveData> {
  try {
    const raw = await loadData();
    if (raw) {
      const parsed = JSON.parse(raw) as GameSaveData;
      // Handle schema migrations in future versions
      if (parsed.version === SAVE_VERSION) {
        return parsed;
      }
    }
  } catch (err) {
    logError(err);
  }
  return createDefaultSaveData();
}

export async function saveGameSaveData(data: GameSaveData): Promise<void> {
  try {
    await saveData(JSON.stringify(data));
  } catch (err) {
    logError(err);
  }
}
