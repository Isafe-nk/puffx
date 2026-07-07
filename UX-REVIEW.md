# Puffx UX Review

**Date:** 2026-07-07 · **Reviewed at:** `feat/press-feedback` (`333eda2`, includes the press-feedback pass) · **Method:** full component read of every user-facing surface + app run on :3000; four parallel surface audits (nav/chrome, ETF Drag, Wealth Simulator, Learn/Glossary) synthesized and every High/Medium claim re-verified against the cited code. Findings that did not survive verification were dropped.

**Scope:** sidebar/nav, global chrome, `/visualizer/etf-drag`, `/visualizer/wealth-simulator`, `/learn` → phase → module → lesson, `/glossary`.

Each finding: **ID · Title** — where · severity · why it hurts · fix. IDs are stable for triage ("do G1 and X2").

---

## Executive summary

The app's foundations are good: the sidebar accordion does the right thing (whole-row click navigates *and* expands, active section auto-expands on deep links), the Learn section has a strong pedagogical structure, and the design tokens are applied consistently across Learn, Glossary, and ETF Drag. The three systemic problems are: **(1) mobile users have no navigation at all**, **(2) keyboard/screen-reader accessibility is near-zero app-wide** (no visible focus, 2 ARIA attributes in the whole app), and **(3) the Wealth Simulator has drifted into a different visual language** (glass-morphism cards, ~24 off-palette Tailwind colors, its own currency formatting that ignores the USD/MYR toggle). Below those, a cluster of high-value flow fixes: "Next" dying at module boundaries in Learn, hover-only affordances that are invisible on touch, and a jargon wall at the ETF Drag entry point.

---

## A. Cross-cutting (global)

**A1 · No navigation on mobile/tablet** — `src/navigation/SideNav.tsx:8` (`hidden lg:flex`), `src/app/Layout.tsx:9` · **High**
Below 1024px the sidebar disappears entirely; there is no hamburger, drawer, or bottom bar. A phone user landing on `/visualizer/etf-drag` cannot reach Learn, Glossary, or the other visualizer except by typing URLs. For a Malaysian retail audience this is likely the majority device class.
**Fix:** add a mobile header bar (puffx wordmark + hamburger) that opens the existing SideNav as a slide-in drawer (`fixed inset-y-0 left-0`, overlay, focus-trapped). Reuse `SideNavItem` unchanged.

**A2 · Zero visible keyboard focus, app-wide** — 0 matches for `focus-visible` in `src/`; `focus:outline-none` on the toggle at `etf-drag/components/Sidebar.tsx:232` · **High**
A keyboard user cannot see where they are anywhere in the app. This fails WCAG 2.4.7 outright.
**Fix:** one global rule in `index.css`: `:focus-visible { outline: 2px solid #D91222; outline-offset: 2px; }` (white outline variant on the dark sidebar), and remove the `focus:outline-none` instances. One CSS block fixes the entire app.

**A3 · Near-zero ARIA / semantics** — 2 `aria-` attributes in the whole app (both on the sidebar chevron); no `role="switch"`/`aria-checked` on toggles (`etf-drag/Sidebar.tsx:230`), no `aria-expanded` on wealth-sim collapsibles (`wealth-simulator/index.tsx:175,385,440,531`), unlabeled `<select>`s (`etf-drag/Sidebar.tsx:249,288`), quiz button without `aria-expanded` (`learn/LessonView.tsx:28`), pages use `<div>` not `<main>`, no skip link · **High** (as a cluster)
Screen-reader users get buttons with no state, selects with no name, and no landmarks.
**Fix:** mechanical pass: `role="switch" aria-checked` on the two switch-style toggles, `aria-expanded`/`aria-controls` on every collapsible, `<label htmlFor>` on selects, `<main id="main">` in `Layout.tsx` + skip link, `fieldset/legend` on the Execution Frequency group.

**A4 · Hover-only affordances are dead on touch** — tooltips: `shared/SliderInput.tsx:68-76`, `etf-drag/Sidebar.tsx:192-198,221-227` (all `group-hover:opacity-100`); delete-debt button invisible until hover: `wealth-simulator/index.tsx:475` (`opacity-0 group-hover:opacity-100`) · **High**
Every explanation of the tool's core concepts (execution frequency, direct USD deposit, WHT) lives in hover tooltips a phone user can never open; the remove-debt control effectively doesn't exist on touch.
**Fix:** make Help icons tap-targets (click toggles the popover, `useState` not `:hover`); show the trash icon always at `text-[#A2A3A5]` with hover/focus emphasis instead of `opacity-0`.

