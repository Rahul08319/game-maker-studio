/**
 * @file base.ts
 * @description Default/fallback platform adapter for Spider-Man Fighting Game.
 * Used when no specific platform is detected. All save/load operations use
 * localStorage. All ad and score methods are graceful no-ops.
 *
 * Implements the GamePlatform interface:
 * @interface GamePlatform
 * @property {string}  name           - Human-readable platform name.
 * @property {boolean} isReady        - True after init() resolves.
 * @method init()                     - Async platform initialisation.
 * @method firstFrameReady()          - Called when the first frame is rendered.
 * @method gameReady()                - Called when the game loop is fully loaded.
 * @method isAudioEnabled()           - Returns current audio state.
 * @method onAudioEnabledChange(cb)   - Subscribes to audio-state changes.
 * @method onPause(cb)                - Subscribes to pause events.
 * @method onResume(cb)               - Subscribes to resume events.
 * @method saveData(data)             - Persists serialised game data.
 * @method loadData()                 - Loads previously saved game data.
 * @method sendScore(score)           - Submits a score to a leaderboard.
 * @method showInterstitialAd()       - Displays a full-screen interstitial ad.
 * @method showRewardedAd(rewardId)   - Displays a rewarded ad; resolves true on reward.
 * @method getLanguage()              - Resolves the user's language code.
 * @method logError(err)              - Logs an error to the platform console.
 * @method logWarning(msg)            - Logs a warning to the platform console.
 */

const STORAGE_KEY = "spiderman_game_save";

export class BasePlatform {
  readonly name = "Base";
  isReady = false;

  /** Subscribed pause callbacks. */
  private _pauseCallbacks: Array<() => void> = [];
  /** Subscribed resume callbacks. */
  private _resumeCallbacks: Array<() => void> = [];
  /** Current audio-enabled state. */
  private _audioEnabled = true;
  /** Subscribed audio-change callbacks. */
  private _audioCallbacks: Array<(enabled: boolean) => void> = [];

  constructor() {
    // Listen to the Page Visibility API for pause/resume so every platform
    // benefits automatically, even without a platform-specific hook.
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

  /** Initialise the platform. Resolves immediately for the base adapter. */
  async init(): Promise<void> {
    this.isReady = true;
  }

  /** Called when the very first frame has been rendered. No-op for base. */
  firstFrameReady(): void {
    // No-op — base platform has no loading-progress API.
  }

  /** Called when the game is fully loaded and interactive. No-op for base. */
  gameReady(): void {
    // No-op — base platform has no ready-signal API.
  }

  /** Returns whether audio is currently enabled. */
  isAudioEnabled(): boolean {
    return this._audioEnabled;
  }

  /**
   * Subscribe to audio-enabled state changes.
   * @returns Unsubscribe function.
   */
  onAudioEnabledChange(cb: (enabled: boolean) => void): () => void {
    this._audioCallbacks.push(cb);
    return () => {
      this._audioCallbacks = this._audioCallbacks.filter((c) => c !== cb);
    };
  }

  /**
   * Subscribe to pause events (tab hidden / focus lost).
   * @returns Unsubscribe function.
   */
  onPause(cb: () => void): () => void {
    this._pauseCallbacks.push(cb);
    return () => {
      this._pauseCallbacks = this._pauseCallbacks.filter((c) => c !== cb);
    };
  }

  /**
   * Subscribe to resume events (tab visible / focus gained).
   * @returns Unsubscribe function.
   */
  onResume(cb: () => void): () => void {
    this._resumeCallbacks.push(cb);
    return () => {
      this._resumeCallbacks = this._resumeCallbacks.filter((c) => c !== cb);
    };
  }

  /**
   * Persist serialised game data using localStorage.
   * @param data - JSON-serialised save string.
   */
  async saveData(data: string): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, data);
    } catch (err) {
      this.logError(err);
    }
  }

  /**
   * Load previously saved game data from localStorage.
   * @returns The saved string, or null if nothing is stored.
   */
  async loadData(): Promise<string | null> {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      this.logError(err);
      return null;
    }
  }

  /**
   * Submit a score. No-op for the base adapter — no leaderboard service.
   * @param _score - The score value to submit.
   */
  async sendScore(_score: number): Promise<void> {
    // No-op — base platform has no leaderboard API.
  }

  /** Display an interstitial ad. No-op for the base adapter. */
  async showInterstitialAd(): Promise<void> {
    // No-op — base platform has no ad network.
  }

  /**
   * Display a rewarded ad. Always returns false for the base adapter.
   * @param _rewardId - The reward identifier.
   */
  async showRewardedAd(_rewardId: string): Promise<boolean> {
    // No-op — base platform has no ad network.
    return false;
  }

  /** Resolve the user's preferred language from the browser. */
  async getLanguage(): Promise<string> {
    try {
      return navigator.language ?? "en";
    } catch {
      return "en";
    }
  }

  /**
   * Log an error to the console. Safe to call with any value.
   * @param err - The error or message to log.
   */
  logError(err?: unknown): void {
    try {
      console.error("[BasePlatform]", err);
    } catch {
      // Swallow — never let logging crash the game.
    }
  }

  /**
   * Log a warning to the console.
   * @param msg - The warning message.
   */
  logWarning(msg?: string): void {
    try {
      console.warn("[BasePlatform]", msg);
    } catch {
      // Swallow.
    }
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  /** Broadcast a new audio-enabled state to all subscribers. */
  protected _setAudio(enabled: boolean): void {
    this._audioEnabled = enabled;
    this._audioCallbacks.forEach((cb) => cb(enabled));
  }
}

export default BasePlatform;
