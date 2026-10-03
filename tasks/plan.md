Branch: i17/sync-pipeline-docs-with-extracted-station-output | Issue: #17

# Plan — Issue #17: Sync pipeline docs with extracted station output templates

## Environment
- Stack: Markdown skills repo (no language runtime, no framework, no test runner).
  Verification is `Select-String` acceptance commands, not a test suite.
- Size tier: **Small** — one docs file plus an optional one-line README cross-reference;
  straightforward once the templates are read.
- Task type: **Docs, UX / Copy**.
- Domain routing: `documentation-and-adrs` (accurate reporting rules), `humanizer`
  (plain-English station lines). Both verified present under `skills/`.

## Step 0A notes
- `coderabbitai` plan comment exists on #17 (3 phases: precondition gate → rewrite →
  README + verify). Adopted: phase skeleton, affected-file list, acceptance commands,
  plain-prose pointer convention. Rejected: over-split task list (merged into 4 tasks);
  the CONSTRAINTS.md scope-confirmation ceremony (Station II re-locks CONSTRAINTS.md
  by protocol — done above, no operator approval needed); "stop and ask operator to
  supply the refactor" (the refactor exists locally, so no need to ask).
- Assumption 1 (refactor present) resolved from code: the 9 templates + 9 pointer
  blocks live on `wip/extract-output-templates` (commit `ed715fc`), NOT on `main`
  (only `i-pick-issue` is extracted there). Nothing stays `[UNVERIFIED]`.
- Issue #17 has no Open-questions section and no `needs-answers` label — nothing to ask.
- `code-explorer` / `type-design-analyzer` personas: not needed (docs-only, familiar repo).

## Spec (embedded — Small, no SPEC.md)
- Goal: the workflow doc must describe the new world (contracts in local-only
  `references/output-template.md`, rules + pointer in `SKILL.md`), not the old
  inline-`SKILL.md` world.
- Must keep: station order, routing descriptions, artifact-governance section,
  global bans (no hashes/counts/commands/skill-names/line-numbered paths),
  ~7-item limit, product-location convention.
- Must change: `:66` stale claim → plain-prose pointer convention; `:68-76` entries →
  one English line per station from the real templates (+IIIB entry), stale
  files-checked / skills-ran / quoted-comment claims removed; `:82-86` ordering line
  scoped to templates that use change groups; `:5`, `:47-60`, README `:22-24` only
  if they quote removed templates.
- Out of scope: any `SKILL.md` or template content change, sync/mirror scripts,
  translations, `i-pick-issue`, quoting Hebrew in docs.

## Interfaces
Skipped — no types, schemas, or function signatures change (docs-only).

## Improvement proposal (adopted by default — simplification)
Use plain prose (not `local-only` markers) for the template pointer in the workflow
doc, so the pointer survives publication as `docs/pipeline.md`. Evidence: the issue
requires "point readers at each station's `references/output-template.md` (local-only,
never published)", and the recorded publication design strips only marked
`local-only` blocks while preserving ordinary prose. Folded into T2.

## Dependency graph
- T1 (precondition base) → T2, T3 (need templates to read). T2 + T3 → T4 (verify all).

## Tasks
- [x] **T1** (S) `[Docs]` — Merge `wip/extract-output-templates` into this branch as the
  precondition base; verify all 9 `references/output-template.md` files exist and all 9
  `SKILL.md` pointer blocks are present. Helper: `documentation-and-adrs`.
  Depends on: none.
  Verify: `git ls-tree` lists 9 templates; `Select-String 'output-template.md' skills/*/SKILL.md`
  matches 9 files; `git diff --stat main` touches only skills (no docs yet).
- [x] **T2** (M) `[Docs]` — Rewrite the Chat Reporting Contract (`:64-76`): replace the
  `:66` claim with the plain-prose pointer convention; rewrite each station entry as one
  English line from the template inventory (folder-state + GitHub-checks shape,
  walkthrough inputs where used, signal words `must`/`recommended`/`skip`/`do not invent`);
  add the missing IIIB entry; delete files-checked / skills-ran / quoted-comment claims.
  Helper: `documentation-and-adrs` + `humanizer`.
  Depends on: T1.
  Verify: `Select-String 'output-template\.md'` count ≥ 1; `'contracts themselves stay
  in each skill'` count = 0; stale phrases ("files checked", "which skills ran",
  "original style") return no matches in `:64-76`.
- [ ] **T3** (S) `[Docs]` — Align the What's-changed rule (`:80-86`): scope the
  ➕→✏️→❌→🩹 ordering to templates that use change groups; reconcile the clean-tree ban
  with the template folder-state field; keep the VI clean-base line only if the VI
  template uses it. Check `:5`, `:47-60` and change only stale inline-template wording.
  Helper: `documentation-and-adrs`.
  Depends on: T1.
  Verify: read-back of `:80-86`; `Select-String` for Hebrew chars in edited sections = 0.
- [ ] **T4** (XS) `[Docs]` — Fix the README cross-reference (`:22-24`) only if
  "station contracts, and Hebrew reporting" now misleads; then run the full acceptance
  battery from the issue. Helper: none (mechanical check).
  Depends on: T2, T3.
  Verify: both issue acceptance commands green; `git diff --stat` shows only the workflow
  doc (+ README if edited); no Hebrew chars in edited sections.

Checkpoint after T1: one-line precondition proof (9 templates + 9 pointers present).
Checkpoint after T3: one-line rewrite proof (counts + zero stale matches).

---

## Superseded plan (Issue #10 — completed, merged as 0707f1d, kept for session memory)

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
