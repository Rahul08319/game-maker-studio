import type { GameState } from "@/hooks/useGameEngine";

interface GameHUDProps {
  gameState: GameState;
}

export function GameHUD({ gameState }: GameHUDProps) {
  const { player, enemy, timer, comboText, round, playerRoundWins, enemyRoundWins, maxRounds, roundMessage } = gameState;

  return (
    <div className="relative w-[800px] max-w-full">
      {/* Round indicators */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="flex gap-1">
          {Array.from({ length: Math.ceil(maxRounds / 2) }).map((_, i) => (
            <div
              key={`p-${i}`}
              className="w-3 h-3 rounded-full border border-spider-red/50"
              style={{ background: i < playerRoundWins ? "hsl(var(--spider-red))" : "transparent" }}
            />
          ))}
        </div>
        <span className="font-pixel text-muted-foreground text-[9px] mx-2">R{round}</span>
        <div className="flex gap-1">
          {Array.from({ length: Math.ceil(maxRounds / 2) }).map((_, i) => (
            <div
              key={`e-${i}`}
              className="w-3 h-3 rounded-full border border-foreground/30"
              style={{ background: i < enemyRoundWins ? "hsl(var(--foreground))" : "transparent" }}
            />
          ))}
        </div>
      </div>

      {/* Health bars and timer */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-display text-spider-red text-lg md:text-xl text-shadow-comic tracking-wider truncate">
              {player.name}
            </span>
          </div>
          <div className="h-4 md:h-5 bg-muted rounded-sm border border-border overflow-hidden">
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

        <div className="flex flex-col items-center">
          <span className="font-pixel text-accent text-xl md:text-2xl text-shadow-comic leading-none">{timer}</span>
          <span className="font-game text-muted-foreground text-[10px] tracking-widest">TIME</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="font-display text-foreground text-lg md:text-xl text-shadow-comic tracking-wider truncate">
              {enemy.name}
            </span>
          </div>
          <div className="h-4 md:h-5 bg-muted rounded-sm border border-border overflow-hidden">
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
        <div className="absolute top-14 left-1/2 -translate-x-1/2 font-display text-game-combo text-2xl md:text-3xl text-shadow-comic animate-bounce">
          {comboText}
        </div>
      )}

      {/* Round message */}
      {roundMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 font-display text-accent text-3xl md:text-4xl text-shadow-comic animate-pulse whitespace-nowrap">
          {roundMessage}
        </div>
      )}
    </div>
  );
}
