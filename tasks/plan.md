Branch: i37/align-agent-skills-with-coderabbit-configuration | Issue: #37

# Plan — [CONFIGURE] Align agent skills with CodeRabbit configuration

## Right-sizing (Step 0)
- **Tier: Tiny.** Docs/YAML-only wording alignment plus one config-file restore; no code behavior change; the CodeRabbit plan on #37 specifies every edit down to line numbers, so ambiguity is near zero. File count (~12) exceeds typical Tiny, but tier measures risk, not file count.
- **Task type: Docs** (skill contracts, references, evals) + config restore. No interfaces, no tests of product code.
- Step 0C divert: #37 carries only `ready-for-agent` — not `quick-fix`-labeled, lane not requested → no gate, no gate text, straight to planning.

## Step 0A — CodeRabbit intake
- Read the `coderabbitai` plan comment on #37 once (rendered copy; HTML echo ignored).
- **Adopted:** 3-phase skeleton (restore config → fix create-issue → verify); file-level change list as the edit checklist; grounded seam `ccebf8e:.coderabbit.yaml` (verified retrievable: `git cat-file -e` exit 0, 133 lines); test cases (grade.js runs, validate.js, acceptance command).
- **Rejected and why:** "Do not edit CONSTRAINTS.md / tasks/**" — the pipeline (higher authority than a plan suggestion) requires Station II to lock both; the old scope belonged to unrelated silent work and is superseded above, with history preserved on `main`. "Fix GitHub login before checks" — stale: `gh label list` and `gh issue` calls succeed in this session, so login works; re-verify live in T4 instead of assuming.
- **Stayed [UNVERIFIED]:** whether both title keys will report `# Source: Repository YAML (base)` after merge — needs the post-merge `@coderabbitai configuration` probe on a real PR (Station IV/V territory, not this plan).
- Open questions: none — #37 has no Open-questions section and no `needs-answers` label.

## Concise spec (embedded — no SPEC.md ceremony)
Goal: skills and CodeRabbit work consistently with the smallest edits. `create-issue` titles issues `[TAG] summary`, picks only existing labels via `gh label list`, and posts the plan prompt body after publishing (skipping only genuinely trivial work). PR titles stay delegated to CodeRabbit via `@coderabbitai`. Out of scope: pipeline redesign, `remote_config` migration, plan-gated features, canonical prompt text changes.

## Task decomposition
Depends-on graph: T1 -> T2 -> T3 -> T4 (linear; each verifies before the next starts).

- **T1** — Restore root `.coderabbit.yaml` + fix Station IV wording. [Docs] S. [x]
  - Restore byte-identical from `ccebf8e` (never retype; hash-compare vs `git show ccebf8e:.coderabbit.yaml`). Leave `scripts/sync-coderabbit.ps1` unchanged.
  - `skills/iv-review-build-and-pr/SKILL.md` (~170-182) + `README.md` (35-37): title rules come from effective config (`reviews.auto_title_placeholder` + `reviews.auto_title_instructions`); root file is the source in this home. Behavior unchanged: exact `@coderabbitai` title, no fallback title, one manual review, 10s ack wait.
  - Depends on: none.
  - Verify: `git diff` shows the restore as pure addition; `Select-String` finds `gh pr create --title "@coderabbitai"`; wording no longer claims dashboard-only.

- **T2** — Rewrite `create-issue` core rules. [Docs] M.
  - `SKILL.md`: `[TAG] short plain-English summary` rule (exactly one tag of the 12, by primary purpose, plain English, per-sibling tags; PR title stays `@coderabbitai`); `gh label list` before publish with 1-3 existing labels or none (remove forced `--label ready-for-agent`, remove `gh label create`); publish-then-plan ordering with body-only lowercase `@coderabbitai plan` (no auto-planning assumption); remove "always qualifies" — skip plan only for typo-only/comment-only/trivial-docs; refusal/upgrade = reply (no retry, quote it), silence = retry once.
  - `references/issue-tracker.md`: "check `gh label list`; use only labels that exist"; conventions optional/existing-only; drop first-use creation notes. `references/output-template.md`: report title tag, applied + missing labels, plan status (requested/retried/skipped-trivial/refused-quoted). [x]
  - Helper skill: `documentation-and-adrs` (verified on disk).
  - Depends on: T1 (tag vocabulary comes from the restored file).
  - Verify: `node skills/create-issue/scripts/grade.js case --evals skills/create-issue/evals/evals.json --skill skills/create-issue/SKILL.md` green.

- **T3** — Update dependent descriptions + evals. [Docs] S.
  - `README.md` (label/title/skip lines), `agents/openai.yaml` (drop forced-label promise), `evals/intake.md`, `docs/issue-to-pr-skill-workflow.md` line 63, `skills/README.md` intake row, `evals/evals.json` (replace forced-label check with label-list check; add must-not-match for `gh label create` and "always qualifies"; add `[TAG]` check; expectations to existing-labels + Open questions). [x]
  - Depends on: T2 (wording must match the new rules).
  - Verify: both graders green; grep finds no forced `--label ready-for-agent` outside snapshots.

- **T4** — Conflict sweep + full verification. [Docs] S.
  - Sweep active files (skip snapshots/iteration results) for `dashboard`, `gh label create`, `always qualifies`, forced `--label ready-for-agent`; confirm `ii-plan-issue/references/issue-tracker.md` still a pointer and the canonical prompt has no copies.
  - Run: both `grade.js` cases, `validate.js --all`, and the issue's acceptance command (`Test-Path ./.coderabbit.yaml`, both `Select-String` matches, `gh label list`). [x]
  - Depends on: T3.
  - Verify: all green; any `gh`-blocked check reported as blocked with the operator login fix named — never claimed as passed.

## Checkpoints
- After T1: config restored, Station IV wording fixed, nothing else touched.
- After T2: intake rules rewritten, create-issue grader green.
- After T4: sweeps + graders + acceptance command all green (or honestly blocked).

## Sub-issues
Skipped — Tiny tier skips the ceremony (single-issue docs sweep; #37 itself tracks the work).

## Improvement proposal (Step 5 — adopted by default)
Simplification, adopted: no `SPEC.md` ceremony — the concise spec above plus the #37 body carry everything, matching repo precedent (no `SPEC.md` in root; prior work embedded its spec the same way). Evidence: skill Step 2 mandates `SPEC.md` only for "Standard / Large" work, and this plan right-sizes Tiny per Step 0.
