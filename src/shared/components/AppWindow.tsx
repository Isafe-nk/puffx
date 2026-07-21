import React, { useEffect, useRef, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { useWindows, type WinInstance } from '../../context/OSProvider';
import { WindowProvider, useWindow } from '../../context/WindowContext';
import { APPS } from '../../navigation/apps';
import { SYSTEM } from '../../navigation/systemWindows';
import AppRoutes from '../../app/AppRoutes';
import SystemContent from './SystemContent';

const MIN = { w: 340, h: 240 };
const MENU = 42;
const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

// Win95 moss title frame (spec §5): icon + name (white) left; maximize (□) +
// close (×) right — no minimize. Double-click bar / □ → maximize; × → close. The
// bar is the drag handle. App-published chrome (breadcrumb, FX rate) sits inline.
function TitleBar({
  title,
  iconImg,
  onClose,
  onToggleMax,
  onDragStart,
}: {
  title: string;
  iconImg?: string;
  onClose: () => void;
  onToggleMax: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}) {
  const { titleRight } = useWindow();
  return (
    <div
      onMouseDown={onDragStart}
      onDoubleClick={onToggleMax}
      className="os-titlebar h-8 shrink-0 flex items-center gap-2 pl-[11px] pr-1 bg-accent cursor-move select-none max-lg:cursor-default"
    >
      {iconImg && <img src={iconImg} alt="" className="w-4 h-4 object-contain" />}
      <b className="text-[12.5px] font-semibold text-white">{title}</b>
      {titleRight && <span className="ml-3 text-[11px] text-white/70 shrink-0">{titleRight}</span>}
      <span className="ml-auto flex gap-[3px]">
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onToggleMax}
          aria-label="Maximize window"
          className="os-wcbtn w-[26px] h-5 flex items-center justify-center bg-surface text-ink rounded-[2px]"
        >
          <svg viewBox="0 0 12 12" className="w-[11px] h-[11px] fill-none stroke-current" strokeWidth={1.7}>
            <rect x="2.5" y="2.5" width="7" height="7" />
            <path d="M2.5 4.3h7" />
          </svg>
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          aria-label="Close window"
          className="os-wcbtn os-wcbtn-close w-[26px] h-5 flex items-center justify-center bg-surface text-ink rounded-[2px]"
        >
          <svg viewBox="0 0 12 12" className="w-[11px] h-[11px] fill-none stroke-current" strokeWidth={1.7}>
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </button>
      </span>
    </div>
  );
}

/**
 * One open window (spec §5): draggable by the title bar, resizable from the
 * corner (clamped [minSize, 90%]), click-to-focus (z-bump), close via red light
 * or Escape (when focused). App windows host their route in a per-window
 * MemoryRouter (keep-alive); system windows render a static dialog. Below lg it
 * fills the viewport — no drag/resize.
 */
export default function AppWindow({ win, isFocused }: { win: WinInstance; isFocused: boolean }) {
  const { focusWindow, closeWindow, moveWindow, resizeWindow, toggleMaximize } = useWindows();

  const app = win.appId ? APPS.find((a) => a.id === win.appId) : undefined;
  const sys = win.sysId ? SYSTEM[win.sysId] : undefined;
  const title = app?.name ?? sys?.title ?? '';
  const iconImg = app?.iconImg ?? sys?.iconImg;
  const min = app?.minSize ?? MIN;

  const [box, setBox] = useState({ x: win.x, y: win.y, w: win.w, h: win.h });
  useEffect(() => setBox({ x: win.x, y: win.y, w: win.w, h: win.h }), [win.x, win.y, win.w, win.h]);

  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const rez = useRef<{ sx: number; sy: number; sw: number; sh: number } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (drag.current) {
        const x = Math.max(0, Math.min(e.clientX - drag.current.dx, window.innerWidth - 120));
        const y = Math.max(0, Math.min(e.clientY - drag.current.dy, window.innerHeight - 40));
        setBox((b) => ({ ...b, x, y }));
      } else if (rez.current) {
        const maxW = window.innerWidth * 0.9;
        const maxH = (window.innerHeight - MENU) * 0.9;
        const w = Math.min(Math.max(min.w, rez.current.sw + e.clientX - rez.current.sx), maxW);
        const h = Math.min(Math.max(min.h, rez.current.sh + e.clientY - rez.current.sy), maxH);
        setBox((b) => ({ ...b, w, h }));
      }
    };
    const onUp = () => {
      if (drag.current) {
        drag.current = null;
        setBox((b) => { moveWindow(win.id, b.x, b.y); return b; });
      }
      if (rez.current) {
        rez.current = null;
        setBox((b) => { resizeWindow(win.id, b.w, b.h); return b; });
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [win.id, min.w, min.h, moveWindow, resizeWindow]);

  // Escape closes the frontmost window (unless typing in a field).
  useEffect(() => {
    if (!isFocused) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      closeWindow(win.id);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isFocused, win.id, closeWindow]);

  const startDrag = (e: React.MouseEvent) => {
    if (!isDesktop() || win.maximized) return;
    drag.current = { dx: e.clientX - box.x, dy: e.clientY - box.y };
  };
  const startResize = (e: React.MouseEvent) => {
    if (!isDesktop()) return;
    e.stopPropagation();
    rez.current = { sx: e.clientX, sy: e.clientY, sw: box.w, sh: box.h };
  };

  const maxed = win.maximized;
  return (
    <section
      aria-label={`${title} window`}
      onMouseDown={() => focusWindow(win.id)}
      style={maxed ? { zIndex: win.z } : { left: box.x, top: box.y, width: box.w, height: box.h, zIndex: win.z }}
      className={`os-appwin os-window-in absolute flex flex-col rounded-[6px] overflow-hidden max-lg:!inset-0 max-lg:!w-auto max-lg:!h-auto max-lg:!rounded-none ${
        maxed ? '!inset-0 !w-auto !h-auto !rounded-none' : ''
      }`}
    >
      <WindowProvider>
        <TitleBar
          title={title}
          iconImg={iconImg}
          onClose={() => closeWindow(win.id)}
          onToggleMax={() => toggleMaximize(win.id)}
          onDragStart={startDrag}
        />
        <div className="flex-1 min-h-0 overflow-auto bg-canvas">
          {win.sysId ? (
            <SystemContent sysId={win.sysId} />
          ) : (
            <MemoryRouter initialEntries={[win.path]}>
              <AppRoutes />
            </MemoryRouter>
          )}
        </div>
      </WindowProvider>
      {win.resizable && !maxed && (
        <span
          onMouseDown={startResize}
          className="hidden lg:block absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize os-resize"
          aria-hidden="true"
        />
      )}
    </section>
  );
}
