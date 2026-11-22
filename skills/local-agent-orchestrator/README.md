# local-agent-orchestrator — small-task orchestrator

Not a numbered station. The front door for small work: read the repo, decide whether to act or send a prompt, route that prompt to the cheapest capable model, then carry the git work to a merged PR.

| Responsibility | Rule |
| --- | --- |
| Git | branch → commit → push → PR → merge → clean up |
| Session | fresh window when scope changes, same window for one hot slice |
| Quota | free and fixed pools first, hard caps guarded |
| Routing | task class → grade → cheapest model on an installed harness |

## Files

| File | Use |
| --- | --- |
| `SKILL.md` | the workflow |
| `references/repo-state-routing.md` | git/PR checks, stop rules, routing table |
| `references/report-format.md` | chat report shape (Hebrew variant beside it) |
| `references/models.md` | live inventory and quota order |
| `references/capability.md` | grades and task-class matrix |
| `references/models-research-handbook.md` | grading method for a new model |
| `scripts/models-sync.mjs` | diff live models against the inventory (`--check` exits 1 on drift) |

## Maintenance

```powershell
node scripts/models-sync.mjs           # what drifted
node scripts/models-sync.mjs --check   # CI gate
node scripts/models-sync.mjs --self-test
```

The inventory is generated from `opencode models` and the harness pickers. Add a model only when the command prints it. Grades stay hand-written in `capability.md`.

## Boundaries

- Reads state, never absorbs another session's changes.
- Deletes nothing without an audit and explicit approval.
- Recommends only models present in the live inventory.
- Absorbs the old `pipeline-triage` state gate and `model-routed-triage` routing table.
