# spec/os-shell.md — Puffx OS wrapper (architecture)

The architecture contract for the OS shell. `design.md` governs how it *looks*; this governs how it's
*built*. Scope: the wrapper that turns our features into "apps on a desktop." Not the app interiors
(those are fluid window contents — see §7).

Derived from studying PostHog's `posthog.com` desktop implementation. **v2 decision (2026-07-16): we
go multi-window** — real, draggable, stacking windows — to make Puffx feel like an actual OS you
multitask in (a lesson open beside a calculator). This is the heavier path we deferred earlier; it is
now the plan.

---

## 1. The core model: multi-window

- **Multiple app windows open at once.** Each app opens in its own window floating over the desktop.
- Windows are **draggable** (by the title bar), **resizable** (corner handle), **stackable**
  (click brings to front via z-order), and **closable** (red traffic light / Escape on the focused one).
- Opening an app that's already open **focuses** its existing window (no duplicate) — unless we later
  decide to allow multiple instances (not now).
- **Desktop is always underneath.** Closing all windows returns to the bare desktop.
- **Mobile (< `lg`): no windowing.** Windows don't drag on phones — an opened app fills the viewport
  as a full-screen view with a slim title bar + back-to-desktop. Same content, windowing collapses.

This replaces the earlier single-window model. It needs real window **state**, so the "no state
library" rule from v1 is relaxed for the window store (see §8).

---

## 2. What exists today (starting point)

On `feat/puffx-os-shell` — evolve, don't restart:
- `src/navigation/apps.tsx` — the app registry (`APPS`, `PuffxApp`, `matchApp`, per-app `iconImg`/`tint`).
- `src/app/Layout.tsx`, `src/shared/components/` — `MenuBar`, `Desktop`, `AppIcon`, `Widget`, `AppWindow`,
  and the `OSProvider`/`useApp` + `useWindow` contexts the coding agent has been building.
- The single-window `AppWindow` becomes one *instance* rendered per open window (§5).

---

## 3. App manifest (registry)

`apps.tsx` stays the source of truth for what apps exist. `PuffxApp`: `id`, `name`, `icon` (lucide
fallback), `iconImg` (PNG in `/icon/…`), `tint`, `path`, plus per-app **window defaults**:

```ts
interface PuffxApp {
  id: string; name: string; icon: LucideIcon; iconImg?: string; tint: string;
  path: string;                 // route the window shows
  defaultSize?: { w: number; h: number };   // opening size (Learn ~720×460, others ~560×390)
  minSize?: { w: number; h: number };        // resize floor (default 340×240)
  comingSoon?: boolean;         // dropped from desktop for now (no Tracker icon)
}
```

Adding an app = one manifest entry + its route + its component.

---

## 4. Window store — `useWindows()` (`src/context/OSProvider.tsx`)

The window manager. Holds the open-windows array and all mutations. This is the state v1 didn't have.

```ts
interface WinInstance {
  id: string;            // unique per open window
  appId: string;         // → APPS
  path: string;          // current route inside the window
  x: number; y: number; w: number; h: number;
  z: number;             // stacking; focused = highest
  minimized?: boolean;
}
```

Exposes: `windows: WinInstance[]`, `openApp(appId)` (focus if already open, else push a new instance),
`closeWindow(id)`, `focusWindow(id)` (bump z), `moveWindow(id, x, y)`, `resizeWindow(id, w, h)`,
`focused` (highest z). Plain `useState`/`useReducer` — **still no external state library**; the array
*is* the store (this is exactly how PostHog does it).

**Sizing & positioning (PostHog's math — `context/App.tsx`, follow it):**
- **Size** = the app's `defaultSize`, **clamped to [20%, 90%] of the viewport** (desk height = viewport −
  menu bar). `resizeWindow` honours the same min/max.
- **Position:** the **first** window opens **centred** on the desk. Each subsequent window **cascades
  +~26px from the previous frontmost** window; when the new window's right edge would drift **more than
  ⅔ of its width past the screen midpoint**, it **re-centres** instead. Keeps windows clustered near
  centre, never marching into a corner.

---

## 5. `AppWindow` — one per open window

Renders a single `WinInstance`: the frame + chrome + the app inside.
- **Title bar:** traffic lights (red = `closeWindow`), app `iconImg`, app name, optional breadcrumb.
  Drag handle → `moveWindow`. `mousedown` anywhere on the window → `focusWindow`.
