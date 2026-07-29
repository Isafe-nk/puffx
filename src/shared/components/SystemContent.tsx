import React from 'react';
import { useWindows } from '../../context/OSProvider';

// Bodies for the system windows (spec §9). Small, static dialogs; Display wires
// the wallpaper picker to the store.

function Shell({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="h-full overflow-auto px-8 py-7">
      <h2 className="text-[21px] font-extrabold tracking-[-0.02em] text-ink mb-2.5">{heading}</h2>
      {children}
    </div>
  );
}

function About() {
  return (
    <Shell heading="Puffx">
      <p className="text-[13.5px] leading-relaxed text-body max-w-[52ch]">
        A free, private, Malaysia-first operating system for your money — a course, a glossary, and
        visualizers for the true cost of investing. No account, no selling. Educational only — not
        financial advice.
      </p>
    </Shell>
  );
}

function Display() {
  const { wallpapers, wallpaper, setWallpaper } = useWindows();
  return (
    <Shell heading="Wallpaper">
      <p className="text-[13px] text-mute mb-4">Choose your desktop background.</p>
      <div className="grid grid-cols-2 gap-3 max-w-[440px]">
        {wallpapers.map((wp) => {
          const active = wp === wallpaper;
          return (
            <button
              key={wp}
              type="button"
              onClick={() => setWallpaper(wp)}
              aria-pressed={active}
              className={`h-[100px] rounded-[6px] bg-cover bg-center cursor-pointer transition ${active ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : 'border-2 border-hairline hover:border-mute'}`}
              style={{ backgroundImage: `url("${wp}")` }}
            />
          );
        })}
      </div>
    </Shell>
  );
}

function Row({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <kbd className="font-mono text-[11px] text-ink bg-canvas border border-hairline rounded px-1.5 py-0.5 min-w-[70px] text-center">{keys}</kbd>
      <span className="text-[13px] text-body">{desc}</span>
    </div>
  );
}

function Keyboard() {
  return (
    <Shell heading="Keyboard shortcuts">
      <div className="mt-1">
        <Row keys="Esc" desc="Close the focused window" />
        <Row keys="Click" desc="Open an app from the desktop or menu" />
        <Row keys="Right-click" desc="Open the desktop menu" />
        <Row keys="Tab" desc="Move between controls; focus rings show where you are" />
      </div>
    </Shell>
  );
}

export default function SystemContent({ sysId }: { sysId: string }) {
  if (sysId === 'about') return <About />;
  if (sysId === 'display') return <Display />;
  if (sysId === 'kbd') return <Keyboard />;
  return null;
}
