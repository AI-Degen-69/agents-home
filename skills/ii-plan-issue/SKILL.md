---
name: ii-plan-issue
description: Station II (Define & Plan) of the 8-station pipeline. Use when a GitHub issue needs to become an executable plan — fetches the issue via gh, right-sizes it, locks CONSTRAINTS.md, maps interfaces, writes tasks/plan.md, and hands off to /iii-build-plan auto. Reports in Hebrew, issue-first.
---

# Station II: Plan Issue (`ii-plan-issue`)

This skill implements **Station II (Define & Plan)** of the 8-station pipeline. It works across **any project, language, or repository**, bridging a GitHub issue to an airtight, executable specification and task plan (discipline from Addy Osmani's agent-skills collection, right-sizing from ECC's orchestrator approach).

**Prime directive:** the issue being planned is the star of the show. Planning machinery (skills, steps, contracts) is scaffolding — it lives in `tasks/plan.md`, never as the headline of the reply.

## Pipeline Position
- **Station:** II of the 8-station pipeline
- **Previous Station:** `x-workflow-issue` (or `i-create-issue`)
- **Next Station:** `iii-build-plan auto` (Build)

---

## 1. Invocation & Target Issue Discovery

### Option A: Invoked with an Issue Number (e.g. `/ii-plan-issue 42`)
1. **Fetch Issue Details:** Run `gh issue view <number> --comments` — title, body, labels, and all discussion comments.
2. **Claim the Issue:** Run `gh issue edit <number> --add-assignee @me` to signal work has begun.
3. Set this issue as the primary planning target.

### Option B: Invoked Without Arguments (`/ii-plan-issue`)
1. **Fetch All Open Issues:** Run `gh issue list --state open --limit 50`.
2. **Group Logically:** Identify project areas (labels or codebase architecture).
3. **Recommend exactly one issue:** highest-priority first (unblockers and core dependencies, then quick wins), with a one-line rationale.
4. **Proceed immediately — do not pause to ask.** Claim the recommended issue (`gh issue edit <number> --add-assignee @me`) and go straight to Section 2 on it.

### If `gh` fails (not authenticated, offline, or issue not found)
Stop the issue-dependent steps. Say in plain language exactly what failed, and ask the user for the issue number/title (or to run `gh auth login`). **Never fabricate issue content and never plan from imagined data (אין להמציא תוכן).**

---

## 2. Step-by-Step Planning Protocol (strict order)

### Step 0: Environment Auto-Detection & Size Classification (ECC Right-Sizing)
1. **Auto-detect stack:** language, runtime, frameworks, and the test runner (`pytest`, `vitest`/`jest`, `cargo test`, `go test`, ...).
2. **Size tier** — state the tier plus a one-line rationale in the output:
   - **Tiny** — docs/typo/comment-level change; no code behavior change; zero ambiguity.
   - **Small** — one file or one function; straightforward once the code is read.
   - **Standard** — 2–5 files, internal module changes, a single architectural decision.
   - **Large** — cross-cutting changes, a new external dependency, public API or database schema change.
3. **Task type** — classify into one or more primary categories (combinations allowed): **Code** (default), **Design**, **Debug**, **Performance**, **Security**, **Docs**, **Research**. Classify *before* planning: downstream stations (`iii-build-plan`, `iv-review-build-and-pr`) pick reviewers and test suites from this tag.

### Step 0A: Resolve Open Questions from Code (needs-answers flag)
If the issue carries the `needs-answers` label or an **Open questions** section:
1. For each open question, first try to resolve it **from the code** — read the relevant paths, check how similar cases are handled in the repo.
2. Fold each resolved answer into the plan as planning input; record the resolved answers in `tasks/plan.md` so the reasoning survives the session.
3. Ask the operator **only what is genuinely unresolvable from code** — one focused batch, before Step 1. Never re-ask what the issue already answers.
4. **Large or unfamiliar/legacy code:** before answering, deploy the `code-explorer` agent persona (from `~/.agents/agents/`) to trace the relevant execution paths and map the affected architecture layers; fold its findings into the plan. Persona file not found on disk → skip and record the skip — never simulate a missing reviewer persona (אין להמציא).

### Step 1: Domain Skill Routing
Load specialized skills that match the classified task type (and only skills that actually exist in the environment — verify before naming any skill):

| Task type | Planning skills |
|---|---|
| Design/UI | `frontend-ui-engineering`, `tailwind-design-system`, `extract-design-system` |
| API/Backend | `api-and-interface-design` |
| Debug | `debugging-and-error-recovery`, `doubt-driven-development` |
| Performance | `performance-optimization` |
| Security | `security-and-hardening` |
| Docs | `documentation-and-adrs` |
| Research | `idea-refine` (spike → recommendation doc) |
| Core (default) | `test-driven-development`, `incremental-implementation` |

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
1. **Ground it in evidence:** quote the motivating evidence **verbatim** — the exact issue text, issue comment, or code lines — not just a file/line pointer. **No evidence ⇒ no proposal**; never invent filler to satisfy this step; say so and skip instead (אין להמציא).
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

## Hebrew Chat Output Contract (חובת דיווח בעברית)

Rules:
- **The issue leads.** Open with the issue and its plan; classification and guardrails get one compact line each. Never enumerate skills or planning steps in the chat report — skill names live in `tasks/plan.md` rows.
- Everyday Hebrew, short sentences, only claims grounded in the issue and code — never fabricate.
- The report adapts by task type: Design leads with UI decisions, Debug with the reproduction hypothesis, Docs with the outline, Code with the approach.
- "מה ה-Issue דורש" is short bullets quoting what the issue describes; the plan bullets say how each task answers it; "איך מוודאים?" replaces quality-guardrail talk with plain verification of the issue's problem.
- The improvement proposal is one plain sentence, evidence-based, adopted by default — dropped only on explicit operator rejection.
- Drop any section that carries nothing for this issue.

```markdown
# 📐 Issue #<מספר>: <כותרת ה-Issue>

## מה ה-Issue דורש
- [נקודה 1 במילים פשוטות — מה ה-issue מתאר]
- [נקודה 2]
- [נקודה 3 אם יש — קצר, בנקודות]

## התוכנית
- [משימה 1 בשפה פשוטה — מה נבנה ואיך זה עונה לנקודה הרלוונטית מה-issue] · אימות: [טסט/בדיקת דפדפן]
- [משימה 2 — ...]
- [משימה 3 — ...]
*(התוכנית מסתגלת לפי סוג המשימה — Design/Debug/Docs מקבלים דגשים שונים)*

## איך מוודאים?
- [איך התוכנית מוכיחה שמה שנבנה עונה לבעיה שה-issue מתאר — טסטים ממוקדים, בדיקת דפדפן, סף ביצועים]
- אפס רגרסיות לטסטים קיימים · אין עקיפת טסטים

## קבצים
tasks/plan.md · CONSTRAINTS.md · [SPEC.md רק ל-Standard/Large]

💡 [הצעת שיפור אחת, משפט אחד בשפה פשוטה — מבוססת ראיות מה-issue ומהקוד; מאומצת כברירת מחדל, יורדת רק אם נדחית]

👉 הבא: `/iii-build-plan auto`
```
