import { useGameEngine } from "@/hooks/useGameEngine";
import { GameCanvas } from "@/components/GameCanvas";
import { GameHUD } from "@/components/GameHUD";

export function FightingGame() {
  const { gameState, startGame } = useGameEngine();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {gameState.gameStatus === "menu" && (
        <div className="text-center space-y-8">
          <h1 className="font-display text-7xl text-spider-red text-shadow-comic tracking-wide">
            SPIDER-MAN
          </h1>
          <p className="font-display text-4xl text-foreground text-shadow-comic tracking-wider">
            VS VENOM
          </p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="font-display text-2xl tracking-wider px-10 py-4 bg-primary text-primary-foreground rounded-lg shadow-glow-red hover:scale-105 transition-transform border-2 border-spider-red/50"
            >
              FIGHT!
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
            </div>
          </div>
        </div>
      )}

      {gameState.gameStatus === "playing" && (
        <div className="space-y-2">
          <GameHUD gameState={gameState} />
          <GameCanvas gameState={gameState} />
        </div>
      )}

      {(gameState.gameStatus === "win" || gameState.gameStatus === "lose") && (
        <div className="text-center space-y-6">
          <div className="font-display text-6xl text-shadow-comic tracking-wider">
            {gameState.gameStatus === "win" ? (
              <span className="text-game-combo">SPIDER-MAN WINS!</span>
            ) : (
              <span className="text-game-ko">VENOM WINS!</span>
            )}
          </div>
          <p className="font-display text-3xl text-foreground/60 text-shadow-comic">K.O.</p>
          <button
            onClick={startGame}
            className="font-display text-xl tracking-wider px-8 py-3 bg-primary text-primary-foreground rounded-lg shadow-glow-red hover:scale-105 transition-transform border-2 border-spider-red/50"
          >
            REMATCH
          </button>
        </div>
      )}
    </div>
  );
}
