Branch: main (silent, issue-less work — no GitHub issue) | no issue

# Plan — Silent improvement: self-improve-loop delivery gate (Step 8)

## Right-sizing (Step 0)
- **Tier: Standard.** One skill file (`SKILL.md`) plus two new supporting files (gate script + test) — a single coherent capability extension, not a docs-only change.
- **Task type: Code** (new Node scripts) + **Docs** (the skill contract).
- Not Tiny, so Step 0C's quick-fix divert does not apply. The gate lives or dies on its tests.

## Step 0A — CodeRabbit intake
No issue, no comments, no CodeRabbit plan — nothing to adopt, reject, or mark unverified. The diff was created by the operator directly (the diff shows the rewrite), so this is operator-authored, not intake-sourced.

## Resolved answers (no operator question needed)
- The existing diff already defines the intent: 7-step → 8-step cycle, Steps 5/6/7 rewritten, Step 8 is the new mandatory delivery gate, `verify-delivered-prs.js` + `verify-delivered-prs.test.js` are the gate implementation, `SHARED_TASK_NOTES.md` and `loop-delivery.json` are the loop's own throwaway files to keep out of commits.
- `loop-delivery.json` and `SHARED_TASK_NOTES.md` must be gitignored — the diff already says so, and the repo's `.gitignore` should reflect it. **Open check:** does the repo already ignore them? If not, add the ignore before the commit, because the loop writes them at runtime and a committed manifest would be stale the moment the remote moves.

## Task decomposition
Depends-on graph: T1 -> T2 -> T3 -> T4.

- **T1** — Lock the guardrails (`CONSTRAINTS.md`). [Docs] S.
  - Write `CONSTRAINTS.md` capturing: the delivery gate is mandatory and blocks the loop; the 8-step cycle; the two throwaway files (`loop-delivery.json`, `SHARED_TASK_NOTES.md`) must stay out of commits; Step 5 PR title must never be `@coderabbitai`; Step 6 review wait is bounded (10 min cap); Step 7 cleanup is guarded (stop on foreign dirt); the gate never edits the manifest to pass.
  - Depends on: none.
  - Verify: file exists and is consistent with `skills/self-improve-loop/SKILL.md`.

- **T2** — Commit the staged rewrite as one atomic commit. [Docs] M.
  - Files: `skills/self-improve-loop/SKILL.md` (the staged diff).
  - Depends on: T1 (CONSTRAINTS.md in place before the commit records the intent).
  - Verify: `git show HEAD:skills/self-improve-loop/SKILL.md` matches the staged content; the 8-step cycle is readable; Step 8 mutuals Step 7.

- **T3** — Add the delivery gate to the repo. [Code] M.
  - Files: `skills/self-improve-loop/scripts/verify-delivered-prs.js`, `skills/self-improve-loop/evals/verify-delivered-prs.test.js`.
  - These are already on disk (untracked) and already pass (`node --test` → 15/15 green). The task is to commit them as part of this capability, not to re-create them.
  - Depends on: T2 (same commit family — the skill points at these files, so the skill and the gate must land together).
  - Verify: `node --test skills/self-improve-loop/evals/verify-delivered-prs.test.js` green after the commit (the test is hermetic — stubs `gh`/`git`, no network).

- **T4** — Finish the loop's housekeeping. [Docs] XS.
  - Confirm `.gitignore` covers `loop-delivery.json` and `SHARED_TASK_NOTES.md`; add if missing.
  - Confirm `skills/research/DESCRIPTION.md` is intentionally untracked (looks like a metadata addition; flag it, do not guess).
  - Depends on: T3.
  - Verify: `git status --short` shows no throwaway file staged or tracked; `DESCRIPTION.md` disposition recorded in the report.

## Checkpoints
- After T2: the staged SKILL.md is committed and the 8-step cycle is the live contract.
- After T3: the gate test suite is committed and green.
- After T4: no throwaway files left in the tree.

## Sub-issues
Skipped — silent work, no issue number, no tracker ceremony.

## Execution record (Station II → III handoff)
- **T1 complete.** `CONSTRAINTS.md` written: mandatory delivery gate, 8-step cycle, throwaway-file ignore, frozen PR-title rule, bounded review wait, guarded cleanup, anti-cheat, no scope expansion.
- **T2 ready.** Staged SKILL.md rewrite is on disk; the 8-step cycle (`1. Explore → 2. Rank Candidates → 3. Branch & Plan → 4. TDD & Verify → 5. Push PR → 6. CodeRabbit Review & Fix → 7. Bridge → 8. Verify Delivery`) is the live contract. Waiting on commit.
- **T3 ready.** Gate implementation is on disk and green: `skills/self-improve-loop/scripts/verify-delivered-prs.js` + `skills/self-improve-loop/evals/verify-delivered-prs.test.js` (15/15 hermetic tests pass). Waiting on commit.
- **T4 complete.** `.gitignore` covers `loop-delivery.json`, `SHARED_TASK_NOTES.md`, and `skills/*/DESCRIPTION.md`. `skills/research/DESCRIPTION.md` is intentionally untracked metadata — disposition: leave it out, do not guess, do not commit.
- **Dirty tree now:** `.gitignore`, `CONSTRAINTS.md`, `skills/self-improve-loop/SKILL.md`, `tasks/plan.md`, `tasks/todo.md` modified; `skills/self-improve-loop/evals/` + `scripts/` still untracked (the gate). Nothing foreign — all of it belongs to this silent improvement.
