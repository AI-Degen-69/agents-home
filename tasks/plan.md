Branch: i19/give-noticed-but-not-touching-candidates-an-owner | Issue: #19

# Plan — Issue #19: Give NOTICED-BUT-NOT-TOUCHING candidates an owner

## Stack & tier

- Stack: Markdown skill docs + Node validator scripts (`skills/skill-workbench/scripts/validate.js`) + PowerShell automation. No app runtime.
- Tier: **Standard** — 4–5 doc files, one architectural decision (owner = Station VI).
- Task type: **Docs** (primary). Verification: validator + `git grep` acceptance, no browser.

## CodeRabbit plan intake (read once; echo ignored)

- Adopted: Station VI owns candidates end to end; durable ledger at `docs/issues/<id>-noticed-but-not-touching.md` with table (ID N1…, candidate, discovering station, evidence `path:line`, status, resolution); statuses `open/published/duplicate/dismissed`; absent-ledger = zero candidates; open rows block the Clean Exit Gate; operator confirms publish/dismiss/duplicate per row; duplicate search before publish via tracker list command; `create-issue` invoked only on publish approval; snapshots excluded from owner-language edits.
- Rejected: 4-task split (Tasks 1.1–1.4) merged into 3 vertical tasks below; new `README.md` edits beyond one line dropped (keep minimal); no new abstraction files.
- `[UNVERIFIED]`: exact line numbers cited in the CodeRabbit comment (`SKILL.md:52–58`, `:98–109`, `:113–130`, workflow `:59`, `:169–175`, `:80–86`) — verified against live files at plan time; Station III must re-check anchors before editing.

## Open questions — resolved from code (no operator ask)

1. Publish immediately or queue for approval? → **Queue; publish only on explicit operator confirmation.** Evidence: issue default assumption ("queue for explicit operator approval") + CodeRabbit Design Choice 3 + `create-issue` publishes new issues without operator review, so candidates must not auto-enter it.
2. Is recorded dismissal enough to close the loop? → **Yes — explicit dismissal with reason (or confirmed `duplicate #N`) closes the loop.** Evidence: issue default assumption + CodeRabbit Design Choice 3; "defer" is not a resolution; undecided stays `open` and blocks the gate.

## Spec (embedded — Small/Standard docs change)

- Goal: every out-of-scope finding spotted mid-pipeline becomes a tracked ledger row with exactly one owner that converts or dismisses it before closeout.
- Acceptance: (1) exactly one station owns candidates end to end; (2) no candidate reaches closeout unresolved — open rows block the exit gate or carry an explicit dismissal reason; (3) `git grep -n "NOTICED-BUT-NOT-TOUCHING" -- skills AGENTS.md docs` shows owner language in every active capture-and-surface instruction.
- Out of scope: changing rule 5 itself, auto-fixing candidates, bulk-creating issues for old chat mentions, touching snapshots or shadcn content.

## Interface contracts

No code interfaces. Doc contract only:
- Ledger path: `docs/issues/<id>-noticed-but-not-touching.md` (per-issue; created only on first candidate).
- Row: `| ID (N1…) | candidate (one line) | discovering station | evidence (path:line) | status (open/published/duplicate/dismissed) | resolution (#N or reason) |`.
- Discovering stations: append `open` row only. Only Station VI resolves rows.

## Improvement proposal (adopted by default)

Keep the ledger out of the prune sweep by adding it to the "Knowledge Is Untouchable" list — otherwise the closeout that resolves candidates could delete their evidence. Evidence: `skills/vi-close-pipeline/SKILL.md:52–58` lists permanent knowledge; issue acceptance requires the list to survive closeout. (Scope expansion: none — dropped nothing, added no behavior.)

## Dependency graph

- T1 (owner contract + ledger + gate in Station VI) → unblocks T2 (capture pointers in discovering stations) and T3 (station map + evals). T2 and T3 are independent of each other once T1 lands.

## Tasks

### T1 [x] [M] [Docs] — Station VI owns candidates: ledger, disposition, blocking gate
- Target files: `skills/vi-close-pipeline/SKILL.md`
- What is built: ledger definition (path, table, statuses, absent-ledger rule) added to the contract; ledger added to "Knowledge Is Untouchable"; new Candidate Disposition step (present each `open` row, duplicate search, `create-issue` on publish approval, commit ledger alone); Clean Exit Gate item (zero `open` rows, fail → fix-or-escalate, never report closed); final-report lines (per-candidate outcome + blocked variant).
- Depends on: none.
- Verification: `node skills/skill-workbench/scripts/validate.js -- skills/vi-close-pipeline/SKILL.md` passes; `git grep -n "noticed-but-not-touching" -- skills/vi-close-pipeline/SKILL.md` shows owner + ledger + gate lines.

### T2 [x] [S] [Docs] — Point every active capture-and-surface instruction at the owner
- Target files: `skills/iii-build-plan/SKILL.md` (:54), `skills/iv-review-build-and-pr/SKILL.md` (:104), `skills/iii-build-plan/README.md` (:34), `skills/iii-build-plan/evals/evals.json` (:37 — only if the eval needs an owner pointer; never weaken the must-match)
- What is built: each active instruction keeps "never touch" and adds one owner line: append `open` row to the ledger; only Station VI resolves. Explicitly NOT touched: `skills/iv-review-build-and-pr/evals/snapshots/**`, `skills/shadcn/SKILL.md`, `AGENTS.md:25` (rule itself unchanged unless a pure pointer is needed).
- Depends on: T1.
- Verification: `git grep -n "NOTICED-BUT-NOT-TOUCHING" -- skills AGENTS.md docs` shows owner language at every active instruction; `git status --porcelain -- skills/iv-review-build-and-pr/evals/snapshots skills/shadcn` is empty.

### T3 [x] [S] [Docs] — Station map handoff + eval coverage
- Target files: `docs/issue-to-pr-skill-workflow.md`, `skills/vi-close-pipeline/evals/evals.json` (or current eval file under `skills/vi-close-pipeline/evals/`)
- What is built: Station VI row names candidate disposition before the clean exit; artifact-homes list gains the ledger path; one marker sentence (any station appends, only Station VI resolves). Eval: at least one prompt-bearing case asserting open-rows-block-gate + dismissal-closes-loop.
- Depends on: T1.
- Verification: `node skills/skill-workbench/scripts/validate.js -- skills/vi-close-pipeline/SKILL.md docs/issue-to-pr-skill-workflow.md` passes; new eval case runs green.

Checkpoints: after T1 — owner contract readable in Station VI; after T2+T3 — full grep + validator green.
