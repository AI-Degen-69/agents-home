# SPEC — Issue #18: Audit pipeline station skills with skill-workbench and fix findings plus evals

Branch: `i18/audit-pipeline-station-skills-and-fix-findings-plus-evals`

## Goal

Every pipeline station skill (10 stations + `skill-workbench` itself) ends this
issue with: `validate.js` clean, `score.js` at or above its pre-fix baseline, an
audit-policy pass with every finding fixed or waived-with-reason, and a
prompt-bearing eval set with a deterministic runner.

## Executed baseline (2026-10-03, `C:\Users\Tiger\.agents`)

Captured by running the commands — not predicted.

`node skills/skill-workbench/scripts/validate.js --all` → **exit 1**, `Validated 90 skill(s): 1 fail, 0 warn`.
The single failure is `skills/shadcn/SKILL.md` → `phantom-skill-refs` on 14 tokens:
`bg-primary, text-muted-foreground, bg-blue-500, size-10, bg-background, z-index,
data-invalid, aria-invalid, data-disabled, data-icon, animate-pulse, size-4,
lucide-react, react-router`.

`node skills/skill-workbench/scripts/score.js skills/<name> --json` (in-scope 11):

| skill | overall | self-containment | body lines | eval cases (with prompt) | `scripts/grade.js` |
|---|---|---|---|---|---|
| i-pick-issue | 98 | 60 | 97 | 4 (4) | — |
| ii-plan-issue | 100 | 100 | 132 | 4 (4) | yes |
| iii-build-plan | 98 | 60 | 76 | 3 (3) | — |
| iiib-iterate-after-build | 98 | 60 | 58 | 4 (4) | — |
| iv-review-build-and-pr | 98 | 60 | 200 | 6 (6) | — |
| v-babysit-pr-and-merge | 100 | 100 | 137 | 4 (4) | yes |
| vi-close-pipeline | 100 | 100 | 139 | 2 (2) | yes |
| pipeline-triage | 98 | 60 | 72 | 8 (8) | — |
| create-issue | 100 | 100 | 116 | 4 (4) | yes |
| present-pr | 98 | 60 | 164 | 7 (7) | — |
| skill-workbench | 98 | 100 | 305 | 5 (5) | — |

**Every eval case in every in-scope skill already has a prompt.** The eval gap is
therefore *case count* and *missing runners*, not missing prompts.

## Acceptance criteria (from the issue, restated as tests)

1. `validate.js` passes for every in-scope station skill with zero `fail` findings.
2. Audit-policy review completed per station; each finding fixed or explicitly waived with a reason.
3. Eval coverage reviewed per station; thin sets expanded; every case has a prompt.
4. `score.js` re-run per station shows no regression from the baseline table above.
5. `node skills/skill-workbench/scripts/validate.js --all` exits 0, or exits nonzero only with the single documented waiver recorded in the closeout report.

## Edge cases

- The `phantom-skill-refs` matcher must keep failing for genuine typos (`bg-cleanup`,
  `data-import-skill` are near-misses that must still fail).
- `validateSkill()` must return findings, not throw, when frontmatter is absent,
  unclosed, or CRLF.
- Live `gh` assertions stay `not-run`; never run them against real repositories.
- `skill-workbench/SKILL.md` body is 305 lines; the size-discipline curve drops the
  overall score at ~340 lines. New rule text goes to `references/`.

## Out of scope

- Content edits to non-pipeline skills (`skills/shadcn/SKILL.md` in particular).
- Harness link-type changes.
- Changing Station IV's 8-call cap, two-failure stop, or browser flow (Issue #10 invariants).
- Rewriting any SKILL.md; minimal diffs only.
