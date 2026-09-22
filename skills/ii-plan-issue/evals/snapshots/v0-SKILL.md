---
name: ii-plan-issue
description: Station II (Define & Plan) — Universal planning flow. Reads GitHub issue, performs ECC Right-Sizing, auto-detects stack, runs spec-driven-development, locks CONSTRAINTS.md, maps interfaces, generates tasks/plan.md, and recommends iii-build-plan auto.
---

# Station II: Plan Issue (`ii-plan-issue`)

This skill implements **Station II (Define & Plan)** of the 8-station pipeline. It works across **any project, language, or repository**, bridging GitHub issues to an airtight, executable specification and task plan by combining the rigorous discipline of **Addy Osmani's `agent-skills`** with the right-sizing intelligence of **ECC's `orch-pipeline`**.

## Pipeline Position
- **Station:** Station II of VII
- **Previous Station:** `x-workflow-issue` (or `i-create-issue`)
- **Next Station:** `iii-build-plan auto` (Build)

---

## 1. Invocation & Target Issue Discovery

### Option A: Invoked with an Issue Number (e.g. `/ii-plan-issue 42` or `/ii-plan-issue #42`)
1. **Fetch Issue Details:** Run `gh issue view <number> --comments` to read title, body, labels, and all discussion comments.
2. **Claim the Issue:** Run `gh issue edit <number> --add-assignee @me` to signal work has begun.
3. Set this issue as the primary planning target.

### Option B: Invoked Without Arguments (`/ii-plan-issue`)
1. **Fetch All Open Issues:** Run `gh issue list --state open --limit 50`.
2. **Group Logically:** Dynamically identify project areas (by labels or codebase architecture) and evaluate open issues.
3. **Recommend & Automatically Select:** Identify the highest-priority issue (unblockers and core dependencies first, or quick wins). Explicitly state the recommendation and its rationale.
4. **Proceed Immediately:** Do NOT pause to ask. Claim the recommended issue (`gh issue edit <number> --add-assignee @me`) and immediately proceed to Section 2 (Step-by-Step Planning Protocol) on this issue.

---

## 2. Step-by-Step Planning Protocol (Under the Hood)

Once an issue is selected, execute the following protocol strictly in order:

### Step 0: Environment Auto-Detection & Size Classification (ECC Right-Sizing)
1. **Auto-Detect Project Stack:**
   - Detect project language, runtime, and frameworks (Python, Node/TypeScript, Go, Rust, Java, etc.).
   - Detect test runners and test frameworks (`pytest`, `npm test` / `vitest` / `jest`, `cargo test`, `go test`, etc.).
2. **Determine Size Tier:**
   - **Trivial:** A few lines in a single file, no contract/dependency change, zero ambiguity.
   - **Small:** Single file / single function, straightforward logic once code is read.
   - **Standard:** 2–5 files, internal module changes, single architectural decision.
   - **Large:** Cross-cutting repository changes, new external dependency, public API or database schema change.
   - *Requirement:* State the chosen size tier and technical rationale plainly in the output.
3. **Classify Task Type:**
   - Classify the issue into one or more primary categories (combinations allowed, e.g. Design + Code):
     - **Code:** Logic, APIs, data structures, infrastructure (default for most issues).
     - **Design:** UI/UX, layouts, visual styling, user flows, dashboards.
     - **Debug:** Bugs, defect reproduction, broken tests, compilation failures.
     - **Performance:** Bottlenecks, execution times, memory leaks, I/O latency.
     - **Security:** Secret exposure, input sanitization, permissions, OWASP concerns.
     - **Docs:** Documentation, guides, ADRs, explainers (no code behavior changes).
     - **Research:** Open questions, trade-off comparisons, spike prototypes — output is a document/recommendation, not production code.
   - *Requirement:* Pass this classification into `tasks/plan.md` so downstream stations (`iii-build-plan` and `iv-review-build-and-pr`) adjust their reviewers and test suites accordingly.

### Step 1: Assess Need for Interview (`interview-me`)
- Determine whether all requirements, edge cases, and boundaries are 100% clear from the issue.
- **If completely clear:** Do NOT ask synthetic questions. Explicitly note:
  `"Requirements were fully clear from the issue — interview-me was skipped."`
- **If ambiguous or high-stakes trade-offs exist:** Ask 2–3 targeted questions one at a time before locking the plan.

### Step 1.5: Dynamic Skill Routing & Grounding

The agent MUST actively discover and invoke specialized skills suited to the task domain before finalizing the plan. It must not treat all tasks as generic backend code:

| Task Domain | Specialized Planning & Implementation Skills |
|---|---|
| **Design & UI** | **MANDATORY for frontend:** `frontend-ui-engineering` (accessible, responsive, state-aware UI), `modern-web-guidance` (modern web APIs, CSS, component states), `generative_ui` (interactive visual widgets/dashboards), `tailwind-design-system` / `extract-design-system` (design tokens, styling). Ground UI layouts and component hierarchy during planning. |
| **API & Backend** | `api-and-interface-design` (lock type contracts, REST/GraphQL endpoints, public module boundaries), framework/language best practices. |
| **Debug & Bugs** | `debugging-and-error-recovery` (systematic root-cause reproduction: investigate -> analyze -> hypothesize -> fix), `doubt-driven-development` (adversarial review of assumptions). |
| **Performance** | `performance-optimization`, `webperf`, `debug-optimize-lcp` (for web/CWV bottlenecks, N+1 queries, memory leaks). |
| **Security** | `security-and-hardening` (threat modeling, secret detection, OWASP hardening, input sanitization). |
| **Docs** | `documentation-and-adrs` (ADR records, architecture documentation). |
| **Core Logic** | Baseline execution: `test-driven-development`, `source-driven-development`, `incremental-implementation`. |

