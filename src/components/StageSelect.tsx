import { STAGES } from "@/lib/stages";
import { useEffect, useRef } from "react";

interface StageSelectProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function StageSelect({ selectedId, onSelect }: StageSelectProps) {
  return (
    <div className="space-y-4 max-w-4xl mx-auto animate-slide-up">
      <div className="text-center">
        <p className="font-apple text-xs uppercase tracking-widest text-muted-foreground">Select Battle Arena</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAGES.map((stage) => {
          const isSelected = selectedId === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => onSelect(stage.id)}
              className={`
                group relative p-3 rounded-[20px] glass text-left transition-all duration-200
                ${
                  isSelected
                    ? "selected ring-2 ring-spider-red shadow-glow-red scale-[1.02]"
                    : "hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg"
                }
              `}
            >
              <div className="overflow-hidden rounded-[14px] border border-white/10 mb-2.5">
                <StagePreview stageId={stage.id} />
              </div>
              <div className="flex items-center justify-between">
                <p className="font-apple font-bold text-sm text-foreground tracking-tight">{stage.name}</p>
                {isSelected && <span className="text-spider-red text-xs">✓</span>}
              </div>
              <p className="font-apple text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                {stage.description}
              </p>
            </button>
          );
        })}
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
    const stage = STAGES.find((s) => s.id === stageId)!;
    stage.draw(ctx, canvas.width, canvas.height, 0);
  }, [stageId]);

  return (
    <canvas
      ref={ref}
      width={240}
      height={135}
      className="w-full h-auto aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
    />
  );
}
