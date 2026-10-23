# Where a skill's artifact goes

Every skill that writes a file names its own path. This table is the index — find
the skill, use **that** path, never invent a sibling folder. A folder nobody
reserves dies unowned: no writer, no guard, no reader, and its contents are
invisible to every check.

Paths are relative to the project root unless they start with `~`. One folder per
artifact kind, all of them under `docs/` except the loop's own working folder.

## Documents (committed, read by a human)

| Skill | Artifact | Path | Name |
| --- | --- | --- | --- |
| `present-pr` | visual summary of a PR and the run's changes | `docs/pr-presentations/` | `<pr>-<slug>.html` |
| `explain` | visual explanation of a question, change or design (full depth, or ELI5 when the reader is new to it) | `docs/explanations/` | `<topic-slug>.html` |
| `research` | research note | `docs/research/` | `<slug>.md`; `YYYY-MM-DD-<slug>.md` only when the date is the point |
| `brainstorming` | design / spec | `docs/specs/` | `<topic>.md` |
| `writing-plans` | implementation plan | `docs/plans/` | `<topic>.md` |
| `interview-me` | intent record | `docs/interviews/` | `<topic>.md` |
| `idea-refine` | shaped idea | `docs/ideas/` | `<slug>.md` |
| `documentation-and-adrs`, `domain-modeling`, `improve-codebase-architecture` | decision record | `docs/adr/` | `<NNN>-<slug>.md` |
| `domain-modeling`, `improve-codebase-architecture` | domain glossary | `GLOSSARY.md` | fixed name, one per repo |
| `iii-build-plan`, `iv-review-build-and-pr`, `quick-fix`, `retro`, `vi-close-pipeline`, `model-routed-triage` | out-of-scope candidate ledger, one per issue | `docs/backlog/` | `i<id>-<slug>.md` |

`docs/issues/` no longer exists: every artifact that used to live there now has its
own folder above. A file numbered for an issue carries the `i` prefix (`i123-…`) so
the id reads as a reference, not as a document's own sequence number.

## Pipeline working files (in the repo, per issue)

| Skill | Artifact | Path | Name |
| --- | --- | --- | --- |
| `ii-plan-issue`, `iii-build-plan`, `planning-and-task-breakdown`, `spec-driven-development`, `pipeline-triage` | plan, todo, PR body | `tasks/` | `plan.md`, `todo.md`, `pr-body.md` |
| `planning-with-files` | persistent plan, findings, progress | repo root | `task_plan.md`, `findings.md`, `progress.md` |
| `constraint-driven-development` | the written quality bar | repo root | `CONSTRAINTS.md` |
| `retro` | coding standards | repo root | `CODING_STANDARDS.md` |
| `self-improve-loop` | candidate backlog, iteration log, delivery manifest | `self-improve/` | `SHARED_TASK_NOTES.md`, `loop-delivery.json` — the folder is `.gitignore`d |

## Agent home (never inside a project)

| Skill | Artifact | Path | Name |
| --- | --- | --- | --- |
| `skill-creator` | a new skill | `~/.agents/skills/<name>/` | `SKILL.md` + `references/` |
| `skill-workbench` | audit report | `~/.agents/skills/<name>/docs/` | `workbench-report-YYYY-MM-DD.html` |
| `system-connector` | connector to a third-party system | `~/.agents/skills/<system>/` | `SKILL.md` + `scripts/` |
| `extract-design-system` | starter token files | `design-system/` in the project | `tokens.json`, `tokens.css` (cache in `.extract-design-system/`) — never overwrite an existing system |

## Transient tooling output (never in the repo)

| Skill | Artifact | Path |
| --- | --- | --- |
| `playwright-cli` | screenshots, traces, session state | `.playwright-cli/` beside the invocation, or the system temp directory — never committed, never inside `docs/` |

## Generated state (a program reads it back, not a human)

Some skills run a script that writes a store, report or log. Those follow the
project's own state convention, not this table: `data/`, `runtime/`, `reports/`,
one `<kind>_<identity>_<stamp>` grammar, and a stamp the project's own code
produces — never a date formatted by hand inside a skill.

## Rules

1. **A skill's path is fixed.** Not "where the repo already keeps X", not "a
   sensible location" — the path above, or the project's own documented home when
   the project defines one (a project's `docs/agents/naming.md` beats this table).
2. **One home per artifact.** `pr-presentations/`, `explanations/`, `backlog/`,
   `specs/`, `plans/`, `interviews/` — never a second folder for the same kind,
   never `docs/issues/`, never the repo root as a fallback.
3. **Documents carry an id or a topic, not a date.** A date prefix is reserved for
   a record whose whole point is the day it happened (a run note, a dated
   investigation). State carries a stamp instead.
4. **A number that points at an issue carries the `i` prefix** (`i123-…`), so a
   bare number always means the document's own sequence.
5. **Transient tooling output stays out of the repo**: screenshots, traces,
   `.playwright-cli/`, temp renders — use the system temp directory.
6. **When a skill has no row here and writes a file**, add the row in the same
   change that adds the writer. A new artifact is a new row, not a decision made
   inside a script.
