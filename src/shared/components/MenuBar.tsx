import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/OSProvider';
import { useWindow } from '../../context/WindowContext';

// "Sun 13 Jul · 9:41" — the mock's clock format, minute resolution.
function formatClock(d: Date): string {
  const day = d.toLocaleDateString('en-GB', { weekday: 'short' });
  const date = d.getDate();
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${date} ${month} · ${h}:${m}`;
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // Tick on the minute boundary so the clock never shows a stale minute.
    let interval: ReturnType<typeof setInterval> | undefined;
    const align = setTimeout(() => {
      setNow(new Date());
      interval = setInterval(() => setNow(new Date()), 60_000);
    }, (60 - new Date().getSeconds()) * 1000);
    return () => {
      clearTimeout(align);
      if (interval) clearInterval(interval);
    };
  }, []);
  return <span className="font-mono text-[11.5px] text-mute">{formatClock(now)}</span>;
}

const menuCls = 'text-mute hover:text-ink transition-colors';

/**
 * The OS chrome across the top (design.md §1). Reads the OS kernel (useApp) for
 * which app is open and the per-app window chrome (useWindow) for that app's
 * menu entries. In an app it shows the app name + a "Desktop" way home + the
 * app's own menus; on the desktop it shows the section shortcuts. App-private
 * data (FX rates etc.) never lives here — it belongs to the window (useWindow).
 */
export default function MenuBar() {
  const { activeApp, closeToDesktop } = useApp();
  const { menu } = useWindow();

  return (
    <header className="h-[30px] shrink-0 flex items-center gap-5 px-3.5 bg-surface/85 border-b border-hairline text-[12px] text-body relative z-30">
      <Link
        to="/"
        aria-label="Puffx OS desktop"
        className="w-[17px] h-[17px] rounded-[5px] bg-accent text-white text-[11px] font-extrabold flex items-center justify-center leading-none shrink-0 active:scale-90 transition duration-200"
      >
        p
      </Link>
      <span className="font-bold text-ink">{activeApp ? activeApp.name : 'Puffx OS'}</span>

      {activeApp ? (
        <>
          <button type="button" onClick={closeToDesktop} className={menuCls}>
            Desktop
          </button>
          {/* Per-app menus (seam §9) — populated by the app via useWindow */}
          {menu?.map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className={menuCls}>
                {item.label}
              </Link>
            ) : (
              <button key={item.label} type="button" onClick={item.onClick} className={menuCls}>
                {item.label}
              </button>
            )
          )}
        </>
      ) : (
        <>
          <Link to="/learn" className={menuCls}>Learn</Link>
          <span className={menuCls} aria-hidden="true">Tools</span>
          <Link to="/glossary" className={menuCls}>Glossary</Link>
          <span className={menuCls} aria-hidden="true">Help</span>
        </>
      )}

      <span className="ml-auto flex items-center gap-3.5">
        <Clock />
      </span>
    </header>
  );
}
