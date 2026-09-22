---
name: iv-review-build-and-pr
description: Station IV (Review, Verify & Ship) — Universal shipping flow. Automatically discovers matching ECC language/framework reviewers, runs multi-axis review, applies fixes, executes full post-review verification (browser or test suite), pushes branch, and opens GitHub PR with @coderabbitai summary.
---

# Station IV: Review, Verify & PR (`iv-review-build-and-pr`)

This skill implements **Station V (Review, Final Verification & Ship)** of the 8-station pipeline. It works across **any project, language, or repository**, taking code completed in Station III (`iii-build-plan`), dynamically discovering and deploying language/framework specialist reviewers, applying fixes, enforcing the **Final Pre-Push Verification Gate** (live browser verification for UI or full regression test suite for backend), pushing to origin, opening a Pull Request linked to the issue, and recommending `v-babysit-pr-and-merge`.

## Pipeline Position
- **Station:** Station IV of VII
- **Previous Station:** `iii-build-plan` (Build)
- **Next Station:** `v-babysit-pr-and-merge` (Babysit & Merge)

---

## 1. Invocation

```bash
/iv-review-build-and-pr    # Runs multi-axis review, fix application, final verification, push, and PR opening
```

---

## 2. Protocol Under the Hood

### Step 1: Dynamic Reviewer Discovery & Multi-Axis Review
Inspect the diff (`git diff --name-only origin/<base>...HEAD`) and discover matching specialized reviewers from the project's agent repository (`.agents/agents/`, `~/.agents/`, or builtins):

1. **General Code Quality (`code-review-and-quality`):**
   - Check diff clarity, clean naming, absence of dead code, and adherence to project patterns.
2. **Security & Hardening (`security-and-hardening` / `security-reviewer`):**
   - Audit all new inputs, secrets, session boundaries, and dependency vulnerabilities.
3. **Dynamic Language & Framework Specialists (Auto-Detected from Diff):**
   - **Python files modified (.py):** Deploy `python-reviewer` (asyncio patterns, type hinting, PEP 8, memory leaks). If FastAPI/Django touched: add `fastapi-reviewer` or `django-reviewer`.
   - **TypeScript / JavaScript files modified (.ts, .tsx, .js):** Deploy `typescript-reviewer` (type safety, async handling, modularity). If React/Vue touched: add `react-reviewer` or `vue-reviewer`.
   - **Rust files modified (.rs):** Deploy `rust-reviewer` (lifetimes, unsafe blocks, concurrency, borrowing).
   - **Go files modified (.go):** Deploy `go-reviewer` (goroutines, error handling, interface boundaries).
   - **Database / Schema files touched (.sql, ORM models):** Deploy `database-reviewer` (N+1 queries, indexes, migrations).
   - **CSS / UI Components touched:** Deploy `a11y-architect` (accessibility, ARIA roles, contrast).
4. **Test Engineering Audit (`test-engineer`):**
   - Verify that test assertions test real domain behavior and edge cases, not hollow mocks.

### Step 2: Apply Review Fixes Locally
- For any actionable findings (nits, type errors, edge-case risks):
  - Apply minimal, clean fixes directly to the local codebase.
  - Create a clean fix commit: `fix(review): address review feedback`.

### Step 3: Final Post-Review Verification Gate (MANDATORY)
**Before any code is pushed or a PR is opened, the entire change must be verified post-fixes:**

1. **For Frontend / Web / UI Changes:**
   - **Browser Verification:** Spin up preview server if needed and inspect via Chrome DevTools MCP or browser testing tools.
   - Verify visual layout, responsive behavior, and confirm the browser console has **zero uncaught errors, warnings, or failed network requests**.
2. **For Backend / API / Logic Changes:**
   - Run targeted test suites matching modified files (e.g. `pytest tests/test_<module>.py`) to confirm zero regressions in touched modules. Avoid running the full repository test suite locally (>10s); GitHub CI runs the full regression suite on push as the merge gate.
   - Run `verification-before-completion` to guarantee all acceptance criteria from the issue remain 100% satisfied.
3. **Only when verification is completely green** may the agent proceed to Git push.

### Step 4: Git Synchronization & Push (`git-workflow-and-versioning`)
- Confirm active on a dedicated feature branch (never push directly to `master`/`main`).
- Fetch and merge latest base branch:
  ```bash
  git fetch origin <base> && git merge origin/<base> --no-edit
  ```
- Push branch to remote:
  ```bash
  git push -u origin <branch-name>
  ```

### Step 5: Open Pull Request & Trigger Review
- Create PR via GitHub CLI:
  ```bash
  gh pr create --title "<type>(<scope>): <summary>" --body "## Summary`n...`n`nCloses #<issue>`n`n@coderabbitai summary"
  ```
- Immediately post the review trigger comment:
  ```bash
  gh pr comment <pr_number> --body "@coderabbitai review"
  ```
- **Handoff:** Conclude Station IV and recommend `v-babysit-pr-and-merge`.

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

At the conclusion of Station IV, you MUST report to the user in clean, everyday Hebrew using this exact structured format:

```markdown
# 🚢 סיכום Review & PR:

### 🔍 סוקרים שגוייסו דינמית וממצאים:
* **סוקר שפה/פריימוורק:** [`python-reviewer` / `typescript-reviewer` / `database-reviewer` וכד' שנבחר לפי ה-diff] — [תמצית ממצאים]
* **איכות וקריאות (`code-review-and-quality`):** [תמצית קצרה]
* **אבטחה והרשאות (`security-and-hardening`):** [תמצית בדיקת אבטחה]
* **בקרת איכות טסטים (`test-engineer`):** [תמצית איכות הבדיקות]
* **תיקונים שבוצעו בפועל (Fixes Applied):**
  - [פירוט התיקונים שהוחלו בעקבות הסקירה ולמה הם תוקנו]

---

### 🛠️ סקילים ומנועים שהופעלו בתחנה IV:
* **סקירה רב-צירית:** גיוס דינמי של סוקרים לפי קבצי ה-diff.
* **שער אימות סופי (`verification-before-completion` / בדיקת דפדפן):** אימות מלא לאחר התיקונים.
* **סנכרון ושילוח (`git-workflow-and-versioning`):** סנכרון עם ענף הבסיס, דחיפה ופתיחת PR עם טריגר `@coderabbitai review`.

---

### 📊 פרטי ה-PR ואימות סופי:
* **ענף:** `[שם הענף שנשלח]`
* **קישור ישיר ל-Pull Request:** [לינק ישיר ל-PR ב-GitHub]
* **אימות סופי:**
  - [אם UI/Web: לציין מה בדיוק אומת ואיך (דפדפן/קונסול/רינדור)]
  - [אם Code: לציין מה בדיוק אומת ואיך (טסטים שעברו, ריצה נקייה)]

### 🧠 סיכום:
בשורות בודדות בעברית פשוטה: מה הייתה הבעיה שה-Issue תיאר, ומה בדיוק מומש (עם איור ASCII קטן לפני/אחר אם זה עוזר).

👉 **שלב הבא:** `/v-babysit-pr-and-merge` יושב על ה-PR ומחכה לתגובות של CodeRabbit, בוחר מה לתקן, וממזג.
```
