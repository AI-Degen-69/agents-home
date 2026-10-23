---
name: retro
description: "Periodic post-session analysis that classifies findings into deterministic checks (linters/pre-commit/CI) and CODING_STANDARDS.md judgment calls. Improves the agent environment, not the code."
tags:
  - review
  - process
  - quality
related_skills:
  - iv-review-build-and-pr
  - vi-close-pipeline
  - constraint-driven-development
  - documentation-and-adrs
disable-model-invocation: false
---

# Retro

Periodically look back at a coding session and suggest changes to the
**agent's environment** — not the code. This is the last step of the
full pipeline, after `code-review` and `pr`, and before `vi-close-pipeline`
closes out.

## Process

### 1. Gather Inputs

Read the artifacts from the just-completed session:

- **PR body** and **CodeRabbit review comments** (`gh pr view <n> --comments`)
- **Test failures** from CI logs (`gh run view <run> --log-failed`)
- **Git diff** (`git diff --name-only origin/<base>...HEAD`)
- **Review findings** from Station IV (OCR, reviewer findings, Spec-axis findings)
- **NOTICED-BUT-NOT-TOUCHING ledger** (`docs/backlog/i<id>-<slug>.md`)
- **AGENTS.md / CLAUDE.md** (existing navigation pointers, rules, guardrails)

Full input catalog: `references/input-sources.md`.

### 2. Classify Each Finding

Every finding is **mechanical** or a **judgment call**. This classification
determines what action to propose:

**Mechanical** — a pattern that can be enforced by a tool: a lint rule, a
pre-commit hook, or a CI job. If the same violation could recur, it gets a
deterministic check.

**Judgment call** — a matter of style, architecture, or convention that requires
human interpretation. These go into `CODING_STANDARDS.md`, never into an
automated rule.

Full classification taxonomy: `references/classification.md`.

### 3. Propose Environment Changes

Group findings into these categories:

1. **Navigation pointers** — what files/imports/patterns were hard to find?
   Propose adding them to `AGENTS.md` under a "Key Files" or "Codebase Layout"
   section so the next session finds them instantly.
2. **Automated checks** — for every mechanical finding, propose a concrete
   lint rule, pre-commit hook, or CI job that would have caught it statically.
3. **Coding standards** — for every judgment-call finding, propose a
   `CODING_STANDARDS.md` entry with the principle and a concrete before/after
   example.
4. **Tool economy** — were tools used inefficiently? (e.g., running full test
   suites when targeted tests suffice, or browser sessions left open)
5. **Information access** — were docs, ADRs, or GLOSSARY entries missing or
   stale that the agent needed?

### 4. Flag Missing Guardrails

A repo with **no guardrails at all** is itself a finding. If there is no
`AGENTS.md`, no `CONSTRAINTS.md`, no lint rules, no pre-commit hooks, or no CI
checks — propose adding the minimal baseline.

### 5. Present and Wait

Present the findings as a structured report. **Never auto-apply.** The
operator must approve each proposed change. Retro is not autopilot.

## When to Use

- **After Station V** (`v-babysit-pr-and-merge`) — the natural home in the
  pipeline.
- **Periodically** — not after every PR. A batch of 3–5 PRs is a natural
  cadence.
- **On explicit request** — `/retro <pr-number>` or `/retro <issue-number>`.

## Output Format

```markdown
## Retro Report — Session #<N>

### Classification Summary
- Mechanical findings: <N>
- Judgment calls: <N>

### Proposed Changes

#### 1. Navigation Pointers (AGENTS.md)
- <finding> → propose adding to AGENTS.md under "Key Files"

#### 2. Automated Checks
- <finding> → propose <lint rule / pre-commit hook / CI job>

#### 3. Coding Standards (CODING_STANDARDS.md)
- <finding> → propose CODING_STANDARDS.md entry: <principle>

#### 4. Tool Economy
- <finding> → <proposal>

#### 5. Information Access
- <finding> → <proposal>

### Missing Guardrails
- <list of absent guardrails>

---
Approve each change with ✅. I will apply only the approved items.
```

## Rules

- **Not autopilot.** Always present findings and wait for operator approval.
- **Periodic, not per-PR.** Running retro after every PR shifts the project
  from building features to meta-improvement. Batch every 3–5 PRs.
- **Environment only.** Never propose code changes. If a finding is really a
  code defect, route it back to the issue tracker as a new issue.
- **Mechanical first.** If a finding can be enforced by a tool, propose the
  tool — don't just document it.
- **A repo with no guardrails is a finding.** Propose the minimal baseline:
  `AGENTS.md`, `CONSTRAINTS.md`, a linter, a pre-commit hook, CI.

---

<!-- local-only:retro:output-template-begin -->
The chat output template for this station is `references/english-template.md`
(default). Read it before writing your first report. If the operator explicitly
requests Hebrew output, use the Hebrew template at `references/hebrew-template.md`.
<!-- local-only:retro:output-template-end -->
