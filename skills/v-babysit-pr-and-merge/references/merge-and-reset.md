## Merge and Local Reset - Step 5 (CI gate + merge) and Step 5b (post-merge reset)

Stage three: GitHub CI is the merge authority, then the local checkout returns to
a clean base so the next session starts fresh.


> Part of v-babysit-pr-and-merge (Station V). Loaded on demand - the station
contract in SKILL.md is the source of truth; this file holds the detail.

### Step 5 — Verify CI Checks & Merge (Single Round Conclusion)

Since this habit runs **exactly one focused review round**, once all accepted fixes are committed/pushed and all rejected/addressed threads are resolved:

1. **Verify CI Status (the merge gate):**
   GitHub CI — not local tests — is the authority for merge. It runs on GitHub's clean runners with the project's real config, catching what local runs cannot. Local test runs in this skill exist only as a pre-push self-heal (Step 4.2), never as a merge gate.
   ```bash
   gh pr checks <pr-number>
   ```
1.5. **Check the stack before merging — a branch can carry another change's work.** A branch cut from a feature branch instead of from base drags that branch's commits (and any already-merged ones) into the diff, so the merge lands unrelated work on base. Detect it; never assume the diff is only yours:
   ```bash
   git fetch origin
   git cherry -v origin/main HEAD        # '+' = not upstream, '-' = already landed
   git log --oneline origin/main..HEAD   # what this PR will actually add
   ```
   Every `+` commit must belong to this change. When one does not, replay only yours onto current base and drop the rest (`git rebase --onto origin/main <last-foreign-commit> <branch>`). Verify the foreign work still exists on its own branch (`git branch -a --list`) before dropping it, and never delete a branch you did not create. Then confirm the file list is exactly this change's before committing.

   **`git reset --soft` does not touch the index.** After `reset --soft <base>` the index still holds the old tree, so `git diff --cached` reports *index-vs-base*: your uncommitted work may not be staged at all, and a base chosen several commits back silently stages every intervening commit. Read `git diff --cached --name-status` and confirm the file list is exactly this change's — `git add -A` only after that check.
2. **Merge Decision:**
   - If CI checks are green and zero unresolved blocking comments remain: merge PR autonomously.
   - **`mergeState=BLOCKED` right after merging the base branch is usually pending CI, not a policy veto.** Merging base into the feature branch (Step 4) re-runs CI on the new merge commit, so the required checks flip back to `pending` and `gh pr merge` reports "the base branch policy prohibits the merge" while `mergeable=MERGEABLE` / `mergeState=BLOCKED`. That is a CI re-run in flight, not a protection rule — read `gh pr checks`, confirm the required shards are *pending* (not failing), and wait for green. Reserve `--admin` only for the stuck CodeRabbit check (per the timeout-merge rule) — never for failing project CI checks or for checks that are merely still running; failed checks must stay blocking.
   - **A fully-resolved review can still block: `reviewDecision=CHANGES_REQUESTED` is the review's VERDICT, not its threads.** Replying to and resolving every thread does not clear it — GitHub holds the review-level state until it is dismissed or superseded, so `gh pr merge` refuses with "the base branch policy prohibits the merge" while every thread is closed and CI is green. Diagnose with `gh pr view <pr> --json mergeable,mergeStateStatus,reviewDecision`: `mergeable=MERGEABLE` + `mergeStateStatus=BLOCKED` + `reviewDecision=CHANGES_REQUESTED` is this case, not pending CI. **Post `@coderabbitai resolve` as the first remedy** and allow ~2-3 minutes for it to flip `mergeStateStatus` `BLOCKED` → `CLEAN` on its own: the bot withdraws the verdict once the review loop is closed, and this needs no review id. Only fall back to the manual dismissal API when resolve is declined or stays silent — it needs the `<review_id>` you would otherwise never have to look up. Either way the dismissal carries a written rationale — never re-trigger a second review to clear it (the one-round rule), and never `--admin` past a verdict you have not justified in writing.
     ```bash
     gh api -X PUT repos/:owner/:repo/pulls/<pr>/reviews/<review_id>/dismissals \
       -f message="<why the verdict no longer applies: what was fixed, where, and that the round is complete>" \
       -f event=DISMISS
     gh pr view <pr> --json mergeStateStatus,reviewDecision   # -> CLEAN, empty
     ```
     `--delete-branch` is **best-effort, not the mechanism** — this repository has
     `deleteBranchOnMerge` set to `false`, so a merged head branch regularly survives on the
     server. The authoritative remote delete is step 5b.
     ```bash
     gh pr merge <pr_number> --squash --delete-branch
     ```
