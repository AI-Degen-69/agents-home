Branch: i24/correct-the-coderabbit-playbook-pr-23-disproved-three | Issue: #24

# Plan — Issue #24: Correct the CodeRabbit playbook after PR #23

> Reconciliation note: this file previously held the completed Issue #7 plan (all tasks `[x]`,
> merged as PR #23). Issue #7 is closed and its work landed, so the plan is replaced. The full #7
> plan remains in git history at `tasks/plan.md` on `main`.

## Stack & tier

- Stack: Markdown playbook + config comments. No runtime, no code, no new dependency.
  Verification is `grep` against the acceptance command plus `validate.js` as a regression guard.
- Tier: **Standard** — 2 files, one real decision: how to record the config-source finding
  without either overstating it (the file is useless) or understating it (the values still match).
- Task type: **Docs** (primary) + **Research** (the precedence question, resolved from artifacts).

## CodeRabbit plan intake

No `@coderabbitai plan` comment exists on this issue, and none was requested: the intake rule
skips the plan prompt for docs/comment-only changes. Independently, `@coderabbitai plan` was
observed refused on issues #5 and #7 on this account. **Adopted:** nothing from CodeRabbit.
**`[UNVERIFIED]`:** none — every seam was read at plan time.

## Open questions — resolved from evidence (no operator ask)

1. *Which tier does this repo run under?* → **Partially resolved, and the honest answer is split.**
   PR #23's run config reported `Plan: Advanced`, but `@coderabbitai plan` was refused on issues
   #5 and #7. Record both: **PR review path reports Advanced; issue-planning chat is refused.**
   Collapsing this into one claim would be a new inaccuracy.
2. *Does `.coderabbit.yaml` govern this repo?* → **No — resolved with hard evidence.**
   `Test-Path .coderabbit.yaml` → `False`; `git ls-files` lists only
   `config/coderabbit/.coderabbit.yaml`; the file's own header says CodeRabbit reads YAML only from
   the repo root or a central repo; and the resolved config annotates both `auto_title_*` keys as
   `# Source: Organization UI (base)`. `README.md:119` ranks the repository file **above**
   organization UI, so the annotation proves the file was never consulted.
3. *Should the sync-copy model be revisited?* → **Out of scope, per the issue.** The finding is
   recorded in the playbook with its consequence named; `sync-coderabbit.ps1` is untouched.

## Dependency graph

- **T1** (correct the three disproved claims) is independent.
- **T2** (config-source finding) is independent of T1 but must not contradict it.
- **T3** (`.coderabbit.yaml` comment) depends on **T2** — the replacement comment has to carry the
  "not read from this path" fact, or fixing the stale pointer alone leaves it doubly misleading.
---

### T1 [x] [S] [Docs/Research] — Replace the three disproved claims with PR #23 measurements

- **Target:** `config/coderabbit/README.md:80-92` ("Observed behaviour on this account")
- **Build:** rewrite the three false bullets against the measured record, keeping the framing that
  these are dated observations on this account:
  - `:86` "The private repo is the untested path… summarization-only" → replace with the PR #23
    result (5 inline findings across 5 files, walkthrough review, `Plan: Advanced`), and delete
    the now-false "no PR exists there yet" clause.
  - `:84` "This account is Free with OSS access" → state that the PR-review path reports
    `Plan: Advanced` while `@coderabbitai plan` is still refused on issues, so both facts stand.
  - `:87` "chat-dependent commands are refused… expect the same for `configuration`" → record that
    `@coderabbitai configuration` returned the full resolved config on PR #23.
  Leave `:85` (public-repo findings), the rate figures, and the "what spends a review" table alone.
- **Helper:** `documentation-and-adrs`
- **Depends on:** —
- **Verify:** `grep -q 'untested path' config/coderabbit/README.md` fails; `grep -q 'PR #23'`
  succeeds; every still-valid passage from `CONSTRAINTS.md` still present.

### T2 [x] [M] [Docs/Research] — Record the config-source finding and its consequence

- **Target:** `config/coderabbit/README.md` — the precedence paragraph at `:119` and a new
  subsection near the observed-behaviour block
- **Build:** state the resolved finding with its evidence chain: no root `.coderabbit.yaml`
  (`Test-Path` → `False`), the only copy is at `config/coderabbit/`, the file's own header says
  CodeRabbit reads YAML only from the repo root or a central repo, and the resolved config
  annotates `auto_title_placeholder` / `auto_title_instructions` as `Source: Organization UI (base)`.
  Because `:119` ranks the repository file above organization UI, the annotation proves the file
  was never read. Name the consequence for `sync-coderabbit.ps1` (its copy model has never applied
  to this repo) and state that the TAG vocabulary currently matches **only** because the same
  values were also entered in the Organization UI — which is exactly why this went unnoticed.
