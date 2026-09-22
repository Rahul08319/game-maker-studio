import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

declare const LaggedAPI: {
  init?(devId: string, gameId: string): void;
  Scores?: {
    save(scoreData: { score: number; board: string }): void;
  };
};

export class LaggedPlatform extends BasePlatform implements GamePlatform {
  override readonly name = "Lagged";

  override async init(): Promise<void> {
    try {
      if (typeof LaggedAPI !== "undefined" && typeof LaggedAPI.init === "function") {
        LaggedAPI.init("dev_spiderman", "lagged_spiderman_arena");
      }
    } catch (err) {
      this.logError(err);
    }
    this.isReady = true;
  }

  override async sendScore(score: number): Promise<void> {
    try {
      if (typeof LaggedAPI !== "undefined" && LaggedAPI.Scores) {
        LaggedAPI.Scores.save({ score, board: "high_scores" });
      }
    } catch (err) {
      this.logError(err);
    }
    await super.sendScore(score);
  }
}

export default LaggedPlatform;
