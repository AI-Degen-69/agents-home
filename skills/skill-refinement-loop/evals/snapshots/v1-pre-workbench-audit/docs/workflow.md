# Workflow detail for the refinement loop

This is the expanded playbook. The main `SKILL.md` keeps the two-phase outline;
this file has the step-by-step so the loop can follow it without bloating the
entry point.

## Phase 0 — Intake

Do not start improving without answers. Record the intake as a short block at
the top of the working area.

### Required questions

1. **Skill pointer** — path to the skill folder, or the skill name if it's
   already loaded. If the skill isn't on disk yet, ask where it should be
   created.
2. **What the skill is supposed to do** — one or two sentences. If the
   description is vague, flag it. Vague L1 descriptions are the discoverability
   bottleneck.
3. **What "good" looks like** — how will the user know the skill is improved? If
   they can't say, help them write a success definition before proceeding.

### Helpful questions

4. **What kind of skill is this?** Capability (compensates for a model gap) or
   preference (encodes a workflow / convention)? The two need different
   investment and different retirement criteria.
5. **What inputs should it handle?** List 3–5 representative input shapes. If the
   skill currently produces the same structure for everything, that's a signal to
   build eval cases that force shape variation.
6. **What's the current failure mode?** Same output every time? Doesn't trigger
   when it should? Triggers when it shouldn't (negative tests catch this)?
   Produces filler sections?

## Phase 1 — Mechanical alignment

### 1a. Classify the skill

From the Red Hat source in `references/sources.md`:

- **Capability skill** — compensates for something the base model can't do
  consistently. Deprecates as models improve. Note the shelf life up front.
- **Preference skill** — encodes workflow, conventions, institutional knowledge.
  Durable, but only as valuable as fidelity to the actual workflow.

### 1b. Write the success definition before building any eval

From Phil Schmid:

Define success in measurable terms across three dimensions. Grade outcomes, not
paths.

- **Outcome** — did it produce a usable result? File exists, HTML renders, code
  compiles, the document got created. Baseline.
- **Style / instruction-following** — did it follow the conventions? Right
  structure, correct patterns, the formatting specified. Deterministic-checkable
  where possible.
- **Efficiency** — time, tokens, retries. Two runs can produce identical correct
  output where one burned 3× the tokens. Regressions here are real costs.

Write concrete checks for each dimension. If a check can't be made
deterministic-ish, say so and classify it as qualitative (LLM-as-judge
territory, used selectively).

### 1c. Build a small eval set with shape variation

From agentskills.io + Phil Schmid + OpenAI:

- Start with 4–6 representative cases across different input shapes for a
  refinement pass on an existing skill.
- Include shape variation explicitly. If the skill currently produces the same
  structure for everything, the eval set must include cases that *should*
  produce different structures.
- Include negative cases — prompts where the skill should NOT trigger.
- Cover edge cases — at least one prompt that tests a boundary condition,
  malformed input, or ambiguity in the skill's instructions.

Use the agentskills.io `evals/evals.json` format. See `examples/eval-set.json`
for a worked example. Each assertion should be checkable. "The output is good"
is not checkable. "Flow cards are absent" is.

### 1d. Run with-skill and without-skill

From agentskills.io workspace structure:

```
workspace/
  iteration-1/
    eval-case-1/
      with_skill/
        outputs/
        timing.json      # tokens + duration
        grading.json     # assertion results
      without_skill/     # or "previous_version" snapshot
        outputs/
        timing.json
        grading.json
    benchmark.json        # aggregated pass rates per configuration
```

Rules:

- Each run gets a clean context — no leftover state from the dev process
- Snapshot the old version before editing; point the baseline run at the
  snapshot
- Capture timing — a skill that improves quality but triples token usage is a
  different trade-off than one that's better and cheaper

### 1e. Grade with deterministic checks first, LLM-as-judge selectively

From Phil Schmid + MLflow:

