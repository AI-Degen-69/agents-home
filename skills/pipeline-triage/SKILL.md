---
name: pipeline-triage-legacy-snapshot
description: Session-start triage and dirty-repo router. Use at the start of any session when intent is unclear, the request continues existing work, or the operator says "where were we". Also use whenever the user asks what to do next with uncommitted changes, unpushed commits, open PR comments, or a dirty repo, or wants to finish existing work and start fresh from a clean branch, or when the next step is unclear between planning, reviewing, pushing, merging, or cleaning up.
---

# Pipeline Triage

Decide the single next path for existing changes so the repo lands clean on a synced master.

## Pipeline Position
- **Position:** State gate — **not a numbered station.** Runs before Station I when the repo carries unfinished work, or when the next step is unclear.
- **Next:** the one station named in the routing table below.

## Step 0 — Classify the operator's message (session start)

Before any git checks, classify what the operator asked for:

- **Continuation / unclear intent / "where were we" / open work mentioned** → continue with the checks and routing table below.
- **New Issue work and the repo is clean** → route to `i-pick-issue` (Station I, backlog discovery), done.
- **Ad-hoc request** (quick question, small fix, exploration, "where is X" — not Issue work) → say so in one line and route to `using-agent-skills`, done.
- **Ambiguous between Issue work and ad-hoc?** If it will end in a PR on code, treat as Issue work and run the table below; else ad-hoc. Still ambiguous → ask one question.

Never run this skill and `i-pick-issue` or `using-agent-skills` on the same request — this skill hands off at most once.

## Checks first read only

Run these read-only checks before deciding anything. Never change files in this phase.

1. Run `git status --short --branch` to see staged, unstaged, and untracked changes.
2. Run `git log --oneline -8` and `git stash list` to see recent commits and stashed work.
3. Run `git branch --show-current` plus `git rev-list --left-right --count HEAD...@{upstream}` when an upstream exists to see ahead and behind counts. Also check against the **base branch**, not just upstream: `git rev-list --left-right --count HEAD...origin/<base>` — an upstream in sync proves nothing when the base branch has moved ahead.
4. Run `gh pr status` and `gh pr view --comments` when a PR exists for the branch to see open state and review comments. Search the comments for a `coderabbit` review and for an `@coderabbitai review` comment from any author. When neither exists, no `coderabbit` review has run yet.
5. Look for `tasks/plan.md` and `tasks/todo.md` with an incomplete checklist. When found, read the issue number from those files and check the issue state with `gh issue view <num>`. When the issue is closed, check how it closed: a merged PR means the work landed, any other close reason means it did not.

**Trust command output only after it agrees with disk.** Output-injecting hooks can interleave banners or fragments into command results, producing phantom paths — a `git status` line naming a file a direct `search_files` (target='files') listing of the same directory cannot find, or a corrupted status line. When output disagrees with disk, re-run the command with its output routed through a plain passthrough pipe before classifying anything. Never stop the pipeline or declare unknown-origin dirt on a path you cannot see on disk.

## Unknown-origin dirt — stop rule (BEFORE the routing table)

Dirt you cannot attribute to the work in front of you is **never routed by size**.
Rows 10-11 classify dirt as "small" or "large", which is meaningless when nobody
knows where it came from. So classify origin **first**:

1. Can every changed file be traced to the operator's stated task, an open issue,
   or the merged work already named in this session?
2. **Yes** → dirt is scoped. Continue to the routing table; rows 10-11 apply normally.
3. **No** → the origin is **unknown**. Stop. Do NOT route to `ii-plan-issue` or
   `iii-build-plan` on a guess about size, and do NOT stash, discard, commit, or
   branch away from it. Report the foreign paths and ask one question: whose work is this?
