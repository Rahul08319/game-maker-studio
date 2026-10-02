<div align="center">

# 🕷️ SPIDER-MAN: FIGHTING ARENA
### Universal Multi-Platform Web Edition &bull; Apple Human Interface Design System

<p align="center">
  <img src="https://img.shields.io/badge/YouTube-Playables_Certified-FF0000?style=for-the-badge&logo=youtube&logoColor=white" />
  <img src="https://img.shields.io/badge/Facebook-Instant_Games-0084FF?style=for-the-badge&logo=facebook&logoColor=white" />
  <img src="https://img.shields.io/badge/Poki-SDK_v2-00D26A?style=for-the-badge&logo=googleplay&logoColor=white" />
  <img src="https://img.shields.io/badge/CrazyGames-SDK_v3-9A33FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Discord-Activities_SDK-5865F2?style=for-the-badge&logo=discord&logoColor=white" />
  <img src="https://img.shields.io/badge/Microsoft_Store-PWA_Certified-00A4EF?style=for-the-badge&logo=windows&logoColor=white" />
  <img src="https://img.shields.io/badge/Apple-Liquid_Glass_2025-000000?style=for-the-badge&logo=apple&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

<p align="center">
  <strong>100% Pure First-Party Integration — Zero Third-Party Aggregator SDKs (No Playgama)</strong>
  <br />
  A high-octane 2D web combat experience engineered with Apple's iconic <em>Liquid Glass</em> design language, precision frame physics, synthesized procedural audio, and instant runtime compatibility across 14+ world-class web gaming ecosystems.
</p>

