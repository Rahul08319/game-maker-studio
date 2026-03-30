import { useState } from "react";
import type { CharacterDef } from "@/lib/characters";

interface CharacterSelectProps {
  characters: CharacterDef[];
  onSelect: (player: CharacterDef, enemy: CharacterDef) => void;
}

export function CharacterSelect({ characters, onSelect }: CharacterSelectProps) {
  const [playerIdx, setPlayerIdx] = useState(0);
  const [enemyIdx, setEnemyIdx] = useState(1);
  const [stage, setStage] = useState<"player" | "enemy">("player");

  const handleSelect = (idx: number) => {
    if (stage === "player") {
      setPlayerIdx(idx);
      setStage("enemy");
    } else {
      setEnemyIdx(idx);
    }
  };

  const handleConfirm = () => {
    onSelect(characters[playerIdx], characters[enemyIdx]);
  };

  const handleBack = () => {
    setStage("player");
  };

  return (
    <div className="text-center space-y-6">
      <h1 className="font-display text-5xl text-spider-red text-shadow-comic tracking-wide">
        SELECT FIGHTER
      </h1>
      <p className="font-game text-accent text-lg tracking-wider">
        {stage === "player" ? "CHOOSE YOUR FIGHTER" : "CHOOSE YOUR OPPONENT"}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {characters.map((char, idx) => {
          const isSelected = stage === "player"
            ? idx === playerIdx
            : idx === enemyIdx;
          const isDisabledAsEnemy = stage === "enemy" && idx === playerIdx;

          return (
            <button
              key={char.id}
              onClick={() => !isDisabledAsEnemy && handleSelect(idx)}
              disabled={isDisabledAsEnemy}
              className={`
                relative p-4 rounded-lg border-2 transition-all
                ${isSelected
                  ? "border-spider-red shadow-glow-red scale-105"
                  : isDisabledAsEnemy
                    ? "border-border opacity-30 cursor-not-allowed"
                    : "border-border hover:border-accent hover:scale-102"
                }
              `}
              style={{ background: "hsl(var(--card))" }}
            >
              <div
                className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-3xl"
                style={{ background: char.color }}
              >
                {char.emoji}
              </div>
              <p className="font-display text-lg text-foreground tracking-wider">
                {char.name}
              </p>
              <p className="font-game text-muted-foreground text-xs mt-1">
                {char.style}
              </p>
              {/* Stats bars */}
              <div className="mt-2 space-y-1 text-left">
                <StatBar label="ATK" value={char.stats.attack} />
                <StatBar label="SPD" value={char.stats.speed} />
                <StatBar label="DEF" value={char.stats.defense} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        {stage === "enemy" && (
          <button
            onClick={handleBack}
            className="font-display text-lg tracking-wider px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:scale-105 transition-transform border border-border"
          >
            BACK
          </button>
        )}
        {stage === "enemy" && (
          <button
            onClick={handleConfirm}
            className="font-display text-xl tracking-wider px-8 py-3 bg-primary text-primary-foreground rounded-lg shadow-glow-red hover:scale-105 transition-transform border-2 border-spider-red/50"
          >
            FIGHT!
          </button>
        )}
      </div>

      {/* VS Preview */}
      {stage === "enemy" && (
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="text-center">
            <div className="text-4xl mb-1">{characters[playerIdx].emoji}</div>
            <p className="font-display text-spider-red text-sm">{characters[playerIdx].name}</p>
          </div>
          <span className="font-display text-3xl text-accent text-shadow-comic">VS</span>
          <div className="text-center">
            <div className="text-4xl mb-1">{characters[enemyIdx].emoji}</div>
            <p className="font-display text-foreground text-sm">{characters[enemyIdx].name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="font-game text-[9px] text-muted-foreground w-6">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${value * 10}%`,
            background: value >= 8 ? "hsl(var(--spider-red))" : value >= 5 ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))",
          }}
        />
      </div>
    </div>
  );
}
