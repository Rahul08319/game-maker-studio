/**
 * @file crazygames.ts
 * @description CrazyGames platform adapter for Spider-Man Fighting Game.
 * Requires the CrazyGames SDK v3 loaded via:
 *   <script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
 *
 * Implements the GamePlatform interface — see base.ts for full interface docs.
 */

// ── CrazyGames global type declarations ─────────────────────────────────────
type CrazyAdType = "midgame" | "rewarded";

interface CrazyAdCallbacks {
  adFinished?: () => void;
  adError?: (err: unknown) => void;
  adStarted?: () => void;
}

declare const CrazyGames: {
  SDK: {
    init(): Promise<void>;
    game: {
      sdkGameLoadingStop(): void;
      gameplayStart(): void;
      gameplayStop(): void;
    };
    ad: {
      requestAd(type: CrazyAdType, callbacks: CrazyAdCallbacks): void;
    };
    user: {
      getLanguage(): Promise<string>;
    };
  };
};

const STORAGE_KEY = "spiderman_game_save";

export class CrazyGamesPlatform {
  readonly name = "CrazyGames";
  isReady = false;

  private _pauseCallbacks: Array<() => void> = [];
  private _resumeCallbacks: Array<() => void> = [];
  private _audioEnabled = true;
  private _audioCallbacks: Array<(enabled: boolean) => void> = [];

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

  /** Initialise the CrazyGames SDK. */
  async init(): Promise<void> {
    try {
      if (typeof CrazyGames === "undefined") {
        throw new Error("CrazyGames SDK not loaded.");
      }
      await window.CrazyGames.SDK.init();
      this.isReady = true;
    } catch (err) {
      this.logError(err);
    }
  }

  /**
   * firstFrameReady is a no-op on CrazyGames — the SDK tracks loading
   * automatically until sdkGameLoadingStop() is called.
   */
  firstFrameReady(): void {
    // No-op — CrazyGames does not expose an intermediate loading-progress API.
  }

  /** Notify CrazyGames that the game has finished loading. */
  gameReady(): void {
    try {
      if (typeof CrazyGames !== "undefined") {
        window.CrazyGames.SDK.game.sdkGameLoadingStop();
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

  /** Persist save data to localStorage (CrazyGames has no cloud save API). */
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

  /** No leaderboard API on CrazyGames — this is a no-op. */
  async sendScore(_score: number): Promise<void> {
    // No-op — CrazyGames has no score/leaderboard API.
  }

  /**
   * Request a midgame (interstitial) ad.
   * Calls gameplayStop before and gameplayStart after per CrazyGames guidelines.
   */
  async showInterstitialAd(): Promise<void> {
    return new Promise<void>((resolve) => {
      try {
        if (typeof CrazyGames === "undefined") {
          resolve();
          return;
        }
        this._triggerPause();
        window.CrazyGames.SDK.ad.requestAd("midgame", {
          adStarted: () => { /* ad is showing */ },
          adFinished: () => {
            this._triggerResume();
            resolve();
          },
          adError: (err) => {
            this.logError(err);
            this._triggerResume();
            resolve();
          },
        });
      } catch (err) {
        this.logError(err);
        this._triggerResume();
        resolve();
      }
    });
  }

  /**
   * Request a rewarded ad.
   * @returns true when the rewarded ad completes successfully.
   */
  async showRewardedAd(_rewardId: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      try {
        if (typeof CrazyGames === "undefined") {
          resolve(false);
          return;
        }
        this._triggerPause();
        window.CrazyGames.SDK.ad.requestAd("rewarded", {
          adFinished: () => {
            this._triggerResume();
            resolve(true);
          },
          adError: (err) => {
            this.logError(err);
            this._triggerResume();
            resolve(false);
          },
        });
      } catch (err) {
        this.logError(err);
        this._triggerResume();
        resolve(false);
      }
    });
  }

  /** Resolve the user's language via the CrazyGames SDK. */
  async getLanguage(): Promise<string> {
    try {
      if (typeof CrazyGames !== "undefined") {
        return await window.CrazyGames.SDK.user.getLanguage();
      }
    } catch (err) {
      this.logError(err);
    }
    return navigator.language ?? "en";
  }

  /** Log an error with the platform prefix. */
  logError(err?: unknown): void {
    try {
      console.error("[CrazyGamesPlatform]", err);
    } catch { /* swallow */ }
  }

  /** Log a warning with the platform prefix. */
  logWarning(msg?: string): void {
    try {
      console.warn("[CrazyGamesPlatform]", msg);
    } catch { /* swallow */ }
  }

  // ── Internal helpers ────────────────────────────────────────────────────────

  private _triggerPause(): void {
    try {
      if (typeof CrazyGames !== "undefined") {
        window.CrazyGames.SDK.game.gameplayStop();
      }
    } catch { /* swallow */ }
    this._pauseCallbacks.forEach((cb) => cb());
  }

  private _triggerResume(): void {
    try {
      if (typeof CrazyGames !== "undefined") {
        window.CrazyGames.SDK.game.gameplayStart();
      }
    } catch { /* swallow */ }
    this._resumeCallbacks.forEach((cb) => cb());
  }
}

export default CrazyGamesPlatform;
