# Spec Checklist — agentskills.io Specification, operationalized

Source of truth: https://agentskills.io/specification (fetched live via the
agentskills.io MCP when available; this file is the distilled, checkable form).

Each row: the spec rule → the exact check the validator performs → check-id →
severity when violated. Check-ids are stable; scripts/validate.js and
scripts/inventory.js emit them verbatim.

## Frontmatter

| Spec rule | Check | Check-id | Severity |
|---|---|---|---|
| `SKILL.md` required, YAML frontmatter followed by Markdown body | File exists and parses with `--- ... ---` frontmatter | `fm-present` | fail |
| `name` required, 1–64 chars, lowercase `a-z`/`0-9`/hyphens only | Regex + length check | `fm-name-valid` | fail |
| `name` must not start/end with a hyphen or contain `--` | Regex: no leading/trailing `-`, no `--` | `fm-name-valid` | fail |
| `name` must match the parent directory name | `fm.name === basename(skillDir)` | `fm-name-matches` | fail |
| `description` required, 1–1024 chars, non-empty, describes what + when | Length + placeholder check (`TODO`/`TBD` rejected) | `fm-desc-nonempty` | fail |
| `compatibility` optional, ≤ 500 chars when present | Length check | `fm-compat-len` | fail |
| `metadata`, `license`, `allowed-tools` optional — no hard limits enforced | Not machine-checked | — | — |

## Body & progressive disclosure

| Spec rule | Check | Check-id | Severity |
|---|---|---|---|
| Keep main SKILL.md under ~500 lines; move detail to on-demand files | Body line count | `body-length` | fail (>500) |
| File references use relative paths from the skill root | Every **inline Markdown link** target (`[x](path)`) in SKILL.md resolves on disk. Backticked paths are **not** checked — they are usually write-targets or format names. Depth is **not** enforced | `file-refs` | fail |
| Agents load the full body on activation — keep it high-signal | Human judgment at audit time (see audit-policy.md) | — | — |

## Ecosystem rule (repo-local, learned from ii-plan-issue v0)

| Rule | Check | Check-id | Severity |
|---|---|---|---|
| Every backticked kebab-case skill name must resolve to a real skill folder in the skills root — no phantom references | Token scan against skills root | `phantom-skill-refs` | fail |
| The same rule applies to `docs/*.md` — a doc naming a missing skill sends an agent after a path that is not there | `node validate.js --docs` | `doc-phantom-skill-refs` | fail |

Heuristic: only tokens shaped `word-word[-word...]` (2+ hyphen-separated parts,
lowercase) are treated as skill refs; slash commands, paths, and prose are exempt.
A name that resolves in `agents/` counts as a persona reference, not a phantom.

## Reference validation

The spec recommends `skills-ref validate ./my-skill` (the agentskills reference
library). Use it when available; the workbench validator above works standalone
without it and covers the same frontmatter rules.

## Metadata — this skill's own status

`skill-workbench` must itself pass every check in this file. Run:

```bash
node scripts/validate.js <agents-root>/skills/skill-workbench
```
