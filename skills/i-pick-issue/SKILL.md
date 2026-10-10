---
name: i-pick-issue
description: Station I (Pick & Orchestrate) — The single entry point for Issue work. Always starts with Discovery. Lists open issues, groups them by domain, recommends the next logical one by dependency order (the recommendation is the default selection unless the operator overrides it), takes the execution mode, then orchestrates Stations II through VI through to merge and closeout.
---

# Station I: Pick Issue (`i-pick-issue`)

Station I of the 6-station delivery pipeline (I–VI): the single entry point for
Issue work. It picks the next logical issue to build, then drives the rest of the
chain.

## Router Gate & Boundary (read first)

**Gate:** before any work, check repo state. If the branch is dirty, commits are unpushed, or a PR is open — run `pipeline-triage` first and follow its decision. Never start new Issue work on top of unfinished work.

**Boundary:** this skill owns Issue work — anything that starts from (or will end as) a GitHub issue with a PR. Ad-hoc requests (quick questions, small fixes, exploration, "where is X") are not Issue work: say so in one line, route to `using-agent-skills`, and stop. Ambiguous? If it will end in a PR on code, it is Issue work. Still ambiguous? Ask one question.

## Pipeline Position

- **Station:** Station I of VI (single entry point for Issue work)
- **Previous Station:** `pipeline-triage` (state gate — only when the tree is dirty, commits are unpushed, or a PR is open)
- **Next Station:** `quick-fix` (only when the recommendation is `quick-fix`-labeled or the operator explicitly requested the lane, **and** the §1a gate passes, **and** the operator picks it) or `ii-plan-issue <issue-id>` (Plan)

---

## 1. Always Start With Discovery (`/i-pick-issue` — with or without arguments)

Every invocation of this skill begins with the **Discovery Station**, regardless of arguments. Never skip discovery to jump straight into orchestration:

1. **List all open issues:**
   Run:

   ```bash
   gh issue list --state open --limit 50
   ```

   (and inspect details with `gh issue view <n> --comments` as needed). Present every open issue clearly: number, title, labels, and a concise summary.
2. **Categorize and group:**
   Group them logically by domain area, risk, architectural component, or dependency chain.
3. **Recommend an execution sequence:**
   Propose a concrete order of work (unblockers and core infrastructure before dependent features, quick wins vs. deep changes), and explicitly highlight the single recommended issue to start. By default the recommended issue IS the selected one — the run proceeds with it unless the operator overrides. The report header and wording follow `references/output-template.md`. No separate recommendation screen, and no separate "pick a number" menu: the alternatives are one line under the recommendation.
4. **Confirm or override:**
   Present the recommended (auto-selected) issue and proceed with it. The operator may override with another issue number at any point before Station II starts.
5. **Route non-issue states:** no open issues and the operator has a brand-new idea → `create-issue`. No open issues and nothing new → say so and route to `pipeline-triage`.

### 1a. Quick-Fix Lane Check (run before the execution-mode gate)

Before offering step-by-step vs. full orchestration, test the confirmed issue against the
**7-box gate** in `quick-fix`. This is the one place the lane is cheapest to catch: here it costs
a read, later it costs a plan.

**The label precondition.** Run the gate in exactly two cases:

1. The confirmed issue carries the `quick-fix` label (applied by `create-issue` at intake), or
2. the operator explicitly asks to consider it for the fast lane.

The label is a **precondition for evaluation, never a bypass.** When it is present, run all 7
boxes and report them first, ahead of the issue summary — the label was a guess from a
one-sentence idea, and a stale or optimistic one is exactly the case the gate exists to catch.

**Not `quick-fix`-labeled and not explicitly requested → skip the gate entirely.** Print no gate block, offer
no quick-fix option, and continue to the execution-mode gate (§1b) directly.

- **All 7 boxes pass** → present the confirmed issue as the quick option and let the operator choose: **quick fix** (push straight to `main`, no PR, no reviews, no CodeRabbit) or the **full pipeline**. If the operator changes the issue after this check, rerun §1a for the newly confirmed issue before offering or handing off. If they choose quick, hand off the confirmed issue ID **with its 7-box verdict** so `quick-fix` re-checks only size and its own diff instead of re-reading the issue — and skip the execution-mode gate entirely, there are no stations to step through.
- **Any box fails** → the full pipeline runs as usual, and remove the label so a later session is not misled:
  `gh issue edit <number> --remove-label "quick-fix"`.

