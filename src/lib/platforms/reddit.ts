import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

export class RedditPlatform extends BasePlatform implements GamePlatform {
  override readonly name = "Reddit Games";

  override async init(): Promise<void> {
    try {
      if (typeof window !== "undefined") {
        // Send initial ready message to Reddit Devvit host
        window.parent?.postMessage({ type: "devvit-message", data: { action: "INIT" } }, "*");

        // Listen for Reddit host messages
        window.addEventListener("message", (ev) => {
          if (ev.data?.type === "devvit-pause") {
            this._pauseCallbacks.forEach((cb) => cb());
          } else if (ev.data?.type === "devvit-resume") {
            this._resumeCallbacks.forEach((cb) => cb());
          }
        });
      }
    } catch (err) {
      this.logError(err);
    }
    this.isReady = true;
  }

  override async sendScore(score: number): Promise<void> {
    try {
      if (typeof window !== "undefined") {
        window.parent?.postMessage({ type: "devvit-message", data: { action: "SCORE", score } }, "*");
      }
    } catch {}
    await super.sendScore(score);
  }
}

export default RedditPlatform;
