# Constraints — Issue #7

Locked by Station II (`ii-plan-issue`). Station III must respect every line.

- **Zero regressions:** every in-scope `score.js` overall must be **>= its baseline in `SPEC.md`**
  (iv-review-build-and-pr 100, v-babysit-pr-and-merge 100, pipeline-triage 100).
  `node skills/skill-workbench/scripts/validate.js --all` must stay at **0 fail, 0 warn**.
- **Anti-cheat:** forbid skipping or disabling checks, deleting or weakening an eval assertion,
  weakening a `must_match` regex to make a grader green, suppressing linters, or reporting
  predicted command output as observed. If a check cannot pass, record a waiver with a reason —
  never delete the assertion.
- **Forbidden edits:** `config/coderabbit/.coderabbit.yaml` and `config/coderabbit/README.md`
  (closed issues #5/#6, explicitly excluded by the issue); every non-pipeline skill; historical
  snapshots (`skills/*/evals/snapshots/**`, `skills/*/evals/iteration-1/**`); harness link types.
- **Line budgets:** keep each station `SKILL.md` body **<= 250 lines**. `iv-review-build-and-pr`
  is at 201 — only 49 lines of headroom, so **new rule text goes in `references/`** and body edits
  stay surgical.
- **Preserved invariants:** the PR **body** is unchanged (`## Summary`, `` `n `` separators,
  `Closes #<issue>`, `@coderabbitai summary`); Station IV's 60-second ack wait and its marker set;
  the `@coderabbitai review` trigger wording shared with `pipeline-triage`; Station V's
  single-review-round rule and its "never resolve silently without an inline reply" rule
  (`triage-and-apply.md:83`); the `5m → 4m → 3m → 2m → 1m` countdown; the **HARD RULE — no
  second trigger** (`triage-and-apply.md:187`).
- **Doc-truth invariant:** no skill may state that CodeRabbit produced findings or approved code
  when it did not. Every new status carries its evidence and its limits.
- **Plan-gating invariant:** each chat-gated command states its plan requirement in the skill text
  and names its fallback. No plan-gated step may be written as an unconditional instruction.
- **No new dependency, no code.** Markdown-only change set — no script, config, or dependency edits.

<!-- Historical: Issue #18 constraints retired here (all tasks [x], issue closed). -->

## Historical — Issue #18 (retired)

- Every in-scope `score.js` overall >= its baseline; `validate.js --all` 0 fail.
- No validator weakening; `phantom-skill-refs` must still fail for real phantom skill names.
- Live assertions stay `not-run` — never run live `gh` assertions against real repositories.
- Issue #19 constraints retired earlier (PR #21 merged).
