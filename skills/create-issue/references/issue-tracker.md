# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Pre-flight**: run `gh auth status` first. If unauthenticated, stop and run `gh auth login` — do not fall back to unauthenticated API calls.
- **Create an issue**: `gh issue create --title "..." --body "..."`. Multi-line bodies use a body file: write the markdown to a temp file and pass `--body-file <path>` (this avoids all shell quoting pitfalls on both bash and PowerShell — do not inline heredocs or `"$(cat ...)"`).
- **Read an issue**: `gh issue view <number> --comments` for a human view, or structured:
  `gh issue view <number> --json number,title,body,labels,comments --jq '{number, title, body, labels: [.labels[].name], comments: [.comments[].body]}'`
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`. If the label does not exist, the command fails — create it first with `gh label create "<name>" --color 0E8A16` (one label per name; check with `gh label list`).
- **Close**: `gh issue close <number> --comment "..."`
- **Partial split failure**: if a split-publish fails midway (some siblings published, some not), do not leave orphans. Publish the remaining siblings, then wire the whole family together (headers, cross-references, dependency edges) once every number is captured. If publishing cannot be completed, post a cross-reference comment on each already-published sibling listing which parts are still missing.
- **First sibling in a split**: there is no self-reference. The first-published sibling gets only the `Related: #<a>, #<b>` line; the `Part of #<n>` header goes on every *later* sibling pointing at the first.

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Raw idea intake

The operator drops raw thoughts (Hebrew voice-notes style, bullet fragments, half-formed
questions) and the agent turns each one into a professional issue. One idea = one issue.

### Intake template

Single source of truth — SKILL.md points here. Every intake issue uses this body. English only — the operator's raw words are not quoted back; they are interpreted into the sections below.

```markdown
## Summary
<One sentence: what this is and why it matters.>

## Background
<Where the thought came from, what problem it solves, prior context.>

## Scope
<What this work covers, and explicitly what it does NOT cover.>

## Open questions
<Only when something is genuinely unclear. For each: what is unclear, why it matters, and the default assumption the next station should work with. Omit the section entirely when everything is clear.>

## Relevant files
<Paths with line numbers found by scanning the repo, or "None yet - research needed".>

## Acceptance criteria
- [ ] <Verifiable outcome>
- [ ] <Test/build command that must pass>
```

The final acceptance criterion must be a runnable verification command — that is the skill's quality bar.

### Labels

- New capture that still needs shaping: `idea` + `needs-triage`.
- Shaped and fully specified so an agent can pick it up AFK: swap to `ready-for-agent`.
- Published but still genuinely unshaped even after research: pair `ready-for-agent` with `needs-triage` (the publish-time exception to the `idea` + `needs-triage` pair above — it says "an agent may start, but expect churn").
- Has documented Open questions (body section) awaiting resolution from code at planning time: pair `ready-for-agent` with `needs-answers` (create with `gh label create "needs-answers" --color FBCA04` on first use).
- Requires operator hands or operator decisions, not agent work: `ready-for-human`.
- Bot accounts submitting external PRs are triaged like any other `NONE`-association author, but weight `author` and prior behavior when accepting.

### Intake flow

1. Operator throws a raw idea in chat.
2. Agent scans the repo for relevant files and drafts the issue from the template (unclear points become **Open questions** in the body with the `needs-answers` label — Station II resolves them from code before planning).
3. Agent publishes immediately with `gh issue create` (no draft approval pause).
4. Later pickup: "work on #42" → `gh issue view 42 --comments` and go.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

See [`references/wayfinding-operations.md`](./wayfinding-operations.md) (used by `/wayfinder`, not by intake).

