import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

declare const qg: {
  getSystemInfoSync?(): { language: string };
  createInterstitialAd?(options: { adUnitId: string }): {
    show(): Promise<void>;
  };
  createRewardedVideoAd?(options: { adUnitId: string }): {
    show(): Promise<void>;
    onClose(cb: (res: { isEnded: boolean }) => void): void;
  };
};

export class XiaomiQuickGamePlatform extends BasePlatform implements GamePlatform {
  override readonly name = "Xiaomi Quick Games";

  override async init(): Promise<void> {
    this.isReady = true;
  }

  override async showInterstitialAd(): Promise<void> {
    try {
      if (typeof qg !== "undefined" && typeof qg.createInterstitialAd === "function") {
        const ad = qg.createInterstitialAd({ adUnitId: "test_interstitial" });
        await ad.show();
      }
    } catch (err) {
      this.logError(err);
    }
  }

  override async showRewardedAd(_rewardId: string): Promise<boolean> {
    if (typeof qg !== "undefined" && typeof qg.createRewardedVideoAd === "function") {
      return new Promise((resolve) => {
        try {
          const ad = qg.createRewardedVideoAd({ adUnitId: "test_rewarded" });
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
      if (typeof qg !== "undefined" && typeof qg.getSystemInfoSync === "function") {
        return qg.getSystemInfoSync().language;
      }
    } catch {}
    return super.getLanguage();
  }
}

export default XiaomiQuickGamePlatform;
