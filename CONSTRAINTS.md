# CONSTRAINTS — Issue #10 (Tiny docs fix)

- Zero regressions: docs-only change; no test runner in this repo. Verification is the
  two greps + read-back declared in `tasks/plan.md` (T2).
- Anti-cheat: no tests to skip, no assertions to delete, no linters to suppress.
- Dependencies: no new external dependencies.
- Scope: touch only the Step 0.1 budget sentence in
  `skills/iv-review-build-and-pr/SKILL.md`. The 8-call cap, the 2-failure stop,
  the browser flow, and any public-pack copy stay unchanged.
