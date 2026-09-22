import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

declare const Y8: {
  init?(config: { gameId: string }): void;
  submitScore?(data: { table: string; points: number }): Promise<void>;
  showAd?(type: string): void;
};

export class Y8Platform extends BasePlatform implements GamePlatform {
  override readonly name = "Y8 Games";

  override async init(): Promise<void> {
    try {
      if (typeof Y8 !== "undefined" && typeof Y8.init === "function") {
        Y8.init({ gameId: "spiderman_arena" });
      }
    } catch (err) {
      this.logError(err);
    }
    this.isReady = true;
  }

  override async sendScore(score: number): Promise<void> {
    try {
      if (typeof Y8 !== "undefined" && typeof Y8.submitScore === "function") {
        await Y8.submitScore({ table: "HighScores", points: score });
      }
    } catch (err) {
      this.logError(err);
    }
    await super.sendScore(score);
  }

  override async showInterstitialAd(): Promise<void> {
    try {
      if (typeof Y8 !== "undefined" && typeof Y8.showAd === "function") {
        Y8.showAd("interstitial");
      }
    } catch (err) {
      this.logError(err);
    }
  }
}

export default Y8Platform;
