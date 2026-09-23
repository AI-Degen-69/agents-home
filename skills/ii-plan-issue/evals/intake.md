# Intake — ii-plan-issue refinement loop

## Intake block

- **Skill pointer:** `C:\Users\Tiger\.agents\skills\ii-plan-issue` (global copy is the **single source of truth**; the project copy `skills/ii-plan-issue/` is removed after the pass)
- **What the skill does:** Station II of the user's 7-station pipeline (I–VII) — turns a GitHub issue into a right-sized spec (CONSTRAINTS.md, SPEC.md, tasks/plan.md) and hands off to `iii-build-plan auto`.
- **What "good" looks like (user words):**
  1. Correct plan artifacts — size tier + task-type classification right per issue; plan.md and CONSTRAINTS.md real, not boilerplate.
  2. Executable plan — atomic vertical slices with domain tags, helper skills, verification method iii-build-plan can run.
  3. Hebrew report fidelity — clean everyday Hebrew, tight template, no invented claims.
  4. **Better output delivery — the issue being planned is the star of the show.** Current reply reports too much on the skill itself; the issue comes last.
- **Skill type:** **Preference** (encodes the pipeline workflow/conventions; durable; value = fidelity to the user's actual pipeline).
- **Inputs to handle (user scope):** the two invocation modes only — explicit issue number, and no-args auto-discovery.
- **Failure mode (user words):** "never interviews, delivery structure looks off and too much. The reply is not centered around the issue itself it plans for — rather it reports too much on the skill itself while the project is the star of the show."

## Success definition (1b — measurable, outcome/style/efficiency)

| Dimension | Check | Deterministic? |
|---|---|---|
| **Outcome** | Skill prescribes producing `tasks/plan.md` + `CONSTRAINTS.md` (+ `SPEC.md` for Standard/Large) before reporting | Yes (regex over spec + artifact check at live run) |
| **Outcome** | Every referenced helper skill actually exists in the skills dir (no phantom routing) | Yes (existence scan) |
| **Style** | Report template **opens with the issue** (title + what it demands) before any skill/classification talk | Yes (template-order check) |
| **Style** | Report template is lean (≤ 40 lines) and has type-specific branches, not one fixed shape | Yes (line-count + branch regex) |
| **Style** | "מה ה-Issue דורש" is short bullets quoting what the issue describes, not prose | Yes (bullet regex) |
| **Style** | Plan bullets state how each task answers the issue's requirement (plan ↔ issue linkage) | Yes (regex) |
| **Style** | "איך מוודאים?" replaces quality-guardrail talk: plain verification that the build answers the issue's problem | Yes (regex) |
| **Style** | Improvement proposal: one plain sentence, evidence-based (issue text or code location); no evidence ⇒ no proposal | Yes (regex for the evidence rule) |
| **Style** | Improvement proposal is adopted by default, dropped only on explicit operator rejection | Yes (regex) |
| **Style** | Everyday Hebrew, no invented claims (fabrication forbidden explicitly) | Regex for the rule; fluency = qualitative |
| **Efficiency** | SKILL.md length not larger than v0 while adding the fixes (no bloat) | Yes (line count) |
| **Efficiency** | Report boilerplate reduced vs v0 template | Yes (template line count) |

Behavioral (live-run, needs a real repo — see "next iteration"): recommend-and-claim exactly one issue without pausing; produces no station report on unrelated requests; on gh failure halts gracefully instead of fabricating.

## Loop config

- Baseline: `evals/snapshots/v0-SKILL.md`
- Iteration dir: `evals/iteration-1/`
- Snapshots: `v0` (original), `v1` (audit fixes, pre-interview-removal), `v2` (interview gate removed, pre-report-format-rework)
- Grader: `scripts/grade.js` (zero-dependency Node; subcommands `audit` and `case`)
- Live `gh` runs are **not** executed by the loop (they would claim real issues and mutate repo state); those assertions are recorded as `not-run` with mode `live`.
