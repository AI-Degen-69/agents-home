# Intake — vi-close-pipeline refinement loop

## Skill pointer

- `C:\Users\Tiger\.agents\skills\vi-close-pipeline` (global copy is the single source of truth).

## What the skill does

Final station of the issue→PR pipeline: post-merge closeout. Verifies the PR is MERGED, closes the issue only via the documented missing-Closes path, sweeps stale per-issue artifacts through signal-based discovery plus the two-gate obsolescence test, never deletes permanent knowledge, handles dead code only with zero-reference proof and targeted tests, and ends with the mandatory Clean Exit Gate.

## What "good" looks like

1. Step 0 gates everything on the MERGED state — no closeout on an open PR.
2. Candidates are found by signals (filename / content / history), never by assumed folder layout.
3. A file is deleted only when work is Closed AND zero inbound references hold.
4. Presentations and research are kept as permanent record, even when closed.
5. Dead code is the single approved code-change exception, with mechanical proof plus tests.
6. Foreign dirt is listed, never bundled into the prune commit.
7. Closeout follows the Hebrew contract, including the exit-gate state.

## Success definition (measurable)

| Dimension | Check | Deterministic? |
|---|---|---|
| Outcome | Prescribes the MERGED gate before any closeout step | Yes (regex) |
| Outcome | Prescribes signal-based discovery and the two-gate test | Yes (regex) |
| Outcome | Preserves permanent knowledge explicitly | Yes (regex) |
| Outcome | Dead code requires zero-reference proof plus tests | Yes (regex) |
| Outcome | Foreign dirt is committed separately, never bundled | Yes (regex) |
| Outcome | Ends with the Clean Exit Gate checks | Yes (regex) |
| Style | Closeout follows the Hebrew contract | Yes (regex) |

Behavioral (live-run, needs a real merged PR + `gh`): merge verification, the actual prune, the actual exit gate, the actual Hebrew report — recorded as `not-run`.

## Loop config

- Baseline: `evals/snapshots/v0-SKILL.md` (pre-workbench fixes)
- Iteration dir: `evals/iteration-1/`
- Grader: `scripts/grade.js` (zero-dependency Node; subcommands `audit` and `case`)
- Live `gh` runs are **not** executed by the loop (they would mutate real repos); those assertions are recorded as `not-run`.
