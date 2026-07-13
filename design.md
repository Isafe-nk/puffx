# design.md — Puffx UI/UX Contract (v2 — "Puffx OS" direction)

The single source of truth for how Puffx looks and behaves. Specs answer *"is it correct?"*;
this answers *"is it consistent?"* **Read this before any UI work, and validate against it before
shipping.** There is no visual test suite — this document is the gate.

**v2 is a target, not a description.** v1 documented the shipped (IBKR-era) look; this file defines
the **new direction** the app migrates *to*. Where the codebase disagrees with this file, the
codebase is legacy — see [Migration worklist](#migration-worklist). Exact hex/typography values are
**draft until the desktop-home + Learn mocks are approved by KY**; structure and rules are locked.

---

## 1. Concept: Puffx OS

Puffx is not a website with pages — it is a **light, calm operating system for your money**.
The features (Learn, ETF Drag, Wealth Sim, Glossary, and later the Portfolio Tracker) are **apps**
sitting on a **desktop**. Structure lifted from PostHog's product shell; identity entirely our own.

The shell (as approved in mock v1 — `~/FFM/handoffs/puffx-os-mock-v1.html`):

- **Menu bar** — the OS chrome across the top: Puffx mark + current app name + app menus on the
  left, clock on the right. In an open app it carries a **"Desktop"** item as the visible way home.
  App-specific data (e.g. the MYR/USD rate) lives inside its app, never in the OS chrome.
- **The desktop** — the landing surface: **app icons sitting on a wallpaper** (cream canvas with a
  faint sage bloom): Learn, ETF Drag, Wealth Simulator, Glossary, + a dashed "coming soon" icon for
  unshipped apps. Icons are the navigation — **there is no dock** and no sidebar rail on the desktop.
- **Desktop widgets** — live cards on the wallpaper (Continue-learning with progress + Resume,
  saved-plan net-worth). They make the desk feel personal and carry the desktop's single CTA.
- **Apps open in a window over the desk** — soft traffic-light controls, title bar with app icon +
  breadcrumb; the wallpaper stays visible behind. **One window at a time, not draggable/resizable**
  — the window is fiction, full-focus is the behaviour. Red light (and menu-bar "Desktop") closes
  back to the desktop.
- **Depth panel (tree)** — only inside apps that have depth. Learn gets a module → lesson tree
  panel inside its window; single-screen apps (visualizers, glossary) don't show one.
- **Keyboard-navigable** shell (icons, tree, window close: tab / arrows / enter / Escape).
  Command palette: deferred — unnecessary at 4 apps.
- **Mobile (below `lg`)** — the desktop reflows to an icon grid + stacked widgets; open apps fill
  the viewport with a slim title bar. Window fiction thins out; behaviour stays identical.

**Audience rule that governs everything:** our users are beginners who find money stressful. We take
PostHog's *craft and structure*, never its density or gimmicks. Calm always wins.

---

## 2. Stance & identity

Soft outside, sharp inside: a **plush-calm palette** (sage + cream) on **crisp software geometry**
(flat surfaces, hairline borders, small radii). Neutral financial educator — no hype, no fear.

- **No emoji in the UI** — lucide line icons only.
- **No mascot** (parked deliberately; any future character would be our own design — we never use
  the Jellycat character or name; the palette is colour inspiration only).
- **Light mode only.** No dark theme; don't half-build one.
- **Red is not the brand.** The IBKR-era red `#D91222` is retired as identity; red survives only as
  the error/loss semantic.

---

## 3. Colour — the Dragon palette

One brand family (sage → moss → ink), warm cream ground, tiny semantic set. **Never hard-code a hex
outside this table.** *(Values draft until mock sign-off.)*

| Token | Draft | Role |
|---|---|---|
| `canvas` | `#F6F4EC` | The desktop / page ground. Warm cream — never stark white pages. |
| `surface` | `#FDFCF7` | Cards, tiles, panels — ivory, one step lighter than canvas. |
| `sage` | `#A9C6B0` | Brand green. **Surfaces & tints only**: active-state fills, app-icon accents, highlights, progress. |
| `accent` | `#3E7355` | Deep moss. **The only interactive colour**: buttons, links, focus ring, active nav. |
| `accent-hover` | `#325E45` | Hover on accent surfaces. |
| `ink` | `#243129` | Headlines, primary text. Green-charcoal, not black. |
| `body` | `#4A544C` | Body copy. Warm grey-green. |
| `mute` | `#75806F` | Secondary text, descriptions, default icon colour. |
| `faint` | `#9AA394` | Micro-labels, placeholders, disabled. |
| `hairline` | `#DCE0D2` | The default border/divider. |
| `success` | `#3E7355` | Gains / done / positive — the accent moss doubles as success. |
| `warning` | `#D99A2B` | Caution, warm amber. |
| `error` | `#C4453C` | Errors and losses — the only red in the app. |
| `info` | `#4E7A96` | Informational, dusty blue-grey. Use sparingly. |

**The contrast discipline (non-negotiable):** `sage` is pale — it may **never** carry text or be a
button/link colour (fails AA on cream). Sage = paint, accent = action. Anything clickable or
readable uses `accent`/`ink`/`body`/`mute` and must meet AA on its background.

**Data-viz palette (charts only).** Semantic tokens aren't enough for multi-series charts, so series
use a Dragon-earth categorical set — warm tones that sit on cream; **red stays reserved for loss**:
moss `#3E7355` · clay `#C2673F` · dusty-blue `#4E7A96` · amber `#D99A2B` · plum `#7E5A73` (darker
shades for paired B-series: `#A5522F`, `#3E6377`, `#B77F1E`, `#664760`). Gains/positive → moss;
losses/crashes → error `#C4453C`. Do not use raw d3/tailwind series hues (indigo, violet, sky).

All `ibkr-*` and `primary` token names are retired; tokens use the semantic names above.

---

## 4. Typography

**One family, weight-based hierarchy** — no italics, no second sans.

- **Hanken Grotesk** — everything: display 800, headings 700, emphasis 600, body 400.
  (Inter is retired. Family choice may be swapped once seen in the mock; the one-family rule stands.)
- **JetBrains Mono** — numbers, KPI values, counts, statuses on tiles, code-like labels.

Scale (draft):

| Role | Spec |
|---|---|
| Display (desktop greeting, app heroes) | 36–40px, 800, tight tracking |
| Heading | 20–22px, 700 |
| Sub-heading | 16px, 600 |
| Body | 14–15px, 400, relaxed leading, `body` colour |
| Eyebrow / kicker | 10–11px, 600, uppercase, `tracking-[0.2em]`, `faint` — the house section-intro motif (keep) |
| Micro / meta | 11–12px, `faint`, mono where numeric |

---

## 5. Iconography

- **lucide-react only.** No emoji, no icon fonts, no one-off SVGs.
- Default: `strokeWidth={1.5}`, colour `mute` or `faint`. In filled/accent buttons: `strokeWidth={2}`, inherit.
- Sizes: `w-4 h-4` inline · `w-5 h-5` card/section lead · app icons in dock/tiles `w-5`–`w-6`.
- Each app gets **one fixed lucide icon** used everywhere it's referenced (dock, tile, headers).

---

## 6. Shape, spacing, elevation

Sharper than v1 — this is the "software" half of the identity.

- **Radius:** cards / tiles / panels **8px** (`rounded-lg`) · buttons & inputs **6px** (`rounded-md`)
  · pills/badges full. **`rounded-xl/2xl/3xl` are retired.**
- **Borders:** `1px solid hairline` is the default edge. Hover affordance on clickable cards/tiles:
  border → `accent`.
- **Elevation:** *content* stays flat — cards/panels inside an app use borders, not shadows
  (`shadow-sm` retired), no glass. But the **floating OS-chrome surfaces** (desktop app icons,
  widgets, the open window) carry **soft depth** (`.os-elev` / `.os-window-shadow`) so the desk has
  light and the window reads as floating. The desk has shadow; the page does not.
- **Spacing:** 8px base grid. Card/tile padding 20–24px; page gutters `px-6 lg:px-8`; reading column
  (lessons) `max-w-3xl/4xl` centred; desktop tile grid gap 16px.
- Wide content (tables, matrices, charts) scrolls inside its own container — the page never
  scrolls horizontally.

---

## 7. Components (`src/shared/components`)

Reach for these before building anything new; extend, don't fork one-offs. All migrate to the v2
skin (surface bg, hairline border, 6–8px radius, no shadow, new tokens):

- **`Card`** — flat container. Glass prop and glass styling deleted entirely.
- **`KpiCard`** — headline number: mono value in `ink`, uppercase `faint` label.
- **`AlertBanner`** — `info | warning | error | success`, soft tinted backgrounds derived from the
  semantic tokens (v2 tints, not the old blue/red set).
- **`SliderInput`** — the governed range control; thumb/active colour = `accent` (not red).
  Don't hand-roll range inputs.
- **`HelpTip`**, **`PageLoader`** — restyle to tokens.

New shell components this direction introduces: **`MenuBar`** (OS chrome), **`Desktop`**
(wallpaper + icon layout), **`AppIcon`** (glyph + label + status sub-line), **`Widget`**
(live desktop card), **`AppWindow`** (title bar + traffic lights wrapping an open app),
**`TreePanel`** (Learn's module→lesson nav).

---

## 8. Interaction & motion

- **Press feedback (house pattern, keep):** every clickable scales on `:active` — CTAs/tiles
  `active:scale-[0.98–0.99]`, segmented/pill controls `[0.95–0.97]`, icon buttons `[0.90]`;
  transitions `duration-200`.
- **Hover:** accent buttons → `accent-hover`; cards/tiles → hairline → `accent` border; CTA arrow
  nudges `translate-x-0.5`.
- **Focus (WCAG 2.4.7, non-negotiable):** global `:focus-visible` = `2px solid accent`, offset 2px.
  Inputs: `accent` border + soft accent ring. Never remove focus visibility.
- **Reduced motion:** the global `prefers-reduced-motion` guard stays; every new animation must
  survive it. No ambient/looping animation (the `breathe` keyframe is retired).
- **App-open transition:** at most a fast fade/scale (≤200ms) from tile → full-focus app. Nothing
  theatrical.

---

## 9. Accessibility floor

- Visible keyboard focus on every interactive element (§8).
- Full keyboard operability: dock, tree, drawer (Escape closes), tiles.
- Colour never the only signal — pair with text/icon (esp. gains/losses: sign or arrow + colour).
- `aria-label` on icon-only controls and range inputs.
- AA contrast for all text — this is why `sage` can't carry text (§3).
- Tap targets ≥ 40px on mobile.

---

## 10. Do / Don't

**Do:** treat features as apps; use the tokens and shared components; keep one primary action per
view; sage for paint, moss for action; let cream whitespace do the work; keep the shell calm.

**Don't:** add emoji or mascots; use red for anything but errors/losses; put text on sage; introduce
off-palette hex; add shadows/glass/gradients; build draggable windows or tabs; add a dark mode;
hand-roll controls a shared component covers; invent radii.

---

## Migration worklist

Order matters: **mock → tokens → shell → apps.** Each item checkable.

1. **Mock first (gate) — DONE.** Mock v1 approved by KY (2026-07-13) as the baseline:
   `~/FFM/handoffs/puffx-os-mock-v1.html` (menu bar, desktop icons, widgets, window fiction, no
   dock). Further refinement iterates on the mock/build; palette/type values remain draft-tunable.
2. **Tokens.** Replace the `@theme` block in `src/index.css`: new palette (§3), retire all `ibkr-*`
   names and `#D91222`-as-brand; sweep all hard-coded hex to tokens. Single-family type (§4).
3. **Kill legacy chrome.** Delete `.glass-*` utilities, `.animate-breathe`, `shadow-sm` surfaces,
   `rounded-xl/2xl/3xl`; restyle sliders/scrollbars/focus ring to `accent`.
4. **Shell.** Build `MenuBar`, `Desktop` + `AppIcon` + `Widget` home (replaces VisualizerHub and
   the SideNav as the landing/navigation), `AppWindow` routing (one window at a time). Mobile
   reflow per §1.
5. **Apps conform.** Learn (incl. `TreePanel`), ETF Drag, Wealth Sim, Glossary restyled to v2
   tokens/geometry. Shared components (§7) migrated.
6. **QA against this file.** Contrast pass (§3 discipline), keyboard pass (§9), no off-palette hex
   (`grep` for stray `#` values), no emoji.
