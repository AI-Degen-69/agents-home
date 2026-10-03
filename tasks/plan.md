Branch: i7/hand-pr-titles-the-review-allowance-and-resolve-to | Issue: #7

# Plan — Issue #7: Hand PR titles, the review allowance and resolve to CodeRabbit

> Reconciliation note: this file previously held the completed Issue #18 plan (all tasks `[x]`,
> issue closed, work merged). Issue #18 is closed and its work landed, so the plan is replaced.
> The full #18 plan remains in git history at `tasks/plan.md` on `main`.

> Structure note: an earlier revision of this file was corrupted by mid-file inserts — the T3
> section and the "Open questions" list were split apart and their tails left orphaned. Rebuilt in
> reading order on 2026-10-03 during Station V triage (CodeRabbit finding 4174519800).

## Stack & tier

- Stack: Markdown skill contracts only. No app runtime, no code, no new dependency. Verification
  surface is `node skills/skill-workbench/scripts/validate.js` + `score.js` + the issue's own
  `grep` acceptance command.
- Tier: **Standard** — 4 skills / 5 files, one architectural decision (the four-outcome ack
  classification that both Station IV and Station V depend on).
- Task type: **Docs** (primary — station contracts) + **UX / Copy** (the report wording that
  carries honest CodeRabbit status).

## CodeRabbit plan intake

`@coderabbitai plan` was posted on this issue and **refused** — the account is on the Free plan
("The author of this PR is on the CodeRabbit Free Plan… upgrade to CodeRabbit Essentials").
There is no CodeRabbit plan comment to mine.

- **Adopted:** nothing from CodeRabbit — no plan was produced.
- **Rejected:** n/a.
- **`[UNVERIFIED]`:** none outstanding. Every seam below was read from the live repo at plan time.

The substantive planning input was instead the operator's own three corrections in the issue
comments, each verified against `config/coderabbit/README.md` and recorded in `SPEC.md`.

## Open questions — resolved from code (no operator ask)

1. *Free or paid tier?* → **Free with OSS access.** `config/coderabbit/README.md:84` records it
   from live behaviour: "You've used all free OSS reviews for now… Next included review available
   in 25 minutes." The issue's default assumption is confirmed.
2. *Always hand over the title?* → **Yes.** The issue states the operator asked for it by name, and
   `.coderabbit.yaml` already carries the full TAG vocabulary plus an explicit
   `auto_title_placeholder`. Both `reviews.auto_title_*` keys are live, so the precondition holds
   on this repo.
3. *Is a standalone `rate limit` probe viable?* → **No — chat-gated on Free**
   (`README.md:87,161`). The allowance signal is classified inside the trigger ack instead. The
   literal string stays in Station IV as a documented, plan-gated probe so the issue's acceptance
   grep still passes and the command is ready the day the account upgrades.
4. *Does this repo get inline findings?* → **Assumed No** (private repo on Free, summarization-only;
   `README.md:86,92`). `README.md:86` calls this "the untested path… treat that as the operating
   assumption, not a measured fact — the next PR on this repo is the measurement."
   **Measured on 2026-10-03, PR #23: the assumption was WRONG** — CodeRabbit posted 5 inline
---

### T1 [x] [S] [Docs/UX-Copy] — Hand PR title-writing to CodeRabbit

- **Target:** `skills/iv-review-build-and-pr/SKILL.md:144-150`
- **Build:** replace the hardcoded `--title "<type>(<scope>): <summary>"` with the
  `reviews.auto_title_placeholder` keyword (`@coderabbitai`), and state that the TAG vocabulary
  (`[ADD] [FIX] [IMPROVE] …` per `config/coderabbit/.coderabbit.yaml`) is the single title
  grammar. State the two-key precondition (`auto_title_placeholder` + `auto_title_instructions`)
  so the handover is not assumed on a repo that never set them. The **body** stays byte-identical.
- **Helper:** `documentation-and-adrs`, `humanizer` (report copy)
- **Depends on:** —
- **Verify:** the Conventional-Commits grammar is gone from the file;
  `grep -q 'type>(<scope>)' skills/iv-review-build-and-pr/SKILL.md` must now FAIL;
  `score.js skills/iv-review-build-and-pr` >= 100.
