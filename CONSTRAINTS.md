# Constraints — Issue #24

Locked by Station II (`ii-plan-issue`). Station III must respect every line.

- **Zero regressions:** `node skills/skill-workbench/scripts/validate.js --all` must stay at
  **0 fail, 0 warn**. The three in-scope station scores (iv-review-build-and-pr,
  v-babysit-pr-and-merge, pipeline-triage — all 100/100 in `SPEC.md`) must not drop; this issue
  touches no skill file, so any score change is a defect.
- **Anti-cheat:** forbid deleting a still-valid passage to make the edit look tidy, weakening the
  acceptance grep to pass, or reporting a predicted config value as observed. Every claim written
  into `README.md` must be traceable to a PR #23 artifact or a command output captured in
  `SPEC.md` — never to recollection.
- **Comments only in `.coderabbit.yaml`:** no setting, key, or value may change. Any diff hunk in
  that file must be a `#` comment line.
- **Forbidden edits:** every `skills/**` file, `agents/**`, `scripts/**` (including
  `sync-coderabbit.ps1` — the finding is recorded, the model is not redesigned), and
  `docs/issue-to-pr-skill-workflow.md`.
- **Preserved content:** the rate-limit figures (the "Free-tier contradiction is retired" block),
  the "What spends a review — and what does not" table, the command tables, and the OSS-vs-UI
  precedence discussion stay. Only the three disproved claims and their consequences change.
- **Doc-truth invariant:** the rewritten section must keep its "measured on" framing. No claim may
  be stated as general truth when it is one dated observation on one repository.
- **No new dependency, no code:** Markdown-only change set.

<!-- Historical: Issue #7 constraints retired here (all tasks [x], merged as PR #23). -->

## Historical — Issue #7 (retired, PR #23 merged)

- `validate.js --all` 0 fail; iv / v / pipeline-triage scores >= 100.
- Station `SKILL.md` bodies <= 250 lines.
- Plan-gated commands state their plan requirement and degrade to an explicit report.