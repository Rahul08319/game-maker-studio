import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

declare const YaGames: {
  init(): Promise<{
    adv: {
      showFullscreenAdv(options: {
        callbacks?: {
          onClose?: (wasShown: boolean) => void;
          onError?: (error: unknown) => void;
        };
      }): void;
      showRewardedVideo(options: {
        callbacks?: {
          onOpen?: () => void;
          onRewarded?: () => void;
          onClose?: () => void;
          onError?: (error: unknown) => void;
        };
      }): void;
    };
    getStorage(): Promise<{
      setItem(key: string, value: string): Promise<void>;
      getItem(key: string): Promise<string | null>;
    }>;
    getLeaderboards(): Promise<{
      setLeaderboardScore(name: string, score: number): Promise<void>;
    }>;
    features?: {
      GameplayAPI?: {
        start(): void;
        stop(): void;
      };
    };
    environment: {
      i18n: {
        lang: string;
      };
    };
  }>;
};

const STORAGE_KEY = "spiderman_game_save";

export class YandexPlatform extends BasePlatform implements GamePlatform {
  override readonly name = "Yandex Games";
  private ysdk: any = null;
  private storage: any = null;

  override async init(): Promise<void> {
    try {
      if (typeof YaGames !== "undefined") {
        this.ysdk = await YaGames.init();
        try {
          this.storage = await this.ysdk.getStorage();
        } catch {}
      }
    } catch (err) {
      this.logError(err);
    }
    this.isReady = true;
  }

  override gameReady(): void {
    try {
      this.ysdk?.features?.GameplayAPI?.start();
    } catch {}
  }

  override async saveData(data: string): Promise<void> {
    try {
      if (this.storage) {
        await this.storage.setItem(STORAGE_KEY, data);
        return;
      }
    } catch (err) {
      this.logError(err);
    }
    await super.saveData(data);
  }

  override async loadData(): Promise<string | null> {
    try {
      if (this.storage) {
        const val = await this.storage.getItem(STORAGE_KEY);
        if (val) return val;
      }
    } catch (err) {
      this.logError(err);
    }
    return await super.loadData();
  }

  override async sendScore(score: number): Promise<void> {
    try {
      if (this.ysdk) {
        const lb = await this.ysdk.getLeaderboards();
        await lb.setLeaderboardScore("leaderboard", score);
      }
    } catch (err) {
      this.logError(err);
    }
  }

  override async showInterstitialAd(): Promise<void> {
    if (!this.ysdk) return;
    return new Promise((resolve) => {
      try {
        this.ysdk.adv.showFullscreenAdv({
          callbacks: {
            onClose: () => resolve(),
            onError: () => resolve(),
          },
        });
      } catch {
        resolve();
      }
    });
  }

  override async showRewardedAd(_rewardId: string): Promise<boolean> {
    if (!this.ysdk) return false;
    return new Promise((resolve) => {
      let rewarded = false;
      try {
        this.ysdk.adv.showRewardedVideo({
          callbacks: {
            onRewarded: () => {
              rewarded = true;
            },
            onClose: () => resolve(rewarded),
            onError: () => resolve(false),
          },
        });
      } catch {
        resolve(false);
      }
    });
  }

  override async getLanguage(): Promise<string> {
    try {
      if (this.ysdk?.environment?.i18n?.lang) {
        return this.ysdk.environment.i18n.lang;
      }
    } catch {}
    return super.getLanguage();
  }
}

export default YandexPlatform;
