---
name: skill-workbench
description: Single entry-point workbench for the skill lifecycle in the global agents folder — inventories all skills, validates them against the agentskills.io Specification, audits them with truthful confident-only criticism and proactive improvement proposals, and routes deep work to the right helper (skill-creator for authoring/evals, skill-refinement-loop for refinement). Use when the user says "skill workbench", asks to check/audit/validate/improve a skill, wants a skills health report, or asks where a skill sits in its lifecycle.
---

# Skill Workbench (`skill-workbench`)

The workbench for the whole skill lifecycle: **inventory → validate → audit →
route → deploy**. It is a coordinator and quality gate, not a reimplementation —
deep work is delegated to existing helpers.

**Home:** global agents folder (`~/.agents/skills/skill-workbench`), consumed by
all harnesses via the link-type matrix in `skills/README.md` (Junction for
Claude Code / Hermes, SymbolicLink for Gemini CLI / Antigravity).

## Files

- `references/spec-checklist.md` — the agentskills.io Specification distilled
  into checkable rules with stable check-ids. Read before interpreting any
  validator finding.
- `references/audit-policy.md` — truthful-criticism + proactive-improvement
  policy, and the standing audit/alignment flow. Read before auditing.
- `references/reporting-contract.md` — canonical progress-then-final-summary
  reporting contract, shared with `skill-refinement-loop`. Read before fixing
  findings or reporting on a batch of work.
- `references/harness-link-repair.md` — diagnosing a canonical skill that will
  not load in a harness (orphan/duplicate-name junctions that shadow it) and
  repairing the link. Read when a skill is missing from a harness root or
  `skill_view` returns "not found".
- `scripts/validate.js` — zero-dependency validator (single skill or `--all`,
  `--json` for machine use). Exit 0 = clean, 1 = findings, 2 = usage error.
- `scripts/score.js` — zero-dependency scorer: 0–100 per metric + overall, for
  one skill (`--json` for machine use). Deterministic; reuses validate-lib.js.
  It **exits 0 even when validation finds fails** — always read the metrics, never
  the exit code, to judge a score. The scorecard shown to the operator is this
  command's actual output; every metric below 100 is explained, never shown bare.
- `scripts/inventory.js` — one-glance state of every skill in the root.
- `evals/evals.json` — this skill's own eval set.

## Modes

### 1. No args — Workbench Discovery

1. Run `node scripts/inventory.js` (add `--json` when another tool consumes it).
2. Present in this fixed order, each under its own header:
   - Summary line first: total skills count.
   - `## Missing Tests 🧪` — top 3 most urgent without evals, then `and X more...` if more. Clean skills are never listed in full.
   - `## Warnings ⚠️` — top 3, then `and X more...`.
   - `## Fix First ❌` — top 3 violations, then `and X more...`.
3. Then `## Next Action 🎯` — **one** section, not two. Never print a
   recommendation and then a separate choice menu: the recommendation is the
   default action, the alternatives are one line under it. The header names the
   action, not a position. Include:
   - `Recommended: <one skill>` — inventory.js ranks for you (violations first,
     then never-evaluated, then warns) plus one line on how to approach it
     (validate → audit → route).
   - One line: how to start on the recommendation (write the skill name), and
     how to pick something else (number from the lists above, e.g.
     `Fix First 1` / `Warning 2` / `Missing Tests 1`).
4. **Halt for operator choice.** Do not pick silently. A recommended default is
   not permission to proceed — the operator still confirms or overrides.

### 2. With a skill name — Single-Skill Workbench

Work these steps in order; report after each so the operator sees progress.

**Step A — Validate & Score.** Run `node scripts/validate.js <skill-folder>`,
then `node scripts/score.js <skill-folder>`. Every fail must be resolved or
explicitly accepted by the operator before routing. Interpret check-ids via
`references/spec-checklist.md`.

The scorer produces 0–100 per metric (deterministic, weights sum to 100):

