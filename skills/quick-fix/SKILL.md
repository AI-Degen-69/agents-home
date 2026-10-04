---
name: quick-fix
description: Quick-fix lane — the fast path for trivial work. Use when a task is a typo, a one-line correction, a broken link, a wrong constant, a stale comment, a missing doc line, or any change to at most 2 files that adds no behavior and needs no new tests. Verifies, commits, and pushes straight to the base branch — no branch, no PR, no reviewers, no CodeRabbit. Any failed checklist criterion sends the work back to the normal pipeline instead.
---

# Quick Fix (`quick-fix`)

The escape hatch from the 6-station pipeline, for work so small that a PR, a
review round, and a CodeRabbit wait would cost more than the change itself.

**Not a station.** Like `pipeline-triage`, `create-issue`, and `present-pr`, this
is an unnumbered system skill. It is a *lane*, not a step: it replaces
Stations II–VI entirely, never part of them.

## Pipeline Position

- **Position:** fast lane — not a numbered station, not in the I → II → III → IIIB → IV → V → VI chain.
- **Enters from:** Station I (issue picked here), Station II (right-sizing lands on Tiny), Station III (before the first task), Station IV (the diff turns out trivial).
- **Exits to:** back to `i-pick-issue` for the next item. No PR, no merge station, no closeout station.

## The Gate (hard — every box must pass)

Run this checklist **before touching a file**. It is pass/fail, all-or-nothing.
There is no partial lane, no "mostly trivial", and no operator override: if any
box fails, the work is not a quick fix.

1. **Size** — at most **2 files** changed and roughly **≤30 added lines** total.
2. **Tier** — the work is **Tiny** in Station II's right-sizing terms: docs, typo, comment, or a single obvious correction. Not Small. Not Standard.
3. **No new behavior** — the change adds nothing the product does not already do. A typo fix and a wrong constant are corrections; a new branch, guard, or feature is not.
4. **No contract surface** — no public API, no exported type, no schema, no migration, no config key, no CI change, no dependency change, no auth or permission path.
5. **No new test needed** — existing tests cover the touched code. The quick lane never writes a test; if a test is required, the box fails.
6. **Verification already exists** — a targeted test command, typecheck, or lint covering the touched files is known and runnable. If the repo has no such command, the box fails.
7. **Operator asked for speed** — the request is a fix, not a discussion. If the operator is still deciding the approach, it is planning, not a quick fix.

**The `quick-fix` label is never box 8.** When `create-issue` applied that label at intake it was
a guess about this same check, made from a one-sentence idea. Re-run the boxes yourself: a labeled
issue whose gate fails routes out exactly like an unlabeled one. The lane may never run *because*
of the label, only alongside it.

**Every box passes → run the lane. Any box fails → say which one in one line and route out (table below). Never argue a borderline case into the lane, and never silently downgrade a failed box.**

## Escape routes

| Failed box | Route to |
|---|---|
| 1, 2 — too big for the lane | `ii-plan-issue` — the work needs a real plan and branch |
| 3, 4 — new behavior or contract surface | `ii-plan-issue` — review exists for a reason |
| 5 — a test is required | `iii-build-plan` — TDD and a PR |
| 6 — no runnable verification | `iii-build-plan` — never ship unverified |
| 7 — the approach is still open | `i-pick-issue` — back to Discovery |

## Protocol

### 1. Confirm the gate

The diverting station hands over its 7-box verdict. A station produces one in only two cases: the
issue carries the `quick-fix` label, or at Station I the operator explicitly requested the lane.
**Do not re-derive it.** Read the verdict and carry boxes 2, 5, 6, and 7 forward — those are properties of the issue and do not change between the divert and here. Then re-check exactly two things against the tree in front of you:

- **Box 1 (size)** — always. It is the one box that can drift: work may have grown after the divert. Re-count files and added lines.
- **Boxes 3 and 4 (no new behavior, no contract surface)** — against your own diff, once you have made it. A divert that passed on the *issue* proves nothing about the *change* you are about to write.

If the lane was entered directly (no divert verdict: the operator asked for the fix, or the label was applied and someone routed here without a station), run all 7 boxes yourself as originally written — the carried verdict is an optimization, never a substitute.

Either way, state each box as a one-line pass/fail in the report. **Fail → escape route above, stop.** This takes one read; do not open the whole codebase first.

### 2. Confirm repo state (read-only, fast)

```bash
git status --short --branch
git fetch origin && git rev-list --left-right --count HEAD...origin/<base>
```

Requirements, all required:

- On the **base branch** (`main` / `master`) — the lane pushes there directly, so a wrong branch means a wrong target.
- **Only the lane's own work in the tree.** Two cases are normal and both pass:
  a **clean tree** (Station I, II, III diverts), and the **Station IV handoff** — the gated files already staged on the base branch by `git merge --squash`, which is exactly what that divert produces. Any *other* changed file, or unpushed commits belonging to different work, is foreign dirt → route to `pipeline-triage`. Never absorb another stream's changes, and never stash them away to make the tree look clean.
