import React, { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/OSProvider';
import { useWindow } from '../../context/WindowContext';
import PageLoader from './PageLoader';

/**
 * The window fiction (design.md §1, mock v1): one app opens in a window over the
 * desk — title bar with soft traffic lights + the app icon/name; not draggable,
 * not resizable. Red light (and Escape, and the menu bar's "Desktop") closes to
 * the desktop. Consumes useApp for the active app and useWindow for the app's
 * own chrome (breadcrumb + the right-hand slot where app-private data like the
 * FX rate renders). Renders the app via <Outlet/>.
 */
export default function AppWindow() {
  const { activeApp, closeToDesktop } = useApp();
  const { breadcrumb, titleRight } = useWindow();
  const location = useLocation();
  const bodyRef = useRef<HTMLDivElement>(null);

  // Escape closes the window — unless the user is typing in a control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      closeToDesktop();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeToDesktop]);

  // Apps scroll inside the window, so in-app navigation resets this pane
  // (window-level ScrollRestoration can't see it).
  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  if (!activeApp) return null;
  const Icon = activeApp.icon;

  return (
    <section
      aria-label={`${activeApp.name} window`}
      className="absolute inset-0 z-[2] lg:top-[22px] lg:left-10 lg:right-10 lg:bottom-[26px] bg-surface lg:border lg:border-hairline lg:rounded-[14px] os-window-shadow os-window-in flex flex-col overflow-hidden"
    >
      {/* Title bar */}
      <div className="h-10 shrink-0 flex items-center gap-2 px-3.5 bg-canvas border-b border-hairline">
        <span className="flex gap-[7px] mr-2 items-center">
          <button
            type="button"
            onClick={closeToDesktop}
            aria-label="Close window — back to desktop"
            className="w-[11px] h-[11px] rounded-full light-r hover:brightness-95 active:scale-90 transition duration-200 before:content-[''] before:absolute before:-inset-3.5 relative"
          />
          <i className="w-[11px] h-[11px] rounded-full light-y" aria-hidden="true" />
          <i className="w-[11px] h-[11px] rounded-full light-g" aria-hidden="true" />
        </span>
        <span className="text-accent flex" aria-hidden="true">
          <Icon className="w-[15px] h-[15px]" strokeWidth={1.5} />
        </span>
        <span className="text-[12.5px] font-bold text-ink">{activeApp.name}</span>
        {breadcrumb && <span className="text-[11.5px] text-faint truncate">{breadcrumb}</span>}
        {titleRight && <span className="ml-auto text-[11px] text-faint shrink-0">{titleRight}</span>}
      </div>

      {/* App content — the migrated interior renders on the Dragon canvas. */}
      <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto bg-canvas">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </div>
    </section>
  );
}
