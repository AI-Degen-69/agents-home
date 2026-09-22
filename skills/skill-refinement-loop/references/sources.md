# Source material behind the mechanical checks

These are the published sources the loop runs against. They live here so the main
`SKILL.md` stays lean and the loop can point an LLM at the primary text when it
needs the original wording.

## Primary sources

### agentskills.io — Evaluating skill output quality
URL: https://agentskills.io/skill-creation/evaluating-skills

The eval set format (`evals/evals.json`), the workspace layout
(`iteration-N/with_skill/` and `without_skill/`), assertions, grading, and the
improvement loop that feeds failures back to an LLM.

Key ideas carried into this skill:
- Build a small eval set; don't skip to rewriting
- Assertions must be checkable, not vibes
- Run with-skill and without-skill (or previous-version baseline)
- Feed eval signals + current `SKILL.md` back to an LLM for improvement proposals
- Generalize from feedback; keep it lean; explain the why; bundle repeated work into scripts

### Phil Schmid — Practical Guide to Evaluating and Testing Agent Skills
URL: https://www.philschmid.de/testing-skills

10–20 prompts to start, negative tests, a deterministic checks registry,
LLM-as-judge used selectively, grading outcomes not paths, isolated runs,
multiple trials, graduating capability evals into regression evals, and
detecting retirement by running evals with the skill unloaded.

Key ideas carried into this skill:
- Define success in measurable terms (outcome / style / efficiency)
- Deterministic checks first, LLM-as-judge only for qualitative things
- Negative tests catch too-broad trigger descriptions
- Run with the skill unloaded to detect retirement for capability skills

### OpenAI — Testing Agent Skills Systematically with Evals
URL: https://developers.openai.com/blog/eval-skills

Capture tool-call traces, write deterministic checks against behavior events,
use a structured rubric pass where rules fall short, and turn every manual fix
into a test.

Key ideas carried into this skill:
- Traces reveal why something failed, not just that it failed
- Every manual fix becomes a test
- Structured rubric pass where deterministic checks aren't enough

### MLflow — Evaluating and Improving Agent Skills with MLflow
URL: https://mlflow.org/blog/evaluating-improving-agent-skills

Behavioral metrics over answer accuracy, trace-based scorers, and the concrete
result that one instruction change moved Correct Tool Selection from 43% to 98%.

Key ideas carried into this skill:
- Behavioral checks: did the skill do the right things in the right order?
- Traces matter for diagnostics
- Small instruction changes can move the needle a lot

### Red Hat — Building skills for AI agents: pitfalls and best practices
URL: https://next.redhat.com/2026/07/28/building-skills-for-ai-agents-pitfalls-and-best-practices

Capability vs preference skills, scripts for mechanical work plus LLM reasoning
for subjective parts, keeping `SKILL.md` under ~500 lines, writing L1
descriptions as search-optimized abstracts, 1–3 skills per task as the sweet
spot, and hybrid architecture.

Key ideas carried into this skill:
- Capability skills deprecate as models improve; note the shelf life
- Preference skills are durable but only as good as fidelity to the workflow
- Split optional content into separate files loaded on demand
- L1 description is the discoverability bottleneck — make it specific

### Anthropic — Effective context engineering for AI agents
URL: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

Start minimal, add clear instructions and diverse canonical examples based on
failure modes found in testing, don't stuff a laundry list of edge cases, and
structure instructions in distinct sections.

Key ideas carried into this skill:
- Minimal prompt first, expand from failure modes
- Canonical examples beat exhaustive edge-case lists
- Distinct, structured sections beat blobs

## How to use this folder in the loop

When Phase 1 asks the agent to consult a source, point it here. The mechanical
design checks from Red Hat and the context-engineering checks from Anthropic
are enumerated in **`docs/workflow.md` §1g** (the single canonical list —
duplicated inline lists were removed in the 2026-09-17 workbench alignment pass).
- "Read `docs/workflow.md` §1g before judging the mechanical state of a skill"
- "Read `references/sources.md` when you need to cite the original wording"
