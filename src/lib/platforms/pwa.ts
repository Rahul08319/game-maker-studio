import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

export class PwaPlatform extends BasePlatform implements GamePlatform {
  override readonly name = "Microsoft Store / PWA";

  override async init(): Promise<void> {
    try {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        // Register Service Worker if available
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    } catch (err) {
      this.logError(err);
    }
    this.isReady = true;
  }

  override async sendScore(score: number): Promise<void> {
    try {
      if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
        // Update App Badge on Windows / Android / macOS
        (navigator as any).setAppBadge(score).catch(() => {});
      }
    } catch {}
    await super.sendScore(score);
  }
}

export default PwaPlatform;
