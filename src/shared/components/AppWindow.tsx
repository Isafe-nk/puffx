import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { PuffxApp } from '../../navigation/apps';

/**
 * The window fiction (design.md §1, mock v1): one app at a time opens in a
 * window floating over the desk — title bar with soft traffic lights and the
 * app's icon + name; not draggable, not resizable. The red light (and Escape,
 * and the menu bar's "Desktop") closes back to the desktop. Below lg the
 * window fills the desk area with a slim title bar.
 */
export default function AppWindow({ app, children }: { app: PuffxApp; children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const bodyRef = useRef<HTMLDivElement>(null);
  const Icon = app.icon;

  // Escape closes the window — unless the user is typing in a control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const t = e.target as HTMLElement | null;
      if (t && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      navigate('/');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);

  // Apps scroll inside the window, so in-app navigation resets this pane
  // (window-level ScrollRestoration can't see it).
  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <section
      aria-label={`${app.name} window`}
      className="absolute inset-0 lg:top-[22px] lg:left-10 lg:right-10 lg:bottom-[26px] bg-surface lg:border lg:border-hairline lg:rounded-[12px] os-window-shadow flex flex-col overflow-hidden"
    >
      {/* Title bar */}
      <div className="h-10 shrink-0 flex items-center gap-2 px-3.5 bg-canvas border-b border-hairline">
        <span className="flex gap-[7px] mr-2 items-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            aria-label="Close window — back to desktop"
            className="w-[11px] h-[11px] rounded-full light-r hover:brightness-95 active:scale-90 transition duration-200 before:content-[''] before:absolute before:-inset-3.5 relative"
          />
          <i className="w-[11px] h-[11px] rounded-full light-y" aria-hidden="true" />
          <i className="w-[11px] h-[11px] rounded-full light-g" aria-hidden="true" />
        </span>
        <span className="text-accent flex" aria-hidden="true">
          <Icon className="w-[15px] h-[15px]" strokeWidth={1.5} />
        </span>
        <span className="text-[12.5px] font-bold text-ink">{app.name}</span>
      </div>

      {/* App content — the migrated interior renders on the Dragon canvas. */}
      <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto bg-canvas">
        {children}
      </div>
    </section>
  );
}
