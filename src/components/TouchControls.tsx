import { useEffect, useRef, useCallback } from "react";

interface TouchControlsProps {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
}

interface DPadButton {
  key: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ActionButton {
  key: string;
  label: string;
  color: string;
}

const dpadButtons: DPadButton[] = [
  { key: "w", label: "▲", x: 1, y: 0, w: 1, h: 1 },
  { key: "a", label: "◄", x: 0, y: 1, w: 1, h: 1 },
  { key: "s", label: "▼", x: 1, y: 2, w: 1, h: 1 },
  { key: "d", label: "►", x: 2, y: 1, w: 1, h: 1 },
];

const actionButtons: ActionButton[] = [
  { key: "j", label: "👊", color: "hsl(0 85% 50%)" },
  { key: "k", label: "🦶", color: "hsl(220 90% 55%)" },
  { key: "l", label: "🕸️", color: "hsl(0 0% 75%)" },
  { key: " ", label: "⚡", color: "hsl(45 100% 55%)" },
];

export function TouchControls({ onKeyDown, onKeyUp }: TouchControlsProps) {
  const activeKeysRef = useRef<Set<string>>(new Set());

  const handleTouchStart = useCallback((key: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    if (!activeKeysRef.current.has(key)) {
      activeKeysRef.current.add(key);
      onKeyDown(key);
    }
  }, [onKeyDown]);

  const handleTouchEnd = useCallback((key: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    activeKeysRef.current.delete(key);
    onKeyUp(key);
  }, [onKeyUp]);

  useEffect(() => {
    return () => {
      activeKeysRef.current.forEach(key => onKeyUp(key));
      activeKeysRef.current.clear();
    };
  }, [onKeyUp]);

  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-50 pb-4 px-4 md:hidden">
      <div className="flex justify-between items-end pointer-events-auto">
        {/* D-Pad */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-[140px] h-[140px]">
          {dpadButtons.map(btn => (
            <button
              key={btn.key}
              onTouchStart={handleTouchStart(btn.key)}
              onTouchEnd={handleTouchEnd(btn.key)}
              onTouchCancel={handleTouchEnd(btn.key)}
              className="select-none active:scale-95 rounded-lg flex items-center justify-center text-2xl"
              style={{
                gridColumn: btn.x + 1,
                gridRow: btn.y + 1,
                background: "hsl(230 15% 22% / 0.8)",
                color: "hsl(0 0% 80%)",
                border: "1px solid hsl(230 15% 30%)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 w-[130px]">
          {actionButtons.map(btn => (
            <button
              key={btn.key}
              onTouchStart={handleTouchStart(btn.key)}
              onTouchEnd={handleTouchEnd(btn.key)}
              onTouchCancel={handleTouchEnd(btn.key)}
              className="select-none active:scale-90 rounded-full w-[58px] h-[58px] flex items-center justify-center text-xl"
              style={{
                background: `${btn.color.replace(")", " / 0.7)")}`,
                border: `2px solid ${btn.color}`,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
