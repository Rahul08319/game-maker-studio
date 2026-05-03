export interface StageDef {
  id: string;
  name: string;
  description: string;
  // canvas draw function
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
}

const drawCity: StageDef["draw"] = (ctx, w, h) => {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#0a0a1a"); sky.addColorStop(0.5, "#1a1a3a"); sky.addColorStop(1, "#0d0d20");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#12122a";
  const buildings = [
    { x: 0, w: 60, h: 180 }, { x: 70, w: 45, h: 220 }, { x: 130, w: 80, h: 160 },
    { x: 220, w: 50, h: 250 }, { x: 280, w: 70, h: 190 }, { x: 360, w: 55, h: 230 },
    { x: 430, w: 90, h: 170 }, { x: 530, w: 60, h: 260 }, { x: 600, w: 75, h: 200 },
    { x: 690, w: 50, h: 240 }, { x: 750, w: 60, h: 210 },
  ];
  buildings.forEach(b => {
    ctx.fillStyle = "#12122a";
    ctx.fillRect(b.x, h - b.h - 30, b.w, b.h + 30);
    ctx.fillStyle = "#ffcc44";
    for (let wy = h - b.h - 20; wy < h - 40; wy += 20) {
      for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 15) {
        if (((wx * 7 + wy * 13 + b.x) % 10) > 3) {
          ctx.globalAlpha = 0.5; ctx.fillRect(wx, wy, 6, 8);
        }
      }
    }
    ctx.globalAlpha = 1;
  });
  const groundGrad = ctx.createLinearGradient(0, h - 30, 0, h);
  groundGrad.addColorStop(0, "#222244"); groundGrad.addColorStop(1, "#111122");
  ctx.fillStyle = groundGrad; ctx.fillRect(0, h - 30, w, 30);
};

const drawRooftop: StageDef["draw"] = (ctx, w, h, t) => {
  // Sunset sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#1a0a2e"); sky.addColorStop(0.5, "#7d2c4a"); sky.addColorStop(1, "#ff7a3c");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // Sun
  ctx.fillStyle = "#ffd56b";
  ctx.beginPath(); ctx.arc(w * 0.7, h * 0.55, 50, 0, Math.PI * 2); ctx.fill();
  // Distant skyline silhouette
  ctx.fillStyle = "#1a0e2e";
  const sky2 = [
    { x: 0, w: 80, h: 120 }, { x: 90, w: 60, h: 160 }, { x: 160, w: 100, h: 100 },
    { x: 270, w: 70, h: 180 }, { x: 350, w: 90, h: 130 }, { x: 450, w: 60, h: 200 },
    { x: 520, w: 110, h: 150 }, { x: 640, w: 80, h: 170 }, { x: 730, w: 70, h: 140 },
  ];
  sky2.forEach(b => ctx.fillRect(b.x, h - 80 - b.h, b.w, b.h));
  // Rooftop edge with antenna
  ctx.fillStyle = "#3a2a1a"; ctx.fillRect(0, h - 80, w, 50);
  ctx.fillStyle = "#222"; ctx.fillRect(0, h - 80, w, 4);
  // AC units
  ctx.fillStyle = "#666";
  ctx.fillRect(80, h - 110, 50, 30); ctx.fillRect(620, h - 115, 60, 35);
  // Antenna
  ctx.strokeStyle = "#888"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(400, h - 80); ctx.lineTo(400, h - 200); ctx.stroke();
  ctx.fillStyle = "#ff3333"; ctx.beginPath();
  ctx.arc(400, h - 200, 4 + Math.sin(t * 0.05) * 1, 0, Math.PI * 2); ctx.fill();
  // Ground
  ctx.fillStyle = "#1a0e1e"; ctx.fillRect(0, h - 30, w, 30);
};

