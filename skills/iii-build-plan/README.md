# iii-build-plan — Station III (Build)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Executes every task in `tasks/plan.md` with type-aware routing, TDD,
atomic local commits, and simplification — no push, no PR here.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).
> Skill routing matrix: [`references/routing.md`](./references/routing.md).

## Pipeline position

- **Station:** III of VI.
- **Previous:** `ii-plan-issue` (Plan — produces `tasks/plan.md`).
- **Next:** `iv-review-build-and-pr` (Review & Verify) — or
  `iiib-iterate-after-build` first if the operator reports corrections.

## When to use / when not

| Use when | Don't use when |
|---|---|
| `tasks/plan.md` exists with open tasks | No plan yet → `ii-plan-issue` first |
| Continuing the next task in an unfinished plan | Operator reported corrections on fresh build → `iiib-iterate-after-build` |
| Resuming interrupted build work (`pipeline-triage` says so) | Code is already reviewed and pushed → `v-babysit-pr-and-merge` |

## How it works (short)

1. **Mode A (`auto`)** runs all tasks sequentially; **Mode B** (no arg)
   does the single next open task, then halts.
2. Per task: verify plan + `CONSTRAINTS.md`, ask "simplest thing that
   fully works?" first, route by domain tag (UI / backend / debug /
   perf / security / docs), implement with TDD, simplify, commit locally
   (`<type>(<scope>): <summary> (#<issue>)`), mark `[x]`.
3. Out-of-scope findings become `NOTICED-BUT-NOT-TOUCHING` one-liners —
   never silent side changes. Each one is an `open` row in the per-issue ledger; only Station VI resolves rows. Build errors route to resolver personas.
4. Reports what's changed grouped by tag (new / changed / removed / fixed) — see the report template in `SKILL.md`.

> Report rule: product changes only — no commits, hashes, tree state, tests, skill names, or file paths. Branch name stays as the work ID.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (execution protocol, routing, commit discipline, Hebrew output contract). |
| `references/routing.md` | Domain-tag → specialist-skill routing matrix. |
| `evals/evals.json` | Eval set for the station. |

## Quality bar

Every task lands as one atomic local commit, simplified, with its
verification green — and the tree contains only this issue's work when
the station hands off.

## Example

```bash
/iii-build-plan auto
# → runs tasks/plan.md top to bottom (TDD, one commit per task),
#   reports what was built + what to check, routes to review or iteration
```
