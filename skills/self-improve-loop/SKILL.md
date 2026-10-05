---
name: self-improve-loop
description: Runs an autonomous codebase improvement loop across any repository, ending with a delivery gate that re-reads every created PR from the remote. Dynamically inspects the project architecture, extracts improvement candidates, implements with TDD, and handles CodeRabbit reviews via PR looping. Use when the user asks to "self improve" a codebase, run the improvement loop, or autonomously improve/refactor a repository.
---

# Autonomous Codebase Improvement Loop

A continuous improvement cycle executing across the current repository, gated on Step 8.

```
1. Explore → 2. Rank Candidates → 3. Branch & Plan → 4. TDD & Verify → 5. Push PR → 6. CodeRabbit Review & Fix → 7. Bridge → 8. Verify Delivery
```

---

## The Improvement Cycle

### Step 1: Execute Codebase Improvement Exploration
- Run the exploration step from the upstream `skills/engineering/improve-codebase-architecture` skill if it is installed locally (source: https://github.com/mattpocock/skills/tree/main/skills/engineering/improve-codebase-architecture; its companion `skills/engineering/codebase-design` supplies the deep-module vocabulary). If it is not installed, dynamically scan the project structure.
- Inspect git commit history (`git log --oneline -n 30`) and codebase hot spots across all top-level directories.
- Look for shallow modules, seam leaks, latency bottlenecks, unhandled edge cases, or test gaps.

### Step 2: Extract & Rank Improvement Candidates
- Generate candidate cards with:
  - **Area / Files**: Path to affected files.
  - **Problem**: What causes friction, latency, or architectural shallowness.
  - **Solution**: Plain-English refactor / improvement plan.
  - **Benefits**: Locality, testability, leverage, or performance gains.
  - **Strength Badge**: `Strong`, `Worth exploring`, or `Speculative`.
- Append new candidates to the backlog in `SHARED_TASK_NOTES.md`: create it at the repository root if missing, and keep it out of commits by default — it is the loop's own working file (candidate backlog + iteration log).

### Step 3: Pick Candidate, Create Branch & Plan Review
- Select the highest-priority unaddressed candidate.
- Create git branch: `improve/loop-iter-<N>-<topic>` (or `optimize/`, `fix/`, `refactor/`).
- Formulate a clear, bounded plan:
  - Scope: $\le 3$ files, $\le 120$ lines changed.
  - Machine-decidable acceptance criteria.
  - Review plan against safety rails. Read the project's `AGENTS.md` or `README.md` to identify critical boundaries and files to avoid.

### Step 4: Implement with TDD & Verify Before Completion
- **Write Test First (RED)**: Add unit/regression test reproducing the issue or validating the new capability.
- **Implement Minimal Fix (GREEN)**: Write clean, focused implementation.
- **Verification Gate**:
  - Automatically detect the project's native test runner (e.g., `npm test`, `pytest -q`, `cargo test`) and run the test suite. Must be 100% green.
  - Run standard linting tools (e.g., `ruff check .`, `eslint`, `cargo clippy`).
  - Ensure zero test assertions were deleted or weakened.

### Step 5: Push Branch & Open GitHub PR
- Create conventional commit: `<type>(<scope>): <summary>`.
- Tag checkpoint: `loop-iter-<N>-<timestamp>`.
- Push the branch, then the checkpoint tag alone: `git push -u origin <branchName>`, then `git push origin loop-iter-<N>-<timestamp>`. Do not use `--tags` — it would push every local tag.
- Open PR via `gh pr create`:
  - Title: `[IMPROVE] <scope>: <summary>` — the conventional commit subject, so the PR is identifiable in a list. **Never put a bot mention in the title.** This step used to prescribe exactly that title, and two live PRs ended up carrying it; a clobbered title destroys the PR's identity in a list view and leaves no error. To request a review, comment `@coderabbitai review` on the PR instead.
  - Body: Include loop iteration, area, branch, a summary of why, real test output, and verification steps.
- **Record intent for the Step 8 gate.** Append an entry to `loop-delivery.json` at the repository root (create it; keep it out of commits, same as `SHARED_TASK_NOTES.md`) recording exactly what you just created:
  ```json
  { "repo": "OWNER/NAME", "prs": [ { "iteration": 1, "number": 60,
      "branch": "improve/loop-iter-1-<topic>", "title": "[IMPROVE] ...",
      "headSha": "dc76409", "tag": "loop-iter-1-<timestamp>" } ] }
  ```
  `headSha` is `git rev-parse HEAD` after the final push of this iteration — re-take it after Step 6 pushes review fixes, since that moves the head. Append one entry per iteration; never edit an earlier entry to match reality.

### Step 6: Code Review & Targeted Fixes
- **Wait for Review (bounded):** CodeRabbit takes a few minutes. Wait 3 minutes, then poll `gh pr view --json comments,reviews` every 60 seconds, capped at 10 minutes of total wait. If no review has arrived by the cap, note it in `SHARED_TASK_NOTES.md`, skip the remaining review-response steps below (including the `@coderabbitai resolve` comment), and continue to Step 7 — never wait indefinitely.
- Inspect automated CodeRabbit review.
- **Severity Action Matrix**:
  - **Critical / High / Major**: Always fix immediately.
  - **Valid / High-value suggestions**: Fix and batch.
  - **Minor / Low / Nitpicks**: Leave out and skip.
- Batch all accepted fixes into **one commit** and push once.
- Post summary comment explaining what was resolved.
- Post separate `@coderabbitai resolve` comment.
- Leave PR as is.

### Step 7: Bridge & Move to Next Candidate (Loop)
- **Delivery Gate (mandatory, blocks the loop):** run Step 8 before *any* further iteration and before reporting the run as finished. A created PR is a claim, not a fact, until the remote confirms it.
- Record completed iteration in `SHARED_TASK_NOTES.md`.
- **Cleanup & Reset (guarded):** Before cleanup, run `git status --porcelain`. Anything it shows that the loop did not create is user work: stop and report it — no `git stash`, no `git clean -fd` over user files. Remove only the loop's throwaway artifacts (keep `SHARED_TASK_NOTES.md`), then check out the repository's default branch (resolve it via `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`; fallback: `git symbolic-ref refs/remotes/origin/HEAD`) and `git pull`.
- **Iteration Cap:** Read the cap at loop start from the `MAX_ITERATIONS` environment variable (default: 3), and count this run's completed iterations from the log in `SHARED_TASK_NOTES.md` — a new invocation starts a fresh count. When the cap is reached, run the Step 8 gate one final time, then terminate the loop to protect API budget. Otherwise, immediately repeat from **Step 1**.

### Step 8: Verify Delivery Against the Remote (gate — never skip)
A loop that trusts its own notes will happily report a PR as delivered after something silently rewrote it. That is not hypothetical: in one run two PR titles were clobbered to `@coderabbitai`, every gate stayed green, and the notes still read "PR opened with body X". The loop had checked the *name* of the artifact, never its value.

Read every created PR back from GitHub and compare it field by field against `loop-delivery.json`:

```bash
node <this-skill-dir>/scripts/verify-delivered-prs.js --manifest loop-delivery.json
```

The gate checks, per PR: number, exact title, head branch, head SHA prefix, body non-empty, body names its branch, state is `OPEN`, not a draft, and the checkpoint tag exists on the remote. It prints `PASS`/`FAIL` per check with expected and actual values, and exits non-zero if anything mismatches.

- **Exit 0** → the remote holds what the loop intended. Record it and continue.
- **Exit non-zero** → **stop.** Do not record the iteration as delivered, do not report the run as finished, and do not start the next iteration. Fix the cause — restore the clobbered field with `gh pr edit`, re-push a moved head, or re-open a closed PR — then re-run the gate until it exits 0.
- **Never** edit `loop-delivery.json` to make the gate pass. Editing the expectation to match a wrong reality is the exact defect this gate exists to catch; the manifest records intent, not observation.
- If the gate itself cannot run (no `gh` auth, offline), say so explicitly and mark the iterations *unverified* in `SHARED_TASK_NOTES.md`. Never report "delivered" from an unrun gate.

Tests for the gate live in `evals/verify-delivered-prs.test.js` (`node --test evals/verify-delivered-prs.test.js`). They plant each failure mode and assert a non-zero exit, because a gate that cannot fail is the defect it is meant to prevent.
