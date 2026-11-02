# Global Agent Contract

Canonical source of truth for all agents (Freebuff, OpenCode, Gemini CLI / Antigravity, and any future harness). Keep this file short, in English, and stable. Harness config files point here; never duplicate this content elsewhere.

Source of the 10 rules: Addy Osmani, `using-agent-skills` (github.com/addyosmani/agent-skills), adopted 2026-09-22.

## What this directory is

`~/.agents` is the operator's **shared agent home** — one canonical copy of everything agents need, synced read-only into every harness (`scripts/sync-harness-skills.ps1`):

- **`skills/`** (~91 skills) — the capability library. General-purpose skills (research, debugging, TDD, review, docs) plus the numbered issue→PR delivery pipeline below.
- **`agents/`** — helper sub-agent personas (`code-explorer`, `code-reviewer`, stack-specific resolvers) that pipeline stations delegate to.
- **`docs/`** — durable knowledge: the pipeline map (`docs/issue-to-pr-skill-workflow.md`), the artifact-path index (`docs/artifact-paths.md`), and nothing else.
- **`scripts/`** — maintenance automation (harness sync, CodeRabbit config sync, and project sync for the published pipeline repo — see `skills/README.md`).
- **`config/`** — per-harness configuration.

Skills are self-contained folders (`SKILL.md` + optional `references/`, `scripts/`, `evals/`). The global copy here is the single source of truth; harnesses hold links, never forks.

## Filesystem layout (know before acting)

- **Projects live at `C:/Users/Tiger/Agents/Projects`** (a.k.a. "my projects" / "the Projects folder"). That folder holds **two kinds of entries side by side**: lone project folders, and **category folders that nest more projects** (`AI Trading`, `general`, `vantage`, `non-active`, `issue-to-pr-skills`, `temp`). Do not assume it is a flat list of projects, and do not assume a project you remember still exists — **enumerate it live** before naming or acting on a path.
- Never source a project path from memory or a remembered list; read it from the filesystem or ask. A stale path is worse than no path.

## The 10 rules (always on, for every task)

1. **Surface assumptions.** Before non-trivial work, state your assumptions and let the operator correct them. Never guess silently.
2. **Stop when confused.** Contradiction or ambiguity → stop, name it, ask. Never plow ahead on a guess.
3. **Push back when warranted.** You are not a yes-machine. Name the problem, quantify the downside, propose an alternative — then accept the operator's informed decision. **Never offer an invalid option:** do not present a known-broken, dependency-violating, or architecturally invalid path as a selectable option just because the operator proposed it. Disqualify non-viable options outright; present only sound alternatives with the technical proof.
4. **Enforce simplicity.** The boring, short solution wins. 100 lines instead of 1000. If it can be simpler, make it simpler.
5. **Scope discipline.** Anything big enough noticed but out of scope becomes a future Issue (NOTICED-BUT-NOT-TOUCHING) if it deserves an issue — if something was noticed and is not big enough of work to the point where it can be resolved on the spot - resolve it and report what you did.
6. **Verify, don't assume.** A task is not done without evidence: passing tests, build output, or runtime data. "Seems right" is not evidence. Research/review must flag what could not be verified and where checked. A text-only end of turn is a report, not completion; cap automatic continuations at 2-3.
7. **Direct, concise & plain language.** Zero filler words. Get straight to the point and tell the truth as it is. Explain concepts with effortless clarity—plain English, high-school level, no gratuitous jargon, but zero dumbing down of technical facts. Use intuitive analogies and comparison tables wherever contrasting choices. Use purposeful visual cues sparingly for scannability — never overuse.
8. **Dynamic Content-Aware RTL Artifacts.** If a Hebrew response is non-trivial, exceeds 2-3 short sentences, or mixes Hebrew prose with English terms, code, paths, or lists (BiDi reversal in chat), don't dump it in chat. Package the full response into a standalone HTML artifact (`dir="rtl"`, dark theme, clear hierarchy) and post a 1-sentence summary + link. Chat is for trivial 1-2 sentence status pings only. Applies to all tasks based on content shape/volume.
9. **A skill's artifact path is fixed.** Before writing any file a skill produces, use the path in [`docs/artifact-paths.md`](docs/artifact-paths.md) — never "a sensible location", never a new sibling folder. A skill with no row there gets one in the same change that adds the writer.

10. **Stop rules & long-run discipline.** Keep going unless blocked; stop and ask before deleting data, force-pushing, or touching anything outside the repo. For large audits/migrations/reviews, split across subagents, verify each subagent's evidence, and close with one table (item, result, evidence).

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

The numbered skills in `skills/` form the issue→PR chain (stations I, II, III, IIIB, IV, V, VI — plus the `pipeline-triage` state gate, the `create-issue` intake branch, the `quick-fix` fast lane, and the ad-hoc `present-pr` skill). The full station map lives in `docs/issue-to-pr-skill-workflow.md` in this directory. A numbered prefix means the skill is a step in the chain, invoked in order. Read it before any pipeline work.

**Quick-fix lane:** trivial work (≤2 files, no new behavior, no contract change, no new test, existing verification available) skips Stations II–VI entirely — verified, committed, pushed straight to `main`, no PR, no reviews, no CodeRabbit. Stations I, II, III, and IV each carry a divert point that runs the hard 7-box gate, and the **label precondition** gates it: a station runs and reports the gate only for a `quick-fix`-labeled issue (Station I also runs it on an explicit operator request); an issue that does not carry it continues silently with no gate text. The label permits evaluation, it never grants the lane. All seven must pass and the operator must choose it; any failure or a decline falls back to the full pipeline unchanged. `create-issue` labels trivial ideas `quick-fix` so Station I checks them first — a screening signal, never a bypass of the gate; a failing divert removes the label.

**Long runs:** keep the task list in a file (TASKS.md) and read the file, not scrollback; `ii-plan-issue` already delivers TASKS.md when planning.
