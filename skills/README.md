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
| OpenCode (desktop + TUI) | `~/.config/opencode/skills/` | Junction for canonical skills; ECC-pack folders stay real | `<repo>/.agents/skills/` (observed), `opencode.json` | Reads Junctions fine (verified live). Any correct link kind counts as ok; stale copies are replaced by `sync-harness-skills.ps1 -Harness opencode`. |
| Gemini CLI | `~/.gemini/config/skills/` | **SymbolicLink** | — | Junctions are invisible to it — a junctioned skill silently never loads. Every other entry there is a symlink; match the neighbors. Creating one needs `SeCreateSymbolicLinkPrivilege`; without it, fall back to a real-directory copy and refresh it with `~/.agents/scripts/sync-harness-skills.ps1`. |
| Antigravity (IDE) | Same as Gemini CLI (`~/.gemini/config/skills/`) | **SymbolicLink** | No dedicated skills dir found on disk (searched 2026-09-12); consumes the Gemini root | Same symlink rule; fix applies with no restart. Same copy fallback applies. |
| Freebuff desktop | Builtins + repo-local skills dir (e.g. `<repo>/skills/`; `.agents/skills/` also recognized) | n/a (real dirs) | Project-scoped by design — no global skills dir; skills resolve from the repo's local skills folder(s) plus the harness builtins. |

## Global Issue-to-PR Pipeline (Stations I–VI + system skills)

The canonical delivery pipeline lives in numbered folders (`i-pick-issue` through `vi-close-pipeline`). **A numbered prefix means the skill is a step in the chain, invoked in order — I → II → III → IIIB → IV → V → VI.** Everything without a numeral is a system skill: the `pipeline-triage` state gate, the `create-issue` intake branch, and the ad-hoc `present-pr` visual presentation skill.
Detailed documentation of the entire pipeline and its reporting rules is in:
👉 [`issue-to-pr-skill-workflow.md`](../docs/issue-to-pr-skill-workflow.md) — it summarizes the rules and points to each station's local-only template for the exact Hebrew shape.

| Step | Canonical Name | Purpose |
|---|---|---|---|
| **Gate** (not numbered, runs before I) | `pipeline-triage` | State gate — inspect git/PR state, start a missing `coderabbit` review early, route to the one station that resumes or closes the work |
| **I** | `i-pick-issue` | Pick & Orchestrate — Discovery (backlog mapping, prioritizing) → operator picks the issue → execution-mode gate → drives II–VI |
| **Intake** (branch off I, not numbered) | `create-issue` | Intake branch — raw idea → researched GitHub issue (`ready-for-agent`), then posts its own `@coderabbitai plan` request (prompt body only; skipped for trivial docs-only issues; retried once if no reply lands); its output re-enters Discovery |
| **II** | `ii-plan-issue` | Define & Plan (ECC right-sizing, spec, constraints, reads any `coderabbitai` plan comment as a non-binding suggestion, tasks/plan.md) |
| **III** | `iii-build-plan` | Build (TDD, atomic commits, skill routing, code simplification) |
| **IIIB** | `iiib-iterate-after-build` | Iterate After Build (free-text corrections on a fresh build → specialist fix loop, no push) |
| **IV** | `iv-review-build-and-pr` | Review, Verify & Ship (multi-axis review, test gate, push branch, open PR) |
| **V** | `v-babysit-pr-and-merge` | Babysit PR & Merge (CodeRabbit 1-round tracking, triage, squash merge, pull base) |
| **VI** | `vi-close-pipeline` | Close Pipeline (signal-based prune in any layout, issue close, on-the-spot dead-code exception, Clean Exit Gate — base branch pushed & spotless) |
| ad-hoc (not numbered) | `present-pr` | Visual HTML presentation / explain-mode — suggested by Station VI, runnable any time |

## Deploying a new skill

One command covers every harness root — Junction for Hermes and OpenCode,
SymbolicLink for Gemini CLI / Antigravity (`-Harness hermes|gemini|opencode|all`;
default is `all`, the historical name `both` = Hermes+Gemini only):

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

## Syncing the pipeline into a project

`issue-to-pr-skills` is a **published** repo: it ships to GitHub and gets cloned by
people who do not have `C:\Users\Tiger\.agents` on disk. Symlinks into a personal
home folder would break for every one of them, and `verify-mirror.js` explicitly
fails on any reparse point in the target — so that repo holds real copies by design.

**Its own scripts own that job. Do not re-implement them here.**

```powershell
cd C:\Users\Tiger\issue-to-pr-skills
npm run validate:mirror   # verify-mirror.js + sync-from-canonical.js --check
npm run sync              # copy from canonical, applying the REWRITE table
npm run check             # validate + validate:mirror — the release gate
```

Two rules those scripts encode, both learned by breaking them:

- **The `REWRITE` table is not optional.** They rename `docs/issue-to-pr-skill-workflow.md`
  to `docs/pipeline.md` on the way in. A plain file copy reverts that and breaks the
  pack's links — and `verify-mirror.js` will not catch it, because it applies REWRITE to
  *both* sides and therefore compares equal. Only `sync-from-canonical.js --check` sees
  it. Measured 2026-09-30: a naive copy reverted 10 station READMEs.
- **`results.json` must not exist in the pack.** `sync-from-canonical.js` merely skips
  it; `verify-mirror.js` fails on it as an extra file. The two scripts disagree, and the
  stricter one is the contract.

The one thing neither script can check is its own skill list. `verify-mirror.js` and
`sync-from-canonical.js` hard-code the same 46 names and guard against each other
drifting, but nothing compares that list to the real skill graph — so a station can
start referencing a new helper and both lists stay agreed on the old set.

`scripts/pipeline-closure.js` closes that gap. It derives the set transitively from
the stations (a reference = a backticked token naming a real skill folder, the same
convention `validate-lib.js` uses), skipping `evals/snapshots/` and `evals/iteration-*`
because those are historical baselines:

```powershell
node .\scripts\pipeline-closure.js                                   # 10 stations + 36 helpers
node .\scripts\pipeline-closure.js --json                            # machine-readable
node .\scripts\pipeline-closure.js --check-list --project <path>     # list vs real graph
```

**Why it matters:** `verification-before-completion` was declared in
`verify-mirror.js`, in `sync-from-canonical.js`, and in
`docs/issue-to-pr-skill-workflow.md` as a Station IIIB dependency — while no live file
in `iiib-iterate-after-build` named it. Both hand-lists agreed with each other and with
the doc, and all three were wrong about the skill. `--check-list` now fails on that
shape; the fix was one reference added to IIIB step 6, which also made the doc true.

