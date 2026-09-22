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

### Step 1: Clarity Gate (`interview-me`) — hard gate
- **Requirements 100% clear from the issue:** skip the interview and say so in one line of the report ("הדרישות היו ברורות לחלוטין — דולג על תשאול").
- **Ambiguous, or high-stakes trade-offs:** ask 2–3 targeted questions, one at a time, **before** writing SPEC.md / CONSTRAINTS.md / plan. A confident-looking plan locked on a guess is expensive waste — never lock first and ask later.

### Step 1.5: Domain Skill Routing
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

### Step 5: One Improvement Proposal (outside the box)
Propose **exactly one** concrete, high-value improvement to the issue's approach — an architectural simplification, a forgotten edge case, or a better fit to existing repo patterns. Present what it changes and why it pays off. The operator decides: adopt, defer, or drop. **Never fold it in silently.** If nothing genuinely valuable surfaced, say so and skip — do not invent filler.

### Step 6: Task Decomposition (`planning-and-task-breakdown`)
Save the structured plan to `tasks/plan.md` and the checklist to `tasks/todo.md`. Atomic vertical slices, 5–10 minutes each. Every task defines: Task ID, domain tag, target files, concise description of what is built, assigned helper skill, and explicit verification method (browser check or automated test).

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

Rules:
- **The issue leads.** Open with the issue and its plan; classification and guardrails get one compact line each. Never enumerate skills or planning steps in the chat report — skill names live in `tasks/plan.md` rows.
- Everyday Hebrew, short sentences, only claims grounded in the issue and code — never fabricate.
- The report adapts by task type: Design leads with UI decisions, Debug with the reproduction hypothesis, Docs with the outline, Code with the approach.
- Drop any section that carries nothing for this issue.

```markdown
# 📐 Issue #<מספר>: <כותרת ה-Issue>

### מה ה-Issue דורש
[1–3 שורות בעברית פשוטה: מה הבעיה ומה נדרש — במונחים של המשתמש, לא בז'רגון של הקוד]

### התוכנית
1. [משימה 1] — [מה נבנה ובאילו קבצים] · אימות: [טסט/בדיקת דפדפן]
2. [משימה 2] — ...
3. [משימה 3] — ...
*(התוכנית מסתגלת לפי סוג המשימה — Design/Debug/Docs מקבלים דגשים שונים)*

### סיווג
[Small/Standard/Large] | [Code/Design/Debug/Performance/Security/Docs] | [שפה + Framework + סוויטת טסטים] | [תשאול: בוצע/דולג כי הדרישות ברורות]

### גבולות איכות (CONSTRAINTS.md)
אפס רגרסיות לטסטים קיימים · אין עקיפת טסטים · [ספי ביצועים אם הוגדרו]

### קבצים
tasks/plan.md · CONSTRAINTS.md · [SPEC.md רק ל-Standard/Large]

*(אם הוצע שיפור)* 💡 [הרעיון בשורה-שתיים ולמה הוא משתלם — מחכה להחלטתך]

👉 הבא: `/iii-build-plan auto`
```