**A5 · Emoji in UI violates the design language** — `etf-drag/components/FrictionAlert.tsx:62,66` (`💡` ×2), `wealth-simulator/index.tsx:297,310` (`⚠️` ×2) · **Medium**
Direct contradiction of the no-emoji rule; colored emoji clash with the monochrome lucide system.
**Fix:** replace with `<Lightbulb>` / `<AlertTriangle>` lucide icons at `w-3.5 h-3.5` matching each context's text color.

**A6 · Scroll position persists across navigations** — no `<ScrollRestoration/>` anywhere; `createBrowserRouter` in `src/app/routes.tsx` · **High**
Clicking "Next lesson" at the bottom of a lesson lands the reader at the *bottom* of the next lesson; every page-to-page navigation inherits the previous scroll. This breaks the Learn reading loop specifically.
**Fix:** add `<ScrollRestoration />` inside the router root (or a `useEffect` scroll-to-top on `pathname` change in `Layout.tsx`).

**A7 · Browser tab always says "puffx"** — `index.html:10`; no `document.title` management in `src/` · **Medium**
Users with multiple tabs (or using history) can't tell lessons, tools, and glossary apart; deep-linked lessons share a title.
**Fix:** small `usePageTitle(title)` hook called per page: "L1.3 · Payslip Deductions · puffx", "ETF Drag · puffx", etc.

**A8 · 9–10px text and sub-AA contrast are pervasive** — 83 instances of `text-[9px]`/`text-[10px]` across `src/`; `#A2A3A5` on white ≈ 2.6:1 contrast (fails WCAG AA 4.5:1), e.g. `etf-drag/index.tsx:168`, `KpiCard.tsx:25` · **Medium**
The audience skews non-expert; 9px faint-gray labels are illegible on mid-range phones.
**Fix:** floor at `text-[10px]`; use `#A2A3A5` only for truly decorative metadata and `#727579` (4.6:1) for anything meant to be read.

**A9 · Single 1.24 MB bundle, no code splitting** — all routes statically imported in `src/app/routes.tsx:5-11`; all 68 lessons of JSON in the main chunk · **Medium**
First paint pays for both visualizers, recharts, motion, react-markdown, and the entire course before showing anything.
**Fix:** `React.lazy` per route group (visualizers / learn / glossary) + dynamic-import the `content/m*.json` registry. Also move the Google Fonts `@import` (`index.css:1`) to `<link rel="preconnect">`+`<link rel="stylesheet">` in `index.html`, and add a `<meta name="description">`.

---

## B. Navigation & IA

**B1 · "Coming soon" items look broken, not planned** — `navConfig.ts:27-30`, rendered `SideNavItem.tsx:40-52` · **High**
Half the sidebar (Portfolio, Analysis, Market, Settings) renders as dimmed dead links with no badge, tooltip, or label. New users read dimmed-but-listed items as broken, which taxes trust in a finance product.
**Fix:** right-aligned `Soon` tag (`text-[9px] uppercase text-white/40 border border-white/15 rounded px-1.5`) on each; keep them out of tab order (`tabIndex={-1}` or render as `<span>`).

**B2 · Dead footer controls in the sidebar** — `SideNav.tsx:22-29` ("Export Report" button, "Documentation" link, both permanently disabled) · **Medium**
Two more permanently-dead controls compound B1's "half this app doesn't work" impression.
**Fix:** remove until real, or give them the same `Soon` treatment as B1.

**B3 · `/visualizer` hub page is orphaned** — `routes.tsx` (index route `Navigate → /visualizer/etf-drag`); `VisualizerHub.tsx` exists but is unreachable · **Medium**
A new user is silently double-redirected (`/` → `/visualizer` → `/visualizer/etf-drag`) into the most jargon-heavy screen in the app (see C1). The friendly chooser page that already exists never renders.
**Fix:** either render `VisualizerHub` at `/visualizer` (one-line route change) or delete the component. Related decision: with the Learn direction, consider whether `/` should land on a future Learn-first home instead.

**B4 · No sidebar collapse on 1024–1280px screens** — `Layout.tsx:9` (`lg:ml-72` fixed) · **Low**
On small laptops/iPads-landscape the fixed 288px rail cramps the 12-col visualizer grid.
**Fix:** optional icon-rail collapse toggle; low priority next to A1.

**Positive:** the accordion meets the expected pattern — whole-row click navigates *and* expands (`SideNavItem.tsx:61-68`), chevron independently collapses (`:69-77`), active section auto-expands on deep link/refresh (`:25-27`), and Glossary at `/glossary` still lights the Learn group via recursive matching (`:9-15`). Active-state hierarchy (red left rail for top level, subtle fill for children) is clear.

