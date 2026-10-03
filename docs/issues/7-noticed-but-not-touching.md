# NOTICED-BUT-NOT-TOUCHING — Issue #7

Candidates spotted while building but deliberately left untouched. Any station may append an
`open` row; only Station VI (`vi-close-pipeline`) resolves rows.

| ID | Candidate | Discovered at | Evidence | Status | Resolution |
|---|---|---|---|---|---|
| N1 | `config/coderabbit/.coderabbit.yaml` carries a stale pointer comment: it says the pipeline still writes PR titles itself and cites `skills/iv-review-build-and-pr/SKILL.md:137` — that line number was already wrong, and Issue #7 has now changed the behaviour the comment describes. | Station III (T1) | `config/coderabbit/.coderabbit.yaml:57` (comment above `auto_title_placeholder`) | open | — |

**Why it was not fixed here:** the file is owned by closed Issue #6 and Issue #7 lists
"any change to `.coderabbit.yaml`" as explicitly out of scope. Editing it would have been a silent
side change (AGENTS.md rule 5). The comment is now doubly stale: wrong line number, and wrong
description of what the pipeline does.