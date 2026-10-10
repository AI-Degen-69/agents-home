# create-issue — Intake (not a numbered station)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Turn one raw operator idea into one researched, publishable GitHub issue
with a `[TAG] short plain-English summary` title and only relevant existing
labels — without a draft-approval pause. The PR title stays `@coderabbitai`
until CodeRabbit writes the final title.

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
3. Ambiguity goes to **Open questions** in the body — that is how unclear intent is resolved, not by a prerequisite label. Add `needs-answers` only when the issue has open questions and that label exists; never block publication for it.
4. Publishes immediately with a tagged title and only relevant existing labels (`gh label list` first; no label at all when nothing fits).
5. Posts the CodeRabbit plan prompt as its own comment (body only, skipped only for genuinely trivial work; no wait, no retry).
6. Reports back per the output contract in `SKILL.md`.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (workflow, quality bar, output contract). |
| `references/issue-tracker.md` | Intake template + `gh` command conventions (single source of truth for the body). |
| `references/coderabbit-plan-prompt.md` | The canonical `@coderabbitai plan` prompt (body only — never post the file as-is). |
| `scripts/grade.js` | Deterministic grader (`audit` / `case`, zero dependencies). |
| `evals/` | Eval set (`evals.json`), test plan (`intake.md`), snapshots + `iteration-1/` results. |

## Quality bar

An issue is ready for an agent when a fresh agent with only the issue + repo
access can start work without asking the operator anything: a `[TAG]` title, real file paths,
an explicit out-of-scope line, and acceptance criteria ending in a runnable
verification command.

## Example

```bash
/create-issue Retry failed uploads three times before giving up
# → researches deploy code, publishes issue #N with a tagged title and relevant labels,
# posts the plan request, reports back with link + next step (/i-pick-issue)
```