---

## C. ETF Drag visualizer

**C1 · Jargon wall at the entry screen** — `etf-drag/index.tsx:145-153` (header), `Sidebar.tsx:265-276` (Domicile/WHT/TER badges), `Sidebar.tsx:473` (bps); definitions exist only in a footer (`index.tsx:352-356`) and hover tooltips · **High**
This is the default landing page for the whole app (see B3). A non-finance user meets "TCO & Withholding Tax Leakage Optimizer", "WHT", "TER", "bps", "Accumulating" with no plain-language on-ramp, and the one place that explains the terms is the last thing on the page.
**Fix:** 2–3 sentence plain-English intro under the header ("This compares two ways to buy the S&P 500…"); expand first-use jargon inline ("TER (annual fee)", "WHT (dividend tax)", "basis points"); link terms to `/glossary` (see G1). Keep the existing footer as the deep reference.

**C2 · RM sliders display USD estimates, ignoring the currency toggle** — `Sidebar.tsx:116` (`formatValForSlider` hardcodes `$…USD`), used at `:153,166` under labels "Initial Capital (RM)" / "Monthly Allocation (RM)" · **Medium**
The slider row says RM at both ends and USD in the middle, and the center label stays USD even when the page toggle is set to RM — two currencies in one control with no explanation.
**Fix:** label the center estimate explicitly ("≈ $566 USD converted") or show it in the display currency via the shared `formatCurrency`; the RM-in/USD-est pairing is defensible but must ignore neither the toggle nor clarity.

**C3 · FrictionAlert's improvement math overstates the win** — `FrictionAlert.tsx:62` (drag ÷ 3 phrasing) · **Medium**
"Reduces drag from X% down to X/3%" reads as a guaranteed two-thirds cost cut; the real mechanism is fixed-cost amortization over a 3× batch. Overpromising in a warning banner undermines the tool's credibility with exactly the users it's warning. (Also contains the `💡` emoji — see A5.)
**Fix:** reword to the mechanism: "Pooling 3 months into one purchase spreads the fixed minimums over a 3× larger trade, cutting per-transaction drag to ~X/3%."

**C4 · 8-series stacked-bar legend with no A/B grouping** — `PerformanceCharts.tsx:154-163` (taxA/terA/spreadA/feesA + 4 ×B) · **Medium**
On the "Cumulative Lost Cost" view the flat legend makes it hard to tell which stack segments belong to which ETF.
**Fix:** custom `<Legend content>` that renders two labelled groups ("ETF A · SPY" / "ETF B · SPYL"), or two side-by-side stacks.

**C5 · Fixed 340px chart + 600px min-width table on mobile** — `PerformanceCharts.tsx:132` (`h-[340px]`), `TcoMatrix.tsx:44` (`min-w-[600px]`) · **Medium**
Chart plus tabs plus legend consumes most of a phone viewport; the TCO table forces horizontal scrolling with the leading column drifting off-screen.
**Fix:** `h-[240px] md:h-[340px]`; for the matrix keep `overflow-x-auto` but make the first column `sticky left-0 bg-white` so row labels stay pinned.

**C6 · Controls stack below results on mobile with no way back up** — `etf-drag/index.tsx:193` (`grid-cols-1 lg:grid-cols-12`, sidebar column second) · **Medium**
A phone user sees charts first and must scroll past the entire analytics column to change any input, then scroll back to see the effect.
**Fix:** on `<lg`, render the controls in a collapsible "Adjust assumptions" panel pinned above the charts (or a bottom-sheet trigger).

**C7 · No input validation on advanced overrides** — `Sidebar.tsx:396-440` (`type="number"` accepts negatives/0 for price, TER, spread) · **Low**
Nonsense inputs silently produce nonsense charts.
**Fix:** `min` attributes + clamp on blur.

**Positive:** consistent A=gray/B=red color coding across charts, badges, and copy; clear chart tabs; the TCO matrix is a genuinely good power-user artifact; live FX-rate indicator with date stamp is a nice trust cue.

---

## D. Wealth Simulator

**D1 · Different visual language from the rest of the app** — glass-morphism cards `wealth-simulator/index.tsx:174,384,438,530` (`.glass-card`, defined `index.css:23-44`) vs flat white + `#E6E6E6` hairlines everywhere else · **High**
Learn, Glossary, and ETF Drag share one enterprise language; this page reads as a different product, which costs trust exactly where users enter their most personal numbers.
**Fix:** replace `.glass-card` with the standard `bg-white border border-[#E6E6E6] rounded-2xl`; if the glass aesthetic is kept anywhere, reserve it for the floating tab bar only.

