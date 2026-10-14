# Recovering a closeout commit that landed on a foreign branch

Use when the Section 7 commit + push hit a checkout another actor owns: a feature
branch with uncommitted files, switched mid-session by a concurrent agent session
on the same clone. Goal: move ONLY your commit to the base branch, restore their
branch EXACTLY as found, and undo the remote branch your push created.

**Never `git checkout`/`reset --hard` with foreign dirt present** — that destroys
their uncommitted work, which is unrecoverable.

## Recipe (verified order)

1. **Confirm the layout first:** `git log --oneline origin/<base>..HEAD`. If your
   commit is the ONLY thing beyond the base, their branch is base-tip + your
   commit + their dirty files, and every step below is safe.
2. **Un-commit yours, keep the tree:** `git reset --mixed HEAD~1` — moves HEAD
   back one, resets the index, leaves the working tree untouched. Their dirty
   files stay dirty; your change becomes an unstaged modification.
3. **Isolate only your file:** `git stash push -- <your-file>`. A bare
   `git stash` swallows their dirty files too. The pre-existing foreign stash
   entry (if any) is untouched by a pathspec push.
4. **Switch to the base:** `git checkout <base>` — their dirty files carry across
   cleanly when the two tips share content. If checkout REFUSES (their branch has
   commits the base lacks), stop and escalate; never force.
5. **Land yours on the base:** `git stash pop` → `git add <your-file>` → commit
   with the canonical closeout message → `git push`.
6. **Return them to their state:** `git checkout <their-branch>` — their dirty
   files carry back.
7. **Undo your remote pollution:** `git push origin --delete <their-branch>`.
   The remote ref exists only because of your mistaken push; the local branch
   stays, and their next push recreates the remote head normally.
8. **Leave HEAD on THEIR branch.** Switching to the base branch makes their next
   commit land on the wrong branch — the checkout is part of their working state.

## Gate outcome

This ends **blocked**, not closed: foreign dirt (their files) plus HEAD off the
base branch. Report it with the verbatim `git status --porcelain` output, name
their branch/session as the owner, and state the next action (they commit, push,
and open their PR; the gate re-runs after). Do not commit their files, do not
force-push, do not force-delete anything but the remote head your own push created.