- **Close the review loop with `@coderabbitai resolve` first (immediately before the squash merge, once fixes are applied and verified).** It is a new top-level PR comment — not a thread reply:
     ```bash
     gh pr comment <pr_number> --body "@coderabbitai resolve"
     ```
     Report the outcome honestly: **resolved** / **declined** / **no reply**. When there are no CodeRabbit threads to resolve (e.g. a summary-only review on a private Free repo, which produces none), record an explicit "not applicable on this repo" line — never a silent no-op. `@coderabbitai approve` is **not** used here: without `reviews.request_changes_workflow` it submits no approval, so state that explicitly instead of implying the PR was approved.
   - **CI-failure triage (build resolvers):** if CI checks fail, deploy the matching `<stack>-build-resolver` persona from `~/.agents/agents/` (`build-error-resolver` generic; `react-build-resolver` / `go-build-resolver` / `rust-build-resolver` when the failing files touch React / Go / Rust) — minimal-diff fix, targeted tests, one fix commit, re-push, re-check CI. Persona not found on disk → apply the generic surgical-fix loop and record the skip (do not invent).
   - If high/critical blockers persist that cannot be auto-resolved, or CI checks still fail after resolver triage: escalate the specific unresolved issue to the operator.
3. **Close the Issue (Step 5a — immediately after merge):**
   After a successful merge, verify the linked issue is closed. If `Closes #<id>` was in the PR body, GitHub already closed it — just confirm. If it's still open (missing `Closes`), close it now:
   ```bash
   gh issue view <id> --json state --jq .state   # expect CLOSED
   # If OPEN:
   gh issue close <id> --comment "Closed via PR #<pr_number> (merged)."
   ```
3.5. **After a merge that resolved a conflict, re-grep for what an earlier refactor deleted.** A PR based on pre-refactor code reintroduces deleted machinery when the conflict is resolved by accepting its side, and the review round cannot see it — those lines look like the refactor's own. Before closing the issue, confirm the demolition survived:
   ```bash
   git fetch origin
   git grep -n "<symbols the earlier refactor deleted>" origin/main -- <touched dirs>
   ```
   Any hit is a regression: open a follow-up and say so, rather than reporting the merge clean.
4. **Return the Local Checkout to Base (Step 5b below) — always, merge or escalate.**

### Step 5b — Post-Merge Local Reset (Fresh Start on Base)

A merge on GitHub does NOT move the local checkout: the terminal keeps showing the feature branch, the merged branch's worktree directory stays on disk, and local `master` stays stale. Every session must end on a clean, up-to-date base with the merged branch erased — ref, remote ref and hosting worktree — so the next session starts fresh. Run this after every merge (and after every escalation that abandons the PR):

1. **Record the base branch** (captured in Step 0; default to the repo default):
   ```bash
   gh repo view --json defaultBranchRef -q .defaultBranchRef.name
   ```
2. **Guard against uncommitted work — never blow away a dirty tree:**
   ```bash
   git status --porcelain
   ```
   - **Dirty tree:** these are unmerged changes that do not belong to the merged PR. Do NOT discard them. Commit-and-push them to the branch, or stash them with `git stash push -m "pre-reset <branch>"`, before proceeding. If ownership is ambiguous, escalate instead of destroying.
