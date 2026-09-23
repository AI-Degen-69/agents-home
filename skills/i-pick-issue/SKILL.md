---
name: i-pick-issue
description: Station I (Pick & Orchestrate) — The single entry point for Issue work. Always starts with Discovery: lists open issues, groups them by domain, recommends the next logical one by dependency order, takes the operator's pick and execution mode, then orchestrates Stations II through VI through to merge and closeout.
---

# Station I: Pick Issue (`i-pick-issue`)

Station I of the 6-station delivery pipeline (I–VI): the single entry point for
Issue work. It picks the next logical issue to build, then drives the rest of the
chain.

## Router Gate & Boundary (read first)

**Gate:** before any work, check repo state. If the branch is dirty, commits are unpushed, or a PR is open — run `pipeline-triage` first and follow its decision. Never start new Issue work on top of unfinished work.

**Boundary:** this skill owns Issue work — anything that starts from (or will end as) a GitHub issue with a PR. Ad-hoc requests (quick questions, small fixes, exploration, "where is X") are not Issue work: say so in one line, route to `using-agent-skills`, and stop. Ambiguous? If it will end in a PR on code, it is Issue work. Still ambiguous? Ask one question.

## Pipeline Position
- **Station:** Station I of VI (single entry point for Issue work)
- **Previous Station:** `pipeline-triage` (state gate — only when the tree is dirty, commits are unpushed, or a PR is open)
- **Next Station:** `ii-plan-issue <issue-id>` (Plan)

---

## 1. Always Start With Discovery (`/i-pick-issue` — with or without arguments)

Every invocation of this skill begins with the **Discovery Station**, regardless of arguments. Never skip discovery to jump straight into orchestration:

1. **List all open issues:**
   Run:
   ```bash
   gh issue list --state open --limit 50
   ```
   (and inspect details with `gh issue view <n> --comments` as needed). Present every open issue clearly: number, title, labels, and a concise summary.
2. **Categorize and group:**
   Group them logically by domain area, risk, architectural component, or dependency chain.
3. **Recommend an execution sequence:**
   Propose a concrete order of work (unblockers and core infrastructure before dependent features, quick wins vs. deep changes), and explicitly highlight the single recommended issue to start.
4. **Halt for user selection:**
   Stop and ask the operator which issue to proceed with. Do NOT pick silently.
5. **Route non-issue states:** no open issues and the operator has a brand-new idea → `create-issue`. No open issues and nothing new → say so and route to `pipeline-triage`.

### 1b. Execution Mode Gate (mandatory, after issue selection)

Once the operator picks an issue, STOP and present exactly two options:

1. **Step-by-step mode (default recommendation):** run one station at a time. After each station completes, report its summary and **halt — wait for explicit operator approval before starting the next station.** The operator reviews the plan (II), the build (III), the PR (IV/V), etc., one gate at a time.
2. **Full orchestration mode:** run Stations II → VI end-to-end without halting, reporting a summary after each station, finishing only after Station V merge + Station VI closeout (prune, issue close, clean-exit gate).

Do NOT infer the mode from how the request was phrased, and do NOT start Station II until the operator has explicitly chosen a mode.

---

## 2. Orchestration Mode — After Issue and Mode Are Confirmed

Only after the operator selected an issue (step 4) AND an execution mode (step 1b), orchestrate the pipeline stations. In step-by-step mode, insert a mandatory approval halt after every station; in full orchestration mode, run sequentially with per-station reports:

### Step 1: Assignment & Setup
- Read the issue details: `gh issue view <number> --comments`
- Claim the issue: `gh issue edit <number> --add-assignee @me`
- Apply `context-engineering` principles to lock session scope before opening files.

### Step 2: Station II — Plan (`ii-plan-issue <number>`)
- Hand off to `ii-plan-issue` to perform scope right-sizing (Trivial/Small/Standard/Large), auto-detect stack, lock `CONSTRAINTS.md`, specify interfaces, and write `tasks/plan.md`.
- Report plan summary in plain Hebrew to the user.

