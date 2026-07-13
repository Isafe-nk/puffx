# spec/os-shell.md — Puffx OS wrapper (architecture)

The architecture contract for the OS shell. `design.md` governs how it *looks*; this governs how it's
*built*. Scope: the wrapper that turns our features into "apps on a desktop." Not the app interiors.

Derived from studying PostHog's `posthog.com` desktop implementation — we **borrow** their manifest +
two-context + single-mount skeleton and **skip** their entire window-manager half (see §9).

---

## 1. The one decision that keeps this light

**One app open at a time, full-focus. No multi-window, no dragging, no resizing, no z-order.**
The "OS" is a visual metaphor (`design.md §1`), not a real windowing system. Everything below follows
from this. The moment we want draggable/multi/background-live windows, this spec changes — flag it,
don't sneak it in.

Consequences: **no state library.** Navigation state = the URL. Persistence = `localStorage` for a
handful of prefs. Per-app inputs = local `useState`. That's the whole state story.

---

## 2. What exists today (starting point)

Already on `feat/puffx-os-shell`, don't rebuild — refactor toward this spec:
- `src/navigation/apps.tsx` — the app registry seed (`APPS`, `PuffxApp`, `matchApp`).
- `src/app/Layout.tsx` — single mount point: `matchApp(pathname)` → renders one `AppWindow` over `Desktop`.
- `src/shared/components/` — `MenuBar`, `Desktop`, `AppIcon`, `Widget`, `AppWindow`.

The gap this spec closes: those components read the router directly and pass props ad-hoc. We
formalize into **two contexts** so there's one seam.

---

## 3. App manifest (registry)

`apps.tsx` is the single source of truth for "what apps exist." Extend the existing `PuffxApp`:

```ts
interface PuffxApp {
  id: string;            // 'learn'
  name: string;          // 'Learn'
  icon: LucideIcon;
  tint: string;          // Dragon-earth hex (design.md §3 data-viz)
  path: string;          // route prefix that opens the app window
  sub?: string;          // desktop-icon status line
  subMono?: boolean;
  comingSoon?: boolean;  // ghost icon, not routable
}
```

- `matchApp(pathname)` stays: longest-prefix match, ignores `comingSoon`. This is how the URL resolves
  to an app. **Unknown route → no app (desktop shows).** (PostHog has a size fallback; we don't need one.)
- Adding an app = one manifest entry + its route + its component. That's the whole recipe (§10).

---

## 4. Global context — `useApp()`  (`src/context/OSProvider.tsx`)

The "OS kernel," deliberately tiny. Wraps the app under `Layout`.

Exposes:
- `activeApp: PuffxApp | undefined` — **derived from the URL** (`matchApp`), not stored. URL is truth.
- `apps: PuffxApp[]` — the registry (for `Desktop`, `MenuBar`).
- `openApp(id)` — `navigate(app.path)`.
- `closeToDesktop()` — `navigate('/')`.

Does **not** hold: window geometry, z-order, an open-windows array, focus, or component state. If you
find yourself adding any of those, stop — that's the window-manager we're skipping (§9).

`Layout` consumes `activeApp`: renders `<Desktop>` always; renders one `<AppWindow>` when `activeApp`
is set. (This is today's behaviour, moved behind the context.)

---

## 5. Per-app context — `useWindow()`  (provided by `AppWindow`)

A separate, per-app context for the app's own chrome — so the OS chrome and app chrome don't tangle.
`AppWindow` provides it; `MenuBar` and the app's own components consume it.

Exposes (all optional, set by the app):
- `title: string` / `breadcrumb?: string` — shown in the title bar + menu bar.
- `menu?: MenuItem[]` — the app's menu-bar entries (e.g. Learn → "Modules", "Progress"). Empty = none.
- app-scoped chrome data — **this is where ETF Drag's MYR/USD rate lives** (KY's rule: app data belongs
  to the app, never the OS menu bar). The app sets it; nothing else sees it.

Apps set their window context via a small hook (e.g. `useSetWindow({ title, menu })`) on mount. Keep the
API minimal; grow it only when a real app needs a field.

---

## 6. Component responsibilities (after refactor)

| Component | Reads | Renders |
|---|---|---|
| `OSProvider` | URL | provides `useApp()` |
| `Layout` | `useApp().activeApp` | `MenuBar` + `Desktop` (always) + one `AppWindow` (if active) |
| `MenuBar` | `useApp()` + `useWindow()` | Puffx mark, app name/menus (or desktop menus), clock |
| `Desktop` | `useApp().apps` + progress | icon grid + widgets on the wallpaper |
| `AppIcon` | manifest entry | one tinted app tile → `openApp` on click |
| `AppWindow` | `useApp().activeApp` | window chrome; **provides** `useWindow()`; renders `<Outlet/>` |

---

## 7. Routing model

- URL is the source of truth for what's open. `/` → desktop. `/learn/...` → Learn window. Deep links
  work (open the app window directly).
- `openApp` / `closeToDesktop` are thin `navigate()` wrappers — no separate window state to sync.
- In-app navigation (e.g. lesson → lesson) is normal routing inside the window; the window stays.
- `AppWindow` resets its scroll on in-app route change (already implemented).

---

## 8. State & persistence

- **Context state:** `activeApp` is *derived*, not stored. `useWindow` fields are ephemeral per mount.
- **localStorage:** only genuine prefs/persistence — Learn progress (already, `progress.ts`), and later
  Portfolio Tracker data. Optionally "last opened app" for a nicer cold start. Nothing else.
- **Per-app inputs:** local `useState`. They reset when you leave the app — accepted (see §9 keep-alive).
- **No** Redux/Zustand/etc. If the Tracker later needs real internal state, that's a hook/context
  *inside that one app*, not a global store.

---

## 9. Seams for later (document, do NOT build)

Leave these as clean extension points; building any now is over-engineering:
- **Keep-alive** (apps remember state when backgrounded) — would require keeping apps mounted; today an
  app unmounts on leave. Product decision, not started.
- **Command palette** (Cmd-K) — would hook into `useApp` + registry. Unnecessary at ~4 apps.
- **Per-app menu-bar menus** — `useWindow().menu` already reserves the slot; wire real menus when an app
  needs them.
- **Multi-window / tabs / drag** — explicitly out. If ever wanted, `activeApp: PuffxApp` becomes
  `windows: AppWindow[]` and this spec is rewritten.

---

## 10. Recipe: add a new app

1. Add a `PuffxApp` entry to `APPS` in `apps.tsx` (id, name, icon, tint, path).
2. Add its route(s) under the app's `path` in `routes.tsx`.
3. Build the app component; call `useSetWindow({ title, menu })` on mount.
Done — desktop icon, menu-bar name, and window all derive from the manifest.

---

## 11. Non-goals

Draggable/resizable windows · multiple windows · z-order/focus stack · window position persistence ·
a global state store · a real filesystem/finder · dark mode. All deliberately excluded.

---

## 12. Acceptance criteria

- One `OSProvider` supplies `useApp()`; `Layout`, `MenuBar`, `Desktop` consume it (no direct router reads
  for app state outside the provider).
- `AppWindow` supplies `useWindow()`; at least Learn sets a real `title`/`menu` through it; ETF Drag's
  FX rate is exposed via `useWindow`, not the OS `MenuBar`.
- URL still drives everything; deep links open the right window; `/` shows the desktop; close returns to `/`.
- No new state-management dependency in `package.json`. `npm run lint` + `npm run build` green.
- Behaviour identical to today's shell (this is a refactor, not a feature) — verified on `:3001`.
