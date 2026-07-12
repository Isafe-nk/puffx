# design.md — Puffx UI/UX Contract

The single source of truth for how Puffx looks and behaves. This is the UI counterpart to
the feature specs: specs answer *"is it correct?"*, this answers *"is it consistent?"*

**Read this before any UI work, and validate against it before shipping.** There is no test
suite for visuals — this document is the gate. If a change disagrees with this file, either the
change is wrong or this file is out of date; resolve it, don't ship the drift.

Every value below is taken from what already ships (`src/index.css` `@theme`, `src/shared/components`,
and the Learn landing). Where the codebase currently contradicts itself, this file **makes the call**
and the contradiction is listed under [Known drift to fix](#known-drift-to-fix).

---

## 1. Stance

Calm, editorial, enterprise. We are a neutral financial educator, not a hype app. The interface
should feel like a well-set document: generous whitespace, restrained colour, one clear action per
view. **No emoji anywhere in the UI** — lucide line icons only. No decorative gradients, no glass,
no drop-shadow theatrics. The content voice is neutral CFP; the UI voice matches it.

The **Learn landing (`src/features/learn/index.tsx`) is the reference implementation.** When unsure
how something should look, make it look like Learn.

---

## 2. The canonical surface decision: flat, not glass

The app currently ships **two** visual languages. This is the primary drift to remove.

- **KEEP — flat/editorial:** white or `#F7F8FA` surfaces, `1px #E6E6E6` borders, `rounded-2xl`,
  `shadow-sm`. Used by Learn, `KpiCard`, `AlertBanner`, `SliderInput`.
- **RETIRE — liquid glass:** `.glass-card`, `.glass-panel`, `.glass-navbar`, `.glass-pill`,
  `.animate-breathe` (all in `src/index.css`), and `Card`'s `glass={true}` default. Used only in the
  two visualizers + `TcoMatrix`.

**Rule:** all surfaces are flat. `Card` defaults to `glass={false}` (flat) and the glass utilities are
removed once no component references them.

---

## 3. Colour tokens

Defined in `src/index.css` `@theme`. **Never hard-code a hex that isn't one of these.**

| Token | Hex | Role |
|---|---|---|
| `primary` | `#D91222` | Brand + the single action/accent colour. CTAs, active states, focus ring, hairline accents. |
| `primary-hover` | `#C01A2F` | Hover on primary surfaces only. |
| `ibkr-bg` | `#FFFFFF` | Page / card background. |
| `ibkr-surface` | `#F7F8FA` | Recessed surfaces, subtle callouts, track fills. |
| `ibkr-border` | `#E6E6E6` | The default border. Almost every divider/edge. |
| `ibkr-text` | `#212121` | Primary text, headings. |
| `ibkr-subtle` | `#44474D` | Body copy inside cards/banners. |
| `ibkr-muted` | `#727579` | Secondary text, descriptions, icon default. |
| `ibkr-success` | `#0EB35B` | Positive / "read" / gains. |
| `ibkr-warning` | `#FFB300` | Caution (text form darkens to `#B27D00` for contrast). |
| `ibkr-info` | `#307EF2` | Informational. **This is the info colour — not `#0066FF`.** |
| `ibkr-teal` | `#0B3944` | Rare deep accent. Avoid unless there's a reason. |

**Ungoverned greys that appear in code — promote or avoid:** `#A2A3A5` (faint micro-labels /
placeholders — extremely common, treat as the "faint" grey), `#E8E8E9` (slider track), `#D0D1D2`
(scrollbar), `#EEEEEE` (inner hairline divider). Prefer the named tokens; use these only for the
exact roles listed.

---

## 4. Typography

Three families, loaded in `index.html`:

- **Hanken Grotesk** (`font-display`) — headings and hero. Usually `font-black` (hero) or
  `font-bold` (section headings).
- **Inter** (`font-sans`) — all body and UI text.
- **JetBrains Mono** (`font-mono`) — numbers, KPI values, counts, micro-stats, code-like labels.

Scale as used on Learn (match it):

| Use | Classes |
|---|---|
| Hero | `text-4xl lg:text-5xl font-black font-display tracking-tight leading-[1.05]` |
| Section heading (h2) | `text-lg font-bold font-display` |
| Kicker / eyebrow label | `text-[10px]/[11px] uppercase tracking-[0.2em] font-semibold text-[#A2A3A5]` |
| Body | `text-sm` or `text-[13px]` `text-[#727579] leading-relaxed` |
| Micro / footnote | `text-[11px] text-[#A2A3A5]` |
| Numbers / KPI | `font-mono` (KPI value: `text-2xl md:text-3xl font-black font-mono`) |

The red hairline + tracked kicker (`<span class="w-6 h-px bg-[#D91222]" />` beside an uppercase
label) is the house eyebrow motif — reuse it, don't reinvent section intros.

---

## 5. Iconography

- **lucide-react only.** No emoji, no icon fonts, no inline SVG one-offs.
- Decorative / standalone icons: `strokeWidth={1.5}`, colour `#A2A3A5` or `#727579`.
- Icons inside a primary button (e.g. `ArrowRight`): `strokeWidth={2}`, `w-4 h-4`, inherit white.
- Sizes: `w-4 h-4` inline, `w-5 h-5` for a card/section lead icon.

---

## 6. Shape, spacing, elevation

- **Radius:** cards/panels `rounded-2xl`; inputs & KPI tiles `rounded-xl`; buttons `rounded-lg`;
  pills/indicators `rounded-full`. **`rounded-3xl` is retired** (Card currently uses it — bring to
  `rounded-2xl`).
- **Borders:** `1px solid #E6E6E6` is the default edge. Hover-to-`#D91222` is the standard "this is
  clickable" affordance on cards (see Learn phase cards).
- **Elevation:** `shadow-sm` only. No large/coloured shadows (those came from glass).
- **Spacing:** card padding `p-5 lg:p-6`; page gutters `px-6 lg:px-8`; reading column `max-w-4xl mx-auto`.

---

## 7. Components (`src/shared/components`)

Reach for these before building anything new. If you need a variant, extend the shared component —
don't fork a one-off.

- **`Card`** — the flat container. Default flat (`rounded-2xl`, `#E6E6E6` border, `shadow-sm`).
- **`KpiCard`** — a single headline number: mono value, tiny uppercase label, optional subtitle.
- **`AlertBanner`** — `info | warning | error | success`. Titled callouts (used for lesson
  "In 30 seconds" = info, "Key takeaway" = success). Body text is `#44474D`.
- **`SliderInput`** — the governed range control (`stacked` or `inline`). All simulator knobs use it;
  don't hand-roll `<input type=range>`.
- **`HelpTip`** — the inline `?` tooltip for jargon.
- **`PageLoader`** — the lazy-route fallback.

---

## 8. Layout & responsive

- Shell: `Layout` (global chrome + `SideNav`) → page. Reading/content pages centre on `max-w-4xl`.
- **Breakpoint for nav:** below `lg`, the SideNav collapses to a hamburger-triggered drawer that
  closes on route change, Escape, and overlay tap. At `lg`+ it's the persistent rail.
- Wide content (tables, the TCO matrix, charts) must scroll inside its own container — the page body
  never scrolls horizontally.
- Mobile: single column, full-width cards, comfortable tap targets (min 40px).

---

## 9. Interaction & motion

- **Press feedback (house pattern):** every clickable element scales down on `:active` —
  CTAs & card links `active:scale-[0.98]`/`[0.99]`, segmented/pill toggles `[0.95]`–`[0.97]`,
  icon buttons `[0.90]`. Transitions `duration-200`.
- **Hover:** primary buttons → `primary-hover`; cards → border to `#D91222`; the CTA arrow nudges
  `translate-x-0.5`.
- **Focus (WCAG 2.4.7 — non-negotiable):** `:focus-visible` = `2px solid #D91222`, `offset 2px`
  (already global in `index.css`). On the dark sidebar rail the outline goes white. Inputs swap to a
  red border + `ring-1 ring-[#D91222]/30`. Never remove focus visibility without an equivalent.
- **Reduced motion:** the global `prefers-reduced-motion` guard collapses all transitions/animations
  to instant. Any new animation must survive it (it will, via the global guard — don't override it).

---

## 10. Accessibility floor

Baked in, must not regress:
- Visible keyboard focus on every interactive element (§9).
- All controls reachable and operable by keyboard; drawer closes on Escape.
- Colour is never the only signal (pair with text/icon).
- `aria-label` on icon-only controls and range inputs (see `SliderInput`).
- Body copy meets AA contrast — this is why warning text darkens to `#B27D00`.

---

## 11. Do / Don't

**Do:** use the tokens; use the shared components; match the Learn language; keep one primary action
per view; let whitespace do the work.

**Don't:** add emoji; introduce a hex outside the tokens; add glass/gradient/heavy-shadow surfaces;
hand-roll a control that a shared component covers; invent a new radius; remove focus outlines.

---

## Known drift to fix

The worklist for the UI/UX refinement pass. Each is a concrete, checkable item.

1. **Retire glass.** Remove `.glass-card`/`.glass-panel`/`.glass-navbar`/`.glass-pill`/`.animate-breathe`
   from `index.css`; flip `Card` to `glass={false}` default; restyle `etf-drag`, `wealth-simulator`,
   and `TcoMatrix` chrome to flat (`§2`).
2. **`Card` radius** → `rounded-2xl` (currently `rounded-3xl`).
3. **AlertBanner info colour** → use token `#307EF2`, not `#0066FF`.
4. **Audit hard-coded hex** across the visualizers against §3; replace ungoverned values.
5. **Confirm both visualizers match the Learn language** end-to-end (surfaces, type scale, icon stroke,
   eyebrow motif) — this is the heart of the refinement.