### Step 3: Station III — Build (`iii-build-plan auto`)
- Hand off to `iii-build-plan auto` to implement all tasks in `tasks/plan.md` using TDD, atomic commits per task, and automated build error resolution.

### Step 3B: Station IIIB — Iterate After Build (`iiib-iterate-after-build`)
- After Station III completes, present the operator the two paths (already in III's report): corrections on the fresh build → `iiib-iterate-after-build` (routes to the right specialist, fixes locally, no push); all good → straight to Station IV.
- Loop IIIB until the operator reports the build clean, then continue to Station IV.

### Step 4: Station IV — Review & Ship (`iv-review-build-and-pr`)
- Hand off to `iv-review-build-and-pr` to run: the proof-before-review gate (Step 0: live browser check or targeted tests — failure returns to `iiib-iterate-after-build`), the OCR delegation scan, dynamic ECC reviewers plus the Spec axis (diff vs issue and `tasks/plan.md`: missing / added-not-asked / implemented-wrong), local fix commits, the final verification gate, then push the feature branch and open the PR with `@coderabbitai summary` and review trigger.

### Step 5: Station V — Babysit PR & Merge (`v-babysit-pr-and-merge`)
- Hand off to `v-babysit-pr-and-merge` to track CodeRabbit review (5m-4m-3m-2m-1m countdown or agent fallback on quota limit), resolve comments, squash merge on green CI, and fast-forward the local base branch (`git pull --ff-only`).

### Step 6: Station VI — Close Pipeline (`vi-close-pipeline`)
- Run `vi-close-pipeline` to close out: verify/close the issue, sweep stale per-issue artifacts (signal-based, any layout), handle dead code on the spot with zero-reference proof + targeted tests, and pass the Clean Exit Gate — pushed, on base branch, spotless, ready for the next issue.
- Optionally suggest `/present-pr <number>` (ad-hoc visual presentation, outside the pipeline) — never mandatory.

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

### במצב Discovery (ללא ארגומנט):
```markdown
# 🗺️ I - מיפוי ובחירת משימה (Backlog):

## 📋 חלוקת ה-Issues הפתוחים לפי תחומים:
* **[תחום / קבוצה 1]:**
  - [#<id> - <כותרת>](<link>) `[labels]` — <תקציר מהות המשימה במשפט>
* **[תחום / קבוצה 2]:**
  - [#<id> - <כותרת>](<link>) `[labels]` — <תקציר מהות המשימה במשפט>

## 🎯 סדר עבודה מומלץ (Dependencies & Impact):
1. **#<id>** — [נימוק: משימת בסיס/תשתית שחוסמת משימות אחרות]
2. **#<id>** — [נימוק: משימת המשך ישירה]
3. **#<id>** — [נימוק: עצמאית ומשנית]

---

## 📊 המשימה הבאה שנבחרה להתחלה:
* **Issue מוביל:** [#<id> - <כותרת>](<link>)
* **סיבת הבחירה:** מסירה חסימות ומאפשרת התקדמות חלקה לשאר ה-Backlog.

## 🧠 סיכום:
בשורות בודדות בעברית פשוטה: מה תמונת המצב הכוללת של המשימות הפתוחות, ולמה סדר הביצוע הזה יחסוך שבירת קוד ובנייה כפולה.

👉 **שלב הבא:** בחר את ה-Issue להתחלה, ואז בחר מצב ביצוע:
* **🚶 מצב צעד-צעד (מומלץ):** תחנה אחת בכל פעם — עצירה ואישור שלך בין כל תחנה.
* **🚀 מצב תזמור מלא:** ריצה רציפה מתכנון (II) ועד מיזוג, ניקוי והצגת ה-PR (VII) — עם דיווח בכל תחנה.

רק לאחר בחירת Issue + מצב נמשך ל-`/ii-plan-issue <id>`.
```

### במצב תזמור (End-to-End Orchestration):
דווח בצורה תמציתית בעברית על כל תחנה שהושלמה בהתאם לחוזה הדיווח שלה, והצג את המצב הנוכחי ואת התחנה הבאה בתור.