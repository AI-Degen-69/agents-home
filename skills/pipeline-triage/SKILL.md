---
name: pipeline-triage
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
3. Run `git branch --show-current` plus `git rev-list --left-right --count HEAD...@{upstream}` when an upstream exists to see ahead and behind counts.
4. Run `gh pr status` and `gh pr view --comments` when a PR exists for the branch to see open state and review comments. Search the comments for a `coderabbit` review and for an `@coderabbitai review` comment from you. When neither exists, no `coderabbit` review has run yet.
5. Look for `tasks/plan.md` and `tasks/todo.md` with an incomplete checklist. When found, read the issue number from those files and check the issue state with `gh issue view <num>`. When the issue is closed, check how it closed: a merged PR means the work landed, any other close reason means it did not.

## Routing table

Pick exactly one row. First matching row wins.

1. Clean tree, on master, synced with remote, no open PR -> work is done. Route to `i-pick-issue` (Station I) to pick the next issue.
2. Clean tree, on a feature branch, commits unpushed, no PR yet -> needs review and shipping. Route to `iv-review-build-and-pr` — unless the operator just reported corrections on a fresh build, then route to `iiib-iterate-after-build` first.
3. Open PR with no `coderabbit` review and no `@coderabbitai review` comment from you -> start the review now so it runs while the next station starts. With operator approval, post `@coderabbitai review` as a PR comment, then route to `v-babysit-pr-and-merge` knowing the review is already running. This saves waiting time.
4. Open PR with change requests or failing checks -> needs babysitting. Route to `v-babysit-pr-and-merge`.
5. Open PR with green checks, no change requests, still waiting on reviews -> babysit until approval. Route to `v-babysit-pr-and-merge`.
6. Open PR approved and green -> merge it, then clean up. Route to `v-babysit-pr-and-merge` for the merge step.
7. Branch merged already, leftover branch or worktree exists -> prune and sync. Route to `vi-close-pipeline` (its Clean Exit Gate syncs master).
8. `tasks/plan.md` (or `tasks/todo.md`) with an incomplete checklist and the linked issue still open -> work started but unfinished. Resume it. Route to `iii-build-plan`.
9. `tasks/plan.md` (or `tasks/todo.md`) with an incomplete checklist and the linked issue closed -> stale work. When a PR was merged the work landed, otherwise it was abandoned. Either way sweep the leftovers. Route to `vi-close-pipeline`.
10. Dirty tree with a clear small task and no PR -> finish the work first. Route to `iii-build-plan`.
11. Dirty tree with an unclear or large task -> needs scoping first. Route to `ii-plan-issue`.
12. Brand new idea with no code yet -> capture it. Route to `create-issue` (intake branch), then back to `i-pick-issue`.
13. Work merged and the operator wants a visual summary -> route to `present-pr` (ad-hoc visual presentation, not a pipeline station).
14. The request is ad-hoc (not Issue work at all) -> say so in one line and route to `using-agent-skills`.

## Output format

Answer in Hebrew in the chat only. Always use this exact markdown shape with headings, bold, and emojis. Two sections only, short. No approval line. No explanation of what the station does.

After the status line, always list every changed file by category with a one-line classification of what it is (which issue/PR it belongs to, or "unknown origin"). Omit a category only when its count is 0. Also list each stash with its number, age, branch, and a one-line classification of its contents.

## 📊 מצב
**ענף:** `name` | **קדימה/אחורה:** X/Y | **מבוימים:** X | **לא מבוימים:** X | **לא נעקבים:** X | **PR:** state | **סטאשים:** X

**מבוימים (X):**
- `path/to/file` — classification

**לא מבוימים (X):**
- `path/to/file` — classification

**לא נעקבים (X):**
- `path/to/file` — classification

**סטאשים (X):**
- `stash@{0}` — date, branch, what it holds in one line

## 🎯 החלטה
מנותב ל־**`<station>`** — next action in one short line.

## Safety rules

1. Guide only by default and stop before push, merge, discard, or reset.
2. Ask for explicit approval before any destructive step.
3. Never invent PR state or check results. Report only what the commands above showed.
4. When two rows seem to match, say so in one sentence and pick the smaller safer step first.
