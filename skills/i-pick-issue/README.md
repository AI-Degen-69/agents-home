# i-pick-issue — Station I (Pick & Orchestrate)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

The single entry point for Issue work. Lists open issues, groups them by
domain, recommends the next one by dependency order, takes the operator's
pick and execution mode, then orchestrates Stations II through VI.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).

## Pipeline position

- **Station:** I of VI (single entry point for Issue work).
- **Previous:** `pipeline-triage` — only when the tree is dirty, commits are
  unpushed, or a PR is open.
- **Next:** `ii-plan-issue <issue-id>` (Plan).

## When to use / when not

| Use when | Don't use when |
|---|---|
| Any work that starts from (or ends as) a GitHub issue + PR | Quick questions, small fixes, exploration → `using-agent-skills` |
| Choosing what to build next from the backlog | Brand-new idea with nothing to pick → `create-issue` first |
| Driving stations II→VI in step-by-step or full mode | Repo carries unfinished work → `pipeline-triage` first |

## How it works (short)

1. **Discovery first, always** — lists open issues (`gh issue list`),
   groups by domain/risk/dependencies, recommends one, halts for the
   operator's pick. Never picks silently.
2. **Execution-mode gate** — step-by-step (halt after every station) or full
   orchestration (II→VI end-to-end with per-station reports).
3. **Orchestrates the chain** — hands off to II (plan), III (build),
   IIIB (feedback loop as needed), IV (review + PR), V (babysit + merge),
   VI (closeout).
4. Reports per the output contract in `SKILL.md`.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (Discovery, mode gate, orchestration steps, output contract). |
| `evals/evals.json` | Eval set for the station. |

## Quality bar

Every invocation starts with Discovery; no station starts before the
operator picked an issue AND a mode. Ad-hoc requests are routed away in
one line, never pulled into the chain.

## Example

```bash
/i-pick-issue
# → maps the backlog by domain, recommends #N with rationale,
#   operator picks issue + mode, chain starts at /ii-plan-issue N
```
