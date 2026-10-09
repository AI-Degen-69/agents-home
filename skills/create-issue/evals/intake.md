# Intake — create-issue refinement loop

## Skill pointer

- `C:\Users\Tiger\.agents\skills\create-issue` (global copy is the single source of truth).

## What the skill does

Intake branch of the issue→PR pipeline: one raw operator idea becomes one researched, publishable GitHub issue with a `[TAG]` title and only relevant existing labels, plus a posted CodeRabbit plan request — without a draft-approval pause.

## What "good" looks like

1. Real repo research before drafting (paths with line numbers), never invented.
2. Open questions land in the issue body (`needs-answers` only when that label exists) — publication is never blocked.
3. Splits are wired as one family (`Part of #` / `Related:` / native dependency edges).
4. The CodeRabbit plan request is posted as its own comment, body only, skipped only for genuinely trivial work — no wait, no retry.
5. Closeout is everyday Hebrew per the output contract.

## Success definition (measurable)

| Dimension | Check | Deterministic? |
|---|---|---|
| Outcome | Runs `gh label list`, then `gh issue create` with a `[TAG]` title and only relevant existing labels | Yes (regex) |
| Outcome | Prescribes posting the CodeRabbit prompt body, not the reference file | Yes (regex) |
| Outcome | Skips the plan request for docs/typo-only issues | Yes (regex) |
| Style | Ambiguity goes to `Open questions`, never to a blocking interview | Yes (regex) |
| Style | Closeout follows the Hebrew contract | Yes (regex) |
| Negative | No catch-all trigger wording that would convert remarks into issues | Yes (not_regex) |

Behavioral (live-run, needs a real repo + `gh`): research quality, the actual publish, the actual comment, the actual Hebrew report — recorded as `not-run`.

## Loop config

- Baseline: `evals/snapshots/v0-SKILL.md` (pre-workbench fixes)
- Snapshots: `v0` (original), `v1` (post-fixes, pre-adopted-improvements)
- Iteration dir: `evals/iteration-1/`
- Grader: `scripts/grade.js` (zero-dependency Node; subcommands `audit` and `case`)
- Live `gh` runs are **not** executed by the loop (they would publish real issues); those assertions are recorded as `not-run`.
