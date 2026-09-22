---
name: i-create-issue
description: Station I (Intake) — Turn a raw operator idea, thought, or request into a researched, structured, publishable GitHub issue labeled `ready-for-agent`.
---

# Station I: Create Issue (`i-create-issue`)

Turn one raw operator idea into one professional GitHub issue, publishable and
workable by any agent later — including a fresh session with no memory of this
conversation.

## Pipeline Position
- **Station:** Station I of VII
- **Next Station:** `ii-plan-issue <issue-id>` (or `x-workflow-issue`)

## Workflow

1. **Read the tracker conventions.** Open the issue-tracker doc that ships with
   this skill at the absolute path
   `C:\Users\Tiger\.agents\skills\i-create-issue\references\issue-tracker.md`
   and use its intake template and command conventions (auth pre-flight, body-file
   publishing, label fallbacks, split-failure handling). That doc is the single
   source of truth for the template. If absent, fall back to the template below.
2. **Research before drafting.** Scan the repo for relevant files (search for
   symbols, render sites, config) so Relevant files names real paths with line
   numbers. An issue written without research is not ready-for-agent.
3. **Stop and ask when unclear.** If the operator's intent is ambiguous, ask
   targeted questions first, then continue. Do not guess intent.
4. **Decide single vs split.** If the idea is one coherent change, draft it as
   a single issue (below). If it is really several separable work items — e.g.
   different files, different owners, or one part clearly blocks another — split
   it into multiple issues. Splitting is the agent's call: do it when a single
   issue would be too large to pick up cleanly or when the parts have distinct
   acceptance criteria. Never split a genuinely atomic idea just to multiply
   tickets.
5. **Draft in English.** Interpret the operator's raw words into the template
   sections; never quote them back. Title: short, plain-English, action-shaped.
   For a split, each issue gets its own title + body; keep the shared context in
   each so none reads as orphaned.
6. **Publish immediately (No waiting for approval).** Once the draft is prepared
   (and any clarifying questions resolved), publish directly to GitHub without
   pausing to show the draft or waiting for user confirmation.
   - Single issue:
     `gh issue create --title "..." --body-file <file> --label ready-for-agent`
     (add `needs-triage` alongside only when the idea is genuinely unshaped even
     after research).
   - Split: publish every issue first, capture each `#number`, then wire them
     together so they are visibly one family, not orphans:
     - Put `Part of #<first-issue>` at the top of every sibling body (matches the
       `Part of #<n>` convention in this skill's
       `references/issue-tracker.md`, absolute path
       `C:\Users\Tiger\.agents\skills\i-create-issue\references\issue-tracker.md`).
     - Post a cross-reference comment on each issue pointing at the others, e.g.
       `gh issue comment <n> --body "Related: #<a>, #<b>"`.
     - If one part blocks another, add a native dependency edge:
       `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`
       where `<blocker-db-id>` is the blocker's numeric database id
       (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`), not the `#number`.
7. **Closeout in chat:** You MUST report to the user in clean, everyday Hebrew following the Output Contract below. Never make the user wait before creation.

## Intake template

```markdown
## Summary
<One sentence: what this is and why it matters.>

## Background
<Where the thought came from, what problem it solves, prior context.>

## Scope
<Covers: ...>
<Out of scope: ...>

## Relevant files
<Paths with line numbers found by scanning the repo, or
"None yet - research needed".>

## Acceptance criteria
- [ ] <Verifiable outcome>
- [ ] <Test/build command that must pass>
```

## Split variant

When the agent splits one idea into several issues, every sibling body leads
with a `Part of #<first-issue>` line and a **Related** note so none reads as
orphaned. Example top of each sibling body:

```markdown
Part of #<first-issue>  ·  Related: #<a>, #<b>

## Summary
...
```

The agent posts a cross-reference comment on each issue and, where one part
blocks another, adds a native dependency edge (see Workflow step 7).

## Quality bar

A published issue is ready-for-agent when a fresh agent, given only the issue
and repo access, can start work without asking the operator anything:
real file paths, an explicit out-of-scope line, and acceptance criteria whose
last item is a runnable verification command.

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

At the conclusion of Station I, you MUST report to the user in clean, everyday Hebrew using this exact structured format:

```markdown
# 📝 סיכום יצירת Issue:

### 🔍 מחקר מקדים וממצאים בקוד:
* **קבצים ומיקומים שנסרקו ואומתו:**
  - `[נתיב_קובץ:שורה]` — [מה נמצא בקובץ ואיך זה קשור למימוש]
  - `[נתיב_קובץ:שורה]` — [הקשר ארכיטקטוני או תלויות קיימות]
* **גבולות גזרה (Scope):** [מה כלול במימוש, ומה במפורש מחוץ לתחום כדי למנוע זליגת משימה]
* **אימות ותנאי קבלה שהוגדרו:**
  - [קריטריון קבלה מרכזי 1]
  - פקודת אימות להרצה: `[בדיקה/טסט שחייב לעבור כדי לאשר את ה-Issue]`

---

### 📊 פרטי ה-Issue:
* **מספר וקישור ישיר:** [#<id> - <כותרת ה-Issue>](<קישור ישיר ל-Issue ב-GitHub>)
* **תוויות (Labels):** `ready-for-agent`
* **חלוקה לסאב-אישיוז (אם פוצל):** [פירוט ה-siblings ומספריהם / "משימה אטומית יחידה"]

### 🧠 סיכום:
בשורות בודדות בעברית פשוטה: מה היה הרעיון או הצורך המקורי שהעלית, ואיך הוא נוסח למשימת פיתוח ברורה וסגורה שסוכן יכול לבצע עצמאית בלי לשאול שאלות.

👉 **שלב הבא:** `/ii-plan-issue <id>` — טוען את ה-Issue, מזהה את ה-Stack, נועל מדדי איכות (`CONSTRAINTS.md`) ומייצר תוכנית עבודה מפורטת (`tasks/plan.md`).
*(או `/x-workflow-issue` כדי למפות את כל ה-Backlog ולבחור סדר עבודה)*
```
