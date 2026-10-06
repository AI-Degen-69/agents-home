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
5. **Draft in English with a tagged title.** Interpret the operator's raw words into the template
   sections; never quote them back. Title format: `[TAG] short plain-English summary`.
   Use exactly one primary TAG, chosen by the main purpose of the work:
   `[ADD]` new capability on top of what exists · `[CREATE]` a new file, module or service ·
   `[FIX]` wrong behaviour corrected · `[IMPROVE]` same behaviour, better ·
   `[REFACTOR]` moved or renamed, behaviour unchanged · `[OPTIMIZE]` faster or cheaper ·
   `[TEST]` tests only · `[DOCUMENT]` docs only · `[FORMAT]` whitespace, layout, lint ·
   `[UPDATE]` dependency or data refresh · `[CONFIGURE]` settings, workflows, tooling ·
   `[REVERT]` undo a previous change.
   Keep the summary short, specific, and in everyday English with no abbreviations.
   For a split, each sibling gets its own title + TAG + body; keep the shared context in
   each so none reads as orphaned. This rule is for issue titles only — the PR title
   remains `@coderabbitai` until CodeRabbit writes the final title.
6. **Publish immediately (No waiting for approval).** Once the draft is prepared
   (and any clarifying questions resolved), publish directly to GitHub without
   pausing to show the draft or waiting for user confirmation. Before publishing,
   run `gh label list` with a limit large enough to show all labels, then pass
   usually one to three relevant existing labels with `--label` to `gh issue create`
   (e.g. `gh issue create --title "[FIX] ..." --body-file <file> --label ready-for-agent`).
   Use `ready-for-agent`, `needs-answers`, `needs-triage`, and `quick-fix` only when
   they exist and fit the issue; when no label fits, publish with no label at all.
   Never create a missing label, never invent a label, and never wait for CodeRabbit
   to add labels — a missing wanted label is skipped and named in the closeout.
   Keep any `quick-fix` the screening below selected (when the label exists), and keep
   it on an issue that already carries it; the 7-box gate rules and label removal on
   gate failure are unchanged.
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
7. **Post CodeRabbit plan prompt — after publishing.** CodeRabbit does not plan
   issues by itself; the agent must post the canonical `@coderabbitai plan` prompt stored in
   `references/coderabbit-plan-prompt.md`. Post it only after the issue is published — or,
   for a split, after every sibling is published and fully linked per step 6.
   This primes CodeRabbit while the operator/agent is in Station I.
   - **Post the prompt body, never the file.** The reference file is a doc: a
     heading, a note, and the prompt wrapped in a ```` ```text ```` fence. Passing
     it as-is would publish the wrapper and leave the `@coderabbitai` mention
     inside a code block. Write the fenced body to a temp file and pass that —
     `gh issue comment <n> --body-file <temp-prompt-file>` — or pass the body
     inline with `--body`. The posted comment starts with the exact lowercase
     mention `@coderabbitai plan`, contains the prompt body, and contains nothing
     else — no file path, no wrapper text.
   - **Skip the request for a genuinely trivial issue — and only for such an issue.** A typo-only,
     comment-only, or trivial docs change with no behavior change (the docs/typo/comment-only
     class) gets nothing back from phases and test cases: publish, report, and move on. Any other issue —
     including one carrying `quick-fix` — still gets the plan request.
   - **If no reply lands, retry once.** A plan normally arrives within about five
     minutes. If the issue still shows no `coderabbitai` comment, post the prompt
     again with the mention spelled exactly `@coderabbitai` in lowercase (a
     capitalized mention was observed to return no plan at all), and say in the
     closeout that a retry was sent. A refusal or upgrade notice counts as a reply:
     do not retry it — quote it in the closeout instead.
8. **Closeout in chat:** You MUST report to the user in clean, everyday Hebrew following the Output Contract below. Never make the user wait before creation.

## Quick-fix screening

Intake is the cheapest place in the whole pipeline to notice trivial work: the idea
is still one sentence, so "typo" and "new auth provider" are still visibly different
sizes. Screen every idea, and when it reads as trivial keep the `quick-fix` label
when that label exists.

**The label is a signal, not a shortcut.** It tells Station I where to look first; it
does not grant the lane. `quick-fix` still runs its own hard 7-box gate at the
divert point, and a failed gate sends the work to the full pipeline with the label
removed. Sizing an idea wrong at intake is a recoverable mistake; a label that
bypasses the gate would not be.

Label the idea when it reads as: a typo, a stale comment, a broken link, a wrong
constant, a missing doc line, or a single obvious correction in at most a couple of
files — with no behavior change and no new test implied.

Do **not** label it because the operator called it "quick", because it is small on
its own, or because most of the work is already done. Open questions, a split, or
anything implying a behavior change all mean no label. A split is never labelled:
its parts are separate issues and each gets screened on its own.

The intake issue's final acceptance criterion is still a runnable verification
command, exactly as for any other issue — the lane verifies before it pushes, and a
`quick-fix` issue with no runnable command fails gate box 6 and routes to planning.

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

<!-- local-only:create-issue:output-template-begin -->
The chat output template for this station is `references/output-template.md`.
Read it before writing your first report.
<!-- local-only:create-issue:output-template-end -->

