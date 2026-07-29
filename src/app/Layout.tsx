import React, { useState } from 'react';
import MenuBar from '../shared/components/MenuBar';
import Desktop from '../shared/components/Desktop';
import AppWindow from '../shared/components/AppWindow';
import ContextMenu from '../shared/components/ContextMenu';
import { OSProvider, useWindows } from '../context/OSProvider';

/**
 * The Puffx OS shell (spec/os-shell.md §1, multi-window): a beveled menu bar on
 * top, the desktop as the permanent ground, and each open window floating over
 * it (draggable / resizable / stacking). Right-clicking the wallpaper opens the
 * desktop context menu.
 */
function Shell() {
  const { windows, focused, wallpaper } = useWindows();
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="os-shell h-screen flex flex-col bg-canvas text-ink font-display antialiased overflow-hidden">
      <a
        href="#main"
        className="sr-only cursor-pointer focus:not-sr-only focus:fixed focus:top-11 focus:left-3 focus:z-[400] focus:bg-surface focus:text-ink focus:text-xs focus:font-semibold focus:px-4 focus:py-2 focus:rounded-md focus:border focus:border-hairline"
      >
        Skip to main content
      </a>

      <MenuBar />

      <main
        id="main"
        className="relative flex-1 min-h-0 os-wallpaper"
        style={{ backgroundImage: `url("${wallpaper}")` }}
        onContextMenu={(e) => {
          e.preventDefault();
          setCtx({ x: e.clientX, y: e.clientY });
        }}
      >
        <Desktop />
        {windows.map((win) => (
          <AppWindow key={win.id} win={win} isFocused={focused?.id === win.id} />
        ))}
      </main>

      {ctx && <ContextMenu x={ctx.x} y={ctx.y} onClose={() => setCtx(null)} />}
    </div>
  );
}

export default function Layout() {
  return (
    <OSProvider>
      <Shell />
    </OSProvider>
  );
}