3. **Confirm the PR is actually merged on the remote** (required before any branch deletion in step 5 — squash merges leave the local branch with commits that are NOT ancestors of base, so `git branch -d` refuses and `-D` is the licensed fallback):
   ```bash
   gh pr view <pr-number> --json state --jq .state   # must print MERGED
   ```
4. **Get off the merged branch — the base branch may be held by another worktree.**
   ```bash
   git fetch origin
   git worktree list --porcelain      # who holds refs/heads/<base>?
   ```
   - **Base free:** `git switch <base> && git pull --ff-only origin <base>`.
   - **Base held by the primary worktree** (the common linked-worktree case): `git switch --detach origin/<base>`. The other session owns that checkout, so never `git switch <base>` and never force it — a detached HEAD at `origin/<base>` is the same clean, synced code at the merge SHA without moving a branch someone else is on. `git rev-parse HEAD` must equal `git rev-parse origin/<base>`; disclose the deviation in the report.
   - **This worktree is about to be removed (step 6):** detaching is enough — do not fast-forward a checkout you are deleting, and do not trust files in it after this point.
   - **If the worktree is the live agent workspace and must survive the run:** end on a detached HEAD at `origin/<base>` with a clean tree and say so explicitly — a commit made from a detached HEAD lands on no branch, so the next piece of work needs its own `feat/` / `fix/` branch first.
5. **Delete the merged local branch — prove it is merged, then prefer the safe delete.**
   ```bash
   git merge-base --is-ancestor <branch-name> origin/<base>; echo "ancestor=$?"   # 0 = fully merged
   git log --oneline origin/<base>..<branch-name>                                  # must be empty
   git branch -d <branch-name>       # refuses unless the tip is reachable from base
   ```
   `-d` is the honest test: it succeeds exactly when the branch's work is fully contained in base. Step 3's remote `MERGED` is what licenses the fallback `git branch -D <branch-name>`, and only when the ancestry proof above fails *because of the merge method* — `--squash` / `--rebase` replay commits, so their tips are never ancestors even though the content landed. A non-empty `origin/<base>..<branch-name>` log under a plain `--merge` means the branch carries unmerged work: stop and escalate, never `-D` it. The remote branch is **not** assumed gone here — `--delete-branch` is best-effort (step 7).
6. **Tear down the worktree that hosted the merged branch — the directory is part of the reset.** A merged branch left checked out in a worktree keeps the directory, the branch ref and the operator's "still in progress" reading of the repo alive; a clean end state means the worktree directory is gone, not detached-and-forgotten.
   ```bash
   git worktree list --porcelain                         # path + branch of every checkout
   cd <primary-worktree>                                 # never from inside the one being removed
   git -C <worktree-path> status --porcelain             # must be empty before --force
   git worktree remove --force <worktree-path>
   git worktree prune
   git worktree list                                     # removed entry is gone
   test ! -d <worktree-path> && echo "worktree directory deleted"
   ```
   - **Never run `worktree remove` from inside the worktree it deletes** — the shell's CWD disappears mid-command. Re-enter the primary clone first and address the path explicitly.
   - **Guard the tree before `--force`:** `git -C <worktree-path> status --porcelain` must be empty (step 2 already committed or stashed real work). `--force` legitimately discards only ignored runtime artefacts (`logs/`, `runtime/`, `target/`); anything tracked-and-modified must be committed or stashed first.
   - **Only remove a worktree this session owns** — the one created for the merged branch, this run's own agent workspace, or a scratch/verify worktree under `.worktrees/`. A directory another live session is working in is not yours: leave it and report it as handed to Station VI.
   - **The run's own live workspace is removable — but only as the final action.** If the agent is executing *inside* the worktree being torn down, `cd <primary>` in a fresh shell and run the removal there; nothing may touch that directory afterwards (no later tool call, no log or file read). If the host pins the session to that path, deleting it breaks your own run: print the exact one-liner (`git -C <primary> worktree remove --force <path>`) and hand it to Station VI / the operator, and say the directory is still on disk. This is the one case where "worktree removed" is reported as pending rather than done.
   - **Never remove the primary worktree**, even with `--force`: it is the operator's main clone.
   - `git worktree remove` deletes the directory, never the branch ref — if the branch survives, delete it with step 5's guarded `-d` / `-D`.

