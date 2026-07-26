# spec/motion.md — Puffx OS motion

The motion contract. `design.md` governs how it *looks*, `spec/os-shell.md` how it's *built*, this how it
*moves*. Canonical tokens are mirrored into `design.md`'s `motion:` front matter; the reasoning and the
per-surface inventory live here.

**Derived from PostHog's real implementation. Read both of their codebases — they do this differently:**

| source | surface | mechanism |
|---|---|---|
| `PostHog/posthog.com@master` — `components/AppWindow/index.tsx`, `styles/global.css` L2304–2403 | the marketing site's desktop-OS shell | CSS **keyframes**, asymmetric, bouncy overshoot |
| `PostHog/posthog@591d47af` — `frontend/src/lib/ui/DialogPrimitive/DialogPrimitive.tsx`, `packages/quill/packages/primitives/src/dialog.css` | the **product**'s design system (`quill`) | CSS **transitions** + `data-starting-style`, symmetric, no overshoot |

**We follow the product (`quill`), not the marketing site.** Corrected 2026-07-26 after KY flagged that
the mock didn't feel native — they were right, and §2.0 explains exactly why the mechanism is the reason.
Per the standing rule: replicate from source, never guess. Where we deliberately diverge, it says so.

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

### 2.0 Transitions, not keyframes — and why it matters

**This is the thing that makes it feel native.** A keyframe animation is fire-and-forget: once it starts
it runs to completion. Interrupt it — close a window mid-open, reopen one mid-close — and it **snaps or
restarts from the beginning**. A CSS *transition* is a continuous interpolation toward a target: interrupt
it and it **reverses smoothly from wherever it currently is.** That reversibility is most of the
difference between "a web page playing an animation" and "an OS window responding to you."

PostHog's product does it with transitions. `DialogPrimitive.tsx` L36–39:

```
Dialog.Backdrop:  bg-black opacity-20 transition-all duration-150
                  data-[starting-style]:opacity-0 data-[ending-style]:opacity-0
Dialog.Popup:     … transition-all duration-150
                  data-[starting-style]:scale-95 data-[starting-style]:opacity-0
                  data-[ending-style]:scale-95   data-[ending-style]:opacity-0
```

They get the enter/exit states from **Base UI**, which stamps `data-starting-style` / `data-ending-style`
on the element. **We don't need Base UI** — native CSS `@starting-style` plus
`transition-behavior: allow-discrete` is baseline-supported and does the same job with no dependency.

### 2.1 The shared model

One mechanism for app windows, system windows, scrims, menus, and the interior `☰` overlay. Only the
values change.

```css
.os-anim {
  opacity: 1; scale: 1;
  transition: opacity 200ms cubic-bezier(0.215, 0.61, 0.355, 1),
              scale   200ms cubic-bezier(0.215, 0.61, 0.355, 1);
}
/* enter-from — native equivalent of Base UI's data-starting-style */
@starting-style { .os-anim { opacity: 0; scale: var(--os-enter-scale, 0.96); } }
/* exit-to — set by the closing state */
.os-anim[data-closing] {
  opacity: 0; scale: var(--os-enter-scale, 0.96);
  transition-duration: 150ms;             /* dismissal is snappier */
  pointer-events: none;
}
```

`cubic-bezier(0.215, 0.61, 0.355, 1)` is ease-out-cubic — **PostHog's actual curve**, a clean decelerate
with **no overshoot**.

**The bounce debate is settled, and not in favour of the bouncier option.** PostHog's own rationale, in
`dialog.css` L53–58:

> *200ms ease-out — dialog is larger than a tooltip/menu so a touch longer feels right. Paired with
> overlay (same curve/duration) so they read as one unit. Start scale kept at 0.95 (not 0.9) to stay
> subtle and avoid drawing too much attention each time.*

Their product team reached the same conclusion `design.md` Tier 1 does. So: **no overshoot anywhere.**
The `cubic-bezier(0.34, 1.56, 0.64, 1)` bounce belongs to their marketing site, not their product, and
the earlier `1.35` compromise is dropped too — it was solving a problem we no longer have.

### 2.2 Values per surface

| surface | enter scale | in | out | scrim |
|---|---|---|---|---|
| App window | `0.96` | 200ms | 150ms | none — app windows never dim the desk |
| System window (`§9` fixed) | `0.95` | 200ms | 150ms | **paired exactly** |
| Menu / context menu | `0.98` | 120ms | instant (`§3`) | none |
| Interior `☰` overlay | — (translate) | 180ms | 120ms | `bg-ink/10` |

**The scrim must match its dialog exactly** — same curve, same duration, in *and* out. PostHog's comment
is explicit that this is what makes them "read as one unit," and an earlier draft of this spec had them
mismatched (dialog 200/250 against scrim 200/150), which would have read as two things moving.

Scrim colour is `bg-ink/40`, **not** PostHog's `bg-black/50` — no pure black in the palette, and
ink-tinted dimming keeps the desk warm.

**Dialogs scale, they do not drop.** An earlier draft had system windows translating down 16px with an
anticipation dip (`cubic-bezier(0.6, -0.28, …)`). Both came from the marketing site. The product scales
from `0.95` in place, and that's what we do — it's calmer and it matches the app-window vocabulary
instead of inventing a second one.

