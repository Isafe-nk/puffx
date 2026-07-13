import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// A per-app menu-bar entry. Seam for later (spec §9): apps may leave `menu`
// empty; when one needs real menus, it publishes them here.
export interface MenuItem {
  label: string;
  to?: string;
  onClick?: () => void;
}

// The app's own window chrome (spec/os-shell.md §5) — separate from the OS
// kernel so app chrome and OS chrome don't tangle. This is where app-private
// data (e.g. ETF Drag's MYR/USD rate) lives: the app sets it, the window +
// menu bar read it, and nothing else sees it.
export interface WindowChrome {
  title?: string;
  breadcrumb?: string;
  menu?: MenuItem[];
  /** App-private chrome data rendered in the window title-bar right slot. */
  titleRight?: React.ReactNode;
}

interface WindowContextValue extends WindowChrome {
  setWindow: (patch: WindowChrome) => void;
}

const WindowContext = createContext<WindowContextValue | null>(null);

/**
 * Holds one app's window chrome. Mounted per-app (keyed on the active app id),
 * so switching apps resets the chrome and no stale title/menu leaks across.
 * Note: mounted above MenuBar in the shell — see the Layout comment for why it
 * isn't literally inside AppWindow.
 */
export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [chrome, setChrome] = useState<WindowChrome>({});
  const setWindow = useCallback((patch: WindowChrome) => {
    setChrome((prev) => ({ ...prev, ...patch }));
  }, []);
  const value = useMemo<WindowContextValue>(() => ({ ...chrome, setWindow }), [chrome, setWindow]);
  return <WindowContext.Provider value={value}>{children}</WindowContext.Provider>;
}

export function useWindow(): WindowContextValue {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindow must be used within <WindowProvider>');
  return ctx;
}

/**
 * The hook an app calls on mount to publish its window chrome (spec §5/§10).
 * `deps` controls when the chrome re-publishes (e.g. `[title]`, or
 * `[rate, showInUsd]` for live data). The provider is keyed per-app so there's
 * no cross-app leak; within an app, deps drive updates.
 */
export function useSetWindow(chrome: WindowChrome, deps: React.DependencyList) {
  const { setWindow } = useWindow();
  useEffect(() => {
    setWindow(chrome);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
