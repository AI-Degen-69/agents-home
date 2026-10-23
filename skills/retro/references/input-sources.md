## Input Sources for Retro Analysis

Part of `retro` (Station VI-B). Full source of truth: `SKILL.md`.

### Required Inputs (always read)

| Source | Command | What it provides |
|---|---|---|
| PR body | `gh pr view <n> --json body` | Summary of the change, verification steps, test output |
| CodeRabbit review comments | `gh pr view <n> --comments` | Inline review feedback, findings, suggestions |
| Git diff (files only) | `git diff --name-only origin/<base>...HEAD` | Scope of changes, file types touched |
| Git diff (content) | `git diff origin/<base>...HEAD` | Actual code changes, violations of patterns |
| NOTICED ledger | `docs/backlog/i<id>-<slug>.md` | Previously spotted issues not fixed |
| AGENTS.md | `AGENTS.md` or `CLAUDE.md` (root) | Existing navigation pointers, rules, conventions |

### Conditional Inputs (read when present)

| Source | Command | What it provides |
|---|---|---|
| CONSTRAINTS.md | `CONSTRAINTS.md` (repo root) | Quality guardrails from Station II |
| CODING_STANDARDS.md | `CODING_STANDARDS.md` (repo root) | Existing coding standards |
| CI logs | `gh run view <run-id> --log-failed` | Test failures, lint failures, errors |
| ESLint config | `.eslintrc.*` or `eslint.config.*` | Existing lint rules (to avoid duplicating) |
| Prettier config | `.prettierrc*` | Existing formatting rules |
| Commit history | `git log --oneline -20 origin/<base>..HEAD` | How work was divided, commit quality |
| Review findings from Station IV | (from session transcript) | OCR finds, reviewer notes, Spec-axis findings |

### Input Processing Rules

1. **PR comments first.** The CodeRabbit review is the richest source of
   findings — reviewers catch what the agent missed.
2. **Diff second.** Scan the actual code for violations of patterns that
   a tool could have caught.
3. **NOTICED ledger third.** Check if any previously spotted items were
   addressed or reoccurred.
4. **AGENTS.md last.** Check what navigation pointers existed and whether
   the agent found the right files quickly.

### What Constitutes a "Finding"

A finding is any observation that, if repeated, would waste time or
reduce quality. Examples:

- **"The agent read 3 files to find the auth middleware"** → navigation pointer
  for `AGENTS.md`
- **"ESLint didn't flag the `any` cast"** → missing lint rule
- **"Error message said 'Error' with no context"** → CODING_STANDARDS.md
- **"No pre-commit hook to prevent secret commits"** → missing guardrail
- **"The agent ran the full test suite for a frontend change"** → tool economy

### What is NOT a finding

- Genuine code defects (bugs in logic) — these are Issues, not environment
  improvements. Route back to the issue tracker.
- Things already covered by an existing lint rule or CI job — the guardrail
  exists; if it failed to catch the issue, the rule needs tuning, not a
  new rule.
- One-off situations that cannot recur under normal operation.
