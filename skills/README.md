# Agent Skills — canonical root

Every skill lives here once, under its kebab-case folder with a `SKILL.md`
(`name` + `description` frontmatter). A skill whose real home is elsewhere is
**linked in** rather than copied — today only `cua-driver`
(`→ C:\Users\Tiger\.cua-driver\skills\cua-driver`); `validate.js --all` validates
the real folders and explicitly names every link it skips. Harnesses consume it
via links back to the canonical folder — **and the link type matters per harness.**

## Deployment link-type matrix

| Harness | Global skills root | Link type | Project skills | Notes |
|---|---|---|---|---|
| Hermes agent | `AppData/Local/hermes/skills/` | Junction | Project rules via repo `AGENTS.md` | Reads junctions fine. |
| OpenCode (desktop + TUI) | `~/.config/opencode/skills/` | Real dirs (verified live) | `<repo>/.agents/skills/` (observed), `opencode.json` | No linking used — skills live as real folders. |
| Gemini CLI | `~/.gemini/config/skills/` | **SymbolicLink** | — | Junctions are invisible to it — a junctioned skill silently never loads. Every other entry there is a symlink; match the neighbors. Creating one needs `SeCreateSymbolicLinkPrivilege`; without it, fall back to a real-directory copy and refresh it with `~/.agents/scripts/sync-harness-skills.ps1`. |
| Antigravity (IDE) | Same as Gemini CLI (`~/.gemini/config/skills/`) | **SymbolicLink** | No dedicated skills dir found on disk (searched 2026-09-12); consumes the Gemini root | Same symlink rule; fix applies with no restart. Same copy fallback applies. |
| Freebuff desktop | Builtins + repo-local skills dir (e.g. `<repo>/skills/`; `.agents/skills/` also recognized) | n/a (real dirs) | Project-scoped by design — no global skills dir; skills resolve from the repo's local skills folder(s) plus the harness builtins. |

## Global Issue-to-PR Pipeline (Stations I–VII + system skills)

The canonical delivery pipeline lives in numbered folders (`i-pick-issue` through `vii-prune-artifacts`). **A numbered prefix means the skill is a step in the chain, invoked in order — I → II → III → IIIB → IV → V → VI → VII.** Everything without a numeral is a system skill: the `pipeline-triage` state gate and the `create-issue` intake branch.
Detailed documentation of the entire pipeline, station contracts, and Hebrew reporting is in:
👉 [`issue-to-pr-skill-workflow.md`](../docs/issue-to-pr-skill-workflow.md)

| Step | Canonical Name | Purpose |
|---|---|---|---|
| **Gate** (not numbered, runs before I) | `pipeline-triage` | State gate — inspect git/PR state, start a missing `coderabbit` review early, route to the one station that resumes or closes the work |
| **I** | `i-pick-issue` | Pick & Orchestrate — Discovery (backlog mapping, prioritizing) → operator picks the issue → execution-mode gate → drives II–VII |
| **Intake** (branch off I, not numbered) | `create-issue` | Intake branch — raw idea → researched GitHub issue (`ready-for-agent`); its output re-enters Discovery |
| **II** | `ii-plan-issue` | Define & Plan (ECC right-sizing, spec, constraints, tasks/plan.md) |
| **III** | `iii-build-plan` | Build (TDD, atomic commits, skill routing, code simplification) |
| **IIIB** | `iiib-iterate-after-build` | Iterate After Build (free-text corrections on a fresh build → specialist fix loop, no push) |
| **IV** | `iv-review-build-and-pr` | Review, Verify & Ship (multi-axis review, test gate, push branch, open PR) |
| **V** | `v-babysit-pr-and-merge` | Babysit PR & Merge (CodeRabbit 1-round tracking, triage, squash merge, pull base) |
| **VI** | `vi-present-pr` | Present PR (standalone ELI5 HTML showcase & verification guide; absorbs the `explain` builtin) |
| **VII** | `vii-prune-artifacts` | Prune Artifacts (sweep stale per-issue scratch & closed plans) |

## Deploying a new skill

One command covers both harness roots — Junction for Hermes, SymbolicLink for
Gemini CLI / Antigravity:

```powershell
.\scripts\sync-harness-skills.ps1 -Name <name>    # one skill
.\scripts\sync-harness-skills.ps1 -All            # every skill in this root
.\scripts\sync-harness-skills.ps1 -All -Check     # report only, nothing written
```

Verify with `Get-Item <path> | Select-Object LinkType, Target` — Gemini's entry
must read `SymbolicLink`. Creating a SymbolicLink needs
`SeCreateSymbolicLinkPrivilege` (an admin shell); without it the script falls back
to a real-directory copy in the Gemini root, which does **not** track canonical
edits — re-run the script after editing any skill that ended up as a copy.
Learned 2026-09-12 debugging `vii-prune-artifacts`.
