# Audit Policy — truthful criticism & proactive improvement

How the workbench audits any skill: what counts as a finding, what counts as a
proposal, and the standing flow for auditing a skill end-to-end.

## 1. Truthful criticism — only when confident

Every finding must be grounded in something actually read or observed:

- the spec rule it breaks (cite the check-id from spec-checklist.md)
- the contradicting section (quote both sides)
- the failing check (paste the validator line)

**Never invent findings. Never pad the report.** אין להמציא — the same
discipline the pipeline skills enforce. An audit with zero findings is a valid
outcome; say "clean" and stop.

"Audit is clean" closes **the audit step only**. It is not the end of the flow:
when the operator also asked for routing or deploy, the main workbench flow
continues to those steps, reporting a clean audit as an input to them.

Low confidence ⇒ mark it explicitly as an **open question**, never a finding.
A finding implies you would bet the fix on it.

## 2. Proactive improvements — the ones the user hasn't thought of

Beyond mechanical compliance, the audit proposes improvements that are logical
and fairly serve the skill's **main objective** — what the skill is supposed to
deliver at the end. The test for every proposal:

1. Name the skill's core deliverable (one sentence).
2. Ask: does this measurably improve reaching it — or a collateral metric that
   directly helps it?

Valid collateral metrics:

- **Execution speed** — fewer wasted steps, leaner trigger paths, scripts for
  repeated work
- **Delivery output format** — clearer, leaner, better-targeted output contracts
- **Research usage** — consulting live sources (e.g., the agentskills.io MCP)
  instead of stale cached assumptions
- **Trigger fidelity** — description improvements so the skill fires when needed
  and stays silent when not

Presentation (the `ii-plan-issue` Step-5 pattern):

> 💡 what it changes · why it pays off — the operator decides adopt/defer/drop.

Never fold a proposal in silently. If nothing genuinely valuable surfaced, say
so and skip — do not invent filler.

## 3. Standing audit/alignment flow (any skill, including helpers)

This flow is generic — the workbench uses it on any target skill, including its
own helpers (`skill-creator`, `skill-refinement-loop`, or any future one).

1. **Snapshot** — copy the original skill folder to `evals/snapshots/` (inside
   the *target's* evals dir when it has one, else `evals/snapshots/<name>-vN/`
   in the workbench workspace) before any edit.
2. **Duplicate scan** — content repeated between SKILL.md and `references/`
   or `docs/`: keep one canonical copy, replace the other with a pointer.
3. **Contradiction scan** — instructions that diverge between SKILL.md and its
   expanded docs; stale claims vs. what the scripts actually do. Resolve in
   favor of the canonical source (scripts > docs > prose).
4. **Spec alignment** — apply spec-checklist.md: name/dir match, description as
   the trigger surface, progressive disclosure (lean SKILL.md, detail in
   references/), one-level file references, ≤ 500-line body.
5. **Phantom reference scan** — validator's `phantom-skill-refs` +
   `file-refs` checks.
6. **Fix with minimal diffs** — remove duplicates, resolve contradictions,
   restructure only where the spec demands it.
7. **Validate** — run scripts/validate.js on the target; must be clean.
8. **Loop record** — output a compact record: skill, type
   (capability/preference), duplicates removed, contradictions resolved, spec
   changes, open questions, proposals (adopted/deferred/dropped), next step.

## 4. What an audit is not

- Not a rewrite. Minimal diffs; the skill's voice and structure stay.
- Not an eval run. Eval execution stays with `skill-creator` /
  `skill-refinement-loop`; the audit only checks that the eval surface exists.
- Not silent. Every change, finding, open question, and proposal appears in the
  loop record.