4. **Uncertain** (mixed known/unknown files) → treat as unknown-origin. Ask.
5. **Dirt that appears mid-session is a live foreign writer.** A tree clean at pre-flight that
   shows a new modified file between two of your own commands (or a worktree appearing in
   `git worktree list` mid-command) means another session is editing this checkout right now.
   Treat it as unknown-origin even when the diff content later traces to a real issue: the
   writer may still be mid-edit, and absorbing a partial change corrupts both streams. Ask
   whose work it is and offer to proceed in an isolated worktree.

Only a human can attribute foreign dirt. This station guides — it never absorbs
another stream's changes into the current issue.

### How to attribute dirt (method, not guessing)

Attribution is mechanical when the tree is on a feature branch — do it before
declaring anything unknown-origin:

1. `git diff --stat <base>...HEAD` (three dots) — shows what the **branch itself**
   carries versus the base branch. Compare against the uncommitted `git diff`:
   files matching branch commits belong to the branch's issue.
2. Read the `#<issue>` header of `tasks/plan.md` / `tasks/todo.md` — it names the
   branch's issue, which is the attribution target for branch-matching files.
3. Read the content of files that match **neither** the branch commits nor the
   plan — a handoff doc or a new script often names its own origin issue in its
   first lines (read it before calling it unknown).
4. Files matching nothing after those three passes are unknown-origin → stop rule. `stat -c '%y' <file>` against the current clock confirms freshness — modified seconds ago while your commands run means a live writer, not leftover state.

## Operator-performed deletions — audit before agreeing

A dirty tree whose dirt is `D` lines (the operator cleaned up "stale" files) is scoped
dirt, but the staleness claim is **unverified**. Deleted files are frequently test
fixtures — arm/config JSON, run records, dated docs — that no runtime code imports and
so look dead to a grep of source only. Before endorsing the cleanup or committing it:

1. Enumerate and group: `git status --porcelain | grep '^ D' | awk '{print $2}' | cut -d/ -f1-2 | sort | uniq -c | sort -rn`.
2. **Grep the test tree, `scripts/`, and `docs/` prose for every deleted basename**, not just source imports. A rulebook doc that cites the deleted file as "the recipe for doing X" is load-bearing even when no code imports it.
3. Run the tests that referenced a deleted path — a `FileNotFoundError` beats any judgement about whether a doc is stale.
4. `git restore` only the load-bearing paths, then re-run the suite green before reporting. Restoring is safe; never `git checkout` the whole directory back (that undoes the intentional cleanup).
5. A guard test asserting a directory exists cannot survive an empty directory (git does not track them) — restore one file or add a `.gitkeep`.

Full procedure, including orphaned `__pycache__`-only directories and the destructive-wipe handoff rule: `references/deletion-audit.md`.

## "Branch off / pick an issue" gate

The operator asking to start new issue work ("branch off", "pick an issue") does
**not** clear the current branch. A feature branch with unpushed commits is row 2
work that lands on top of, or is silently abandoned by, the new branch. Before
branching:

1. Report the branch's unpushed work (commit count vs base, no PR → row 2) as the
   first thing in the triage output — the new-issue request presupposes it is done.
2. Never `git checkout -b` from a dirty tree. Foreign dirt that cannot be
   attributed carries over to the new branch and pollutes the next issue's diff.
3. Route both streams in one report: current branch → `iv-review-build-and-pr`
   (or park), foreign dirt → ask. Only after the operator resolves both does
   `i-pick-issue` start on a clean base-branch checkout.

## Routing table

Pick exactly one row. First matching row wins. **The PR rows (3–6) apply to a PR whose head is THIS branch** — check the PR's `headRefName` against `git branch --show-current` before applying them. An open PR on a different branch is context to report, not a blocker: when the tree is a clean linked worktree on its own branch, the operator may choose to start the next issue there instead of babysitting the other branch's PR. Report both streams and let the operator pick.

