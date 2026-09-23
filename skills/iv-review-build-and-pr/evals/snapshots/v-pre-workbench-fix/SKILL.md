---
name: iv-review-build-and-pr
description: Station IV (Review, Verify & Ship) — Universal shipping flow. Runs OCR delegation (deterministic file scope + rules, host-agent review, no LLM key), then ECC language/framework reviewers, applies fixes, executes full post-review verification (browser or test suite), pushes branch, and opens GitHub PR with @coderabbitai summary.
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

### Step 0: Proof-Before-Review Gate (MANDATORY, FIRST)

**No review runs on unproven code.** Before Step 1, prove the build actually works:

1. **For Frontend / Web / UI changes:** run the live browser check via `browser-testing-with-devtools` — key screens load, the flows built in Station III work, zero uncaught console errors and zero failed network requests.
2. **For Backend / Logic changes:** run the targeted test suites for modified files — all green.
3. **On failure:** stop. Route the failure list to `iiib-iterate-after-build` as correction items, and re-enter this station only after IIIB is clean. Do not review broken code.
4. **On success:** record one gate line for the report (what was run, what passed), then continue to Step 1.

### Step 1: OCR Delegation Review (MANDATORY, FIRST — embedded `open-code-review-delegate` skill)

Use OCR only for fixed work (file pick + rules). The thinking stays with you. No LLM key needed on OCR side. Source: `https://github.com/alibaba/open-code-review` (Apache-2.0). The delegation procedure below is embedded in this skill — no external skill file is required.

1. **Preview — what to review:**
   ```bash
   ocr delegate preview --format json --from origin/<base> --to HEAD
   ```
   - Plain `ocr delegate preview` (no flags) = work copy (staged + unstaged + untracked). Prefer the `--from/--to` form here so the scope matches the PR diff.
   - Output gives: `mode` (workspace / range / commit), `merge_base` / refs, `reviewable_files` (path, status, adds/dels), `excluded_files` + reason.
   - If it fails with `unknown flag: --format` (CLI < v1.9.0): rerun without `--format` and use text output. For any other error: stop and report.
   - If `ocr: command not found`: run `npm install -g @alibaba-group/open-code-review`, then retry once.
2. **Rules — checklist per file:**
   ```bash
   ocr delegate rule --format json <path1> <path2> ...
   ```
   - Pass every `reviewable_files` path. Output is grouped by rule text — files with the same rule share one group.
   - For big diffs: fetch rules per batch as you review.
   - Optional project rules: `--rule <path>`, or `<repo>/.opencodereview/rule.json`, or `--background "short issue context"` / `--background-file <path>` (file ≤1 MiB raw and ≤8000 chars clean, else send a short summary as `-b`).
3. **Diffs — pull with git (from preview refs):**
   - Range: `git diff <merge_base>..<to> -- <path>`
   - Commit: `git show <commit> -- <path>`
   - Work copy tracked: `git diff HEAD -- <path>`; untracked new files: read the file directly.
4. **Review each file — full cover, no skips:**
   - Make a list with every `(path, status)` entry. Same path can show twice (e.g. staged delete + untracked add) — treat each as its own item.
   - Per file: read its diff, read its Rule Group, review with file read + code search for context. Stay on changed (+) lines only.
   - Review in small batches grouped by shared rule + diff size. Do not stop after the first big find.
   - Mark each item `reviewed` or `skipped + reason`. Every preview item must end in one of these two states.
5. **Write down each find in this shape:** `path, content, start_line, end_line, category (bug/security/performance/maintainability/test/style/documentation/other), severity (critical/high/medium/low)`.
   - Report Critical/High always. Report Medium with context. Drop Low unless clearly useful. Drop likely false notes quietly.
   - Close with counts: `total_files, reviewed_files, skipped_files (+reasons), coverage_rate`. Cover must be 100% (reviewed + explained skips = total).

### Step 1B: Dynamic Reviewer Discovery & Multi-Axis Review (uses OCR output as input)
Feed the OCR file list + Rule Groups + OCR finds into each reviewer below (no file left out, line numbers from OCR win on conflicts). Inspect the diff (`git diff --name-only origin/<base>...HEAD`) and discover matching specialized reviewers from the project's agent repository (`.agents/agents/`, `~/.agents/agents/`, or builtins):

**Reviewer honesty rule:** a reviewer persona that is not found on disk is skipped — record the skip and the reason in the report. Never invent or simulate a missing reviewer (אין להמציא).

1. **General Code Quality (`code-review-and-quality`):**
   - Check diff clarity, clean naming, absence of dead code, and adherence to project patterns.
