import { useGameEngine } from "@/hooks/useGameEngine";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { GameCanvas } from "@/components/GameCanvas";
import { GameHUD } from "@/components/GameHUD";
import { TouchControls } from "@/components/TouchControls";
import { CharacterSelect } from "@/components/CharacterSelect";
import { ComboOverlay } from "@/components/ComboOverlay";
import { CHARACTERS } from "@/lib/characters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef, useState } from "react";
import { getStage } from "@/lib/stages";
import { applyYouTubeLanguage, loadProgress, saveProgress, submitBestScore, subscribeToPlayablesSystem, type SavedProgress } from "@/lib/playables";
import { COMBO_TRIALS, DAILY_CHALLENGE, DEFAULT_SETTINGS, STORY_ENDINGS, type GameMode } from "@/lib/gameModes";
import { reportPlatformScore, reportPlatformState } from "@/lib/platformTarget";

export function FightingGame() {
  const sound = useSoundEngine();
  const { startBGMusic, stopBGMusic, setAudioEnabled, setVolumes } = sound;
  const { gameState, goToSelect, selectCharacters, startTraining, nextRound, addKey, removeKey, setDummyBehavior, setAiDifficulty, isPaused, setPaused } = useGameEngine({
    onAttackHit: sound.playAttackSound,
    onBlock: sound.playBlock,
    onKO: sound.playKO,
    onRoundWin: sound.playRoundWin,
  });
  const isMobile = useIsMobile();
  const [progress, setProgress] = useState<SavedProgress>({ version: 2, bestScore: 0, victories: 0, achievements: [], matchHistory: [], dailyScores: {}, settings: DEFAULT_SETTINGS });
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [showSettings, setShowSettings] = useState(false);
  const progressRef = useRef(progress);
  const gameStateRef = useRef(gameState);
  const completedMatchRef = useRef<string | null>(null);
  progressRef.current = progress;
  gameStateRef.current = gameState;

  useEffect(() => {
    void loadProgress().then(loaded => setProgress(current => {
      const settingsChanged = JSON.stringify(current.settings) !== JSON.stringify(DEFAULT_SETTINGS);
      const hasLocalProgress = current.bestScore > 0 || current.victories > 0 || current.achievements.length > 0 || current.matchHistory.length > 0 || settingsChanged;
      if (!hasLocalProgress) return loaded;
      return {
        ...loaded,
        bestScore: Math.max(loaded.bestScore, current.bestScore),
        victories: Math.max(loaded.victories, current.victories),
        achievements: Array.from(new Set([...loaded.achievements, ...current.achievements])),
        matchHistory: [...current.matchHistory, ...loaded.matchHistory].slice(0, 12),
        dailyScores: { ...loaded.dailyScores, ...current.dailyScores },
        settings: settingsChanged ? current.settings : loaded.settings,
      };
    }));
    void applyYouTubeLanguage();
    return subscribeToPlayablesSystem({
      onAudioEnabledChange: setAudioEnabled,
      onPause: () => { setPaused(true); stopBGMusic(); void saveProgress(progressRef.current); },
      onResume: () => {
        setPaused(false);
        const current = gameStateRef.current;
        if (current.gameStatus === "playing" || current.gameStatus === "training") startBGMusic(current.stageId);
      },
    });
  // Playables subscriptions are installed once for this game session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameState.gameStatus === "playing" || gameState.gameStatus === "training") {
      startBGMusic(gameState.stageId);
    } else if (gameState.gameStatus === "menu" || gameState.gameStatus === "win" || gameState.gameStatus === "lose") {
      stopBGMusic();
    }
  }, [gameState.gameStatus, gameState.stageId, startBGMusic, stopBGMusic]);

  useEffect(() => reportPlatformState(gameState.gameStatus), [gameState.gameStatus]);

  useEffect(() => {
    setVolumes(progress.settings.musicVolume / 100, progress.settings.effectsVolume / 100);
  }, [progress.settings.musicVolume, progress.settings.effectsVolume, setVolumes]);

  useEffect(() => {
    if (progress.settings.haptics && gameState.player.combo > 0 && "vibrate" in navigator) navigator.vibrate(12);
  }, [gameState.player.combo, progress.settings.haptics]);

  useEffect(() => {
    if (gameState.gameStatus === "select" || gameState.gameStatus === "menu") completedMatchRef.current = null;
  }, [gameState.gameStatus]);

  useEffect(() => {
    if (gameState.gameStatus !== "win" && gameState.gameStatus !== "lose") return;
    const matchId = `${gameState.gameStatus}:${gameState.round}:${gameState.playerRoundWins}:${gameState.enemyRoundWins}:${gameState.timer}`;
    if (completedMatchRef.current === matchId) return;
    completedMatchRef.current = matchId;
    const score = gameState.gameStatus === "win"
      ? gameState.playerRoundWins * 10_000 + gameState.timer * 100 + gameState.player.health
      : 0;
    const previous = progressRef.current;
    const didWin = gameState.gameStatus === "win";
    const next: SavedProgress = {
      ...previous,
      version: 2,
      bestScore: Math.max(previous.bestScore, score),
      victories: previous.victories + (didWin ? 1 : 0),
      achievements: Array.from(new Set([...previous.achievements, didWin ? "first-victory" : "first-fight"])),
      matchHistory: [{ opponent: gameState.enemy.name, result: didWin ? "win" : "loss", score, mode: gameState.gameMode, playedAt: new Date().toISOString() }, ...previous.matchHistory].slice(0, 12),
      dailyScores: gameState.gameMode === "daily" ? { ...previous.dailyScores, [DAILY_CHALLENGE.id]: Math.max(previous.dailyScores[DAILY_CHALLENGE.id] ?? 0, score) } : previous.dailyScores,
    };
    progressRef.current = next;
    setProgress(next);
    void saveProgress(next);
    reportPlatformScore(score);
    if (score > previous.bestScore) void submitBestScore(score);
  }, [gameState.enemyRoundWins, gameState.gameStatus, gameState.player.health, gameState.playerRoundWins, gameState.round, gameState.timer]);

  useEffect(() => {
    (window as Window & { render_game_to_text?: () => string }).render_game_to_text = () => JSON.stringify({
      coordinateSystem: "arena origin is top-left; x grows right and y grows down",
      mode: gameState.gameMode,
      status: gameState.gameStatus,
      player: { name: gameState.player.name, x: gameState.player.x, y: gameState.player.y, health: gameState.player.health, combo: gameState.player.combo },
      enemy: { name: gameState.enemy.name, x: gameState.enemy.x, y: gameState.enemy.y, health: gameState.enemy.health },
      timer: gameState.timer,
      paused: isPaused,
    });
  }, [gameState, isPaused]);
  const activeTrial = COMBO_TRIALS.find(trial => !progress.achievements.includes(trial.id)) ?? COMBO_TRIALS[COMBO_TRIALS.length - 1];

  useEffect(() => {
    if (gameState.gameMode !== "trials" || gameState.player.combo < activeTrial.target || progress.achievements.includes(activeTrial.id)) return;
    const next = { ...progressRef.current, achievements: [...progressRef.current.achievements, activeTrial.id] };
    progressRef.current = next; setProgress(next); void saveProgress(next);
  }, [activeTrial, gameState.gameMode, gameState.player.combo, progress.achievements]);

  return (
    <div className={`arena-shell min-h-screen bg-background flex flex-col items-center justify-center p-4 ${isPaused ? "pointer-events-none" : ""} ${progress.settings.largeText ? "text-lg" : ""} ${progress.settings.highContrast ? "accessibility-high-contrast" : ""} ${progress.settings.reducedMotion ? "reduce-motion" : ""}`}>
      {gameState.gameStatus === "menu" && (
        <div className="arena-menu text-center space-y-6">
          <h1 className="arena-title font-display text-5xl md:text-7xl text-spider-red text-shadow-comic tracking-wide">
            SPIDER-MAN
          </h1>
          <p className="arena-subtitle font-display text-2xl md:text-4xl text-foreground text-shadow-comic tracking-wider">
            FIGHTING ARENA
          </p>
          {progress.bestScore > 0 && <p className="font-game text-accent text-sm tracking-widest">BEST SCORE {progress.bestScore}</p>}
          <div className="mode-grid grid grid-cols-2 gap-3 max-w-xl mx-auto">
            <button onClick={() => { setSelectedMode("arcade"); sound.playMenuSelect(); goToSelect(); }} className="mode-card font-game p-3 rounded border border-accent text-accent">ARCADE STORY</button>
            <button onClick={() => { setSelectedMode("versus"); sound.playMenuSelect(); goToSelect(); }} className="mode-card font-game p-3 rounded border border-secondary text-secondary">LOCAL VERSUS</button>
            <button onClick={() => { setSelectedMode("daily"); setAiDifficulty("hard"); selectCharacters(CHARACTERS.find(c => c.id === DAILY_CHALLENGE.playerId)!, CHARACTERS.find(c => c.id === DAILY_CHALLENGE.enemyId)!, DAILY_CHALLENGE.stageId, "daily"); }} className="mode-card font-game p-3 rounded border border-spider-red text-spider-red">DAILY CHALLENGE</button>
            <button onClick={() => { setSelectedMode("tutorial"); sound.playMenuSelect(); goToSelect(true); }} className="mode-card font-game p-3 rounded border border-border">TUTORIAL</button>
            <button onClick={() => { setSelectedMode("trials"); sound.playMenuSelect(); goToSelect(true); }} className="mode-card font-game p-3 rounded border border-border">COMBO TRIALS</button>
            <button onClick={() => setShowSettings(value => !value)} className="mode-card font-game p-3 rounded border border-border">SETTINGS</button>
          </div>
          {showSettings && <div className="max-w-md mx-auto rounded border border-border bg-card p-3 text-left space-y-2 font-game text-sm">
            <p className="text-accent">ACCESSIBILITY & CONTROLS</p>
            {(["reducedMotion", "highContrast", "largeText", "haptics"] as const).map(key => <label key={key} className="flex justify-between gap-3"><span>{key.replace(/([A-Z])/g, " $1")}</span><input type="checkbox" checked={progress.settings[key]} onChange={() => { const next = { ...progress, settings: { ...progress.settings, [key]: !progress.settings[key] } }; setProgress(next); void saveProgress(next); }} /></label>)}
            <label className="flex justify-between gap-3"><span>TOUCH</span><select value={progress.settings.touchLayout} onChange={e => { const next = { ...progress, settings: { ...progress.settings, touchLayout: e.target.value as "classic" | "compact" } }; setProgress(next); void saveProgress(next); }}><option value="classic">Classic</option><option value="compact">Compact</option></select></label>
            <label className="flex justify-between gap-3"><span>MUSIC</span><input type="range" min="0" max="100" value={progress.settings.musicVolume} onChange={e => { const next = { ...progress, settings: { ...progress.settings, musicVolume: Number(e.target.value) } }; setProgress(next); void saveProgress(next); }} /></label>
            <label className="flex justify-between gap-3"><span>SFX</span><input type="range" min="0" max="100" value={progress.settings.effectsVolume} onChange={e => { const next = { ...progress, settings: { ...progress.settings, effectsVolume: Number(e.target.value) } }; setProgress(next); void saveProgress(next); }} /></label>
            <p className="text-muted-foreground">Player 1: WASD + J/K/L, H throw, P parry. Player 2: numpad 4/6/8 move, 5 block, 1/2/3 attacks, 7 throw, 9 parry, 0 special.</p>
          </div>}
          <button
            onClick={() => { sound.playMenuSelect(); goToSelect(); }}
            className="primary-play font-display text-2xl tracking-wider px-10 py-4 bg-primary text-primary-foreground rounded-lg shadow-glow-red hover:scale-105 transition-transform border-2 border-spider-red/50"
          >
            START FIGHT
          </button>
          <button
            onClick={() => { sound.playMenuSelect(); goToSelect(true); }}
            className="font-display text-xl tracking-wider px-8 py-3 bg-muted text-accent rounded-lg hover:scale-105 transition-transform border-2 border-accent/30"
          >
            TRAINING MODE
          </button>
          <div className="space-y-2 mt-8">
            <p className="font-game text-muted-foreground text-sm">CONTROLS</p>
            <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-sm font-game text-foreground/70 max-w-sm mx-auto">
              <span className="text-right text-accent">WASD / Arrows</span>
              <span className="text-left">Move / Jump</span>
              <span className="text-right text-accent">J</span>
              <span className="text-left">Punch</span>
              <span className="text-right text-accent">K</span>
              <span className="text-left">Kick</span>
              <span className="text-right text-accent">L</span>
              <span className="text-left">Web Shot</span>
              <span className="text-right text-accent">Space</span>
              <span className="text-left">Special Attack</span>
              <span className="text-right text-accent">S / Down</span>
              <span className="text-left">Block</span>
            </div>
            {isMobile && (
              <p className="font-game text-accent text-xs mt-2">Touch controls available on mobile!</p>
            )}
          </div>
        </div>
      )}

      {gameState.gameStatus === "select" && (
        <CharacterSelect
          characters={CHARACTERS}
          onSelect={(p, e, stageId) => {
            sound.playMenuSelect();
            if (gameState.isTraining || selectedMode === "tutorial" || selectedMode === "trials") startTraining(p, e, stageId, selectedMode === "classic" ? "tutorial" : selectedMode);
            else selectCharacters(p, e, stageId, selectedMode);
          }}
        />
      )}

      {(gameState.gameStatus === "playing" || gameState.gameStatus === "training") && (
        <div className="space-y-2 w-full flex flex-col items-center">
          <GameHUD gameState={gameState} stageName={getStage(gameState.stageId).name} />
          {gameState.isTraining && (
            <div className="flex flex-wrap items-center justify-center gap-3 px-3 py-2 rounded-lg border border-accent/30 bg-card/50">
              <span className="font-display text-accent text-sm tracking-wider animate-pulse">⚡ {gameState.gameMode === "trials" ? `${activeTrial.name}: ${gameState.player.combo}/${activeTrial.target}` : gameState.gameMode === "tutorial" ? "TUTORIAL — move, block, then attack" : `TRAINING — COMBO: ${gameState.player.combo}`}</span>
              <div className="flex items-center gap-1">
                <span className="font-game text-[10px] text-muted-foreground tracking-widest">DUMMY</span>
                {(["idle", "block", "attack"] as const).map(b => (
                  <button
                    key={b}
                    onClick={() => setDummyBehavior(b)}
                    className={`font-game text-[10px] px-2 py-1 rounded border tracking-wider uppercase transition-colors ${
                      gameState.dummyBehavior === b
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-muted text-muted-foreground border-border hover:border-accent"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-game text-[10px] text-muted-foreground tracking-widest">AI</span>
                {(["easy", "normal", "hard"] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setAiDifficulty(d)}
                    className={`font-game text-[10px] px-2 py-1 rounded border tracking-wider uppercase transition-colors ${
                      gameState.aiDifficulty === d
                        ? "bg-spider-red text-primary-foreground border-spider-red"
                        : "bg-muted text-muted-foreground border-border hover:border-spider-red"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button
                onClick={() => goToSelect(false)}
                className="font-game text-xs px-3 py-1 bg-muted text-muted-foreground rounded border border-border hover:scale-105 transition-transform"
              >
                CHANGE FIGHTER
              </button>
            </div>
          )}
          <div className="relative w-full max-w-[800px]">
            <GameCanvas gameState={gameState} isPaused={isPaused} />
            <ComboOverlay characterSprite={gameState.player.sprite} />
          </div>
          {isMobile && <TouchControls onKeyDown={addKey} onKeyUp={removeKey} layout={progress.settings.touchLayout} />}
        </div>
      )}

      {gameState.gameStatus === "roundEnd" && (
        <div className="text-center space-y-6">
          <div className="font-display text-4xl md:text-5xl text-accent text-shadow-comic tracking-wider">
            {gameState.roundMessage}
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="font-display text-2xl text-spider-red">{gameState.player.name}: {gameState.playerRoundWins}</div>
            <div className="font-display text-2xl text-foreground">{gameState.enemy.name}: {gameState.enemyRoundWins}</div>
          </div>
          <button
            onClick={() => { sound.playMenuSelect(); nextRound(); }}
            className="font-display text-xl tracking-wider px-8 py-3 bg-primary text-primary-foreground rounded-lg shadow-glow-red hover:scale-105 transition-transform border-2 border-spider-red/50"
          >
            NEXT ROUND
          </button>
        </div>
      )}

      {(gameState.gameStatus === "win" || gameState.gameStatus === "lose") && (
        <div className="text-center space-y-6">
          <div className="font-display text-5xl md:text-6xl text-shadow-comic tracking-wider">
            {gameState.gameStatus === "win" ? (
              <span className="text-game-combo">{gameState.player.name} WINS!</span>
            ) : (
              <span className="text-game-ko">{gameState.enemy.name} WINS!</span>
            )}
          </div>
          <p className="font-display text-3xl text-foreground/60 text-shadow-comic">K.O.</p>
          <div className="flex items-center justify-center gap-6">
            <div className="font-display text-xl text-spider-red">{gameState.playerRoundWins} rounds</div>
            <div className="font-display text-xl text-foreground">{gameState.enemyRoundWins} rounds</div>
          </div>
          {gameState.gameStatus === "win" && (
            <>
              <p className="font-game text-accent tracking-widest">MATCH SCORE {gameState.playerRoundWins * 10_000 + gameState.timer * 100 + gameState.player.health} · BEST {progress.bestScore}</p>
              {gameState.gameMode === "arcade" && <p className="font-game max-w-md mx-auto text-muted-foreground">{STORY_ENDINGS[gameState.player.sprite]}</p>}
              {gameState.gameMode === "daily" && <p className="font-game text-spider-red">DAILY CHALLENGE COMPLETE — {DAILY_CHALLENGE.label}</p>}
            </>
          )}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => { sound.playMenuSelect(); goToSelect(); }}
              className="font-display text-lg tracking-wider px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:scale-105 transition-transform border border-border"
            >
              NEW FIGHT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
