import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

declare const JioSDK: {
  gameReady?(): void;
  cacheAd?(type: string): void;
  showAd?(type: string, cb?: (status: boolean) => void): void;
};

export class JioGamesPlatform extends BasePlatform implements GamePlatform {
  override readonly name = "JioGames";

  override async init(): Promise<void> {
    this.isReady = true;
  }

  override gameReady(): void {
    try {
      if (typeof JioSDK !== "undefined" && typeof JioSDK.gameReady === "function") {
        JioSDK.gameReady();
      }
    } catch {}
  }

  override async showInterstitialAd(): Promise<void> {
    try {
      if (typeof JioSDK !== "undefined" && typeof JioSDK.showAd === "function") {
        JioSDK.showAd("interstitial");
      }
    } catch (err) {
      this.logError(err);
    }
  }

  override async showRewardedAd(_rewardId: string): Promise<boolean> {
    if (typeof JioSDK !== "undefined" && typeof JioSDK.showAd === "function") {
      return new Promise((resolve) => {
        try {
          JioSDK.showAd!("rewarded", (status) => resolve(!!status));
        } catch {
          resolve(false);
        }
      });
    }
    return false;
  }

  override async getLanguage(): Promise<string> {
    try {
      return navigator.language || "hi-IN";
    } catch {
      return "hi-IN";
    }
  }
}

export default JioGamesPlatform;
