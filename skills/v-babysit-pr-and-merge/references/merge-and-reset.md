## Merge and Local Reset - Step 5 (CI gate + merge) and Step 5b (post-merge reset)

Stage three: GitHub CI is the merge authority, then the local checkout returns to
a clean base so the next session starts fresh.


> Part of -babysit-pr-and-merge (Station V). Loaded on demand - the station
contract in SKILL.md is the source of truth; this file holds the detail.

### Step 5 — Verify CI Checks & Merge (Single Round Conclusion)

Since this habit runs **exactly one focused review round**, once all accepted fixes are committed/pushed and all rejected/addressed threads are resolved:

1. **Verify CI Status (the merge gate):**
   GitHub CI — not local tests — is the authority for merge. It runs on GitHub's clean runners with the project's real config, catching what local runs cannot. Local test runs in this skill exist only as a pre-push self-heal (Step 4.2), never as a merge gate.
   ```bash
   gh pr checks <pr-number>
   ```
2. **Merge Decision:**
   - If CI checks are green and zero unresolved blocking comments remain: merge PR autonomously.
     ```bash
     gh pr merge <pr_number> --squash --delete-branch
     ```
   - **CI-failure triage (ECC resolvers):** if CI checks fail, deploy the matching `<stack>-build-resolver` persona from `~/.agents/agents/` (`build-error-resolver` generic; `react-build-resolver` / `go-build-resolver` / `rust-build-resolver` when the failing files touch React / Go / Rust) — minimal-diff fix, targeted tests, one fix commit, re-push, re-check CI. Persona not found on disk → apply the generic surgical-fix loop and record the skip (אין להמציא).
   - If high/critical blockers persist that cannot be auto-resolved, or CI checks still fail after resolver triage: escalate the specific unresolved issue to the operator.
3. **Return the Local Checkout to Base (Step 5b below) — always, merge or escalate.**

### Step 5b — Post-Merge Local Reset (Fresh Start on Base)

A merge on GitHub does NOT move the local checkout: the terminal keeps showing the feature branch and local `master` stays stale. Every session must end back on a clean, up-to-date base branch so the next session starts fresh. Run this after every merge (and after every escalation that abandons the PR):

1. **Record the base branch** (captured in Step 0; default to the repo default):
   ```bash
   gh repo view --json defaultBranchRef -q .defaultBranchRef.name
   ```
2. **Guard against uncommitted work — never blow away a dirty tree:**
   ```bash
   git status --porcelain
   ```
   - **Dirty tree:** these are unmerged changes that do not belong to the merged PR. Do NOT discard them. Commit-and-push them to the branch, or stash them with `git stash push -m "pre-reset <branch>"`, before proceeding. If ownership is ambiguous, escalate instead of destroying.
3. **Confirm the PR is actually merged on the remote** (required before the force-delete in step 5 — squash merges leave the local branch with commits that are NOT ancestors of base, so `git branch -d` will always refuse):
   ```bash
   gh pr view <pr-number> --json state --jq .state   # must print MERGED
   ```
4. **Switch to base and fast-forward it:**
   ```bash
   git checkout <base> && git pull --ff-only origin <base>
   ```
5. **Delete the merged local branch** (`-D` is safe here precisely because step 3 confirmed `MERGED` on the remote; the remote branch was already removed by `--delete-branch`):
   ```bash
   git branch -D <branch-name>
   git fetch --prune
   ```
6. **Verify the fresh start:**
   ```bash
   git branch --show-current   # -> <base>
   git status                   # -> clean, up to date with origin/<base>
   ```
   Output note: `Local reset: on <base>, clean, merged branch <branch-name> deleted.`

**Failure handling:** if `git pull --ff-only` fails (diverged local base), or the tree cannot be safely cleaned, stop and escalate — never force-reset the operator's checkout.

> **Boundary — no cleanup here:** this station ends at a fast-forwarded base branch. All workspace sweeping, per-issue artifact pruning, and dead-code handling belong exclusively to Station VI (`vi-close-pipeline`) — never delete leftover files as part of the merge.


