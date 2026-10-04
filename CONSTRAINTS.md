# CONSTRAINTS — Issue #31

Branch: i31/show-the-7-box-quick-fix-gate-only-for-quick-fix-c | Issue: #31

## Stack (auto-detected)
- Documentation-contract repo (agent skills in markdown).
- Verification = per-skill static graders, `node`, zero dependencies.

## Zero regressions
- All five affected graders must stay green: `i-pick-issue`, `ii-plan-issue`,
  `iii-build-plan`, `iv-review-build-and-pr`, `quick-fix`.
- Pre-change baseline recorded: **109/109 static assertions passing**
  (22 + 19 + 15 + 26 + 27). Post-change must be >= 109 passing, 0 failing.
- Run **without `--id`** (known numeric-ID filter defect selects zero cases).
- Correct invocation (CodeRabbit's plan omitted the required flags, so its
  command crashes with ERR_INVALID_ARG_TYPE):
  - `node skills/<skill>/scripts/grade.js audit --skill skills/<skill>/SKILL.md`
  - `node skills/<skill>/scripts/grade.js case --evals skills/<skill>/evals/evals.json --skill skills/<skill>/SKILL.md`
- quick-fix case `labeled-issue-still-runs-gate` and case
  `direct-entry-runs-full-gate` must keep passing.

## Hard boundaries
1. **The 7 boxes are frozen.** Boxes 1-7, their thresholds, their failure
   routes, "The `quick-fix` label is never box 8", and the literal phrase
   "run all 7 boxes yourself" must not change.
2. **Direct `/quick-fix` invocation is unchanged** - it runs all 7 boxes
   whether or not a label is present.
3. **Ordering unchanged.** Station II still owns the first write; Station IV's
   proof gate still precedes the divert; label removal on failure is preserved
   at every station-specific trigger.
4. **Anti-cheat** - never skip, disable, or delete an assertion to make a run pass.
   Never edit `skills/*/evals/snapshots/**` or recorded iteration results.
5. **No scope expansion** - do not "fix" the three known unrelated defects
   (box-6 routing conflict, quick-fix eval case 4 expectation, grader `--id` bug).
   Do not change Station I Discovery, selection, execution-mode gate, or
   `i-pick-issue/references/output-template.md`.
6. **No new dependencies.** Markdown only; no runtime code changes.

## Terminology
Use the phrase **"label precondition"** consistently across every edited file.
