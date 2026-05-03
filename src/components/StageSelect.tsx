import { STAGES } from "@/lib/stages";
import { useEffect, useRef } from "react";

interface StageSelectProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function StageSelect({ selectedId, onSelect }: StageSelectProps) {
  return (
    <div className="space-y-3">
      <p className="font-game text-accent text-sm tracking-wider text-center">SELECT STAGE</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {STAGES.map(stage => (
          <button
            key={stage.id}
            onClick={() => onSelect(stage.id)}
            className={`relative p-2 rounded-lg border-2 transition-all ${
              selectedId === stage.id
                ? "border-spider-red shadow-glow-red scale-105"
                : "border-border hover:border-accent"
            }`}
            style={{ background: "hsl(var(--card))" }}
          >
            <StagePreview stageId={stage.id} />
            <p className="font-display text-foreground text-sm mt-2 tracking-wider">{stage.name}</p>
            <p className="font-game text-muted-foreground text-[10px]">{stage.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StagePreview({ stageId }: { stageId: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stage = STAGES.find(s => s.id === stageId)!;
    stage.draw(ctx, canvas.width, canvas.height, 0);
  }, [stageId]);
  return (
    <canvas ref={ref} width={200} height={110} className="w-full rounded border border-border" />
  );
}
