Branch: i3/two-i-pick-issue-eval-assertions-were-deleted-durin | Issue: #3

# Plan — Issue #3: lost i-pick-issue eval assertions

## Target
Canonical `skills/i-pick-issue/evals/evals.json` vs public pack
`issue-to-pr-skills/skills/i-pick-issue/evals/evals.json`.
Operator scope decision (asked, answered): **stay in agents-home, no pack-repo
edits**. Operator semantics decision: new **recommended-is-selected** default
(post-#12), not the old halt wording the issue text quotes.

## CodeRabbit intake
No `coderabbitai` plan comment on the issue (0 comments). Nothing adopted,
nothing rejected, nothing `[UNVERIFIED]` from that source.

## Resolved questions (from code, not re-asked)
- The two ids DO exist in canonical, rewritten by 75abb26 (#12): `no-false-selection-claim`
  (not_regex "nothing is selected until the operator answers") and
  `recommendation-is-default` (regex "references/output-template\\.md").
- The two ids are MISSING in the pack (verified live via gh api: pack has 20
  static ids, neither of the two). Pack SKILL.md still emits old halt semantics
  ("Halt for user selection", "Do NOT pick silently").
- Consequence: new-semantics pack assertions would FAIL against the current pack
  SKILL.md. They are blocked until the #12 sync (recommended-is-selected) lands
  in the pack. Recorded as ordering dependency, not attempted here.
- Canonical inconsistency found: `recommendation-is-default.why` still says
  "marking the issue recommended, never selected" — contradicts the new
  selected-by-default `expected_output`. This is the one agents-home edit.

## Spec (embedded, Small — no SPEC.md)
- Fix the stale `why` line so the eval file agrees with itself.
- Produce a per-station id-set diff (canonical vs pack) and keep it in-repo.
- Post the diff + pack-side handoff as an issue comment, so a future pack PR has
  exact assertion text keyed to the pack's post-sync English wording.
- Out of scope: pack-repo branches/PRs, the other open issues (#1, #7, #10),
  the ten-station template extraction (done in #12).

## Dependency graph
- T1 (stale-why fix): no dependencies.
- T2 (i-pick-issue diff table): no dependencies (read-only).
- T3 (nine-station sweep): depends on T2 (reuses its method).
- T4 (handoff comment on #3): depends on T2 + T3 (needs both tables).

## Tasks

### T1 [x] [Docs] — XS — Fix stale `recommendation-is-default.why`
Target: `skills/i-pick-issue/evals/evals.json` line 18.
Change the `why` from "the Discovery recommendation header lives in the Hebrew
output template — SKILL.md must point at it, marking the issue recommended,
never selected" to wording that matches selected-by-default, e.g. "the Discovery
recommendation header lives in the Hebrew output template — SKILL.md must point
at it, and the recommended issue is selected by default unless overridden".
Helper: none (one-line edit). Depends on: none.
Verify: file parses as JSON; that entry contains "selected by default"; the string
"never selected" no longer appears in that entry.

### T2 [x] [Research] — XS — i-pick-issue id-set diff table
Compare static assertion ids: canonical `skills/i-pick-issue/evals/evals.json`
vs pack `skills/i-pick-issue/evals/evals.json` (read-only `gh api`), append the
table to this plan's appendix. Helper: `research`. Depends on: none.
Verify: table lists both id sets and names exactly the two missing ids
(`no-false-selection-claim`, `recommendation-is-default`).

### T3 [x] [Research] — S — Nine-station id-set sweep
Same mechanical comparison for every other station present in both repos
(canonical `skills/*/evals/evals.json` vs pack via `gh api`), record per-station
gaps in the appendix using the repeatable command from the appendix.
Helper: `research`. Depends on: T2. Checkpoint: T1–T3 done, one-line progress.
Verify: every station with evals in both repos has a gap row (empty = no gap).

### T4 [x] [Docs] — XS — Handoff comment on issue #3
Post one `gh issue comment 3` with: scope note (agents-home only), the
i-pick-issue diff, the nine-station gap table, the stale-why fix, and the exact
pack-side follow-up (two new-semantics assertions blocked on the #12 sync).
Helper: none. Depends on: T2, T3.
Verify: comment URL returned; comment contains both tables.

## Improvement proposal (adopted by default)
Keep the exact repeatable id-diff command in the appendix below, so any future
session re-runs the mechanical comparison in one shot instead of re-deriving it —
this is the process fix for "deleted during translation, not converted".
Evidence, issue #3 "Also check": "A mechanical comparison of `id` sets per
station — every id in canonical should have a counterpart in the pack".
No scope expansion proposed; nothing rejected.

## Appendix — repeatable id-diff (PowerShell, read-only)
$canon = (Get-Content skills/<station>/evals/evals.json | ConvertFrom-Json).evals.static_assertions.id
$b64 = (gh api repos/AI-Degen-69/issue-to-pr-skills/contents/skills/<station>/evals/evals.json --jq ".content") -join ''
$pack = ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($b64)) | ConvertFrom-Json).evals.static_assertions.id
Compare-Object $canon $pack
Stations without evals in either repo are skipped with a reason, never simulated.

## Appendix — nine-station sweep (T3, verified live 2026-10-03)
Counts are static-assertion ids, canonical vs pack. "Renamed" = verified
counterpart: same type, equivalent pattern, same why.

- ii-plan-issue: 19 = 19, no gap.
- iii-build-plan: 15 = 15, 1 renamed pair (hebrew-report → output-contract,
  same why "the output contract must be present").
- iiib-iterate-after-build: 18 = 18, 1 renamed pair (hebrew-report →
  next-station-iv, identical pattern + why).
- iv-review-build-and-pr: 26 = 26, 1 renamed pair (hebrew-report →
  output-contract, Hebrew pattern → "Chat Output Contract").
- v-babysit-pr-and-merge: 16 = 16, no gap.
- vi-close-pipeline: 9 = 9, 1 renamed pair (hebrew-report-contract →
  closeout-report-contract).
- create-issue: 16 = 16, 1 renamed pair (hebrew-report-contract →
  chat-output-contract).
- pipeline-triage: older numeric-id schema, no static_assertions on either side;
  same shape both sides (Hebrew → English translated). No gap.
- present-pr: older numeric-id schema, identical both sides. No gap.
Conclusion: one-off, not a pattern. Only i-pick-issue lost assertions (2) with
no counterpart.

## Appendix — i-pick-issue diff (planning-time evidence, T2 re-verifies at build)
Canonical static ids (22): discovery-always-first, no-silent-pick,
halt-for-selection, gh-issue-list-command, group-by-domain,
no-false-selection-claim, recommendation-is-default, no-catchall-trigger,
mode-gate-exists, two-modes-offered, full-orch-offered, no-infer-mode,
no-start-before-mode, claim-issue-first, station-ii-handoff, station-iii-handoff,
station-iv-handoff, station-v-handoff, station-vi-handoff, router-gate,
boundary-defined, routes-to-ad-hoc.
Pack static ids (20): same minus no-false-selection-claim and
recommendation-is-default. Gap confirmed live 2026-10-03.
