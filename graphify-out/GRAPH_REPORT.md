# Graph Report - .  (2026-06-09)

## Corpus Check
- Corpus is ~21,061 words - fits in a single context window. You may not need a graph.

## Summary
- 215 nodes · 319 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.82)
- Token cost: 43,397 input · 7,658 output

## Community Hubs (Navigation)
- [[_COMMUNITY_ETF Drag Visualizer UI|ETF Drag Visualizer UI]]
- [[_COMMUNITY_Wealth Simulator Engine & Charts|Wealth Simulator Engine & Charts]]
- [[_COMMUNITY_Domain Spec & Friction Model|Domain Spec & Friction Model]]
- [[_COMMUNITY_Build Tooling & Dev Deps|Build Tooling & Dev Deps]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_CI Pipeline & Git Workflow|CI Pipeline & Git Workflow]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_Debt vs Investing Lab|Debt vs Investing Lab]]
- [[_COMMUNITY_Brand Assets & Icons|Brand Assets & Icons]]
- [[_COMMUNITY_Shared Alert Banner|Shared Alert Banner]]
- [[_COMMUNITY_Antigravity App Metadata|Antigravity App Metadata]]
- [[_COMMUNITY_Claude Code Permissions|Claude Code Permissions]]
- [[_COMMUNITY_Shared KPI Card|Shared KPI Card]]
- [[_COMMUNITY_VS Code Launch Config|VS Code Launch Config]]
- [[_COMMUNITY_VS Code Editor Settings|VS Code Editor Settings]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 15 edges
2. `ETF` - 11 edges
3. `Technical Specification (spec.md)` - 11 edges
4. `Git Workflow Skill (puffx)` - 9 edges
5. `scripts` - 6 edges
6. `SimulationDataPoint` - 6 edges
7. `FeeOptimizationFrequency` - 6 edges
8. `runMonteCarlo()` - 6 edges
9. `AssetAllocation` - 6 edges
10. `Monthly Compounding & Leakage Pipeline` - 6 edges

## Surprising Connections (you probably didn't know these)
- `MY-IBKR S&P 500 Drag Visualizer (README)` --semantically_similar_to--> `Technical Specification (spec.md)`  [INFERRED] [semantically similar]
  README.md → spec.md
- `Domain Context & Core Objectives` --semantically_similar_to--> `Core Domain Trade-off (US vs Ireland ETF)`  [INFERRED] [semantically similar]
  spec.md → README.md
- `Step 1: Spec Grounding` --references--> `Technical Specification (spec.md)`  [INFERRED]
  .agents/skills/spec-driven-development/SKILL.md → spec.md
- `spec.md as Single Source of Truth` --references--> `Technical Specification (spec.md)`  [INFERRED]
  .agents/skills/spec-driven-development/SKILL.md → spec.md
- `Monthly Compounding & Leakage Pipeline` --conceptually_related_to--> `CI Job: Friction Engine Smoke Tests`  [INFERRED]
  spec.md → .github/workflows/ci.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **IBKR Transaction Friction Calculations** — spec_fx_spot_fee, spec_us_nyse_commission, spec_lse_ucits_commission, spec_bid_ask_spread_cost [EXTRACTED 0.95]
- **Monthly Compounding & Leakage Pipeline Steps** — spec_monthly_compounding_loop, spec_wht_leakage, spec_ter_drag, spec_execution_frequency [EXTRACTED 0.95]
- **CI Gating Jobs** — ci_type_check_job, ci_build_job, ci_engine_test_job [EXTRACTED 0.90]

## Communities (17 total, 4 thin omitted)

### Community 0 - "ETF Drag Visualizer UI"
Cohesion: 0.12
Nodes (18): CardProps, FrictionAlertProps, PerformanceChartsProps, SidebarProps, TcoMatrixProps, ETF_REGISTRY, App(), ETF (+10 more)

### Community 1 - "Wealth Simulator Engine & Charts"
Cohesion: 0.14
Nodes (22): AllocationPie(), TimelineChart(), MonteCarloChart(), RiskProfile(), RiskProfileProps, getActiveMonthlyDebtPayments(), getDebtBalanceAt(), auditFinancialHealth() (+14 more)

### Community 2 - "Domain Spec & Friction Model"
Cohesion: 0.11
Nodes (22): index.html (puffx entry), Core Domain Trade-off (US vs Ireland ETF), Technology Stack, MY-IBKR S&P 500 Drag Visualizer (README), React State Glossary & Interface Parameters, ETF Bid-Ask Spread Cost Formula, Domain Context & Core Objectives, Step 3: Precise Code Execution (+14 more)

### Community 3 - "Build Tooling & Dev Deps"
Cohesion: 0.10
Nodes (19): devDependencies, autoprefixer, esbuild, tailwindcss, tsx, @types/express, @types/node, typescript (+11 more)

### Community 4 - "App Shell & Navigation"
Cohesion: 0.12
Nodes (3): router, navConfig, SideNavItem()

### Community 5 - "TypeScript Compiler Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+8 more)

### Community 6 - "CI Pipeline & Git Workflow"
Cohesion: 0.17
Nodes (16): CI Job: Vite Production Build, CI Job: Friction Engine Smoke Tests, CI Pipeline (GitHub Actions), CI Job: TypeScript Type Check, Contributing Guide, Branch-First Workflow, Branch Naming Convention, Project-Specific Commit Scopes (+8 more)

### Community 7 - "Runtime Dependencies"
Cohesion: 0.15
Nodes (13): dependencies, dotenv, express, @google/genai, lucide-react, motion, react, react-dom (+5 more)

### Community 8 - "Debt vs Investing Lab"
Cohesion: 0.29
Nodes (4): DebtVsInvestingLab(), formatCurrency(), StrategyResult, SliderInputProps

### Community 9 - "Brand Assets & Icons"
Cohesion: 0.53
Nodes (6): puffx Apple Touch Icon (apple-touch-icon.png), puffx Favicon 64px (favicon-64.png), puffx Square-Root Brand Glyph (navy calligraphic radical with red accent dot), puffx Favicon (favicon.png), puffx Favicon Vector Source (favicon.svg), Interactive Brokers (IBKR) Wordmark Logo (ibkr.svg)

### Community 10 - "Shared Alert Banner"
Cohesion: 0.40
Nodes (3): AlertBannerProps, AlertType, styles

### Community 11 - "Antigravity App Metadata"
Cohesion: 0.40
Nodes (4): description, majorCapabilities, name, requestFramePermissions

## Knowledge Gaps
- **74 isolated node(s):** `allow`, `version`, `configurations`, `workbench.startupEditor`, `name` (+69 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Monthly Compounding & Leakage Pipeline` connect `Domain Spec & Friction Model` to `CI Pipeline & Git Workflow`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `CI Job: Friction Engine Smoke Tests` connect `CI Pipeline & Git Workflow` to `Domain Spec & Friction Model`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Technical Specification (spec.md)` (e.g. with `MY-IBKR S&P 500 Drag Visualizer (README)` and `Step 1: Spec Grounding`) actually correct?**
  _`Technical Specification (spec.md)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `allow`, `version`, `configurations` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ETF Drag Visualizer UI` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `Wealth Simulator Engine & Charts` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._
- **Should `Domain Spec & Friction Model` be split into smaller, more focused modules?**
  _Cohesion score 0.10822510822510822 - nodes in this community are weakly interconnected._