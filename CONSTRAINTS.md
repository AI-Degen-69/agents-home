# Constraints — Issue #19

Locked by Station II (`ii-plan-issue`). Station III must respect every line.

- **Zero regressions:** `node skills/skill-workbench/scripts/validate.js --all` must show no new failures vs pre-fix baseline; targeted grep `git grep -n "NOTICED-BUT-NOT-TOUCHING" -- skills AGENTS.md docs` must show new owner language in every active capture-and-surface instruction.
- **No behavior code changes:** Markdown skill docs only. No validator script changes, no harness link changes, no dependency changes.
- **Anti-cheat:** forbid skipping/disabling tests, deleting assertions, suppressing linters, editing historical snapshots (`skills/iv-review-build-and-pr/evals/snapshots/**`), editing non-pipeline skill content (e.g. `skills/shadcn/SKILL.md`).
- **Scope fence:** exactly one end-to-end owner (Station VI). No auto-publish of follow-up issues without explicit operator approval. No bulk-creation for stale historical chat mentions. `AGENTS.md` rule 5 (never touch out-of-scope code mid-task) stays unchanged — only the handoff wording may reference the owner.
- **Performance:** not applicable (docs-only change; no runtime paths).
- **Dependencies:** no new external dependencies.
