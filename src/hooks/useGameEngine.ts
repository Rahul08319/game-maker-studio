import { useCallback, useEffect, useRef, useState } from "react";

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
  sprite: "spiderman" | "venom";
}

export interface GameState {
  player: Fighter;
  enemy: Fighter;
  round: number;
  timer: number;
  gameStatus: "menu" | "playing" | "ko" | "win" | "lose";
  particles: Particle[];
  comboText: string;
  shakeIntensity: number;
}

interface Particle {
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

const GROUND_Y = 340;
const GRAVITY = 0.6;
const MOVE_SPEED = 4;
const JUMP_FORCE = -13;
const ATTACK_DURATION = 15;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

const createFighter = (
  name: string,
  x: number,
  facing: "left" | "right",
  color: string,
  accentColor: string,
  sprite: "spiderman" | "venom"
): Fighter => ({
  name,
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
  color,
  accentColor,
  sprite,
});

export function useGameEngine() {
  const [gameState, setGameState] = useState<GameState>({
    player: createFighter("Spider-Man", 150, "right", "#cc2222", "#2244aa", "spiderman"),
    enemy: createFighter("Venom", 600, "left", "#1a1a2e", "#6b3fa0", "venom"),
    round: 1,
    timer: 99,
    gameStatus: "menu",
    particles: [],
    comboText: "",
    shakeIntensity: 0,
  });

  const keysRef = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const timerRef = useRef<number>();
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const createParticles = (
    x: number,
    y: number,
    count: number,
    color: string,
    type: "hit" | "web" | "spark"
  ): Particle[] => {
    return Array.from({ length: count }, () => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 2,
      life: 20 + Math.random() * 20,
      maxLife: 30,
      color,
      size: type === "hit" ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
      type,
    }));
  };

  const checkAttackHit = (attacker: Fighter, defender: Fighter): boolean => {
    const reach = attacker.attackType === "web" ? 120 : 70;
    const attackX =
      attacker.facing === "right" ? attacker.x + attacker.width : attacker.x - reach;
    return (
      attackX < defender.x + defender.width &&
      attackX + reach > defender.x &&
      attacker.y < defender.y + defender.height &&
      attacker.y + attacker.height > defender.y
    );
  };

  const getDamage = (type: string): number => {
    switch (type) {
      case "punch": return 8;
      case "kick": return 12;
      case "web": return 6;
      case "special": return 20;
      default: return 0;
    }
  };

  const startGame = useCallback(() => {
    setGameState({
      player: createFighter("Spider-Man", 150, "right", "#cc2222", "#2244aa", "spiderman"),
      enemy: createFighter("Venom", 600, "left", "#1a1a2e", "#6b3fa0", "venom"),
      round: 1,
      timer: 99,
      gameStatus: "playing",
      particles: [],
      comboText: "",
      shakeIntensity: 0,
    });
  }, []);

  // AI for enemy
  const updateEnemyAI = (enemy: Fighter, player: Fighter): Fighter => {
    const updated = { ...enemy };
    const dist = Math.abs(player.x - enemy.x);

    updated.facing = player.x < enemy.x ? "left" : "right";

    if (updated.stunTimer > 0) {
      updated.stunTimer--;
      return updated;
    }

    // Move toward player
    if (dist > 100) {
      updated.velocityX = updated.facing === "right" ? MOVE_SPEED * 0.6 : -MOVE_SPEED * 0.6;
    } else if (dist < 60) {
      updated.velocityX = updated.facing === "right" ? -MOVE_SPEED * 0.3 : MOVE_SPEED * 0.3;
    } else {
      updated.velocityX = 0;
    }

    // Random attacks
    if (dist < 120 && !updated.isAttacking && Math.random() < 0.04) {
      const attacks: Array<"punch" | "kick" | "web"> = ["punch", "kick", "web"];
      updated.isAttacking = true;
      updated.attackType = attacks[Math.floor(Math.random() * attacks.length)];
      updated.attackFrame = ATTACK_DURATION;
    }

    // Random jump
    if (!updated.isJumping && Math.random() < 0.01) {
      updated.velocityY = JUMP_FORCE;
      updated.isJumping = true;
    }

    // Random block
    updated.isBlocking = dist < 100 && Math.random() < 0.02;

    return updated;
  };

  const updateFighter = (fighter: Fighter): Fighter => {
    const updated = { ...fighter };

    // Apply gravity
    updated.velocityY += GRAVITY;
    updated.y += updated.velocityY;
    updated.x += updated.velocityX;

    // Ground collision
    if (updated.y >= GROUND_Y) {
      updated.y = GROUND_Y;
      updated.velocityY = 0;
      updated.isJumping = false;
    }

    // Boundaries
    updated.x = Math.max(0, Math.min(CANVAS_WIDTH - updated.width, updated.x));

    // Attack frames
    if (updated.isAttacking) {
      updated.attackFrame--;
      if (updated.attackFrame <= 0) {
        updated.isAttacking = false;
        updated.attackType = "none";
      }
    }

    // Friction
    updated.velocityX *= 0.85;

    if (updated.stunTimer > 0) updated.stunTimer--;

    return updated;
  };

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus !== "playing") return;

    const loop = () => {
      setGameState((prev) => {
        if (prev.gameStatus !== "playing") return prev;

        let player = { ...prev.player };
        let enemy = updateEnemyAI({ ...prev.enemy }, player);
        let particles = [...prev.particles];
        let comboText = prev.comboText;
        let shakeIntensity = Math.max(0, prev.shakeIntensity - 0.5);

        const keys = keysRef.current;

        // Player input
        if (player.stunTimer <= 0) {
          if (keys.has("ArrowLeft") || keys.has("a")) {
            player.velocityX = -MOVE_SPEED;
          }
          if (keys.has("ArrowRight") || keys.has("d")) {
            player.velocityX = MOVE_SPEED;
          }
          if ((keys.has("ArrowUp") || keys.has("w")) && !player.isJumping) {
            player.velocityY = JUMP_FORCE;
            player.isJumping = true;
          }
          if (keys.has("s") || keys.has("ArrowDown")) {
            player.isBlocking = true;
          } else {
            player.isBlocking = false;
          }

          // Attacks
          if (!player.isAttacking) {
            if (keys.has("j")) {
              player.isAttacking = true;
              player.attackType = "punch";
              player.attackFrame = ATTACK_DURATION;
            } else if (keys.has("k")) {
              player.isAttacking = true;
              player.attackType = "kick";
              player.attackFrame = ATTACK_DURATION;
            } else if (keys.has("l")) {
              player.isAttacking = true;
              player.attackType = "web";
              player.attackFrame = ATTACK_DURATION;
            } else if (keys.has(" ")) {
              player.isAttacking = true;
              player.attackType = "special";
              player.attackFrame = ATTACK_DURATION + 10;
            }
          }
        }

        // Update facing
        player.facing = enemy.x > player.x ? "right" : "left";
        enemy.facing = player.x < enemy.x ? "left" : "right";

        // Check player attacks hitting enemy
        if (player.isAttacking && player.attackFrame === ATTACK_DURATION - 3) {
          if (checkAttackHit(player, enemy)) {
            if (enemy.isBlocking) {
              particles.push(
                ...createParticles(enemy.x + enemy.width / 2, enemy.y + 20, 5, "#ffffff", "spark")
              );
              shakeIntensity = 2;
            } else {
              const dmg = getDamage(player.attackType);
              enemy.health = Math.max(0, enemy.health - dmg);
              enemy.stunTimer = 10;
              enemy.velocityX = player.facing === "right" ? 6 : -6;
              enemy.velocityY = -3;
              player.combo++;
              comboText = player.combo > 1 ? `${player.combo} HIT COMBO!` : "";
              shakeIntensity = dmg > 15 ? 8 : 4;
              particles.push(
                ...createParticles(
                  enemy.x + enemy.width / 2,
                  enemy.y + 30,
                  dmg > 15 ? 15 : 8,
                  player.attackType === "web" ? "#cccccc" : "#ffaa00",
                  player.attackType === "web" ? "web" : "hit"
                )
              );
            }
          } else {
            player.combo = 0;
            comboText = "";
          }
        }

        // Check enemy attacks hitting player
        if (enemy.isAttacking && enemy.attackFrame === ATTACK_DURATION - 3) {
          if (checkAttackHit(enemy, player)) {
            if (player.isBlocking) {
              particles.push(
                ...createParticles(player.x + player.width / 2, player.y + 20, 5, "#ffffff", "spark")
              );
              shakeIntensity = 2;
            } else {
              const dmg = getDamage(enemy.attackType);
              player.health = Math.max(0, player.health - dmg);
              player.stunTimer = 10;
              player.velocityX = enemy.facing === "right" ? 6 : -6;
              player.velocityY = -3;
              shakeIntensity = 4;
              particles.push(
                ...createParticles(
                  player.x + player.width / 2,
                  player.y + 30,
                  8,
                  "#aa00ff",
                  "hit"
                )
              );
            }
          }
        }

        player = updateFighter(player);
        enemy = updateFighter(enemy);

        // Update particles
        const updatedParticles = particles
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0);

        // Check KO
        let gameStatus = prev.gameStatus;
        if (enemy.health <= 0) gameStatus = "win";
        if (player.health <= 0) gameStatus = "lose";

        return {
          ...prev,
          player,
          enemy,
          particles: updatedParticles,
          comboText,
          shakeIntensity,
          gameStatus,
        };
      });

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);

    // Timer
    timerRef.current = window.setInterval(() => {
      setGameState((prev) => {
        if (prev.gameStatus !== "playing") return prev;
        const newTimer = prev.timer - 1;
        if (newTimer <= 0) {
          return {
            ...prev,
            timer: 0,
            gameStatus: prev.player.health >= prev.enemy.health ? "win" : "lose",
          };
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

  return { gameState, startGame };
}
