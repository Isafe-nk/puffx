# spec/motion.md — Puffx OS motion

The motion contract. `design.md` governs how it *looks*, `spec/os-shell.md` how it's *built*, this how it
*moves*. Canonical tokens are mirrored into `design.md`'s `motion:` front matter; the reasoning and the
per-surface inventory live here.

**Derived from PostHog's real implementation** (`PostHog/posthog.com@master`, read 2026-07-26) —
`src/components/AppWindow/index.tsx`, `src/context/App.tsx`, `src/styles/global.css` (L2304–2403),
`src/constants/frostedSurfaces.ts`. Per the standing rule: replicate from source, never guess. Where we
deliberately diverge, it says so and why.

---

## 1. Principles

1. **Motion explains causality, never decorates.** Its only job is to answer "where did that come from
   and where did it go." If a movement doesn't answer that, delete it.
2. **Asymmetry: in is softer, out is faster.** Opening gets a touch more time and a gentle settle;
   closing gets less time and accelerates away. PostHog ships 0.2s in / 0.15s out — we keep that ratio.
3. **Only user-initiated motion animates.** A window the user clicked open pops in. A window restored
   from a URL or a saved session appears **instantly** — otherwise a reload fires a jarring cascade of
   pops. (This is what PostHog's `fromOrigin` flag actually buys them; see §2.4.)
4. **Reduced motion is a hard gate, not a downgrade.** See §6 — we are deliberately stricter than
   PostHog here.
5. **Chrome moves via CSS; content may use `motion`.** Window frames, menus, and icons are CSS
   keyframes/transitions — no React re-render in the animation path. The `motion` package (already a
   dep, v12) stays for *content* transitions inside an interior (the Learn quiz reveal is the reference).
6. **Never animate layout properties.** `transform` and `opacity` only. No animated `width`/`height`/
   `top`/`left` — they force layout on every frame.

---

## 2. Window motion

`spec/os-shell.md §9` already splits windows into **app windows** (resizable, viewport-proportional) and
**system windows** (About/Display/Keyboard — small, centered, fixed). PostHog makes the same split and
gives each its own vocabulary. We adopt both.

### 2.1 App windows — pop

```css
@keyframes os-window-pop-in {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}
.os-window-pop-in  { animation: os-window-pop-in 0.2s cubic-bezier(0.34, 1.35, 0.64, 1) both; }

@keyframes os-window-pop-out {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.96); }
}
.os-window-pop-out { animation: os-window-pop-out 0.15s cubic-bezier(0.55, 0, 1, 0.45) both;
                     pointer-events: none; }
```

**This replaces `os-window-in`** (currently `0.22s` lift+fade, `scale(0.985) translateY(8px)`), which has
no overshoot and — the real gap — **no close animation at all**; windows currently just vanish.

**Divergence from PostHog, deliberate:** they use `scale(0.92)` with `cubic-bezier(0.34, 1.56, 0.64, 1)`.
That 1.56 is a pronounced bounce. `design.md` Tier 1 says calm always wins and to take PostHog's craft,
never its playfulness — so we soften to `0.96` / `1.35`: the same settle, less bounce. Everything else
(durations, the out-curve, `both`, `pointer-events: none` on exit) is theirs verbatim.

### 2.2 System windows — drop + scrim

PostHog's fixed-size dialogs slide in from **off-screen above** (`translateY(-100%)`) because they anchor
them to the top (`top-2 left-1/2`). **Ours are centered** (`§9`), so an off-screen slide would fly across
the whole desk. We keep their curves and swap the distance for a short drop that reads as settling:

```css
@keyframes os-dialog-in {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.os-dialog-in  { animation: os-dialog-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.15) both; }

@keyframes os-dialog-out {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-16px); }
}
.os-dialog-out { animation: os-dialog-out 0.25s cubic-bezier(0.6, -0.28, 0.735, 0.045) both;
                 pointer-events: none; }
```

The out-curve starts **negative** (`-0.28`) — a tiny anticipation dip before it leaves. That's PostHog's,
and it's worth keeping; it's what makes a dialog dismissal feel deliberate rather than yanked.

**Scrim** (system windows only — app windows never dim the desk):

```css
.os-scrim-in  { animation: os-scrim-in  0.2s  ease-out forwards; }  /* opacity 0 → 1 */
.os-scrim-out { animation: os-scrim-out 0.15s ease-in  forwards; }  /* opacity 1 → 0 */
```

Scrim colour is `bg-ink/40` — **not** PostHog's `bg-black/50`. We have no pure black in the palette, and
ink-tinted dimming keeps the desk warm.

### 2.3 Close must animate *before* unmount

Today `closeWindow(id)` drops the window from the array and it disappears on the next render — which is
why there's no exit animation to speak of. The fix is PostHog's, and it needs no new dependency:

1. `×` / `Escape` → `setClosing(true)` (do **not** call `closeWindow` yet).
2. `closing` swaps the in-class for the out-class.
3. Native `onAnimationEnd` on the window root → `closeWindow(id)`.

**Guard it:** `onAnimationEnd={(e) => { if (e.currentTarget !== e.target) return; … }}`. `animationend`
bubbles, so any animating child would otherwise close the window out from under the user. PostHog has
exactly this guard — it is not optional.

This also means reduced motion needs no special case: with `animation-duration: 0.01ms` (§6) the event
still fires, so the window still closes, just instantly.

### 2.4 The user-initiated gate

PostHog stores `fromOrigin` on each window and plays the open animation only when it's set
(`playOpenAnimation = !!item.fromOrigin`). We need the same boolean — call it `animateOpen` — set true
when the open came from a click (icon, menu item, widget) and false when the window was materialised from
a deep link or a restored session (`§8`).

**Worth knowing before you copy it:** PostHog computes `fromOrigin` as real geometry — a global click
listener captures the clicked element's `getBoundingClientRect()` and stores `{x: rect.left - w/2,
y: rect.top - h/2}` — but `AppWindow` only ever reads it as `!!item.fromOrigin`. **The coordinates are
never applied to the transform.** Their pop-in is a plain centred scale. So do not build a
zoom-from-the-icon effect believing PostHog does it; they left that on the table (and we're not picking it
up — see §7).

---

## 3. Micro-interaction inventory

What moves, on what trigger. Anything not listed here doesn't move.

| Surface | Trigger | Motion | Timing |
|---|---|---|---|
| App window | open / close | §2.1 pop | 0.2s / 0.15s |
| System window | open / close | §2.2 drop + scrim | 0.2s / 0.25s |
| Window title bar | drag | none — follows the cursor 1:1, no easing | — |
| Win95 title-bar controls (□ ×) | press | **bevel inversion** (§4) | instant |
| Desktop `AppIcon` | hover | label tint → `accent`, tile lifts `translateY(-1px)` | 0.15s ease |
| Desktop `AppIcon` | press | `active:scale-[0.96]` | 0.2s |
| Menu bar dropdown | open / close | opacity + `translateY(-4px)` → 0 | 0.12s ease-out / instant out |
| Desktop context menu | open | same as dropdown, origin at cursor | 0.12s |
| Widget | hover | border → `accent`; no lift (widgets sit *on* the desk) | 0.15s |
| Buttons / CTAs / tiles | press | `active:scale-[0.98–0.99]` (unchanged) | 0.2s |
| Segmented / pill controls | press | `active:scale-[0.95–0.97]` (unchanged) | 0.2s |
| Icon buttons | press | `active:scale-[0.90]` (unchanged) | 0.2s |
| Slider thumb | hover | `scale(1.15)` (unchanged, already shipped) | 0.15s |
| Interior pane overlay (☰) | open / close | slide from edge + `bg-ink/10` scrim fade | 0.18s / 0.12s |
| Learn quiz reveal | click | `motion` height auto (unchanged, the content reference) | 0.25s |

**Menu dropdowns close instantly, not on a curve.** An animated menu *dismissal* makes an OS feel
sluggish — the click already told the user it's gone.

---

## 4. Win95 control press — the one place we out-native PostHog

PostHog's buttons are 3D-lifted: they rest at `translate-y-[-2px]`, hover to `-3px`/`-4px`, and press
down to `-1px`. Good, but it's *their* idiom, and we already ship `active:scale` app-wide (`design.md`
`motion.press`) — swapping that globally is churn for no gain.

**The exception is the Win95 title-bar controls**, where a scale-down is the *wrong* physics. A real Win95
button presses by inverting its bevel and nudging its glyph:

- Rest: light bevel top-left, dark bevel bottom-right (raised).
- `:active`: bevels swap (sunken) **and** the glyph shifts `translate(1px, 1px)`.
- No scale, no duration — bevel inversion is instantaneous in the original, and that snap *is* the feel.

Apply only to the `□` / `×` controls and any other genuinely beveled control (widget buttons). Everywhere
else, `active:scale` stands.

---

## 5. Performance

- **Promote compositor layers only while moving.** PostHog's `MOTION_LAYER` is
  `will-change-[transform,backdrop-filter]`, applied only when `animating || dragging || resizing ||
  closing`. Ours drops the `backdrop-filter` half — **we retired glass** (`design.md`), so it's
  `will-change: transform` alone. Permanent `will-change` is a memory leak in disguise; it must be
  conditional.
- **CSS keyframes for chrome, not JS.** PostHog animates windows in CSS and reserves framer-motion for
  drag and the snap indicator. Same here: the window frame must not re-render mid-animation.
- **We do not adopt PostHog's animation watchdog.** They time the open animation with `performance.now()`
  and, past 700ms, fire a `animation_performance_reduced` capture and offer to disable animations.
  Clever — but Puffx is **privacy-first with no analytics**, so there is nowhere to send it, and a
  self-diagnosing toast is the opposite of calm. Skipped on purpose, not overlooked.

---

## 6. Reduced motion

The existing global guard in `src/index.css` stays exactly as it is:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

**We are deliberately stricter than PostHog.** Their only reduced-motion rule scopes to `.app-scrollbar`
— window pops and dialog slides still play at full strength. That's an accessibility gap in their build;
do not "fix" ours to match theirs. `design.md` already commits to a global guard and no ambient motion.

---

## 7. Non-goals

Zoom/genie from the launching icon (§2.4 — PostHog doesn't actually do it, and it's too showy for us) ·
minimize animation (no taskbar to fly into, `os-shell §11`) · snap indicators (snapping is a non-goal) ·
ambient or looping motion (`breathe` was retired) · sound · cursor effects · page-transition animation
between routes inside a window · animation telemetry (§5) · spring physics libraries (CSS curves suffice).

---

## 8. Acceptance criteria

- Opening an app by click pops in (§2.1); opening the same app again just focuses — **no re-pop**.
- Closing via `×` or `Escape` plays the out animation, *then* unmounts. The window never disappears on
  the same frame as the click.
- An `animationend` from a child element never closes a window (§2.3 guard).
- A window materialised from a deep link or restored session appears with **no** animation (§2.4).
- System windows drop in with a scrim; app windows never dim the desk.
- `will-change` is present only while a window is animating/dragging/resizing — inspect a resting
  window and it must be absent.
- Win95 `□`/`×` invert their bevel on press; no scale on those two controls.
- With `prefers-reduced-motion: reduce`, every one of the above still *works* — instantly. Nothing
  becomes unclickable or fails to close.
- No animated `width`/`height`/`top`/`left` anywhere in the shell.