1. Clean tree, on master, synced with remote, no open PR -> work is done. Route to `i-pick-issue` (Station I) to pick the next issue.
2. Clean tree, on a feature branch, commits unpushed, no PR yet -> needs review and shipping. Route to `iv-review-build-and-pr` — unless the operator just reported corrections on a fresh build, then route to `iiib-iterate-after-build` first.
3. Open PR with no `coderabbit` review and no `@coderabbitai review` comment **from any author** -> start the review now so it runs while the next station starts. A trigger counts from **any** author, not just you: if another PR participant already posted `@coderabbitai review` and the review has not appeared yet, the trigger is already spent — do NOT post a second one, because re-triggering burns quota and creates review churn (same rule as `v-babysit-pr-and-merge/references/review-loop.md`). Check every PR comment before posting. With operator approval, post `@coderabbitai review` as a PR comment (identical wording to Station IV's trigger — never reword it), then route to `v-babysit-pr-and-merge` knowing the review is already running. This saves waiting time. Because this path skips Station IV's own acknowledgement wait, **read the trigger reply yourself and carry its status into the handoff** — one of: review started / rate limited (N minutes) / **summary-only review (private repo on Free — no findings expected, not a pass)** / other reply / no acknowledgement. A summary-only outcome must reach Station V as such, never as a clean pass; on a private repo on the Free plan it is the expected shape.
4. Open PR with change requests or failing checks -> needs babysitting. Route to `v-babysit-pr-and-merge`.
5. Open PR with green checks, no change requests, still waiting on reviews -> babysit until approval. Route to `v-babysit-pr-and-merge`.
6. Open PR approved and green -> merge it, then clean up. Route to `v-babysit-pr-and-merge` for the merge step.
7. Branch merged already, leftover branch or worktree exists -> prune and sync. Route to `vi-close-pipeline` (its Clean Exit Gate syncs master).
8. `tasks/plan.md` (or `tasks/todo.md`) with an incomplete checklist and the linked issue still open -> work started but unfinished. Resume it. Route to `iii-build-plan`.
9. `tasks/plan.md` (or `tasks/todo.md`) with an incomplete checklist and the linked issue closed -> stale work. When a PR was merged the work landed, otherwise it was abandoned. Either way sweep the leftovers. Route to `vi-close-pipeline`.
10. Dirty tree with a clear small task and no PR -> finish the work first. Route to `iii-build-plan`. (Origin must be known — see the stop rule above.)
11. Dirty tree with an unclear or large task -> needs scoping first. Route to `ii-plan-issue`. (Origin must be known — see the stop rule above.)
12. Brand new idea with no code yet -> capture it. Route to `create-issue` (intake branch), then back to `i-pick-issue`.
13. Work merged and the operator wants a visual summary -> route to `present-pr` (ad-hoc visual presentation, not a pipeline station).
14. The request is ad-hoc (not Issue work at all) -> say so in one line and route to `using-agent-skills`.

## Output format

Answer in the chat only. Always use this exact markdown shape with headings, bold, and emojis. Two sections only, short. No approval line. No explanation of what the station does.

After the status line, always list every changed file by category with a one-line classification of what it is (which issue/PR it belongs to, or "unknown origin"). Omit a category only when its count is 0. Also list each stash with its number, age, branch, and a one-line classification of its contents.

Report order: title, then folder state, then GitHub checks, then what was asked, then what was found. Issues and PRs are hyperlinks. The station name stays in English in the title. A `---` separator line comes before the What-now section.

<!-- local-only:pipeline-triage:output-template-begin -->
The chat output template for this station is `references/english-template.md` (default).
Read it before writing your first report.
If the operator explicitly requests Hebrew output, use the Hebrew template at `references/hebrew-template.md`.
<!-- local-only:pipeline-triage:output-template-end -->

---

## Safety rules

1. Guide only by default and stop before push, merge, discard, or reset.
2. Ask for explicit approval before any destructive step.
3. Never invent PR state or check results. Report only what the commands above showed.
4. When two rows seem to match, say so in one sentence and pick the smaller safer step first.
