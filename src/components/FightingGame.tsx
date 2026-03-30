import { useGameEngine } from "@/hooks/useGameEngine";
import { useSoundEngine } from "@/hooks/useSoundEngine";
import { GameCanvas } from "@/components/GameCanvas";
import { GameHUD } from "@/components/GameHUD";
import { TouchControls } from "@/components/TouchControls";
import { CharacterSelect } from "@/components/CharacterSelect";
import { CHARACTERS } from "@/lib/characters";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";

export function FightingGame() {
  const sound = useSoundEngine();
  const { gameState, goToSelect, selectCharacters, nextRound, addKey, removeKey } = useGameEngine({
    onAttackHit: sound.playAttackSound,
    onBlock: sound.playBlock,
    onKO: sound.playKO,
    onRoundWin: sound.playRoundWin,
  });
  const isMobile = useIsMobile();

  useEffect(() => {
    if (gameState.gameStatus === "playing") {
      sound.startBGMusic();
    } else if (gameState.gameStatus === "menu" || gameState.gameStatus === "win" || gameState.gameStatus === "lose") {
      sound.stopBGMusic();
    }
  }, [gameState.gameStatus, sound]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {gameState.gameStatus === "menu" && (
        <div className="text-center space-y-8">
          <h1 className="font-display text-5xl md:text-7xl text-spider-red text-shadow-comic tracking-wide">
            SPIDER-MAN
          </h1>
          <p className="font-display text-2xl md:text-4xl text-foreground text-shadow-comic tracking-wider">
            FIGHTING ARENA
          </p>
          <button
            onClick={() => { sound.playMenuSelect(); goToSelect(); }}
            className="font-display text-2xl tracking-wider px-10 py-4 bg-primary text-primary-foreground rounded-lg shadow-glow-red hover:scale-105 transition-transform border-2 border-spider-red/50"
          >
            START
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
          onSelect={(p, e) => { sound.playMenuSelect(); selectCharacters(p, e); }}
        />
      )}

      {gameState.gameStatus === "playing" && (
        <div className="space-y-2 w-full flex flex-col items-center">
          <GameHUD gameState={gameState} />
          <GameCanvas gameState={gameState} />
          {isMobile && <TouchControls onKeyDown={addKey} onKeyUp={removeKey} />}
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