- **In sync** with `origin/<base>`. If behind, `git pull --ff-only` first. If that pull is refused because it would overwrite the staged handoff, stop and route to `pipeline-triage` — never reset or stash away the lane's own work to force it through.

**Branch protection may reject the direct push.** If `git push origin <base>` is refused, the quick lane does not fight the rules and does not open a PR as a silent substitute: report the rejection and route to `pipeline-triage` to pick the proper path. A protected base branch is the operator's deliberate choice, not an obstacle to route around.

### 3. Implement (minimal by construction)

Make the smallest change that fully fixes the problem — the boring, short solution wins (Rule 4). Match the file's existing style. Touch only the files the gate counted. Run `code-simplification` on the diff if it leaves scratch code behind.

If the work turns out larger than the gate allowed — a third file, a new branch of logic, an unclear fix — **stop mid-lane**: do not push. Report what was found, leave the tree as it is, and route to `ii-plan-issue`. Discovering that a "typo" is a symptom is the lane's most common failure, and pushing it anyway is the failure mode that matters.

### 4. Verify (proved, or honestly unverified)

Run the **targeted** command from box 6 — the test file, typecheck, or lint that covers the touched code. Not the full suite; that is CI's job on push.

- **Green** → continue to push.
- **Failed** → this is a real defect. Do not push. Route the failure to `iiib-iterate-after-build` as a correction item.
- **Could not run** (missing tool, dead daemon) → say so plainly. An unverified quick fix is disclosed in the issue comment in step 6; it is never reported as a pass. Fabricating a pass is the one unforgivable outcome here.

### 5. Commit and push straight to the base branch

```bash
git add <the 2 gated files>
git commit -m "fix(<scope>): <what was wrong> (#<issue>)"
git push origin <base>
```

Stage **only** the files the gate counted — never `git add -A`. Conventional-Commits types belong in commit messages.

### 6. Close the loop on the issue

When the lane ran from a GitHub issue, leave the trace where the next person will look:

```bash
gh issue comment <number> --body "<what changed, what verified, what was skipped>"
gh issue edit <number> --remove-label "quick-fix"
gh issue close <number>
```

The comment is what replaces the PR as the durable record — it must name what was verified and what was not, so a reader never sees an unverified lane as a verified one. With no issue (the operator asked for the fix directly), the chat report is the only record; keep it factual.

Two reasons the label must not survive the close, which is why the ordering above is fixed. A
closed issue keeps its labels forever, so one still labeled `quick-fix` reads as an unfinished
lane to anyone auditing the backlog; and the closing comment already records what happened, so the
label has nothing left to signal. (`gh issue close` has no `--remove-label` flag — only
`--comment`, `--duplicate-of`, and `--reason` — so the removal is a separate command, not a flag
on the close.)

No `@coderabbitai` comment, no `@coderabbitai summary`, no review trigger — the lane exists to skip the review wait entirely. CodeRabbit never sees this work.

### 7. Report and hand back

Report per `references/output-template.md`, then hand back to `i-pick-issue` for the next item. The point of the lane is to reach the next task fast.

## Rules

1. **The gate is absolute.** Any failed box → escape route. No partial lane, no judgment call, no operator override. The `quick-fix` label is a screening hint from intake, never a pass — and neither is a diverting station's verdict for the boxes you did not re-check.
2. **Base branch only.** The lane pushes to `main` / `master` directly. It never creates a branch and never opens a PR — that is the entire reason it exists.
3. **No CodeRabbit, ever.** No review trigger, no summary request, no plan comment, no waiting.
4. **Proved or honestly unverified.** Never report an unrun check as a pass, and never weaken a check to make the lane fit.
5. **Two files, thirty lines.** When the fix outgrows the gate, the fix was not a quick fix. Stop and route out.
6. **Push is autonomous.** Once the gate passes and verification is green, push without asking. The operator chose the lane by asking for the quick fix.
7. **Scope discipline — never fix it, never log it.** Anything noticed but out of scope is left untouched and named in one line of the chat report, nothing more. The lane deliberately does **not** write the `NOTICED-BUT-NOT-TOUCHING` ledger at `docs/issues/<id>-noticed-but-not-touching.md`: it closes the issue and never runs Station VI, the only station that resolves those rows, so a row written here would stay `open` forever. A lane that leaves a file behind is a lane that skipped a step.
8. **Leave no label residue.** `quick-fix` comes off the issue when the lane closes it, and comes off at any divert point that disproves it.

<!-- local-only:begin -->
The chat output template for this skill is `references/output-template.md`.
Read it before writing your report.
<!-- local-only:end -->