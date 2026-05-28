# Contributing Guide — Git Workflow

This document defines the branching model, commit conventions, and merge practices for this project.

---

## 1. Branch Model

We use a simplified **GitHub Flow** — a lightweight model suitable for a small team.

```
main          ← always production-ready, protected
  └── feat/spread-cost-input      ← new feature
  └── fix/friction-banner-bug     ← bug fix
  └── chore/update-dependencies   ← maintenance
  └── docs/update-spec            ← documentation or spec changes
```

### Branch Naming Convention

| Prefix    | Purpose                                         | Example                          |
|-----------|-------------------------------------------------|----------------------------------|
| `feat/`   | New feature or enhancement                      | `feat/estate-tax-warning`        |
| `fix/`    | Bug fix                                         | `fix/wht-calculation-rounding`   |
| `chore/`  | Tooling, dependency, or config changes          | `chore/upgrade-chartjs`          |
| `docs/`   | Documentation or `spec.md` updates only         | `docs/add-verification-section`  |
| `refactor/` | Code restructuring with no behaviour change   | `refactor/extract-fee-hook`      |

---

## 2. Day-to-Day Workflow

### Step 1 — Create a branch from `main`

Always branch off the latest `main`:

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
```

### Step 2 — Work on your feature

Make small, focused commits as you go (see Commit Convention below).

### Step 3 — Push your branch

```bash
git push -u origin feat/your-feature-name
```

### Step 4 — Open a Pull Request (PR)

- Open a PR from your feature branch → `main` on GitHub.
- Give the PR a clear title and a short description of *what* and *why*.
- Link to the relevant spec section if applicable.

### Step 5 — Review & Merge

- Squash-merge into `main` to keep history clean (use GitHub's **"Squash and merge"** button).
- Delete the feature branch after merging.

### Step 6 — Pull latest `main` locally

```bash
git checkout main
git pull origin main
```

---

## 3. Commit Message Convention

We follow the **Conventional Commits** standard:

```
<type>(<scope>): <short description>

[optional body]
```

### Types

| Type       | When to use                                             |
|------------|---------------------------------------------------------|
| `feat`     | A new feature or visible UI change                      |
| `fix`      | A bug fix                                               |
| `docs`     | Changes to documentation or `spec.md`                   |
| `refactor` | Code restructure, no behaviour change                   |
| `chore`    | Build tooling, dependencies, CI config                  |
| `test`     | Adding or updating tests                                |
| `perf`     | Performance improvement                                 |

### Scopes (project-specific)

| Scope        | Area of the codebase                        |
|--------------|---------------------------------------------|
| `engine`     | `frictionModel.ts`, `useSimulator.ts`        |
| `ui`         | Components, styling, layout                 |
| `sidebar`    | Sidebar inputs and controls                 |
| `charts`     | Chart.js / PerformanceCharts.tsx            |
| `matrix`     | TcoMatrix.tsx                               |
| `spec`       | `spec.md` mathematical model updates        |
| `config`     | Vite, TS config, package.json               |

### Examples

```
feat(engine): add bid-ask spread cost to friction model
fix(ui): correct WHT label from 30% to 15% for UCITS ETFs
docs(spec): add ETF spread bps defaults to section 2A
chore(config): upgrade chart.js to v4.5
refactor(engine): extract FX fee calculation into helper function
```

---

## 4. `main` Branch Rules

- **Never commit directly to `main`** — all changes go through a PR.
- `main` must always be in a **buildable, deployable state** (`npm run build` passes).
- PRs require at least a self-review (read through your own diff before merging).

---

## 5. Keeping Your Branch Up-to-Date

If `main` has moved ahead while you were working, rebase your branch (preferred over merge):

```bash
git fetch origin
git rebase origin/main
```

Resolve any conflicts, then force-push:

```bash
git push --force-with-lease origin feat/your-feature-name
```

---

## 6. Hotfix Workflow

For urgent production bugs:

```bash
git checkout main
git pull origin main
git checkout -b fix/critical-wht-bug
# ... fix the bug ...
git push -u origin fix/critical-wht-bug
# Open PR → main, merge immediately
```

---

## 7. Release Tagging

After a significant milestone, tag a release:

```bash
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Initial release: IBKR S&P 500 Drag Visualizer"
git push origin v1.0.0
```

Use **Semantic Versioning**: `vMAJOR.MINOR.PATCH`

| Bump    | When                                                    |
|---------|---------------------------------------------------------|
| `MAJOR` | Breaking change or full redesign                        |
| `MINOR` | New feature added, backward compatible                  |
| `PATCH` | Bug fix, minor tweak                                    |

---

## Quick Reference Cheatsheet

```bash
# Start new work
git checkout main && git pull origin main
git checkout -b feat/my-feature

# Commit as you go
git add .
git commit -m "feat(engine): describe what you did"

# Push branch
git push -u origin feat/my-feature

# Keep branch current with main
git fetch origin && git rebase origin/main

# After PR is merged — clean up locally
git checkout main && git pull origin main
git branch -d feat/my-feature
```