| Metric | Weight | What it measures |
|---|---|---|
| `spec-compliance` | 40 | Frontmatter + structural spec rules (each fail impairs proportionally) |
| `file-integrity` | 25 | Relative file refs + phantom skill refs resolve |
| `eval-readiness` | 20 | `evals/evals.json` exists, parses, has cases with prompts |
| `size-discipline` | 10 | Body lines vs progressive-disclosure budget (≤250 full marks → 0 at 600) |
| `self-containment` | 5 | Auxiliary folders (`scripts/`, `references/`, …) present |

Report the scorecard **inside the מצב הסקיל section** (below), and let the
scores drive routing in Step C: `eval-readiness` < 100 → eval gap;
`spec-compliance`/`file-integrity` < 100 → fix-first; overall ≥ 90 with full
evals → deploy check. Overall ≥ 90 = excellent, ≥ 75 good, ≥ 50 needs-work,
else poor.

**Step B — Audit.** Follow `references/audit-policy.md`:
- Confident, grounded findings only — never invented (אין להמציא).
- Proactive proposals that serve the skill's main objective or a collateral
  metric (speed, output format, research usage, trigger fidelity) — presented
  for adopt/defer/drop, never folded in silently.
- Output a compact loop record.

**Step C — Lifecycle routing** (with the helper-integrity gate, below). State
where the skill sits and hand off — never duplicate the helper's work:

| Situation | Route to |
|---|---|
| Missing / broken / create from scratch | `skill-creator` |
| Exists but never eval-tested | `skill-creator` (evals) or `skill-refinement-loop` Phase 1 |
| Known failure mode / iteratively refine | `skill-refinement-loop` |
| Mechanically clean, no eval gap | Deploy check (Step D) |

**Helper-integrity gate:** before every hand-off, run
`node scripts/validate.js <helper-folder>` on the helper itself. If the helper
fails validation, report it and offer the standing audit/alignment flow
(`references/audit-policy.md` §3) on it first. This keeps every route
trustworthy — the gate applies to any helper, not just the two above.

**Step D — Deploy check.** Verify harness links exist with the correct link
type per `skills/README.md` (Junction vs SymbolicLink). Check only; print the
exact commands. Run them only on explicit operator approval. Step D is a hard
gate: no «סיכום סופי» before Step D is done (links verified) or explicitly
deferred by the operator, and the summary must state the deploy state.

**A skill that will not load is a registration problem first, a skill problem
second.** When a canonical skill is absent from the harness's skill list or
`skill_view` returns "not found", check the harness skills root before suspecting
the skill itself: a duplicate-name entry (a clean `foo` plus an orphan
`foo.rollback-broken` pointing at the same canonical folder) collides on
registration, the harness refuses to load either, and the skill silently
vanishes from the slash commands with no error anywhere — while the canonical
`SKILL.md` stays perfectly intact. Enumerate the harness root against the
canonical root, unlink the orphan as a link, and verify by loading. Exact
commands in `references/harness-link-repair.md`.

There are three causes, in check order: a same-root orphan twin, the same name
in two harness roots, and the harness's own per-skill activation toggle. The
first two leave a name-level trace on disk; the third leaves **none** — every
registry file reads healthy while the slash command returns "No matches", and
the fix is the in-app toggle, not a file edit. Restart the app after any
disk-side repair: a running session caches its command table and will not see
the fix.

### 3. Validate-only

Run the validator on the named skill, report findings by check-id, stop. This
mode produces a **validation report only** — no scorecard, no audit, no
routing, no deploy. It never escalates itself into a full workbench run.

## Conventions

- **The worked-on skill is the star.** Title format: `Skill: <name>`, plus group tag when it belongs to one (numbered Pipeline
  stations `i`–`vii`, or the system skills `pipeline-triage` / `create-issue`).
  Line below: `Path:` + full path; if Junction show `→` target and always work on the
  original. Workbench machinery gets one compact line each.
  Never enumerate steps or check-ids in the headline of the reply.
