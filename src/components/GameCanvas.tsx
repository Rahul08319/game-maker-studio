import { useEffect, useRef } from "react";
import type { GameState, Fighter } from "@/hooks/useGameEngine";

interface GameCanvasProps {
  gameState: GameState;
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

const getHeadDetail = (sprite: string) => {
  switch (sprite) {
    case "spiderman": return spidermanHead;
    case "venom": return venomHead;
    case "goblin": return goblinHead;
    case "doc_ock": return docOckHead;
    default: return spidermanHead;
  }
};

export function GameCanvas({ gameState }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const { player, enemy, particles, shakeIntensity } = gameState;
      ctx.save();

      if (shakeIntensity > 0) {
        ctx.translate((Math.random() - 0.5) * shakeIntensity * 2, (Math.random() - 0.5) * shakeIntensity * 2);
      }

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, "#0a0a1a");
      skyGrad.addColorStop(0.5, "#1a1a3a");
      skyGrad.addColorStop(1, "#0d0d20");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Buildings
      ctx.fillStyle = "#12122a";
      const buildings = [
        { x: 0, w: 60, h: 180 }, { x: 70, w: 45, h: 220 }, { x: 130, w: 80, h: 160 },
        { x: 220, w: 50, h: 250 }, { x: 280, w: 70, h: 190 }, { x: 360, w: 55, h: 230 },
        { x: 430, w: 90, h: 170 }, { x: 530, w: 60, h: 260 }, { x: 600, w: 75, h: 200 },
        { x: 690, w: 50, h: 240 }, { x: 750, w: 60, h: 210 },
      ];
      buildings.forEach(b => {
        ctx.fillStyle = "#12122a";
        ctx.fillRect(b.x, CANVAS_HEIGHT - b.h - 30, b.w, b.h + 30);
        ctx.fillStyle = "#ffcc44";
        for (let wy = CANVAS_HEIGHT - b.h - 20; wy < CANVAS_HEIGHT - 40; wy += 20) {
          for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 15) {
            if (Math.random() > 0.3) {
              ctx.globalAlpha = 0.3 + Math.random() * 0.4;
              ctx.fillRect(wx, wy, 6, 8);
            }
          }
        }
        ctx.globalAlpha = 1;
      });

      // Ground
      const groundGrad = ctx.createLinearGradient(0, CANVAS_HEIGHT - 30, 0, CANVAS_HEIGHT);
      groundGrad.addColorStop(0, "#222244");
      groundGrad.addColorStop(1, "#111122");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 30);
      ctx.strokeStyle = "#444466"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, CANVAS_HEIGHT - 30); ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 30); ctx.stroke();

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
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="rounded-lg border-2 border-spider-red/30 shadow-glow-red w-full max-w-[800px]"
      style={{ imageRendering: "auto" }}
    />
  );
}
