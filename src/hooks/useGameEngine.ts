import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterDef } from "@/lib/characters";
import { SPECIAL_ATTACKS } from "@/lib/specialAttacks";

export interface Fighter {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  velocityX: number;
  velocityY: number;
  isJumping: boolean;
  isAttacking: boolean;
  attackType: "none" | "punch" | "kick" | "web" | "special";
  attackFrame: number;
  facing: "left" | "right";
  isBlocking: boolean;
  combo: number;
  stunTimer: number;
  color: string;
  accentColor: string;
  sprite: string;
  stats: { attack: number; speed: number; defense: number };
}

export interface GameState {
  player: Fighter;
  enemy: Fighter;
  round: number;
  maxRounds: number;
  playerRoundWins: number;
  enemyRoundWins: number;
  timer: number;
  gameStatus: "menu" | "select" | "playing" | "roundEnd" | "win" | "lose" | "training";
  particles: Particle[];
  comboText: string;
  shakeIntensity: number;
  roundMessage: string;
  isTraining: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: "hit" | "web" | "spark";
}

export interface SoundCallbacks {
  onAttackHit?: (type: string) => void;
  onBlock?: () => void;
  onKO?: () => void;
  onRoundWin?: () => void;
}

const GROUND_Y = 340;
const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const ATTACK_DURATION = 15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

const createFighter = (charDef: CharacterDef, x: number, facing: "left" | "right"): Fighter => ({
  name: charDef.name,
  x,
  y: GROUND_Y,
  width: 50,
  height: 80,
  health: 100,
  maxHealth: 100,
  velocityX: 0,
  velocityY: 0,
  isJumping: false,
  isAttacking: false,
  attackType: "none",
  attackFrame: 0,
  facing,
  isBlocking: false,
  combo: 0,
  stunTimer: 0,
  color: charDef.color,
  accentColor: charDef.accentColor,
  sprite: charDef.sprite,
  stats: charDef.stats,
});

const createParticles = (x: number, y: number, count: number, color: string, type: "hit" | "web" | "spark"): Particle[] =>
  Array.from({ length: count }, () => ({
    x, y,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8 - 2,
    life: 20 + Math.random() * 20,
    maxLife: 30,
    color,
    size: type === "hit" ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
    type,
  }));

const checkAttackHit = (attacker: Fighter, defender: Fighter): boolean => {
  let reach = attacker.attackType === "web" ? 120 : 70;
  if (attacker.attackType === "special") {
    const special = SPECIAL_ATTACKS[attacker.sprite];
    if (special) reach = special.reach;
  }
  const attackX = attacker.facing === "right" ? attacker.x + attacker.width : attacker.x - reach;
  return (
    attackX < defender.x + defender.width &&
    attackX + reach > defender.x &&
    attacker.y < defender.y + defender.height &&
    attacker.y + attacker.height > defender.y
  );
};

const getDamage = (type: string, attackStat: number, sprite?: string): number => {
  const mult = 0.7 + attackStat * 0.06;
  switch (type) {
    case "punch": return Math.round(8 * mult);
    case "kick": return Math.round(12 * mult);
    case "web": return Math.round(6 * mult);
    case "special": {
      const special = sprite ? SPECIAL_ATTACKS[sprite] : null;
      return Math.round((special?.damage ?? 20) * mult);
    }
    default: return 0;
  }
};