The lane is offered, never forced. An issue the operator wants properly reviewed gets the full
pipeline even when it would technically pass the gate.

### 1b. Execution Mode Gate (mandatory, after issue selection)

Once the operator picks an issue, STOP and present exactly two options:

1. **Step-by-step mode (default recommendation):** run one station at a time. After each station completes, report its summary and **halt — wait for explicit operator approval before starting the next station.** The operator reviews the plan (II), the build (III), the PR (IV/V), etc., one gate at a time.
2. **Full orchestration mode:** run Stations II → VI end-to-end without halting, reporting a summary after each station, finishing only after Station V merge + Station VI closeout (prune, issue close, clean-exit gate).

Do NOT infer the mode from how the request was phrased, and do NOT start Station II until the operator has explicitly chosen a mode.

---

## 2. Orchestration Mode — After Issue and Mode Are Confirmed

Only after the operator selected an issue (step 4) AND an execution mode (step 1b), orchestrate the pipeline stations. In step-by-step mode, insert a mandatory approval halt after every station; in full orchestration mode, run sequentially with per-station reports:

### Step 1: Assignment & Setup

- Read the issue details: `gh issue view <number> --comments`
- **Do not claim the issue here.** Station II (`ii-plan-issue`) owns the first write —
  it checks the tree is clean *before* claiming and branching, so the assignee signal
  never lands on a dirty checkout. Claiming twice races the two stations; claiming
  early marks work started over a tree that may hold someone else's changes.
- Apply `context-engineering` principles to lock session scope before opening files.

### Step 2: Station II — Plan (`ii-plan-issue <number>`)

- Hand off to `ii-plan-issue` to perform scope right-sizing (Trivial/Small/Standard/Large), auto-detect stack, lock `CONSTRAINTS.md`, specify interfaces, and write `tasks/plan.md`.
- Report plan summary to the user.

### Step 3: Station III — Build (`iii-build-plan auto`)

- Hand off to `iii-build-plan auto` to implement all tasks in `tasks/plan.md` using TDD, atomic commits per task, and automated build error resolution.

### Step 3B: Station IIIB — Iterate After Build (`iiib-iterate-after-build`)

- After Station III completes, present the operator the two paths (already in III's report): corrections on the fresh build → `iiib-iterate-after-build` (routes to the right specialist, fixes locally, no push); all good → straight to Station IV.
- Loop IIIB until the operator reports the build clean, then continue to Station IV.

### Step 4: Station IV — Review & Ship (`iv-review-build-and-pr`)

- Hand off to `iv-review-build-and-pr` to run: the proof-before-review gate (Step 0: live browser check or targeted tests — failure returns to `iiib-iterate-after-build`), the OCR delegation scan, dynamic stack-matched reviewers plus the Spec axis (diff vs issue and `tasks/plan.md`: missing / added-not-asked / implemented-wrong), local fix commits, the final verification gate, then push the feature branch and open the PR with `@coderabbitai summary` and review trigger.

### Step 5: Station V — Babysit PR & Merge (`v-babysit-pr-and-merge`)

- Hand off to `v-babysit-pr-and-merge` to track CodeRabbit review (5m-4m-3m-2m-1m countdown or agent fallback on quota limit), resolve comments, squash merge on green CI, and fast-forward the local base branch (`git pull --ff-only`).

### Step 6: Station VI — Close Pipeline (`vi-close-pipeline`)

- Run `vi-close-pipeline` to close out: verify/close the issue, sweep stale per-issue artifacts (signal-based, any layout), handle dead code on the spot with zero-reference proof + targeted tests, and pass the Clean Exit Gate — pushed, on base branch, spotless, ready for the next issue.
- Optionally suggest `/present-pr <number>` (ad-hoc visual presentation, outside the pipeline) — never mandatory.

---

<!-- local-only:i-pick-issue:output-template-begin -->
The chat output template for this station is `references/output-template.md`.
Read it before writing your first report.
<!-- local-only:i-pick-issue:output-template-end -->
