export const PLATFORM_IDS = [
  "youtube", "facebook", "poki", "crazygames", "yandex", "gamedistribution", "discord",
  "jiogames", "y8", "lagged", "microsoft-store", "huawei-xiaomi", "msn-reddit",
] as const;

export type PlatformId = typeof PLATFORM_IDS[number];

interface PlatformDefinition {
  name: string;
  sdk: "youtube-playables" | "none";
  packaging: string;
}

const PLATFORMS: Record<PlatformId, PlatformDefinition> = {
  youtube: { name: "YouTube Playables", sdk: "youtube-playables", packaging: "Web playable" },
  facebook: { name: "Facebook Instant Games", sdk: "none", packaging: "HTML5 game" },
  poki: { name: "Poki", sdk: "none", packaging: "HTML5 game" },
  crazygames: { name: "CrazyGames", sdk: "none", packaging: "HTML5 game" },
  yandex: { name: "Yandex Games", sdk: "none", packaging: "HTML5 game" },
  gamedistribution: { name: "GameDistribution", sdk: "none", packaging: "HTML5 game" },
  discord: { name: "Discord Activities", sdk: "none", packaging: "Embedded web game" },
  jiogames: { name: "JioGames", sdk: "none", packaging: "HTML5 game" },
  y8: { name: "Y8", sdk: "none", packaging: "HTML5 game" },
  lagged: { name: "Lagged", sdk: "none", packaging: "HTML5 game" },
  "microsoft-store": { name: "Microsoft Store (PWA)", sdk: "none", packaging: "Progressive web app" },
  "huawei-xiaomi": { name: "Huawei & Xiaomi Quick Games", sdk: "none", packaging: "Web game package" },
  "msn-reddit": { name: "MSN & Reddit Games", sdk: "none", packaging: "Embedded web game" },
};

function requestedPlatform(): PlatformId {
  const candidate = import.meta.env.VITE_GAME_PLATFORM?.toLowerCase();
  return PLATFORM_IDS.includes(candidate as PlatformId) ? candidate as PlatformId : "youtube";
}

export const activePlatform = requestedPlatform();
export const activePlatformDefinition = PLATFORMS[activePlatform];

type HostEventName = "ready" | "state" | "score";

function emit(name: HostEventName, detail: Record<string, unknown> = {}) {
  window.dispatchEvent(new CustomEvent(`spider-arena:${name}`, {
    detail: { platform: activePlatform, ...detail },
  }));
}

/**
 * SDK-free integration contract for stores other than YouTube.
 * A store wrapper can subscribe to these DOM events without changing game code.
 */
export function initializePlatformTarget() {
  document.documentElement.dataset.gamePlatform = activePlatform;
  document.title = `Spider-Man Fighting Arena — ${activePlatformDefinition.name}`;
  if (activePlatform === "microsoft-store" && "serviceWorker" in navigator) {
    void navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
  }
  emit("ready", { packaging: activePlatformDefinition.packaging });
}

export function reportPlatformState(state: string) {
  emit("state", { state });
}

export function reportPlatformScore(score: number) {
  if (Number.isFinite(score) && score > 0) emit("score", { score: Math.trunc(score) });
}