---
name: ii-plan-issue
description: Station II (Define & Plan) of the 6-station pipeline (I–VI). Use when a GitHub issue needs to become an executable plan — fetches the issue via gh, right-sizes it, locks CONSTRAINTS.md, maps interfaces, writes tasks/plan.md, and hands off to /iii-build-plan auto. Reports in Hebrew, issue-first.
---

# Station II: Plan Issue (`ii-plan-issue`)

This skill implements **Station II (Define & Plan)** of the 6-station pipeline (I–VI). It works across **any project, language, or repository**, bridging a GitHub issue to an airtight, executable specification and task plan (discipline from Addy Osmani's agent-skills collection, right-sizing from ECC's orchestrator approach).

**Prime directive:** the issue being planned is the star of the show. Planning machinery (skills, steps, contracts) is scaffolding — it lives in `tasks/plan.md`, never as the headline of the reply.

## Pipeline Position
- **Station:** II of VI
- **Previous Station:** `i-pick-issue` (Station I — or the `create-issue` intake branch)
- **Next Station:** `quick-fix` (only on a Step 0C divert — which itself requires a `quick-fix`-labeled Tiny issue, the gate passing, and the operator's choice) or `iii-build-plan auto` (Build)

---

## 1. Invocation & Target Issue Discovery

### Option A: Invoked with an Issue Number (e.g. `/ii-plan-issue 42`)
1. **Fetch Issue Details:** Run `gh issue view <number> --comments` — title, body, labels, and all discussion comments.
2. **Check tree clean first:** Run `git status --short --branch` — if the tree is dirty stop and route to `pipeline-triage` before claiming or branching.
3. **Claim the Issue:** Run `gh issue edit <number> --add-assignee @me` to signal work has begun.
4. **Create the feature branch:** see canonical rule in Step 0B (`i<number>/<slug>` from the issue title, e.g. issue #69 `Increase button size` → `i69/increase-button-size`).
5. Set this issue as the primary planning target.

### Option B: Invoked Without Arguments (`/ii-plan-issue`)
1. **Fetch All Open Issues:** Run `gh issue list --state open --limit 50`.
2. **Group Logically:** Identify project areas (labels or codebase architecture).
3. **Recommend exactly one issue:** highest-priority first (unblockers and core dependencies, then quick wins), with a one-line rationale.
4. **Proceed immediately — do not pause to ask.** Invoking `/ii-plan-issue` with no arguments **is** the operator's consent to auto-pick the recommended issue, claim it, and branch — a second confirmation would defeat the mode. Check tree clean (`git status --short --branch`, dirty → `pipeline-triage`), then **check the starting branch**: you must be on the base branch (`master`/`main`). On a feature branch — even a clean one with unpushed commits — stop and route to `pipeline-triage`: Step 0B branches from the current HEAD, so a new issue's branch would inherit that other work's commits. Only from the base branch: claim the recommended issue (`gh issue edit <number> --add-assignee @me`), create the feature branch per Step 0B (`i<number>/<slug>` from the issue title), and go straight to Section 2 on it. The consent covers the claim and the branch only — never a scope expansion, and the report still names which issue was auto-picked so the operator can redirect.

### If `gh` fails (not authenticated, offline, or issue not found)
Stop the issue-dependent steps. Say in plain language exactly what failed, and ask the user for the issue number/title (or to run `gh auth login`). **Never fabricate issue content and never plan from imagined data (do not invent content).**

---

## 2. Step-by-Step Planning Protocol (strict order)

### Step 0: Environment Auto-Detection & Size Classification (ECC Right-Sizing)
1. **Auto-detect stack:** language, runtime, frameworks, and the test runner (`pytest`, `vitest`/`jest`, `cargo test`, `go test`, ...).
2. **Size tier** — state the tier plus a one-line rationale in the output:
   - **Tiny** — docs/typo/comment-level change; no code behavior change; zero ambiguity.
   - **Small** — one file or one function; straightforward once the code is read.
   - **Standard** — 2–5 files, internal module changes, a single architectural decision.
   - **Large** — cross-cutting changes, a new external dependency, public API or database schema change.
3. **Task type** — classify into one or more primary categories (combinations allowed): **Code** (default), **Design**, **Debug**, **Performance**, **Security**, **Docs**, **UX / Copy**, **Research**. Classify *before* planning: downstream stations (`iii-build-plan`, `iv-review-build-and-pr`) pick reviewers and test suites from this tag.

### Step 0C: Quick-Fix Lane Divert (after the tier and task type, before Step 0A)

**Tiny tier and the `quick-fix` label are both required** — the label is a precondition for
evaluation. Read the linked issue's current labels (`gh issue view <number> --json labels`);
Station II must not rely on a label status carried forward from Station I.

Three outcomes:

1. **Not `quick-fix`-labeled, any tier** (whether or not it carries other labels such as
   `ready-for-agent`) → continue to Step 0A. Run no gate, print no gate text, offer no lane.
2. **Labeled but not Tiny** → remove the label
   (`gh issue edit <number> --remove-label "quick-fix"`) and continue to Step 0A. Right-sizing
   here is the **authority** the label only guessed at: the label was wrong, and a stale one
   cannot mislead a later session.
3. **Labeled and Tiny** → run the **7-box gate** in `quick-fix`. A Tiny issue may still be the
   wrong lane: right-sizing measures size, the gate measures risk. All 7 pass → tell the operator
   in one line that this looks like a quick fix (push straight to `main`, no PR, no reviews, no
   CodeRabbit) and ask whether to take it. They choose: **yes** → hand off to `quick-fix`
   **with your 7-box verdict** so it re-checks only size and its own diff instead of re-reading
   the issue, and stop this station; **no, or any box fails** → continue to Step 0A as normal,
   and if any box failed remove the label so a later session is not misled.

Three things are deliberately still not offered here, because at this point the full chain costs
almost nothing: a new test required, no runnable verification command, or an undecided approach.
Those are boxes 5, 6, and 7 — failing them is not a near miss.

### Step 0A: Resolve Open Questions from Code & Consult CodeRabbit Plan
1. **Check for CodeRabbit Plan in comments:** Look at the discussion comments fetched via `gh issue view <number> --comments`. If a plan comment from `coderabbitai` exists:
   - **Read it once, not twice:** the comment carries the plan twice — a rendered copy first, then a byte-identical echo inside an HTML comment (`<!-- <rawResChunk><planningResult> … -->`). Ignore the echo; it only doubles context cost.
   - **Map CodeRabbit's layout to ours:** it keeps its own template (Summary / Design Choices / Implementation Steps with Phases+Tasks / Ticket Summary / Codebase Summary / File-Level Change Summary / Notes for follow-up agents). Mine those sections; do not wait for our section names to appear.
   - **Extract skeleton & seams:** treat its task phases, affected files, and seam pointers as scaffolding to save discovery time.
   - **Resolve assumptions & drift:** read its Assumptions/Risks or Design-Choice rationales. Anything it flagged as uncertain, any reference it left dangling (e.g. "Apply Assumption 1" with no Assumption 1 defined), and any contradiction it found between the issue text and the code is an **open question to resolve from the code — treat it as `[UNVERIFIED]`, never as fact.**
   - **Borrow test cases:** note the exact test assertions and regression test files it specified for use in Step 3 (`CONSTRAINTS.md`) and Step 6 (`tasks/plan.md`).
   - **Enforce simplicity (Rule 4):** its suggestions are non-binding. It usually over-splits — merge its task list into 3–4 atomic tasks and drop invented abstractions or new files nothing requires.
   - **Verify, don't assume (Rule 6):** spot-check every file path, symbol, and line number it cites against the live codebase before adopting any of it.
   - **Cost the intake once:** record a three-line note in `tasks/plan.md` — what was adopted from its plan, what was rejected and why, and what stayed `[UNVERIFIED]` — so Stations III–V never re-read that comment.

2. **Resolve Open Questions (needs-answers flag):** If the issue carries the `needs-answers` label or an **Open questions** section:
   - For each open question, first try to resolve it **from the code** (and CodeRabbit's codebase analysis) — read the relevant paths, check how similar cases are handled in the repo.
   - Fold each resolved answer into the plan as planning input; record the resolved answers in `tasks/plan.md` so the reasoning survives the session.
   - Ask the operator **only what is genuinely unresolvable from code** — one focused batch, before Step 1. Never re-ask what the issue already answers.
3. **Large or unfamiliar/legacy code:** before answering, deploy the `code-explorer` agent persona (from `~/.agents/agents/`) to trace the relevant execution paths and map the affected architecture layers; fold its findings into the plan. Persona file not found on disk → skip and record the skip — never simulate a missing reviewer persona (do not invent).

### Step 0B: Confirm Feature Branch (canonical rule for Section 1)
Branch format is `i<number>/<slug>` from the current HEAD. Derive `<slug>` from the issue title: lowercase, spaces → dashes, keep only `a-z 0-9 -`, max 50 chars, never Hebrew — Hebrew chars are stripped, and an empty result falls back to `issue-<number>`. Example: issue #69 `Increase button size` → `i69/increase-button-size`; a Hebrew-only title for issue #70 → `i70/issue-70`.
1. Tree was already checked clean in Section 1 — if dirty now, stop and route to `pipeline-triage` before branching.
2. Run `git branch --show-current` — if already on `i<number>/<slug>` reuse it.
3. Else if the branch exists locally or on remote (`git branch --list` / `git ls-remote --heads origin`), checkout it (`git switch <branch>`, fallback `git checkout <branch>`).
4. Else create it from HEAD (`git switch -c i<number>/<slug>`, fallback `git checkout -b i<number>/<slug>`).
5. Record the header line at the top of `tasks/plan.md`: `Branch: i<number>/<slug> | Issue: #<number>` so Stations III–V build, review, and push on the same branch.

### Step 1: Domain Skill Routing
Load specialized skills that match the classified task type (and only skills that actually exist in the environment — verify before naming any skill):

| Task type | Planning skills |
|---|---|
| Design/UI | `frontend-ui-engineering`, `frontend-design`, `tailwind-design-system`, `extract-design-system` |
| API/Backend | `api-and-interface-design` |
| Debug | `debugging-and-error-recovery`, `doubt-driven-development` |
| Performance | `performance-optimization` |
| Security | `security-and-hardening` |
| Docs | `documentation-and-adrs` |
| UX / Copy | `humanizer` |
| Research | `idea-refine` (spike → recommendation doc) |
| Core (default) | `test-driven-development`, `incremental-implementation` |

*Design distinction:* `frontend-design` governs aesthetic direction, typography, and non-templated choices; `frontend-ui-engineering` governs accessible, responsive, production-quality UI and WCAG compliance.
*Execution tagging:* in `tasks/plan.md`, every task declares its domain tag (`[Design/UI]`, `[Backend/Logic]`, `[Debug]`, ...) and the verification mode `iii-build-plan` will run (browser preview for UI, unit/integration runner for logic).

### Step 2: Specification (`spec-driven-development`)
- **Standard / Large:** create or update `SPEC.md` in the project root — goals, acceptance criteria, edge cases, explicit out-of-scope.
- **Small / Tiny:** embed a concise spec directly in the plan. No `SPEC.md` ceremony for small work.

### Step 3: Lock Quality Guardrails (`constraint-driven-development`)
Create or update `CONSTRAINTS.md` with strict, measurable boundaries:
- **Zero regressions:** targeted suites covering modified files must pass; new behavior requires tests. (Full-repo sweeps stay with CI on push.)
- **Performance thresholds:** explicit latency/memory/runtime ceilings where applicable.
- **Anti-cheat:** strictly forbid skipping/disabling tests, deleting assertions, or suppressing linters.
- **Dependencies:** no new external dependencies without explicit approval.

### Step 4: Interface Contracts (`api-and-interface-design`)
Lock types, data schemas, public function signatures, and communication contracts before writing business logic. Skip for Tiny/Docs tasks with no interface change.

For Standard/Large work with a non-trivial domain model, run the `type-design-analyzer` agent persona (from `~/.agents/agents/`) over the interfaces being locked — encapsulation, invariant expression, and enforcement — before freezing the contract. Persona not found on disk → skip and record the skip.

### Step 5: One Improvement Proposal (evidence-based, classified adoption)
Propose **at most one** concrete improvement to the issue's approach — an architectural simplification, a forgotten edge case, or a better fit to existing repo patterns.
1. **Ground it in evidence:** quote the motivating evidence **verbatim** — the exact issue text, issue comment, or code lines — not just a file/line pointer. **No evidence ⇒ no proposal**; never invent filler to satisfy this step; say so and skip instead (do not invent).
2. **Classify the proposal:**
   - **Simplification / edge-case hardening** → adopt-by-default: folded into `tasks/plan.md` after the evidence check passes.
   - **Scope expansion** (new behavior the issue never asked for) → **opt-in only**: presented as a question, enters the plan solely on explicit operator approval.
3. **Rejection is recorded** in `tasks/plan.md` with its reason, so the same proposal does not resurface next session.
4. Present the proposal in the report in one plain-Hebrew sentence so the operator can reject before build.

### Step 6: Task Decomposition (`planning-and-task-breakdown`)
1. **Dependency graph first:** before ordering anything, map which task unblocks which — a task depends on another when it needs that task's output (interface, file, data). Write the graph into `tasks/plan.md` as a `Depends on:` field per task.
2. **Order risk-first:** riskiest and most-uncertain tasks run early, while the cost of being wrong is still low. Size and verification follow the graph, not the other way around.
3. **Size each task XS–XL:** XS ≈ one-line config, S ≈ one file, M ≈ a few files, L ≈ cross-cutting, XL ≈ split it before planning proceeds.
4. **Atomic vertical slices, 5–10 minutes each.** Every task defines: Task ID, size (XS–XL), domain tag, target files, concise description of what is built, assigned helper skill, `Depends on:` (task IDs), and explicit verification method (browser check or automated test).
5. **Checkpoints every 2–3 tasks:** the plan declares checkpoint stops that show what works so far. In Mode A (`/iii-build-plan auto`) a checkpoint is a one-line progress report, not a full approval pause.
6. **Map tasks to sub-issues** (Standard/Large work): one sub-issue per task with native `blocked-by` dependency edges (see `references/issue-tracker.md` → Wayfinding operations), so the tracker mirrors the plan and survives the session. Tiny/Small work skips this ceremony.
7. **Never overwrite the plan:** if `tasks/plan.md` already exists for this issue (resumed work, or a previous session), reconcile — keep completed `[x]` marks, append new tasks, note changed assumptions at the bottom. Overwriting erases session memory.
8. Save the structured plan to `tasks/plan.md` and the checklist to `tasks/todo.md`.

---

<!-- local-only:begin -->
The chat output template for this station is `references/output-template.md`.
Read it before writing your first report.
<!-- local-only:end -->