const drawSubway: StageDef["draw"] = (ctx, w, h, t) => {
  // Tunnel darkness
  ctx.fillStyle = "#0a0a0e"; ctx.fillRect(0, 0, w, h);
  // Tile wall
  ctx.fillStyle = "#1c2a3e";
  ctx.fillRect(0, 60, w, h - 90);
  ctx.strokeStyle = "#0d1622"; ctx.lineWidth = 1;
  for (let y = 60; y < h - 30; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, h - 30); ctx.stroke();
  }
  // Flickering ceiling lights
  for (let lx = 80; lx < w; lx += 180) {
    const flicker = ((Math.sin(t * 0.1 + lx) + 1) * 0.5) > 0.15 ? 1 : 0.3;
    ctx.fillStyle = `rgba(255, 240, 180, ${0.7 * flicker})`;
    ctx.fillRect(lx - 30, 30, 60, 6);
    const glow = ctx.createRadialGradient(lx, 36, 0, lx, 36, 80);
    glow.addColorStop(0, `rgba(255,240,180,${0.3 * flicker})`);
    glow.addColorStop(1, "rgba(255,240,180,0)");
    ctx.fillStyle = glow; ctx.fillRect(lx - 80, 0, 160, 120);
  }
  // Sign
  ctx.fillStyle = "#000"; ctx.fillRect(w / 2 - 70, 90, 140, 40);
  ctx.fillStyle = "#ffcc00"; ctx.font = "bold 18px monospace";
  ctx.fillText("SUBWAY", w / 2 - 40, 117);
  // Tracks
  ctx.fillStyle = "#3a2a1a"; ctx.fillRect(0, h - 30, w, 30);
  ctx.strokeStyle = "#999"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, h - 20); ctx.lineTo(w, h - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, h - 8); ctx.lineTo(w, h - 8); ctx.stroke();
};

const drawBridge: StageDef["draw"] = (ctx, w, h, t) => {
  // Night sky with stars
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#050818"); sky.addColorStop(1, "#1a2a44");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
  // Stars
  ctx.fillStyle = "#ffffff";
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137) % w;
    const sy = (i * 71) % (h * 0.6);
    ctx.globalAlpha = 0.4 + Math.sin(t * 0.05 + i) * 0.3;
    ctx.fillRect(sx, sy, 2, 2);
  }
  ctx.globalAlpha = 1;
  // Moon
  ctx.fillStyle = "#f0f0d0";
  ctx.beginPath(); ctx.arc(w * 0.85, 70, 30, 0, Math.PI * 2); ctx.fill();
  // Water reflection
  const water = ctx.createLinearGradient(0, h - 100, 0, h - 30);
  water.addColorStop(0, "#0a1a35"); water.addColorStop(1, "#142a4a");
  ctx.fillStyle = water; ctx.fillRect(0, h - 100, w, 70);
  // Wave shimmer
  ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const wy = h - 90 + i * 10;
    ctx.beginPath();
    ctx.moveTo(0, wy + Math.sin(t * 0.05 + i) * 2);
    for (let x = 0; x < w; x += 20) ctx.lineTo(x, wy + Math.sin(t * 0.05 + i + x * 0.05) * 2);
    ctx.stroke();
  }
  // Bridge cables
  ctx.strokeStyle = "#cc3333"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, h - 100); ctx.quadraticCurveTo(w / 2, 40, w, h - 100); ctx.stroke();
  ctx.lineWidth = 1;
  for (let i = 0; i < 30; i++) {
    const x = (i / 30) * w;
    const cableY = -((x - w / 2) ** 2) / (w * w / 4) * (h - 140) + (h - 100);
    ctx.beginPath(); ctx.moveTo(x, cableY); ctx.lineTo(x, h - 100); ctx.stroke();
  }
  // Towers
  ctx.fillStyle = "#aa2222";
  ctx.fillRect(60, 30, 30, h - 130); ctx.fillRect(w - 90, 30, 30, h - 130);
  // Bridge deck
  ctx.fillStyle = "#3a1a1a"; ctx.fillRect(0, h - 100, w, 70);
  ctx.fillStyle = "#5a2a2a"; ctx.fillRect(0, h - 100, w, 4);
  // Road lines
  ctx.fillStyle = "#ffd700";
  for (let x = 0; x < w; x += 60) ctx.fillRect(x, h - 60, 30, 3);
  ctx.fillStyle = "#1a0a0a"; ctx.fillRect(0, h - 30, w, 30);
};

export const STAGES: StageDef[] = [
  { id: "city", name: "City Skyline", description: "Classic NYC night skyline", draw: drawCity },
  { id: "rooftop", name: "Rooftop Sunset", description: "Battle on a high-rise rooftop at dusk", draw: drawRooftop },
  { id: "subway", name: "Subway Station", description: "Underground tile platform with flickering lights", draw: drawSubway },
  { id: "bridge", name: "Bridge", description: "Suspension bridge under the moonlight", draw: drawBridge },
];

export const getStage = (id: string): StageDef => STAGES.find(s => s.id === id) ?? STAGES[0];
