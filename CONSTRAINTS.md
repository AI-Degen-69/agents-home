# Constraints — Issue #26

Locked by Station II (`ii-plan-issue`). Station III must respect every line.

- **Zero regressions:** `node skills/skill-workbench/scripts/validate.js --all` must stay at
  **0 fail, 0 warn** (measured baseline at plan time: `Validated 91 skill(s): 0 fail, 0 warn`).
  The `vi-close-pipeline` and `v-babysit-pr-and-merge` skill scores must not drop.
- **New behavior requires a test:** the issue's first acceptance criterion says "verified by test".
  A new `scripts/remote-branch-ownership-test.sh` is therefore **required**, not optional — it is
  the only criterion that cannot be discharged by `grep`.
- **Anti-cheat:** forbid deleting a still-valid passage to make the edit look tidy, weakening the
  acceptance grep, relaxing the test into a tautology, or reporting a predicted command result as
  observed. Every claim written into a skill must be traceable to a command output captured in
  `SPEC.md` — never to recollection.
- **Ordering is load-bearing, not stylistic:** `git push origin --delete` must appear in
  `merge-and-reset.md` strictly *after* the `MERGED` confirmation, and the local `-D` must come
  before the remote delete. Remote-first deletion is forbidden — squash-merged commits would be
  stranded with no ref. The test asserts this ordering by line number.
- **Forbidden edits:** `evals/snapshots/**` (past versions), `merge strategy`, `pipeline-triage`,
  git hosting configuration, and every station skill outside the four sites in `SPEC.md`.
- **Preserved content:** Station VI's "Blocked / Incomplete" contract, the other six gate checks,
  the `@coderabbitai resolve` ordering, and the `squash` merge strategy all stay as they are.
- **No new dependency:** the test uses only bash + git + grep, matching `scripts/lane-precondition-test.sh`.
- **Doc-truth invariant:** the rewritten check 5 must keep its assertive framing. A check that
  cannot fail is the bug; wording that hedges ("ideally no stray branches") reintroduces it.

<!-- Historical: Issue #24 constraints retired here (issue closed, merged as PR #25). -->
<!-- Historical: Issue #7 constraints retired here (all tasks [x], merged as PR #23). -->

## Historical — Issue #24 (retired, PR #25 merged)

- `validate.js --all` 0 fail; iv / v / pipeline-triage scores >= 100.
- `config/coderabbit/README.md` claims must trace to a PR #23 artifact; `.coderabbit.yaml` comment
  lines only.

## Historical — Issue #7 (retired, PR #23 merged)

- `validate.js --all` 0 fail; iv / v / pipeline-triage scores >= 100.
- Station `SKILL.md` bodies <= 250 lines.
- Plan-gated commands state their plan requirement and degrade to an explicit report.