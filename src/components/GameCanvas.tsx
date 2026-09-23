import { useEffect, useRef } from "react";
import type { GameState, Fighter } from "@/hooks/useGameEngine";
import { SPECIAL_ATTACKS } from "@/lib/specialAttacks";
import { getStage } from "@/lib/stages";
import { WebGLArenaBackdrop } from "@/components/WebGLArenaBackdrop";

interface GameCanvasProps {
  gameState: GameState;
  isPaused: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const GROUND_Y = 340;

// ─── Generic fighter drawing ───
const drawFighterGeneric = (ctx: CanvasRenderingContext2D, f: Fighter, bodyColor: string, headDetail: (ctx: CanvasRenderingContext2D) => void) => {
  ctx.save();
  const flip = f.facing === "left" ? -1 : 1;
  ctx.translate(f.x + f.width / 2, f.y);
  ctx.scale(flip, 1);

  if (f.stunTimer > 0 && f.stunTimer % 4 < 2) ctx.globalAlpha = 0.5;

  // Body
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-20, 10, 40, 45);

  // Head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(0, 5, 18, 0, Math.PI * 2);
  ctx.fill();

  headDetail(ctx);

  // Legs
  ctx.fillStyle = f.accentColor || bodyColor;
  ctx.fillRect(-18, 55, 15, 30);
  ctx.fillRect(3, 55, 15, 30);

  // Arms / attacks
  ctx.fillStyle = bodyColor;
  if (f.isAttacking) {
    drawAttack(ctx, f);
  } else {
    ctx.fillRect(-25, 15, 10, 25);
    ctx.fillRect(15, 15, 10, 25);
  }

  if (f.isBlocking) {
    ctx.strokeStyle = f.accentColor || "#4488ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 30, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = f.accentColor || "#4488ff";
    ctx.fill();
  }

  ctx.restore();
};

const drawAttack = (ctx: CanvasRenderingContext2D, f: Fighter) => {
  const progress = f.attackFrame / 15;
  if (f.attackType === "punch") {
    ctx.fillRect(15, 15, 30 * (1 - progress), 10);
    ctx.fillRect(15 + 30 * (1 - progress), 12, 12, 14);
  } else if (f.attackType === "kick") {
    ctx.save();
    ctx.translate(10, 60);
    ctx.rotate(-0.8 * (1 - progress));
    ctx.fillRect(0, 0, 35, 10);
    ctx.restore();
  } else if (f.attackType === "web") {
    ctx.fillRect(10, 18, 15, 8);
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 2;
    const webLen = 80 * (1 - progress);
    ctx.beginPath();
    ctx.moveTo(25, 22);
    ctx.lineTo(25 + webLen, 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25 + webLen, 22);
    ctx.lineTo(25 + webLen + 10, 15);
    ctx.moveTo(25 + webLen, 22);
    ctx.lineTo(25 + webLen + 10, 29);
    ctx.stroke();
  } else if (f.attackType === "special") {
    drawCharacterSpecial(ctx, f);
  }
};