2. **Security & Hardening (`security-and-hardening` / `security-reviewer`):**
   - Audit all new inputs, secrets, session boundaries, and dependency vulnerabilities.
3. **Dynamic Language & Framework Specialists (Auto-Detected from Diff):**
    - **Python files modified (.py):** Deploy `python-reviewer` (asyncio patterns, type hinting, PEP 8, memory leaks). If FastAPI/Django endpoints touched: also apply `api-and-interface-design` (REST contracts, endpoint boundaries).
    - **TypeScript / JavaScript files modified (.ts, .js — no React):** Deploy `typescript-reviewer` (type safety, async correctness, Node/web security, idiomatic patterns).
    - **React files modified (.tsx, .jsx, or React component logic):** Deploy BOTH `typescript-reviewer` AND `react-reviewer` per their scope split (typescript-reviewer owns generic TS/async/Node lanes; react-reviewer owns hooks, a11y, RSC boundaries, render performance, React security). Load `vercel-react-best-practices` (component/data-fetching guidance) and `vercel-composition-patterns` (component architecture) as advisory checklists feeding the react-reviewer axis — not as separate reviewers.
    - **Vue touched:** add `frontend-ui-engineering` (components, state, layout review).
   - **Rust files modified (.rs):** Deploy `rust-reviewer` (lifetimes, unsafe blocks, concurrency, borrowing).
   - **Go files modified (.go):** Deploy `go-reviewer` (goroutines, error handling, interface boundaries).
   - **Database / Schema files touched (.sql, ORM models):** Deploy `database-reviewer` (N+1 queries, indexes, migrations).
    - **CSS / UI Components touched:** Deploy `web-design-guidelines` (accessibility, ARIA roles, contrast) with `frontend-ui-engineering` (WCAG requirements, responsive layout).
4. **Silent Failure Hunt (`silent-failure-hunter`, diff-triggered):**
   - Deploy whenever the diff touches catch/except blocks, fallback defaults, async paths, or logging. Hunt swallowed errors, empty catch blocks, dangerous fallbacks (`.catch(() => [])`), lost stack traces, and missing error propagation.
5. **Test Engineering Audit (`test-driven-development`):**
   - Verify that test assertions test real domain behavior and edge cases, not hollow mocks.
   - Map each changed behavior to the test that covers it; rate uncovered paths by impact (critical / important / nice-to-have). (Absorbed from ECC `pr-test-analyzer`.)
6. **Docs Drift (`doc-updater`, diff-triggered):**
   - Deploy when the diff touches `*.md` files, docstrings, or README/docs adjacent to changed behavior. Verify that documentation touched by the diff still matches the code — no stale examples, no outdated API references. Persona from `~/.agents/agents/`; not found on disk → skip and record the skip (אין להמציא).