**D2 · ~24 off-palette colors** — indigo: `DebtVsInvestingLab.tsx:149,206,211,292`; amber: `:134-140`; emerald/red/amber gradients: `RiskProfile.tsx:102-104,115,132,144,175,202`; pie/status colors: `Charts.tsx:550-553`, `index.tsx:410` · **High**
Indigo, emerald, amber, pink, and yellow Tailwind classes appear nowhere else in the app; semantic states here don't match the app's own `#0EB35B`/`#FFB300`/`#D91222`/`#307EF2` tokens.
**Fix:** central chart-color map in the feature's constants keyed to Puffx tokens; sweep-replace all Tailwind palette classes.

**D3 · Hardcoded MYR formatting, no USD/MYR toggle** — local `formatCurrency` in `index.tsx:118-119`, `DebtVsInvestingLab.tsx:27-33` (compact notation), `Charts.tsx:23-29`; shared `src/shared/utils/format.ts` unused here · **Medium**
The ETF Drag page has a currency toggle; this page ignores the concept entirely and formats inconsistently between its own components ("RM 500K" vs "RM 500,000").
**Fix:** adopt the shared formatter; a page-level toggle can come later, but formatting should unify now.

**D4 · First-visit overload: every section open, ~25 controls at once** — `index.tsx:55` (`collapsedSections` initialized empty) · **Medium**
Eight life sliders + health audit + debt profile + four allocation sliders greet a first-time user simultaneously, with no default scenario or "start here."
**Fix:** default-collapse Health/Debt/Allocation (open Life Parameters only); one line of orientation copy at the top of the panel.

**D5 · Allocation lock/rebalance is invisible logic** — `index.tsx:549-626` (proportional rebalancing keeps the 100% sum silently; no total shown) · **Medium**
Sliders move themselves with no confirmation the sum is valid — users can't tell if it's magic or a bug.
**Fix:** live "Total: 100%" row under the four sliders (green at 100%, red otherwise) so the invariant is visible.

**D6 · Monte Carlo recomputes synchronously on every slider tick** — `index.tsx:106-108` (1000 paths in `useMemo` on each input change) · **Medium**
On mid-range phones, dragging a slider can freeze the UI with no feedback.
**Fix:** wrap in `useTransition` (React 19) with a subtle "Recalculating…" state, or debounce inputs ~200ms.

**D7 · Percentile output unexplained for lay users** — `index.tsx:806-828` ("Top 10% / Median / Bottom 10%", success rate) · **Medium**
"90% success" is easily misread as "90% chance of exactly this number."
**Fix:** one plain-language sentence in the existing explainer: "Out of 1,000 simulated market futures, you reached your goal in 900."

**D8 · Color-only health-status dots** — `index.tsx:407-421` (green/amber/red `w-2 h-2` dots) · **Low**
Colorblind users can't read the audit verdicts.
**Fix:** add a text badge ("On track" / "Tight" / "At risk") beside each dot.

**D9 · "Psychological middle ground" copy** — `DebtVsInvestingLab.tsx:199` · **Low**
Vague for the audience; the sibling cards have concrete descriptions.
**Fix:** "Pay half toward debt, invest half."

**Positive:** directional tab-slide transitions; smooth AnimatePresence collapsibles; the debt-into-retirement age badges are genuinely clarifying; cash-flow leak explanations educate rather than just display; alert hierarchy (danger/warning/success) is well used.

---

## E. Learn

**E1 · "Next" dies at every module boundary** — `learnConfig.ts:223-234` (`prev`/`next` only from `module.lessons`), consumed `LessonView.tsx:140-167` · **High**
Finishing L1.9 offers no path to L2.1 — the 68-lesson course fractures into nine dead-ended silos, directly against the "go in order" promise on the landing page.
**Fix:** extend `findLesson` to roll over to the next/previous module (ordered by phase + module index); label the card "Next module · M2 L2.1" when crossing.

**E2 · No progress tracking or resume point** — all Learn routes; no persistence anywhere · **Medium**
A returning user must remember where they stopped and scan module lists manually. For a self-paced course this is the single biggest retention lever.
**Fix:** `localStorage` set of visited lesson IDs → check/dot on module lesson lists, "N of 68 read" on cards, and a "Continue L3.2" button on `/learn`.

**E3 · Prev/next cards stay 2-col on phones** — `LessonView.tsx:140` (`grid-cols-2`, no responsive variant) · **Medium**
Two ~180px cards with truncating titles at the exact moment (end of lesson) you most want a big tap target.
**Fix:** `grid-cols-1 sm:grid-cols-2` (next above prev on mobile).