- **Result:** done — verified live on PR #23, where CodeRabbit replaced the title with
  `[UPDATE] Replace Issue 18 audit guidance with Issue 7 workflow requirements`.

### T2 [x] [M] [Docs/UX-Copy] — Four-outcome trigger classification + plan-gated allowance probe

- **Target:** `skills/iv-review-build-and-pr/SKILL.md:164-169, 191`
- **Build:** split the current three-outcome ack classification into four — *review started* /
  *rate limited (N minutes)* / **summary-only review (private repo on Free — no findings
  expected)** / *other reply* — plus the existing no-acknowledgement case. Add the allowance
  pre-check as a **documented, plan-gated probe**: state that `@coderabbitai rate limit` is
  chat-gated and declines on Free, that the trigger ack is the real signal on this tier, and that
  an upgrade-refusal reply is its own outcome (never "zero allowance"). Carry all four into the
  handoff line. Summary-only must say plainly that verification rests on the local gates
  (OCR delegation, type-matched reviewers, Spec axis, targeted tests).
- **Helper:** `documentation-and-adrs`, `humanizer`
- **Depends on:** —
- **Verify:** `grep -q '@coderabbitai rate limit' skills/iv-review-build-and-pr/SKILL.md` passes;
  the existing `rate-limit-classification` eval assertion (`Rate-limit reply`) still matches;
  `trigger-ack-mandatory` and `comment-links-mandatory` still match; `score.js` >= 100 and body
  <= 250 lines.

**Checkpoint A** — after T1+T2: Station IV's contract is internally consistent; report the four
statuses and the exact wording chosen.

### T3 [x] [M] [Docs/UX-Copy] — Station V: resolve before merge, config probe, no false clean pass

- **Targets:** `skills/v-babysit-pr-and-merge/references/merge-and-reset.md:19-25`,
  `.../references/review-loop.md:100-105`, `.../references/triage-and-apply.md:87-95,121`
- **Build:** three changes.
  1. **Resolve** — post `@coderabbitai resolve` as a top-level PR comment after fixes are applied
     and verified, immediately before the squash merge; report resolved / declined / no reply.
     Follow the `self-improve-loop/SKILL.md:65` precedent. When no threads exist it degrades to an
     explicit "not applicable on this repo" line, never a silent no-op. `@coderabbitai approve` is
     **not** used: without `reviews.request_changes_workflow` it submits nothing, so it degrades
     explicitly too.
  2. **Config probe** — `@coderabbitai configuration` is the first diagnostic when a review
     contradicts the committed config, with the resolved-config output quoted in the report.
     Chat-gated on Free: state the plan requirement and the fallback.
  3. **False clean pass guard** — a completed review with zero inline findings is not an approval
     when the repo is private on the Free plan (summarization-only). Classify it `SUMMARY_ONLY`,
     keep it mutually exclusive with `COMPLETED`, route it to the existing agent-fallback / reuse
     path (`triage-and-apply.md:91-95`, Station IV evidence + delta check), and say so in the
     report.
- **Helper:** `documentation-and-adrs`, `humanizer`
- **Depends on:** —
- **Verify:** `grep -q '@coderabbitai resolve' skills/v-babysit-pr-and-merge/SKILL.md` passes
  (the resolve rule must be reachable from the station contract, not only from a `references/`
  file — if the body line budget blocks this, the pointer line in `SKILL.md` must still carry the
  literal); existing V assertions (`explicit inline reply.+posted before resolution`,
  `proceed directly to Step 2 extraction & triage`,
  `gh api repos/:owner:/repo/pulls/<pr_number>/comments`) still match; `score.js` >= 100.

### T4 [x] [S] [Docs] — Triage consistency + acceptance gates

- **Targets:** `skills/pipeline-triage/SKILL.md:58` (trigger wording), then re-run the gates
- **Build:** confirm row 3's `@coderabbitai review` wording still matches Station IV's trigger
  exactly (no wording drift introduced by T1/T2), and record the plan-gated status vocabulary so
  the gate can read a Station IV handoff honestly. Then run the full verification set.
