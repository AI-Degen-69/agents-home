# CONSTRAINTS — Issue #17 (Small docs sync)

- Zero regressions: docs-only change; no test runner in this repo. Verification is the
  acceptance commands declared in `tasks/plan.md` (T4): the two `Select-String` counts,
  stale-phrase searches with zero matches, no Hebrew chars in edited sections,
  and `git diff --stat` showing only the allowed docs files.
- Anti-cheat: no tests to skip, no assertions to delete, no linters to suppress.
- Dependencies: no new external dependencies.
- Scope: touch only `docs/issue-to-pr-skill-workflow.md` and, if its cross-reference
  misleads, `skills/README.md`. Station `SKILL.md` files, `references/output-template.md`
  files, sync/mirror scripts, translations, and the `i-pick-issue` station stay unchanged.
- No Hebrew template text is quoted or copied into the docs — English descriptions only.
