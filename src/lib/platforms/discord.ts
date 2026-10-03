import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";

export class DiscordActivitiesPlatform extends BasePlatform implements GamePlatform {
  override readonly name = "Discord Activities";

  override async init(): Promise<void> {
    try {
      // Check for Discord environment in window
      if (typeof window !== "undefined") {
        window.addEventListener("message", (event) => {
          if (event.data?.type === "DISCORD_PIP_MODE_UPDATE") {
            if (event.data.is_pip) {
              this._pauseCallbacks.forEach((cb) => cb());
            } else {
              this._resumeCallbacks.forEach((cb) => cb());
            }
          }
        });
      }
    } catch (err) {
      this.logError(err);
    }
    this.isReady = true;
  }
}

export default DiscordActivitiesPlatform;
