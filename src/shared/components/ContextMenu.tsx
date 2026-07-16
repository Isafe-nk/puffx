import React, { useEffect, useRef, useState } from 'react';
import { useWindows } from '../../context/OSProvider';

// Desktop right-click menu (spec §9): beveled panel at the cursor, closes on
// click-away / Escape. Clamped to the viewport.
export default function ContextMenu({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const { cycleWallpaper, clearData } = useWindows();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  // Clamp so the menu never spills off-screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    setPos({ x: Math.min(x, window.innerWidth - w - 8), y: Math.min(y, window.innerHeight - h - 8) });
  }, [x, y]);

  useEffect(() => {
    const onDown = () => onClose();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const item = 'flex w-full items-center justify-between gap-[18px] px-2.5 py-[7px] rounded-[4px] text-[12.5px] text-left text-body hover:bg-accent hover:text-white transition-colors';

  const run = (fn?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn?.();
    onClose();
  };

  return (
    <div
      ref={ref}
      role="menu"
      onMouseDown={(e) => e.stopPropagation()}
      style={{ left: pos.x, top: pos.y }}
      className="os-dropdown fixed z-[300] min-w-[206px] p-[5px] rounded-[5px]"
    >
      <button type="button" role="menuitem" className={item} onClick={run()}>About Puffx</button>
      <button type="button" role="menuitem" className={item} onClick={run(cycleWallpaper)}>Change wallpaper</button>
      <button type="button" role="menuitem" className={item} onClick={run()}>
        Keyboard shortcuts <span className="text-faint text-[11px] group-hover:text-white/70">?</span>
      </button>
      <div className="h-px bg-hairline mx-1.5 my-[5px]" />
      <button
        type="button"
        role="menuitem"
        className={item}
        onClick={run(() => {
          if (window.confirm('Clear all your Puffx data on this device? This wipes your reading progress and preferences.')) {
            clearData();
          }
        })}
      >
        Clear my data
      </button>
    </div>
  );
}
