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

Because windows resize, interiors must reflow — they are **not** fixed full-screen layouts. **An interior
that assumes the viewport is a bug, not a style preference.** A 480px-wide window on a 1920px screen must
lay itself out as narrow.

### 7.1 The mechanical contract — every interior, no exceptions

Already implemented and proven in the Learning Hub lesson (`src/features/learn/LessonView.tsx`, 0 hex
literals, 2 breakpoints). **Copy that file's mechanics; do not reinvent them.**

- **Root fills the window:** `h-full flex flex-col relative`. Never `min-h-screen`, never `100vh` math,
  never `calc(100vh - …)` pane heights.
- **Width awareness is container-based:** a `ResizeObserver` on the root ref sets
  `narrow = el.clientWidth < 640`. **Viewport breakpoints (`sm:` `md:` `lg:` `xl:`) are banned inside an
  interior** — they read the screen, not the window, which is exactly the bug. (The mobile
  no-windowing case in §1 is the *shell's* job, not the app's.)
- **Panes scroll; the interior doesn't.** Pane row is `flex-1 min-h-0 flex`; each pane owns its
  `overflow-y-auto`. No `sticky top-0` page header, no page-level scroll.
- **No app-level header.** The window title bar (§5) already shows the app icon + name. An interior must
  not restate its own identity as a logo + `<h1>` + tagline. App-private chrome data belongs in the title
  bar via `useSetWindow({ titleRight })` — ETF Drag's live USD/MYR rate is the reference implementation.
- **No app-level footer.** Copyright lines, "© 2026", and tech-stack badges are webpage furniture —
  delete them. Genuine reference content (tariff tables, treaty notes, disclaimers) survives as a
  **collapsible disclosure** at the foot of the pane it belongs to.
- **Toolbar row** (optional, directly beneath the title bar): `shrink-0 h-[42px] px-3.5 bg-surface
  border-b border-hairline`. Holds the `☰` pane toggle when `narrow`, a context label, and right-aligned
  view controls. **This is where an app's own segmented toggles live** (RM/USD, tab switchers).
- **Tokens only — zero hex literals.** Use the semantic classes (`text-ink`, `text-body`, `text-mute`,
  `text-faint`, `bg-surface`, `bg-canvas`, `border-hairline`, `bg-sage-tint`, `text-accent`, …).
- **Radii:** `rounded-lg` (8px) panels, `rounded-md` (6px) controls. `rounded-xl` and above are retired by
  `design.md` — **including the few that slipped into `LessonView.tsx`; don't propagate those.**
- **No glass, no gradients.** `backdrop-blur`, `backdrop-saturate`, and `bg-gradient-*` scroll-fade
  overlays are retired. Content is flat; only the window frame floats.

### 7.2 The three interior patterns

| Pattern | Shape | Apps | Status |
|---|---|---|---|
| **Reading** | slim section-index + capped reading column | Learning Hub | **done — the reference** |
| **Tool** | controls pane + results canvas | ETF Drag, Wealth Simulator | to build (§7.4) |
| **Reference** | A–Z index rail + entry list | Glossary | to build (§7.5) |

### 7.3 Reading pattern — Learning Hub (the reference)

Canonical mocks: `~/FFM/handoffs/puffx-learn-interior-APPROVED.html` (lesson),
`~/FFM/handoffs/puffx-learning-hub-landing.html` (app home).

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

### 7.4 Tool pattern — ETF Drag, Wealth Simulator

A tool is **controls in, results out**. Same two-pane skeleton as Reading, with the roles swapped: the
left pane is *input*, not navigation.

- **Toolbar row:** `☰` controls-pane toggle (when `narrow`) · the tool's context label · right-aligned
  **view controls** — ETF Drag's **RM / USD** segmented toggle, Wealth Sim's tab switcher. These move
  *out* of the deleted page header and *into* here.
- **Left = controls pane** (`w-[300px] shrink-0 border-r border-hairline bg-surface overflow-y-auto`):
  the assumption inputs, grouped in flat `rounded-lg border-hairline` sections with quiet uppercase
  headers. `SliderInput` for every range — never a hand-rolled range. Advanced/override fields stay in a
  collapsed disclosure so a beginner sees a short pane.
