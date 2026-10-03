Branch: i10/station-iv-step-01-whole-gate-is-3-tool-calls-con | Issue: #10

# Plan — Issue #10: Step 0.1 budget wording contradicts the 6-call flow

## Environment
- Stack: Markdown skills repo (no language runtime, no framework, no test runner).
- Size tier: **Tiny** — docs/wording-level change in one file, no code behavior change, zero ambiguity.
- Task type: **Docs, UX / Copy**.
- Domain routing: `documentation-and-adrs` (wording accuracy), `humanizer` (plain budget sentence). Both verified present under `skills/`.

## Step 0A notes
- No `coderabbitai` plan comment on issue #10 — nothing to adopt/reject.
- No `needs-answers` label, no Open-questions section — nothing to resolve from code.
- Live-repo check: the offending sentence exists in exactly one file
  (`skills/iv-review-build-and-pr/SKILL.md:54`); no localized English copies found in
  this repo, so acceptance criterion 3 (public-pack byte-identity) is recorded as
  `[UNVERIFIED]` from here — out of scope for this branch unless the pack copy lives elsewhere.
- `code-explorer` / `type-design-analyzer` personas: not needed (single-sentence docs fix).

## Spec (embedded — Tiny, no SPEC.md)
- Goal: Step 0.1 must not state a whole-gate 3-call budget the documented 6-call flow cannot meet.
- Must keep: 8-call hard cap (`SKILL.md:59`) and the 2-failure abort rule unchanged.
- Fix wording (from the issue): fast-path target of 3 calls + optional screenshot when batchable;
  explicit that this is NOT the whole-gate limit; count every gate call
  (`open`, `eval`, `console`, `requests`, `screenshot`, `close`) toward the hard cap of 8.
- Out of scope: touching the 8-call cap, the abort rule, the browser flow itself,
  the public-pack sync, and issue #2 extraction work.

## Interfaces
Skipped — no types, schemas, or function signatures change (docs-only).

## Improvement proposal
None — no evidence in the issue or code motivates anything beyond the requested reword;
per protocol, no proposal without verbatim evidence (אין להמציא).

## Dependency graph
- T1 (edit) → T2 (verify). T2 needs T1's output; nothing else depends on anything.

## Tasks
- [x] **T1** (XS) `[Docs]` — Reword the Step 0.1 attempt-budget sentence in
  `skills/iv-review-build-and-pr/SKILL.md` to the fast-path target + explicit 8-call
  accounting from the issue. Helper: `documentation-and-adrs`.
  Depends on: none.
  Verify: read back lines ~41–62, confirm no whole-gate 3-call claim remains
  and the 8-call cap + 2-failure stop are byte-unchanged.
- [x] **T2** (XS) `[Docs]` — Confirm acceptance criteria 1–2 from the issue text.
  Helper: none (mechanical check).
  Depends on: T1.
  Verify: `grep "whole gate is 3 tool calls" → no match`;
  `grep "capped at 8 tool calls" → 1 match`; eyeball the rendered sentence once.
  Criterion 3 (pack byte-identity) stays `[UNVERIFIED]` — recorded, not claimed.

Checkpoint after T2: one-line progress report (wording fixed, cap intact).
