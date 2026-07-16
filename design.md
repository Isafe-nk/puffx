---
# ── Puffx UI/UX design system (v2 "Puffx OS"). Front matter = machine-readable
#    tokens; Markdown body = brief + rules. This file is the gate for all UI work.
product:
  name: Puffx
  tagline: A free, private, Malaysia-first operating system for your money
  audience: Malaysian professionals, non-finance, never formally taught money — often money-stressed
  stance: calm · neutral · beginner-safe · never sells a product
  metaphor: apps on a desktop (see spec/os-shell.md)

globals:
  mode: light-only            # no dark theme
  emoji: false                # lucide line icons only
  mascot: false               # no character; Jellycat is colour inspiration only, never used
  font_display: Hanken Grotesk
  font_body: Hanken Grotesk   # one family, weight-based hierarchy (Inter retired)
  font_mono: JetBrains Mono   # numbers, KPIs, counts, data
  focus_ring: 2px solid accent, offset 2px   # WCAG 2.4.7 — never remove

color:                        # semantic tokens — never hard-code a hex outside this set
  canvas:        "#F6F4EC"    # desktop / page ground — warm cream, never stark white
  surface:       "#FDFCF7"    # cards, panels, windows — ivory
  sage:          "#A9C6B0"    # PAINT ONLY (fills, tints, highlights) — never text/buttons
  sage-soft:     "#DCE9DF"
  sage-tint:     "#EDF3EC"
  accent:        "#3E7355"    # THE ONLY interactive colour — buttons, links, active, focus
  accent-hover:  "#325E45"
  ink:           "#243129"    # headlines, primary text (green-charcoal, not black)
  body:          "#4A544C"    # body copy
  mute:          "#75806F"    # secondary text, default icon
  faint:         "#9AA394"    # micro-labels, placeholders, disabled
  hairline:      "#DCE0D2"    # default border / divider
  hairline-soft: "#E8EADF"
  success:       "#3E7355"    # positive / gain (accent doubles as success)
  warning:       "#D99A2B"    # caution amber
  error:         "#C4453C"    # errors AND losses — the ONLY red in the app
  info:          "#4E7A96"    # informational dusty-blue, use sparingly

dataviz:                      # CHARTS ONLY — never for UI chrome. red stays reserved for loss.
  series:  ["#3E7355", "#C2673F", "#4E7A96", "#D99A2B", "#7E5A73"]   # moss·clay·blue·amber·plum
  seriesB: ["#325E45", "#A5522F", "#3E6377", "#B77F1E", "#664760"]   # darker paired B-series
  gain:  "#3E7355"
  loss:  "#C4453C"
  # do NOT use raw d3/tailwind hues (indigo, violet, sky)

type_scale:                   # role: size / weight / notes
  display:     { size: 36-40px, weight: 800, notes: desktop greeting, app heroes, tight tracking }
  heading:     { size: 20-22px, weight: 700 }
  subheading:  { size: 16px,    weight: 600 }
  body:        { size: 14-15px, weight: 400, notes: relaxed leading, body colour }
  eyebrow:     { size: 10-11px, weight: 600, notes: uppercase, tracking-[0.2em], faint — house motif }
  micro:       { size: 11-12px, weight: 400, notes: faint; mono where numeric }

radius:
  card: 8px       # rounded-lg — cards, tiles, panels, windows
  control: 6px    # rounded-md — buttons, inputs
  pill: 9999px
  # rounded-xl / 2xl / 3xl are retired

elevation:
  content: none            # cards/panels inside an app are flat — borders only, no shadow/glass
  chrome: soft             # floating os-chrome (icons, widgets, window) gets soft depth
  content_class: null
  chrome_classes: [.os-elev, .os-elev-hover, .os-window-shadow]

spacing:
  base: 8px
  card_padding: 20-24px
  page_gutter: px-6 lg:px-8
  reading_column: max-w-3xl / max-w-4xl centred
  grid_gap: 16px

motion:
  press: "active:scale — CTAs/tiles .98-.99 · segmented/pill .95-.97 · icon buttons .90 · duration-200"
  hover: "accent buttons → accent-hover; cards/tiles → border to accent; CTA arrow nudges translate-x-0.5"
  window_open: "os-window-in — lift+fade ≤220ms"
  reduced_motion: "global prefers-reduced-motion guard collapses all; no ambient/looping animation"
---

# Puffx UI/UX Contract

Specs answer *"is it correct?"*; this answers *"is it consistent?"* **Read it before any UI work and
validate against it before shipping** — there is no visual test suite, this document is the gate.
The tokens live in the YAML front matter above (machine-readable, single source); the rules,
rationale, and things a value can't express live below.

Architecture of the shell (contexts, routing, state) is a separate contract: **`spec/os-shell.md`**.

---

## What matters most (read this first)

Not every rule is equal. When trading off, this is the order:

**Tier 1 — never break:**
1. **The feel is calm and beginner-safe.** If a change makes Puffx feel intimidating, cold, or
   banker-like, it is wrong — however "correct" otherwise. This is the whole product.
2. **Legibility & the contrast rule.** `sage` is paint, never text; all text meets AA;
   **red only ever means loss/error**, never brand.
3. **The OS metaphor holds** — apps on a desktop, opening in draggable/resizable/stacking windows (`spec/os-shell.md`).
4. **No emoji · lucide only · light-only · no mascot.**

**Tier 2 — strong defaults (change only with a reason):** the Dragon palette, one-family type,
flat content + soft depth on floating chrome, the press-feedback + focus-ring patterns.

**Tier 3 — judgment (tune freely to make it pleasant):** exact spacing, radius within 6–8px,
wallpaper richness, widget layout, animation timing, icon sizing. **Spend polish here; never
sacrifice Tier 1 for it.**

