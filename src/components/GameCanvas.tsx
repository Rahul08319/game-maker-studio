import { useEffect, useRef } from "react";
import type { GameState, Fighter } from "@/hooks/useGameEngine";

interface GameCanvasProps {
  gameState: GameState;
}

const CANVAS_WIDTH = 800;
const GROUND_Y = 340;

const drawSpiderman = (ctx: CanvasRenderingContext2D, f: Fighter) => {
  ctx.save();
  const flip = f.facing === "left" ? -1 : 1;
  ctx.translate(f.x + f.width / 2, f.y);
  ctx.scale(flip, 1);

  // Stun flash
  if (f.stunTimer > 0 && f.stunTimer % 4 < 2) {
    ctx.globalAlpha = 0.5;
  }

  // Body
  ctx.fillStyle = "#cc2222";
  ctx.fillRect(-20, 10, 40, 45);

  // Web pattern on body
  ctx.strokeStyle = "#1a1a40";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-20, 15 + i * 12);
    ctx.lineTo(20, 15 + i * 12);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(0, 55);
  ctx.stroke();

  // Head
  ctx.fillStyle = "#cc2222";
  ctx.beginPath();
  ctx.arc(0, 5, 18, 0, Math.PI * 2);
  ctx.fill();

  // Web lines on head
  ctx.strokeStyle = "#1a1a40";
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(i * 8, 15);
    ctx.stroke();
  }

  // Eyes
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-7, 2, 6, 8, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(7, 2, 6, 8, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eye outlines
  ctx.strokeStyle = "#1a1a40";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(-7, 2, 6, 8, -0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(7, 2, 6, 8, 0.2, 0, Math.PI * 2);
  ctx.stroke();

  // Legs
  ctx.fillStyle = "#2244aa";
  ctx.fillRect(-18, 55, 15, 30);
  ctx.fillRect(3, 55, 15, 30);

  // Boots
  ctx.fillStyle = "#cc2222";
  ctx.fillRect(-18, 75, 15, 10);
  ctx.fillRect(3, 75, 15, 10);

  // Arms
  ctx.fillStyle = "#cc2222";
  if (f.isAttacking) {
    const progress = f.attackFrame / 15;
    if (f.attackType === "punch") {
      ctx.fillRect(15, 15, 30 * (1 - progress), 10);
      // Fist
      ctx.fillStyle = "#cc2222";
      ctx.fillRect(15 + 30 * (1 - progress), 12, 12, 14);
    } else if (f.attackType === "kick") {
      ctx.save();
      ctx.fillStyle = "#2244aa";
      ctx.translate(10, 60);
      ctx.rotate(-0.8 * (1 - progress));
      ctx.fillRect(0, 0, 35, 10);
      ctx.restore();
    } else if (f.attackType === "web") {
      ctx.fillRect(10, 18, 15, 8);
      // Web projectile
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 2;
      const webLen = 80 * (1 - progress);
      ctx.beginPath();
      ctx.moveTo(25, 22);
      ctx.lineTo(25 + webLen, 22);
      ctx.stroke();
      // Web spread
      ctx.beginPath();
      ctx.moveTo(25 + webLen, 22);
      ctx.lineTo(25 + webLen + 10, 15);
      ctx.moveTo(25 + webLen, 22);
      ctx.lineTo(25 + webLen + 10, 29);
      ctx.stroke();
    } else if (f.attackType === "special") {
      // Spider-sense lines
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
  } else {
    // Normal arms
    ctx.fillRect(-25, 15, 10, 25);
    ctx.fillRect(15, 15, 10, 25);
  }

  if (f.isBlocking) {
    ctx.strokeStyle = "#4488ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 30, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#4488ff";
    ctx.fill();
  }

  ctx.restore();
};

const drawVenom = (ctx: CanvasRenderingContext2D, f: Fighter) => {
  ctx.save();
  const flip = f.facing === "left" ? -1 : 1;
  ctx.translate(f.x + f.width / 2, f.y);
  ctx.scale(flip, 1);

  if (f.stunTimer > 0 && f.stunTimer % 4 < 2) {
    ctx.globalAlpha = 0.5;
  }

  // Body (bigger)
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(-25, 5, 50, 55);

  // White spider symbol
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(0, 45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-20, 20);
  ctx.quadraticCurveTo(0, 30, 20, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-15, 35);
  ctx.quadraticCurveTo(0, 25, 15, 35);
  ctx.stroke();

  // Head
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (menacing white)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-14, -5);
  ctx.lineTo(-5, -10);
  ctx.lineTo(-3, 0);
  ctx.lineTo(-12, 5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(14, -5);
  ctx.lineTo(5, -10);
  ctx.lineTo(3, 0);
  ctx.lineTo(12, 5);
  ctx.closePath();
  ctx.fill();

  // Mouth / teeth
  ctx.fillStyle = "#440000";
  ctx.beginPath();
  ctx.ellipse(0, 12, 14, 6, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 4 - 1, 12);
    ctx.lineTo(i * 4, 18);
    ctx.lineTo(i * 4 + 1, 12);
    ctx.fill();
  }

  // Legs
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(-22, 60, 18, 30);
  ctx.fillRect(4, 60, 18, 30);

  // Arms
  if (f.isAttacking) {
    const progress = f.attackFrame / 15;
    ctx.fillStyle = "#1a1a2e";
    if (f.attackType === "punch") {
      ctx.fillRect(20, 10, 35 * (1 - progress), 14);
      ctx.fillRect(20 + 35 * (1 - progress), 8, 15, 18);
    } else if (f.attackType === "kick") {
      ctx.save();
      ctx.translate(10, 65);
      ctx.rotate(-0.8 * (1 - progress));
      ctx.fillRect(0, 0, 40, 12);
      ctx.restore();
    } else if (f.attackType === "web") {
      // Symbiote tendril
      ctx.strokeStyle = "#6b3fa0";
      ctx.lineWidth = 4;
      const tendrilLen = 90 * (1 - progress);
      ctx.beginPath();
      ctx.moveTo(25, 25);
      for (let i = 0; i < tendrilLen; i += 5) {
        ctx.lineTo(25 + i, 25 + Math.sin(i * 0.3) * 5);
      }
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(-30, 10, 12, 30);
    ctx.fillRect(18, 10, 12, 30);
  }

  if (f.isBlocking) {
    ctx.strokeStyle = "#6b3fa0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 30, 35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = "#6b3fa0";
    ctx.fill();
  }

  ctx.restore();
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

      // Screen shake
      if (shakeIntensity > 0) {
        ctx.translate(
          (Math.random() - 0.5) * shakeIntensity * 2,
          (Math.random() - 0.5) * shakeIntensity * 2
        );
      }

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, "#0a0a1a");
      skyGrad.addColorStop(0.5, "#1a1a3a");
      skyGrad.addColorStop(1, "#0d0d20");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // City skyline background
      ctx.fillStyle = "#12122a";
      // Buildings
      const buildings = [
        { x: 0, w: 60, h: 180 },
        { x: 70, w: 45, h: 220 },
        { x: 130, w: 80, h: 160 },
        { x: 220, w: 50, h: 250 },
        { x: 280, w: 70, h: 190 },
        { x: 360, w: 55, h: 230 },
        { x: 430, w: 90, h: 170 },
        { x: 530, w: 60, h: 260 },
        { x: 600, w: 75, h: 200 },
        { x: 690, w: 50, h: 240 },
        { x: 750, w: 60, h: 210 },
      ];
      buildings.forEach((b) => {
        ctx.fillStyle = "#12122a";
        ctx.fillRect(b.x, CANVAS_HEIGHT - b.h - 30, b.w, b.h + 30);

        // Windows
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

      // Ground line
      ctx.strokeStyle = "#444466";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - 30);
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 30);
      ctx.stroke();

      // Translate fighters so ground_y aligns with visual ground
      const groundOffset = CANVAS_HEIGHT - 30 - 80;

      // Draw fighters
      const pDraw = { ...player, y: player.y - GROUND_Y + groundOffset };
      const eDraw = { ...enemy, y: enemy.y - GROUND_Y + groundOffset };

      if (player.sprite === "spiderman") drawSpiderman(ctx, pDraw);
      else drawVenom(ctx, pDraw);

      if (enemy.sprite === "venom") drawVenom(ctx, eDraw);
      else drawSpiderman(ctx, eDraw);

      // Particles
      particles.forEach((p) => {
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        if (p.type === "hit") {
          ctx.beginPath();
          // Star shape for hits
          ctx.arc(p.x, p.y - GROUND_Y + groundOffset, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "web") {
          ctx.fillRect(p.x - 1, p.y - GROUND_Y + groundOffset - 1, p.size, p.size);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y - GROUND_Y + groundOffset, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      });

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="rounded-lg border-2 border-spider-red/30 shadow-glow-red"
      style={{ imageRendering: "auto" }}
    />
  );
}
