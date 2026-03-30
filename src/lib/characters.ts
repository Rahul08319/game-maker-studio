export interface CharacterDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
  accentColor: string;
  sprite: string;
  style: string;
  stats: {
    attack: number;
    speed: number;
    defense: number;
  };
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: "spiderman",
    name: "Spider-Man",
    emoji: "🕷️",
    color: "#cc2222",
    accentColor: "#2244aa",
    sprite: "spiderman",
    style: "Balanced",
    stats: { attack: 7, speed: 8, defense: 6 },
  },
  {
    id: "venom",
    name: "Venom",
    emoji: "🖤",
    color: "#1a1a2e",
    accentColor: "#6b3fa0",
    sprite: "venom",
    style: "Power",
    stats: { attack: 9, speed: 5, defense: 8 },
  },
  {
    id: "goblin",
    name: "Green Goblin",
    emoji: "👺",
    color: "#2d8a2d",
    accentColor: "#9b59b6",
    sprite: "goblin",
    style: "Trickster",
    stats: { attack: 8, speed: 7, defense: 5 },
  },
  {
    id: "doc_ock",
    name: "Doc Ock",
    emoji: "🐙",
    color: "#556b2f",
    accentColor: "#c0c0c0",
    sprite: "doc_ock",
    style: "Reach",
    stats: { attack: 7, speed: 4, defense: 9 },
  },
];
