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
import {
  firstFrameReady,
  gameReady,
  requestInterstitialAd,
  requestRewardedAd,
  REWARD_IDS,
  isInPlayables,
} from "@/lib/youtubePlayables";

export function FightingGame() {
  const sound = useSoundEngine();
  const {
    gameState,
    saveData,
    goToSelect,
    selectCharacters,
    startTraining,
    nextRound,
    revivePlayer,
    rechargeSpecial,
    addKey,
    removeKey,
    setDummyBehavior,
    setAiDifficulty,
  } = useGameEngine({
    onAttackHit: sound.playAttackSound,
    onBlock: sound.playBlock,
    onKO: sound.playKO,
    onRoundWin: sound.playRoundWin,
  });
  const isMobile = useIsMobile();

  // Track whether lifecycle signals have been sent
  const firstFrameSentRef = useRef(false);
  const gameReadySentRef = useRef(false);
  const [rewardLoading, setRewardLoading] = useState<"revive" | "special" | null>(null);
  const inPlayables = isInPlayables();

  // ---------------------------------------------------------------------------
  // YouTube Playables: firstFrameReady — REQUIRED
  // Called once when the component first renders (first visible frame)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!firstFrameSentRef.current) {
      firstFrameSentRef.current = true;
      firstFrameReady();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // YouTube Playables: gameReady — REQUIRED
  // Called when main menu or character select is interactive (no loading screen)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const status = gameState.gameStatus;
    if ((status === "menu" || status === "select") && !gameReadySentRef.current) {
      gameReadySentRef.current = true;
      gameReady();
    }
  }, [gameState.gameStatus]);

  // ---------------------------------------------------------------------------
  // Background music sync
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (gameState.gameStatus === "playing" || gameState.gameStatus === "training") {
      sound.startBGMusic(gameState.stageId);
    } else if (
      gameState.gameStatus === "menu" ||
      gameState.gameStatus === "win" ||
      gameState.gameStatus === "lose"
    ) {
      sound.stopBGMusic();
    }
  }, [gameState.gameStatus, gameState.stageId, sound]);

  // ---------------------------------------------------------------------------
  // Interstitial ad: shown when transitioning back to menu after a match
  // ---------------------------------------------------------------------------
  const handleReturnToMenu = async (training = false) => {
    sound.playMenuSelect();
    // Request interstitial at a natural breakpoint (match end → menu)
    await requestInterstitialAd();
    goToSelect(training);
  };

  // ---------------------------------------------------------------------------
  // Rewarded ad: Revive fighter
  // ---------------------------------------------------------------------------
  const handleReviveAd = async () => {
    setRewardLoading("revive");
    try {
      const earned = await requestRewardedAd(REWARD_IDS.REVIVE_FIGHTER);
      if (earned) {
        revivePlayer();
        sound.playRoundWin();
      }
    } finally {
      setRewardLoading(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Rewarded ad: Recharge special meter
  // ---------------------------------------------------------------------------
  const handleSpecialRechargeAd = async () => {
    setRewardLoading("special");
    try {
      const earned = await requestRewardedAd(REWARD_IDS.SPECIAL_ENERGY);
      if (earned) {
        rechargeSpecial();
        sound.playMenuSelect();
      }
    } finally {
      setRewardLoading(null);
    }
  };

  // ---------------------------------------------------------------------------
  // YouTube pause overlay
  // ---------------------------------------------------------------------------
  if (gameState.isYTPaused) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="font-display text-4xl text-accent animate-pulse">⏸ PAUSED</div>
          <p className="font-game text-muted-foreground text-sm">Game paused by YouTube</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">

      {/* ── MAIN MENU ── */}
      {gameState.gameStatus === "menu" && (
        <div className="text-center space-y-8">
          <h1 className="font-display text-5xl md:text-7xl text-spider-red text-shadow-comic tracking-wide">
            SPIDER-MAN
          </h1>
          <p className="font-display text-2xl md:text-4xl text-foreground text-shadow-comic tracking-wider">
            FIGHTING ARENA
          </p>

          {/* Stats badge (from cloud save) */}
          {(saveData.totalMatches > 0 || saveData.bestScore > 0) && (
            <div className="flex items-center justify-center gap-4 text-xs font-game text-muted-foreground">
              {saveData.bestScore > 0 && (
                <span className="px-3 py-1 rounded border border-accent/30 bg-card/50">
                  🏆 Best: <span className="text-accent">{saveData.bestScore.toLocaleString()}</span>
                </span>
              )}
              {saveData.totalWins > 0 && (
                <span className="px-3 py-1 rounded border border-spider-red/30 bg-card/50">
                  ⚔️ Wins: <span className="text-spider-red">{saveData.totalWins}</span>
                </span>
              )}
              {saveData.winStreak > 1 && (
                <span className="px-3 py-1 rounded border border-yellow-500/30 bg-card/50">
                  🔥 Streak: <span className="text-yellow-400">{saveData.winStreak}</span>
                </span>
              )}
            </div>
          )}

          <button
            onClick={() => { sound.playMenuSelect(); goToSelect(); }}
            className="font-display text-2xl tracking-wider px-10 py-4 bg-primary text-primary-foreground rounded-lg shadow-glow-red hover:scale-105 transition-transform border-2 border-spider-red/50"
          >
            START FIGHT
          </button>
          <button
            onClick={() => { sound.playMenuSelect(); goToSelect(true); }}
            className="font-display text-xl tracking-wider px-8 py-3 bg-muted text-accent rounded-lg hover:scale-105 transition-transform border-2 border-accent/30"
          >
            TRAINING MODE
          </button>

          {/* YouTube Playables badge */}
          {inPlayables && (
            <div className="flex items-center justify-center gap-2 text-xs font-game text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              PLAYING ON YOUTUBE
            </div>
          )}

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

      {/* ── CHARACTER SELECT ── */}
      {gameState.gameStatus === "select" && (
        <CharacterSelect
          characters={CHARACTERS}
          onSelect={(p, e, stageId) => {
            sound.playMenuSelect();
            if (gameState.isTraining) {
              startTraining(p, e, stageId);
            } else {
              selectCharacters(p, e, stageId);
            }
          }}
        />
      )}

      {/* ── PLAYING / TRAINING ── */}
      {(gameState.gameStatus === "playing" || gameState.gameStatus === "training") && (
        <div className="space-y-2 w-full flex flex-col items-center">
          <GameHUD gameState={gameState} stageName={getStage(gameState.stageId).name} />

          {/* Current match score display */}
          {gameState.matchScore > 0 && (
            <div className="font-game text-xs text-muted-foreground tracking-widest">
              SCORE <span className="text-accent">{gameState.matchScore.toLocaleString()}</span>
            </div>
          )}

          {gameState.isTraining && (
            <div className="flex flex-wrap items-center justify-center gap-3 px-3 py-2 rounded-lg border border-accent/30 bg-card/50">
              <span className="font-display text-accent text-sm tracking-wider animate-pulse">⚡ TRAINING — COMBO: {gameState.player.combo}</span>
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
                EXIT
              </button>
            </div>
          )}

          <div className="relative w-full max-w-[800px]">
            <GameCanvas gameState={gameState} />
            <ComboOverlay characterSprite={gameState.player.sprite} />
          </div>

          {/* Rewarded ad: recharge special during fight */}
          {inPlayables && gameState.player.specialCooldown > 180 && (
            <button
              onClick={handleSpecialRechargeAd}
              disabled={rewardLoading !== null}
              className="font-game text-xs px-4 py-2 bg-yellow-600/20 text-yellow-400 rounded border border-yellow-500/40 hover:bg-yellow-600/30 transition-colors disabled:opacity-50"
            >
              {rewardLoading === "special" ? "⏳ Loading Ad..." : "📺 Watch Ad → Recharge Special"}
            </button>
          )}

          {isMobile && <TouchControls onKeyDown={addKey} onKeyUp={removeKey} />}
        </div>
      )}

      {/* ── ROUND END ── */}
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

      {/* ── WIN ── */}
      {gameState.gameStatus === "win" && (
        <div className="text-center space-y-6">
          <div className="font-display text-5xl md:text-6xl text-shadow-comic tracking-wider">
            <span className="text-game-combo">{gameState.player.name} WINS!</span>
          </div>
          <p className="font-display text-3xl text-foreground/60 text-shadow-comic">K.O.</p>

          {/* Score display */}
          <div className="space-y-1">
            <div className="font-game text-sm text-muted-foreground">MATCH SCORE</div>
            <div className="font-display text-3xl text-accent">{gameState.matchScore.toLocaleString()}</div>
            {gameState.matchScore > 0 && saveData.bestScore === gameState.matchScore && (
              <div className="font-game text-xs text-yellow-400 animate-pulse">🏆 NEW HIGH SCORE!</div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="font-display text-xl text-spider-red">{gameState.playerRoundWins} rounds</div>
            <div className="font-display text-xl text-foreground">{gameState.enemyRoundWins} rounds</div>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleReturnToMenu()}
              className="font-display text-lg tracking-wider px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:scale-105 transition-transform border border-border"
            >
              NEW FIGHT
            </button>
          </div>
        </div>
      )}

      {/* ── LOSE ── */}
      {gameState.gameStatus === "lose" && (
        <div className="text-center space-y-6">
          <div className="font-display text-5xl md:text-6xl text-shadow-comic tracking-wider">
            <span className="text-game-ko">{gameState.enemy.name} WINS!</span>
          </div>
          <p className="font-display text-3xl text-foreground/60 text-shadow-comic">K.O.</p>
          <div className="flex items-center justify-center gap-6">
            <div className="font-display text-xl text-spider-red">{gameState.playerRoundWins} rounds</div>
            <div className="font-display text-xl text-foreground">{gameState.enemyRoundWins} rounds</div>
          </div>

          <div className="flex flex-col gap-3 items-center">
            {/* Rewarded ad: revive fighter */}
            {inPlayables && (
              <button
                onClick={handleReviveAd}
                disabled={rewardLoading !== null}
                className="font-display text-base tracking-wider px-8 py-3 bg-red-900/40 text-red-300 rounded-lg hover:scale-105 transition-transform border-2 border-red-500/50 disabled:opacity-50"
              >
                {rewardLoading === "revive"
                  ? "⏳ Loading Ad..."
                  : "📺 Watch Ad → Revive Fighter!"}
              </button>
            )}
            <button
              onClick={() => handleReturnToMenu()}
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
