Branch: i26/give-the-clean-exit-gate-an-explicit-owner-for-mer | Issue: #26

# Plan — Issue #26: Give the Clean Exit Gate an explicit owner for merged remote branches

> Reconciliation note: this file previously held the completed Issue #24 plan (all tasks `[x]`,
> merged as PR #25). Issue #24 is closed and its work landed, so the plan is replaced. The full
> #24 plan remains in git history at `tasks/plan.md` on `main`.

## Stack & tier

- Stack: Markdown playbook + one new bash test script. No runtime, no code generation, no
  dependency. Verification is `bash` + `grep` + `node skills/skill-workbench/scripts/validate.js`.
- Tier: **Standard** — 4 skill documents plus a new test, and one real decision: who owns the
  remote delete, and what "clean" means when the delete is impossible.
- Task type: **Docs** (primary) + **Code** (the executable test the issue's first AC demands).
- Tier check: not Tiny, so the `quick-fix` 7-box gate does not apply. Issue #26 carries no
  `quick-fix` label; nothing to remove.

## CodeRabbit plan intake

Issue #26 has **0 comments** — no `@coderabbitai plan` exists, so there was nothing to adopt,
reject, or mark `[UNVERIFIED]`. Every seam below was read at plan time, including all five
line references the issue cites; all five were accurate.

## Open questions — resolved from evidence (no operator ask needed)

1. *Why does `gh pr merge --delete-branch` leave the remote branch?* → **Resolved enough to act.**
   `gh auth status` shows the token carries the `repo` scope, so this is **not** the
   permissions / app-installation problem the issue worried about, and the explicit push is not
   doomed to fail the same way. `gh repo view --json deleteBranchOnMerge` returns **`false`** for
   this repository — the server-side auto-delete is off, which is the observable condition under
   which `--delete-branch` leaves the head branch behind. The issue's default assumption is adopted:
   the explicit `git push origin --delete` is the working mechanism (it succeeded on #23 and #25),
   and `--delete-branch` is recorded as **best-effort**. `[UNVERIFIED]`: the precise internal gh
   code path that swallows the failure was not traced; it does not affect the fix, which removes
   the dependency on that path entirely.
2. *Should the gate block closeout or just report?* → **Block**, and it costs no new policy.
   Station VI already carries a "Blocked / Incomplete — a real outcome, not a failure to hide"
   section whose instruction is "never round it up to 'closed'", and whose blocking list already
   includes "Residual branches, worktrees, or stashes tied to this issue". The fix **names the
   remote branch** in that existing list and names the manual step the operator must run. Resolved
   from the skill's own text; no operator ask.
3. *Does `README.md:25` need the same wording fix?* → **No — the issue's hypothesis here is wrong,
   recorded as a finding.** `README.md:25` is a routing row about stale `tasks/plan.md` files and
   never mentions branches or `--delete-branch`. The line that *does* mirror the defective claim is
   `README.md:40` ("no dead branches") — handled in T4.

## Dependency graph

- **T1** (gate check 5) — independent.
- **T2** (Station V step 5b) — independent of T1; both must exist for the test to assert the
  end-to-end ownership claim.
- **T3** (Station V station-contract line) — independent; must not contradict T2.
- **T4** (`vi-close-pipeline/README.md` mirror) — independent; must not contradict T1.
- **T5** (the test + gates) — depends on **T1, T2, T3, T4**: it binds to the exact prose they
  write, so it is written last.

Risk-first: the wording tasks are low-risk text, but **T2 carries the ordering rule** (remote delete
after the `MERGED` confirmation, after the local `-D`), which is the one thing a later reader could
"tidy" away. It therefore runs first, and T5 asserts that ordering by line number so the rule
cannot silently regress.

---

### T1 [x] [S] [Docs] — Rewrite gate check 5 so it observes the server and can fail

- **Target:** `skills/vi-close-pipeline/SKILL.md:117` (check 5), plus the blocking-items list in
  "Blocked / Incomplete"
- **Build:** replace the `git fetch --prune` clause with a check that reads server state —
  `git ls-remote --heads origin` filtered against the base branch — and state plainly that a
  surviving merged branch **fails** the gate. Name the cause in one line so the next reader does not
  repeat it: `fetch --prune` prunes *remote-tracking refs*, and `git branch` without `-a` is local.
  Keep the local half of the original check (`git branch` -> no leftover merged feature branches).
  Add "a merged branch still present on the remote" to the existing blocking-items list, naming the
  manual step `git push origin --delete <branch>`.
- **Helper:** `documentation-and-adrs`
- **Depends on:** —
- **Verify:** `grep -q 'ls-remote --heads' skills/vi-close-pipeline/SKILL.md`; `grep -q 'push origin --delete' skills/vi-close-pipeline/SKILL.md`; the other six gate checks byte-identical.

### T2 [x] [M] [Docs] — Give Station V step 5b the explicit remote delete

- **Target:** `skills/v-babysit-pr-and-merge/references/merge-and-reset.md:22` and `:61-64`
- **Build:** keep `--delete-branch` on the merge command but annotate it as **best-effort**, not the
  mechanism that removes the remote branch (this repository's `deleteBranchOnMerge` is `false`).
  In step 5b, insert the remote delete strictly **after** the existing `MERGED` confirmation and
  **after** the local `-D`: `git push origin --delete <branch-name>`. Report the outcome as one of
  `deleted` / `already gone` / `declined` — never silence. Keep the existing "already removed by
  `--delete-branch`" rationale replaced by the accurate one, and keep `git fetch --prune` as the
  trailing ref cleanup (that part is correct for its purpose).
- **Helper:** `documentation-and-adrs`
- **Depends on:** —
- **Verify:** `grep -q 'git push origin --delete' skills/v-babysit-pr-and-merge/references/merge-and-reset.md`; line-number assertion that `MERGED` confirmation < `git branch -D` < `git push origin --delete` (asserted by T5); `grep -q 'already removed by' …` now fails.

### T3 [x] [XS] [Docs] — Fix the Station V station contract (adopted proposal)

- **Target:** `skills/v-babysit-pr-and-merge/SKILL.md:113`
- **Build:** the post-merge reset line must mention the remote delete too. This file is what
  `merge-and-reset.md:6` calls "the source of truth", so leaving it saying only `-D` +
  `git fetch --prune` keeps the defect alive in the contract.
- **Helper:** `documentation-and-adrs`
- **Depends on:** — (must not contradict T2)
- **Verify:** `grep -q 'push origin --delete' skills/v-babysit-pr-and-merge/SKILL.md`; score for `v-babysit-pr-and-merge` does not drop.

### T4 [x] [XS] [Docs] — Fix the README mirror of check 5

- **Target:** `skills/vi-close-pipeline/README.md:40`
- **Build:** "no dead branches" must become "no merged branch left on the remote" so the summary
  does not restate the unprovable claim. **Do not touch `:25`** — that routing row is about stale
  plan files and is already correct (see open question 3).
- **Helper:** `documentation-and-adrs`
- **Depends on:** — (must not contradict T1)
- **Verify:** `grep -q 'no dead branches' skills/vi-close-pipeline/README.md` fails; `README.md:25` row byte-identical.

### T5 [x] [M] [Code/Docs] — Executable proof that the gate can fail, then the gates

- **Targets:** new `scripts/remote-branch-ownership-test.sh`; then the full verification set
- **Build:** follow the `scripts/lane-precondition-test.sh` precedent — bash + grep only, exit 0 on
  success, exit 2 when a **tripwire** cannot read the rule it claims to test (that is rule drift,
  not a pass). Three scenarios:
  - **A — the verdict function actually fails.** Feed fixture `ls-remote` listings to a transcribed
    `verdict()`: a listing containing a merged feature branch beside the base branch must return
    FAIL; a listing with only the base branch must return PASS. Without this the test proves only
    that a string exists, which is the class of bug this issue exists to kill.
  - **B — ordering holds.** In `merge-and-reset.md`, the line number of the `MERGED` confirmation
    must be **less than** `git branch -D`, which must be **less than** `git push origin --delete`.
  - **C — no file claims `--delete-branch` removes the remote branch.** Tripwire greps across
    `skills/**` (excluding `evals/snapshots/**`) fail on that phrasing.
- **Helper:** `test-driven-development`
- **Depends on:** T1, T2, T3, T4
- **Verify:**

  ```bash
  bash scripts/remote-branch-ownership-test.sh                     # exit 0, prints BRANCH-OWNERSHIP-OK
  node skills/skill-workbench/scripts/validate.js --all            # 0 fail, 0 warn
  # Station gate — runs the test and requires BOTH counts. The issue's own
  # command below is kept verbatim for traceability; on its own it would print
  # BRANCH-OWNED without ever running the ownership test.
  bash scripts/remote-branch-ownership-test.sh \
    && node skills/skill-workbench/scripts/validate.js --all | grep -q '0 fail, 0 warn' \
    && echo BRANCH-OWNED
  # The issue's AC command, verbatim:
  #   grep -q 'ls-remote --heads' skills/vi-close-pipeline/SKILL.md \
  #     && grep -q 'git push origin --delete' skills/v-babysit-pr-and-merge/references/merge-and-reset.md \
  #     && node skills/skill-workbench/scripts/validate.js --all | grep -q '0 fail' \
  #     && echo BRANCH-OWNED
  git diff --name-only                                             # only the in-scope files
  ```

**Checkpoint A** — after T1+T2: check 5 names a server-observing command, step 5b names the remote
delete, and the ordering is visibly correct on the page.
**Checkpoint B** — after T5: `BRANCH-OWNERSHIP-OK` and `BRANCH-OWNED` both print, validator clean,
and the diff touches only the four in-scope documents plus the new test.

**Build notes (Station III, recorded so Station IV does not re-derive them)**

- **A defect was introduced and fixed during T4:** a bare backticked `` `ls-remote` `` in check 5
  tripped `phantom-skill-refs` (backticked kebab tokens are parsed as skill names) and dropped
  `vi-close-pipeline` to **88/100**. Fixed in the prose, not in the checker — reworded to "that
  output". Both scores are back to **100/100**. Any future edit to these files must re-run
  `score.js`, not just `validate.js`.
- **The test was mutation-tested, not just run green.** Three deliberate breakages were each
  caught: (M1) removing every `git ls-remote --heads origin` from the gate -> exit **2** (rule
  drift); (M2) moving the remote delete before the `MERGED` guard -> exit **1**, `ordering wrong`;
  (M3) removing the "fails this check" clause -> exit **2**. A first M1 attempt that only rewrote one
  of two occurrences passed, and that was a **flawed mutation, not a weak test** — the clause also
  lives in the blocking-items list.
- Executed gate results: test `exit 0` / `6 passed, 0 failed`; `validate.js --all` `0 fail, 0 warn`
  (91 skills); issue AC command prints `BRANCH-OWNED` (pipeline `exit 0`); both scores 100/100.

## Improvement proposal (adopted by default — edge-case hardening)

**Evidence, verbatim** — `skills/v-babysit-pr-and-merge/SKILL.md:113`:

> **Post-merge local reset is mandatory:** After every merge (or abandoned-PR escalation), return the checkout to base: confirm `MERGED` via `gh pr view`, switch to base, `git pull --ff-only`, force-delete the local branch (`-D` only after remote confirms `MERGED` — squash merges are never `-d`-deletable), and `git fetch --prune`.

and `skills/v-babysit-pr-and-merge/references/merge-and-reset.md:6`:

> Part of v-babysit-pr-and-merge (Station V). Loaded on demand - the station contract in SKILL.md is the source of truth; this file holds the detail.

The reference file names `SKILL.md` as the source of truth, and that source of truth prescribes a
**local** delete only. Fixing only `merge-and-reset.md` would leave the defect in the contract every
agent reads first — the same "check that cannot fail" in a different costume. Adopted as T3.

## Sub-issues to the tracker — skipped, with reason

Step 6.6 asks for one sub-issue per task with native `blocked-by` edges on Standard work. **Not
done here, deliberately.** Those operations exist for a *map* issue whose children are separate
research/prototype tickets (`wayfinder:*` labels, per
`skills/create-issue/references/wayfinding-operations.md`). Issue #26 is not a map: all five tasks
are text edits inside a single PR against four files, and five tracker issues would duplicate #26
rather than survive it. If the operator wants the tracker to mirror the plan, say so and it is one
`gh api` sequence — the task list here is already in dependency order.

## Rejected proposals

- **Editing `evals/snapshots/v0-SKILL.md:106`, which carries the same defective check 5.** —
  rejected: it is a frozen past version; `validate.js` and `pipeline-closure.js` both skip
  `snapshots/` precisely so historical copies are never mistaken for live rules.
- **Flipping the repo setting `deleteBranchOnMerge` to `true`.** — rejected: the issue lists git
  hosting configuration as out of scope, and the pipeline must not depend on a setting the operator
  may change. The explicit delete works without it.
- **Making check 5 delete the stray branch itself.** — rejected: Station VI's boundary states it
  "ends at a fast-forwarded base branch" and that sweeping belongs to its own documented sweep
  step; a gate that silently mutates the remote is worse than one that reports. The gate observes
  and blocks; Station V deletes.
- **Replacing the prose checks with a script call inside the skill.** — rejected: the skills are
  Markdown read by agents, not executables. The script is the *proof*, the prose is the
  instruction — which is exactly the split `lane-precondition-test.sh` already uses.