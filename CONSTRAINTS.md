# CONSTRAINTS — Silent improvement: self-improve-loop delivery gate

Branch: main (silent, issue-less work) | no issue

## Stack (auto-detected)
- Node.js scripts (gate + test), hermetic `gh`/`git` stubs in tests.
- No runtime deps; `node --test` is the verification runner.
- This is a skill-contract + tooling change inside `~/.agents/skills/self-improve-loop`.

## Zero regressions
- The delivery gate test suite must stay green: `node --test skills/self-improve-loop/evals/verify-delivered-prs.test.js` → 15/15 pass, 0 fail.
- The gate script must be runnable as documented: `node skills/self-improve-loop/scripts/verify-delivered-prs.js --manifest loop-delivery.json`.
- No existing skill contract outside `self-improve-loop` may be touched by this work.

## Hard boundaries
1. **Step 8 is mandatory.** The loop may not report a run finished, may not start the next iteration, and may not record an iteration as delivered without a green exit from the gate.
2. **The manifest records intent, not observation.** Never edit `loop-delivery.json` to match a wrong remote state — that is the exact defect the gate exists to catch.
3. **PR title rule is frozen.** Step 5 must open PRs with `[IMPROVE] <scope>: <summary>`. Never `@coderabbitai` in the title. Review is requested by comment, not by title.
4. **Review wait is bounded.** Step 6 caps at 10 minutes; on timeout, note it, skip the remaining review-response steps, and continue to Step 7. Never wait indefinitely.
5. **Cleanup is guarded.** Before `git stash`/`git clean`, run `git status --porcelain` and stop on anything the loop did not create — that is user work. Remove only the loop's throwaway artifacts (keep `SHARED_TASK_NOTES.md`).
6. **Throwaway files stay out of commits.** `loop-delivery.json` and `SHARED_TASK_NOTES.md` are the loop's runtime working files. They must be gitignored; a committed manifest would be stale the moment the remote moves.
7. **Anti-cheat** — never skip, disable, or delete an assertion to make a run pass. Never edit test snapshots or recorded results to hide a failure.
8. **No scope expansion.** Do not fold unrelated improvements into this commit. This work is the 8-step cycle + the delivery gate + the two throwaway-file ignores.

## Terminology
- **Delivery gate** = Step 8 of the self-improve-loop: re-read every created PR from the remote and compare it field by field against `loop-delivery.json`.
- **Throwaway files** = `loop-delivery.json`, `SHARED_TASK_NOTES.md` — the loop's own runtime working files, kept out of commits.