**E4 · Lesson header lacks position context** — `LessonView.tsx:76-79` (shows only lesson ID) · **Low**
Readers deep in a module don't know how far along they are.
**Fix:** extend the eyebrow: "L1.3 · Lesson 3 of 9" (data already available in `findLesson`).

**E5 · No reading-time estimate** — module lesson lists and lesson header · **Low**
"Bite-sized" is claimed but never quantified; word counts exist in the JSON at build time.
**Fix:** derive "~3 min read" from body word count in the content registry.

**E6 · Quiz answer can't be re-hidden** — `LessonView.tsx:27-46` (reveal is one-way until navigation) · **Low**
Minor; self-testers may want to collapse and retry.
**Fix:** make the reveal a toggle. (Per-lesson reset via `key={lesson.id}` already works correctly.)

**E7 · Markdown wrapper styles only p/strong/ul/ol/a** — `LessonView.tsx:11-18` · **Low**
Verified: current content uses none of blockquote/code/table, so nothing renders broken today — this is future-proofing for regenerated content.
**Fix:** add `[&_blockquote]`, `[&_code]`, `[&_table]` styles when convenient.

**E8 · Heading semantics are flat** — `LessonView.tsx:51` (`SECTION_LABEL` renders `<p>` not headings), `learn/index.tsx` h1→h3 skip · **Low**
Screen-reader outline of a lesson is a single h1.
**Fix:** make section labels `<h2>` styled identically.

**Positive:** the lesson section rhythm (recall → hook → summary → body → example → In Malaysia → quiz → takeaway → action → sources) is a genuinely strong learning funnel; empty states are graceful ("being written", disabled rows, silent redirect on bad URLs); back-links are correct at every level; card language and the red-rule eyebrow are consistent across all Learn pages.

---

## F. Glossary

**G1 · 5 terms for a 68-lesson curriculum, and no lesson links to any of them** — `glossary/index.tsx:10-69`; no glossary links in any `content/m*.json` body · **High** (content gap)
The glossary covers only ETF-visualizer terms (WHT, TER, friction, acc/dist, estate tax) while the course introduces EPF, SOCSO, PCB, PTPTN, takaful, unit trusts, REITs, DCA… — and lessons never link to the glossary that does exist, so it's a dead-end page.
**Fix:** expand to ~30–40 terms (1–3 per module, sourced from the lesson content you already wrote); give each term an anchor `id`; link first occurrences in lesson bodies via markdown links (a content-pipeline change — flag for the Notion extractor rather than hand-editing JSON).

**G2 · No search or A–Z structure** — `glossary/index.tsx` (static 2-col grid) · **Medium** (blocks G1)
Fine at 5 terms; unusable at 40.
**Fix:** client-side filter input + alphabetical grouping when G1 lands.

**Positive:** the page already speaks the Learn language (red-rule eyebrow, same card system, same max-width) — extending it is additive, not rework.

---

## Top 10 priorities

| # | ID | Finding | Severity | Effort |
|---|----|---------|----------|--------|
| 1 | A1 | No navigation at all below 1024px — add mobile drawer | High | M |
| 2 | A2+A3 | No visible focus + near-zero ARIA — global focus rule + semantics pass | High | S–M |
| 3 | A4 | Hover-only tooltips & delete-debt invisible on touch | High | S |
| 4 | E1 | "Next" dies at module boundaries — breaks the course spine | High | S |
| 5 | A6 | No scroll reset on navigation (next-lesson lands mid-page) | High | S |
| 6 | D1+D2 | Wealth Sim visual drift — glass cards + ~24 off-palette colors | High | M |
| 7 | C1 (+B3) | Jargon wall on the default landing screen; orphaned hub page | High | S–M |
| 8 | B1+B2 | Half the sidebar is unlabeled dead links — add "Soon" tags | High | S |
| 9 | G1 | Glossary coverage + lesson→glossary linking | High | M (content) |
| 10 | E2 | Learn progress tracking + "Continue" | Medium | M |

**Quick wins** (each < 30 min, independent): A5 emoji removal · A7 document titles · A8 raise 9px text / retire `#A2A3A5` for readable copy · B1 "Soon" badges · E3 prev/next mobile stack · D9 copy fix · meta description + font `<link>` (A9 partial).

**Explicitly dropped after verification:** "FFM sidebar item misclassified as leaf" (it has children; renders correctly as a group), "currency toggle relabels axis without rescaling" (values are converted consistently; behavior is correct), "markdown tables render broken" (no tables exist in content — kept as Low future-proofing, E7).
