---
name: iii-build-plan
description: Station III (Build) — Universal execution orchestrator. Implements tasks from tasks/plan.md using type-aware execution (frontend-ui-engineering, TDD, debug), official docs grounding, atomic commits, and code simplification.
---

# Station III: Build Plan (`iii-build-plan`)

This skill implements **Station III (Build)** of the 6-station pipeline (numbered stations `i`–`vi`). It works across **any project, language, or repository**, consuming the task plan from `tasks/plan.md` (created in Station II by `ii-plan-issue`) and executing implementation through disciplined type-aware builds, official documentation grounding, incremental commits, and code simplification.

## Pipeline Position
- **Station:** Station III of VI (numbered stations `i`–`vi`)
- **Previous Station:** `ii-plan-issue` (Plan)
- **Next Station:** `quick-fix` (only on a Step 1c divert — which itself requires a `quick-fix`-labeled issue, the gate passing, and the operator's choice) or `iv-review-build-and-pr` (Review & Verify)

---

## 1. Invocation & Execution Modes

This command supports two execution modes:

### Mode A: Full Autonomous Execution (`/iii-build-plan auto` or `/iii-build-plan all`) — Recommended
- Sequentially executes **all tasks in `tasks/plan.md`** one after another.
- Per task: reads domain tag ➔ routes to specialized skill ➔ implements minimal clean code ➔ simplifies code ➔ creates local commit ➔ marks task completed ➔ advances to next task.
- **When does it pause?** Only if a critical compilation blocker occurs or an irreversible/high-risk action requires operator sign-off.

### Mode B: Single Task Execution (`/iii-build-plan`)
- Picks only the **single next open task** from `tasks/plan.md`.
- Implements it, simplifies code, creates a local commit, marks the task `[x]`, and **halts immediately** for inspection.

---

## 2. Per-Task Execution Protocol (Under the Hood)

For every task executed, follow these phases:

### Phase 1: Pre-flight & Specialized Skill Routing
0. **Verify Plan:** Confirm `tasks/plan.md` exists. If missing, halt: "No plan found! Run `/ii-plan-issue` first." Nothing below can run without it.
1. **Preconditions — verify all three before touching a file:**
   1. **Right branch.** Run `git branch --show-current`. You must be on the plan's feature branch (`i<number>/<slug>`). On the base branch, or on a branch that is not the plan's, stop and route to `pipeline-triage` — never start a build on the wrong branch.
   2. **Dirt has a known origin.** Run `git status --short`. Every changed file must trace to the plan's tasks. Foreign or unattributable dirt → stop and route to `pipeline-triage` for the unknown-origin stop rule. Do not absorb another stream's changes into this build, and do not stash them away silently.
   3. **Resume an unfinished plan.** If `tasks/plan.md` has unchecked `[ ]` items, you are resuming. Take the next task from **`tasks/plan.md`** — the single source of truth for completion state. `tasks/todo.md` is a derived checklist, so read it for reporting but never select the next task from it: Phase 4 marks completion in `tasks/plan.md` only, and selecting from the checklist can replay an already-completed task. Never restart a plan from task 1, and never overwrite `tasks/plan.md` (Station II owns reconciliation).
2. **Quality Guardrails:** Respect constraints from `CONSTRAINTS.md` (anti-cheat, forbidden edits, zero regressions).
3. **Rule 0 — simplicity before writing:** for every task, first ask "what is the simplest thing that fully works?" The boring, shortest solution wins; complexity must justify itself before it gets written.
4. **Risk-first order:** follow the plan's task order (risk-first from Station II); when the plan leaves freedom, take the riskiest, most-uncertain task first — while being wrong is still cheap.
5. **Route & Invoke Domain Skill:** Inspect the task's domain tag in `tasks/plan.md` and invoke the matching specialized skill (full matrix in `references/routing.md`):
   - **UI / Frontend / Design:** Activate `frontend-ui-engineering` (and `tailwind-design-system` if applicable). Identify what visual components, styling, or layouts are missing or broken, and implement them across the project according to modern standards.
   - **Code / Backend / API:** Activate `test-driven-development`, `source-driven-development`, and `api-and-interface-design`. When the task is test-writing-heavy, deploy the `tdd-guide` agent persona (from `~/.agents/agents/`): write-tests-first, ~80%+ coverage on touched code. Persona not found on disk → skip and record the skip (never invent — do not invent).
   - **Debug / Defect:** Activate `debugging-and-error-recovery` (investigate root cause before writing fixes).
   - **Performance:** Activate `performance-optimization`.
   - **Security:** Activate `security-and-hardening`.
   - **Docs:** Activate `documentation-and-adrs`.

#### 1c. Quick-Fix Lane Divert (fresh plan only, before the first task runs)

Runs last in Phase 1, once items 1-5 are read: the lane replaces this station, so it only makes
sense **before any task is implemented**. Once the first task is committed locally, finish the
build as planned — a half-built plan shipped straight to `main` is not a quick fix.

The **label precondition** comes first: read the current labels of the issue named in the plan
header (`gh issue view <number> --json labels`). If no issue is linked, or the issue is unlabeled,
skip the gate entirely — continue into Phase 2 and build as planned, with no gate text and no lane
offer.

On a labeled issue with a fresh plan and nothing implemented yet: if every task in `tasks/plan.md`
is XS or S, the plan touches at most 2 files, adds no behavior, and needs no new test — run the
**7-box gate** in `quick-fix`. All 7 pass → offer the operator the lane in one line (push straight
to `main`, no PR, no reviews, no CodeRabbit). **Yes** → hand off to `quick-fix` **with your 7-box
verdict** so it re-checks only size and its own diff, which works on the base branch — switch off
this feature branch first, or the lane's own base-branch precondition fails and it routes to
`pipeline-triage`. **No, or any box fails** → continue into Phase 2 and build as planned, and
remove the label (`gh issue edit <number> --remove-label "quick-fix"`) — a plan being built here
has already disproved the lane.

### Phase 2: Implementation (Type-Aware Build)
- **Code Tasks:** Follow TDD — write minimal clean code to fulfill the requirement. Run only the targeted test file for the touched module during the TDD cycle. Do NOT run the full repository test suite here; full regression testing is deferred to CI on push.
- **Design & UI Tasks:** Ground styles in existing project tokens and components; implement accessible, responsive UI structure.
- **Official Docs Grounding:** When using modern or external libraries, consult official documentation (`source-driven-development`) to ensure correct API usage.
- **Build Error Resolution (ECC resolvers):** If compiler, syntax, or import failures occur, deploy the matching `<stack>-build-resolver` agent persona from `~/.agents/agents/` (`build-error-resolver` generic; `react-build-resolver` / `go-build-resolver` / `rust-build-resolver` when the diff touches React / Go / Rust): minimal diffs only — no architectural edits — get the build green, then resume the task. Persona not found on disk → apply the generic surgical-fix loop and record the skip.
- **NOTICED-BUT-NOT-TOUCHING:** anything spotted mid-build that is out of scope — a bug in adjacent code, a tempting refactor, a quick win — is never touched. Capture it as a one-line future Issue candidate and surface it in the closing report; the operator decides whether it becomes an Issue. Record each candidate as an `open` row in `docs/issues/<id>-noticed-but-not-touching.md` (`N1… | candidate | discovering station | evidence path:line | open | —`); only Station VI (`vi-close-pipeline`) resolves rows.
- **Feature flags / safe defaults / rollback:** for risky behavior changes, prefer a feature flag or a safe default that keeps the old behavior reachable; keep every task rollback-friendly (atomic commits, no destructive data changes without a path back). `git-workflow-and-versioning` governs commit discipline: atomic commits, ~100-line change sizing, commit-as-save-point.
- **Observability touchpoint:** when a task changes production-facing behavior (API responses, background jobs, integrations), add — or note in the report as a follow-up — the instrumentation it needs (structured log, metric) per `observability-and-instrumentation`.

### Phase 3: Code Simplification & Hygiene
- Run `code-simplification`: remove dead scratch code, prune unnecessary abstractions, and ensure clarity without changing behavior.
- Confirm zero accidental file changes or unneeded package installations.

### Phase 4: Local Commit & Task Mark-Off
- Stage the files touched for this specific task.
- Commit locally: `<type>(<scope>): <summary> (#<issue>)`.
- Mark the task as `[x]` in `tasks/plan.md`.
- Once all tasks are complete, hand off to **Station IV (`iv-review-build-and-pr`)** for code review, final verification, and PR creation.

---

## Final check walkthrough (mandatory input to the report)

Build the walkthrough from the live product: real screen names, at most 3 steps, every step is where -> what to do -> what to see. Prefer visual proof. Nothing visual -> say so in one line plus how it was checked automatically.

<!-- local-only:begin -->
The chat output template for this station is `references/output-template.md`.
Read it before writing your first report.
<!-- local-only:end -->

