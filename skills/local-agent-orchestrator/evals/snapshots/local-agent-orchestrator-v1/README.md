# local-agent-orchestrator — small-task orchestrator

Not a numbered station. The front door for small work: read the repo, decide whether to act or send a prompt, route that prompt to the cheapest capable model, then carry the git work to a merged PR.

| Responsibility | Rule |
| --- | --- |
| Git | branch → commit → push → PR → merge → clean up |
| Session | fresh window when scope changes, same window for one hot slice |
| Quota | free and fixed pools first, but only when the pool holds the required grade. No free lane reaches S |
| Routing | task class → grade → cheapest model on an installed harness |

## Files

| File | Use |
| --- | --- |
| `SKILL.md` | the workflow |
| `references/repo-state-routing.md` | git/PR checks, stop rules, routing table |
| `references/report-format.md` | chat report shape |
| `references/report-format-hebrew.md` | the Hebrew variant of the same report |
| `references/models.md` | live inventory and quota order |
| `references/capability.md` | grades, task-class matrix, Orchestrator A/B result |
| `references/models-research-handbook.md` | grading method for a new model |
| `references/anti-patterns.md` | routing mistakes already made here |
| `references/deletion-audit.md` | the procedure before removing a model or harness |
| `evals/models.evals.json` | routing and report-shape evals |
| `evals/repo-state.evals.json` | repo-state triage evals |
| `evals/repo-triage.test.js` | assertions for `repo-triage.js` |
| `scripts/models-sync.mjs` | diff live models against the inventory (`--check` exits 1 on drift) |
| `scripts/repo-triage.js` | one-pass git/PR/stash/issue collector |
| `scripts/grade.js` | skill audit and eval grading |
| `scripts/benchlm-snapshot.mjs` | BenchLM figures per model, for grading a new one |

## Maintenance

```powershell
node scripts/models-sync.mjs           # what drifted
node scripts/models-sync.mjs --check   # CI gate
node scripts/models-sync.mjs --self-test

node scripts/repo-triage.js --json     # current repo state in one pass
node scripts/grade.js audit --skill SKILL.md
node scripts/benchlm-snapshot.mjs --usage
```

The inventory is generated from `opencode models` and the harness pickers. Add a model only when the command prints it. Grades stay hand-written in `capability.md`.

`benchlm-snapshot.mjs` needs `BENCHLM_DATA_KEY` in the environment or in the gitignored `.env` beside the skill. Nothing else in the skill depends on it.

## Boundaries

- Reads state, never absorbs another session's changes.
- Deletes nothing without an audit and explicit approval.
- Recommends only models present in the live inventory.
- Absorbs the old `pipeline-triage` state gate and `model-routed-triage` routing table.
