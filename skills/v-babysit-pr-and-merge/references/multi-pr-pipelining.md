# Multi-PR Pipelining (`v-babysit-pr-and-merge` reference)

Loaded on demand when the station is invoked **without a specific PR number**
and multiple PRs are open. The core SKILL.md holds the single-PR loop; this
reference holds the queue discipline.

## Priority Order (Top to Bottom)

1. **Query open PRs:**
   ```bash
   gh pr list --state open --json number,title,headRefName,createdAt,updatedAt,statusCheckRollup,reviews
   ```
2. **Process Queue Priority:**
   - **Priority 1: Stack Dependencies** — Base/parent branches first before child
     branches to prevent merge conflicts.
   - **Priority 2: Ready to Merge** — PRs with completed reviews and green CI
     (fastest to close).
   - **Priority 3: Actionable Review Feedback** — PRs with open comments waiting
     for agent triage/fixes.
   - **Priority 4: Interleaved Waiting (Pipelining)** — While PR A is in its
     countdown sleep window, advance immediately to PR B's triage/fixes rather
     than idling.
   - **Priority 5: Unpushed / New PRs** — Delegate to `iv-review-build-and-pr`
     (push, open PR, post `@coderabbitai review`); resume the single-PR loop at
     Step 1 once the PR exists.

## Rules

- Work the queue top to bottom; never jump ahead of a stack dependency.
- Pipelining happens only inside wait windows (countdown checks, CI waits) —
  never split attention mid-triage or mid-merge.
- Each PR keeps its own single review round; the round is never shared or
  batched across PRs.