1. **Deterministic checks first** — file exists, structure present, regex checks,
   row counts, valid JSON. Fast, reliable, reusable across iterations.
2. **LLM-as-judge only for qualitative things** — code structure, naming
   conventions, whether the output follows intended patterns, whether it "feels
   right." Use structured output so results are parseable. Use sparingly.
3. **Behavioral metrics** — from MLflow: did the skill do the right things in the
   right order, not just produce a right-looking final answer?

Record results per case, per configuration. Empty feedback on a case means it
passed review.

### 1f. Feed failures back and propose improvements

From agentskills.io's loop:

1. Give the eval signals + current `SKILL.md` + the intake block to an LLM and
   ask it to propose improvements
2. Review and apply the changes
3. Rerun all cases in a new `iteration-N/` directory
4. Grade and aggregate
5. Human review. Repeat.

Guidelines to include in the improvement prompt:

- **Generalize from feedback** — fixes should address underlying issues broadly,
  not narrow patches for specific examples
- **Keep it lean** — fewer, better instructions often beat exhaustive rules. If
  pass rates plateau despite adding more rules, the skill may be
  over-constrained; try removing instructions
- **Explain the why** — "Do X because Y tends to cause Z" works better than
  "ALWAYS do X, NEVER do Y"
- **Bundle repeated work** — if every run independently writes a similar helper,
  that's a signal to put it in `scripts/`

### 1g. Specific mechanical checks from the research

Run these against the skill explicitly.

**From Red Hat (design):**

- Is the skill capability or preference? Recorded?
- Is the L1 description specific about inputs/outputs, written like a
  search-optimized abstract? If it's generic, flag it
- Is `SKILL.md` under ~500 lines? If longer, split optional content into
  separate files loaded on demand
- Are ungated L3 resources minimized? Reference files can inject tens of
  thousands of tokens per invocation
- Is the skill focused? 1–3 skills per task is the sweet spot; more can actively
  hurt
- Is there a hybrid architecture — scripts for mechanical work, LLM reasoning
  for subjective parts?

**From Anthropic (context engineering):**

- Is the prompt minimal but sufficient — the smallest set of high-signal tokens
  that outlines expected behavior?
- Are there diverse, canonical examples rather than a laundry list of edge
  cases?
- Are instructions structured in distinct sections?
- Did you start minimal and add based on failure modes found in testing, rather
  than stuffing everything in up front?

**From agentskills.io + OpenAI + Phil Schmid (eval hygiene):**

- Are assertions deterministic-checkable where possible?
- Are negative tests included?
- Are outcomes graded, not paths?
- Is each run isolated?
- Are multiple trials run per case (3–5) to see the distribution, not just one
  result?
- Are evals graduated — capability evals that start low and climb become
  regression evals once they hit ~100%?

**From MLflow (behavioral):**

- Are there behavioral checks, not just final-output checks?
- Do traces (or equivalent) reveal why something failed, not just that it failed?

## Phase 2 — Customization

Once the skill is mechanically aligned and evals exist, ask the user what they
want to refine. This is where preference and judgment live.

Examples of what the user might ask for:

- "Make the output shorter"
- "Change the visual style"
- "Add a section for X kind of change"
- "Don't include Y section"
- "Make the description more/less broad so it triggers differently"
- "Add an example for Z scenario"
- "Retire this capability skill — the model handles it now"

For each request:

1. Record it as a concrete change request
2. If it affects the success definition or eval assertions, update them
3. Apply the change to the skill
4. Rerun the relevant eval cases (not necessarily all — but the ones that could
   regress)
5. Grade and report

Stop when the user is satisfied, or when changes stop producing meaningful
improvement.

### Retirement check (capability skills)

From Phil Schmid: run the evals with the skill unloaded. If they still pass, the
model has absorbed the skill's value. For capability skills, this is the
retirement signal — record it and offer the option. Preference skills don't
retire this way; they retire when they drift from the actual workflow.