*Execution Tagging:* In `tasks/plan.md`, each individual task MUST declare its domain tag (e.g. `[Design/UI]`, `[Backend/Logic]`, `[Debug]`) and explicitly prescribe the skill and verification mode `iii-build-plan` will execute (e.g., browser preview verification for UI tasks; unit/integration test runner for logic tasks).

### Step 2: Specification Formulation (`spec-driven-development`)
- For **Standard / Large** tasks: Create or update `SPEC.md` in the project root defining goals, acceptance criteria, edge cases, and explicit out-of-scope boundaries.
- For **Small / Trivial** tasks: Embed a concise specification section directly into the plan summary.

### Step 3: Lock Quality Guardrails (`constraint-driven-development`)
- Create or update `CONSTRAINTS.md` in the project root with strict, measurable boundaries:
  - **Zero Regressions:** Targeted test suites matching modified files must pass; all new behaviors require tests. (Avoid prescribing full-repo test sweeps locally; full regression is gated by CI on push).
  - **Performance Thresholds:** Explicit latency, memory, or runtime ceilings if applicable.
  - **Anti-Cheat:** Strictly forbid disabling tests, deleting assertions, or suppressing linter checks.
  - **Dependencies:** Prohibit adding new external dependencies without explicit approval.

### Step 4: Define API Contracts & Signatures (`api-and-interface-design`)
- Lock types, data schemas, public function signatures, and communication contracts before writing business logic.

### Step 5: Think Outside the Box — Improvement Pass
- Before locking the plan, propose one concrete, high-value improvement to the issue's approach (a architectural simplification, handling a forgotten edge case, or fitting existing codebase patterns better).
- Present it clearly: what it alters, why it fits this repo, and what it achieves.
- The operator decides: adopt, defer, or drop. **Never fold it in silently without confirmation.**

### Step 6: Task Decomposition (`planning-and-task-breakdown`)
- Save the structured plan to `tasks/plan.md` and task checklist to `tasks/todo.md`.
- Break work into atomic, vertical slices (5–10 minute chunks):
  - Each task defines: Task ID, domain tag (`[Design/UI]`, `[Backend]`, etc.), target files, concise description of what is built, assigned helper skill, and explicit verification method (browser check or automated test).

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

At the conclusion of Station II, you MUST report to the user in clean, everyday Hebrew using this exact structured format:

```markdown
# 📐 סיכום תכנון (Issue #<id>):

### 🎯 סיווג ומחסנית טכנולוגית:
* **סיווג וגודל:** [Small / Standard / Large] | סוג: [Code / UI & Design / Debug / Performance / Security]
* **מחסנית וסביבת בדיקות שזוהו:** [שפת פרויקט, Framework וסוויטת טסטים]
* **ספי איכות שננעלו ב-`CONSTRAINTS.md`:**
  - אפס רגרסיות (Zero Regressions) לטסטים קיימים.
  - [ספי ביצועים או זמני ריצה ספציפיים אם הוגדרו].
  - איסור מוחלט על עקיפת טסטים (`skip`/`disable`).

### 🛠️ סקילים ומנועים שהופעלו בתכנון (והוכנו לביצוע):
* **תכנון וארכיטקטורה:** `spec-driven-development`, `constraint-driven-development`, `api-and-interface-design`, `planning-and-task-breakdown`
* **UI ועיצוב (Design):** [אם המשימה קשורה ל-UI: ציון סקילים ייעודיים כגון `frontend-ui-engineering`, `modern-web-guidance`, `tailwind-design-system`, `generative_ui` | אם אינו קשור ל-UI: "לא רלוונטי למשימה זו (לוגיקה/Backend בלבד)"]
* **אימות ותשאול (`interview-me`):** [האם נשאלו שאלות הבהרה, או שהדרישות ב-Issue היו סגורות לחלוטין]

### 📑 משימות לביצוע מתוך `tasks/plan.md`:
1. `[משימה 1]` — [תיאור תמציתי של מה עושים ובאילו קבצים]
2. `[משימה 2]` — [תיאור תמציתי של מה עושים ובאילו קבצים]
3. `[משימה 3]` — [תיאור תמציתי של מה עושים ובאילו קבצים]

*(אם הוצע שיפור מחוץ לקופסה)*:
* **💡 שיפור ארכיטקטוני מוצע:** [פירוט הרעיון ולמה הוא מייעל את הקוד].

---

### 📊 קבצים וארטיפקטים שנוצרו:
* **תוכנית עבודה:** `tasks/plan.md`
* **חוזה מגבלות איכות:** `CONSTRAINTS.md` (ו-`SPEC.md` אם נדרש מפרט רחב)

### 🧠 סיכום:
בשורות בודדות בעברית פשוטה: מה הבעיה שה-Issue תיאר, מה תמצית הגישה ההנדסית שנבחרה לפתרון, ואיך היא מגנה על המערכת מפני תקלות.

👉 **שלב הבא:** `/iii-build-plan auto` — מעבר לתחנת הבנייה! מריץ את כל המשימות ברצף ב-TDD (אדום-ירוק), מוודא אימות ומייצר קומיט אטומי לכל שלב.
```
