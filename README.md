<div align="center">

<img src="https://img.shields.io/badge/YouTube-Playables-FF0000?style=for-the-badge&logo=youtube&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Web_Audio_API-Synthesized-orange?style=for-the-badge&logo=googlechrome&logoColor=white" />

<br /><br />

# 🕷️ Spider-Man: Fighting Arena

### A fast-paced 2D browser fighting game — built for **YouTube Playables**

Play directly inside YouTube. Choose your hero, battle AI opponents across iconic NYC stages, and climb the global leaderboard with your best score.

<br />

[**▶ Play on YouTube**](https://youtube.com) &nbsp;·&nbsp; [**📖 SDK Docs**](https://developers.google.com/youtube/gaming/playables/reference/sdk) &nbsp;·&nbsp; [**🧪 Test Suite**](https://developers.google.com/youtube/gaming/playables/test_suite) &nbsp;·&nbsp; [**📋 Publishing Requirements**](https://developers.google.com/youtube/gaming/playables/certification/requirements)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| 🥊 **2D Fighting Engine** | Frame-based physics, combos, blocking, knockback, special attacks |
| 🎭 **Character Roster** | Multiple fighters each with unique stats, colors & special moves |
| 🏙️ **4 NYC Stages** | City, Rooftop, Subway, Bridge — each with ambient music |
| 🎵 **Procedural Audio** | Real-time Web Audio API synthesis — no audio files required |
| 📱 **Mobile Ready** | Full touch controls optimized for handheld play |
| 🤖 **AI Difficulty** | Easy / Normal / Hard AI with smart blocking and combo chaining |
| 🏋️ **Training Mode** | Practice combos against a configurable dummy opponent |
| ☁️ **Cloud Save** | Progress, win streaks & best score synced via YouTube cloud save |
| 🏆 **Leaderboards** | Best score reported to YouTube's global leaderboard system |
| 📺 **Ads Monetization** | Interstitial & rewarded ads integrated for YouTube revenue sharing |

---

## 🎮 Controls

<div align="center">

| Action | Keyboard | Mobile |
|---|---|---|
| Move Left / Right | `A` / `D` or `←` / `→` | Left D-pad |
| Jump | `W` or `↑` | Up D-pad |
| Block | `S` or `↓` | Block button |
| Punch | `J` | Punch button |
| Kick | `K` | Kick button |
| Web Shot | `L` | Web button |
| Special Attack | `Space` | Special button |

</div>

---

## 📺 YouTube Playables SDK Integration

This game fully implements the **YouTube Playables SDK v1** — all required and recommended APIs are covered.

### ✅ Required Integrations

| API | Implementation | File |
|---|---|---|
| `ytgame.game.firstFrameReady()` | Called on first component render | `FightingGame.tsx` |
| `ytgame.game.gameReady()` | Called when menu/select screen is interactive | `FightingGame.tsx` |
| `ytgame.IN_PLAYABLES_ENV` | Environment detection for all conditional features | `youtubePlayables.ts` |
| `ytgame.system.isAudioEnabled()` | Initializes Web Audio state from YouTube settings | `useSoundEngine.ts` |
| `ytgame.system.onAudioEnabledChange()` | Suspends/resumes AudioContext on toggle | `useSoundEngine.ts` |
| `ytgame.system.onPause()` | Pauses game loop and audio on YouTube pause | `useGameEngine.ts` + `useSoundEngine.ts` |
| `ytgame.system.onResume()` | Resumes game loop and audio on YouTube resume | `useGameEngine.ts` + `useSoundEngine.ts` |
| `ytgame.game.loadData()` | Loads cloud save on game start | `useGameEngine.ts` |
| `ytgame.game.saveData()` | Saves stats to cloud on match end | `useGameEngine.ts` |

### ⭐ Recommended Integrations

| API | Implementation | File |
|---|---|---|
| `ytgame.engagement.sendScore()` | Reports best match score to YouTube leaderboard | `useGameEngine.ts` |
| `ytgame.engagement.openYTContent()` | Available via `openYTContent()` helper | `youtubePlayables.ts` |
| `ytgame.system.getLanguage()` | Available via `getLanguage()` helper for i18n | `youtubePlayables.ts` |
| `ytgame.health.logError()` | All SDK errors forwarded to YouTube health telemetry | `youtubePlayables.ts` |
| `ytgame.health.logWarning()` | Warnings reported for debugging | `youtubePlayables.ts` |
| `ytgame.ads.requestInterstitialAd()` | Shown at natural breakpoint (match end → menu) | `FightingGame.tsx` |
| `ytgame.ads.requestRewardedAd()` | "Revive Fighter" & "Recharge Special" reward flows | `FightingGame.tsx` |

### 🔑 Reward IDs

Per YouTube policy, reward IDs are stable, unique, and contain no user data:

```ts
// src/lib/youtubePlayables.ts
export const REWARD_IDS = {
  REVIVE_FIGHTER:  'revive-fighter-full-health-v1',
  SPECIAL_ENERGY:  'special-energy-full-charge-v1',
};
```

### 🛡️ SDK Architecture

```
index.html
├── <script src="https://www.youtube.com/game_api/v1"></script>  ← FIRST (required)
└── <script type="module" src="/src/main.tsx"></script>

src/lib/youtubePlayables.ts   ← Resilient SDK wrapper (graceful fallbacks)
src/types/ytgame.d.ts          ← Official TypeScript definitions
src/hooks/useSoundEngine.ts    ← Audio SDK integration
src/hooks/useGameEngine.ts     ← Lifecycle, save/load, score, pause/resume
src/components/FightingGame.tsx ← firstFrameReady, gameReady, ads UI
```

> **All SDK APIs degrade gracefully** — the game works identically in a regular browser during development. No environment check is needed before every call.

---

## 💰 Monetization

YouTube handles **pre-roll ads automatically**. The game additionally integrates:

### Interstitial Ads
Triggered at the natural breakpoint of returning to the menu after a completed match:
```ts
// FightingGame.tsx
await requestInterstitialAd();
goToSelect();
```

### Rewarded Ads
Two player-initiated rewarded experiences:

| Reward | Trigger | Reward ID |
|---|---|---|
| 🩸 **Revive Fighter** | Shown on Defeat screen — watch to continue | `revive-fighter-full-health-v1` |
| ⚡ **Recharge Special** | Shown mid-fight when special is on cooldown | `special-energy-full-charge-v1` |

```ts
// Request a rewarded ad
const earned = await requestRewardedAd(REWARD_IDS.REVIVE_FIGHTER);
if (earned) revivePlayer();
```

---

## ☁️ Cloud Save

Game stats are persisted via YouTube cloud save (falls back to `localStorage` in dev):

```ts
interface GameSaveData {
  bestScore:         number;  // Reported to YouTube leaderboard
  totalWins:         number;
  totalMatches:      number;
  winStreak:         number;
  preferredCharacter?: string;
  preferredStage?:   string;
  version:           number;
}
```

Save data is **automatically loaded on startup** and **saved after every match**.

---

## 🧪 Test Suite & CSP Setup

To validate your integration locally using the [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite):

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Set up Chrome DevTools Local Overrides** for your `index.html` response headers ([guide](https://developer.chrome.com/docs/devtools/overrides)):

3. **Override the `Content-Security-Policy` header** with:
   ```
   default-src 'none'; script-src 'report-sample' 'self' 'unsafe-eval' 'unsafe-inline' blob: https://www.youtube.com/game_api/v0 https://www.youtube.com/game_api/v0/ https://www.youtube.com/game_api/v1 https://www.youtube.com/game_api/v1/; object-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data:; media-src 'self' blob:; font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' blob: data:; sandbox allow-pointer-lock allow-same-origin allow-scripts; base-uri 'self'; manifest-src 'self'; worker-src 'self' blob:
   ```

4. **Open the [Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite)** and point it at your local URL.

---

## 🏗️ Architecture

```
game-maker-studio/
├── index.html                     # SDK script loaded first (REQUIRED)
├── src/
│   ├── components/
│   │   ├── FightingGame.tsx       # Main game orchestrator + YT lifecycle
│   │   ├── GameCanvas.tsx         # Canvas renderer
│   │   ├── GameHUD.tsx            # Health bars, timer, round info
│   │   ├── CharacterSelect.tsx    # Character + stage picker
│   │   ├── TouchControls.tsx      # Mobile touch controls
│   │   └── ComboOverlay.tsx       # Animated combo text
│   ├── hooks/
│   │   ├── useGameEngine.ts       # Physics loop, AI, save/load, score
│   │   └── useSoundEngine.ts      # Web Audio synthesis + YT audio sync
│   ├── lib/
│   │   ├── youtubePlayables.ts    # ★ YouTube Playables SDK wrapper
│   │   ├── characters.ts          # Character definitions
│   │   ├── stages.ts              # Stage definitions
│   │   └── specialAttacks.ts      # Special move data
│   └── types/
│       └── ytgame.d.ts            # Official SDK TypeScript types
├── package.json
└── vite.config.ts
```

---

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server (SDK runs as no-op locally)
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build

# Run tests
npm test
```

---

## 📄 License

MIT © [Rahul Kumar](https://github.com/Rahul08319)

---

<div align="center">

**Built with ❤️ for YouTube Playables**

<img src="https://img.shields.io/badge/Certified-YouTube_Playables-FF0000?style=flat-square&logo=youtube" />
&nbsp;
<img src="https://img.shields.io/badge/SDK-v1-brightgreen?style=flat-square" />

</div>