7. **Delete the merged branch on the remote** (authoritative; runs only after step 3 proved `MERGED` and step 5 removed the local branch, never remote-first — a squash merge would otherwise strand commits with no ref):
   ```bash
   git push origin --delete <branch-name>
   ```
   Report the outcome honestly, one of: **deleted** (the push removed it) / **already gone** (the
   remote never had it, `--delete-branch` removed it, **or the push failed because the remote ref
   no longer exists** — e.g. another actor deleted it first; a missing-ref failure is *not* a
   refusal) / **declined** (the push was refused for any other reason, e.g. branch protection or
   missing scope) — never a silent no-op. On **declined**, name the exact command for the operator
   to run by hand and hand the item to Station VI, whose check 5 will fail on the surviving branch.
8. **Sweep every other local branch whose upstream is gone.** The merge usually leaves the repo holding branches that point at deleted remote refs; the operator's branch list should read as live work only.
   ```bash
   git for-each-ref --format='%(refname:short)|%(upstream:short)|%(upstream:track)' refs/heads
   ```
   Filter on `[gone]`. A branch with an **empty** `upstream=` field is not stale — it never had a remote to lose, so it is not yours to delete. For each `[gone]` branch, prove it merged (`git merge-base --is-ancestor <b> origin/<base>` exits 0 and `git log --oneline origin/<base>..<b>` is empty), then `git branch -d <b>`. An unmerged `[gone]` branch is somebody's unpushed work: leave it and report it by name. Never touch `<base>` or a branch checked out in another worktree — `git branch -d` refuses the latter, and `-D` past that refusal destroys a live session's checkout.

9. **Prune stale remote-tracking refs** (this is what `git fetch --prune` is for — local refs only, never the server):
   ```bash
   git fetch --prune
   ```
10. **Verify the fresh start — every one of these, never a subset:**
   ```bash
   git -C <primary-worktree> branch --show-current      # -> <base>, or detached at origin/<base>
   git -C <primary-worktree> rev-parse HEAD origin/<base>   # -> same SHA (base really has the merge)
   git -C <primary-worktree> status --porcelain         # -> empty
   git branch -vv                                       # -> no [gone] entries remain
   git worktree list                                    # -> only worktrees that should still exist
   git status --porcelain                               # -> clean
   # The just-merged branch must be gone from the remote. Do NOT require the
   # remote to hold only the base branch — an unrelated active head would be
   # reported here as a failure and strand the session on a healthy repo.
   git ls-remote --heads origin | awk -v ref='refs/heads/<branch-name>' '$2 == ref'   # -> empty
   ```
   Output note: fold into the condensed 1–2 line merge summary (`#<id> Closed | #<n> Merged (<sha>) | branch: <base> | clean | synced | worktree removed`) — never a per-command git-ops block. One row is enough for the whole reset: merged SHA, branch gone on both sides, worktree directory deleted, base synced.

**Failure handling:** if `git pull --ff-only` fails (diverged local base), or the tree cannot be safely cleaned, stop and escalate — never force-reset the operator's checkout.

> **Boundary — branch and worktree hygiene yes, file sweeping no:** this station owns the git state it created — the merged branch (local + remote), the worktree directory that hosted it, gone-upstream refs, and a fast-forwarded base. Workspace sweeping of per-issue plans, scratch files and stashes, plus dead-code handling, belongs exclusively to Station VI (`vi-close-pipeline`) — never delete leftover files as part of the merge.


