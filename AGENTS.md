# Global Agent Contract

Canonical source of truth for all agents (Freebuff, OpenCode, Gemini CLI / Antigravity, and any future harness). Keep this file short, in English, and stable. Harness config files point here; never duplicate this content elsewhere.

Source of the 6 rules: Addy Osmani, `using-agent-skills` (github.com/addyosmani/agent-skills), adopted 2026-09-22.

## What this directory is

`~/.agents` is the operator's **shared agent home** — one canonical copy of everything agents need, synced read-only into every harness (`scripts/sync-harness-skills.ps1`):

- **`skills/`** (~88 skills) — the capability library. General-purpose skills (research, debugging, TDD, review, docs) plus the numbered issue→PR delivery pipeline below.
- **`agents/`** — helper sub-agent personas (`code-explorer`, `code-reviewer`, stack-specific resolvers) that pipeline stations delegate to.
- **`docs/`** — durable knowledge: the pipeline map (`docs/issue-to-pr-skill-workflow.md`) and nothing else.
- **`scripts/`** — maintenance automation (harness sync, ECC drift check, CodeRabbit config sync).
- **`config/`** — per-harness configuration.

Skills are self-contained folders (`SKILL.md` + optional `references/`, `scripts/`, `evals/`). The global copy here is the single source of truth; harnesses hold links, never forks.

## The 6 rules (always on, for every task)

1. **Surface assumptions.** Before non-trivial work, state your assumptions and let the operator correct them. Never guess silently.
2. **Stop when confused.** Contradiction or ambiguity → stop, name it, ask. Never plow ahead on a guess.
3. **Push back when warranted.** You are not a yes-machine. Name the problem, quantify the downside, propose an alternative — then accept the operator's informed decision.
4. **Enforce simplicity.** The boring, short solution wins. 100 lines instead of 1000. If it can be simpler, make it simpler.
5. **Scope discipline.** Touch only what was asked for. Anything noticed but out of scope becomes a future Issue (NOTICED-BUT-NOT-TOUCHING) — never a silent side change.
6. **Verify, don't assume.** A task is not done without evidence: passing tests, build output, or runtime data. "Seems right" is not evidence.

## Router boundary

- **Issue work → `i-pick-issue` (Station I).** Anything that starts from (or will end as) a GitHub issue with a PR.
- **Ad-hoc → `using-agent-skills`.** Quick questions, small fixes, exploration, "where is X".
- **Ambiguous?** If it will end in a PR on code, it is Issue work. Still ambiguous? Ask one question.
- Never run two routers on the same request.

## Router Charter (session start)

One entry point per request, one handoff at most:

1. Issue work → `i-pick-issue` (Station I). It runs the state gate itself: dirty tree, unpushed commits, or an open PR → `pipeline-triage` first.
2. Ad-hoc (question, small fix, exploration) → `using-agent-skills`.
3. Brand-new idea with nothing to pick → `create-issue` (intake branch), then back to `i-pick-issue`.

`pipeline-triage` alone inspects git/PR state. Ties → the safer path.

## The delivery pipeline (one part of this directory)

The numbered skills in `skills/` form the issue→PR chain (stations I, II, III, IIIB, IV, V, VI — plus the `pipeline-triage` state gate, the `create-issue` intake branch, and the ad-hoc `present-pr` skill). The full station map lives in `docs/issue-to-pr-skill-workflow.md` in this directory. A numbered prefix means the skill is a step in the chain, invoked in order. Read it before any pipeline work.
