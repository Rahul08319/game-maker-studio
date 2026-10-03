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
    <div className="w-full max-w-4xl mx-auto text-center space-y-6 animate-slide-up">
      <div>
        <h1 className="font-display text-4xl sm:text-5xl text-spider-red text-shadow-comic tracking-wide">
          {step === "stage" ? "SELECT STAGE" : "CHOOSE YOUR FIGHTER"}
        </h1>
        <p className="font-apple text-sm text-muted-foreground mt-1">
          {step === "player"
            ? "Step 1 of 3: Select your primary champion"
            : step === "enemy"
            ? "Step 2 of 3: Select your opponent for this match"
            : "Step 3 of 3: Select the combat arena"}
        </p>
      </div>

      {step !== "stage" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {characters.map((char, idx) => {
            const isSelected = step === "player" ? idx === playerIdx : idx === enemyIdx;
            const isDisabledAsEnemy = step === "enemy" && idx === playerIdx;

            return (
              <button
                key={char.id}
                onClick={() => !isDisabledAsEnemy && handleSelect(idx)}
                disabled={isDisabledAsEnemy}
                className={`
                  character-card relative flex flex-col items-center justify-between text-left p-3.5
                  ${isSelected ? "selected" : ""}
                  ${isDisabledAsEnemy ? "opacity-30 cursor-not-allowed" : ""}
                `}
              >
                {/* Character Squircle Avatar */}
                <div
                  className="w-14 h-14 mx-auto mb-2.5 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-transform group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${char.color} 0%, ${char.accentColor} 100%)`,
                  }}
                >
                  <span>{char.emoji}</span>
                </div>

                <div className="w-full text-center">
                  <div className="font-apple font-bold text-xs text-foreground truncate">{char.name}</div>
                  <div className="font-apple text-[10px] text-muted-foreground uppercase tracking-wider">
                    {char.style}
                  </div>
                </div>

                {/* Stats bars */}
                <div className="w-full mt-3 space-y-1.5 pt-2 border-t border-white/5">
                  <StatBar label="ATK" value={char.stats.attack} />
                  <StatBar label="SPD" value={char.stats.speed} />
                  <StatBar label="DEF" value={char.stats.defense} />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === "stage" && <StageSelect selectedId={stageId} onSelect={setStageId} />}

      {/* VS Matchup Preview */}
      {(step === "enemy" || step === "stage") && (
        <div className="glass p-4 rounded-2xl max-w-sm mx-auto flex items-center justify-around animate-blur-in">
          <div className="text-center">
            <div className="text-3xl mb-1">{characters[playerIdx].emoji}</div>
            <div className="font-apple font-semibold text-spider-red text-xs">{characters[playerIdx].name}</div>
            <div className="text-[10px] font-apple text-muted-foreground">Player 1</div>
          </div>
          <span className="font-display text-2xl text-accent">VS</span>
          <div className="text-center">
            <div className="text-3xl mb-1">{characters[enemyIdx].emoji}</div>
            <div className="font-apple font-semibold text-foreground text-xs">{characters[enemyIdx].name}</div>
            <div className="text-[10px] font-apple text-muted-foreground">Opponent</div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-3 pt-2">
        {(step === "enemy" || step === "stage") && (
          <button
            onClick={handleBack}
            className="px-6 py-2.5 btn-apple glass hover:bg-white/10 active:scale-95 transition-all text-xs font-apple text-muted-foreground"
          >
            ← BACK
          </button>
        )}
        {(step === "enemy" || step === "stage") && (
          <button
            onClick={handleConfirm}
            className="px-8 py-2.5 btn-apple bg-primary text-white font-apple font-semibold shadow-glow-red hover:scale-105 active:scale-95 transition-all text-sm"
          >
            {step === "stage" ? "FIGHT NOW! ⚔️" : "PROCEED →"}
          </button>
        )}
      </div>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-apple font-semibold text-[8px] text-muted-foreground/70 w-5">{label}</span>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${value * 10}%`,
            background:
              value >= 8
                ? "linear-gradient(90deg, #ff3b30, #ff453a)"
                : value >= 5
                ? "linear-gradient(90deg, #ffd60a, #ff9f0a)"
                : "rgba(255,255,255,0.4)",
          }}
        />
      </div>
    </div>
  );
}
