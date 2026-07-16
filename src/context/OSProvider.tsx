import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { APPS, matchApp, type PuffxApp } from '../navigation/apps';

// One open window (spec §4). x/y are relative to the desktop area (below the
// menu bar); z is the stacking order (focused = highest).
export interface WinInstance {
  id: number;
  appId: string;
  path: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

const WALLPAPERS = ['/bgimage.png', '/bgimage2.png'];
const WP_KEY = 'puffx:wallpaper';

const readWallpaper = (): string => {
  try {
    const v = typeof window !== 'undefined' ? window.localStorage.getItem(WP_KEY) : null;
    return v && WALLPAPERS.includes(v) ? v : WALLPAPERS[0];
  } catch {
    return WALLPAPERS[0];
  }
};

interface State {
  windows: WinInstance[];
  nextId: number;
  z: number;
  wallpaper: string;
}

type Action =
  | { type: 'open'; appId: string; path?: string }
  | { type: 'close'; id: number }
  | { type: 'focus'; id: number }
  | { type: 'move'; id: number; x: number; y: number }
  | { type: 'resize'; id: number; w: number; h: number }
  | { type: 'cycleWallpaper' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'open': {
      const app = APPS.find((x) => x.id === a.appId);
      if (!app || app.comingSoon) return s;
      const existing = s.windows.find((w) => w.appId === a.appId);
      const z = s.z + 1;
      if (existing) {
        // Focus the existing window; retarget its path if one was requested.
        return {
          ...s,
          z,
          windows: s.windows.map((w) =>
            w.id === existing.id ? { ...w, z, path: a.path ?? w.path } : w
          ),
        };
      }
      const n = s.windows.length;
      const size = app.defaultSize ?? { w: 560, h: 390 };
      const win: WinInstance = {
        id: s.nextId,
        appId: a.appId,
        path: a.path ?? app.path,
        x: 120 + n * 30,
        y: 24 + n * 26,
        w: size.w,
        h: size.h,
        z,
      };
      return { ...s, z, nextId: s.nextId + 1, windows: [...s.windows, win] };
    }
    case 'close':
      return { ...s, windows: s.windows.filter((w) => w.id !== a.id) };
    case 'focus': {
      const w = s.windows.find((x) => x.id === a.id);
      if (!w || w.z === s.z) return s; // already frontmost
      const z = s.z + 1;
      return { ...s, z, windows: s.windows.map((x) => (x.id === a.id ? { ...x, z } : x)) };
    }
    case 'move':
      return { ...s, windows: s.windows.map((w) => (w.id === a.id ? { ...w, x: a.x, y: a.y } : w)) };
    case 'resize':
      return { ...s, windows: s.windows.map((w) => (w.id === a.id ? { ...w, w: a.w, h: a.h } : w)) };
    case 'cycleWallpaper': {
      const next = WALLPAPERS[(WALLPAPERS.indexOf(s.wallpaper) + 1) % WALLPAPERS.length];
      try {
        window.localStorage.setItem(WP_KEY, next);
      } catch {
        /* ignore */
      }
      return { ...s, wallpaper: next };
    }
    default:
      return s;
  }
}

// Deep-link seed: if the app boots at an app path, open that window (spec §8).
function init(): State {
  const base: State = { windows: [], nextId: 1, z: 100, wallpaper: readWallpaper() };
  const app = typeof window !== 'undefined' ? matchApp(window.location.pathname) : undefined;
  if (!app) return base;
  return reducer(base, { type: 'open', appId: app.id, path: window.location.pathname });
}

interface OSContextValue {
  windows: WinInstance[];
  focused: WinInstance | undefined;
  apps: PuffxApp[];
  wallpaper: string;
  openApp: (appId: string, path?: string) => void;
  closeWindow: (id: number) => void;
  focusWindow: (id: number) => void;
  moveWindow: (id: number, x: number, y: number) => void;
  resizeWindow: (id: number, w: number, h: number) => void;
  cycleWallpaper: () => void;
  clearData: () => void;
}

const OSContext = createContext<OSContextValue | null>(null);

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  const openApp = useCallback((appId: string, path?: string) => dispatch({ type: 'open', appId, path }), []);
  const closeWindow = useCallback((id: number) => dispatch({ type: 'close', id }), []);
  const focusWindow = useCallback((id: number) => dispatch({ type: 'focus', id }), []);
  const moveWindow = useCallback((id: number, x: number, y: number) => dispatch({ type: 'move', id, x, y }), []);
  const resizeWindow = useCallback((id: number, w: number, h: number) => dispatch({ type: 'resize', id, w, h }), []);
  const cycleWallpaper = useCallback(() => dispatch({ type: 'cycleWallpaper' }), []);

  // Privacy-first reset: wipe everything we persist and reload to a clean desk.
  const clearData = useCallback(() => {
    try {
      window.localStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.assign('/');
  }, []);

  const focused = useMemo(
    () => state.windows.reduce<WinInstance | undefined>((top, w) => (!top || w.z > top.z ? w : top), undefined),
    [state.windows]
  );

  const value = useMemo<OSContextValue>(
    () => ({
      windows: state.windows,
      focused,
      apps: APPS,
      wallpaper: state.wallpaper,
      openApp,
      closeWindow,
      focusWindow,
      moveWindow,
      resizeWindow,
      cycleWallpaper,
      clearData,
    }),
    [state.windows, state.wallpaper, focused, openApp, closeWindow, focusWindow, moveWindow, resizeWindow, cycleWallpaper, clearData]
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useWindows(): OSContextValue {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useWindows must be used within <OSProvider>');
  return ctx;
}
