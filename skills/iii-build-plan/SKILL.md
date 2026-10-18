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
   1. **Right branch.** Run `git branch --show-current`. You must be on the plan's feature branch (`i<number>/<slug>`). On the base branch, or on a branch that is not the plan's, stop and route to `pipeline-triage` — never start a build on the wrong branch. When the repo isolates issue work in worktrees, also confirm you are inside the issue's worktree (`git worktree list`), not the main checkout — building in the main checkout edits the operator's live tree and collides with other sessions' writers.
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
header (`gh issue view <number> --json labels`). If no issue is linked, or the issue does not carry the `quick-fix` label,
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
- **Cross-platform test pitfalls — decide these before writing the first assertion, not after a red run:**
  - **Platform-gated OS calls must be gated in the product too, not only in the test.** When a test host's platform lacks a call the code needs (`os.WNOHANG` and `os.waitpid` do not exist on Windows; `os.getpgid`/`os.killpg` are POSIX-only), gate the call behind a `sys.platform` / `hasattr` check in the code so the same test runs green on every host, and make any test that can only exercise the POSIX path assert conditionally on `hasattr(os, "WNOHANG")` rather than expecting it to fire everywhere. A test that passes only on one OS fails CI on the other.
  - **Mock a fake clock with an object, never a finite iterator.** A time-dependent loop (`while time.monotonic() < deadline`) needs the mock to answer every call; a `times = iter([...]); lambda: next(times)` raises `StopIteration` the moment the loop polls more often than the fixture predicted. Use a small clock object whose `monotonic()` advances by a fixed step each call, or a mutable `now` the mock updates, so the loop terminates by exhausting its deadline instead of exhausting the iterator.
  - **Unpack recorded tuples before transforming them.** Distinguish records shaped as `(argv, kwargs)` where `argv` is already a list from mock calls where `args` is a positional tuple `(cmd, *rest)`. When iterating `(argv, _)` records, access `argv` directly; if accessing a mock's `args[0]`, verify it is a list before `" ".join(...)` — otherwise joining a command string silently char-joins individual characters. Explicitly unpack and check field shape so mismatches fail loudly instead of producing assertions that can never fail.
  - **Find the project's runnable test command before the first red run.** The interpreter first on PATH is not always the project's: a `python -m pytest` that dies with "No module named pytest" means the project's environment lives behind its own runner (e.g. `uv run pytest` in a uv-managed repo). Probe once (`uv run pytest --collect-only -q` or the manifest's documented command) and use that command for the whole TDD cycle — never conclude "tests cannot run" from the bare interpreter.
  - **After changing renderer output, sweep the sibling suites that render the same component.** "Targeted" means the touched module's tests, but sibling suites pin rendered strings: axis labels, badge wording, bar counts. A UI fix that changes one label fails those suites too, and their failures are the pins of the old (defective) behavior — repin them to the new expected output in the same change, with a comment naming why the old pin was wrong.
  - **Derive fixture assertions from the fixture's actual rows, not the ticket's summary of it.** A ticket saying "fills land around 43%–52%" may describe one scenario while the fixture also fills elsewhere (rescue and single-leg scenarios). Assert `any(...)`/`at-least` unless the fixture is genuinely uniform — an `all(...)` over a range read off a summary red-fails on data the summary never mentioned.
  - **A stub-DOM harness cannot set module-local state through `module.exports`.** When a harness evaluates bundled page JS in a `new Function` scope, the renderer reads `let` bindings private to that scope; assigning `app.someFlag` on the exports object is dead code. Inject the state by appending the assignment to the evaluated source itself (`source += ";currentMetric = 'x';"` before the `new Function` call) so it lands in the same scope the renderer reads.
- **Deletion tasks: cut at the last reference, not the first.** A flag, field, or function
  removed at its definition site often has a second consumer deeper in the same function or
  module. Grep the whole tree for every reference before cutting, or the targeted suite dies
  with a NameError on a line you never read. For a whole-path removal, enumerate the entry
  points from the callers' side (`grep -rn <symbol>`) before touching any definition. The
  grep must cover the edited files themselves, not just callers elsewhere: a surviving
  reference inside the same function fails at call time, so an import smoke test passes while
  the suite dies. After cutting, grep each edited file for every removed identifier before
  running tests. Grep imports by BARE NAME with word boundaries on lines containing the word
  import (`grep -rnE "\b<name>\b" --include="*.py" | grep -i import`), never by a
  phrase-shaped pattern like `from X import name`: a phrase only matches when the name sits
  adjacent to `import`, and a multi-name import (`from X import a, name, b`) hides the
  deleted module from every phrase grep — the miss surfaces later as an ImportError in a CI
  shard, not locally. Before Station IV on a module-wide deletion, run the FULL suite
  locally once: CI shards split the test tree, so the focused subset you ran proves nothing
  about shards you did not run, and a single missed importer red-fails a shard while every
  local focused run was green.
- **A suite that pins behavior through the deleted vehicle is adapted, not deleted.**
  Deleting a code path must not delete its coverage: when the only way a test exercised
  generic behavior was through the removed vehicle (a removed-strategy fixture driving
  generic exit logic), move the test onto the surviving path with the same assertions,
  renamed to the surviving vocabulary. Deleting the test loses the regression pin; keeping
  the vehicle keeps the dead code.
