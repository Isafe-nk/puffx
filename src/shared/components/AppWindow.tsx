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

// Title bar — reads the app's published chrome (useWindow) for the breadcrumb +
// right slot (e.g. ETF Drag's FX rate). Title/icon are passed in (app or system).
function TitleBar({ title, iconImg, onClose, onDragStart }: { title: string; iconImg?: string; onClose: () => void; onDragStart: (e: React.MouseEvent) => void }) {
  const { breadcrumb, titleRight } = useWindow();
  return (
    <div
      onMouseDown={onDragStart}
      className="h-[38px] shrink-0 flex items-center gap-[9px] px-[13px] bg-canvas border-b border-hairline cursor-move select-none max-lg:cursor-default"
    >
      <span className="flex gap-[7px] items-center">
        <button
          type="button"
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Close window"
          className="w-[11px] h-[11px] rounded-full light-r hover:brightness-95 active:scale-90 transition"
        />
        <i className="w-[11px] h-[11px] rounded-full light-y" aria-hidden="true" />
        <i className="w-[11px] h-[11px] rounded-full light-g" aria-hidden="true" />
      </span>
      {iconImg && <img src={iconImg} alt="" className="w-4 h-4 object-contain" />}
      <b className="text-[12.5px] text-ink font-bold">{title}</b>
      {breadcrumb && <span className="text-[11.5px] text-faint truncate">{breadcrumb}</span>}
      {titleRight && <span className="ml-auto text-[11px] text-faint shrink-0">{titleRight}</span>}
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
  const { focusWindow, closeWindow, moveWindow, resizeWindow } = useWindows();

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
    if (!isDesktop()) return;
    drag.current = { dx: e.clientX - box.x, dy: e.clientY - box.y };
  };
  const startResize = (e: React.MouseEvent) => {
    if (!isDesktop()) return;
    e.stopPropagation();
    rez.current = { sx: e.clientX, sy: e.clientY, sw: box.w, sh: box.h };
  };

  return (
    <section
      aria-label={`${title} window`}
      onMouseDown={() => focusWindow(win.id)}
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, zIndex: win.z }}
      className="os-appwin os-window-in absolute flex flex-col rounded-[6px] overflow-hidden max-lg:!inset-0 max-lg:!w-auto max-lg:!h-auto max-lg:!rounded-none"
    >
      <WindowProvider>
        <TitleBar title={title} iconImg={iconImg} onClose={() => closeWindow(win.id)} onDragStart={startDrag} />
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
      {win.resizable && (
        <span
          onMouseDown={startResize}
          className="hidden lg:block absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize os-resize"
          aria-hidden="true"
        />
      )}
    </section>
  );
}
