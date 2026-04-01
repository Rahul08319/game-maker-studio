import { useState } from "react";
import { COMBO_LIST, SPECIAL_ATTACKS } from "@/lib/specialAttacks";

interface ComboOverlayProps {
  characterSprite: string;
}

export function ComboOverlay({ characterSprite }: ComboOverlayProps) {
  const [open, setOpen] = useState(false);
  const special = SPECIAL_ATTACKS[characterSprite];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute top-2 right-2 font-game text-[10px] px-2 py-1 bg-muted/80 text-muted-foreground rounded border border-border/50 hover:bg-muted transition-colors z-10"
      >
        MOVES
      </button>
    );
  }

  return (
    <div className="absolute top-2 right-2 w-56 bg-background/95 border border-border rounded-lg p-3 z-10 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-accent text-sm tracking-wider">MOVE LIST</span>
        <button
          onClick={() => setOpen(false)}
          className="font-game text-[10px] text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>

      {special && (
        <div className="mb-2 pb-2 border-b border-border/50">
          <div className="flex items-center gap-1">
            <span className="font-game text-accent text-[10px]">SPACE</span>
            <span className="font-game text-game-combo text-[10px]">{special.name}</span>
          </div>
          <p className="font-game text-muted-foreground text-[9px]">{special.description}</p>
        </div>
      )}

      <div className="space-y-1">
        {COMBO_LIST.filter(c => c.keys !== "SPACE").map((combo) => (
          <div key={combo.keys} className="flex items-center justify-between">
            <span className="font-game text-accent text-[9px]">{combo.keys}</span>
            <span className="font-game text-foreground/70 text-[9px]">{combo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
