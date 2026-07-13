import React from 'react';
import { ScrollRestoration } from 'react-router-dom';
import MenuBar from '../shared/components/MenuBar';
import Desktop from '../shared/components/Desktop';
import AppWindow from '../shared/components/AppWindow';
import { OSProvider, useApp } from '../context/OSProvider';
import { WindowProvider } from '../context/WindowContext';

/**
 * The Puffx OS shell (design.md §1). Consumes the OS kernel (useApp) instead of
 * reading the router directly: menu bar on top, the desktop as permanent ground,
 * and — when the URL resolves to an app — that app's window floating over the
 * desk. One window at a time; the desktop underneath goes inert.
 *
 * WindowProvider is keyed on the active app and mounted ABOVE MenuBar (not
 * literally inside AppWindow as spec §5 phrases it): the menu bar renders the
 * app's per-app menus/title, and a React provider must be an ancestor of every
 * consumer — MenuBar included. AppWindow still owns the title-bar rendering and
 * apps still publish via useSetWindow; the context boundary just sits one level up.
 */
function Shell() {
  const { activeApp } = useApp();

  return (
    <WindowProvider key={activeApp?.id ?? 'desktop'}>
      <div className="os-shell h-screen flex flex-col bg-canvas text-ink font-display antialiased overflow-hidden">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-10 focus:left-3 focus:z-[100] focus:bg-surface focus:text-ink focus:text-xs focus:font-semibold focus:px-4 focus:py-2 focus:rounded-md focus:border focus:border-hairline"
        >
          Skip to main content
        </a>

        <MenuBar />

        <main id="main" className="relative flex-1 min-h-0 os-wallpaper">
          <div inert={!!activeApp} className="h-full">
            <Desktop />
          </div>
          {activeApp && <AppWindow />}
        </main>

        <ScrollRestoration />
      </div>
    </WindowProvider>
  );
}

export default function Layout() {
  return (
    <OSProvider>
      <Shell />
    </OSProvider>
  );
}