[**🎮 Play Game**](https://github.com/Rahul08319/game-maker-studio) &nbsp;&bull;&nbsp; [**🍎 Apple Design System**](#-apple-design-system--bento-grid-architecture) &nbsp;&bull;&nbsp; [**🌐 Platform Matrix**](#-multi-platform-distribution-matrix) &nbsp;&bull;&nbsp; [**⌨️ Controls**](#️-controls--combat-moves) &nbsp;&bull;&nbsp; [**🚀 Quickstart**](#-developer-quickstart)

</div>

---

## 🍱 Apple Bento Grid Showcase

<table width="100%">
  <tr>
    <td width="60%" valign="top">
      <h3>⚡ 60 FPS Frame-Accurate Combat</h3>
      <p>Custom collision detection, directional velocity knockback, and cancelable attack strings tuned for responsive 60 FPS combat on both mobile touch and desktop.</p>
      <ul>
        <li><strong>Active Attack Window:</strong> 15-frame animation cycle with hit confirmation at frame 12</li>
        <li><strong>Multi-Hit Combos:</strong> Dynamic damage scaling and hit-stun multipliers</li>
        <li><strong>Tactical Blocking:</strong> 50% damage reduction + particle deflection</li>
      </ul>
    </td>
    <td width="40%" valign="top">
      <h3>🎶 Procedural Audio Synthesis</h3>
      <p>Built with Web Audio API oscillators, bandpass filters, and noise generators. Zero external sound assets needed.</p>
      <ul>
        <li>Adaptive stage-based synth progressions</li>
        <li>Dynamic pitch modulation for hits & web shots</li>
        <li>Full mute & YouTube system audio sync</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="40%" valign="top">
      <h3>🦸 7 Playable Marvel Champions</h3>
      <p>Balanced roster featuring signature combat styles, custom reach, and cinematic special moves:</p>
      <code>Spider-Man</code> &bull; <code>Venom</code> &bull; <code>Green Goblin</code> &bull; <code>Doc Ock</code> &bull; <code>Electro</code> &bull; <code>Sandman</code> &bull; <code>Black Cat</code>
    </td>
    <td width="60%" valign="top">
      <h3>🌐 Universal Multi-Platform Engine</h3>
      <p>Zero third-party wrapper dependencies. Pure first-party adapters for 14+ global stores:</p>
      <p>
        <kbd>YouTube Playables</kbd> &bull;
        <kbd>Facebook Instant</kbd> &bull;
        <kbd>Poki</kbd> &bull;
        <kbd>CrazyGames</kbd> &bull;
        <kbd>Yandex</kbd> &bull;
        <kbd>Discord</kbd> &bull;
        <kbd>JioGames</kbd> &bull;
        <kbd>Microsoft PWA</kbd> &bull;
        <kbd>Huawei</kbd> &bull;
        <kbd>Xiaomi</kbd> &bull;
        <kbd>Reddit</kbd>
      </p>
    </td>
  </tr>
</table>

---

## 🍎 Apple Design System & Bento Grid Architecture

The entire interface has been reimagined following **Apple's Human Interface Guidelines** and the **2025 Liquid Glass** material language:

```
┌────────────────────────────────────────────────────────────────────────┐
│  🕷️ Spider-Man: Fighting Arena   [● YouTube Playables ▼]   [🏆 24,800]  │  ← Ultra-thin frosted global bar (44px)
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│     ┌───────────────────────────────────────────────────────────┐      │
│     │               SPIDER-MAN: FIGHTING ARENA                  │      │  ← Liquid Glass tile:
│     │                                                           │      │    • backdrop-filter: blur(24px)
│     │        [ START FIGHT ]            [ TRAINING MODE ]       │      │    • specular rim highlight
│     │                                                           │      │    • Action Blue & Red pill buttons
│     └───────────────────────────────────────────────────────────┘      │
│                                                                        │
│     ┌──────────────────────────────┬────────────────────────────┐      │
│     │   60 FPS COMBAT ENGINE       │   PROCEDURAL AUDIO SYNTH   │      │  ← Apple Bento Grid Showcase
│     ├──────────────────────────────┼────────────────────────────┤      │
│     │   7 MARVEL CHAMPIONS         │   14+ GAMING ECOSYSTEMS    │      │
│     └──────────────────────────────┴────────────────────────────┘      │
└────────────────────────────────────────────────────────────────────────┘
```

- **Liquid Glass Materials**: Real-time multi-layered translucent glass with `backdrop-filter: blur(24px) saturate(190%)`, specular inner highlights (`inset 0 1px 0 rgba(255, 255, 255, 0.18)`), and soft drop shadows.
- **Apple Typography**: Set in **SF Pro Display** with Apple's signature negative tracking (`letter-spacing: -0.028em`) for bold display headlines and relaxed leading for scannability.
- **Continuous-Curvature Squircles**: Character selection cards and portraits feature G2 continuous-curvature squircles (`corner-shape: squircle` / 22.5% radius).
- **Spring Physics Animations**: Buttons, HUD badges, and modals use natural Apple spring curves (`cubic-bezier(0.34, 1.56, 0.64, 1)`) with `transform: scale(0.95)` tactile active states.
- **Offline PWA & Badging**: Native Service Worker (`public/sw.js`) and Web App Manifest (`public/manifest.json`) supporting Windows notifications and `navigator.setAppBadge()`.
- **Accessibility & Reduced Motion**: Automatically honors `@media (prefers-reduced-motion: reduce)` by disabling intensive transforms and replacing backdrop filters with high-contrast surfaces.

---

## 🌐 Multi-Platform Distribution Matrix

Every platform adapter implements the unified, strongly typed `GamePlatform` interface (`src/lib/platforms/types.ts`) with intelligent environment auto-detection and resilient fallbacks:

| Platform | SDK Version | Lifecycle & Ads | Persistence | Score / Leaderboards |
|---|---|---|---|---|
| **YouTube Playables** | `game_api/v1` | `firstFrameReady()`, `gameReady()`, Interstitial, Rewarded | YouTube Cloud Save (3 MiB UTF-16) | `sendScore()` via YouTube UI |
| **Facebook Instant Games** | `FBInstant 6.3` | `startGameAsync()`, `setLoadingProgress()`, Interstitial, Rewarded | `FBInstant.player.setDataAsync()` | `FBInstant.context.getLeaderboardAsync()` |
| **Poki** | `PokiSDK v2` | `gameLoadingFinished()`, `commercialBreak()`, `rewardedBreak()` | Unified Storage + Local Fallback | Poki Gameplay State Flow |
| **CrazyGames** | `SDK v3` | `sdkGameLoadingStop()`, `requestAd('midgame' \| 'rewarded')` | Cloud Profile / Local Cache | CrazyGames User Experience API |
| **Yandex Games** | `YaGames SDK v2` | `GameplayAPI.start()`, `showFullscreenAdv()`, `showRewardedVideo()` | `ysdk.getStorage()` | `ysdk.getLeaderboards()` |
| **GameDistribution & MSN** | `GD API v1` | `gdsdk.showAd()` Interstitial & Rewarded Ads | Local Cloud Storage | MSN & GameDistribution Network |
| **Discord Activities** | Embedded SDK | Seamless Embedded PiP (`ACTIVITY_PIP_MODE_UPDATE`) | Activity Persistence | Discord Guild/Channel Sync |
| **JioGames** | `JioSDK` | STB & Mobile `gameReady()`, `showAd()` | Jio Cloud Storage | Regional High Scores |
| **Y8 Games** | `Y8 SDK` | Table Scoring, Interstitial Ads | Local Cloud Storage | Y8 Global HighScores API |
| **Lagged** | `LaggedAPI` | Direct Browser Integration | Local Cloud Storage | `LaggedAPI.Scores.save()` |
| **Microsoft Store (PWA)** | W3C Standard | Web App Manifest, Standalone Mode, Windows Notifications | IndexedDB + LocalStorage | `navigator.setAppBadge()` API |
| **Huawei Quick Games** | `hbs v1` | `createInterstitialAd()`, `createRewardedVideoAd()` | `hbs.storage` | Huawei Game Center Sync |
| **Xiaomi Quick Games** | `qg v1` | `createInterstitialAd()`, `createRewardedVideoAd()` | `qg.storage` | Quick App Runtime Sync |
| **Reddit Games** | Devvit Webview | Iframe postMessage Bidirectional Protocol | Devvit Storage | Reddit Post High Score Sync |

> 💡 **Runtime Platform Switcher**: You can test any target platform instantly by using the header dropdown or appending `?platform=<name>` to the URL (e.g. `?platform=youtube`, `?platform=facebook`, `?platform=poki`, `?platform=crazygames`).

---

## ⌨️ Controls & Combat Moves

<div align="center">

| Move | Desktop (Keyboard) | Mobile / Touch Screen | Description |
|:---:|:---:|:---:|---|
| **Move Left / Right** | `A` / `D` or `←` / `→` | Left Virtual Joystick | Agile footwork & tactical spacing |
| **Jump** | `W` or `↑` | Jump Button | Leap into the air for aerial dominance |
| **Block** | `S` or `↓` | Shield Button | Absorb incoming strikes & mitigate 50% damage |
| **Light Punch** | `J` | Punch Button | Rapid jab; ideal for initiating combos |
| **Heavy Kick** | `K` | Kick Button | High-damage strike with substantial knockback |
| **Web Shot** | `L` | Web Button | Long-range projectile; snags & immobilizes foes |
| **Ultimate Special** | `Spacebar` | Special Button | Cinematic signature attack with custom reach |

</div>

---

## 🏗️ Clean Project Architecture

```
game-maker-studio/
├── index.html                           # Root HTML launcher (YouTube Playables certified)
├── platform-templates/                  # Ready-to-deploy platform shells (14 platforms)
│   ├── index.youtube.html               # YouTube Playables shell
│   ├── index.facebook.html              # Facebook Instant Games shell
│   ├── index.poki.html                  # Poki SDK shell
│   ├── index.crazygames.html            # CrazyGames v3 shell
│   ├── index.yandex.html                # Yandex Games SDK shell
│   ├── index.gamedistribution.html      # GameDistribution & MSN shell
│   ├── index.discord.html               # Discord Activities shell
│   ├── index.jiogames.html              # JioGames shell
│   ├── index.y8.html                    # Y8 Games shell
│   ├── index.lagged.html                # Lagged shell
│   ├── index.pwa.html                   # Microsoft Store & PWA shell
│   ├── index.huawei.html                # Huawei Quick Games shell
│   ├── index.xiaomi.html                # Xiaomi Quick Games shell
│   └── index.reddit.html                # Reddit Devvit shell
├── public/
│   ├── manifest.json                    # PWA / Microsoft Store manifest
│   └── sw.js                            # Offline caching Service Worker
├── src/
│   ├── components/
│   │   ├── FightingGame.tsx             # Main orchestrator & Apple Bento showcase
│   │   ├── CharacterSelect.tsx          # Squircle character cards & stat meters
│   │   ├── GameCanvas.tsx               # High-DPI canvas battle renderer
│   │   ├── GameHUD.tsx                  # Liquid Glass dynamic health & combo bars
│   │   ├── StageSelect.tsx              # NYC battleground arena selector
│   │   └── TouchControls.tsx            # Apple circular glass touch controls
│   ├── hooks/
│   │   ├── useGameEngine.ts             # 60 FPS combat physics & AI state loop
│   │   └── useSoundEngine.ts            # Web Audio API real-time synthesis
│   └── lib/
│       ├── platforms/                   # 14+ Native Platform Adapters (No Playgama)
│       │   ├── types.ts                 # Unified GamePlatform interface
│       │   ├── index.ts                 # Auto-detector & singleton registry
│       │   ├── youtube.ts               # YouTube Playables adapter
│       │   ├── facebook.ts              # Facebook Instant Games adapter
│       │   ├── poki.ts                  # Poki Platform adapter
│       │   ├── crazygames.ts            # CrazyGames adapter
│       │   ├── yandex.ts                # Yandex Games adapter
│       │   ├── gamedistribution.ts      # GameDistribution / MSN adapter
│       │   ├── discord.ts               # Discord Activities adapter
│       │   ├── jiogames.ts              # JioGames adapter
│       │   ├── y8.ts                    # Y8 adapter
│       │   ├── lagged.ts                # Lagged adapter
│       │   ├── pwa.ts                   # Microsoft Store / PWA adapter
│       │   ├── huawei.ts                # Huawei Quick Games adapter
│       │   ├── xiaomi.ts                # Xiaomi Quick Games adapter
│       │   ├── reddit.ts                # Reddit Games Devvit adapter
│       │   └── base.ts                  # Universal fallback adapter
│       ├── characters.ts                # Fighter roster & statistics
│       ├── specialAttacks.ts            # Custom movesets & hitboxes
│       └── stages.ts                    # NYC Stage themes & color palettes
└── package.json
```

---

## 🚀 Developer Quickstart

```bash
# Clone the repository
git clone https://github.com/Rahul08319/game-maker-studio.git
cd game-maker-studio

# Install dependencies
npm install

# Run the dev server
npm run dev

# Run TypeScript type safety check (0 errors)
npm run type-check   # or: node node_modules/typescript/bin/tsc --noEmit

# Run Vitest test suite
npm run test

# Compile for production
npm run build
```

---

## 📄 License & Credits

Created by **Rahul Kumar** ([@Rahul08319](https://github.com/Rahul08319)).  
Licensed under the [MIT License](LICENSE).
Spider-Man and related characters are trademarks of Marvel Characters, Inc.