- **Helper:** `documentation-and-adrs`
- **Depends on:** —
- **Verify:** the finding, the precedence contradiction, and the sync consequence are all present;
### T3 [x] [XS] [Docs] — Fix the `.coderabbit.yaml` comment (comment lines only)

- **Target:** `config/coderabbit/.coderabbit.yaml:53-55`
- **Build:** replace "The pipeline still writes titles itself (skills/iv-review-build-and-pr/SKILL.md:137)
  — handing that over is the work of #7" with a comment that says the handover landed in #7/PR #23,
  drops the stale line reference, and carries the T2 fact that this file is not read from
  `config/coderabbit/` by CodeRabbit. **No setting, key, or value changes.**
- **Helper:** `documentation-and-adrs`
- **Depends on:** T2
- **Verify:** `git diff config/coderabbit/.coderabbit.yaml` shows only `#` comment lines changed;
  `grep -q 'is the work of #7'` fails; the two `auto_title_*` settings are byte-identical.

### T4 [x] [S] [Docs] — Note the `SUMMARY_ONLY` guard + run the gates

- **Targets:** `config/coderabbit/README.md` (the Station IV/V consequence block at `:89-92`), then
  the verification set
- **Build:** add one line recording that `SUMMARY_ONLY` is a guard for the summarization-only tier,
  **not** this repository's normal shape, so no future station assumes findings are absent here.
  Station skills are **not** edited — their wording is conditional and stays correct.
- **Helper:** `documentation-and-adrs`
- **Depends on:** T1, T2, T3
- **Verify:**

  ```bash
  ! grep -q 'untested path' config/coderabbit/README.md \
    && ! grep -q 'is the work of #7' config/coderabbit/.coderabbit.yaml \
    && grep -q 'PR #23' config/coderabbit/README.md \
    && echo FACTS-CORRECTED
  node skills/skill-workbench/scripts/validate.js --all   # 0 fail, 0 warn
  node skills/skill-workbench/scripts/score.js skills/iv-review-build-and-pr   # still 100
  git diff --name-only                                   # only the 2 in-scope files
  ```

**Checkpoint B** — after T4: `FACTS-CORRECTED` prints, validator clean, and the diff touches exactly
`config/coderabbit/README.md` and `config/coderabbit/.coderabbit.yaml`.

## Improvement proposal (adopted by default — edge-case hardening)

**Evidence, verbatim** — `config/coderabbit/README.md:86`:

> The private repo is the untested path.

and the resolved-config annotation on PR #23:

> `# Source: Organization UI (base)` / `auto_title_placeholder: '@coderabbitai'`

The playbook proves its claims against live PRs, which is why it was wrong in a checkable way.
Adopted: every rewritten claim keeps an explicit **date + PR number + artifact**, and T2 records the
evidence chain for the precedence conclusion, so the next correction can check the same way rather
than re-derive from memory.

## Rejected proposals

- **"Move `.coderabbit.yaml` to the repo root so it governs this repo."** — rejected: a settings
  relocation changes live CodeRabbit behaviour for this repo and every consumer of the sync model,
  which the issue explicitly excludes ("changing `.coderabbit.yaml` settings (comment text only)"
  and "redesigning `sync-coderabbit.ps1`"). The finding is recorded; the decision belongs to the
  operator as a follow-up.
- **Editing the station skills to drop the summary-only guard.** — rejected: the guard is
  conditional ("on a private repo on the Free plan") and remains correct as a safety net. Only the
  playbook's claim that this is the *expected shape here* was false.
- **Collapsing "Free" and "Advanced" into one tier statement.** — rejected: they describe
  different paths (PR review vs issue planning chat) and both observations are true.
  `scripts/sync-coderabbit.ps1` is unmodified (`git diff --name-only` does not list it).

**Checkpoint A** — after T1+T2: the playbook contains no claim contradicted by PR #23, and every
claim carries the artifact it came from. Report both conclusions in one line each.
- **T4** (gates + sync) depends on T1, T2, T3.

Risk-first: T2 is the task whose conclusion could still change (it is the one carrying a
conclusion, not just text), so it runs before the file edits that reference it.