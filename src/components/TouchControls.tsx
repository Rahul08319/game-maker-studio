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
}

interface ActionButton {
  key: string;
  label: string;
  name: string;
  color: string;
}

const dpadButtons: DPadButton[] = [
  { key: "w", label: "▲", x: 1, y: 0 },
  { key: "a", label: "◄", x: 0, y: 1 },
  { key: "s", label: "▼", x: 1, y: 2 },
  { key: "d", label: "►", x: 2, y: 1 },
];

const actionButtons: ActionButton[] = [
  { key: "j", label: "👊", name: "PUNCH", color: "#ff3b30" },
  { key: "k", label: "🦶", name: "KICK", color: "#007aff" },
  { key: "l", label: "🕸️", name: "WEB", color: "#8e8e93" },
  { key: " ", label: "⚡", name: "SPECIAL", color: "#ffd60a" },
];

export function TouchControls({ onKeyDown, onKeyUp }: TouchControlsProps) {
  const activeKeysRef = useRef<Set<string>>(new Set());

  const handleTouchStart = useCallback(
    (key: string) => (e: React.TouchEvent) => {
      e.preventDefault();
      if (!activeKeysRef.current.has(key)) {
        activeKeysRef.current.add(key);
        onKeyDown(key);
        // Trigger subtle mobile vibration if supported
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.(10);
        }
      }
    },
    [onKeyDown]
  );

  const handleTouchEnd = useCallback(
    (key: string) => (e: React.TouchEvent) => {
      e.preventDefault();
      activeKeysRef.current.delete(key);
      onKeyUp(key);
    },
    [onKeyUp]
  );

  useEffect(() => {
    return () => {
      activeKeysRef.current.forEach((key) => onKeyUp(key));
      activeKeysRef.current.clear();
    };
  }, [onKeyUp]);

  return (
    <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-50 pb-6 px-6 md:hidden select-none">
      <div className="flex justify-between items-end pointer-events-auto">
        {/* Apple Glass D-Pad */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-[146px] h-[146px] p-2 rounded-[28px] glass-heavy shadow-2xl">
          {dpadButtons.map((btn) => (
            <button
              key={btn.key}
              onTouchStart={handleTouchStart(btn.key)}
              onTouchEnd={handleTouchEnd(btn.key)}
              onTouchCancel={handleTouchEnd(btn.key)}
              aria-label={`D-Pad ${btn.key}`}
              className="select-none active:scale-90 rounded-2xl flex items-center justify-center text-lg font-bold text-white/80 glass hover:bg-white/20 transition-transform"
              style={{
                gridColumn: btn.x + 1,
                gridRow: btn.y + 1,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Apple Glass Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-[150px]">
          {actionButtons.map((btn) => (
            <button
              key={btn.key}
              onTouchStart={handleTouchStart(btn.key)}
              onTouchEnd={handleTouchEnd(btn.key)}
              onTouchCancel={handleTouchEnd(btn.key)}
              aria-label={btn.name}
              className="select-none active:scale-85 rounded-full w-[62px] h-[62px] flex flex-col items-center justify-center shadow-lg transition-transform glass-heavy border border-white/20"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${btn.color}44, ${btn.color}22)`,
                boxShadow: `0 4px 16px ${btn.color}33, inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span className="text-xl leading-none">{btn.label}</span>
              <span className="text-[8px] font-apple font-bold tracking-tight text-white/70 mt-0.5">
                {btn.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
