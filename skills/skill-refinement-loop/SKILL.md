---
name: skill-refinement-loop
description: "Use when the user wants to iteratively refine, polish, and customize a skill against professional best practices — invokes an eval-driven improvement loop that starts by gathering the skill pointer and context, mechanically aligns it to published best practices, then hands back for user customization and refinement requests."
---

# Skill Refinement Loop (`skill-refinement-loop`)

Refines any skill the user points it at. Two phases:

1. **Mechanical alignment** — assessed and improved against published best practices, producing measurable eval artifacts
2. **Customization** — the user refines the result with specific requests

The loop starts from the eval-driven, behavior-grounded frameworks published by
agentskills.io, OpenAI, Phil Schmid, MLflow, Red Hat, and Anthropic. It does not
start from opinion.

**Folder structure** — this skill keeps its entry point lean and delegates detail
into subfolders:

- `references/` — source material behind the mechanical checks
- `docs/` — expanded workflow playbook (§1g holds the canonical mechanical-check list)
- `examples/` — worked example eval set
- `evals/` — this skill's own eval set (`evals/evals.json`)
- `scripts/` — small deterministic helpers

When the loop needs detail, it reads the relevant file from those folders rather
than re-shrinking the main instructions every time.

---

## When to Use

- The user says "improve this skill", "refine my skill", "make my skill follow best practices", "I want to iterate on a skill until it's right"
- A skill produces the same output shape every time regardless of input (the "same structure pixel-to-pixel" failure mode)
- A skill exists but has never been eval-tested
- The user wants a repeatable workflow they can re-run on any skill

---

## Phase 0: Intake — ask the user before doing anything

Before touching the skill, ask these questions. Do not skip to improvement
without answers.

**Required:**

1. **Skill pointer** — path to the skill folder, or the skill name if it's already loaded
2. **What the skill is supposed to do** — one or two sentences
3. **What "good" looks like** — how will the user know the skill is improved?

**Helpful:**

4. **What kind of skill is this?** Capability (compensates for a model gap) or preference (encodes a workflow / convention)?
5. **What inputs should it handle?** List 3–5 representative input shapes
6. **What's the current failure mode?**

Record the intake as a short block at the top of the working area.

For the full question wording and why each matters, see `docs/workflow.md`.

---

## Phase 1: Mechanical Alignment

Do each step in order. Don't skip to "rewrite the skill" without producing the
eval artifacts first.

### 1a. Classify the skill

From `references/sources.md` — the Red Hat entry:

- **Capability skill** — compensates for something the base model can't do consistently. Deprecates as models improve. Note the shelf life.
- **Preference skill** — encodes workflow, conventions, institutional knowledge. Durable, but only as valuable as fidelity to the actual workflow.

### 1b. Write the success definition before building any eval

From `references/sources.md` — Phil Schmid:

Define success in measurable terms across three dimensions. Grade outcomes, not
paths.

- **Outcome** — did it produce a usable result?
- **Style / instruction-following** — did it follow the conventions?
- **Efficiency** — time, tokens, retries.

Write concrete checks for each dimension. If a check can't be made deterministic,
say so and classify it as qualitative.

### 1c. Build a small eval set with shape variation

Use the agentskills.io `evals/evals.json` format. See `examples/eval-set.json`
for a worked example.

Rules:

- Include shape variation explicitly
- Include negative cases — prompts where the skill should NOT trigger
- Cover at least one edge case

Each assertion must be checkable. "The output is good" is not checkable.
"Flow cards are absent" is.

### 1d. Run with-skill and without-skill

From `references/sources.md` — the agentskills.io entry:

- Each run gets a clean context
- Snapshot the old version before editing; point the baseline run at the snapshot
- Capture timing

### 1e. Grade with deterministic checks first, LLM-as-judge selectively

From `references/sources.md` — Phil Schmid + MLflow:

1. Deterministic checks first — file exists, structure present, regex checks,
   row counts, valid JSON
2. LLM-as-judge only for qualitative things — use sparingly
3. Behavioral metrics — did the skill do the right things in the right order?

Record results per case, per configuration.

### 1f. Feed failures back and propose improvements

From `references/sources.md` — the agentskills.io loop:

1. Give the eval signals + current `SKILL.md` + the intake block to an LLM and
   ask it to propose improvements
2. Review and apply the changes
3. Rerun all cases in a new `iteration-N/` directory
4. Grade and aggregate
5. Human review. Repeat.

Guidelines from the source: generalize from feedback, keep it lean, explain the
why, bundle repeated work into scripts.

### 1g. Specific mechanical checks from the research

Run these against the skill explicitly. The full check lists are in
`docs/workflow.md`, section **1g. Specific mechanical checks from the research**.

The checks come from:

- Red Hat — design hygiene, capability vs preference, L1 description quality,
  SKILL.md length, hybrid architecture
- Anthropic — minimal prompt first, canonical examples, structured sections
- agentskills.io + OpenAI + Phil Schmid — eval hygiene
- MLflow — behavioral checks and trace-based diagnostics

---

## Phase 2: Customization — hand back to user

Once the skill is mechanically aligned and evals exist, ask the user what they
want to refine. This is where preference and judgment live.

For each request, work the five steps below — one request at a time, following
the **progress-then-final-summary** reporting pattern (see the section by that
name):

