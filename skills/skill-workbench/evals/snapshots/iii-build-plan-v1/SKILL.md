---
name: iii-build-plan
description: Station III (Build) — Universal execution orchestrator. Implements tasks from tasks/plan.md using type-aware execution (frontend-ui-engineering, TDD, debug), official docs grounding, atomic commits, and code simplification.
---

# Station III: Build Plan (`iii-build-plan`)

This skill implements **Station III (Build)** of the 8-station pipeline. It works across **any project, language, or repository**, consuming the task plan from `tasks/plan.md` (created in Station II by `ii-plan-issue`) and executing implementation through disciplined type-aware builds, official documentation grounding, incremental commits, and code simplification.

> **Note on Verification:** Final pre-push verification (browser DevTools check for UI or complete test suite run for code) is executed systematically in **Station IV (`iv-review-build-and-pr`)** after multi-axis review and fixes are complete.

## Pipeline Position
- **Station:** Station III of VII
- **Previous Station:** `ii-plan-issue` (Plan)
- **Next Station:** `iv-review-build-and-pr` (Review & Verify)

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
1. **Verify Plan:** Confirm `tasks/plan.md` exists. If missing, halt: "No plan found! Run `/ii-plan-issue` first."
2. **Quality Guardrails:** Respect constraints from `CONSTRAINTS.md` (anti-cheat, forbidden edits, zero regressions).
3. **Route & Invoke Domain Skill:** Inspect the task's domain tag in `tasks/plan.md` and invoke the matching specialized skill:
   - **UI / Frontend / Design:** Activate `frontend-ui-engineering` (and `tailwind-design-system` if applicable). Identify what visual components, styling, or layouts are missing or broken, and implement them across the project according to modern standards.
   - **Code / Backend / API:** Activate `test-driven-development`, `source-driven-development`, and `api-and-interface-design`.
   - **Debug / Defect:** Activate `debugging-and-error-recovery` (investigate root cause before writing fixes).
   - **Performance:** Activate `performance-optimization`.
   - **Security:** Activate `security-and-hardening`.
   - **Docs:** Activate `documentation-and-adrs`.

### Phase 2: Implementation (Type-Aware Build)
- **Code Tasks:** Follow TDD — write minimal clean code to fulfill the requirement.
- **Design & UI Tasks:** Ground styles in existing project tokens and components; implement accessible, responsive UI structure.
- **Official Docs Grounding:** When using modern or external libraries, consult official documentation (`source-driven-development`) to ensure correct API usage.
- **Build Error Resolution:** If compiler, syntax, or import failures occur, apply surgical fixes to restore local compilation.

### Phase 3: Code Simplification & Hygiene
- Run `code-simplification`: remove dead scratch code, prune unnecessary abstractions, and ensure clarity without changing behavior.
- Confirm zero accidental file changes or unneeded package installations.

### Phase 4: Local Commit & Task Mark-Off
- Stage the files touched for this specific task.
- Commit locally: `<type>(<scope>): <summary> (#<issue>)`.
- Mark the task as `[x]` in `tasks/plan.md`.
- Once all tasks are complete, hand off to **Station IV (`iv-review-build-and-pr`)** for code review, final verification, and PR creation.

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

At the conclusion of Station III, you MUST report to the user in clean, everyday Hebrew using this exact structured format:

```markdown
# 🔨 סיכום ביצוע (Build):

### 🛠️ סקילים שהופעלו ומה בוצע בפועל:
* **`[שם הסקיל הראשון, למשל: frontend-ui-engineering]`:** [הסבר קונקרטי: מה היה חסר או שבור, ומה הסקיל תיקן או בנה על פני הפרויקט]
* **`[שם הסקיל השני, למשל: test-driven-development / api-and-interface-design]`:** [מה בוצע באמצעותו: מימוש לוגיקת ה-Backend וכתיבת בדיקות]
* **`code-simplification`:** [מה נוקה ואיך הקוד נשמר רזה ופשוט]

---

### 📂 קבצים ששונו או נוספו:
* `[נתיב לקובץ 1]` — [מה שונה או נוסף בקובץ]
* `[נתיב לקובץ 2]` — [מה שונה או נוסף בקובץ]

---

### 🧠 סיכום:
* **הבעיה שה-Issue הציג:** [תיאור תמציתי בעברית פשוטה: מה היה שבור, חסר או דורש שיפור]
* **מה בוצע כדי לפתור אותה:** [הסבר קצר: מה בדיוק מימשנו בקוד כדי לפתור את הבעיה באופן מלא]

👉 **שלב הבא:** `/iv-review-build-and-pr` — בדיקת קוד, אימות סופי (בדיקת דפדפן / טסטים), דחיפת ענף ופתיחת PR ב-GitHub.
```
