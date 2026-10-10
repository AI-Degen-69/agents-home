# ii-plan-issue — Station II (Define & Plan)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Turns one GitHub issue into an airtight executable plan: right-sized scope,
locked constraints, mapped interfaces, and `tasks/plan.md` — then hands off
to build.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).
> Wayfinding (sub-issue edges): [`references/issue-tracker.md`](./references/issue-tracker.md).

## Pipeline position

- **Station:** II of VI.
- **Previous:** `i-pick-issue` (Station I — or the `create-issue` intake branch).
- **Next:** `iii-build-plan auto` (Build).

## When to use / when not

| Use when | Don't use when |
|---|---|
| A GitHub issue needs to become an executable plan | No issue yet — brand-new idea → `create-issue` |
| Resuming planning on an open issue with new context | Plan already exists and code is green → `iii-build-plan` |
| Right-sizing scope before any code is written | The tree is dirty with unknown work → `pipeline-triage` first |

## How it works (short)

1. Fetches the issue (`gh issue view --comments`), checks a clean tree,
   claims it, opens the `i<number>/<slug>` feature branch.
2. Consults any `coderabbitai` plan comment as a non-binding hint —
   maps its layout, spot-checks every path/symbol/line, merges its tasks
   down to 3–4, treats dangling assumption refs as `[UNVERIFIED]`.
3. Right-sizes (Tiny / Small / Standard / Large), detects stack + test
   runner, resolves Open questions from code (asks the operator only what
   code cannot answer).
4. Locks `CONSTRAINTS.md` (+ `SPEC.md` for Standard/Large), writes
   `tasks/plan.md` + `tasks/todo.md` with a dependency graph and
   adopted/rejected/UNVERIFIED CodeRabbit notes.
5. Reports what's planned grouped by tag (new / changed / removed) — see the report template in `SKILL.md`.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (planning protocol, CodeRabbit step 0A, output contract). |
| `references/issue-tracker.md` | Pointer to the canonical tracker doc (sub-issue `blocked-by` wayfinding). |
| `scripts/grade.js` | Deterministic grader (`audit` / `case`, zero dependencies). |
| `evals/` | Eval set (`evals.json`), test plan (`intake.md`), snapshots + `iteration-1/` results. |

## Quality bar

A fresh builder with only the issue, the repo, and `tasks/plan.md` can
start task 1 with zero questions: scope is sized, interfaces are mapped,
constraints are locked, every task has an explicit verification method.

## Example

```bash
/ii-plan-issue 42
# → claims #42, branches i42/<slug>, consults the CodeRabbit comment if present,
#   locks CONSTRAINTS.md, writes tasks/plan.md, hands off to /iii-build-plan auto
```