const updateEnemyAI = (enemy: Fighter, player: Fighter): Fighter => {
  const updated = { ...enemy };
  const dist = Math.abs(player.x - enemy.x);
  const moveSpeed = 2.5 + updated.stats.speed * 0.25;

  updated.facing = player.x < enemy.x ? "left" : "right";
  if (updated.stunTimer > 0) { updated.stunTimer--; return updated; }

  if (dist > 100) {
    updated.velocityX = updated.facing === "right" ? moveSpeed * 0.6 : -moveSpeed * 0.6;
  } else if (dist < 60) {
    updated.velocityX = updated.facing === "right" ? -moveSpeed * 0.3 : moveSpeed * 0.3;
  } else {
    updated.velocityX = 0;
  }

  if (dist < 120 && !updated.isAttacking && Math.random() < 0.04) {
    const attacks: Array<"punch" | "kick" | "web"> = ["punch", "kick", "web"];
    updated.isAttacking = true;
    updated.attackType = attacks[Math.floor(Math.random() * attacks.length)];
    updated.attackFrame = ATTACK_DURATION;
  }

  if (!updated.isJumping && Math.random() < 0.01) {
    updated.velocityY = JUMP_FORCE;
    updated.isJumping = true;
  }

  updated.isBlocking = dist < 100 && Math.random() < (0.01 + updated.stats.defense * 0.003);
  return updated;
};

const updateFighter = (fighter: Fighter): Fighter => {
  const updated = { ...fighter };
  updated.velocityY += GRAVITY;
  updated.y += updated.velocityY;
  updated.x += updated.velocityX;

  if (updated.y >= GROUND_Y) {
    updated.y = GROUND_Y;
    updated.velocityY = 0;
    updated.isJumping = false;
  }

  updated.x = Math.max(0, Math.min(CANVAS_WIDTH - updated.width, updated.x));

  if (updated.isAttacking) {
    updated.attackFrame--;
    if (updated.attackFrame <= 0) {
      updated.isAttacking = false;
      updated.attackType = "none";
    }
  }

  updated.velocityX *= 0.85;
  if (updated.stunTimer > 0) updated.stunTimer--;
  return updated;
};

