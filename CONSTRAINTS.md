# CONSTRAINTS — Issue #37: align agent skills with CodeRabbit configuration

Branch: i37/align-agent-skills-with-coderabbit-configuration | Issue: #37

Supersedes: the silent self-improve-loop scope previously recorded here (preserved in git history on `main`). This branch re-scopes both files to #37.

## Stack (auto-detected)
- Docs/YAML-only change: Markdown skill contracts (`SKILL.md`, `references/`, `README.md`), eval JSON, one YAML restore. No runtime language, no test runner for product code.
- Verification runners: `node skills/create-issue/scripts/grade.js`, `node skills/skill-workbench/scripts/validate.js --all`, `Select-String` sweeps, `gh label list`, `Test-Path ./.coderabbit.yaml`.

## Zero regressions
- `grade.js case` for `create-issue` and for `iv-review-build-and-pr` must stay green after the edits.
- `validate.js --all` must stay green.
- Restored `.coderabbit.yaml` must be byte-identical to `git show ccebf8e:.coderabbit.yaml` (compare hashes, never retype).
- No existing skill behavior outside the #37 file list may change; Station IV behavior is wording-only.

## Hard boundaries
1. **Canonical prompt is frozen.** `skills/create-issue/references/coderabbit-plan-prompt.md` is unchanged; its text is not copied anywhere else.
2. **History is not rewritten.** `evals/snapshots/**` and `evals/iteration-*` are records, never edited.
3. **No new CodeRabbit features.** No `auto_review`, `request_changes_workflow`, or Essentials+/Team+ gated settings; no reliance on automatic linking, planning, labeling, or review.
4. **Labels are existing-only.** Never run `gh label create`; never invent a label; a missing wanted label is skipped and named in the closeout.
5. **Out of scope:** `skills/ii-plan-issue/**`, `wayfinding-operations.md`, `skills/quick-fix/**`, `scripts/sync-coderabbit.ps1`, `CONSTRAINTS.md` beyond this re-scope, `tasks/**` beyond the #37 plan.
6. **Anti-cheat** — never skip, disable, or weaken a grader assertion to make a run pass. Never edit snapshots or recorded results to hide a failure.
7. **No scope expansion.** Docs alignment + config restore only. Anything noticed but unrelated becomes a future issue, never a side edit.