- **Renames: replace the bare identifier, then grep for leftovers.** Renaming a symbol's
  definition line (`NAME = value`) does not rename its usages, and occurrences inside longer
  string literals do not match a quoted-literal pattern. Replace the bare identifier
  everywhere, then grep the file for the old name — including inside composite strings —
  before running the suite.
- **Scripted exact-match edit passes for multi-region deletions.** When one task deletes or
  rewrites many regions across several files, run one scripted pass (a single code-execution
  block) that applies every old→new replacement with an assertion that each matched exactly
  once, preserving each file's line endings (read bytes, normalize, replace, write back with
  the original ending). Sequential `patch` calls to the same file can race; one scripted pass
  is atomic per file, and the exact-once assertion catches both stale text (zero matches) and
  ambiguous text (multiple matches) before anything is written.
- **Red-by-design tests: the red output IS the deliverable.** When the locked contract makes a test deliberately red (a guard that fails until later tasks move the consumers), run it, capture the offender list verbatim — path, line, trimmed source line — into `tasks/plan.md` as the downstream work order, and never widen scope to turn it green; greening belongs to the task that owns the moves. When the task builds a test that scans the repo's own source (a no-drift guard), load `source-scanning-guard-tests` for the scanner-design pitfalls.
- **Design & UI Tasks:** Ground styles in existing project tokens and components; implement accessible, responsive UI structure.
- **Official Docs Grounding:** When using modern or external libraries, consult official documentation (`source-driven-development`) to ensure correct API usage.
- **Build Error Resolution (build resolvers):** If compiler, syntax, or import failures occur, deploy the matching `<stack>-build-resolver` agent persona from `~/.agents/agents/` (`build-error-resolver` generic; `react-build-resolver` / `go-build-resolver` / `rust-build-resolver` when the diff touches React / Go / Rust): minimal diffs only — no architectural edits — get the build green, then resume the task. Persona not found on disk → apply the generic surgical-fix loop and record the skip.
- **NOTICED-BUT-NOT-TOUCHING:** anything spotted mid-build that is out of scope — a bug in adjacent code, a tempting refactor, a quick win — is never touched. Capture it as a one-line future Issue candidate and surface it in the closing report; the operator decides whether it becomes an Issue. Record each candidate as an `open` row in `docs/issues/<id>-noticed-but-not-touching.md` (`N1… | candidate | discovering station | evidence path:line | open | —`); only Station VI (`vi-close-pipeline`) resolves rows. A noticed item that blocks a downstream task's promised end state — a scanner false positive that keeps a guard red, a missing fixture the next task needs — is not a passive row: surface it as a headline operator decision in the closing report, with the recommended fix, because the pipeline cannot reach green until it is resolved.
- **Feature flags / safe defaults / rollback:** for risky behavior changes, prefer a feature flag or a safe default that keeps the old behavior reachable; keep every task rollback-friendly (atomic commits, no destructive data changes without a path back). `git-workflow-and-versioning` governs commit discipline: atomic commits, ~100-line change sizing, commit-as-save-point.
- **Observability touchpoint:** when a task changes production-facing behavior (API responses, background jobs, integrations), add — or note in the report as a follow-up — the instrumentation it needs (structured log, metric) per `observability-and-instrumentation`.

### Phase 3: Code Simplification & Hygiene
- Run `code-simplification`: remove dead scratch code, prune unnecessary abstractions, and ensure clarity without changing behavior.
- Confirm zero accidental file changes or unneeded package installations.

### Phase 4: Local Commit & Task Mark-Off
- Stage the files touched for this specific task.
- Commit locally: `<type>(<scope>): <summary> (#<issue>)`.
- Mark the task as `[x]` in `tasks/plan.md`.
- **Disclose deviations from the locked plan in the station report.** When the build merged two planned tasks into one commit (interleaved regions in one file), skipped a planned edit on purpose, or otherwise diverged from `tasks/plan.md`, name the deviation and its reason in the closing report — Station IV reviews the diff against the plan, and an undisclosed deviation reads as drift.
- Once all tasks are complete, hand off to **Station IV (`iv-review-build-and-pr`)** for code review, final verification, and PR creation.

---

## Final check walkthrough (mandatory input to the report)

Pre-IV verification gate — after the build, guide the operator through seeing the change with their own eyes so they can catch anything to iterate on via `/iiib-iterate-after-build` before advancing to Station IV. Build the walkthrough from the live product: name the real screen / tab / button, use as many short steps as it takes for clarity — no step cap — each step one quick action in the shape where → what to do → what to see, with `→` arrows and a direct link when one exists. Plain words, no jargon. Say exactly what to look at (text, state, count). Prefer visual proof. Backend-only with nothing to see → one line saying so plus how it was checked automatically.

<!-- local-only:iii-build-plan:output-template-begin -->
The chat output template for this station is `references/output-template.md`.
Read it before writing your first report.
<!-- local-only:iii-build-plan:output-template-end -->