- **Right = results canvas** (`flex-1 min-w-0 overflow-y-auto`), stacked in a fixed reading order:
  1. **The answer** — one headline sentence + the single KPI that matters. One primary number, not a wall.
  2. **Advisory banner** — `AlertBanner` when a friction/health threshold trips (ETF Drag's 2.0%
     per-transaction warning; Wealth Sim's `auditFinancialHealth`).
  3. **Charts** — recharts, `dataviz.series` hues only, never UI chrome colours.
  4. **Detail table** — the TCO matrix / breakdown.
  5. **Assumptions & sources** — the collapsible disclosure that absorbs the old page footer.
- **Narrow (`< 640px`):** controls pane becomes the ☰ overlay (scrim `bg-ink/10`, same as Learn); the
  canvas goes full-width; chart grids collapse to one column. Charts must set an explicit pixel height —
  recharts `ResponsiveContainer` needs a bounded parent, and the pane no longer has viewport height.
- **Plain-English on-ramp:** ETF Drag's explainer paragraph is genuinely useful for beginners and stays —
  but as the first card *in the canvas*, not as a full-bleed page band.

### 7.5 Reference pattern — Glossary

A lookup surface. Search is chrome; the terms are the content.

- **Toolbar row:** `☰` index toggle (when `narrow`) · the **search input** (this is the app's primary
  control, so it lives in the toolbar, not in the scrolling body) · match count as a `role="status"`
  micro-label.
- **Left = A–Z index rail** (`w-[92px] shrink-0 border-r border-hairline bg-surface overflow-y-auto`):
  the letter jump list, letters with no match in the current filter dimmed (`text-faint`, **not** an
  invented grey — `#C7CDBB` appears 9× today and is off-palette).
- **Right = term list** (`flex-1 min-w-0 overflow-y-auto`): letter headers `sticky top-0` **within the
  pane** (not the viewport), term cards one column when `narrow`, two when wide.
- **Jumping:** letter links must `scrollIntoView` **inside the pane's scroll container**. Bare `href="#az-X"`
  anchors scroll the wrong element once the pane owns the scroll — this is a real bug to fix, not a port.
- The `Glossary` `<h1>` hero, the "Reference" eyebrow, and the `pt-12 lg:pt-16` page padding are deleted
  per §7.1. **The "core decision" US-vs-Ireland explainer card is worth keeping** — it becomes the first
  entry in the term pane, above `#`.
- The educational-disclaimer footnote stays, as the disclosure at the foot of the term pane.

### 7.6 Conversion debt (measured 2026-07-25)

These three interiors are **conversions, not new designs** — the Learn interior is the working reference.
What the sweep has to remove, by app:

| | hex literals | viewport breakpoints | worst offender |
|---|---|---|---|
| `wealth-simulator` | 179 | 23 | `lg:h-[calc(100vh-120px)]` panes (×2) + `backdrop-blur-xl` glass header + 4 gradient scroll-fades |
| `etf-drag` (+`Sidebar`) | 173 | 20 | sticky glass page header with an IBKR-derived logo + `<h1>` + `mt-16` footer |
| `glossary` | 36 | 8 | `sticky top-14 lg:top-0` keyed to a mobile header that no longer exists |

**Off-palette hues to delete** (not in `design.md`'s token set): `#C7CDBB` ×9, and one each of `#FFB300`,
`#A2A3A5`, `#727579`, `#307EF2`, `#0EB35B`, `#0B3944`, `#2A5038`. **`#D91222` — the retired IBKR brand
red — is still present and is a Tier 1 violation** (`design.md`: red only ever means loss/error).

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
- **Every interior meets §7.1:** no app-level header or footer, no viewport breakpoints, no `100vh` math,
  no glass/gradients, zero hex literals, panes scroll internally. Verify by resizing the *window* — not the
  browser — from `minSize` to maximized: nothing clips, nothing double-scrolls, no horizontal scrollbar.
- Right-click desktop → context menu; **Clear my data** wipes localStorage.
- Mobile (< lg): apps open full-screen with a slim title bar; no drag/resize.
- No new state-management dependency in `package.json`. `npm run lint` + `npm run build` green.
