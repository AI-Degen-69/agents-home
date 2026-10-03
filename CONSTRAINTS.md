# CONSTRAINTS.md — Issue #3 (Small: eval wording + read-only comparison)

- **Zero regressions:** `skills/i-pick-issue/evals/evals.json` must still parse as
  JSON after T1; every other static assertion pattern/text stays byte-identical.
- **No pack-repo writes:** pack is read via `gh api` only. No branches, pushes, or
  PRs outside agents-home.
- **No silent scope growth:** touch only the one `why` line (T1), `tasks/plan.md`,
  `tasks/todo.md`, and one issue comment (T4). Issues #1, #7, #10 are out of scope.
- **Anti-cheat:** no assertions added, removed, or reworded beyond T1; no test or
  lint suppressions; gaps are reported, never edited away.
- **Dependencies:** no new external dependencies. `gh` + stock PowerShell only.