- **Dashboard** (when an HTML report is produced): save inside the worked-on
  skill's own folder — `skills/<name>/docs/workbench-report-<date>.html` — as a
  durable doc. **Default Language & Structure:** The HTML document must default to Hebrew: `<html lang="he" dir="rtl">` with readable modern fonts (e.g. `system-ui, -apple-system, "Segoe UI", Roboto, "Heebo", Arial, sans-serif`). English technical terms or code paths should be wrapped in `<span dir="ltr">` or `<code>` blocks to preserve visual flow without BiDi distortion. Verify in the Preview tab (snapshot/screenshot/logs) before delivery. Never `.freebuff/` or temp.
- This skill must itself pass its own validator: run
  `node scripts/validate.js <agents-root>/skills/skill-workbench` after any edit.

- **Size discipline:** keep the SKILL.md body under 250 lines for full marks; if exceeded, move detail to references/ or scripts/.

## English Chat Output Contract

**Output format** — every report follows this structure:

```markdown
# Skill: `<skill-name>` [(Group — Pipeline, if applicable)]

Path: `<full path>` [→ `<target>` if Junction — always work on the original]

## Skill Summary 📋
[Concise picture of the skill and its instructions — based only on what was actually read in `SKILL.md` + `references/`]

Skill Purpose: [One sentence — what the skill delivers at the end]

Instructions:
1. [What the skill directs the agent to do — verb + object]
2. [What to read — file / reference, in backticks]
3. [Which reference to use to implement what]
4. [What is produced — file / output / report]
5. [Access to another skill — name in backticks + why]
6. [Sub-agent invocation — which type + for what task]
[Continue as needed — one numbered step per instruction, in the order read from `SKILL.md`. Do not invent steps.]

## Skill State 📊
[One or two lines only: violation count + names. Passed checks summarized in one word, not detailed.]

### Numerical Score (Required — output of `scripts/score.js`)

**Overall: <overall>/100 (<verdict>)** — then one line per metric, format:
`<score>/100` `<metric-id>` (weight <w>). Fixed order:
`spec-compliance` (40) · `file-integrity` (25) · `eval-readiness` (20) ·
`size-discipline` (10) · `self-containment` (5). Any metric below 100 gets one
explanation line — what dropped it (check-id names from the Step A table). Full
score is not detailed. Do not invent scores — only scorer output.

## Audit Findings 🔍
[CodeRabbit-style format — see "Finding Format (Required)" below. Findings written
one by one in numbered cards (Finding 1, Finding 2...), each backed by code or
standard, never invented. Open questions go in Open Questions only — not as findings.]

## Open Questions ❓
[Only if any — each question on its own line, blank line between questions. Format:
Question 1: Question text — what needs operator decision
Guess: Most likely answer per logic — counts as correct if unanswered or not rejected]
[No questions = write: No open questions. Do not invent.]

## Improvement Proposals 💡
[Each proposal on its own line, one line, blank line between proposals. Your call: adopt / defer / drop.]

## Routing 🧭
[One concise line: what happens next and who does it. If blocked — what approval is needed.
No detail, no three lines. Emoji only at end of headers, never end of lines — no such
instruction in the contract, do not invent it as an excuse for density.]

## Next Options 🔀
[Three fixed steps, numbered, each on one line. Header is not "Next Action" because
there isn't one action — three genuinely different paths, and none is recommended:]
[1. Handle all findings one by one inside the skill — including open questions and guesses — per "One-by-One Finding Handling" below]
[2. Pick specific items (adopt / defer / drop per finding, question, proposal)]
[3. Simulate skill output in chat — see the output and edit accordingly]
```

In Discovery mode: English summary line + 3 headers in fixed order (Missing Tests →
Warnings → Fix First), each up to 3 items + `and X more...`, clean skills not shown.
Then one header only `## Next Action 🎯` (names the action, not the list position):
the recommended (one skill) as default, followed by one line with how to start from
the recommendation and the alternative (number from the lists). No separate
recommendation header and no separate choice menu — this is the same section. Then
stop for operator choice. Do not pick silently. Do not write that something was
"chosen" before the operator chooses — only "Recommended".

## Finding Format (Required) — CodeRabbit Style

Audit findings displayed in a table grouped by category, followed by detail cards per
finding — exactly like a CodeRabbit review on GitHub. Finding card structure (three
lines, blank line between cards):