const drawCharacterSpecial = (ctx: CanvasRenderingContext2D, f: Fighter) => {
  const special = SPECIAL_ATTACKS[f.sprite];
  const duration = special?.duration ?? 25;
  const progress = f.attackFrame / duration;

  switch (f.sprite) {
    case "spiderman": {
      // Web Barrage — multiple web lines
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        const len = 100 * (1 - progress);
        ctx.beginPath();
        ctx.moveTo(15, 20 + i * 5);
        ctx.lineTo(15 + len, 20 + i * 8);
        ctx.stroke();
      }
      break;
    }
    case "venom": {
      // Symbiote Slam — tendrils
      ctx.strokeStyle = "#6b3fa0";
      ctx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        const angle = -0.6 + (i / 4) * 1.2;
        const len = 60 * (1 - progress);
        ctx.beginPath();
        ctx.moveTo(0, 25);
        ctx.quadraticCurveTo(Math.cos(angle) * len * 0.5, 25 + Math.sin(angle) * len * 0.5, Math.cos(angle) * len, 25 + Math.sin(angle) * len);
        ctx.stroke();
      }
      break;
    }
    case "goblin": {
      // Pumpkin Bomb — projectile
      ctx.fillStyle = "#ff6600";
      const bx = 30 + 120 * (1 - progress);
      ctx.beginPath();
      ctx.arc(bx, 25, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#332200";
      ctx.beginPath(); ctx.arc(bx - 3, 23, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx + 3, 23, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bx, 28, 3, 0, Math.PI); ctx.stroke();
      // Explosion at end
      if (progress < 0.2) {
        ctx.fillStyle = "#ff440066";
        ctx.beginPath(); ctx.arc(bx, 25, 30 * (0.2 - progress) * 5, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "doc_ock": {
      // Tentacle Fury — spinning tentacles
      ctx.strokeStyle = "#c0c0c0";
      ctx.lineWidth = 3;
      const rot = (1 - progress) * Math.PI * 4;
      for (let i = 0; i < 4; i++) {
        const angle = rot + (i / 4) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(Math.cos(angle) * 50, 30 + Math.sin(angle) * 50);
        ctx.stroke();
        // Claw tips
        ctx.fillStyle = "#888";
        ctx.beginPath(); ctx.arc(Math.cos(angle) * 50, 30 + Math.sin(angle) * 50, 4, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "electro": {
      // Lightning Chain — jagged bolt across screen
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 15;
      const chainLen = 150 * (1 - progress);
      ctx.beginPath();
      ctx.moveTo(15, 22);
      for (let seg = 1; seg <= 6; seg++) {
        const sx = 15 + (chainLen / 6) * seg;
        const sy = 22 + (Math.random() - 0.5) * 30;
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      // Secondary arc
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(15, 28);
      for (let seg = 1; seg <= 4; seg++) {
        ctx.lineTo(15 + (chainLen / 4) * seg, 28 + (Math.random() - 0.5) * 20);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
    case "sandman": {
      // Ground Slam — giant fists slamming down, ground crack
      const slamProgress = Math.max(0, 1 - progress * 1.5);
      ctx.fillStyle = "#c2a04e";
      // Giant fists coming down
      ctx.beginPath(); ctx.arc(-20, 15 + slamProgress * 50, 14, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(20, 15 + slamProgress * 50, 14, 0, Math.PI * 2); ctx.fill();
      // Ground crack effect
      if (progress < 0.5) {
        ctx.strokeStyle = "#8b6914";
        ctx.lineWidth = 2;
        for (let i = -3; i <= 3; i++) {
          const crackLen = 40 * (0.5 - progress) * 2;
          ctx.beginPath();
          ctx.moveTo(0, 65);
          ctx.lineTo(i * crackLen, 65 + Math.abs(i) * 5);
          ctx.stroke();
        }
        // Dust particles
        ctx.fillStyle = "#c2a04e44";
        ctx.beginPath(); ctx.arc(0, 60, 60 * (0.5 - progress) * 2, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case "black_cat": {
      // Whip Grapple — whip line that hooks
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 2;
      const whipLen = 120 * (1 - progress);
      ctx.beginPath();
      ctx.moveTo(15, 22);
      ctx.quadraticCurveTo(15 + whipLen * 0.6, 10, 15 + whipLen, 22);
      ctx.stroke();
      // Hook at end
      ctx.beginPath();
      ctx.arc(15 + whipLen, 22, 5, -Math.PI * 0.5, Math.PI);
      ctx.stroke();
      // Pull effect
      if (progress < 0.3) {
        ctx.strokeStyle = "#44ff66";
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(15 + whipLen - i * 10, 18 + Math.random() * 8);
          ctx.lineTo(15 + whipLen - i * 10 - 15, 22);
          ctx.stroke();
        }
      }
      break;
    }
    default: {
      // Fallback radial burst
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const len = 40 * (1 - progress);
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(Math.cos(angle) * len, 20 + Math.sin(angle) * len);
        ctx.stroke();
      }
    }
  }
};

// ─── Character-specific head/body details ───
const spidermanHead = (ctx: CanvasRenderingContext2D) => {
  // Web lines on head
  ctx.strokeStyle = "#1a1a40";
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(i * 8, 15); ctx.stroke();
  }
  // Web on body
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.moveTo(-20, 15 + i * 12); ctx.lineTo(20, 15 + i * 12); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 55); ctx.stroke();
  // Eyes
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.ellipse(-7, 2, 6, 8, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7, 2, 6, 8, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#1a1a40"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(-7, 2, 6, 8, -0.2, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(7, 2, 6, 8, 0.2, 0, Math.PI * 2); ctx.stroke();
  // Boots
  ctx.fillStyle = "#cc2222";
  ctx.fillRect(-18, 75, 15, 10); ctx.fillRect(3, 75, 15, 10);
};

const venomHead = (ctx: CanvasRenderingContext2D) => {
  // Spider symbol
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 45); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-20, 20); ctx.quadraticCurveTo(0, 30, 20, 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-15, 35); ctx.quadraticCurveTo(0, 25, 15, 35); ctx.stroke();
  // Eyes
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.moveTo(-14, -5); ctx.lineTo(-5, -10); ctx.lineTo(-3, 0); ctx.lineTo(-12, 5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(14, -5); ctx.lineTo(5, -10); ctx.lineTo(3, 0); ctx.lineTo(12, 5); ctx.closePath(); ctx.fill();
  // Teeth
  ctx.fillStyle = "#440000";
  ctx.beginPath(); ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath(); ctx.moveTo(i * 4 - 1, 12); ctx.lineTo(i * 4, 18); ctx.lineTo(i * 4 + 1, 12); ctx.fill();
  }
};

const goblinHead = (ctx: CanvasRenderingContext2D) => {
  // Goblin hat
  ctx.fillStyle = "#6b2fa0";
  ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(0, -30); ctx.lineTo(15, -10); ctx.closePath(); ctx.fill();
  // Eyes (yellow, menacing)
  ctx.fillStyle = "#ffcc00";
  ctx.beginPath(); ctx.ellipse(-7, 2, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7, 2, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#000";
  ctx.beginPath(); ctx.arc(-7, 2, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, 2, 2, 0, Math.PI * 2); ctx.fill();
  // Grin
  ctx.strokeStyle = "#ffcc00"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 8, 10, 0.1, Math.PI - 0.1); ctx.stroke();
};

const docOckHead = (ctx: CanvasRenderingContext2D) => {
  // Glasses
  ctx.strokeStyle = "#c0c0c0"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(-7, 2, 7, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(7, 2, 7, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, 2); ctx.stroke();
  // Eyes behind glasses
  ctx.fillStyle = "#ffffff";
  ctx.beginPath(); ctx.arc(-7, 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, 2, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath(); ctx.arc(-7, 2, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, 2, 1.5, 0, Math.PI * 2); ctx.fill();
  // Tentacle stubs (on body)
  ctx.strokeStyle = "#c0c0c0"; ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const angle = -Math.PI * 0.8 + (i / 3) * Math.PI * 0.6;
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.lineTo(Math.cos(angle) * 35, 30 + Math.sin(angle) * 35);
    ctx.stroke();
  }
};

const electroHead = (ctx: CanvasRenderingContext2D) => {
  // Lightning bolts on head
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 2;
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i * 10, -15);
    ctx.lineTo(i * 6, -8);
    ctx.lineTo(i * 12, -2);
    ctx.lineTo(i * 8, 5);
    ctx.stroke();
  }
  // Glowing eyes
  ctx.shadowColor = "#00e5ff";
  ctx.shadowBlur = 8;
  ctx.fillStyle = "#00e5ff";
  ctx.beginPath(); ctx.arc(-6, 2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, 2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  // Electric arcs on body
  ctx.strokeStyle = "#00e5ff";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5 + Math.random() * 0.5;
  for (let i = 0; i < 3; i++) {
    const sy = 15 + i * 15;
    ctx.beginPath();
    ctx.moveTo(-15, sy);
    ctx.lineTo(-8 + Math.random() * 4, sy + 5);
    ctx.lineTo(8 + Math.random() * 4, sy - 3);
    ctx.lineTo(15, sy + 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};

const sandmanHead = (ctx: CanvasRenderingContext2D) => {
  // Sandy texture dots
  ctx.fillStyle = "#8b6914";
  for (let i = 0; i < 12; i++) {
    const sx = -12 + Math.random() * 24;
    const sy = -8 + Math.random() * 16;
    ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  // Dark eyes
  ctx.fillStyle = "#332200";
  ctx.beginPath(); ctx.arc(-6, 2, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6, 2, 4, 0, Math.PI * 2); ctx.fill();
  // Heavy brow
  ctx.fillStyle = "#8b6914";
  ctx.fillRect(-14, -6, 28, 5);
  // Sandy body particles
  ctx.fillStyle = "#c2a04e";
  for (let i = 0; i < 6; i++) {
    const bx = -18 + Math.random() * 36;
    const by = 15 + Math.random() * 40;
    ctx.beginPath(); ctx.arc(bx, by, 2 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
  }
  // Big fists
  ctx.fillStyle = "#c2a04e";
  ctx.beginPath(); ctx.arc(-25, 40, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(25, 40, 8, 0, Math.PI * 2); ctx.fill();
};

const blackCatHead = (ctx: CanvasRenderingContext2D) => {
  // White hair flowing
  ctx.fillStyle = "#e0e0e0";
  ctx.beginPath();
  ctx.moveTo(-15, -10);
  ctx.quadraticCurveTo(-20, 10, -18, 25);
  ctx.lineTo(-10, 10);
  ctx.quadraticCurveTo(-8, -5, -5, -12);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(15, -10);
  ctx.quadraticCurveTo(20, 10, 18, 25);
  ctx.lineTo(10, 10);
  ctx.quadraticCurveTo(8, -5, 5, -12);
  ctx.closePath();
  ctx.fill();
  // Cat ears
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(-8, -25); ctx.lineTo(-4, -12); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4, -12); ctx.lineTo(8, -25); ctx.lineTo(12, -12); ctx.closePath(); ctx.fill();
  // Cat eyes (green)
  ctx.fillStyle = "#44ff66";
  ctx.beginPath(); ctx.ellipse(-6, 2, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, 2, 4, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#000";
  ctx.fillRect(-7, 0, 2, 5);
  ctx.fillRect(5, 0, 2, 5);
  // Mask
  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.quadraticCurveTo(-10, -6, -2, -2);
  ctx.moveTo(14, 0);
  ctx.quadraticCurveTo(10, -6, 2, -2);
  ctx.stroke();
};

const getHeadDetail = (sprite: string) => {
  switch (sprite) {
    case "spiderman": return spidermanHead;
    case "venom": return venomHead;
    case "goblin": return goblinHead;
    case "doc_ock": return docOckHead;
    case "electro": return electroHead;
    case "sandman": return sandmanHead;
    case "black_cat": return blackCatHead;
    default: return spidermanHead;
  }
};

export function GameCanvas({ gameState, isPaused }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || isPaused) return;

    // Keep the logical 800×450 arena crisp on every device density.
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = CANVAS_WIDTH * pixelRatio;
    canvas.height = CANVAS_HEIGHT * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    let frame = 0;
    const render = () => {
      frame++;
      const currentGameState = gameStateRef.current;
      const { player, enemy, particles, shakeIntensity } = currentGameState;
      ctx.save();

      if (shakeIntensity > 0) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity * 2, (Math.random() - 0.5) * shakeIntensity * 2);
      }

      // Stage background
      const stage = getStage(currentGameState.stageId);
      ctx.globalAlpha = 0.72;
      stage.draw(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, frame);
      ctx.globalAlpha = 1;

      const groundOffset = CANVAS_HEIGHT - 30 - 80;
      const pDraw = { ...player, y: player.y - GROUND_Y + groundOffset };
      const eDraw = { ...enemy, y: enemy.y - GROUND_Y + groundOffset };

      drawFighterGeneric(ctx, pDraw, player.color, getHeadDetail(player.sprite));
      drawFighterGeneric(ctx, eDraw, enemy.color, getHeadDetail(enemy.sprite));

      // Particles
      particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        if (p.type === "hit") {
          ctx.beginPath(); ctx.arc(p.x, p.y - GROUND_Y + groundOffset, p.size, 0, Math.PI * 2); ctx.fill();
        } else if (p.type === "web") {
          ctx.fillRect(p.x - 1, p.y - GROUND_Y + groundOffset - 1, p.size, p.size);
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y - GROUND_Y + groundOffset, p.size * 0.7, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isPaused]);

  return (
    <div className="game-frame" aria-label={`${gameState.player.name} versus ${gameState.enemy.name} arena`}>
      <WebGLArenaBackdrop stageId={gameState.stageId} isPaused={isPaused} />
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="arena-canvas" />
      <div className="game-frame-sheen" aria-hidden="true" />
    </div>
  );
}
