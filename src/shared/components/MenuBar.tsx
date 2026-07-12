import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PuffxApp } from '../../navigation/apps';

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

/**
 * The OS chrome across the top (design.md §1): Puffx mark + current app name +
 * menus left, clock right. Inside an app it carries "Desktop" — the visible
 * way home. App data (FX rates etc.) never lives here.
 */
export default function MenuBar({ app }: { app?: PuffxApp }) {
  return (
    <header className="h-[30px] shrink-0 flex items-center gap-5 px-3.5 bg-surface/85 border-b border-hairline text-[12px] text-body relative z-30">
      <Link
        to="/"
        aria-label="Puffx OS desktop"
        className="w-[17px] h-[17px] rounded-[5px] bg-accent text-white text-[11px] font-extrabold flex items-center justify-center leading-none shrink-0 active:scale-90 transition duration-200"
      >
        p
      </Link>
      <span className="font-bold text-ink">{app ? app.name : 'Puffx OS'}</span>

      {app ? (
        <Link to="/" className="text-mute hover:text-ink transition-colors">
          Desktop
        </Link>
      ) : (
        <>
          <Link to="/learn" className="text-mute hover:text-ink transition-colors">Learn</Link>
          <span className="text-mute" aria-hidden="true">Tools</span>
          <Link to="/glossary" className="text-mute hover:text-ink transition-colors">Glossary</Link>
          <span className="text-mute" aria-hidden="true">Help</span>
        </>
      )}

      <span className="ml-auto flex items-center gap-3.5">
        <Clock />
      </span>
    </header>
  );
}