1. Record it as a concrete change request
2. If it affects the success definition or eval assertions, update them
3. Apply the change
4. Rerun the relevant eval cases
5. Grade and report

Stop when the user is satisfied, or when changes stop producing meaningful
improvement.

For the retirement check on capability skills, see `docs/workflow.md`.

---

## Output the loop record

Output the full loop record — and the final job summary with it — only after
the whole pass is complete: every change request applied and graded, every eval
run, nothing left open. Do not present the loop record after a single request
or a single eval case; until then, report only progress (see the pattern
section below).

After each full pass, output a compact record:

```
## Loop record

**Skill:** <name / path>
**Type:** capability / preference
**Intake:** <one-line summary of what the user wants>
**Iteration:** N
**Eval cases:** N (with/without-skill or previous-version baseline)
**Pass rate:** with-skill % vs baseline %
**Behavioral checks:** <which passed / failed>
**Mechanical changes applied:** <list>
**User customization requests:** <list>
**Failures still open:** <list>
**Next:** <what to do next>
```

Keep it compact. The record is for tracking, not narrative.

---

## Progress-then-final-summary reporting pattern

When the operator asks for a batch of work (multiple change requests, multiple
findings, or a full Phase 1 + Phase 2 pass), reporting follows the canonical
[reporting contract](../skill-workbench/references/reporting-contract.md)
(shared with `skill-workbench` — the general pattern lives there; this section
is the flow-specific application):

- **Per item:** a 1–2 line progress note — what was just done (change applied,
  eval run, check passed) and how many items remain. Not a report, not a
  summary.
- **No mid-flow summaries.** No partial loop record, no final summary, and no
  usage example after a single item.
- **Final summary only at the end**, after every item is addressed, the loop
  record can be written in full, and the relevant eval cases pass clean.
  That final summary (with a one-sentence usage example) closes the loop for
  the skill.
- If an item cannot be finished without an operator decision, stop and ask;
  do not present a final summary before the decision.

## References

The full source list with URLs and what each contributes is in
`references/sources.md`. The shared reporting contract with `skill-workbench`
is canonical in `../skill-workbench/references/reporting-contract.md`. The
main citations are:

- agentskills.io — Evaluating skill output quality — https://agentskills.io/skill-creation/evaluating-skills
- Phil Schmid — Practical Guide to Evaluating and Testing Agent Skills — https://www.philschmid.de/testing-skills
- OpenAI — Testing Agent Skills Systematically with Evals — https://developers.openai.com/blog/eval-skills
- MLflow — Evaluating and Improving Agent Skills with MLflow — https://mlflow.org/blog/evaluating-improving-agent-skills
- Red Hat — Building skills for AI agents: pitfalls and best practices — https://next.redhat.com/2026/07/28/building-skills-for-ai-agents-pitfalls-and-best-practices
- Anthropic — Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

---

## How to invoke

This skill is loaded when the user asks to refine, improve, iterate on, or polish
a skill. The first action is always Phase 0 intake — ask for the skill pointer and
the guiding questions before touching anything.

Example invocation:

> "Take my `vii-present-pr` skill and refine it. It produces the same HTML structure
> for every PR regardless of the change shape."

The skill responds by asking Phase 0 questions before running Phase 1.

---

## MCP — live fetch from agentskills.io

This skill can fetch live content from the agentskills.io documentation site via
their MCP server instead of relying only on the cached references in this folder.

### When to use it

Use the MCP server when:

- The loop needs the latest wording from an agentskills.io page and the cached
  `references/sources.md` may be stale
- The loop needs to search the agentskills.io knowledge base for something not
  yet captured in this skill's reference folder
- The loop wants to read a specific agentskills.io page by path

Prefer information returned by the MCP server over prior knowledge when it's
available, and cite the relevant site results when possible. Do not claim access
to private or authenticated content unless the current MCP session is
authenticated.

### What the server exposes

Server name: **Agent Skills**
Version: **1.0.0**
Transport: **http**

Tools:

- `search_agent_skills(query)` — search the Agent Skills knowledge base for
  relevant documentation, code examples, API references, and guides
- `query_docs_filesystem_agent_skills(command)` — read-only shell-like queries
  against a virtualized documentation filesystem; use `tree / -L 2` to discover
  structure, `rg` to search, and `head` / `cat` on `.mdx` paths to read pages
- `submit_feedback(path, feedback)` — report a documentation problem to the docs
  team

Resources:

- `mintlify://skills/agent` — an in-server resource about creating, testing,
  optimizing, and implementing Agent Skills

### How to call it

When the MCP server is available to this session, call the tools directly:

1. Start with `search_agent_skills` for broad or conceptual queries (for example,
   "evaluating skills", "iteration", "evals", "assessment")
2. To read a specific page, use `query_docs_filesystem_agent_skills` with
   `head -N /path/to/page.mdx` or `cat /path/to/page.mdx`
3. To find pages by keyword or regex, run `rg -il "keyword" /` against the
   filesystem

Paths are specific to the site. Never guess them — discover real paths with
`tree / -L 2` or the search tool first.

If you find a problem with the documentation — a page that is incorrect,
outdated, confusing, or incomplete — use `submit_feedback` to report it to the
docs team.

### Fallback

If the MCP server is not available in this session, continue from the cached
references in `references/sources.md` and flag that the live source was not
reachable. Do not invent content to fill the gap.
