import type { GameState } from "@/hooks/useGameEngine";

interface GameHUDProps {
  gameState: GameState;
}

export function GameHUD({ gameState }: GameHUDProps) {
  const { player, enemy, timer, comboText } = gameState;

  return (
    <div className="relative w-[800px]">
      {/* Health bars and timer */}
      <div className="flex items-center justify-between gap-3 mb-2">
        {/* Player health */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-spider-red text-xl text-shadow-comic tracking-wider">
              SPIDER-MAN
            </span>
          </div>
          <div className="h-5 bg-muted rounded-sm border border-border overflow-hidden">
            <div
              className="h-full transition-all duration-200 rounded-sm"
              style={{
                width: `${player.health}%`,
                background: player.health > 30
                  ? "linear-gradient(90deg, hsl(var(--health-bar)), hsl(120 80% 55%))"
                  : "linear-gradient(90deg, hsl(var(--health-bar-damage)), hsl(30 90% 50%))",
              }}
            />
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <span className="font-pixel text-accent text-2xl text-shadow-comic leading-none">
            {timer}
          </span>
          <span className="font-game text-muted-foreground text-[10px] tracking-widest">TIME</span>
        </div>

        {/* Enemy health */}
        <div className="flex-1">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="font-display text-foreground text-xl text-shadow-comic tracking-wider">
              VENOM
            </span>
          </div>
          <div className="h-5 bg-muted rounded-sm border border-border overflow-hidden">
            <div
              className="h-full transition-all duration-200 rounded-sm ml-auto"
              style={{
                width: `${enemy.health}%`,
                background: enemy.health > 30
                  ? "linear-gradient(270deg, hsl(var(--health-bar)), hsl(120 80% 55%))"
                  : "linear-gradient(270deg, hsl(var(--health-bar-damage)), hsl(30 90% 50%))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Combo text */}
      {comboText && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 font-display text-game-combo text-3xl text-shadow-comic animate-bounce">
          {comboText}
        </div>
      )}
    </div>
  );
}
