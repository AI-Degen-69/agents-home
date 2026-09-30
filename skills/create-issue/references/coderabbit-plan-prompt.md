# CodeRabbit Plan Prompt Template

Canonical prompt posted as a comment on newly created GitHub issues to request an implementation plan from CodeRabbit.

Single source of truth — `SKILL.md` points here. **Post the prompt body below, never this file as-is** (the wrapper would bury the `@coderabbitai` mention inside a code block). Write the body to a temp file and pass `--body-file <temp>`, or pass `--body` inline.

```text
@coderabbitai plan
Suggest an implementation plan for the upcoming coding agent (Station II / III):

1. SKELETON & PHASES: Break down the work into 2-4 atomic, vertical tasks MAXIMUM, in logical dependency order. More than four tasks is bloat — merge related steps instead of splitting them further.
2. GROUNDED SEAMS ONLY (ZERO GUESSWORK): List ONLY files, functions, CLI flags, and configuration constants that you have verified exist verbatim in the repository. Do not hallucinate or guess APIs. If any seam or signature is uncertain, label it explicitly as [UNVERIFIED] or omit it so the agent knows to inspect it. Explicitly name files that must NOT be modified. Never cite a numbered assumption, rule or design choice that you do not state in full in this same plan.
3. ASSUMPTIONS & RISKS: Give a short bullet list (one line per item) of every assumption you made and every contradiction you found between the issue description and the actual codebase (e.g. non-existent fields, schema mismatches, breaking changes to existing APIs/CLIs).
4. VERIFICATION & TDD: Specify exact test cases (with edge cases and expected assertions) and pre-existing regression test files that must pass.
5. KEEP IT SIMPLE: Favor the minimal, boring solution over new abstractions (100 lines instead of 1000).
```


