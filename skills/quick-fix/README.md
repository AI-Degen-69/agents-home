# quick-fix — Quick-Fix Lane (not a numbered station)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

The fast path for trivial work: a typo, a one-line correction, a broken link, a
wrong constant, a stale comment. Verifies, commits, and pushes **straight to the
base branch** — no feature branch, no PR, no reviewers, no CodeRabbit wait.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).

## Pipeline position

- **Position:** fast lane — unnumbered, like `pipeline-triage`, `create-issue`, `present-pr`.
- **Replaces:** Stations II → VI entirely. It is never a partial step inside them.
- **Enters from:** Station I, II, III, or IV.
- **Exits to:** `i-pick-issue` for the next item.

## When to use / when not

| Use when | Don't use when |
|---|---|
| Typo, stale comment, broken link, wrong constant | More than 2 files or ~30 lines → `ii-plan-issue` |
| Docs or comment fix, zero behavior change | New behavior, API, schema, or config → `ii-plan-issue` |
| Existing tests already cover the touched code | A new test is required → `iii-build-plan` |
| Operator asked for it fast, not for a discussion | The approach is still undecided → `i-pick-issue` |
| Base branch is clean, synced, unprotected — or carries the lane's own staged handoff | Foreign dirt or unpushed commits → `pipeline-triage` |

## The gate

Seven boxes, all must pass, no partial lane, no override. Any failure routes out —
the escape table in `SKILL.md` names the station for each. The most common
mistake is letting a "typo" that is really a symptom of a design problem into the
lane; the checklist is what stops that.

## What it skips

Station II planning · Station III TDD · Station IIIB · Station IV review, OCR,
reviewers, browser gate · Station V CodeRabbit babysitting · Station VI closeout.

## What it never does

Opens a PR · posts `@coderabbitai` anything · waits for a review · pushes to a
feature branch · overrides branch protection · reports an unrun check as a pass ·
writes the `NOTICED-BUT-NOT-TOUCHING` ledger (it names what it noticed in chat and
stops — a row written here could never be resolved).