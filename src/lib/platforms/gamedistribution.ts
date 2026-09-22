import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

declare const gdsdk: {
  showAd(type?: string): Promise<void>;
  AdType?: {
    Interstitial: string;
    Rewarded: string;
  };
};

export class GameDistributionPlatform extends BasePlatform implements GamePlatform {
  override readonly name = "GameDistribution / MSN Games";

  override async init(): Promise<void> {
    this.isReady = true;
  }

  override async showInterstitialAd(): Promise<void> {
    try {
      if (typeof gdsdk !== "undefined" && typeof gdsdk.showAd === "function") {
        await gdsdk.showAd(gdsdk.AdType?.Interstitial ?? "interstitial");
      }
    } catch (err) {
      this.logError(err);
    }
  }

  override async showRewardedAd(_rewardId: string): Promise<boolean> {
    try {
      if (typeof gdsdk !== "undefined" && typeof gdsdk.showAd === "function") {
        await gdsdk.showAd(gdsdk.AdType?.Rewarded ?? "rewarded");
        return true;
      }
    } catch (err) {
      this.logError(err);
    }
    return false;
  }
}

export default GameDistributionPlatform;
