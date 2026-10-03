import type { GameState } from "@/hooks/useGameEngine";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GameHUDProps {
  gameState: GameState;
  stageName?: string;
}

export function GameHUD({ gameState, stageName }: GameHUDProps) {
  const { player, enemy, timer, comboText, round, playerRoundWins, enemyRoundWins, maxRounds, roundMessage } = gameState;
  const cooldownPct = Math.round(100 - (player.specialCooldown / player.specialCooldownMax) * 100);
  const secondsLeft = Math.max(0, Math.ceil(player.specialCooldown / 60));
  const winsNeeded = Math.ceil(maxRounds / 2);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative w-[800px] max-w-full px-2 pt-1 pb-2">
        {/* Stage and Round Pill Header */}
        <div className="flex items-center justify-between mb-2 px-3 py-1 rounded-full glass text-xs font-apple">
          {/* Player Rounds */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold mr-1">P1</span>
            {Array.from({ length: winsNeeded }).map((_, i) => (
              <div
                key={`p-${i}`}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  background: i < playerRoundWins ? "#ff3b30" : "rgba(255, 255, 255, 0.15)",
                  boxShadow: i < playerRoundWins ? "0 0 8px #ff3b30, inset 0 1px 0 rgba(255,255,255,0.4)" : "none",
                }}
              />
            ))}
          </div>

          {/* Central Round & Arena Badge */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-semibold text-[11px] tracking-wide">
              ROUND {round}
            </span>
            {stageName && (
              <span className="text-muted-foreground text-[11px] hidden sm:inline">
                &bull; <span className="text-accent font-medium">{stageName}</span>
              </span>
            )}
          </div>

          {/* Enemy Rounds */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: winsNeeded }).map((_, i) => (
              <div
                key={`e-${i}`}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  background: i < enemyRoundWins ? "#ffffff" : "rgba(255, 255, 255, 0.15)",
                  boxShadow: i < enemyRoundWins ? "0 0 8px rgba(255,255,255,0.8), inset 0 1px 0 rgba(255,255,255,0.4)" : "none",
                }}
              />
            ))}
            <span className="text-[10px] text-muted-foreground uppercase font-semibold ml-1">CPU</span>
          </div>
        </div>

        {/* Health Bars & Central Timer */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Player 1 Health & Special */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <span className="font-display text-spider-red text-base sm:text-lg tracking-wider truncate">
                {player.name}
              </span>
              <span className="font-apple text-xs font-bold text-white/90 score-display">
                {Math.max(0, player.health)}%
              </span>
            </div>

            {/* Player Health Bar with Apple specular sheen */}
            <div className="h-4 sm:h-5 health-bar-track p-[2px]">
              <div
                className="health-bar-fill transition-all duration-200"
                style={{
                  width: `${Math.max(0, player.health)}%`,
                  background:
                    player.health > 30
                      ? "linear-gradient(90deg, #34c759, #30d158)"
                      : "linear-gradient(90deg, #ff453a, #ff3b30)",
                  boxShadow:
                    player.health > 30
                      ? "0 0 12px rgba(52, 199, 89, 0.5)"
                      : "0 0 12px rgba(255, 59, 48, 0.6)",
                }}
              />
            </div>

            {/* Special Attack Meter */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 w-full text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-accent group"
                  aria-label="Special attack meter"
                >
                  <span className="font-apple font-bold text-[9px] text-amber-400 tracking-wider">SPECIAL</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full rounded-full transition-all duration-150"
                      style={{
                        width: `${cooldownPct}%`,
                        background:
                          player.specialCooldown <= 0
                            ? "linear-gradient(90deg, #ffd60a, #ff9f0a)"
                            : "rgba(255, 255, 255, 0.3)",
                        boxShadow:
                          player.specialCooldown <= 0
                            ? "0 0 8px rgba(255, 214, 10, 0.8)"
                            : "none",
                      }}
                    />
                  </div>
                  {player.specialCooldown <= 0 && (
                    <span className="text-[9px] font-apple font-bold text-amber-300 animate-pulse hidden sm:inline">
                      READY [SPACE]
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="glass-heavy text-xs font-apple">
                <p className="font-semibold text-amber-400">Ultimate Special Attack</p>
                <p className="text-muted-foreground mt-0.5">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">SPACE</kbd> to unleash.
                </p>
                <p className="mt-1 font-medium">
                  {player.specialCooldown <= 0 ? "✨ 100% Ready!" : `${cooldownPct}% Charged (~${secondsLeft}s)`}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Central Timer in Apple Frosted Capsule */}
          <div className="glass px-3.5 py-1.5 rounded-2xl flex flex-col items-center justify-center min-w-[58px] shadow-lg">
            <span
              className={`font-apple text-xl sm:text-2xl font-black score-display tracking-tight leading-none ${
                timer <= 10 ? "text-red-500 animate-pulse" : "text-amber-400"
              }`}
            >
              {timer}
            </span>
            <span className="text-[8px] font-apple font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
              SECS
            </span>
          </div>

          {/* Player 2 / Enemy Health & Special */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-1">
              <span className="font-apple text-xs font-bold text-white/90 score-display">
                {Math.max(0, enemy.health)}%
              </span>
              <span className="font-display text-foreground text-base sm:text-lg tracking-wider truncate">
                {enemy.name}
              </span>
            </div>

            {/* Enemy Health Bar */}
            <div className="h-4 sm:h-5 health-bar-track p-[2px]">
              <div
                className="health-bar-fill ml-auto transition-all duration-200"
                style={{
                  width: `${Math.max(0, enemy.health)}%`,
                  background:
                    enemy.health > 30
                      ? "linear-gradient(270deg, #34c759, #30d158)"
                      : "linear-gradient(270deg, #ff453a, #ff3b30)",
                  boxShadow:
                    enemy.health > 30
                      ? "0 0 12px rgba(52, 199, 89, 0.5)"
                      : "0 0 12px rgba(255, 59, 48, 0.6)",
                }}
              />
            </div>

            {/* Enemy Special Attack Meter */}
            <div className="flex items-center gap-1.5 justify-end">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden p-[1px]">
                <div
                  className="h-full rounded-full ml-auto transition-all duration-150"
                  style={{
                    width: `${100 - (enemy.specialCooldown / enemy.specialCooldownMax) * 100}%`,
                    background:
                      enemy.specialCooldown <= 0
                        ? "linear-gradient(270deg, #ffd60a, #ff9f0a)"
                        : "rgba(255, 255, 255, 0.3)",
                  }}
                />
              </div>
              <span className="font-apple font-bold text-[9px] text-muted-foreground tracking-wider">CPU SP</span>
            </div>
          </div>
        </div>

        {/* Combo Overlay Banner */}
        {comboText && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 font-display text-amber-400 text-3xl sm:text-4xl text-shadow-comic animate-bounce pointer-events-none drop-shadow-[0_0_15px_rgba(255,214,10,0.8)]">
            {comboText}
          </div>
        )}

        {/* Round Announcement Banner */}
        {roundMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 glass-heavy px-8 py-3 rounded-2xl font-display text-amber-300 text-3xl sm:text-4xl text-shadow-comic animate-bounce-in pointer-events-none whitespace-nowrap shadow-2xl border border-white/20">
            {roundMessage}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