**This replaces `os-window-in`** (`0.22s` lift+fade, `scale(0.985) translateY(8px)`) which — the real gap
— has **no close animation at all**; windows currently just vanish.

### 2.3 Close must animate *before* unmount

Today `closeWindow(id)` drops the window from the array and it disappears on the next render — which is
why there's no exit animation to speak of. The sequence:

1. `×` / `Escape` → `setClosing(true)` (do **not** call `closeWindow` yet).
2. `data-closing` applies the exit values; the transition runs.
3. `onTransitionEnd` → `closeWindow(id)`.

**Three guards, all mandatory.** Transitions are more forgiving to *watch* than keyframes but more
demanding to *unmount* on, and each of these is a real hang or a real bug:

```jsx
onTransitionEnd={(e) => {
  if (e.currentTarget !== e.target) return;      // (a) transitionend bubbles
  if (e.propertyName !== 'opacity') return;      // (b) fires once PER property
  closeWindow(id);
}}
```

- **(a)** `transitionend` bubbles, exactly like `animationend`. Without this, any transitioning child
  inside an interior closes the window out from under the user.
- **(b)** We transition *two* properties (`opacity`, `scale`), so the event fires **twice**. Pick one
  property as the trigger — `opacity`, since it's the one that always changes.
- **(c) The reduced-motion hang — this is the important one.** With `transition: none` (§6),
  `transitionend` **never fires at all**, so a window would never unmount and `×` would appear dead.

  > **Correction to an earlier draft of this spec,** which claimed the close pattern was
  > "reduced-motion-safe by construction." That was true of the *keyframe* version — `animation-duration:
  > 0.01ms` is nonzero, so `animationend` still fired. It is **false for transitions.** Do not carry the
  > old reasoning over.

  Handle it explicitly — check the media query in JS and skip the animation path entirely:

  ```js
  const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (instant) { closeWindow(id); return; }   // no transition to wait for
  setClosing(true);
  ```

  A `setTimeout` fallback is an acceptable belt-and-braces addition, but the media-query check is the
  correct primary path — it's deterministic. **Note why `quill` doesn't need any of this: Base UI owns
  the unmount timing for them.** We're hand-rolling the window store, so it's ours to get right.

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
| App window | open / close | §2.1 scale `.96` + fade | 200 / 150ms |
| System window | open / close | §2.1 scale `.95` + fade, scrim paired | 200 / 150ms |
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
- **CSS for chrome, not JS.** Both PostHog codebases animate their surfaces in CSS and reserve JS motion
  libraries for drag. Same here: the window frame must not re-render mid-transition.
- **Transitions are cheaper than keyframes here**, incidentally — an interrupted transition retargets
  from its current computed value instead of tearing down and restarting an animation.
- **We do not adopt PostHog's animation watchdog.** They time the open animation with `performance.now()`
  and, past 700ms, fire a `animation_performance_reduced` capture and offer to disable animations.
  Clever — but Puffx is **privacy-first with no analytics**, so there is nowhere to send it, and a
  self-diagnosing toast is the opposite of calm. Skipped on purpose, not overlooked.

---

## 6. Reduced motion

The existing global guard in `src/index.css` stays:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

**But a global duration clamp is NOT sufficient for the transition model, and shipping only that would
be a real bug.** Collapsing the duration doesn't neutralise the enter/exit *values* — the element can
land on `opacity: 0; scale: 0.95` and simply stay there. **A reduced-motion user would get an invisible
window.** `quill` handles this explicitly (`dialog.css` L208–225) and so must we:

```css
@media (prefers-reduced-motion: reduce) {
  .os-anim, .os-anim[data-closing] { transition: none; scale: 1; }
  .os-anim[data-closing] { opacity: initial; }
}
@media (prefers-reduced-motion: reduce) {
  @starting-style { .os-anim { opacity: 1; scale: 1; } }
}
```

Neutralise the *values*, not just the timing. Pair this with the JS media-query check in §2.3(c) — the CSS
stops the visual, the JS stops the unmount hang. **Both are required; neither alone is enough.**

**We remain deliberately stricter than the marketing site.** `posthog.com`'s only reduced-motion rule
scopes to `.app-scrollbar`, so its window pops play at full strength for users who asked for less — an
accessibility gap. Their *product* (`quill`) does it properly, which is what's replicated above.

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
- A `transitionend` from a child element never closes a window (§2.3 guard a).
- Closing a window fires `closeWindow` **once**, not twice — the handler filters on `propertyName` (b).
- **Interrupt test:** click an icon and hit `×` mid-open. The window must *reverse smoothly* from
  wherever it got to — no snap, no restart. Then reopen mid-close; same in reverse. This is the whole
  reason for the transition model (§2.0), so it's the criterion that matters most.
- A window materialised from a deep link or restored session appears with **no** animation (§2.4).
- System windows drop in with a scrim; app windows never dim the desk.
- `will-change` is present only while a window is animating/dragging/resizing — inspect a resting
  window and it must be absent.
- Win95 `□`/`×` invert their bevel on press; no scale on those two controls.
- With `prefers-reduced-motion: reduce`: windows are **visible** (not stranded at `opacity: 0`) and
  **still close** (no `transitionend` hang). Verify both — §6 and §2.3(c) each fix one and neither
  covers the other.
- No animated `width`/`height`/`top`/`left` anywhere in the shell.
