# Reporting Contract — progress notes, then one final summary

**Canonical definition.** Both `skill-workbench` (option 1 of «אפשרויות להמשך 🔀», in its
SKILL.md) and `skill-refinement-loop` (Phase 2 batches, in its SKILL.md) follow
this contract; each SKILL.md keeps only a pointer here plus the flow-specific
vocabulary (findings/change requests/eval cases). If this file and a SKILL.md
ever diverge, this file wins — fix the SKILL.md, not this file.

## The recommendation screen (Discovery entry)

When a flow opens with a ranked list and a suggested next item, the screen
carries the recommendation. Four rules, all learned the hard way:

- **One screen, not two.** Never print a recommendation and then a separate
  choice menu. A recommendation plus "pick a number from the list above" is
  two decisions in a row, and the first one silently voids the second. The
  recommendation is the default action; alternatives go on one line beneath it.
- **Name the action, not the position.** `הפעולה הבאה 🎯` when there is one
  clear next action worth following. `אפשרויות להמשך 🔀` when the paths
  genuinely differ and none is recommended. Never reuse one name for both —
  the same skill can have both screens, and a vague shared name makes them
  read as the same thing.
- **Never claim a decision the operator has not made.** Write `מומלץ` /
  recommended, never `נבחר` / selected, until the operator actually answers.
  A header that says "the selected skill" is a silent pick wearing a heading.
- **A default is not consent.** Even with a clear recommendation, the flow
  halts and waits. Recommending makes the reply easier; it does not authorize.

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

This section is the **single list of final-summary gates** for every skill that
defers here. A SKILL.md may add flow-specific vocabulary below; it must not
restate or contradict these gates.

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
- **A waiver is not clean.** A **waiver** is a residual finding the operator
  decided not to fix, recorded with its reason. A waived finding may be
  *reported* and may permit advancing — but it is never described as clean,
  and the final summary lists every waiver (check, tokens/evidence, reason).
  Un-waived residual findings keep the gate closed.
- **How a waiver satisfies the gates.** A waiver substitutes for *fixing*, never
  for *reporting*: the check still runs and its finding still counts as a finding.
  A gate is satisfied by a waiver only when (a) the operator approved it, (b) the
  waiver is recorded with its reason, and (c) the final summary lists every waived
  check with its evidence. A waived finding is reported as **waived**, never as
  passed and never as clean. An unapproved or unrecorded waiver does not satisfy
  any gate.
- **Operator decisions block, not bypass.** If an item cannot be completed
  without a decision (explicit rule waiver, adopt/defer/drop, retired
  capability), stop and ask. Do not present a final summary before the
  decision.
- **Silent resolutions are labeled.** Unanswered open questions resolved by
  the stated guess (ניחוש) are applied and labeled as such in the progress
  note. Proposals enter the queue only on explicit operator adoption.

A final summary also states: the deploy state (completed, or explicitly
deferred), the count of adopted proposals, and the count of remaining
findings and open questions.

## Flow-specific vocabulary

| Skill | Items | Progress note counts | Final gate | Closer |
|---|---|---|---|---|
| `skill-workbench` | Findings + open questions (option 1 of «אפשרויות להמשך 🔀») | `נותרו X ממצאים ו-Y שאלות פתוחות` | validator clean + scorer re-run | «סיכום סופי» — closes the workbench for the skill |
| `skill-refinement-loop` | Change requests (Phase 2) / eval cases (Phase 1 iterations) | how many requests remain | relevant eval cases pass clean | loop record + final summary — closes the loop |

## Where each skill points here

- `skill-workbench/SKILL.md` — «טיפול בממצאים אחד־אחד» section links here and
  defers the general pattern to this file. Its Discovery entry screen follows
  "The recommendation screen" above.
- `i-pick-issue/SKILL.md` — its Discovery screen (the recommended leading
  issue) follows the same four rules, including never writing «נבחר להתחלה»
  before the operator picks.
- `skill-refinement-loop/SKILL.md` — "Progress-then-final-summary reporting
  pattern" section links here and defers the general pattern to this file.
