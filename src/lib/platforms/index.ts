import type { GamePlatform } from "./types";
import { BasePlatform } from "./base";
import { YouTubePlayablesPlatform } from "./youtube";
import { FacebookPlatform } from "./facebook";
import { PokiPlatform } from "./poki";
import { CrazyGamesPlatform } from "./crazygames";
import { YandexPlatform } from "./yandex";
import { GameDistributionPlatform } from "./gamedistribution";
import { DiscordActivitiesPlatform } from "./discord";
import { JioGamesPlatform } from "./jiogames";
import { Y8Platform } from "./y8";
import { LaggedPlatform } from "./lagged";
import { PwaPlatform } from "./pwa";
import { HuaweiQuickGamePlatform } from "./huawei";
import { XiaomiQuickGamePlatform } from "./xiaomi";
import { RedditPlatform } from "./reddit";

export * from "./types";
export {
  BasePlatform,
  YouTubePlayablesPlatform,
  FacebookPlatform,
  PokiPlatform,
  CrazyGamesPlatform,
  YandexPlatform,
  GameDistributionPlatform,
  DiscordActivitiesPlatform,
  JioGamesPlatform,
  Y8Platform,
  LaggedPlatform,
  PwaPlatform,
  HuaweiQuickGamePlatform,
  XiaomiQuickGamePlatform,
  RedditPlatform,
};

export const PLATFORM_NAMES = [
  "youtube",
  "facebook",
  "poki",
  "crazygames",
  "yandex",
  "gamedistribution",
  "msn",
  "discord",
  "jiogames",
  "y8",
  "lagged",
  "pwa",
  "huawei",
  "xiaomi",
  "reddit",
  "base",
] as const;

export type PlatformId = typeof PLATFORM_NAMES[number];

let currentPlatform: GamePlatform | null = null;

export function detectPlatformId(): PlatformId {
  if (typeof window === "undefined") return "base";

  // Check URL parameters for explicit platform override (e.g., ?platform=facebook)
  const urlParams = new URLSearchParams(window.location.search);
  const platformParam = urlParams.get("platform")?.toLowerCase();
  if (platformParam && (PLATFORM_NAMES as readonly string[]).includes(platformParam)) {
    return platformParam as PlatformId;
  }

  // Detect runtime environments
  if (typeof (window as any).ytgame !== "undefined" && (window as any).ytgame?.IN_PLAYABLES_ENV) {
    return "youtube";
  }
  if (typeof (window as any).FBInstant !== "undefined") {
    return "facebook";
  }
  if (typeof (window as any).PokiSDK !== "undefined") {
    return "poki";
  }
  if (typeof (window as any).CrazyGames !== "undefined") {
    return "crazygames";
  }
  if (typeof (window as any).YaGames !== "undefined") {
    return "yandex";
  }
  if (typeof (window as any).gdsdk !== "undefined") {
    return "gamedistribution";
  }
  if (urlParams.has("frame_id") || urlParams.has("instance_id")) {
    return "discord";
  }
  if (typeof (window as any).JioSDK !== "undefined") {
    return "jiogames";
  }
  if (typeof (window as any).Y8 !== "undefined") {
    return "y8";
  }
  if (typeof (window as any).LaggedAPI !== "undefined") {
    return "lagged";
  }
  if (typeof (window as any).hbs !== "undefined") {
    return "huawei";
  }
  if (typeof (window as any).qg !== "undefined") {
    return "xiaomi";
  }
  if (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as any).standalone) {
    return "pwa";
  }

  return "base";
}

export function createPlatform(id: PlatformId): GamePlatform {
  switch (id) {
    case "youtube":
      return new YouTubePlayablesPlatform();
    case "facebook":
      return new FacebookPlatform();
    case "poki":
      return new PokiPlatform();
    case "crazygames":
      return new CrazyGamesPlatform();
    case "yandex":
      return new YandexPlatform();
    case "gamedistribution":
    case "msn":
      return new GameDistributionPlatform();
    case "discord":
      return new DiscordActivitiesPlatform();
    case "jiogames":
      return new JioGamesPlatform();
    case "y8":
      return new Y8Platform();
    case "lagged":
      return new LaggedPlatform();
    case "huawei":
      return new HuaweiQuickGamePlatform();
    case "xiaomi":
      return new XiaomiQuickGamePlatform();
    case "reddit":
      return new RedditPlatform();
    case "pwa":
      return new PwaPlatform();
    case "base":
    default:
      return new BasePlatform();
  }
}

export function getPlatform(): GamePlatform {
  if (!currentPlatform) {
    const id = detectPlatformId();
    currentPlatform = createPlatform(id);
    currentPlatform.init().catch((err) => {
      currentPlatform?.logError?.(err);
    });
  }
  return currentPlatform;
}