### Step 1C: Spec Axis — Diff vs Issue & Plan (from Matt Pocock's two-axis review)
Before applying fixes, run the Spec axis in full:
1. Load the linked GitHub issue (`gh issue view <n> --comments`) and the plan (`tasks/plan.md`).
2. Compare the diff against them and report, with the spec line quoted for every finding:
   - **Missing** — requirements the issue/plan asked for that are absent or partial.
   - **Added-not-asked** — behavior in the diff that nothing requested (scope creep; the NOTICED-BUT-NOT-TOUCHING leftovers of Station III belong here — flag, don't silently keep).
   - **Implemented-wrong** — requirements that look implemented but behave differently than specified.
3. Spec-axis findings join the fix list (Step 2) with severity from operator impact. Spec axis runs **separately** from the quality axes — never merged or re-ranked into them: "follows every standard but implements the wrong thing" is not the same finding as "implements correctly but breaks standards".

### Step 2: Apply Review Fixes Locally
- Merge OCR finds (Critical/High first, then Medium), reviewer finds, and Spec-axis findings. One list, no dupes.
- For any actionable findings (nits, type errors, edge-case risks):
  - Apply minimal, clean fixes directly to the local codebase.
  - Create a clean fix commit: `fix(review): address review feedback`.

### Step 3: Final Post-Review Verification Gate (MANDATORY)
**Before any code is pushed or a PR is opened, the entire change must be verified post-fixes:**

**Approval standard (from Addy):** approve a change when it definitely improves overall code health, even if it isn't perfect. Perfect code doesn't exist — never block a review on taste or on "how I would have written it".

**Citing gate:** every finding carries its motivating evidence — the verbatim quoted line(s) that triggered it. A finding without a quotable line goes to the appendix as unverified; it never enters the main report.

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
- **Wait for the trigger acknowledgement (MANDATORY before handoff):** Do not conclude the station on a blind post. Wait for CodeRabbit's reply to the trigger comment (typically within ~1 minute; check up to ~3 minutes, non-blocking wait), then classify it:
  - `Review triggered.` ("Action performed" reply) — review started. Proceed to handoff.
  - Rate-limit reply with a wait time (e.g. "come back in N minutes" / quota exceeded) — review NOT started. Record the reported minutes and carry them into the handoff report so the operator (and Station V) know the quota window.
  - Any other refusal/skip notice (e.g. "does not re-review already reviewed commits") — record verbatim; it may mean incremental review found nothing new, which is itself a signal Station V must read (not a silent pass).
  - No reply within ~3 minutes — report `trigger acknowledgement not received` honestly; do not claim the review started.
  - **Ack polling command:**
  ```bash
  gh pr view <pr_number> --json comments --jq '.comments[-3:] | .[] | {author: .author.login, body: .body[0:300]}'
  ```
- **Comment links (mandatory whenever the ack is anything other than `Review triggered.`):** post direct jump links in the handoff report so the operator can reach the exchange in one click — both the trigger comment and CodeRabbit's reply. Pull the `html_url` of each comment via the API:
    ```bash
    gh api repos/:owner/:repo/issues/<pr_number>/comments --jq '.[] | select(.body | contains("@coderabbitai review")) | {trigger: .html_url}'
    gh api repos/:owner/:repo/issues/<pr_number>/comments --jq '[.[] | select(.user.login == "coderabbitai")] | last | {reply: .html_url, body: .body[0:300]}'
    ```
    Report shape: `Trigger: <html_url>` / `CodeRabbit reply: <html_url>` (e.g. `https://github.com/<owner>/<repo>/pull/<n>#issuecomment-<id>`). For the no-reply case, post the trigger-comment link alone.
- **Handoff:** Conclude Station IV and recommend `v-babysit-pr-and-merge`. The handoff report MUST state the trigger status in one line: review started / rate limited (N minutes) / other reply (quoted) / no acknowledgement.

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

At the conclusion of Station IV, you MUST report to the user in clean, everyday Hebrew using this exact structured format:

```markdown
# 🚢 סיכום Review & PR:

## 🔍 מי סקר ומה נמצא:
* **OCR delegation (preview + rules):** [כמה קבצים נסרקו וכיסוי — למשל 12/12, מה הכללים תפסו]
* **[שם הסוקר הראשון]:** [במשפט אחד — מה הוא בדק ומה הוא מצא]
* **[שם הסוקר השני]:** [במשפט אחד — מה הוא בדק ומה הוא מצא]
(לרשום רק סוקרים שבאמת הופעלו — בלי סעיפים ריקים ובלי סעיף אבטחה)
* **תיקונים שבוצעו בעקבות הסקירה:**
  - [מה תוקן ולמה — רק מה שבאמת שונה בקוד]

---

## 📊 פרטי ה-PR ואימות סופי:
* **ענף:** `[שם הענף שנשלח]`
* **קישור ישיר ל-Pull Request:** [לינק ישיר ל-PR ב-GitHub]
* **סטטוס CodeRabbit:** [שורה אחת: הסקירה הופעלה / הוגבלה במכסה — מוחזרים בעוד N דקות / תשובה אחרת של הבוט (מצוטטת) / אין אישור הפעלה]
* **קישורים לתגובות:** [אם הסטטוס אינו "הסקירה הופעלה": קישור ישיר לתגובת הטריגר ולתגובת התשובה של CodeRabbit, לקפיצה מהירה]
* **אימות סופי:**
  - [אם UI/Web: מה בדיוק אומת ואיך (דפדפן/קונסול/רינדור)]
  - [אם Code: מה בדיוק אומת ואיך (טסטים שעברו, ריצה נקייה)]

---

## 🗺️ איך זה נראה:
[הדמיה אחת של מה שנבנה — לבחור את המתאימה: תרשים זרימה קטן, טבלת לפני/אחרי, או רשימת מסכים וקבצים שנוצרו. חובה להציג משהו חזותי ולא רק טקסט.]

## 🧠 סיכום מההתחלה עד כאן:
[מהתכנון (שלב א') ועד עכשיו: מה המשתמש ביקש, מה תוכנן, מה נבנה ומה נשלח ל-PR — במילים פשוטות של אדם רגיל, בלי מושגי קוד. הקורא צריך להבין מה קרה ולהיכנס ללופ.]

👉 **שלב הבא:** `/v-babysit-pr-and-merge` יושב על ה-PR ומחכה לתגובות של CodeRabbit, בוחר מה לתקן, וממזג.
```
