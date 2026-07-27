import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { APPS, matchApp, type PuffxApp } from '../navigation/apps';
import { SYSTEM } from '../navigation/systemWindows';

// One open window (spec §4). x/y are relative to the desk (below the menu bar);
// z is the stacking order (focused = highest). Either appId (an app window) or
// sysId (a system window) is set.
export interface WinInstance {
  id: number;
  appId?: string;
  sysId?: string;
  path: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  resizable: boolean;
  maximized?: boolean;
  /** True only when the open was user-initiated — a click on an icon, a menu
   * item or a widget. False when the window was materialised from a deep link
   * or a restored session, which mounts in its resting state with no entry
   * transition (spec/motion.md §2.4; otherwise a reload fires a cascade of
   * pops). Fixed at creation — maximize/restore must never replay the entry. */
  animateOpen: boolean;
  /** The exit transition is running; the window unmounts when it ends
   * (spec/motion.md §2.3). Cleared if the app is reopened mid-close, which
   * lets the transition reverse instead of restarting. */
  closing?: boolean;
}

const MENU = 42; // menu-bar height; the desk starts below it
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

const clamp = (v: number, lo: number, hi: number) => Math.round(Math.min(Math.max(v, lo), hi));

interface State {
  windows: WinInstance[];
  nextId: number;
  z: number;
  wallpaper: string;
}

interface Viewport {
  vw: number;
  vh: number;
}

type Action =
  | ({ type: 'open'; appId: string; path?: string; animate: boolean } & Viewport)
  | ({ type: 'openSys'; sysId: string; animate: boolean } & Viewport)
  | { type: 'beginClose'; id: number }
  | { type: 'close'; id: number }
  | { type: 'focus'; id: number }
  | { type: 'move'; id: number; x: number; y: number }
  | { type: 'resize'; id: number; w: number; h: number }
  | { type: 'toggleMax'; id: number }
  | { type: 'setWallpaper'; path: string };

// PostHog window placement (context/App.tsx getPositionDefaults): first window
// centred; each next cascades +26px off the frontmost; re-centre when it drifts
// >⅔ of its width past the screen midpoint.
function placement(windows: WinInstance[], vw: number, deskH: number, ww: number, wh: number) {
  const centre = { x: Math.round(vw / 2 - ww / 2), y: Math.round((deskH - wh) / 2) };
  if (!windows.length) return centre;
  const prev = windows.reduce((a, b) => (a.z > b.z ? a : b));
  const px = prev.x + 26;
  const py = prev.y + 26;
  const onRight = Math.max(0, px + ww - vw / 2) / ww;
  return onRight > 2 / 3 ? centre : { x: px, y: py };
}

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'open': {
      const app = APPS.find((x) => x.id === a.appId);
      if (!app || app.comingSoon) return s;
      const existing = s.windows.find((w) => w.appId === a.appId);
      const z = s.z + 1;
      if (existing) {
        // Already open: focus, never re-pop (spec/motion.md §8). Clearing
        // `closing` is what makes reopening mid-close *reverse* the exit
        // transition rather than restart the window.
        return {
          ...s,
          z,
          windows: s.windows.map((w) =>
            w.id === existing.id ? { ...w, z, path: a.path ?? w.path, closing: false } : w
          ),
        };
      }
      const deskH = a.vh - MENU;
      const frac = app.defaultSize ?? { w: 0.64, h: 0.8 };
      const ww = clamp(frac.w * a.vw, a.vw * 0.2, a.vw * 0.9);
      const wh = clamp(frac.h * deskH, deskH * 0.2, deskH * 0.9);
      const { x, y } = placement(s.windows, a.vw, deskH, ww, wh);
      const win: WinInstance = { id: s.nextId, appId: a.appId, path: a.path ?? app.path, x, y, w: ww, h: wh, z, resizable: true, animateOpen: a.animate };
      return { ...s, z, nextId: s.nextId + 1, windows: [...s.windows, win] };
    }
    case 'openSys': {
      const sys = SYSTEM[a.sysId];
      if (!sys) return s;
      const existing = s.windows.find((w) => w.sysId === a.sysId);
      const z = s.z + 1;
      if (existing) {
        return { ...s, z, windows: s.windows.map((w) => (w.id === existing.id ? { ...w, z, closing: false } : w)) };
      }
      const deskH = a.vh - MENU;
      // Fixed dialogs keep their px size; resizable ones cap to 90% of the desk.
      const ww = sys.resizable ? clamp(sys.w, 0, a.vw * 0.9) : sys.w;
      const wh = sys.resizable ? clamp(sys.h, 0, deskH * 0.9) : sys.h;
      const x = Math.round(a.vw / 2 - ww / 2);
      const y = Math.round((deskH - wh) / 2);
      const win: WinInstance = { id: s.nextId, sysId: a.sysId, path: '', x, y, w: ww, h: wh, z, resizable: sys.resizable, animateOpen: a.animate };
      return { ...s, z, nextId: s.nextId + 1, windows: [...s.windows, win] };
    }
    // Close is two steps (spec/motion.md §2.3): `beginClose` flags the window so
    // the exit transition can run, and `close` — dispatched from the window's
    // own transitionend — is what actually unmounts it.
    case 'beginClose':
      return { ...s, windows: s.windows.map((w) => (w.id === a.id ? { ...w, closing: true } : w)) };
    case 'close':
      return { ...s, windows: s.windows.filter((w) => w.id !== a.id) };
    case 'focus': {
      const w = s.windows.find((x) => x.id === a.id);
      if (!w || w.z === s.z) return s;
      const z = s.z + 1;
      return { ...s, z, windows: s.windows.map((x) => (x.id === a.id ? { ...x, z } : x)) };
    }
    case 'move':
      return { ...s, windows: s.windows.map((w) => (w.id === a.id ? { ...w, x: a.x, y: a.y } : w)) };
    case 'resize':
      return { ...s, windows: s.windows.map((w) => (w.id === a.id ? { ...w, w: a.w, h: a.h } : w)) };
    case 'toggleMax':
      return { ...s, windows: s.windows.map((w) => (w.id === a.id ? { ...w, maximized: !w.maximized } : w)) };
    case 'setWallpaper': {
      if (!WALLPAPERS.includes(a.path)) return s;
      try {
        window.localStorage.setItem(WP_KEY, a.path);
      } catch {
        /* ignore */
      }
      return { ...s, wallpaper: a.path };
    }
    default:
      return s;
  }
}

