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
- **Title bar (Win95 frame, NOT macOS traffic lights):** a **moss (`accent`) bar** — app `iconImg` +
  app name on the left (white), and **window controls on the right: maximize (□) + close (×)**. **No
  minimize** (we have no taskbar to restore from — deliberately dropped). Beveled Win95 control buttons;
  close hovers red. **Double-click the bar or click □ → maximize/restore** (fills the desk below the menu
  bar); **× or Escape → close**. The bar is the drag handle → `moveWindow`; `mousedown` anywhere on the
  window → `focusWindow`.
- **Resize handle** (bottom-right) → `resizeWindow`, clamped to `minSize`.
- **Body:** the app's route renders here (`<Outlet>`-equivalent per window). Provides the per-app
  `useWindow()` context (title, breadcrumb, in-app toolbar data — e.g. ETF Drag's FX rate lives here,
  never the OS menu bar).
- **Motion is `spec/motion.md`** — app windows pop in/out (§2.1), system windows drop with a scrim (§2.2),
  and **close animates before unmount** (§2.3: `setClosing(true)` → CSS out → `onAnimationEnd` →
  `closeWindow`). `closeWindow(id)` must no longer be called straight from the `×` handler.

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

Because windows resize, interiors must reflow — they are **not** fixed full-screen layouts. The
**Learning Hub interior** is the reference pattern (canonical mocks:
`~/FFM/handoffs/puffx-learn-interior-APPROVED.html` for a lesson,
`~/FFM/handoffs/puffx-learning-hub-landing.html` for the app home).

**Two states:**
- **Landing** (app home, no lesson selected) — hero + "Continue where you left off" card + the two
  **track cards** (Personal Finance / Investment) + "How it works" principles. Full-width, capped column.
- **Lesson** — the three-tier navigation, no redundancy:
  1. **Toolbar row** (under the title bar): `☰` (section toggle, shows when narrow) · **module name**
     (short — not "Module 2 · … / Lesson 3 of 8") · right: **‹ prev · `3 / 8` position · next ›**
     icon-arrow buttons (tooltips name the adjacent lessons). This is the *linear* nav.
  2. **Left = slim module section-index** (NOT the full 9-module tree): a "‹ All modules" link →
     landing, the module name + progress, and **only this module's lessons** (tick = read, sage
     highlight = current, dot = unread). This is *jump-within-module*.
  3. **Right = reading column** — **~60ch, centred**: eyebrow → title → **hook** (lead line, the
     authored 🎯 "why this matters") → "In 30 seconds" (sage-tint banner) → Understand it → In Malaysia
     → Quick check (reveal) → Key takeaway (sage-tint). *(Recall 🔁 is intentionally not surfaced —
     prev/next covers continuity. Hook + recall stay in the content JSON regardless.)*

**Fluid rule:** side-by-side when wide; under ~640px the **section-index collapses to the ☰ toggle**
(overlay) and the reading column goes full-width.

The window frame owns the title bar (§5); the interior owns the toolbar row + panes.

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
- **Escape** closes the frontmost (focused) window.

---

## 9. Desktop right-click context menu + system windows

Right-click the wallpaper → a menu at the cursor (beveled, matches the menu-bar dropdowns), closes on
click-away / Escape. Its items **each open a window** (PostHog does this — About/Display/kbd are
pseudo-app windows with no desktop icon), except Clear my data:
- **About Puffx** → About window (~**760×500, resizable**, centered).
- **Change wallpaper** → **Display window** (~**600×550, fixed** — no resize, centered): the available
  `/icon` wallpapers as selectable thumbnails; picking one sets + persists it to localStorage.
- **Keyboard shortcuts** → shortcuts window (~**600×625, fixed**, centered).
- — · **Clear my data** → confirm, then wipe localStorage (progress, wallpaper, prefs) and reload — our
  privacy-first "reset."

**System-window sizes come from PostHog** (`context/App.tsx` appSettings `/about`, `/display-options`,
`/kbd`): small, centered, fixed for settings dialogs, `closeOnEscape`. They dedupe like apps
(open-again focuses). Distinct from **app** windows, which open **wide/landscape** at a viewport
proportion (Learn ~86% width, others ~64%), clamped 20–90% (§4).

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
