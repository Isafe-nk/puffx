import React, { useEffect, useRef, useState } from 'react';
import { useWindows } from '../../context/OSProvider';

// Desktop right-click menu (spec §9): beveled panel at the cursor, closes on
// click-away / Escape. About / Change wallpaper / Keyboard shortcuts each open a
// system window; Clear my data confirms then wipes localStorage and reloads.
// Opens on the same short curve as the menu-bar dropdowns (spec/motion.md §3):
// it mounts on right-click so @starting-style applies, and dismissal unmounts
// it, which is instant by design.
export default function ContextMenu({ x, y, onClose }: { x: number; y: number; onClose: () => void }) {
  const { openSys, clearData } = useWindows();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setPos({
      x: Math.min(x, window.innerWidth - el.offsetWidth - 8),
      y: Math.min(y, window.innerHeight - el.offsetHeight - 8),
    });
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

  const item = 'flex w-full items-center justify-between gap-[18px] px-2.5 py-[7px] rounded-[4px] text-[12.5px] text-left text-body cursor-pointer hover:bg-accent hover:text-white transition-colors group/row';

  const run = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
    onClose();
  };

  return (
    <div
      ref={ref}
      role="menu"
      onMouseDown={(e) => e.stopPropagation()}
      style={{ left: pos.x, top: pos.y }}
      className="os-dropdown os-menu-in fixed z-[300] min-w-[206px] p-[5px] rounded-[5px]"
    >
      <button type="button" role="menuitem" className={item} onClick={run(() => openSys('about'))}>About Puffx</button>
      <button type="button" role="menuitem" className={item} onClick={run(() => openSys('display'))}>Change wallpaper</button>
      <button type="button" role="menuitem" className={item} onClick={run(() => openSys('kbd'))}>
        Keyboard shortcuts <span className="text-faint text-[11px] group-hover/row:text-white/70">?</span>
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
