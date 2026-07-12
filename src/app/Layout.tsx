import React, { Suspense } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import MenuBar from '../shared/components/MenuBar';
import Desktop from '../shared/components/Desktop';
import AppWindow from '../shared/components/AppWindow';
import PageLoader from '../shared/components/PageLoader';
import { matchApp } from '../navigation/apps';

/**
 * The Puffx OS shell (design.md §1): menu bar on top, the desktop as the
 * permanent ground, and — when a route belongs to an app — that app's window
 * floating over the desk. One window at a time; the desktop underneath goes
 * inert while a window is open. Replaces the SideNav-era chrome.
 */
export default function Layout() {
  const { pathname } = useLocation();
  const app = matchApp(pathname);

  return (
    <div className="os-shell h-screen flex flex-col bg-canvas text-ink font-display antialiased overflow-hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-10 focus:left-3 focus:z-[100] focus:bg-surface focus:text-ink focus:text-xs focus:font-semibold focus:px-4 focus:py-2 focus:rounded-md focus:border focus:border-hairline"
      >
        Skip to main content
      </a>

      <MenuBar app={app} />

      <main id="main" className="relative flex-1 min-h-0 os-wallpaper">
        <div inert={!!app} className="h-full">
          <Desktop />
        </div>

        {app && (
          <AppWindow app={app}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </AppWindow>
        )}
      </main>

      <ScrollRestoration />
    </div>
  );
}
