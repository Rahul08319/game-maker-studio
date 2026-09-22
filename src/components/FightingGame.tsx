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
import { getPlatform, PLATFORM_NAMES, type PlatformId } from "@/lib/platforms";

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
  const platform = getPlatform();

  const firstFrameSentRef = useRef(false);
  const gameReadySentRef = useRef(false);
  const [rewardLoading, setRewardLoading] = useState<"revive" | "special" | null>(null);
  const [isMuted, setIsMuted] = useState(!sound.isAudioEnabled());
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Lifecycle: firstFrameReady
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!firstFrameSentRef.current) {
      firstFrameSentRef.current = true;
      platform.firstFrameReady();
    }
  }, [platform]);

  // ---------------------------------------------------------------------------
  // Lifecycle: gameReady
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const status = gameState.gameStatus;
    if ((status === "menu" || status === "select") && !gameReadySentRef.current) {
      gameReadySentRef.current = true;
      platform.gameReady();
    }
  }, [gameState.gameStatus, platform]);

  // ---------------------------------------------------------------------------
  // BGM management
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
  // Ads: Interstitial
  // ---------------------------------------------------------------------------
  const handleReturnToMenu = async (training = false) => {
    sound.playMenuSelect();
    await platform.showInterstitialAd();
    goToSelect(training);
  };

  // ---------------------------------------------------------------------------
  // Ads: Rewarded Revive
  // ---------------------------------------------------------------------------
  const handleReviveAd = async () => {
    setRewardLoading("revive");
    try {
      const earned = await platform.showRewardedAd("revive_fighter");
      if (earned) {
        revivePlayer();
        sound.playRoundWin();
      }
    } finally {
      setRewardLoading(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Ads: Rewarded Special Recharge
  // ---------------------------------------------------------------------------
  const handleSpecialRechargeAd = async () => {
    setRewardLoading("special");
    try {
      const earned = await platform.showRewardedAd("special_energy");
      if (earned) {
        rechargeSpecial();
        sound.playMenuSelect();
      }
    } finally {
      setRewardLoading(null);
    }
  };

  const handleToggleAudio = () => {
    const enabled = sound.toggleAudio();
    setIsMuted(!enabled);
  };

  const switchPlatform = (p: PlatformId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("platform", p);
    window.location.href = url.toString();
  };

  if (gameState.isYTPaused) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="glass-heavy max-w-sm w-full p-8 rounded-[24px] text-center space-y-4 animate-bounce-in">
          <div className="text-5xl animate-pulse">⏸</div>
          <div className="font-apple text-2xl font-semibold text-foreground tracking-tight">GAME PAUSED</div>
          <p className="font-apple text-sm text-muted-foreground">Suspended by {platform.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between selection:bg-primary selection:text-white">
      {/* ── APPLE GLOBAL FROSTED HEADER ── */}
      <header className="w-full h-12 sticky top-0 z-50 frosted-bar flex items-center justify-between px-4 sm:px-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-lg">🕷️</span>
          <span className="font-apple font-semibold text-sm tracking-tight text-foreground hidden sm:inline">
            Spider-Man: Fighting Arena
          </span>
          {/* Active Platform Pill */}
          <div className="relative">
            <button
              onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
              className="stat-badge text-xs hover:border-accent/40 transition-colors"
              title="Click to switch gaming platform preview"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-foreground">{platform.name}</span>
              <span className="text-[10px] text-muted-foreground ml-1">▼</span>
            </button>

            {platformDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 glass-heavy rounded-2xl p-2 shadow-2xl z-50 border border-white/20 animate-slide-up">
                <div className="text-[11px] font-semibold text-muted-foreground px-3 py-1 uppercase tracking-wider">
                  Select Game Platform
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {PLATFORM_NAMES.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setPlatformDropdownOpen(false);
                        switchPlatform(p);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-apple hover:bg-white/10 text-foreground/90 transition-colors flex items-center justify-between"
                    >
                      <span className="capitalize">{p}</span>
                      {platform.name.toLowerCase().includes(p) && (
                        <span className="text-emerald-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Header Stats & Controls */}
        <div className="flex items-center gap-3">
          {saveData.bestScore > 0 && (
            <div className="stat-badge hidden md:inline-flex">
              <span className="text-xs">🏆</span>
              <span className="font-apple text-xs text-muted-foreground">Best:</span>
              <span className="font-apple font-semibold text-xs text-amber-400 score-display">
                {saveData.bestScore.toLocaleString()}
              </span>
            </div>
          )}
          {saveData.winStreak > 1 && (
            <div className="stat-badge hidden md:inline-flex">
              <span className="text-xs">🔥</span>
              <span className="font-apple text-xs text-amber-300 font-semibold">{saveData.winStreak} Streak</span>
            </div>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={handleToggleAudio}
            className="w-8 h-8 rounded-full glass flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            aria-label="Toggle Sound"
          >
            <span className="text-xs">{isMuted ? "🔇" : "🔊"}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 w-full flex flex-col items-center justify-center p-4 max-w-5xl">
        {/* ── MENU STATE ── */}
        {gameState.gameStatus === "menu" && (
          <div className="w-full max-w-xl mx-auto text-center space-y-8 animate-slide-up">
            {/* Hero Card */}
            <div className="glass-heavy p-8 sm:p-12 rounded-[28px] space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-apple text-red-400">
                <span>⚡ Next-Gen 2D Fighting Arena</span>
              </div>

              <div>
                <h1 className="font-display text-5xl sm:text-7xl text-spider-red text-shadow-comic tracking-wide animate-float">
                  SPIDER-MAN
                </h1>
                <p className="font-display text-2xl sm:text-3xl text-foreground text-shadow-comic tracking-wider mt-1">
                  FIGHTING ARENA
                </p>
                <p className="font-apple text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Master signature aerial acrobatics, web shots, and crushing combos across iconic New York battlegrounds.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    sound.playMenuSelect();
                    goToSelect();
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 btn-apple bg-primary text-white font-apple font-semibold shadow-glow-red hover:scale-105 active:scale-95 transition-all text-base"
                >
                  START FIGHT
                </button>
                <button
                  onClick={() => {
                    sound.playMenuSelect();
                    goToSelect(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 btn-apple glass hover:bg-white/10 active:scale-95 transition-all font-apple text-sm text-foreground/90"
                >
                  TRAINING MODE
                </button>
              </div>

              {/* Stats Footer on Menu */}
              {(saveData.totalMatches > 0 || saveData.bestScore > 0) && (
                <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[11px] font-apple text-muted-foreground">MATCHES</div>
                    <div className="font-apple font-bold text-sm text-foreground">{saveData.totalMatches}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-apple text-muted-foreground">WINS</div>
                    <div className="font-apple font-bold text-sm text-spider-red">{saveData.totalWins}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-apple text-muted-foreground">BEST SCORE</div>
                    <div className="font-apple font-bold text-sm text-amber-400 score-display">
                      {saveData.bestScore.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls Card */}
            <div className="glass p-5 rounded-[20px] max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-apple font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  KEYBOARD CONTROLS
                </span>
                {isMobile && (
                  <span className="text-[11px] text-amber-400 font-apple">Touch controls active!</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-apple">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Move & Jump</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">WASD / ↑←↓→</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Punch</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">J</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Kick</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">K</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">Web Shot</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">L</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 col-span-2">
                  <span className="text-muted-foreground">Ultimate Special</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-amber-300">Spacebar</kbd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SELECT STATE ── */}
        {gameState.gameStatus === "select" && (
          <div className="w-full animate-slide-up">
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
          </div>
        )}

        {/* ── PLAYING / TRAINING STATE ── */}
        {(gameState.gameStatus === "playing" || gameState.gameStatus === "training") && (
          <div className="w-full flex flex-col items-center space-y-3 animate-blur-in">
            <GameHUD gameState={gameState} stageName={getStage(gameState.stageId).name} />

            {/* Current match score pill */}
            {gameState.matchScore > 0 && (
              <div className="stat-badge animate-bounce-in">
                <span className="text-[11px] text-muted-foreground">MATCH SCORE:</span>
                <span className="font-apple font-bold text-amber-400 score-display">
                  {gameState.matchScore.toLocaleString()}
                </span>
              </div>
            )}

            {/* Training Mode Toolbar */}
            {gameState.isTraining && (
              <div className="training-bar text-xs">
                <span className="font-apple font-semibold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  TRAINING (COMBO: {gameState.player.combo})
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground mr-1 text-[11px]">DUMMY:</span>
                  {(["idle", "block", "attack"] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setDummyBehavior(b)}
                      className={`px-2.5 py-1 rounded-full font-apple text-[11px] capitalize transition-all ${
                        gameState.dummyBehavior === b
                          ? "bg-amber-400 text-black font-semibold shadow-sm"
                          : "glass text-muted-foreground hover:text-white"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground mr-1 text-[11px]">AI:</span>
                  {(["easy", "normal", "hard"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setAiDifficulty(d)}
                      className={`px-2.5 py-1 rounded-full font-apple text-[11px] capitalize transition-all ${
                        gameState.aiDifficulty === d
                          ? "bg-red-600 text-white font-semibold shadow-sm"
                          : "glass text-muted-foreground hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToSelect(false)}
                  className="btn-apple text-xs px-3 py-1 glass hover:bg-white/10 text-muted-foreground"
                >
                  EXIT
                </button>
              </div>
            )}

            {/* Canvas Box framed in Apple bezel */}
            <div className="relative w-full max-w-[800px] rounded-[24px] overflow-hidden glass-heavy p-2 shadow-2xl">
              <GameCanvas gameState={gameState} />
              <ComboOverlay characterSprite={gameState.player.sprite} />
            </div>

            {/* Special Recharge Rewarded Ad Action */}
            {gameState.player.specialCooldown > 180 && (
              <button
                onClick={handleSpecialRechargeAd}
                disabled={rewardLoading !== null}
                className="btn-reward animate-bounce-in flex items-center gap-2"
              >
                <span>⚡</span>
                <span>{rewardLoading === "special" ? "Loading Ad..." : "Watch Ad → Instant Special Recharge"}</span>
              </button>
            )}

            {isMobile && <TouchControls onKeyDown={addKey} onKeyUp={removeKey} />}
          </div>
        )}

        {/* ── ROUND END STATE ── */}
        {gameState.gameStatus === "roundEnd" && (
          <div className="glass-heavy p-8 sm:p-12 rounded-[28px] text-center space-y-6 max-w-md w-full animate-bounce-in shadow-2xl">
            <div className="font-display text-4xl sm:text-5xl text-accent text-shadow-comic">
              {gameState.roundMessage}
            </div>
            <div className="flex items-center justify-around py-3 rounded-2xl glass">
              <div className="text-center">
                <div className="font-display text-2xl text-spider-red">{gameState.player.name}</div>
                <div className="font-apple text-3xl font-bold text-white">{gameState.playerRoundWins}</div>
              </div>
              <span className="text-muted-foreground font-apple font-light text-2xl">vs</span>
              <div className="text-center">
                <div className="font-display text-2xl text-foreground">{gameState.enemy.name}</div>
                <div className="font-apple text-3xl font-bold text-white">{gameState.enemyRoundWins}</div>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playMenuSelect();
                nextRound();
              }}
              className="w-full py-3.5 btn-apple bg-primary text-white font-apple font-semibold shadow-glow-red hover:scale-105 active:scale-95 transition-all text-base"
            >
              NEXT ROUND
            </button>
          </div>
        )}

        {/* ── MATCH WIN STATE ── */}
        {gameState.gameStatus === "win" && (
          <div className="glass-heavy p-8 sm:p-12 rounded-[28px] text-center space-y-6 max-w-md w-full animate-bounce-in shadow-2xl">
            <div className="text-5xl">🏆</div>
            <div className="font-display text-4xl sm:text-5xl text-amber-400 animate-winner text-shadow-comic">
              VICTORY!
            </div>
            <p className="font-apple text-lg text-foreground/80">{gameState.player.name} WINS THE MATCH!</p>

            <div className="p-4 rounded-2xl glass space-y-1">
              <div className="font-apple text-xs text-muted-foreground">FINAL MATCH SCORE</div>
              <div className="font-apple text-4xl font-extrabold text-amber-400 score-display">
                {gameState.matchScore.toLocaleString()}
              </div>
              {gameState.matchScore > 0 && saveData.bestScore === gameState.matchScore && (
                <div className="font-apple text-xs text-emerald-400 font-semibold animate-pulse">
                  ✨ NEW ALL-TIME RECORD!
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReturnToMenu()}
                className="w-full py-3.5 btn-apple bg-primary text-white font-apple font-semibold shadow-glow-red hover:scale-105 active:scale-95 transition-all"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* ── MATCH LOSE STATE ── */}
        {gameState.gameStatus === "lose" && (
          <div className="glass-heavy p-8 sm:p-12 rounded-[28px] text-center space-y-6 max-w-md w-full animate-bounce-in shadow-2xl">
            <div className="text-5xl">💀</div>
            <div className="font-display text-4xl sm:text-5xl text-spider-red text-shadow-comic">
              DEFEAT
            </div>
            <p className="font-apple text-lg text-foreground/80">{gameState.enemy.name} WINS THE MATCH</p>

            {/* Rewarded Ad Revive Button */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleReviveAd}
                disabled={rewardLoading !== null}
                className="w-full py-3.5 btn-apple bg-amber-500 text-black font-apple font-semibold hover:bg-amber-400 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>📺</span>
                <span>{rewardLoading === "revive" ? "Preparing Ad..." : "Watch Ad to Revive with Full Health"}</span>
              </button>

              <button
                onClick={() => handleReturnToMenu()}
                className="w-full py-3.5 btn-apple glass hover:bg-white/10 active:scale-95 transition-all font-apple text-sm text-muted-foreground"
              >
                RETURN TO MENU
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── APPLE FROSTED FOOTER ── */}
      <footer className="w-full py-3 text-center text-xs font-apple text-muted-foreground/60 border-t border-white/5">
        Spider-Man: Fighting Arena &bull; Designed with Apple Human Interface Guidelines &bull; Multi-Platform Web Edition
      </footer>
    </div>
  );
}
