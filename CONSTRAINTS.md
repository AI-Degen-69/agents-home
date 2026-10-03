# Constraints — Issue #18

Locked by Station II (`ii-plan-issue`). Station III must respect every line.

- **Zero regressions:** every in-scope `score.js` overall must be >= its baseline in `SPEC.md`
  (i-pick-issue 98, ii-plan-issue 100, iii-build-plan 98, iiib-iterate-after-build 98,
  iv-review-build-and-pr 98, v-babysit-pr-and-merge 100, vi-close-pipeline 100,
  pipeline-triage 98, create-issue 100, present-pr 98, skill-workbench 98).
  `node skills/skill-workbench/scripts/validate.js --all` must exit 0, or exit nonzero
  only for the single waiver recorded in the closeout report.
- **Anti-cheat:** forbid skipping or disabling checks, deleting eval assertions, deleting a
  static assertion to make a grader green, suppressing linters, weakening a `must_match`
  regex, or reporting predicted command output as observed. If a check cannot pass,
  record a waiver with a reason — never delete the assertion.
- **Forbidden edits:** `skills/shadcn/SKILL.md` content (and every other non-pipeline skill's
  content), historical snapshots (`skills/iv-review-build-and-pr/evals/snapshots/**`,
  `skills/skill-refinement-loop/evals/snapshots/**`, `skills/vi-close-pipeline/evals/snapshots/**`,
  `skills/ii-plan-issue/evals/iteration-1/**`), and harness link types.
- **Preserved invariants:** Station IV's 8-call cap, its two-failure abort rule, and its
  browser flow are unchanged (Issue #10). Issue #19's `NOTICED-BUT-NOT-TOUCHING` ledger
  contract is not rewritten.
- **Line budgets:** keep each station `SKILL.md` body <= 250 lines. `skill-workbench/SKILL.md`
  body is 305 lines and its score drops at ~340 — new rule text goes in `references/`, never
  in the body.
- **No validator weakening:** `phantom-skill-refs` must still fail for real phantom skill
  names. CSS/HTML/package exemptions must be narrow vocabulary-shape rules, never a blanket
  prefix exclusion. A `node:test` regression script proves both directions.
- **Fixtures outside the repo:** graders and the new test script build fixtures in the OS temp
  directory only, never inside the repository.
- **Live assertions:** stay `not-run`. Never run live `gh` assertions against real repositories.
- **Performance:** validator and grader runtimes stay under 5s per skill; no new dependency.
- **Dependencies:** no new external dependency. All new scripts are zero-dependency Node >= 18.

<!-- Historical: Issue #19 constraints retired here (PR #21 merged). Kept for provenance. -->

## Historical — Issue #19 (retired, PR #21 merged)

- **No behavior code changes:** Markdown skill docs only. No validator script changes, no
  harness link changes, no dependency changes.
- **Scope fence:** exactly one end-to-end owner (Station VI). `AGENTS.md` rule 5 stays
  unchanged — only the handoff wording may reference the owner.

