export interface SpecialAttackDef {
  name: string;
  damage: number;
  reach: number;
  duration: number;
  description: string;
  knockback: number;
  stunDuration: number;
  multiHit?: number;
}

export const SPECIAL_ATTACKS: Record<string, SpecialAttackDef> = {
  spiderman: {
    name: "Web Barrage",
    damage: 22,
    reach: 140,
    duration: 25,
    description: "Rapid web burst that traps the enemy",
    knockback: 8,
    stunDuration: 20,
  },
  venom: {
    name: "Symbiote Slam",
    damage: 28,
    reach: 90,
    duration: 30,
    description: "Massive tendril slam with devastating power",
    knockback: 12,
    stunDuration: 18,
  },
  goblin: {
    name: "Pumpkin Bomb",
    damage: 24,
    reach: 160,
    duration: 28,
    description: "Throws an explosive pumpkin bomb",
    knockback: 10,
    stunDuration: 15,
  },
  doc_ock: {
    name: "Tentacle Fury",
    damage: 18,
    reach: 130,
    duration: 30,
    description: "Multi-hit tentacle whirlwind",
    knockback: 6,
    stunDuration: 12,
    multiHit: 3,
  },
  electro: {
    name: "Lightning Chain",
    damage: 26,
    reach: 180,
    duration: 25,
    description: "Chain lightning that arcs across the screen",
    knockback: 9,
    stunDuration: 22,
  },
  sandman: {
    name: "Ground Slam",
    damage: 30,
    reach: 200,
    duration: 35,
    description: "Turns arms to hammers and slams the ground — hits full screen",
    knockback: 14,
    stunDuration: 25,
  },
  black_cat: {
    name: "Whip Grapple",
    damage: 20,
    reach: 150,
    duration: 22,
    description: "Grapple whip that pulls the enemy close and stuns",
    knockback: -8,
    stunDuration: 28,
    multiHit: 2,
  },
};

export const COMBO_LIST = [
  { keys: "J → J → J", name: "Triple Jab", description: "Three quick punches" },
  { keys: "J → K", name: "Punch-Kick", description: "Punch into a kick" },
  { keys: "K → K", name: "Double Kick", description: "Two consecutive kicks" },
  { keys: "J → J → K", name: "Rush Combo", description: "Two punches into a kick" },
  { keys: "L → J", name: "Web Punch", description: "Web shot into a punch" },
  { keys: "J → K → L", name: "Full Chain", description: "Punch, kick, web shot" },
  { keys: "↑ → K", name: "Air Kick", description: "Jump kick from above" },
  { keys: "↑ → J", name: "Air Punch", description: "Aerial punch attack" },
  { keys: "SPACE", name: "Special Attack", description: "Unique per character" },
];
