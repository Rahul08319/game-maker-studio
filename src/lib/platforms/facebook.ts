/**
 * @file facebook.ts
 * @description Facebook Instant Games platform adapter for Spider-Man Fighting Game.
 * Requires the FBInstant SDK loaded via:
 *   <script src="https://connect.facebook.net/en_US/fbinstant.6.3.js"></script>
 *
 * Implements the GamePlatform interface — see base.ts for full interface docs.
 */

// ── FBInstant global type declarations ──────────────────────────────────────
declare const FBInstant: {
  initializeAsync(): Promise<void>;
  startGameAsync(): Promise<void>;
  setLoadingProgress(progress: number): void;
  getLocale(): string;
  player: {
    getDataAsync(keys: string[]): Promise<Record<string, unknown>>;
    setDataAsync(data: Record<string, unknown>): Promise<void>;
  };
  context: {
    getLeaderboardAsync(name: string): Promise<{
      setScoreAsync(score: number): Promise<void>;
    }>;
  };
  getInterstitialAdAsync(placementId: string): Promise<{
    loadAsync(): Promise<void>;
    showAsync(): Promise<void>;
  }>;
  getRewardedVideoAsync(placementId: string): Promise<{
    loadAsync(): Promise<void>;
    showAsync(): Promise<void>;
  }>;
};

const STORAGE_KEY = "spiderman_game_save";
const LEADERBOARD_NAME = "main_leaderboard";
const INTERSTITIAL_PLACEMENT = "INTERSTITIAL_PLACEMENT_ID";
const REWARDED_PLACEMENT = "REWARDED_PLACEMENT_ID";

export class FacebookPlatform {
  readonly name = "Facebook Instant Games";
  isReady = false;

  /** Guard against calling startGameAsync() more than once. */
  private _gameStarted = false;

  private _pauseCallbacks: Array<() => void> = [];
  private _resumeCallbacks: Array<() => void> = [];
  private _audioEnabled = true;
  private _audioCallbacks: Array<(enabled: boolean) => void> = [];

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this._pauseCallbacks.forEach((cb) => cb());
        } else {
          this._resumeCallbacks.forEach((cb) => cb());
        }
      });
    }
  }

  /** Initialise FBInstant: initializeAsync → startGameAsync. */
  async init(): Promise<void> {
    try {
      if (typeof FBInstant === "undefined") {
        throw new Error("FBInstant SDK not loaded.");
      }
      await FBInstant.initializeAsync();
      await FBInstant.startGameAsync();
      this._gameStarted = true;
      this.isReady = true;
    } catch (err) {
      this.logError(err);
    }
  }

  /** Signal 100 % loading progress to FBInstant splash screen. */
  firstFrameReady(): void {
    try {
      if (typeof FBInstant !== "undefined") {
        FBInstant.setLoadingProgress(100);
      }
    } catch (err) {
      this.logError(err);
    }
  }

  /** Call startGameAsync() once the game loop is ready (guards double-call). */
  gameReady(): void {
    try {
      if (typeof FBInstant !== "undefined" && !this._gameStarted) {
        FBInstant.startGameAsync().then(() => {
          this._gameStarted = true;
        }).catch((err) => this.logError(err));
      }
    } catch (err) {
      this.logError(err);
    }
  }

  /** Returns whether audio is currently enabled. */
  isAudioEnabled(): boolean {
    return this._audioEnabled;
  }

  /** Subscribe to audio-enabled state changes. Returns unsubscribe fn. */
  onAudioEnabledChange(cb: (enabled: boolean) => void): () => void {
    this._audioCallbacks.push(cb);
    return () => {
      this._audioCallbacks = this._audioCallbacks.filter((c) => c !== cb);
    };
  }

  /** Subscribe to pause events. Returns unsubscribe fn. */
  onPause(cb: () => void): () => void {
    this._pauseCallbacks.push(cb);
    return () => {
      this._pauseCallbacks = this._pauseCallbacks.filter((c) => c !== cb);
    };
  }

  /** Subscribe to resume events. Returns unsubscribe fn. */
  onResume(cb: () => void): () => void {
    this._resumeCallbacks.push(cb);
    return () => {
      this._resumeCallbacks = this._resumeCallbacks.filter((c) => c !== cb);
    };
  }

  /**
   * Persist save data via FBInstant player cloud storage.
   * Falls back to localStorage on error.
   */
  async saveData(data: string): Promise<void> {
    try {
      if (typeof FBInstant !== "undefined") {
        await FBInstant.player.setDataAsync({ save: data });
        return;
      }
    } catch (err) {
      this.logError(err);
    }
    try {
      localStorage.setItem(STORAGE_KEY, data);
    } catch (lsErr) {
      this.logError(lsErr);
    }
  }

  /**
   * Load save data from FBInstant player cloud storage.
   * Falls back to localStorage on error.
   */
  async loadData(): Promise<string | null> {
    try {
      if (typeof FBInstant !== "undefined") {
        const result = await FBInstant.player.getDataAsync(["save"]);
        return (result["save"] as string) ?? null;
      }
    } catch (err) {
      this.logError(err);
    }
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /** Submit a score to the FBInstant leaderboard. */
  async sendScore(score: number): Promise<void> {
    try {
      if (typeof FBInstant !== "undefined") {
        const lb = await FBInstant.context.getLeaderboardAsync(LEADERBOARD_NAME);
        await lb.setScoreAsync(score);
      }
    } catch (err) {
      this.logError(err);
    }
  }

  /** Load and show a full-screen interstitial ad via FBInstant. */
  async showInterstitialAd(): Promise<void> {
    try {
      if (typeof FBInstant !== "undefined") {
        const ad = await FBInstant.getInterstitialAdAsync(INTERSTITIAL_PLACEMENT);
        await ad.loadAsync();
        await ad.showAsync();
      }
    } catch (err) {
      this.logError(err);
    }
  }

  /**
   * Load and show a rewarded video ad via FBInstant.
   * Returns true when the rewarded video completes without error.
   */
  async showRewardedAd(_rewardId: string): Promise<boolean> {
    try {
      if (typeof FBInstant !== "undefined") {
        const ad = await FBInstant.getRewardedVideoAsync(REWARDED_PLACEMENT);
        await ad.loadAsync();
        await ad.showAsync();
        return true;
      }
    } catch (err) {
      this.logError(err);
    }
    return false;
  }

  /** Resolve the game locale reported by FBInstant. */
  async getLanguage(): Promise<string> {
    try {
      if (typeof FBInstant !== "undefined") {
        return FBInstant.getLocale() ?? "en";
      }
    } catch (err) {
      this.logError(err);
    }
    return navigator.language ?? "en";
  }

  /** Log an error with the platform prefix. */
  logError(err?: unknown): void {
    try {
      console.error("[FacebookPlatform]", err);
    } catch { /* swallow */ }
  }

  /** Log a warning with the platform prefix. */
  logWarning(msg?: string): void {
    try {
      console.warn("[FacebookPlatform]", msg);
    } catch { /* swallow */ }
  }
}

export default FacebookPlatform;
