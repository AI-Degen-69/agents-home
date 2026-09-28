---
name: create-issue
description: Intake — Turn a raw operator idea, thought, or request into a researched, structured, publishable GitHub issue labeled `ready-for-agent`. Called from Station I (`i-pick-issue`) when there is no open issue worth picking; not a numbered pipeline station.
---

# Intake: Create Issue (`create-issue`)

Turn one raw operator idea into one professional GitHub issue, publishable and
workable by any agent later — including a fresh session with no memory of this
conversation.

## Pipeline Position
- **Position:** Intake branch — **not a numbered station.** Invoked from Station I (`i-pick-issue`) when the backlog has nothing worth picking, or directly by the operator (`/create-issue <idea>`).
- **Previous Station:** none — this is the entry for a brand-new idea. When work is already in flight, `pipeline-triage` comes first.
- **Next Station:** `i-pick-issue` — the new issue re-enters Discovery and gets picked like any other.

## Workflow

1. **Read the tracker conventions.** Open the issue-tracker doc that ships with
   this skill at `references/issue-tracker.md` (relative to the skill root) and
   use its intake template and command conventions (auth pre-flight, body-file
   publishing, label fallbacks, split-failure handling). That doc is the single
   source of truth for the intake template itself — see it there, under
   "Raw idea intake → Intake template".
2. **Research before drafting.** Scan the repo for relevant files (search for
   symbols, render sites, config) so Relevant files names real paths with line
   numbers. An issue written without research is not ready-for-agent.
3. **Capture open questions in the issue.** If the operator's intent is
   ambiguous, do NOT stop to interrogate: write each unclear point into the
   issue under **Open questions** (what is unclear + why it matters + the
   default assumption the next station should work with) and add the
   `needs-answers` label. Ask the operator only when the idea cannot be drafted
   at all without an answer. Never guess intent silently.
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
     - Put `Part of #<first-issue>` at the top of every later sibling's body —
       the header wording and the first-sibling exception are canonical in
       `references/issue-tracker.md` → Conventions.
     - Post a cross-reference comment on each issue pointing at the others, e.g.
       `gh issue comment <n> --body "Related: #<a>, #<b>"`.
     - If one part blocks another, add a native dependency edge:
       `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`
       where `<blocker-db-id>` is the blocker's numeric database id
       (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`), not the `#number`.
7. **Post CodeRabbit plan prompt:** Immediately after publishing each issue (or
   sibling), post the canonical `@coderabbitai plan` prompt stored in
   `references/coderabbit-plan-prompt.md` to request an implementation plan.
   This primes CodeRabbit while the operator/agent is in Station I.
   - **Post the prompt body, never the file.** The reference file is a doc: a
     heading, a note, and the prompt wrapped in a ```` ```text ```` fence. Passing
     it as-is would publish the wrapper and leave the `@coderabbitai` mention
     inside a code block. Write the fenced body to a temp file and pass that —
     `gh issue comment <n> --body-file <temp-prompt-file>` — or pass the body
     inline with `--body`. The posted comment starts with the mention and
     contains nothing else.
8. **Closeout in chat:** You MUST report to the user in clean, everyday Hebrew following the Output Contract below. Never make the user wait before creation.

## Intake template

See `references/issue-tracker.md` → "Raw idea intake → Intake template" — it is
the single source of truth for the body of every intake issue (English only, the
operator's raw words are never quoted back, and the final acceptance criterion
must be a runnable verification command).

## Split variant

The rule is canonical in `references/issue-tracker.md` → Conventions (later
siblings lead with `Part of #`, the first carries only `Related:`, every sibling
gets a cross-reference comment, blockers get a native dependency edge — see
Workflow step 6). Example top of each *later* sibling body:

```markdown
Part of #<first-issue>  ·  Related: #<a>, #<b>

## Summary
...
```

## Quality bar

A published issue is ready-for-agent when a fresh agent, given only the issue
and repo access, can start work without asking the operator anything:
real file paths, an explicit out-of-scope line, and acceptance criteria whose
last item is a runnable verification command.

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

At the conclusion of this intake, you MUST report to the user in clean, everyday Hebrew using this exact structured format:

```markdown
# 📝 סיכום יצירת Issue:

## 🔍 מה נמצא בקוד:
* **קבצים ומיקומים:**
  - `[נתיב_קובץ:שורה]` — [מה יש שם ולמה זה קשור למשימה]
* **מה כלול ומה לא (Scope):** [שורה-שתיים: מה המשימה מכסה, ומה מפורש מחוץ לתחום]
* **תנאי קבלה:**
  - [קריטריון קבלה מרכזי]
  - פקודת אימות: `[בדיקה שחייבת לעבור]`

---

## 📊 פרטי ה-Issue:
* **מספר וקישור:** [#<id> - <כותרת ה-Issue>](<קישור ישיר ל-Issue ב-GitHub>)
* **סאב-אישיוז:** [רק אם הרעיון פוצל — פירוט ה-siblings ומספריהם; אם לא פוצל, שורה זו לא מופיעה כלל]

## 🧠 סיכום במילים פשוטות:
[2-3 משפטים בשפה שכל אדם מבין, בלי מונחי קוד: מה היה הרעיון או הבעיה, מה ה-Issue מבקש לעשות בעבודה, ואיך יידעו שהעבודה הושלמה. אין מילוי, אין באזוורדים.]

## 👉 מה עכשיו:
1. הרץ `/i-pick-issue` כדי למפות את כל ה-Backlog ולבחור על איזה Issue עובדים.
2. אם יש הצעה לשיפור ה-Issue שנכתב (הבהרה, תיחום, תנאי קבלה חסר) — הצע אותה כאן בשורה-שתיים; אם אין, כתוב "אין הצעות" — אין להמציא.
```