- **Helper:** `documentation-and-adrs`
- **Depends on:** T1, T2, T3
- **Verify:**

  ```bash
  ! grep -q 'type>(<scope>)' skills/iv-review-build-and-pr/SKILL.md \
    && grep -q '@coderabbitai rate limit' skills/iv-review-build-and-pr/SKILL.md \
    && grep -q '@coderabbitai resolve' skills/v-babysit-pr-and-merge/SKILL.md \
    && echo WIRING-OK
  node skills/skill-workbench/scripts/validate.js --all            # 0 fail, 0 warn
  node skills/skill-workbench/scripts/score.js skills/iv-review-build-and-pr   # >= 100
  node skills/skill-workbench/scripts/score.js skills/v-babysit-pr-and-merge  # >= 100
  node skills/skill-workbench/scripts/score.js skills/pipeline-triage         # >= 100
  ```

**Checkpoint B** — after T4: the issue's own acceptance command prints `WIRING-OK`, all three
scores hold at 100, and the validator is clean. Then hand to Station IV.

## Improvement proposal (adopted by default — simplification / edge-case hardening)

**Evidence, verbatim** — `skills/v-babysit-pr-and-merge/references/review-loop.md:101`:

> `COMPLETED` — summary review and/or inline findings posted. Proceed to Step 2.

and `config/coderabbit/README.md:92`:

> Station V's existing branch "completed with zero inline comments → clean pass" is **unsafe on a
> private Free repo**: a summary-only review reports exactly that.

The issue describes the guard as a change to "Station V's clean-pass branch", but that branch is
not one place — it is the *conjunction* of the `COMPLETED` classification above and the Step 2
extraction that finds zero comments in `triage-and-apply.md`. Guarding only one leaves the trap
open. Adopted: T3 item 3 guards the classification **and** names the reuse-path routing at the
extraction seam.

## Rejected proposals

- **Post `@coderabbitai approve` alongside `resolve`** — rejected: `README.md:36` records that it
  "submits an approval only when `reviews.request_changes_workflow` is enabled", so on this repo it
  merely resolves threads and reports approval disabled. `resolve` alone states the intent.
- **A separate pre-trigger `rate limit` command** — rejected per correction 2: chat-gated on Free,
  it spends a comment to learn nothing. Documented as plan-gated instead (T2).
- **Editing `.coderabbit.yaml`** to fix its stale `#7` pointer comment (near line 57 it still says
  the pipeline writes titles itself at `SKILL.md:137`) — **NOTICED-BUT-NOT-TOUCHING**: the file
  belongs to closed issue #6 and this issue excludes it. Recorded as an `open` row for Station VI.
  3. **False clean pass guard** — a completed review with zero inline findings is not an approval
     when the repo is private on the Free plan (summarization-only). Classify it `SUMMARY_ONLY`,
     keep it mutually exclusive with `COMPLETED`, route it to the existing agent-fallback / reuse
     path (`triage-and-apply.md:91-95`, Station IV evidence + delta check), and say so in the
     report.
- **Helper:** `documentation-and-adrs`, `humanizer`
- **Depends on:** —
- **Verify:** `grep -q '@coderabbitai resolve' skills/v-babysit-pr-and-merge/SKILL.md` passes
  (the resolve rule must be reachable from the station contract, not only from a `references/`
  file — if the body line budget blocks this, the pointer line in `SKILL.md` must still carry the
  literal); existing V assertions (`explicit inline reply.+posted before resolution`,
  `proceed directly to Step 2 extraction & triage`,
  `gh api repos/:owner:/repo/pulls/<pr_number>/comments`) still match; `score.js` >= 100.
   findings on this private repo, and its run config reported `Plan: Advanced` with
   `Configuration used: Organization UI`. The skills must therefore stay tier/visibility-agnostic
   and degrade honestly rather than assume a summary-only shape. See `README.md` for the follow-up.

## Dependency graph

- **T1** (Station IV title) is independent of T2.
- **T2** (Station IV four-outcome ack) unblocks **T4** — Station V's classification consumes the
  status Station IV hands over.
- **T3** (Station V resolve + config probe + false-clean-pass guard) is textually independent of
  T1/T2 but must agree with T2's status vocabulary.
- **T4** (triage consistency + gates) depends on T1, T2, T3.

Order is risk-first: T2 carries the most judgement (it is what prevents a false clean pass), so it
lands early while the diff is still cheap to correct.