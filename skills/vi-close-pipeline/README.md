# vi-close-pipeline — Station VI (Close Pipeline)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Post-merge closeout: verifies the issue is closed, sweeps stale
artifacts by signal (any layout), handles dead code on the spot, and
ends with the mandatory Clean Exit Gate — base branch, pushed, synced,
spotless.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).

## Pipeline position

- **Station:** VI of VI — the pipeline ends here.
- **Previous:** `v-babysit-pr-and-merge` (Babysit & Merge).
- **Next:** none. Optional ad-hoc follow-up (outside the pipeline):
  `/present-pr <id>` — visual presentation, never mandatory.

## When to use / when not

| Use when | Don't use when |
|---|---|
| PR just merged, leftovers + issue state need closing | PR not merged yet → `v-babysit-pr-and-merge` |
| Merged branch / worktree / stale plan files lying around | Unpushed commits, no PR → `iv-review-build-and-pr` |
| Stale `tasks/plan.md` with the issue already closed | Unfinished plan with the issue still open → `iii-build-plan` |

## How it works (short)

1. **Step 0 gates everything:** PR must be `MERGED`; issue CLOSED —
   or closed now via the documented missing-`Closes` path. Ambiguous
   tracker state → ask, never guess.
2. **Signal-based discovery** (filename / content / history signals,
   never folder names) finds prune candidates; the **two-gate test**
   deletes only when work is Closed AND zero inbound references hold.
3. **Knowledge is untouchable** — presentations and research are kept
   forever. Dead code is the single approved code-change exception:
   zero-reference proof + targeted tests, or listed as suspect-only.
4. Commits keep concerns separate (yours only — foreign dirt is listed,
   never bundled), then the **Clean Exit Gate**: pushed, on base,
   empty status, synced, no dead branches, no related stashes.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (gates, discovery, preservation, dead code, exit gate, Hebrew output contract). |
| `scripts/grade.js` | Deterministic grader (`audit` / `case`, zero dependencies). |
| `evals/` | Eval set (`evals.json`), test plan (`intake.md`), snapshots + `iteration-1/` results. |

## Quality bar

The repo carries only live knowledge; the folder sits on a clean synced
base branch; the Hebrew report names the PR, the issue, what was cleaned
vs kept — see the report template in `SKILL.md`.

## Example

```bash
/vi-close-pipeline 42
# → confirms merge, closes #42 if needed, prunes stale artifacts,
#   handles dead code, passes the exit gate — pipeline closed
```
