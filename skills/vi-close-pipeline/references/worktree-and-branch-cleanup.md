# Worktree, branch and checkout cleanup after a merge

A merged PR is remote-only. Nothing on disk is deleted by `gh pr merge` — the worktree, the local
branch and any staged-but-never-committed file inside that worktree survive. This file is the
recipe for clearing that residue without destroying anyone else's work.

## 1. Sync the base branch without a dirty-tree dead end

```bash
git fetch origin --prune
git merge --ff-only origin/main      # prefer this over `git pull`
```

`git pull --ff-only` fails with *"cannot pull with rebase: You have unstaged changes"* when
`pull.rebase` is configured and any tracked file is dirty — even a runtime artifact the incoming
commits never touch. `git merge --ff-only` performs the same fast-forward and only objects to a
dirty path when an incoming commit actually modifies it. Stop on a genuine non-fast-forward;
never fall back to a real merge on the base branch.

A dirty tracked runtime artifact (demo db, telemetry, logs) is **foreign dirt**: do not commit it,
do not revert it, name it in the report.

## 2. Verify a worktree before removing it

```bash
git worktree list
git -C "<path>" status --porcelain
```

Empty output is the only green light. If it is not empty, classify before acting:

| Residue | Action |
|---|---|
| Uncommitted presentation/showcase (permanent knowledge) | Rescue the bytes, then remove; report that it is not on the base branch |
| Live source edits for a different issue | Leave the worktree alone — another actor owns it |
| Anything you cannot classify | Leave it; report it |

**Rescue before removal, losslessly.** Copy the file to a durable path outside the repo
(`~/.hermes/rescued-artifacts/<name>` — the scratch dir is pruned) and confirm with `md5sum`
source-vs-copy before the worktree goes. A byte-identical copy converts an irreversible delete into
a reversible one; say in the report that the file still needs committing to its legal home.

## 3. Removal can fail on the last step — and that is usually fine

```bash
git worktree remove --force "<path>"
```

`error: failed to delete '<path>': Permission denied` means git already emptied and **deregistered**
the worktree but could not unlink the directory itself, because a running process (OpenCode,
Freebuff, an IDE, a terminal) holds it as its current working directory. Consequences:

- `git worktree list` is already clean — the registry entry is gone. Verify, do not assume.
- The leftover **empty** directory needs `rmdir` later; it returns `Device or resource busy` while
the holder runs.
- Do **not** kill the user's running application to reclaim an empty directory. Report the path and
  the holding app; it clears when they close it.
- Never `rm -rf` a worktree directory — that leaves a stale registration under `.git/worktrees/`.
  Removal order is always `git worktree remove` first, then `rmdir`, then `git worktree prune -v`.

## 4. Worktrees and branches can appear mid-session

A concurrent agent session or desktop harness can register a new worktree while the sweep is
running, so a worktree list captured at session start is not evidence. Re-run `git worktree list`
after the removals and again before the exit gate.

Before removing any worktree that was not in your own task list, prove it carries nothing:

```bash
git -C "<path>" status --porcelain
git rev-list --left-right --count main...<branch>     # left = base ahead, right = branch ahead
```

`right = 0` plus a clean status means every commit is already on the base branch — removal destroys
no work. Anything else is another actor's live state: leave it and name the owner in the report.
`freebuff/context-target-*` and `*.worktrees/<issue-slug>` are session handles, not leftovers.

## 5. Branch deletion

```bash
git branch -D <merged-branch>
git push origin --delete <merged-branch>     # often already gone: merging with branch deletion does it
```

`error: unable to delete '<branch>': remote ref does not exist` after a merged PR is the expected
success case, not a failure — the merge already deleted it. Confirm with
`git ls-remote --heads origin` instead of treating the push error as blocking.

Never delete a branch that still has a head only you cannot see the purpose of: `git branch -a` plus
`gh pr list --state open` decides. A remote head with no open PR and unmerged unique commits is an
operator decision, not a sweep target.

## 6. Deletions orphan documentation — sweep the blast radius

Before deleting a planning file or an entire directory, search for whoever documents it:

```bash
grep -rn "tasks/\|CONSTRAINTS" --include=*.md --include=*.py . --exclude-dir=.git --exclude-dir=.venv --exclude-dir=node_modules
```

A README layout entry, a module comment citing a section number, or a doc cross-link becomes a
dangling reference the moment the file goes. Fix it in the same commit when the fix is a **deletion**
(dropping the README line) — the sweep PR stays deletions-only. Leave a code comment dangling rather
than editing code in a state-hygiene job, and list it in the report.
