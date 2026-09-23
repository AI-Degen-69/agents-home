---
name: iii-build-plan
description: Station III (Build) — Universal execution orchestrator. Implements tasks from tasks/plan.md using type-aware execution (frontend-ui-engineering, TDD, debug), official docs grounding, atomic commits, and code simplification.
---

# Station III: Build Plan (`iii-build-plan`)

This skill implements **Station III (Build)** of the 6-station pipeline (numbered stations `i`–`vi`). It works across **any project, language, or repository**, consuming the task plan from `tasks/plan.md` (created in Station II by `ii-plan-issue`) and executing implementation through disciplined type-aware builds, official documentation grounding, incremental commits, and code simplification.

## Pipeline Position
- **Station:** Station III of VI (numbered stations `i`–`vi`)
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
3. **Rule 0 — simplicity before writing:** for every task, first ask "what is the simplest thing that fully works?" The boring, shortest solution wins; complexity must justify itself before it gets written.
4. **Risk-first order:** follow the plan's task order (risk-first from Station II); when the plan leaves freedom, take the riskiest, most-uncertain task first — while being wrong is still cheap.
5. **Route & Invoke Domain Skill:** Inspect the task's domain tag in `tasks/plan.md` and invoke the matching specialized skill (full matrix in `references/routing.md`):
   - **UI / Frontend / Design:** Activate `frontend-ui-engineering` (and `tailwind-design-system` if applicable). Identify what visual components, styling, or layouts are missing or broken, and implement them across the project according to modern standards.
   - **Code / Backend / API:** Activate `test-driven-development`, `source-driven-development`, and `api-and-interface-design`. When the task is test-writing-heavy, deploy the `tdd-guide` agent persona (from `~/.agents/agents/`): write-tests-first, ~80%+ coverage on touched code. Persona not found on disk → skip and record the skip (never invent — אין להמציא).
   - **Debug / Defect:** Activate `debugging-and-error-recovery` (investigate root cause before writing fixes).
   - **Performance:** Activate `performance-optimization`.
   - **Security:** Activate `security-and-hardening`.
   - **Docs:** Activate `documentation-and-adrs`.

### Phase 2: Implementation (Type-Aware Build)
- **Code Tasks:** Follow TDD — write minimal clean code to fulfill the requirement.
- **Design & UI Tasks:** Ground styles in existing project tokens and components; implement accessible, responsive UI structure.
- **Official Docs Grounding:** When using modern or external libraries, consult official documentation (`source-driven-development`) to ensure correct API usage.
- **Build Error Resolution (ECC resolvers):** If compiler, syntax, or import failures occur, deploy the matching `<stack>-build-resolver` agent persona from `~/.agents/agents/` (`build-error-resolver` generic; `react-build-resolver` / `go-build-resolver` / `rust-build-resolver` when the diff touches React / Go / Rust): minimal diffs only — no architectural edits — get the build green, then resume the task. Persona not found on disk → apply the generic surgical-fix loop and record the skip.
- **NOTICED-BUT-NOT-TOUCHING:** anything spotted mid-build that is out of scope — a bug in adjacent code, a tempting refactor, a quick win — is never touched. Capture it as a one-line future Issue candidate and surface it in the closing report; the operator decides whether it becomes an Issue.
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

## Hebrew Chat Output Contract (חובת דיווח בעברית)

At the conclusion of Station III, you MUST report to the user in clean, everyday Hebrew using this exact structured format.
Part A (what to check yourself) adapts to what was actually built — pick 2-3 checks, never a fixed list.
Part B (the two paths + router) is always shown in full, with every skill in backticks except the dead-button row, which is routed automatically inside the router skill.

```markdown
# 🔨 III - בנייה (סיכום ביצוע):

## 🎨 מה נבנה — מבט ויזואלי:
[הצג כאן ויזואלית מה נבנה בצ'אט — טבלה / דיאגרמה / תרשים זרימה / צורות, כל דבר שמתאים ויעזור להסבר. דוגמאות: טבלת לפני ← אחרי, תרשים זרימה של המהלך, מבנה המסך או הרכיבים. חובה להתאים את הויזואל לתוכן — לא למלא בכוח]

## 🛠️ סקילים שהופעלו ומה בוצע בפועל:
* **`[שם הסקיל הראשון, למשל: frontend-ui-engineering]`:** [הסבר קונקרטי: מה היה חסר או שבור, ומה הסקיל תיקן או בנה על פני הפרויקט]
* **`[שם הסקיל השני, למשל: test-driven-development / api-and-interface-design]`:** [מה בוצע באמצעותו: מימוש לוגיקת ה-Backend וכתיבת בדיקות]
* **`code-simplification`:** [מה נוקה ואיך הקוד נשמר רזה ופשוט]

---

## 🧠 סיכום תמציתי:
* **הבעיה:** [משפט אחד פשוט: מה היה שבור או חסר]
* **איך הבנייה פתרה אותה:** [משפט אחד פשוט: מה נבנה ואיך זה פותר]

---

## 👀 מה לבדוק בעצמך:
[2-3 בדיקות לפי מה שנבנה בפועל — נבנה כפתור/טופס: ללחוץ ולוודא תוצאה. נבנה מסך: מובייל ומסך גדול. נבנתה לוגיקה: תוצאה נכונה ובלי שגיאה. שונה קוד קיים: מה שעבד קודם עדיין עובד]

## 👉 לאן ממשיכים — שני נתיבים:
* **הכל טוב, אין הערות** -> `/iv-review-build-and-pr` — סקירה, אימות סופי, דחיפת ענף ופתיחת PR.
* **יש הערה / באג / שינוי** -> `/iiib-iterate-after-build` + תיאור חופשי במילים שלך. הוא מנתב לבד ומתקן מקומית בלי push:
  - באג / שגיאה -> `diagnosing-bugs` + `debugging-and-error-recovery`
  - כפתור מת בלי שגיאה -> `click-path-audit`
  - עיצוב / מובייל -> `frontend-ui-engineering`
  - איטי -> `performance-optimization`
  - אבטחה -> `security-and-hardening`
```
