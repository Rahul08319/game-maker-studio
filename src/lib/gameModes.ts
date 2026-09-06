export type GameMode = "classic" | "arcade" | "versus" | "tutorial" | "trials" | "daily";

export interface MatchRecord {
  opponent: string;
  result: "win" | "loss";
  score: number;
  mode: GameMode;
  playedAt: string;
}

export interface PlayerSettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  haptics: boolean;
  touchLayout: "classic" | "compact";
  musicVolume: number;
  effectsVolume: number;
}

export const DEFAULT_SETTINGS: PlayerSettings = {
  reducedMotion: false, highContrast: false, largeText: false, haptics: true,
  touchLayout: "classic", musicVolume: 70, effectsVolume: 80,
};

export const DAILY_CHALLENGE = {
  id: new Date().toISOString().slice(0, 10), playerId: "spiderman", enemyId: "electro",
  stageId: "subway", label: "Lightning in the Subway",
  rule: "Defeat Electro on hard difficulty before the clock expires.",
};

export const STORY_ENDINGS: Record<string, string> = {
  spiderman: "New York is safe tonight. Your web-slinging legend grows.",
  venom: "The symbiote has claimed the arena — but the city still fights back.",
  goblin: "The Goblin's laughter fades across the skyline. For now.",
  doc_ock: "The tentacles fall silent. Science has met its match.",
  electro: "The city's lights return as the storm finally breaks.",
  sandman: "The sand settles. A second chance waits beyond the arena.",
  black_cat: "Black Cat vanishes into the night with the win in hand.",
};

export const COMBO_TRIALS = [
  { id: "first-hit", name: "First Strike", target: 1, reward: "Web Rookie skin" },
  { id: "triple-hit", name: "Triple Threat", target: 3, reward: "Nightfall stage variant" },
  { id: "six-hit", name: "Arena Master", target: 6, reward: "Champion skin" },
] as const;
