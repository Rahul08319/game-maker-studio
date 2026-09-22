import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

declare const hbs: {
  getSystemInfoSync?(): { language: string };
  setStorage?(options: { key: string; data: string }): void;
  getStorage?(options: { key: string; success: (res: { data: string }) => void; fail: () => void }): void;
  createInterstitialAd?(options: { adUnitId: string }): {
    show(): Promise<void>;
  };
  createRewardedVideoAd?(options: { adUnitId: string }): {
    show(): Promise<void>;
    onClose(cb: (res: { isEnded: boolean }) => void): void;
  };
};

export class HuaweiQuickGamePlatform extends BasePlatform implements GamePlatform {
  override readonly name = "Huawei Quick Games";

  override async init(): Promise<void> {
    this.isReady = true;
  }

  override async showInterstitialAd(): Promise<void> {
    try {
      if (typeof hbs !== "undefined" && typeof hbs.createInterstitialAd === "function") {
        const ad = hbs.createInterstitialAd({ adUnitId: "test_interstitial" });
        await ad.show();
      }
    } catch (err) {
      this.logError(err);
    }
  }

  override async showRewardedAd(_rewardId: string): Promise<boolean> {
    if (typeof hbs !== "undefined" && typeof hbs.createRewardedVideoAd === "function") {
      return new Promise((resolve) => {
        try {
          const ad = hbs.createRewardedVideoAd({ adUnitId: "test_rewarded" });
          ad.onClose((res) => resolve(!!res?.isEnded));
          ad.show().catch(() => resolve(false));
        } catch {
          resolve(false);
        }
      });
    }
    return false;
  }

  override async getLanguage(): Promise<string> {
    try {
      if (typeof hbs !== "undefined" && typeof hbs.getSystemInfoSync === "function") {
        return hbs.getSystemInfoSync().language;
      }
    } catch {}
    return super.getLanguage();
  }
}

export default HuaweiQuickGamePlatform;
