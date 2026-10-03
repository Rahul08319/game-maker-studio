import type { GamePlatform } from "./types";
import * as yt from "../youtubePlayables";

export class YouTubePlayablesPlatform implements GamePlatform {
  readonly name = "YouTube Playables";
  isReady = false;

  async init(): Promise<void> {
    this.isReady = true;
  }

  firstFrameReady(): void {
    yt.firstFrameReady();
  }

  gameReady(): void {
    yt.gameReady();
  }

  isAudioEnabled(): boolean {
    return yt.isAudioEnabled();
  }

  onAudioEnabledChange(cb: (enabled: boolean) => void): () => void {
    return yt.onAudioEnabledChange(cb);
  }

  onPause(cb: () => void): () => void {
    return yt.onPause(cb);
  }

  onResume(cb: () => void): () => void {
    return yt.onResume(cb);
  }

  async saveData(data: string): Promise<void> {
    await yt.saveData(data);
  }

  async loadData(): Promise<string | null> {
    return await yt.loadData();
  }

  async sendScore(score: number): Promise<void> {
    await yt.sendScore(score);
  }

  async showInterstitialAd(): Promise<void> {
    await yt.requestInterstitialAd();
  }

  async showRewardedAd(rewardId: string): Promise<boolean> {
    return await yt.requestRewardedAd(rewardId as yt.RewardId);
  }

  async getLanguage(): Promise<string> {
    return await yt.getLanguage();
  }

  logError(err?: unknown): void {
    yt.logError(err);
  }

  logWarning(msg?: string): void {
    yt.logWarning(msg);
  }
}

export default YouTubePlayablesPlatform;
