# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive, client-only financial visualizer for **Malaysian retail investors** buying the S&P 500 via Interactive Brokers (IBKR). It quantifies long-term cost leakage and the tax/fee trade-off between **US-domiciled ETFs** (e.g. VOO/IVV/SPY — low TER but 30% dividend WHT) and **Ireland-domiciled UCITS ETFs** (e.g. CSPX/VUAA/SPYL — higher TER but 15% WHT under the US–Ireland treaty, no US estate tax). All simulation math runs natively in **USD** and is presented in **MYR** at the spot rate.

The product/marketing name is **puffx** (see `index.html`, favicon, git scopes).

## Commands

```bash
npm run dev      # Vite dev server on port 3000, host 0.0.0.0
npm run build    # Production build → dist/
npm run preview  # Serve the built bundle
npm run lint     # tsc --noEmit — this is the ONLY check; there is no test suite or ESLint
npm run clean    # rm -rf dist server.js
```

There are **no tests** and no test runner configured. `npm run lint` (a strict-mode TypeScript type-check) is the gate that must pass before commits, and `npm run build` must pass before merging to `main`.

## Architecture

React 19 + Vite + TypeScript, styled with **Tailwind CSS v4** (via `@tailwindcss/vite`, configured in `vite.config.ts` — there is no `tailwind.config.js`). Routing is `react-router-dom` v7 with a `createBrowserRouter` tree in `src/app/routes.tsx`. Charts use **recharts** (note: the README incorrectly says Chart.js — the code uses recharts everywhere). `@` is aliased to the repo root.

Layout nesting: `App` → `Layout` (global chrome + `SideNav`) → `VisualizerLayout` → individual visualizer pages. `/` redirects to `/visualizer`.

Code is organized by **feature** under `src/features/visualizer/`. The two visualizers are independent and have *separate* engines and conventions — do not assume shared logic between them:

### 1. `etf-drag/` — the original TCO / cash-drag visualizer
- **Engine is a hook**: `hooks/useSimulator.ts` runs a month-by-month compounding loop (`useMemo`) over the horizon, tracking two ETFs (A vs B) plus a friction-free benchmark. Returns balances, cumulative fees/TER/tax/spread, drag ratios, and an advisory.
- **Friction math**: `utils/frictionModel.ts` — `calculateTradeFees` (FX spot fee, US NYSE tiered commission vs LSE UCITS all-in commission, bid-ask spread), `getWhtRate` (US 30% / IE 15%), `getBrokerMin`. This file and `useSimulator.ts` are the `engine` git scope.
- **ETF data**: `constants.ts` holds `ETF_REGISTRY` (ticker, domicile, TER, default price, default spread bps).
- A friction warning banner triggers when per-transaction cost exceeds **2.0%** of contribution size; "Execution Frequency" (monthly/quarterly/biannually/annually) batches contributions to dilute fixed fee minimums; "Direct USD Deposit" bypasses the FX fee.

### 2. `wealth-simulator/` — broader net-worth / retirement model
- **Engine is pure functions** in `engine/finance.ts` (not a hook): `runDeterministicSimulation`, `getPortfolioStats` (multi-asset return/volatility via a hardcoded correlation matrix + Sharpe), `calculateMonthlyPayment`, `auditFinancialHealth`. Multi-asset allocation across equity/fixedIncome/cash/realEstate/gold.
- `engine/monteCarlo.ts` runs probabilistic paths; `engine/debtUtils.ts` handles amortizing debts (`getDebtBalanceAt`, `getActiveMonthlyDebtPayments`). Cashflow routing applies **debt overflow** — debt payments exceeding the lifestyle budget eat into savings/investment contributions.
- All engine types live in `engine/types.ts`.

`src/shared/` holds cross-feature primitives (`components/`: Card, KpiCard, SliderInput, AlertBanner; `utils/format.ts`). `src/navigation/navConfig.ts` defines the side-nav items — note several (Portfolio, Analysis, Market, Settings) have **no routes yet**; only Visualizer is wired up.

## Conventions

- The spec/README contain the authoritative math. `spec.md` is more current than `README.md` (e.g. the LSE commission breakdown and bid-ask spread model live in `spec.md` and the code, not the README). When changing engine math, keep `spec.md` in sync.
- `GEMINI_API_KEY` / `APP_URL` env vars exist (`.env.example`) for the AI Studio hosting environment but **Gemini is not currently used anywhere in `src/`**. Don't wire it in unless asked.

## Git workflow (enforced — see `.agents/skills/git-workflow/SKILL.md`)

This project has a **strict, mandatory** Git workflow. Key rules:
- **Never commit directly to `main`**; always branch first (`feat/`, `fix/`, `chore/`, `docs/`, `refactor/`).
- **Never merge to `main` without explicit user approval.** Pause and wait for the user to say "merge it".
- Merge with `--no-ff` to preserve branch rails in the git graph.
- Conventional Commits: `<type>(<scope>): <desc>`. Project scopes include `engine`, `ui`, `sidebar`, `charts`, `matrix`, `brand`.
- Before commit: on a feature branch, `npm run lint` passes. Before merge: `npm run build` passes.
