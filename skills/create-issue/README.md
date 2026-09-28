# create-issue — Intake (not a numbered station)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Turn one raw operator idea into one researched, publishable GitHub issue
labeled `ready-for-agent` — without a draft-approval pause.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).
> Tracker template + conventions: [`references/issue-tracker.md`](./references/issue-tracker.md).

## Pipeline position

- **Position:** Intake branch — not a numbered station.
- **Invoked from:** Station I (`i-pick-issue`) when the backlog has nothing
  worth picking, or directly by the operator (`/create-issue <idea>`).
- **Hands off to:** `i-pick-issue` — the new issue re-enters Discovery.
- **Primes:** Station II — posts the `@coderabbitai plan` request so a plan
  is waiting in the issue comments by planning time.

## When to use / when not

| Use when | Don't use when |
|---|---|
| Brand-new idea, nothing to pick in the backlog | The work starts from an existing issue → `i-pick-issue` |
| A vague "make X better" that needs shaping | A quick question or exploration → `using-agent-skills` |
| Splitting one big idea into a family of issues | Work is already in flight (dirty tree / open PR) → `pipeline-triage` first |

## How it works (short)

1. Reads `references/issue-tracker.md` — template + `gh` conventions.
2. Researches the repo first — every issue cites real paths with line numbers.
3. Ambiguity goes to **Open questions** in the body + `needs-answers` label — never blocks publication.
4. Publishes immediately (`gh issue create ... --label ready-for-agent`).
5. Posts the CodeRabbit plan prompt as its own comment (body only, skipped for trivial docs-only issues, retried once on silence).
6. Reports back in everyday Hebrew per the output contract in `SKILL.md`.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (workflow, quality bar, Hebrew output contract). |
| `references/issue-tracker.md` | Intake template + `gh` command conventions (single source of truth for the body). |
| `references/coderabbit-plan-prompt.md` | The canonical `@coderabbitai plan` prompt (body only — never post the file as-is). |
| `scripts/grade.js` | Deterministic grader (`audit` / `case`, zero dependencies). |
| `evals/` | Eval set (`evals.json`), test plan (`intake.md`), snapshots + `iteration-1/` results. |

## Quality bar

An issue is `ready-for-agent` when a fresh agent with only the issue + repo
access can start work without asking the operator anything: real file paths,
an explicit out-of-scope line, and acceptance criteria ending in a runnable
verification command.

## Example

```bash
/create-issue Retry failed uploads three times before giving up
# → researches deploy code, publishes issue #N labeled ready-for-agent,
#   posts the plan request, reports back in Hebrew with link + next step (/i-pick-issue)
```