// Deep-link seed: if the app boots at an app path, open that window (spec §8).
// `animate: false` — nobody clicked, so it appears in its resting state with no
// entry pop (spec/motion.md §2.4).
function init(): State {
  const base: State = { windows: [], nextId: 1, z: 100, wallpaper: readWallpaper() };
  if (typeof window === 'undefined') return base;
  const app = matchApp(window.location.pathname);
  if (!app) return base;
  return reducer(base, { type: 'open', appId: app.id, path: window.location.pathname, animate: false, vw: window.innerWidth, vh: window.innerHeight });
}

const vp = (): Viewport => ({ vw: window.innerWidth, vh: window.innerHeight });

interface OSContextValue {
  windows: WinInstance[];
  focused: WinInstance | undefined;
  apps: PuffxApp[];
  wallpaper: string;
  wallpapers: string[];
  openApp: (appId: string, path?: string) => void;
  openSys: (sysId: string) => void;
  /** Flag the window as closing so its exit transition can run. */
  beginClose: (id: number) => void;
  /** Unmount the window. Call this from the window's own transitionend, not
   * from the × handler — see spec/motion.md §2.3. */
  closeWindow: (id: number) => void;
  focusWindow: (id: number) => void;
  moveWindow: (id: number, x: number, y: number) => void;
  resizeWindow: (id: number, w: number, h: number) => void;
  toggleMaximize: (id: number) => void;
  setWallpaper: (path: string) => void;
  clearData: () => void;
}

const OSContext = createContext<OSContextValue | null>(null);

export function OSProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  // Every openApp/openSys call site is a click (rail icon, menu item, widget,
  // context menu), so these animate; the only non-animating open is the
  // deep-link seed in init().
  const openApp = useCallback((appId: string, path?: string) => dispatch({ type: 'open', appId, path, animate: true, ...vp() }), []);
  const openSys = useCallback((sysId: string) => dispatch({ type: 'openSys', sysId, animate: true, ...vp() }), []);
  const beginClose = useCallback((id: number) => dispatch({ type: 'beginClose', id }), []);
  const closeWindow = useCallback((id: number) => dispatch({ type: 'close', id }), []);
  const focusWindow = useCallback((id: number) => dispatch({ type: 'focus', id }), []);
  const moveWindow = useCallback((id: number, x: number, y: number) => dispatch({ type: 'move', id, x, y }), []);
  const resizeWindow = useCallback((id: number, w: number, h: number) => dispatch({ type: 'resize', id, w, h }), []);
  const toggleMaximize = useCallback((id: number) => dispatch({ type: 'toggleMax', id }), []);
  const setWallpaper = useCallback((path: string) => dispatch({ type: 'setWallpaper', path }), []);

  const clearData = useCallback(() => {
    try {
      window.localStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.assign('/');
  }, []);

  // A closing window is on its way out: it must not hold focus or swallow the
  // Escape key while its exit transition plays.
  const focused = useMemo(
    () => state.windows.reduce<WinInstance | undefined>((top, w) => (w.closing || (top && w.z <= top.z) ? top : w), undefined),
    [state.windows]
  );

  const value = useMemo<OSContextValue>(
    () => ({
      windows: state.windows,
      focused,
      apps: APPS,
      wallpaper: state.wallpaper,
      wallpapers: WALLPAPERS,
      openApp,
      openSys,
      beginClose,
      closeWindow,
      focusWindow,
      moveWindow,
      resizeWindow,
      toggleMaximize,
      setWallpaper,
      clearData,
    }),
    [state.windows, state.wallpaper, focused, openApp, openSys, beginClose, closeWindow, focusWindow, moveWindow, resizeWindow, toggleMaximize, setWallpaper, clearData]
  );

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useWindows(): OSContextValue {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useWindows must be used within <OSProvider>');
  return ctx;
}
