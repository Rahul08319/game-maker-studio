import { useState } from "react";
import type { CharacterDef } from "@/lib/characters";
import { StageSelect } from "@/components/StageSelect";

interface CharacterSelectProps {
  characters: CharacterDef[];
  onSelect: (player: CharacterDef, enemy: CharacterDef, stageId: string) => void;
}

export function CharacterSelect({ characters, onSelect }: CharacterSelectProps) {
  const [playerIdx, setPlayerIdx] = useState(0);
  const [enemyIdx, setEnemyIdx] = useState(1);
  const [step, setStep] = useState<"player" | "enemy" | "stage">("player");
  const [stageId, setStageId] = useState("city");

  const handleSelect = (idx: number) => {
    if (step === "player") {
      setPlayerIdx(idx);
      setStep("enemy");
    } else if (step === "enemy") {
      setEnemyIdx(idx);
    }
  };

  const handleConfirm = () => {
    if (step === "enemy") setStep("stage");
    else onSelect(characters[playerIdx], characters[enemyIdx], stageId);
  };

  const handleBack = () => {
    if (step === "stage") setStep("enemy");
    else setStep("player");
  };

  return (
    <div className="text-center space-y-6">
      <h1 className="font-display text-5xl text-spider-red text-shadow-comic tracking-wide">
        {step === "stage" ? "SELECT STAGE" : "SELECT FIGHTER"}
      </h1>
      <p className="font-game text-accent text-lg tracking-wider">
        {step === "player" ? "CHOOSE YOUR FIGHTER" : step === "enemy" ? "CHOOSE YOUR OPPONENT" : "CHOOSE THE BATTLEGROUND"}
      </p>

      {step !== "stage" && <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 max-w-4xl mx-auto">
        {characters.map((char, idx) => {
          const isSelected = step === "player"
            ? idx === playerIdx
            : idx === enemyIdx;
          const isDisabledAsEnemy = step === "enemy" && idx === playerIdx;

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
      </div>}

      {step === "stage" && <StageSelect selectedId={stageId} onSelect={setStageId} />}

      <div className="flex items-center justify-center gap-4 mt-6">
        {(step === "enemy" || step === "stage") && (
          <button
            onClick={handleBack}
            className="font-display text-lg tracking-wider px-6 py-2 bg-muted text-muted-foreground rounded-lg hover:scale-105 transition-transform border border-border"
          >
            BACK
          </button>
        )}
        {(step === "enemy" || step === "stage") && (
          <button
            onClick={handleConfirm}
            className="font-display text-xl tracking-wider px-8 py-3 bg-primary text-primary-foreground rounded-lg shadow-glow-red hover:scale-105 transition-transform border-2 border-spider-red/50"
          >
            {step === "stage" ? "FIGHT!" : "NEXT"}
          </button>
        )}
      </div>

      {/* VS Preview */}
      {(step === "enemy" || step === "stage") && (
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
