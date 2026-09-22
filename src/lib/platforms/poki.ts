/**
 * @file poki.ts
 * @description Poki platform adapter for Spider-Man Fighting Game.
 * Requires the Poki SDK loaded via:
 *   <script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js"></script>
 *
 * Implements the GamePlatform interface — see base.ts for full interface docs.
 */

// ── PokiSDK global type declarations ────────────────────────────────────────
declare const PokiSDK: {
  init(): Promise<void>;
  gameLoadingFinished(): void;
  gameplayStart(): void;
  gameplayStop(): void;
  commercialBreak(): Promise<void>;
  rewardedBreak(): Promise<boolean>;
};

const STORAGE_KEY = "spiderman_game_save";

export class PokiPlatform {
  readonly name = "Poki";
  isReady = false;

  private _pauseCallbacks: Array<() => void> = [];
  private _resumeCallbacks: Array<() => void> = [];
  private _audioEnabled = true;
  private _audioCallbacks: Array<(enabled: boolean) => void> = [];

  /**
   * Track gameplay session so we can pair gameplayStart/Stop correctly.
   * Poki requires gameplayStart before every gameplay segment and
   * gameplayStop before showing ads or pausing.
   */
  private _gameplayActive = false;

  constructor() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this._triggerPause();
        } else {
          this._triggerResume();
        }
      });
    }
  }

  /** Initialise the Poki SDK. */
  async init(): Promise<void> {
    try {
      if (typeof PokiSDK === "undefined") {
        throw new Error("PokiSDK not loaded.");
      }
      await PokiSDK.init();
      this.isReady = true;
    } catch (err) {
      this.logError(err);
    }
  }

  /**
   * firstFrameReady is a no-op on Poki — use gameReady() instead.
   * Poki's progress is managed entirely by gameLoadingFinished().
   */
  firstFrameReady(): void {
    // No-op — Poki has no intermediate loading-progress API.
  }

  /** Signal that the game has finished loading to the Poki SDK. */
  gameReady(): void {
    try {
      if (typeof PokiSDK !== "undefined") {
        PokiSDK.gameLoadingFinished();
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

  /**
   * Subscribe to pause events.
   * Poki's commercial break acts as a "pause" — we also listen to
   * the Page Visibility API via the constructor.
   * @returns Unsubscribe function.
   */
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

  /** Persist save data to localStorage (Poki has no cloud save API). */
  async saveData(data: string): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, data);
    } catch (err) {
      this.logError(err);
    }
  }

  /** Load save data from localStorage. */
  async loadData(): Promise<string | null> {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      this.logError(err);
      return null;
    }
  }

  /** No leaderboard API on Poki — this is a no-op. */
  async sendScore(_score: number): Promise<void> {
    // No-op — Poki has no score/leaderboard API.
  }

  /**
   * Show a commercial break (interstitial) via Poki.
   * Calls gameplayStop before the ad and gameplayStart after.
   */
  async showInterstitialAd(): Promise<void> {
    try {
      if (typeof PokiSDK !== "undefined") {
        this._triggerPause();
        await PokiSDK.commercialBreak();
        this._triggerResume();
      }
    } catch (err) {
      this.logError(err);
      // Make sure gameplay restarts even if the ad fails.
      this._triggerResume();
    }
  }

  /**
   * Show a rewarded break via Poki.
   * @returns true if the player earned the reward.
   */
  async showRewardedAd(_rewardId: string): Promise<boolean> {
    try {
      if (typeof PokiSDK !== "undefined") {
        this._triggerPause();
        const rewarded = await PokiSDK.rewardedBreak();
        this._triggerResume();
        return rewarded;
      }
    } catch (err) {
      this.logError(err);
      this._triggerResume();
    }
    return false;
  }

  /** Returns the browser language — Poki has no explicit locale API. */
  async getLanguage(): Promise<string> {
    try {
      return navigator.language ?? "en";
    } catch {
      return "en";
    }
  }

  /** Log an error with the platform prefix. */
  logError(err?: unknown): void {
    try {
      console.error("[PokiPlatform]", err);
    } catch { /* swallow */ }
  }

  /** Log a warning with the platform prefix. */
  logWarning(msg?: string): void {
    try {
      console.warn("[PokiPlatform]", msg);
    } catch { /* swallow */ }
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  private _triggerPause(): void {
    try {
      if (typeof PokiSDK !== "undefined" && this._gameplayActive) {
        PokiSDK.gameplayStop();
        this._gameplayActive = false;
      }
    } catch { /* swallow */ }
    this._pauseCallbacks.forEach((cb) => cb());
  }

  private _triggerResume(): void {
    try {
      if (typeof PokiSDK !== "undefined" && !this._gameplayActive) {
        PokiSDK.gameplayStart();
        this._gameplayActive = true;
      }
    } catch { /* swallow */ }
    this._resumeCallbacks.forEach((cb) => cb());
  }
}

export default PokiPlatform;
