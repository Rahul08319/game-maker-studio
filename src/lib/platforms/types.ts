/**
 * Unified GamePlatform interface for multi-platform distribution.
 * Implemented across:
 * - YouTube Playables
 * - Facebook Instant Games
 * - Poki
 * - CrazyGames
 * - Yandex Games
 * - GameDistribution
 * - Discord Activities
 * - JioGames
 * - Y8 Games
 * - Lagged
 * - Microsoft Store (PWA)
 * - Huawei Quick Games
 * - Xiaomi Quick Games
 * - MSN Games
 * - Reddit Games
 */
export interface GamePlatform {
  name: string;
  isReady: boolean;
  init(): Promise<void>;
  firstFrameReady(): void;
  gameReady(): void;
  isAudioEnabled(): boolean;
  onAudioEnabledChange(cb: (enabled: boolean) => void): () => void;
  onPause(cb: () => void): () => void;
  onResume(cb: () => void): () => void;
  saveData(data: string): Promise<void>;
  loadData(): Promise<string | null>;
  sendScore(score: number): Promise<void>;
  showInterstitialAd(): Promise<void>;
  showRewardedAd(rewardId: string): Promise<boolean>;
  getLanguage(): Promise<string>;
  logError(err?: unknown): void;
  logWarning(msg?: string): void;
}