export function useGameEngine(soundCallbacks?: SoundCallbacks) {
  const [playerChar, setPlayerChar] = useState<CharacterDef | null>(null);
  const [enemyChar, setEnemyChar] = useState<CharacterDef | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    player: {} as Fighter,
    enemy: {} as Fighter,
    round: 1,
    maxRounds: 3,
    playerRoundWins: 0,
    enemyRoundWins: 0,
    timer: 99,
    gameStatus: "menu",
    particles: [],
    comboText: "",
    shakeIntensity: 0,
    roundMessage: "",
    isTraining: false,
  });

  const keysRef = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const timerRef = useRef<number>();
  const soundRef = useRef(soundCallbacks);
  soundRef.current = soundCallbacks;

  const goToSelect = useCallback((training = false) => {
    setGameState(prev => ({ ...prev, gameStatus: "select", isTraining: training }));
  }, []);

  const startTraining = useCallback((player: CharacterDef, enemy: CharacterDef) => {
    setPlayerChar(player);
    setEnemyChar(enemy);
    startRound(player, enemy, 1, 0, 0, true);
  }, []);

  const selectCharacters = useCallback((player: CharacterDef, enemy: CharacterDef) => {
    setPlayerChar(player);
    setEnemyChar(enemy);
    startRound(player, enemy, 1, 0, 0);
  }, []);

  const startRound = (pChar: CharacterDef, eChar: CharacterDef, round: number, pWins: number, eWins: number, training = false) => {
    const enemyFighter = createFighter(eChar, 600, "left");
    if (training) {
      enemyFighter.maxHealth = 999;
      enemyFighter.health = 999;
    }
    setGameState({
      player: createFighter(pChar, 150, "right"),
      enemy: enemyFighter,
      round,
      maxRounds: 3,
      playerRoundWins: pWins,
      enemyRoundWins: eWins,
      timer: training ? 999 : 99,
      gameStatus: training ? "training" : "playing",
      particles: [],
      comboText: "",
      shakeIntensity: 0,
      roundMessage: training ? "TRAINING MODE" : `ROUND ${round}`,
      isTraining: training,
    });

    // Clear round message after 2 seconds
    setTimeout(() => {
      setGameState(prev => prev.roundMessage ? { ...prev, roundMessage: "" } : prev);
    }, 2000);
  };

  const nextRound = useCallback(() => {
    if (!playerChar || !enemyChar) return;
    setGameState(prev => {
      const { playerRoundWins, enemyRoundWins, round } = prev;
      startRound(playerChar, enemyChar, round + 1, playerRoundWins, enemyRoundWins);
      return prev;
    });
  }, [playerChar, enemyChar]);

  const addKey = useCallback((key: string) => { keysRef.current.add(key); }, []);
  const removeKey = useCallback((key: string) => { keysRef.current.delete(key); }, []);

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus !== "playing" && gameState.gameStatus !== "training") return;

    const loop = () => {
      setGameState(prev => {
        if (prev.gameStatus !== "playing" && prev.gameStatus !== "training") return prev;

        let player = { ...prev.player };
        let enemy = prev.isTraining ? { ...prev.enemy } : updateEnemyAI({ ...prev.enemy }, player);
        let particles = [...prev.particles];
        let comboText = prev.comboText;
        let shakeIntensity = Math.max(0, prev.shakeIntensity - 0.5);

        const keys = keysRef.current;
        const moveSpeed = 2.5 + player.stats.speed * 0.25;

        if (player.stunTimer <= 0) {
          if (keys.has("arrowleft") || keys.has("a")) player.velocityX = -moveSpeed;
          if (keys.has("arrowright") || keys.has("d")) player.velocityX = moveSpeed;
          if ((keys.has("arrowup") || keys.has("w")) && !player.isJumping) {
            player.velocityY = JUMP_FORCE;
            player.isJumping = true;
          }
          player.isBlocking = keys.has("s") || keys.has("arrowdown");

          if (!player.isAttacking) {
            if (keys.has("j")) {
              player.isAttacking = true; player.attackType = "punch"; player.attackFrame = ATTACK_DURATION;
            } else if (keys.has("k")) {
              player.isAttacking = true; player.attackType = "kick"; player.attackFrame = ATTACK_DURATION;
            } else if (keys.has("l")) {
              player.isAttacking = true; player.attackType = "web"; player.attackFrame = ATTACK_DURATION;
            } else if (keys.has(" ")) {
              const special = SPECIAL_ATTACKS[player.sprite];
              player.isAttacking = true; player.attackType = "special"; player.attackFrame = special?.duration ?? (ATTACK_DURATION + 10);
            }
          }
        }

        player.facing = enemy.x > player.x ? "right" : "left";
        enemy.facing = player.x < enemy.x ? "left" : "right";

        // Player attacks enemy
        if (player.isAttacking && player.attackFrame === ATTACK_DURATION - 3) {
          if (checkAttackHit(player, enemy)) {
            if (enemy.isBlocking) {
              particles.push(...createParticles(enemy.x + enemy.width / 2, enemy.y + 20, 5, "#ffffff", "spark"));
              shakeIntensity = 2;
              soundRef.current?.onBlock?.();
            } else {
              const dmg = getDamage(player.attackType, player.stats.attack, player.sprite);
              const defReduction = 1 - enemy.stats.defense * 0.05;
              const finalDmg = Math.max(1, Math.round(dmg * defReduction));
              enemy.health = Math.max(0, enemy.health - finalDmg);
              const special = player.attackType === "special" ? SPECIAL_ATTACKS[player.sprite] : null;
              enemy.stunTimer = special?.stunDuration ?? 10;
              const kb = special?.knockback ?? 6;
              enemy.velocityX = player.facing === "right" ? kb : -kb;
              enemy.velocityY = -3;
              player.combo++;
              comboText = player.combo > 1 ? `${player.combo} HIT COMBO!` : "";
              shakeIntensity = finalDmg > 15 ? 8 : 4;
              particles.push(...createParticles(enemy.x + enemy.width / 2, enemy.y + 30, finalDmg > 15 ? 15 : 8,
                player.attackType === "web" ? "#cccccc" : "#ffaa00", player.attackType === "web" ? "web" : "hit"));
              soundRef.current?.onAttackHit?.(player.attackType);
            }
          } else {
            player.combo = 0; comboText = "";
          }
        }

        // Enemy attacks player
        if (enemy.isAttacking && enemy.attackFrame === ATTACK_DURATION - 3) {
          if (checkAttackHit(enemy, player)) {
            if (player.isBlocking) {
              particles.push(...createParticles(player.x + player.width / 2, player.y + 20, 5, "#ffffff", "spark"));
              shakeIntensity = 2;
              soundRef.current?.onBlock?.();
            } else {
              const dmg = getDamage(enemy.attackType, enemy.stats.attack);
              const defReduction = 1 - player.stats.defense * 0.05;
              const finalDmg = Math.max(1, Math.round(dmg * defReduction));
              player.health = Math.max(0, player.health - finalDmg);
              player.stunTimer = 10;
              player.velocityX = enemy.facing === "right" ? 6 : -6;
              player.velocityY = -3;
              shakeIntensity = 4;
              particles.push(...createParticles(player.x + player.width / 2, player.y + 30, 8, "#aa00ff", "hit"));
              soundRef.current?.onAttackHit?.(enemy.attackType);
            }
          }
        }

        player = updateFighter(player);
        enemy = updateFighter(enemy);

        const updatedParticles = particles
          .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.15, life: p.life - 1 }))
          .filter(p => p.life > 0);

        // In training mode, reset dummy health and skip round-end logic
        if (prev.isTraining) {
          if (enemy.health < 200) {
            enemy.health = enemy.maxHealth;
          }
        }

        // Check round end (skip in training)
        let gameStatus: GameState["gameStatus"] = prev.gameStatus;
        let playerRoundWins = prev.playerRoundWins;
        let enemyRoundWins = prev.enemyRoundWins;
        let roundMessage = prev.roundMessage;

        if (!prev.isTraining && (enemy.health <= 0 || player.health <= 0)) {
          const playerWon = enemy.health <= 0;
          if (playerWon) playerRoundWins++; else enemyRoundWins++;

          const winsNeeded = Math.ceil(prev.maxRounds / 2);
          if (playerRoundWins >= winsNeeded) {
            gameStatus = "win";
            soundRef.current?.onKO?.();
          } else if (enemyRoundWins >= winsNeeded) {
            gameStatus = "lose";
            soundRef.current?.onKO?.();
          } else {
            gameStatus = "roundEnd";
            roundMessage = playerWon ? `${player.name} WINS ROUND ${prev.round}!` : `${enemy.name} WINS ROUND ${prev.round}!`;
            soundRef.current?.onRoundWin?.();
          }
        }

        return {
          ...prev, player, enemy, particles: updatedParticles, comboText, shakeIntensity,
          gameStatus, playerRoundWins, enemyRoundWins, roundMessage,
        };
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    timerRef.current = window.setInterval(() => {
      setGameState(prev => {
        if (prev.gameStatus !== "playing") return prev;
        const newTimer = prev.timer - 1;
        if (newTimer <= 0) {
          const playerWon = prev.player.health >= prev.enemy.health;
          const pWins = prev.playerRoundWins + (playerWon ? 1 : 0);
          const eWins = prev.enemyRoundWins + (playerWon ? 0 : 1);
          const winsNeeded = Math.ceil(prev.maxRounds / 2);
          if (pWins >= winsNeeded) return { ...prev, timer: 0, gameStatus: "win" as const, playerRoundWins: pWins };
          if (eWins >= winsNeeded) return { ...prev, timer: 0, gameStatus: "lose" as const, enemyRoundWins: eWins };
          return { ...prev, timer: 0, gameStatus: "roundEnd" as const, playerRoundWins: pWins, enemyRoundWins: eWins,
            roundMessage: playerWon ? `${prev.player.name} WINS ROUND ${prev.round}!` : `${prev.enemy.name} WINS ROUND ${prev.round}!` };
        }
        return { ...prev, timer: newTimer };
      });
    }, 1000);

    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.gameStatus]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase() === " " ? " " : e.key.toLowerCase());
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase() === " " ? " " : e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return { gameState, goToSelect, selectCharacters, startTraining, nextRound, addKey, removeKey };
}