```markdown
## Audit Findings 🔍

| Category | Findings | Severity |
|---|---|---|
| 📐 Quality & Maintainability | 2 | 🟡 |
| 🗄️ Data & Infrastructure Integrity | 1 | 🔴 |

### Finding 1

🗄️ Data & Infrastructure Integrity | 🟡 Minor | ⚡ Quick Fix

**Short action-title for the fix.**

Two-to-three line description: what is inconsistent, where exactly (file + lines,
in backticks), and what is needed for the record to be unambiguous. Backed by code
or standard, never invented. Open questions go to Open Questions only — not as
findings.
```

Fixed categories (finding falls to nearest): 📐 Quality & Maintainability,
🗄️ Data & Infrastructure Integrity, ⚡ Performance & Efficiency, 🧪 Tests &
Coverage, 📝 Documentation & Correctness, 🔒 Security & Reliability.

Severity: 🔴 Critical / 🟠 Major / 🟡 Minor. Effort: ⚡ Quick Fix / 🔧 Medium /
🏗️ Structural. Required: category tag appears first in tag line, then severity,
then effort, separated by pipes with spaces. Short title is an action sentence in
bold, and description has no paragraphs.

## One-by-One Finding Handling (Option 1 of "Next Options 🔀")

When the operator chooses Option 1 — handle all findings one by one, including
open questions and guesses — reporting follows the [Reporting Contract](references/reporting-contract.md)
(canonical definition shared with `skill-refinement-loop` — name of the
generalization, here the implementation):

- One finding at a time: fix inside the skill, then validate —
  `node scripts/validate.js <skill-folder>` must pass clean before moving
  to the next finding.
- After each finding — two-line English progress note: what was fixed, and how
  many remain (`X findings and Y open questions remaining`). Not a report, not a
  summary — the operator must see the work is not done.
- No partial "Final Summary". Only after all findings handled and all open
  questions answered (by answer or guess) and deploy check (Step D) done or
  explicitly deferred by the operator: re-run `scripts/score.js` + final clean
  validation, then show "Final Summary" including "Usage Example" — and that
  closes the workbench for this skill.
- Unanswered questions resolved by guess and marked as such; improvement
  proposals enter queue only on explicit adoption; finding requiring operator
  decision (e.g. explicit rule waiver) stops and asks — no summary before the
  decision.
- One item per response: fix a single finding, report progress note, stop. Do
  not fix two findings in one response, do not attach test creation or other
  changes to the fix, and do not attach "Final Summary" to any fix response —
  the summary always comes in its own separate response, only after the last
  item's progress note has been sent.
  (This rule applies when the operator asks to stop between items; when the
  operator chooses to handle all — see checklist below.)
- Checklist (default when operator says handle all findings one by one):
  iterate through the full queue sequentially, item by item, with validation
  after each item — no stopping after a single item. At the end show one task
  list where every item is marked ✓ Done or X Remaining (findings, open
  questions, adopted proposals, deploy) — so the operator sees what was done
  and what wasn't. As long as any X remains, the report is a status report, not
  a "Final Summary", and it must show the full list.
- An answered open question and an adopted improvement proposal are each their
  own item with their own progress note, exactly like a finding.
- At the start of one-by-one handling, declare the full queue from the initial
  scan: finding count, open question count, adopted proposal count, and deploy
  check status — and do not silently omit any item.
- Remaining line required in every report: every progress note and every
  summary must include "X findings and Y open questions and Z adopted proposals
  remaining + deploy status"; summary without this line is invalid, and a
  summary showing work as done while remaining is non-zero violates the
  contract.
- "Continue" or "GO" means the next single item only, never the rest of the
  queue at once.

## Final Summary (Only after all findings and open questions handled — closes the workbench)

Plain language, no code or technical concepts. Latin only in backticks.

```markdown
# Work Summary 🏁: `<skill-name>`

## What Was Done ✅
[What actually changed, in plain language]

## Why It Was Done 💡
[Why this helps the skill user, in plain language]

## What Works Now 🟢
[What can be done with the skill after the fix]

## Next Steps 👉
[One recommendation for what to do from here]

## Usage Example 💬
[One sentence: when to invoke this skill]
```
