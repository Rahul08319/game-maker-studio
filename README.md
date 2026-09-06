# Spider-Man Fighting Arena

A fast, browser-based 2D fighting game built with React, TypeScript, Vite, and Canvas. Choose a fighter, master specials and parries, then battle through arcade, training, daily, or local-versus modes.

> Designed for the YouTube Playables environment. Ads and monetization APIs are intentionally not included.

## Highlights

- Seven playable fighters, unique specials, four hand-drawn canvas stages, and adaptive AI.
- Arcade Story, Daily Challenge, Tutorial, Combo Trials, Training, and local two-player versus.
- Combat controls include attacks, blocks, air attacks, throws, specials, and timed parries.
- Saved best score, match history, achievements, daily scores, and player settings.
- Responsive high-DPI canvas and mobile touch controls, with compact-layout support.
- Accessibility options for reduced motion, higher contrast, larger text, and haptics.

## Controls

| Player | Move / jump | Block | Attacks | Throw / parry | Special |
| --- | --- | --- | --- | --- | --- |
| Player 1 | `WASD` or arrows | `S` / Down | `J`, `K`, `L` | `H` / `P` | Space |
| Player 2 | Numpad `4`, `6`, `8` | Numpad `5` | Numpad `1`, `2`, `3` | Numpad `7` / `9` | Numpad `0` |

Use a jump plus an attack for aerial attacks. Local-versus is deliberately offline-first; it needs no external multiplayer service and is suitable for YouTube Playables.

## YouTube Playables support

The app loads the Playables SDK before the game module and includes:

- `firstFrameReady()` and `gameReady()` lifecycle notifications.
- Cloud save/load when it runs inside Playables, with local storage fallback for normal browser development.
- YouTube-managed audio mute, pause/resume, locale, health telemetry, and score submission.
- Responsive layout across portrait, landscape, and ultra-wide viewports.
- A local CSP header in Vite matching the Playables test guidance.

Before release, validate the built game using the [YouTube Playables Test Suite](https://developers.google.com/youtube/gaming/playables/test_suite) while signed in to the appropriate developer account.

## Run locally

```bash
npm ci
npm run dev
```

Then open the local URL reported by Vite. To create a production build and run unit tests:

```bash
npm run build
npm run test -- --run
```

## Project structure

- `src/components/` — menus, HUD, canvas renderer, character selection, and touch controls.
- `src/hooks/useGameEngine.ts` — combat loop, AI, local-versus input, and round state.
- `src/hooks/useSoundEngine.ts` — procedural music, SFX, and Playables-compliant audio controls.
- `src/lib/playables.ts` — YouTube SDK lifecycle, saves, language, score, pause, and audio bridge.
- `src/lib/gameModes.ts` — daily challenge, profile settings, match records, stories, and combo trials.

## Publishing checklist

1. Run the production build and test suite.
2. Test keyboard, mouse, touch, pause/resume, mute, save/load, and every game mode.
3. Test multiple viewports: narrow portrait, tablet, desktop, and ultra-wide.
4. Upload the built output to the YouTube Playables developer flow and run its Test Suite.
5. Provide required Playables metadata and artwork in the Developer Portal.

## License

Private project. Add a license before distributing the source.
