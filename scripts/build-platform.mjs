import { spawn } from "node:child_process";

const targets = [
  "youtube", "facebook", "poki", "crazygames", "yandex", "gamedistribution", "discord",
  "jiogames", "y8", "lagged", "microsoft-store", "huawei-xiaomi", "msn-reddit",
];

const requested = process.argv[2] ?? "youtube";
const buildOne = (target) => new Promise((resolve, reject) => {
  const command = process.platform === "win32" ? "vite.cmd" : "vite";
  const child = spawn(command, ["build", "--outDir", `dist/${target}`], {
    stdio: "inherit",
    env: { ...process.env, VITE_GAME_PLATFORM: target },
  });
  child.on("error", reject);
  child.on("exit", code => code === 0 ? resolve() : reject(new Error(`${target} build exited with code ${code}`)));
});

if (requested === "--help" || requested === "-h") {
  console.log(`Usage: npm run build:platform -- <target>\nTargets: ${targets.join(", ")}\nUse npm run build:all-platforms for every target.`);
  process.exit(0);
}

if (requested !== "--all" && !targets.includes(requested)) {
  console.error(`Unknown platform "${requested}". Choose: ${targets.join(", ")}`);
  process.exit(1);
}

for (const target of requested === "--all" ? targets : [requested]) {
  console.log(`\n▸ Building Spider-Man Fighting Arena for ${target}`);
  await buildOne(target);
}