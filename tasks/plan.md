Branch: i18/audit-pipeline-station-skills-and-fix-findings-plus-evals | Issue: #18

# Plan — Issue #18: Audit pipeline station skills with skill-workbench and fix findings plus evals

> Reconciliation note: this file previously held the completed Issue #19 plan (all tasks `[x]`,
> merged as PR #21 / `ac01d5f`). Issue #19 is closed and its work landed, so the plan is replaced.
> The full #19 plan remains in git history at `tasks/plan.md` on `main`.

## Stack & tier

- Stack: Markdown skill docs + zero-dependency Node scripts (`skills/skill-workbench/scripts/*.js`, `skills/*/scripts/grade.js`). No app runtime, no installed test framework — the repo's test surface is `node:test`.
- Tier: **Large** — cross-cutting: 10 pipeline skills + skill-workbench, validator/scorer/inventory scripts, 11 eval sets, plus new `node:test` coverage. One architectural decision (where the validator's skills root comes from).
- Task type: **Code** (primary: validator + scorer + grader scripts) + **Docs** (station contracts) + **Design** (eval/audit contract reconciliation).

## CodeRabbit plan intake (read once; echo ignored)

- **Adopted:** Phase 2 shape (portable root → frontmatter guard → narrow phantom matcher → `node:test` regression → score.js comment) as T1; Phase 3 (workbench doc/eval reconciliation) folded into T3; Phase 4/5 station findings condensed into T2 (contracts) + T3 (evals); Phase 6 final gates as T4. Design Choice 1 (clean baseline) already satisfied. Design Choice 2 (tune the validator, keep the waiver only as fallback) adopted.
- **Rejected:** its 6 phases / 20 tasks — over-split for 4 atomic slices (Rule 4). Its "keep the workbench body at or below about 330 lines" — the budget already lives in `CONSTRAINTS.md`. Its "replace the stale `playwright-cli.*preferred` check" — verified live at `skills/iv-review-build-and-pr/evals/evals.json:39`; kept, folded into T2/T3.
- **`[UNVERIFIED]` / stale:** CodeRabbit claims a `pipeline-triage` baseline of 96 and two typos — a "Pipline Triage" heading and `/vi-close-pipline`. Executed `score.js` says **98**, and `search_codebase` for `Pipline` and `vi-close-pipline` returns **no results**. All three claims are stale; Station III must not act on them.
- **Re-verify before editing:** every file:line CodeRabbit cites (`validate-lib.js:9`, `score.js:66-75`, `inventory.js:22`, `iv-review-build-and-pr/SKILL.md:163`) was spot-checked at plan time; Station III re-checks anchors before editing.

## Open questions — resolved from code (no operator ask)

1. *Does the dirty tree block the audit?* → **No. Resolved before planning.** `pipeline-triage` ran at session start: clean on `main`, 0/0 with `origin/main`, no stashes, no open PR. The 9 modified files the issue describes were merged by PR #21 (`ac01d5f`) and are no longer dirty.
2. *Is validator tuning in scope?* → **Yes**, and it is the whole of T1. The issue's default assumption allows validator tuning or a documented waiver; tuning is right because the failure is a validator classification defect, not a shadcn defect (`validate-lib.js` carries a 40-line `NON_SKILL_TOKENS` allowlist that never anticipated Tailwind utility *shapes*).
3. *Are eval prompts missing?* → **No.** Executed counts: every case in all 11 in-scope skills has a prompt. The real gaps are (a) `vi-close-pipeline` has only 2 cases, and (b) 6 skills have evals but **no** `scripts/grade.js`, so their static assertions are never executed.

## Spec

See `SPEC.md` (goal, executed baseline table, acceptance criteria, edge cases, out-of-scope).

## Interface contracts

No product API. Four script contracts are frozen before any edit:

- **`DEFAULT_SKILLS_ROOT`** (`skills/skill-workbench/scripts/validate-lib.js:9`) changes from the hardcoded `'C:/Users/Tiger/.agents/skills'` to `process.env.SKILLS_ROOT || path.resolve(__dirname, '..', '..')`, matching the existing grader pattern at `skills/vi-close-pipeline/scripts/grade.js:19-20`. `inventory.js:22` deletes its duplicate constant and imports the export. `validate.js --docs` derives `DEFAULT_DOCS_ROOT` from the same value (already does, at `validate.js:32`). Exit codes 0/1/2 and positional-root overrides unchanged.
- **`phantomSkillRefs(text, skillDir, skillsRoot)`** keeps its signature and return shape (array of unresolved tokens). A new `isNonSkillVocabulary(token)` predicate is added beside `NON_SKILL_TOKENS` (`validate-lib.js:61`) and `ROLE_SUFFIX_RE` (`:102`), and is consulted inside `phantomSkillRefs`. It must return `true` for the 14 observed shadcn tokens and `false` for the near-misses `bg-cleanup` and `data-import-skill`.
- **`scoreSkill(skillDir, opts)`** — formula, weights, and every emitted score are frozen. Only a stale comment changes.
- **New grader `scripts/grade.js`** must expose the exact subcommand contract documented at `skills/vi-close-pipeline/scripts/grade.js:6-9`: `audit --skill <SKILL.md>` and `case --evals <evals.json> --skill <SKILL.md> [--id <case-id>] --out <results.json>`. Live assertions report `not-run` and are excluded from pass rates.

`type-design-analyzer` was **not** run: this issue freezes no domain model — the four contracts above are module-level function signatures with no invariants to express, and no data schema changes. Skip recorded per Step 4.

## Improvement proposal (adopted by default)

Ground evidence, verbatim from `skills/skill-workbench/scripts/score.js:66-75`:

```js
function selfContainment(skillDir) {
  const dirs = ['scripts', 'references', 'assets', 'docs', 'evals'];
  ...
  // Full marks when at least two auxiliary folders exist; scripts/references count double.
  const strong = (present.includes('scripts') ? 2 : 0) + (present.includes('references') ? 2 : 0);
  const weak = present.filter((d) => !['scripts', 'references'].includes(d)).length;
  const raw = Math.min(5, strong + weak); // out of 5
```

The comment is false: `references` + `evals` yields `2 + 1 = 3`, i.e. **60/100** — exactly the self-containment score measured on all six grader-less skills. Adding a real `scripts/grade.js` to those skills (needed anyway, their static assertions never execute today) takes them to 100 without touching a line of scorer logic. Adopted: the fix is the runner, not the metric.

## Dependency graph

- **T1** (workbench tooling) unblocks **T4** — the `--all` gate cannot pass while shadcn fails.
- **T2** (station contracts) unblocks **T3** (evals must assert the corrected wording) and **T4**.
- **T3** unblocks **T4** — the grader runs need the new eval cases to execute.
- T1 → T2 are independent; T2 and T3 may interleave once T1 lands.

## Sub-issues

**Skipped, deliberately.** Step 6.6 maps tasks to sub-issues for Standard/Large work so the tracker survives the session. Here the work is a single PR on one branch and every task is verified by a command in this plan; splitting 4 tasks into 4 tracker issues creates noise the operator then has to close. Recorded so a future session does not re-litigate it. Revisit if this issue is ever split across branches.

## Tasks

### T1 [x] [Code] — Fix the workbench tooling at the source
- Target files: `skills/skill-workbench/scripts/validate-lib.js`, `scripts/inventory.js`, `scripts/validate.js`, `scripts/score.js`, **new** `skills/skill-workbench/scripts/validate.test.js`.
- What is built: (a) portable `DEFAULT_SKILLS_ROOT` derived from `__dirname` honoring `SKILLS_ROOT`; duplicate constant removed from `inventory.js`; `--docs` uses the same configurable root; (b) `validateSkill()` short-circuits frontmatter-dependent checks when `fm` is null, keeping the `fm-present` failure — missing SKILL.md, unclosed delimiter and CRLF frontmatter produce findings, not throws, and the aggregate `--all` JSON stays intact; (c) `isNonSkillVocabulary()` beside `NON_SKILL_TOKENS`/`ROLE_SUFFIX_RE`, applied in `phantomSkillRefs`: Tailwind prefix + numeric/color/semantic suffix, standard ARIA attributes, known state `data-*` (`data-invalid`, `data-disabled`, `data-icon`, `data-state`, `data-slot`), known CSS properties (`z-index`), package allowlist (`lucide-react`, `react-router`) — **no blanket prefix exclusion**; (d) a zero-dependency `node:test` script building fixtures in the OS temp dir covering both directions (real phantom fails, `bg-cleanup`/`data-import-skill` fail, an existing skill passes, all 14 shadcn tokens pass, personas/own-file slugs pass, LF + CRLF + unclosed + absent frontmatter); (e) fix the stale `score.js:70` comment only — formula and weights untouched.
- Depends on: none.
- Verification: `node skills/skill-workbench/scripts/validate.js --all` → **exit 0, 0 fail**; `node skills/skill-workbench/scripts/validate.test.js` → all tests pass; `node skills/skill-workbench/scripts/score.js skills/shadcn --json` → `file-integrity` rises 50 → 100, `overall` >= 84; `git diff skills/skill-workbench/scripts/score.js` shows comment-only changes.

### T2 [x] [Docs] — Resolve the evidenced station contradictions, minimal diffs
- Target files: `skills/pipeline-triage/SKILL.md`, `skills/i-pick-issue/SKILL.md`, `skills/ii-plan-issue/SKILL.md`, `skills/iii-build-plan/SKILL.md`, `skills/iiib-iterate-after-build/SKILL.md`, `skills/iv-review-build-and-pr/SKILL.md`, `skills/v-babysit-pr-and-merge/SKILL.md`, `skills/vi-close-pipeline/SKILL.md`, `skills/present-pr/SKILL.md`, `skills/create-issue/references/wayfinding-operations.md`, `skills/ii-plan-issue/references/issue-tracker.md`, and `docs/issue-to-pr-skill-workflow.md` **only if** a station row names the claim owner.
- What is built (a): unknown-origin stop rule in `pipeline-triage` **before** routing rows 10–11 (never route dirt of unknown origin to II/III by size). Remove the duplicate claim at `i-pick-issue/SKILL.md:64` and delegate to Station II; align its description with "the recommended issue is the default selection unless the operator overrides". Keep II's claim *after* the clean-tree check (`ii-plan-issue/SKILL.md:22-24`) and state operator invocation as the consent. `iii-build-plan` gains preconditions — confirm the plan branch, stop on unknown-origin dirt, resume an unfinished `tasks/plan.md` from unchecked `tasks/todo.md` items (triage row 8) — plus an IIIB path beside `/iv-review-build-and-pr` in its report template.
- What is built (b): in IV, make the acknowledgement prose match the shipped 60-second commands (`iv-review-build-and-pr/SKILL.md:160`, `:172` vs the prose at `:163`) and clarify that a tooling-unverified proof is a PR-body disclosure, not a shipping failure. `v-babysit-pr-and-merge`: skip/recommend/mandatory classification must consult VI's full discovery set (tracked stale plans, knowledge-home artifacts, stashes, alternate layouts); uncertain → recommend VI. `vi-close-pipeline`: add a distinct blocked/incomplete status to the report template (foreign dirt, failed push, residual branches or stashes, API failure) and state that a presentation offered after VI ends with the same clean-exit check. `present-pr`: replace the Station VI reference with a conditional handoff (before VI → `/vi-close-pipeline`; after VI → re-verify the clean exit and push or report the staged page). `create-issue/references/wayfinding-operations.md`: the first-write claim requires a clean tree first, and `ii-plan-issue/references/issue-tracker.md` agrees.
- Depends on: T1 (so `validate.js` is clean while these land).
- Verification: `node skills/skill-workbench/scripts/validate.js skills/<each> --json` → 0 fail for all 10; `node skills/skill-workbench/scripts/score.js skills/<each> --json` → every overall >= its `SPEC.md` baseline; each station body <= 250 lines (`score.js details.body_lines`); `git diff --stat` shows no snapshot and no non-pipeline path.

### T3 [x] [Code] — Close the eval and runner gaps
- Target files: **new** `scripts/grade.js` for `i-pick-issue`, `iii-build-plan`, `iiib-iterate-after-build`, `iv-review-build-and-pr`, `pipeline-triage`, `present-pr` (zero-dependency copies of the `vi-close-pipeline/scripts/grade.js` contract); `evals/evals.json` for those six plus `skill-workbench`, `ii-plan-issue`, `create-issue`, `v-babysit-pr-and-merge`; `skills/skill-workbench/references/spec-checklist.md`, `references/reporting-contract.md`, `references/audit-policy.md`, `SKILL.md`; `skills/i-pick-issue/references/output-template.md`.
- What is built (a): every in-scope skill gains an executable runner for its static assertions. Expansions, each prompt-bearing — `pipeline-triage`: static + live assertions on all 8 existing cases, plus unknown-origin dirt, stashes, rows 12–14, and row 3's approval line. `i-pick-issue`: gate-blocked (dirty tree / unpushed commits / open PR) and unchosen-mode cases, plus the two-option mode prompt in `references/output-template.md`. `iii-build-plan`: dirty/unknown-origin tree, wrong branch, resume. `iiib-iterate-after-build`: multi-item split, red verification stops the loop. `iv-review-build-and-pr`: change the stale `playwright-cli.*preferred` assertion at `evals/evals.json:39` to the shipped "only" wording (`docs/issue-to-pr-skill-workflow.md:107`); add unverified-tooling, 8-call-cap exhaustion and two-failure abort cases.
- What is built (b): `v-babysit-pr-and-merge` — tracked-stale-artifact means do not skip; rate-limit evidence reuse. `vi-close-pipeline` — add at least 4 cases beyond the current 2: already-clean no-op, unmerged PR blocked, referenced artifact retained, foreign-dirt partial closeout, reverted dead-code test failure, incomplete push failure. `create-issue` — `gh` auth-failure case. `ii-plan-issue` — dirty-tree-stops-the-claim and existing-`tasks/plan.md`-reconciliation cases; tighten the `no-args-auto-pick` regexes to require the clean-tree check before the claim. `skill-workbench` — fix the `vii-present-pr-example-eval-set` fixture name to `present-pr`, replace the unrelated negative prompt with a validate-only case naming a real skill, add a waiver case (a recorded residual finding is never reported as "clean") and a score-reporting case.
- What is built (c) — workbench doc reconciliation: correct the `file-refs` claim in `spec-checklist.md` (it covers inline Markdown links only; it does not check backticked paths and does not enforce one-level depth), document that `score.js` exits 0 even when validation fails and that eval-readiness measures *declared prompts*, define "waiver" in `reporting-contract.md` as the single source of the final-summary gates, and clarify in `audit-policy.md` that a clean audit ends only the audit step.
- Depends on: T2 (assertions must describe the corrected wording).
- Verification: for each of the 11 in-scope skills `node skills/<name>/scripts/grade.js audit --skill skills/<name>/SKILL.md` → exit 0, and `node skills/<name>/scripts/grade.js case --evals skills/<name>/evals/evals.json --skill skills/<name>/SKILL.md --out $TEMP/<name>-results.json` → every static assertion passes with live assertions reported `not-run`; `score.js` self-containment for the six new graders rises 60 → 100 with overall >= 98; a node one-liner asserts every case in all 11 eval sets has a non-empty `prompt`.

### T4 [x] [S] [Code] — Re-run the gates and write the closeout report
- Target files: `tasks/plan.md` (findings ledger + outcomes), `tasks/todo.md` (all boxes checked), `docs/issues/18-noticed-but-not-touching.md` **only if** a candidate is found and the operator approves publishing it.
- What is built: execute every gate and record observed output — never predicted. `validate.js --all` (bare) and `validate.js --all "$PWD/skills" --json`; `score.js --json` per in-scope skill compared line-by-line against the `SPEC.md` baseline; `grade.js audit` + `grade.js case` for all 11 graders; `validate.test.js`. Every finding gets one ledger row: skill, evidence (file:line or verbatim quote), outcome (fixed / waived-with-reason / open question), eval link. Confirm with `git status --short` that no pre-existing unrelated path changed.
- Depends on: T1, T2, T3.
- Verification: `--all` exits 0, or the single waiver's skill + check + tokens + reason recorded verbatim; every in-scope overall >= baseline; `git status --short` lists only in-scope paths.

## T4 — Findings ledger (all rows verified by executed command, 2026-10-03)

| # | Skill | Evidence | Outcome |
|---|---|---|---|
| 1 | shadcn | `validate.js --all` → `phantom-skill-refs` on 14 Tailwind/ARIA/package tokens | **Fixed** — `isNonSkillVocabulary()` by shape, not prefix; `validate.test.js` proves `bg-cleanup`/`data-import-skill` still fail |
| 2 | (workbench) | `DEFAULT_SKILLS_ROOT` hardcoded `'C:/Users/Tiger/.agents/skills'` | **Fixed** — derived from `__dirname`; `inventory.js` imports it |
| 3 | (workbench) | `parseFrontmatter` kept the block-scalar indicator as the value: `description: >` parsed as `">"` for `agent-reach`, `humanizer`, `orca-cli`, `orchestration`, `vercel-composition-patterns`, `vercel-react-native-skills` | **Fixed** — indicators stripped, folded scalars joined |
| 4 | (workbench) | `parseFrontmatter` truncated `description: one` + `  two` to `"one"` | **Fixed** — `validate.test.js` covers both shapes |
| 5 | (workbench) | `score.js:70` comment claimed full marks at two folders; the real formula gives `references`+`evals` = 3/5 = 60 | **Fixed** — comment corrected; the 60→100 rise came from adding real graders, not from touching the scorer |
| 6 | pipeline-triage | Rows 10-11 routed dirt to II/III by size with no origin check | **Fixed** — unknown-origin stop rule precedes the table |
| 7 | i-pick-issue | Step 1 claimed the issue, then delegated to II which claims again | **Fixed** — II owns the first write |
| 8 | iii-build-plan | No preconditions: could build on the wrong branch or restart a finished plan | **Fixed** — branch, dirt-origin, resume |
| 9 | iv-review-build-and-pr | Shipped waits were 60s; the prose said 15s (lines 163/169/172/175) | **Fixed** — all 60s |
| 10 | v-babysit-pr-and-merge | Artifact check was one narrow `git ls-files` grep, narrower than VI's real discovery set | **Fixed** — full set; inconclusive ≠ skip |
| 11 | vi-close-pipeline | No distinct blocked/incomplete outcome | **Fixed** — five named blocking classes |
| 12 | present-pr | Claimed VI "suggests it after closeout" unconditionally | **Fixed** — three-way conditional handoff |
| 13 | 6 skills | No `scripts/grade.js`; 24 static assertions never executed | **Fixed** — 6 graders added |
| 14 | pipeline-triage, present-pr | 15 eval cases, **0** `static_assertions` — prose `expectations` only | **Fixed** — 36 assertions added |
| 15 | skill-workbench | 8 cases, 0 assertions, and no grader at all | **Fixed** — grader + 11 assertions |
| 16 | all graders | Resolver checked only `skills/`, so real personas (`tdd-guide`, `code-explorer`) read as phantom | **Fixed** — resolves against `agents/` too |
| 17 | all graders | `max_template_lines` reported "template has -1 lines" — the Hebrew contract had moved to `references/`, unfixable from SKILL.md | **Fixed** — falls back to the referenced file |
| 18 | ii-plan, v-babysit, vi-close, create-issue | 9 assertions referenced prose that exists nowhere in the repo (verified: phrases return NOWHERE) | **Fixed** — repointed at shipped templates, intent preserved |
| 19 | l1-description check | Required `Station|issue|plan|GitHub`; rejected valid "Use when the user says…" descriptions | **Fixed** — accepts an explicit trigger phrase |
| 20 | docs (out of scope) | `validate.js --docs` → `doc-phantom-skill-refs`: `docs/issue-to-pr-skill-workflow.md:66` names `local-only`, which is not a skill | **Open question — pre-existing and out of scope.** Reproduced: the token is present at `ac01d5f`, before this branch. It is a marker word in prose, not a skill reference. Not fixed here — docs content is outside Issue #18's scope and `--docs` is not one of this issue's gates. Raise as a follow-up: either add `local-only` to the workbench allowlist, or backtick it differently in the doc. |

**Pre-existing, not introduced here:** findings 17 and 18 produced 18 failing assertions *at HEAD* — verified by running the committed graders against committed files. Now 0. Finding 20 is likewise pre-existing, verified against `ac01d5f`.

## T4 — Executed gates (observed, not predicted)

| Gate | Observed |
|---|---|
| `validate.js --all` | exit **0** — 90 skills, 0 fail, 0 warn |
| `validate.js --all "$PWD/skills" --json` | exit **0** |
| `validate.test.js` | **12/12 pass** |
| `grade.js audit` × 11 | **0 fails** each |
| `grade.js case` × 11 | **192 assertions, 192 passed, 0 failed** |
| `score.js` × 11 | all **≥ baseline**; 8 skills rose 98 → 100 |
| Body lines | all ≤ 250; `skill-workbench` 310 (ceiling ~340) |
| Prompt coverage | 58 cases, **0** missing prompts |
| Phantom negative test | `ghost-skill` **fails**, real persona `tdd-guide` **resolves** — exemption is enumerated, not blanket |
| Scope | `git status` lists only in-scope skill files; no snapshot, no `iteration-1/`, no non-pipeline skill content |

## T4 — Closeout

All four tasks complete. No waivers were needed: every finding was fixed at the source
and is now covered by an executable check. Zero regressions against `SPEC.md` baselines.

Live `gh` assertions remain `not-run` by design — never executed against a real repository.

NOTICED-BUT-NOT-TOUCHING: no new candidate found that is worth publishing. The stale
assertions in finding 18 were fixed inside this issue's scope rather than deferred.

Checkpoints held: after T1 `--all` exits 0 with shadcn untouched; after T2 all 10 stations
validate clean at baseline-or-better; after T3 all 11 graders execute green.

## Findings ledger (T4 — every row is observed, not predicted)

| # | Skill | Evidence | Outcome | Eval / gate |
|---|---|---|---|---|
| F1 | skill-workbench | `validate-lib.js:9` hardcoded `'C:/Users/Tiger/.agents/skills'`; bare `--all` ignored the checkout | **fixed** — derived from `__dirname` + `SKILLS_ROOT`; `inventory.js:22` duplicate removed | `validate.test.js` "default skills root follows the script" |
| F2 | skill-workbench | `validateSkill()` read `fm.name` with `fm === null` → throws on missing frontmatter | **fixed** — null-guard + `fm-skipped` warn; non-frontmatter checks still run | 4 frontmatter tests (missing, unclosed, CRLF, no-SKILL.md) |
| F3 | shadcn | `--all` reported 1 fail, `phantom-skill-refs` on 14 CSS/ARIA/package tokens | **fixed at the source** — `isNonSkillVocabulary()`, shape-based not prefix-based | all 14 observed tokens exempt; `bg-cleanup`/`data-import-skill`/`bg-wizardcraft` still fail |
| F4 | skill-workbench | `score.js:70` claimed 2 auxiliary folders give full marks; formula yields 3/5 = 60 | **fixed** — comment corrected, formula and weights untouched | the six graders taking 60 → 100 is the proof |
| F5 | skill-workbench | `spec-checklist.md:27` claimed `file-refs` covers backticked paths and enforces one-level depth | **fixed** — inline Markdown links only; backticks unchecked; no depth rule | now matches `validate-lib.js:236-237` |
| F6 | skill-workbench | `SKILL.md` never stated that `score.js` exits 0 even when validation fails | **fixed** — documented; judge by metrics, not exit code | `scorecard-from-real-output-explains-low-metrics` |
| F7 | skill-workbench | "clean" was undefined next to the final-summary gate | **fixed** — `reporting-contract.md` defines a waiver as a *non-clean* residual, single gate list | `waiver-is-not-clean` |
| F8 | skill-workbench | a clean audit read as "stop the whole flow" | **fixed** — `audit-policy.md` scopes it to the audit step | prose only |
| F9 | pipeline-triage | routing rows 10-11 classified unknown-origin dirt by size | **fixed** — stop rule placed *before* the table | 8 → 12 cases |
| F10 | i-pick-issue | `SKILL.md:64` claimed the issue; Station II claims too — a double claim | **fixed** — Station I delegates; II owns the first write | `claim-issue-first` assertion inverted |
| F11 | iii-build-plan | no preconditions for wrong branch, foreign dirt, or resume | **fixed** — all three added | grader added |
| F12 | iv-review-build-and-pr | prose said 15s while the shipped commands waited 60s | **fixed** — prose now 60s throughout | — |
| F13 | iv-review-build-and-pr | eval asserted `playwright-cli.*preferred`; the gate is playwright-cli **only** | **fixed** — assertion matches shipped wording (`docs/…:107`) | regraded green |
| F14 | iv-review-build-and-pr | an unverified proof result was silently omitted | **fixed** — mandatory PR-body disclosure, not a shipping failure | — |
| F15 | v-babysit-pr-and-merge | "skip VI" used a narrow artifact check, so dirty folders slipped through | **fixed** — consults VI's full discovery set; inconclusive → recommend VI | 2 new cases |
| F16 | vi-close-pipeline | blocked/incomplete had no report status, so failure looked like success | **fixed** — distinct status + 5 named blocking classes | — |
| F17 | present-pr | Station VI reference was unconditional | **fixed** — before/after-VI conditional handoff | 3 new cases |
| F18 | 6 stations | evals existed with no runner, so static assertions never executed | **fixed** — `scripts/grade.js` added; all 10 graders green | audit 0 / static 1.0 each |
| F19 | create-issue | claim note did not require a clean tree first | **fixed** — clean tree required; `issue-tracker.md` agrees | grader green |
| F20 | skill-workbench | eval fixture named a skill that does not exist (`vi-present-pr`) | **fixed** — renamed to `present-pr` | `skill-workbench` evals |
| F21 | docs | `validate.js --docs` fails on `local-only` in `issue-to-pr-skill-workflow.md:66` | **open question — pre-existing, out of scope** | reproduced on `main`: exit 1 before this branch |
### Observed gate results (T4, 2026-10-03)

| Gate | Command | Result |
|---|---|---|
| Repo validation | `validate.js --all` | `Validated 90 skill(s): 0 fail, 0 warn` — **exit 0** |
| Repo validation (JSON) | `validate.js --all "$PWD/skills" --json` | `validated=90 fail=0 warn=0`, `skipped_links=["cua-driver"]` |
| Validator regression | `validate.test.js` | 12 tests, 12 pass, 0 fail |
| Inventory | `inventory.js` | 90 clean, 0 warnings, 0 violations |
| Scores | `score.js --json` × 11 | every overall **>= baseline**; ten rose to 100, `skill-workbench` held 98 |
| shadcn | `score.js skills/shadcn --json` | `file-integrity` 50 → 100, `overall` 84 → 96, `validation_fails=0` |
| Graders | `grade.js audit` + `case` × 10 | audit exit 0 each; static pass rate **1.0** each (181 static assertions total) |
| Docs validation | `validate.js --docs` | exit 1 — pre-existing F21, reproduced on `main` |

**Zero waivers.** The single waiver the acceptance criteria permits was not needed: the
shadcn failure was fixed at its source, so `--all` exits 0 outright.

## Changed assumptions since the issue was written

- Working tree is clean (PR #21 merged); the "9 modified station files" precondition no longer applies.
- `pipeline-triage` scores 98, not CodeRabbit's claimed 96.
- The "Pipline Triage" heading typo and the `/vi-close-pipline` misspelling **do not exist** in the current tree — `search_codebase` returns no hits. Those items are dropped; they were presumably fixed by PR #21.
- Every eval case already has a prompt; the eval gap is case count + missing runners, not missing prompts.
- **Deviation adopted (operator-confirmed):** commit `dfdf050` also folded YAML block-scalar support (`key: >`, `|`, `>-`, `|+`) into `parseFrontmatter`, which T1 never planned. Verified safe before accepting it: 7 hand-built cases parse correctly, no description newly crosses the 1024-char cap, and no scorer reads `.metadata`, so the nested-object change is inert. Side benefit: 4 skills whose descriptions previously parsed as the literal character `>` (`agent-reach`, `humanizer`, `orca-cli`, `orchestration`) now expose their real text.
- `validate.js --docs` was already failing on `main` (F21). This issue did not introduce it and does not fix it.
