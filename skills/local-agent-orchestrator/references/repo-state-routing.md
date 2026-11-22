# Repo state, stop rules, routing

Read-only first. Nothing here changes a file.

## Checks

1. `git status --short --branch` — staged, unstaged, untracked.
2. `git log --oneline -8` and `git stash list` — recent commits and parked work.
3. `git branch --show-current`, then `git rev-list --left-right --count HEAD...@{upstream}` when an upstream exists. Also count against the base branch: `git rev-list --left-right --count HEAD...origin/<base>`. A synced upstream proves nothing when the base moved ahead.
4. `gh pr status` and `gh pr view --comments` when a PR exists. Look for a `coderabbit` review and for an `@coderabbitai review` comment from any author. Neither present means no review has run.
5. `tasks/plan.md` and `tasks/todo.md` — an incomplete checklist names the issue. Check it with `gh issue view <num>`. A merged PR means the work landed. Any other close means it did not.

Trust output only after it agrees with disk. Output-injecting hooks can interleave banners into command results and produce phantom paths. When output disagrees with disk, rerun through a plain pipe. Never declare unknown-origin dirt on a path you cannot see.

## Unknown-origin dirt — stop rule

Dirt you cannot attribute is never routed by size.

1. Can every changed file be traced to the stated task, an open issue, or merged work named in this session?
2. **Yes** — scoped. Continue to the table.
3. **No** — stop. Do not route, stash, discard, commit, or branch away from it. Report the foreign paths and ask whose work it is.
4. **Mixed** — treat the whole tree as unknown-origin. Ask.
5. **Dirt that appears mid-session** means another writer is active right now. Treat it as unknown-origin even when the content traces to a real issue, because the writer may be mid-edit. Offer an isolated worktree.

Only a human can attribute foreign dirt.

### Attribution method

1. `git diff --stat <base>...HEAD` — what the branch itself carries. Files in both that diff and the uncommitted diff belong to the branch's issue.
2. Read the issue header in `tasks/plan.md` or `tasks/todo.md` — it names the attribution target.
3. Read files that match neither. A handoff doc or new script often names its origin in the first lines.
4. What remains is unknown-origin. `stat -c '%y' <file>` against the clock confirms a live writer.

## Deletions made by the operator

A `D` line is scoped dirt, but the staleness claim is unverified. Deleted files are often fixtures that look dead to a source grep. Grep the test tree, `scripts/`, and docs prose for every deleted basename. Run the tests that referenced a deleted path. Restore only the load-bearing files, then rerun green. Full procedure: `deletion-audit.md`.

## Branch-off gate

"Branch off" or "pick an issue" does not clear the current branch. An unpushed feature branch is row 2 work that the new branch would abandon. Report it first. Never `git checkout -b` from a dirty tree. Route both streams in one report, then start on a clean base.

## Routing table

Pick exactly one row. First match wins. PR rows (3–6) apply only when the PR head is this branch — compare `headRefName` with `git branch --show-current`. An open PR on another branch is context, not a blocker.

| # | State | Next |
| --- | --- | --- |
| 1 | Clean, on base, synced, no open PR, small clear task | Do it here (Step 2), then commit/push/PR |
| 2 | Clean, on feature branch, commits unpushed, no PR | `iv-review-build-and-pr` — or `iiib-iterate-after-build` when the operator just reported corrections |
| 3 | Open PR, no `coderabbit` review, no trigger from any author | With approval, post `@coderabbitai review` (Station IV wording, never reworded), carry the reply into `v-babysit-pr-and-merge` |
| 4 | Open PR with change requests or failing checks | `v-babysit-pr-and-merge` |
| 5 | Open PR green, no change requests, reviews pending | `v-babysit-pr-and-merge` |
| 6 | Open PR approved and green | `v-babysit-pr-and-merge` for the merge |
| 7 | Branch merged, leftover branch or worktree | `vi-close-pipeline` |
| 8 | Incomplete `tasks/plan.md`, issue open | `iii-build-plan` |
| 9 | Incomplete `tasks/plan.md`, issue closed | `vi-close-pipeline` |
| 10 | Dirty, scoped small task, no PR | `iii-build-plan` |
| 11 | Dirty, scoped but unclear or large | `ii-plan-issue` |
| 12 | New idea, no code | `create-issue`, then `i-pick-issue` |
| 13 | Merged, operator wants a visual summary | `present-pr` |
| 14 | Ad-hoc, not issue work | `using-agent-skills` |

A trigger already posted by anyone is spent. Do not post a second one — it burns quota and churns the review.

## Safety

1. Guide by default. Stop before push, merge, discard, or reset that the operator did not ask for.
2. Ask before any destructive step.
3. Never invent PR state or check results.
4. When two rows fit, say so in one sentence and take the smaller safer step.
