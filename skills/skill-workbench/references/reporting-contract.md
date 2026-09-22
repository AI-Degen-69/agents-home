# Reporting Contract — progress notes, then one final summary

**Canonical definition.** Both `skill-workbench` (option 1 of «הבא 👉», in its
SKILL.md) and `skill-refinement-loop` (Phase 2 batches, in its SKILL.md) follow
this contract; each SKILL.md keeps only a pointer here plus the flow-specific
vocabulary (findings/change requests/eval cases). If this file and a SKILL.md
ever diverge, this file wins — fix the SKILL.md, not this file.

## The rule

When the operator requests a batch of work (fix findings one by one, apply
change requests, run a full Phase 1 + Phase 2 pass), reporting has exactly two
levels:

1. **Progress note — after every item.** 1–2 lines: what was just done
   (fix applied, request applied + graded, eval case run) and how many items
   and open questions remain (`נותרו X ממצאים ו-Y שאלות פתוחות` in the
   workbench). Explicitly not a report and not a summary — the operator must
   always see that work is still pending.
2. **Final summary — only after the last item.** One closing reply that
   includes what was done, why, what works now, one next step, and a
   one-sentence usage example. It closes the workbench/loop for that skill.
   Nothing beyond this point unless the operator reopens the skill.

## Hard gates

- **No mid-flow summaries.** No partial loop record, no final summary, no
  usage example after any item except the last. A summary after one finding
  out of three implies the job is done — that is the failure mode this
  contract exists to prevent.
- **Validation gates the next item.** In the workbench: validator run clean
  before moving past a finding. In the refinement loop: relevant eval cases
  rerun and graded before the next request.
- **Final gate before the summary.** Re-run the scorer/validator (workbench)
  or the graded eval cases (refinement loop) clean, then present the final
  summary.
- **Operator decisions block, not bypass.** If an item cannot be completed
  without a decision (explicit rule waiver, adopt/defer/drop, retired
  capability), stop and ask. Do not present a final summary before the
  decision.
- **Silent resolutions are labeled.** Unanswered open questions resolved by
  the stated guess (ניחוש) are applied and labeled as such in the progress
  note. Proposals enter the queue only on explicit operator adoption.

## Flow-specific vocabulary

| Skill | Items | Progress note counts | Final gate | Closer |
|---|---|---|---|---|
| `skill-workbench` | Findings + open questions (option 1 of «הבא 👉») | `נותרו X ממצאים ו-Y שאלות פתוחות` | validator clean + scorer re-run | «סיכום סופי» — closes the workbench for the skill |
| `skill-refinement-loop` | Change requests (Phase 2) / eval cases (Phase 1 iterations) | how many requests remain | relevant eval cases pass clean | loop record + final summary — closes the loop |

## Where each skill points here

- `skill-workbench/SKILL.md` — «טיפול בממצאים אחד־אחד» section links here and
  defers the general pattern to this file.
- `skill-refinement-loop/SKILL.md` — "Progress-then-final-summary reporting
  pattern" section links here and defers the general pattern to this file.
