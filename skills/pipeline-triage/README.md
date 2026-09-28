# pipeline-triage — State Gate (not a numbered station)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Session-start router for unfinished work. Inspects git/PR state
read-only, picks exactly one next station from the routing table —
guides only, changes nothing.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).

## Pipeline position

- **Position:** State gate — not a numbered station.
- **Runs:** Before Station I when the repo carries unfinished work, or
  whenever the next step is unclear.
- **Next:** the single station named by the routing table.

## When to use / when not

| Use when | Don't use when |
|---|---|
| "Where were we" / continuing existing work | Clean repo + new Issue work → `i-pick-issue` directly |
| Dirty tree, unpushed commits, open PR, stashes | Quick question or exploration → `using-agent-skills` |
| Unclear whether to plan, build, review, merge, or clean | Brand-new idea, nothing to pick → `create-issue` |

## How it works (short)

1. Classifies the operator message (continuation / new work / ad-hoc).
2. Read-only checks: `git status`, `git log`, stash list, ahead/behind,
   `gh pr status` + comments ( incl. CodeRabbit state), `tasks/plan.md`
   checklist vs issue state.
3. First matching routing-table row wins — exactly one station, one
   handoff at most. Never runs two routers on the same request.
4. Safety: stops before push/merge/discard/reset; destructive steps need
   explicit approval. Answers in Hebrew, status + decision only.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (checks, 14-row routing table, safety rules, Hebrew output shape). |
| `evals/evals.json` | Eval set for the gate. |

## Quality bar

One decision, grounded only in what the commands showed — never
invented PR state — with every changed file and stash classified in
one line each.

## Example

```bash
/pipeline-triage
# → status: branch, ahead/behind, staged/unstaged/untracked, PR state, stashes
#   decision: routed to <station> — next action in one short line
```
