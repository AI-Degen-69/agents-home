# local-agent-orchestrator — small-task orchestrator

Not a numbered station. The front door for small work: read the repo, decide whether to act or send a prompt, route that prompt to the cheapest capable model, then carry the git work to a merged PR.

The workflow, the four responsibilities, and the file map live in `SKILL.md`. This file holds the upkeep commands and the boundaries.

## Maintenance

```powershell
node scripts/models-sync.mjs           # what drifted
node scripts/models-sync.mjs --check   # CI gate; also a .git/hooks/pre-commit hook
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
