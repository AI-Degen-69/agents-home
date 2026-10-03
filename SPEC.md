# SPEC — Issue #7: Hand PR titles, the review allowance and resolve to CodeRabbit

Branch: `i7/hand-pr-titles-the-review-allowance-and-resolve-to`

> Reconciliation note: this file previously held the completed Issue #18 spec (all tasks `[x]`,
> issue closed, work merged). Issue #18 is closed and its work landed, so the spec is replaced.
> The full #18 spec remains in git history at `SPEC.md` on `main`.

## Goal

Three CodeRabbit capabilities the pipeline leaves on the table get wired into the stations that
own each moment, and the two traps that follow from this repo being **private on the Free plan**
get closed so neither station can report a false clean pass.

1. **Station IV stops writing PR titles.** CodeRabbit writes them from `auto_title_instructions`.
2. **Station IV classifies its post-trigger reply into four outcomes**, including summary-only.
3. **Station V posts `@coderabbitai resolve` before merge**, and opens with `@coderabbitai
   configuration` when a review contradicts the committed config.

## Why the issue's own text is not buildable as written

Station II verified every seam against the live repo. Three corrections in the issue's comments
are load-bearing, and one is not yet reflected anywhere in the skills:

| # | Issue text says | Verified reality | Source |
|---|---|---|---|
| 1 | key is `auto_title_keyword` | **`reviews.auto_title_placeholder`** (default `@coderabbitai`); `auto_title_keyword` is not in the schema | `config/coderabbit/README.md:106` |
| 2 | run `@coderabbitai rate limit` as a separate probe before triggering | chat-gated on Free — refused with the upgrade notice; the allowance signal arrives **inside the trigger ack** | `config/coderabbit/README.md:87,161` |
| 3 | Station V's "zero inline comments → clean pass" is a branch | this repo is private on Free, so a summary-only review **is** that exact shape | `config/coderabbit/README.md:86,92` |

Correction 2 is why the issue's own acceptance grep still passes: the string
`@coderabbitai rate limit` must appear in Station IV — but as a **documented, plan-gated**
line, not as an instruction to spend a command that declines.

## Acceptance criteria (from the issue, verified against live anchors)

- [ ] Station IV no longer writes a Conventional-Commits title; the auto-title keyword is used and
      the TAG vocabulary is documented as the single title grammar.
- [ ] Station IV classifies the post-trigger reply into four outcomes and every one reaches the
      handoff report.
- [ ] Station V posts `@coderabbitai resolve` before merge and reports the result.
- [ ] Every plan-gated step states its plan requirement and degrades to a clear report.
- [ ] `skills/pipeline-triage/SKILL.md` trigger wording stays consistent with the Station IV change.

## Ground-truth seams (all read at plan time, 2026-10-03)

| File | Lines | What is there today |
|---|---|---|
| `skills/iv-review-build-and-pr/SKILL.md` | 149 | `gh pr create --title "<type>(<scope>): <summary>"` — the Conventional-Commits title to remove |
| `skills/iv-review-build-and-pr/SKILL.md` | 164-169 | three-outcome ack classification (`Review triggered.` / rate-limit / other / no reply) |
| `skills/iv-review-build-and-pr/SKILL.md` | 191 | the handoff line that must carry the fourth status |
| `skills/v-babysit-pr-and-merge/references/review-loop.md` | 100-105 | `COMPLETED` classification — the summary-only ambiguity |
| `skills/v-babysit-pr-and-merge/references/triage-and-apply.md` | 87-95 | the agent-fallback / reuse path the false clean pass must route into |
| `skills/v-babysit-pr-and-merge/references/triage-and-apply.md` | 121 | round exit condition |
| `skills/v-babysit-pr-and-merge/references/merge-and-reset.md` | 19-25 | the merge decision — where `resolve` goes |
| `skills/pipeline-triage/SKILL.md` | 58 | row 3, the early-review trigger wording |
| `skills/self-improve-loop/SKILL.md` | 65 | the existing `@coderabbitai resolve` precedent to follow |

**The issue's cited line numbers are stale** (it cites Station IV 135-141 / 145-165 / 179-180 and
`triage-and-apply.md` for the merge sequence; the real anchors are above). Station III re-reads
each anchor before editing.

## Executed baseline (2026-10-03, `C:\Users\Tiger\.agents`)

`node skills/skill-workbench/scripts/validate.js --all` → **`Validated 90 skill(s): 0 fail, 0 warn`**
(one skipped link entry, `cua-driver`, reported outside validation scope).

`node skills/skill-workbench/scripts/score.js skills/<name>` overall:

| Skill | Baseline | Body lines |
|---|---|---|
| `iv-review-build-and-pr` | **100** | 201 |
| `v-babysit-pr-and-merge` | **100** | 137 |
| `pipeline-triage` | **100** | 89 |

## Edge cases

- **Probe returns the upgrade refusal instead of an answer.** Classify it as its own outcome and
  fall back to the ack — never report it as zero allowance.
- **Summary-only review on a private Free repo.** Zero inline findings is the expected shape, not
  evidence of quality. Station V must route to the reuse path and say so.
- **No threads exist** (nothing to resolve). `resolve` and `approve` degrade to an explicit
  "not applicable on this repo" line, never a silent no-op.
- **Auto-title on a repo without the two `reviews.auto_title_*` keys.** Document the precondition
  rather than assuming the handover happens.

## Out of scope

`config/coderabbit/.coderabbit.yaml` content (#6), the `create-issue` plan prompt, and writing
the playbook (#5) — all closed or explicitly excluded by the issue.
