# Contributing Guide

This project follows a strict Git workflow to keep `main` production-ready and branch history visually clean.

## Git Workflow

The full branching model, commit conventions, and merge practices are defined in the agent skill file:

📄 **[`.agents/skills/git-workflow/SKILL.md`](.agents/skills/git-workflow/SKILL.md)**

This is the single source of truth for all Git operations — both for human contributors and AI agents.

### Quick Reference

```bash
# Start new work
git checkout main && git pull origin main
git checkout -b feat/my-feature

# Commit as you go
git add .
git commit -m "feat(engine): describe what you did"

# Push branch
git push -u origin feat/my-feature

# Merge to main (always --no-ff for visual git graph)
git checkout main
git merge --no-ff feat/my-feature
git push origin main

# Clean up
git branch -d feat/my-feature
```

### Key Rules

1. **Never commit directly to `main`** — always use a feature branch.
2. **Always merge with `--no-ff`** — preserves branch rails in Git Graph for visual clarity.
3. **Use Conventional Commits** — `<type>(<scope>): <description>` format.