- **Resize handle** (bottom-right) → `resizeWindow`, clamped to `minSize`.
- **Body:** the app's route renders here (`<Outlet>`-equivalent per window). Provides the per-app
  `useWindow()` context (title, breadcrumb, in-app toolbar data — e.g. ETF Drag's FX rate lives here,
  never the OS menu bar).
- Opens with the lift+fade (`os-window-in`); reduced-motion collapses it.

`Layout` maps `windows` → an `AppWindow` each, over `<Desktop>`, under the `MenuBar`.

---

## 6. Menu bar & desktop (see design.md for looks)

- **MenuBar** (top): `logo.png` + "Puffx", then dropdown menus **Learn · Docs · Tools · Help** (contents
  in design.md), right side **Search + Help icon buttons only** (no clock/account). Menu items and the
  Tools/Learn entries call `openApp`.
- **Desktop**: `AppIcon` rail (single-click → `openApp`), `Widget` stack, right-click **context menu**
  (§9). No dock.

---

## 7. Interiors are fluid window content

Because windows resize, interiors must reflow — they are **not** fixed full-screen layouts:
- Fill the window; **cap reading measure** (~60ch, centred) so a wide window stays legible.
- **Multi-pane collapses:** Learn's module tree + reading sit side-by-side when wide; under ~640px the
  **tree collapses to a ☰ toggle** (overlay), reading goes full-width.
- The window frame owns the title bar; the interior may add a slim toolbar (breadcrumb, ☰, next).
- Canonical interior reference: `~/FFM/handoffs/puffx-learn-interior-APPROVED.html` (full layout). The
  desktop mock's inline Learn is a *condensed stub* — ignore it; build the full interior.
- Interior visual restyle is its own phase; this spec only requires interiors be **fluid/reflowing**.

---

## 8. State & persistence

- **Window store** (§4): in-memory `useState`/`useReducer` array. No Redux/Zustand.
- **Keep-alive:** open windows stay mounted while backgrounded, so an app keeps its state when another
  window is focused (a lesson stays put while you poke a calculator). This is free once windows live in
  the array and aren't unmounted on blur.
- **localStorage:** genuine persistence only — Learn progress (`progress.ts`), chosen wallpaper, later
  Tracker data. Optionally restore open windows on reload (nice-to-have, not required).
- **URL:** deep links (`/learn/...`) open the matching app window on load. In-window navigation updates
  that window's `path`, not necessarily the address bar (decide per app; Learn can stay URL-synced).
- **Per-app inputs:** local `useState` inside the app.

---

## 9. Desktop right-click context menu

Right-click the wallpaper → a menu at the cursor (beveled, matches the menu-bar dropdowns), closes on
click-away / Escape. Items (PostHog parity, adapted):
- **About Puffx** · **Change wallpaper** (cycles the available `/icon` wallpapers, persisted to
  localStorage) · **Keyboard shortcuts** · — · **Clear my data** (wipes localStorage: progress,
  wallpaper, prefs — our privacy-first "reset").

---

## 10. Recipe: add a new app

1. `PuffxApp` entry in `apps.tsx` (id, name, icon/iconImg, tint, path, sizes).
2. Route(s) under its `path`.
3. Build the component; set its window chrome via `useWindow({ title, breadcrumb, … })`; make the
   interior fluid (§7).

---

## 11. Non-goals

Window snapping/tiling · minimize-to-taskbar animation · multiple instances of one app · a real
filesystem/finder · dark mode · a state-management library. Draggable/resizable/stacking **are** in
scope now; the rest above are not.

---

## 12. Acceptance criteria

- Clicking an app icon (or a Tools/Learn menu item) opens a window; opening the same app again focuses
  the existing one.
- Windows drag, resize (to `minSize` floor), stack (click-to-front), and close (red light / Escape).
- Multiple apps open at once; backgrounded windows keep their state (keep-alive).
- Interiors reflow to window width (Learn tree collapses < ~640px); reading measure stays capped.
- Right-click desktop → context menu; **Clear my data** wipes localStorage.
- Mobile (< lg): apps open full-screen with a slim title bar; no drag/resize.
- No new state-management dependency in `package.json`. `npm run lint` + `npm run build` green.
