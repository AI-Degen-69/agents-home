# NOTICED-BUT-NOT-TOUCHING — Issue #7

Candidates spotted while building but deliberately left untouched. Any station may append an
`open` row; only Station VI (`vi-close-pipeline`) resolves rows.

| ID | Candidate | Discovered at | Evidence | Status | Resolution |
|---|---|---|---|---|---|
| N1 | `config/coderabbit/.coderabbit.yaml` carries a stale pointer comment: it says the pipeline still writes PR titles itself and cites `skills/iv-review-build-and-pr/SKILL.md:137` — that line number was already wrong, and Issue #7 has now changed the behaviour the comment describes. | Station III (T1) | `config/coderabbit/.coderabbit.yaml:57` (comment above `auto_title_placeholder`) | published | #24 |
| N2 | **The CodeRabbit playbook is factually wrong on this account, measured live.** Three claims in `config/coderabbit/README.md` (closed Issue #5) were disproved on PR #23: (a) a *private* repo on this account returned **5 real inline findings**, not the documented "summarization-only"; (b) the run config reported `Plan: Advanced`, not Free; (c) `@coderabbitai configuration` **worked** and returned full resolved YAML, rather than being refused as chat-gated. Additionally the resolved config sources `reviews.*` from **Organization UI**, not from the committed `.coderabbit.yaml` — so the committed file may not be governing this repo at all. The playbook's `SUMMARY_ONLY` guidance built on the (a) assumption is now known to be based on an untested premise. | Station V (PR #23 triage) | `config/coderabbit/README.md:86,87,161` vs. CodeRabbit run config + `@coderabbitai configuration` output on PR #23 | published | #24 |

**Why it was not fixed here:** the file is owned by closed Issue #6 and Issue #7 lists
"any change to `.coderabbit.yaml`" as explicitly out of scope. Editing it would have been a silent
side change (AGENTS.md rule 5). The comment is now doubly stale: wrong line number, and wrong
description of what the pipeline does.