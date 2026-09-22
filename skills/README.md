# Agent Skills — canonical root

Every skill lives here once, under its kebab-case folder with a `SKILL.md`
(`name` + `description` frontmatter). Harnesses consume it via links back to
the canonical folder — **and the link type matters per harness.**

## Deployment link-type matrix

| Harness | Global skills root | Link type | Project skills | Notes |
|---|---|---|---|---|
| Hermes agent | `AppData/Local/hermes/skills/` | Junction | Project rules via repo `AGENTS.md` | Reads junctions fine. |
| OpenCode (desktop + TUI) | `~/.config/opencode/skills/` | Real dirs (verified live) | `<repo>/.agents/skills/` (observed), `opencode.json` | No linking used — skills live as real folders. |
| Gemini CLI | `~/.gemini/config/skills/` | **SymbolicLink** | — | Junctions are invisible to it — a junctioned skill silently never loads. Every other entry there is a symlink; match the neighbors. |
| Antigravity (IDE) | Same as Gemini CLI (`~/.gemini/config/skills/`) | **SymbolicLink** | No dedicated skills dir found on disk (searched 2026-09-12); consumes the Gemini root | Same symlink rule; fix applies with no restart. |
| Freebuff desktop | Builtins + `<repo>/.agents/skills/` | n/a (real dirs) | Project-scoped by design — no global skills dir; skills resolve from the repo's `.agents/skills/` plus the harness builtins. |

## Global Issue-to-PR Pipeline (Station X + Stations I–VII)

The canonical delivery pipeline lives under Roman numeral folders (`i-create-issue` through `vii-present-pr`), accompanied by the overarching Orchestrator & Discovery skill (`x-workflow-issue`).
Detailed documentation of the entire pipeline, station contracts, and Hebrew reporting is in:
👉 [`issue-to-PR-pipeline.md`](file:///C:/Users/Tiger/.agents/docs/issue-to-PR-pipeline.md)

| Station | Canonical Name | Purpose |
|---|---|---|---|
| **Entry** | `pipeline-triage` | Dirty-repo triage (inspect git state, start a missing `coderabbit` review early, route to the right station) |
| **X** | `x-workflow-issue` | Pipeline Orchestrator & Discovery (Backlog mapping, prioritizing, driving II–VII) |
| **I** | `i-create-issue` | Intake raw idea → researched GitHub issue (`ready-for-agent`) |
| **II** | `ii-plan-issue` | Define & Plan (ECC right-sizing, spec, constraints, tasks/plan.md) |
| **III** | `iii-build-plan` | Build (TDD, atomic commits, skill routing, code simplification) |
| **IV** | `iv-review-build-and-pr` | Review, Verify & Ship (multi-axis review, test gate, push branch, open PR) |
| **V** | `v-babysit-pr-and-merge` | Babysit PR & Merge (CodeRabbit 1-round tracking, triage, squash merge, pull base) |
| **VI** | `vi-prune-artifacts` | Prune Artifacts (sweep stale per-issue scratch & closed plans) |
| **VII** | `vii-present-pr` | Present PR (interactive standalone ELI5 HTML showcase & verification guide; absorbs the `explain` builtin) |

## Deploying a new skill

```powershell
New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\hermes\skills\<name>" -Target "$env:USERPROFILE\.agents\skills\<name>"
New-Item -ItemType SymbolicLink -Path "$env:USERPROFILE\.gemini\config\skills\<name>" -Target "$env:USERPROFILE\.agents\skills\<name>"
```

Verify with `Get-Item <path> | Select-Object LinkType, Target` — Gemini's entry
must read `SymbolicLink`. Learned 2026-09-12 debugging `prune-artifacts`.
