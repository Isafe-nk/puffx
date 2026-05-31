---
name: git-workflow
description: Enforces the project's Git branching model, commit conventions, and merge practices. ACTIVATE this skill before any git add, git commit, git merge, or git push operation.
---

# Git Workflow — puffx Project

This skill defines the **mandatory** Git workflow for all agents operating on the puffx codebase. Follow these rules before every git operation — no exceptions.

---

## 1. Golden Rule

> **Never commit directly to `main`.** All changes must go through a feature branch first.
> **NEVER merge a feature branch into `main` without explicit user instruction/approval.**

`main` is the production-ready branch. It must always pass `npm run build`. You must pause, present your branch work, and wait for the user to explicitly say "merge it" before running any merge commands.

---

## 2. Branch-First Workflow

Every change — no matter how small — follows this sequence:

```
1. Branch off main       →  git checkout main && git pull origin main
2. Create feature branch →  git checkout -b <prefix>/<descriptive-name>
3. Commit work           →  git add . && git commit -m "<type>(<scope>): <msg>"
4. Push branch           →  git push -u origin <prefix>/<descriptive-name>
5. Merge with --no-ff    →  git checkout main && git merge --no-ff <branch>
6. Clean up              →  git branch -d <branch>
```

### Why `--no-ff`?
Always merge with `--no-ff` (no fast-forward) to preserve branch history as a distinct rail in the git graph. This makes feature, fix, and chore work visually distinguishable by color in Git Graph tools.

---

## 3. Branch Naming Convention

| Prefix      | Purpose                              | Example                         |
|-------------|--------------------------------------|---------------------------------|
| `feat/`     | New feature or enhancement           | `feat/estate-tax-warning`       |
| `fix/`      | Bug fix                              | `fix/wht-calculation-rounding`  |
| `chore/`    | Tooling, dependency, config changes  | `chore/upgrade-chartjs`         |
| `docs/`     | Documentation or `spec.md` updates   | `docs/add-verification-section` |
| `refactor/` | Code restructuring, no behaviour Δ   | `refactor/extract-fee-hook`     |

---

## 4. Commit Message Convention (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body]
```

### Types

| Type       | When to use                                |
|------------|--------------------------------------------|
| `feat`     | New feature or visible UI change           |
| `fix`      | Bug fix                                    |
| `docs`     | Documentation or `spec.md` changes         |
| `refactor` | Code restructure, no behaviour change      |
| `chore`    | Build tooling, dependencies, CI config     |
| `test`     | Adding or updating tests                   |
| `perf`     | Performance improvement                    |

### Project-Specific Scopes

| Scope      | Area of the codebase                            |
|------------|------------------------------------------------|
| `engine`   | `frictionModel.ts`, `useSimulator.ts`          |
| `ui`       | Components, styling, layout                    |
| `sidebar`  | Sidebar inputs and controls (`Sidebar.tsx`)    |
| `charts`   | Chart.js / `PerformanceCharts.tsx`             |
| `matrix`   | `TcoMatrix.tsx`                                |
| `brand`    | Logo, favicon, tagline, naming                 |
| `spec`     | `spec.md` mathematical model updates           |
| `config`   | Vite, TS config, `package.json`                |
| `skills`   | `.agents/skills/` workflow definitions         |

### Examples

```
feat(engine): add bid-ask spread cost to friction model
fix(ui): correct WHT label from 30% to 15% for UCITS ETFs
feat(brand): add puffx √ logo favicon with transparent background
docs(spec): add ETF spread bps defaults to section 2A
chore(config): upgrade chart.js to v4.5
refactor(engine): extract FX fee calculation into helper function
```

---

## 5. Hotfix Workflow

For urgent production bugs that need to ship immediately:

```bash
git checkout main && git pull origin main
git checkout -b fix/<descriptive-bug-name>
# ... fix the bug, commit ...
git push -u origin fix/<descriptive-bug-name>
git checkout main && git merge --no-ff fix/<descriptive-bug-name>
git push origin main
git branch -d fix/<descriptive-bug-name>
```

---

## 6. Keeping Branches Up-to-Date

If `main` has moved ahead while you were working on a feature branch, rebase (preferred over merge):

```bash
git fetch origin
git rebase origin/main
# Resolve conflicts if any, then:
git push --force-with-lease origin feat/your-feature-name
```

---

## 7. Release Tagging

After a significant milestone, tag on `main`:

```bash
git checkout main && git pull origin main
git tag -a v1.0.0 -m "Release: puffx v1.0.0 — IBKR S&P 500 Visualizer"
git push origin v1.0.0
```

Semantic Versioning: `vMAJOR.MINOR.PATCH`

| Bump    | When                                          |
|---------|-----------------------------------------------|
| `MAJOR` | Breaking change or full redesign              |
| `MINOR` | New feature added, backward compatible        |
| `PATCH` | Bug fix, minor tweak                          |

---

## 8. Pre-Commit Checklist

Before every commit, the agent must verify:

- [ ] Currently on a **feature branch**, not `main`
- [ ] Commit message follows `<type>(<scope>): <description>` format
- [ ] `npm run lint` passes (if code was changed)
- [ ] No unrelated files staged

Before every merge to `main`:

- [ ] Using `--no-ff` flag
- [ ] `npm run build` passes on the branch
- [ ] Branch is rebased on latest `main`
