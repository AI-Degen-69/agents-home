Branch: i31/show-the-7-box-quick-fix-gate-only-for-quick-fix-c | Issue: #31

# Plan — Issue #31: show the 7-box gate only for quick-fix candidates

## Right-sizing (Step 0)
- **Tier: Standard.** 10 markdown contract files across 5 skills, 3 shared docs and the
  canonical `AGENTS.md`; one coherent architectural decision. No runtime code changes.
- **Task type: Docs** (contract prose) with a behavioral change to *when* the gate evaluates.
- Not Tiny, so Step 0C's quick-fix divert does not apply. The 7-box verdict at Station I
  already failed this issue (boxes 1-4) and the full pipeline was chosen.

## Step 0A — CodeRabbit intake (adopted / rejected / unverified)
- **Adopted:** its task grouping (3 phases), the exact per-file change list, the design
  choice that Stations II-IV stay label-only (no explicit-request trigger), the rule that
  direct `/quick-fix` keeps the full gate, and the Phase 3 contradiction grep list.
- **Rejected:** its grader invocation `node skills/<skill>/scripts/grade.js audit`
  and `... case` — both crash with `ERR_INVALID_ARG_TYPE` because `--skill` (and
  `--evals` for `case`) are required. Verified by running them: real exit code 1.
  Corrected commands recorded in `CONSTRAINTS.md`.
- **Rejected:** editing `skills/README.md` to replace a phrase "no label prerequisite" —
  **no such string exists in the repo** (grep returns nothing). README only needs the
  lane/intake rows reworded to state the label precondition, not a phrase swap.
- **Rejected:** changing `skills/quick-fix/references/output-template.md` — it contains no
  gate/divert source description at all, so the conditional clarification it allows is moot.
- **Unverified / out of scope:** its claim that `skills/create-issue/SKILL.md:95` is fine to
  leave. That line says the label "still runs its own hard 7-box gate at the divert point",
  which stays true for a labeled issue — no contradiction. Left unchanged.
- **Verified line numbers (spot-checked against live files):** i-pick-issue §1a at 46-57 and
  Next Station at 22; ii-plan-issue Step 0C at 50-66 and Next Station at 15; iii-build-plan
  §1c at 53-67 and Next Station at 13; iv-review-build-and-pr Step 0.2 at 65-80 and Next
  Station at 14. All accurate.

## Resolved answers (no operator question needed)
- Unlabeled + no explicit request => no gate run, no gate output, no lane offer; go
  straight to the execution-mode gate. Taken from the issue's stated acceptance criteria.

## Task decomposition
Depends-on graph: T1 -> T2 -> T3 -> T4.

- **T1** — Add the label precondition to Station I §1a + Next Station. [Docs] XS.
  Files: `skills/i-pick-issue/SKILL.md`. Remove the three label-independent sentences; require
  label or explicit request; state the silent unlabeled path; keep all-pass, operator choice,
  verdict handoff, failure label removal. Depends on: none.
  Verify: `node skills/i-pick-issue/scripts/grade.js case --evals skills/i-pick-issue/evals/evals.json --skill skills/i-pick-issue/SKILL.md`.

- **T2** — Add the label precondition to Stations II, III, IV. [Docs] S.
  Files: `skills/ii-plan-issue/SKILL.md`, `skills/iii-build-plan/SKILL.md`,
  `skills/iv-review-build-and-pr/SKILL.md` (+ each Next Station line).
  Require label AND (Tiny / fresh-plan / whole-diff) as today; unlabeled issues pass silently;
  Station II also removes the label on a box failure. Depends on: T1 (establishes the shared term).
  Verify: the three graders' `case` runs.

- **T3** — Align handoff + shared contracts. [Docs] S.
  Files: `skills/quick-fix/SKILL.md` (divert-handoff wording only), `AGENTS.md`,
  `docs/issue-to-pr-skill-workflow.md`, `skills/README.md`,
  `skills/create-issue/references/issue-tracker.md`.
  Preserve verbatim: "run all 7 boxes yourself", "The `quick-fix` label is never box 8", the
  carry-over rule (boxes 2/5/6/7, recount 1, re-check 3-4), the ledger exemption at
  docs:196. Depends on: T1, T2.
  Verify: graders for i-pick-issue, ii-plan-issue, iii-build-plan, iv-review-build-and-pr, quick-fix.

- **T4** — Consistency sweep + full grader run. [Docs] XS.
  Grep `regardless of its label`, `unlabeled`, `every candidate`, `no label prerequisite`,
  `7-box` outside snapshots; confirm zero contradictions remain. Run all five graders and
  require >= 109 passing, 0 failing. Depends on: T3.
  Verify: grep output reviewed by hand + grader exit codes.

## Checkpoints
- After T2: three station graders still green.
- After T4: full five-grader run green, contradiction grep clean.

## Sub-issues
Skipped: Standard work, but the tracker ceremony buys nothing here — this is a single
coherent prose change with a linear T1->T4 order and no independent parallelism.