---

## Concept: Puffx OS

Puffx is not a website with pages — it's a **light, calm operating system for your money**. Features
(Learn, ETF Drag, Wealth Sim, Glossary, later the Portfolio Tracker) are **apps on a desktop**.
Structure lifted from PostHog's product shell; identity entirely our own. Baseline: mock v1
(`~/FFM/handoffs/puffx-os-mock-v1.html`).

- **Menu bar** — OS chrome: Puffx mark + current app name + menus left, clock right. In an app,
  a **"Desktop"** item is the way home. **App data (e.g. MYR/USD) lives in the app, never the chrome.**
- **The desktop** — app icons on a wallpaper (cream + soft sage/plum light). Icons are the navigation:
  **no dock, no sidebar rail.** A dashed ghost icon marks unshipped apps.
- **Widgets** — warm-Win95 panels on the wallpaper: raised bevel, quiet label header, a **sunken data
  well** for the metric, one glance + one action each (Continue-learning + Resume; saved-plan).
- **Right-click the desktop** → a context menu (About Puffx · Change wallpaper · Keyboard shortcuts ·
  Clear my data).
- **Apps open in draggable, resizable, stacking windows** over the desk — traffic-light controls
  (red = close), title bar with icon + breadcrumb; **multiple open at once**, click brings to front.
  Interiors are **fluid** and reflow to the window (`spec/os-shell.md §7`). Escape closes the focused one.
- **Depth panel (tree)** — only in apps with depth (Learn's module→lesson tree); collapses to a ☰
  toggle when the window is narrow. Single-screen apps don't show one.
- **Keyboard-navigable**; command palette deferred (only ~4 apps).
- **Mobile (<lg)** — reflows to icon grid + stacked widgets; app fills viewport with a slim title bar.
  Behaviour identical.

**Governing rule:** users are beginners who find money stressful. Take PostHog's *craft and structure*,
never its density or gimmicks. **Calm always wins.**

---

## Stance & identity

Soft outside, sharp inside: a **plush-calm palette** (sage + cream) on **crisp software geometry**
(flat surfaces, hairline borders, small radii). Neutral educator — no hype, no fear. Red is **not**
the brand (the IBKR-era `#D91222` is retired); red survives only as the error/loss semantic.

**Contrast discipline (non-negotiable):** `sage` is pale — it may never carry text or be a
button/link colour (fails AA on cream). **Sage = paint, accent = action.** Anything clickable or
readable uses `accent`/`ink`/`body`/`mute` and must meet AA on its background.

---

## Iconography

lucide-react only — no emoji, icon fonts, or one-off SVGs. Default `strokeWidth 1.5`, colour `mute`
or `faint`; in filled/accent buttons `strokeWidth 2`, inherit. Sizes: `w-4 h-4` inline · `w-5 h-5`
lead · app-icon tiles `w-6`. **Each app has one fixed lucide icon** used everywhere it appears, tinted
with its `dataviz` hue.

---

## Components (`src/shared/components`)

Reach for these before building new; extend, don't fork one-offs.

- **`Card`** — flat container (surface bg, hairline border, `rounded-lg`, no shadow). Glass removed.
- **`KpiCard`** — headline number: mono value in `ink`, uppercase `faint` label.
- **`AlertBanner`** — `info | warning | error | success`; soft semantic tints (error/warning keep
  their own hue — error stays **red**; success borrows moss).
- **`SliderInput`** — the governed range control; thumb/active = `accent`. Don't hand-roll ranges.
- **`HelpTip`**, **`PageLoader`** — on tokens.

Shell components (see `spec/os-shell.md`): **`MenuBar`**, **`Desktop`**, **`AppIcon`**, **`Widget`**,
**`AppWindow`**, and the `OSProvider`/`useApp` + `useWindow` contexts. **`TreePanel`** (Learn) pending.

---

## Accessibility floor

- Visible keyboard focus on every interactive element (front-matter `focus_ring`).
- Full keyboard operability: icons, tree, window close (Escape), tiles.
- Colour never the only signal — pair with text/icon (esp. gain/loss: sign or arrow + colour).
- `aria-label` on icon-only controls and range inputs.
- AA contrast for all text (why `sage` can't carry text).
- Tap targets ≥ 40px on mobile.

---

## Do / Don't

**Do:** treat features as apps; use the front-matter tokens + shared components; one primary action
per view; sage for paint, moss for action; let cream whitespace work; keep it calm.

**Don't:** add emoji or mascots; use red for anything but error/loss; put text on sage; introduce
off-palette hex; add shadows to *content* (only floating chrome floats); add glass/gradients; build
window snapping/tiling or multiple instances of one app; add dark mode; hand-roll a control a shared component covers; invent radii.

---

## Migration status

1. **Mock (gate) — DONE.** v1 approved 2026-07-13 (`~/FFM/handoffs/puffx-os-mock-v1.html`).
2. **Tokens — DONE.** Dragon palette in `src/index.css`; `ibkr-*`/red-brand retired; hex swept.
3. **Legacy chrome — DONE.** Glass utilities + `breathe` removed; radii → `rounded-lg`; shadows
   stripped from content; slider/scrollbar/focus → accent.
4. **Shell — DONE (refactor to `OSProvider`/`useApp`/`useWindow` in progress per `spec/os-shell.md`).**
5. **Apps conform — DONE for colour/geometry.** Remaining: `TreePanel` for Learn; interiors made to
   feel native in-window (Tier 3 polish); saved-plan widget wired (placeholder today).
6. **QA against this file** — contrast pass, keyboard pass, no off-palette hex, no emoji (ongoing gate).
