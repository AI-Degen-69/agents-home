---
name: local-agent-orchestrator
description: Orchestrate small coding tasks and issue work across agent windows. Use when a session starts, when the user asks "where were we", when the tree is dirty or a PR is open, or when deciding whether a task needs a fresh session and which harness should spend it. Reads live repo state, carries git through branch, commit, push and PR, and writes one copy-pasteable prompt for the cheapest capable model.
---

# Local Agent Orchestrator

One job: move a small task from "sitting on disk" to "merged", on the cheapest model that can do it.

Four responsibilities, in priority order:

| # | Responsibility | Rule |
| --- | --- | --- |
| 1 | Git | Branch, commit, push, PR, merge, clean up. Never leave work half-landed. |
| 2 | Session | Fresh window when scope changes. Same window when iterating one slice. |
| 3 | Quota | Spend the cheapest adequate capacity first. Guard every hard cap. |
| 4 | Routing | Match the model to the task class, from installed harnesses only. |

The four run in that order. Git safety outranks a fast answer. A model recommendation never outranks the truth on disk.

## Turn shape

1. **Read state.** Inspect before advising — see `references/repo-state-routing.md`.
2. **Decide who does the work.** Act here, or send a prompt out.
3. **Write the prompt** when you send it out.
4. **Route it** — folder, session, model.
5. **Check the return**, then do the git step.

## 1. Read state

Run the read-only checks in `references/repo-state-routing.md`, then pick exactly one row of its routing table. That row names the next action.

That file also carries the stop rules, and they are absolute:

- Dirt you cannot attribute to this task is never yours to route, stash, commit, or delete. Ask whose work it is.
- A tree that changes between your own commands has a live writer. Stop and isolate.
- Before endorsing a deletion the operator made, audit it.

Report the state with `references/report-format.md`. Keep it short.

## 2. Act here, or send a prompt out

Act directly only when all four hold:

1. Git can revert it.
2. It fits in about 15 minutes.
3. An existing command proves it works.
4. No external account, UI, approval, or payment gate.

Anything else becomes a prompt. When you act, the git step falls inside the same action — commit, push, and open the PR when the repo's rules allow it. Say in one line what changed and what proved it.

Acting directly is the shortcut for trivia. It is not the default, because the second window exists to carry clean context.

## 3. Write the prompt

No fixed shell. A human writes a different brief for a different job, and so should you. Every prompt carries four things:

- **The task.** What to build or fix, and why now. One or two lines.
- **The ground truth.** The little that stops a wrong guess: repo root, branch, the files in play, and the last verified state.
- **The git step.** What to do at the end, if anything: commit and push on this branch, open a PR, or leave the tree alone. Name the branch.
- **The report back.** What you need returned: what changed, what proved it, what stayed unknown. Ask for the exact commands and their verdict.

Vary the rest with the state.

- **Fresh window** — no shared memory, so add the stack, the build/test commands, the relevant paths, and the constraint that matters. More detail pays for itself once.
- **Same window** — the agent already holds the context. Two sentences and the delta. Repeating what it knows wastes tokens and buries the ask.

Never mention this skill, an orchestrator, a planner, a previous chat, or the routing decision inside the prompt. The executing agent reads a direct instruction from its operator, nothing else.

Length follows the task, not a template. A one-line fix gets a four-line prompt. A migration gets twenty. If you cannot say the task in two sentences, the task is not ready to send.

A fresh-window prompt reads like this, not like a form:

```text
Repo C:\...\app, branch i42/dedupe-cache. Tests in tests/cache.test.ts fail on the duplicate write.
Fix the duplicate write in src/cache.ts. Done when `npm test -- cache` passes.
Commit on this branch, push, and open a PR titled "Dedupe cache writes".
Report: files changed, test output, anything still failing.
```

## 4. Route it

Say three things, briefly.

**Where.** Root folder and branch. One line each.

**Which session.**

- Fresh: the scope changed, the context is polluted, the work touches several files, or the last two turns were a correction loop.
- Same: one slice, still hot, under a few files.
- When unsure, prefer fresh. A clean window costs less than a confused one.

**Which model.** Decide in this order:

1. Classify the work — `references/capability.md` carries the task-class matrix.
2. Take the cheapest model whose grade meets that class.
3. Confirm the model exists in `references/models.md` for a harness installed on this machine.
4. Confirm the harness has headroom, and prefer a single model over a paired mode: Antigravity's **Orchestrator** grades as the lower of its two tiers, so read its guardrail in `capability.md` first.

Never recommend a model absent from the inventory, or a harness the operator does not run. A model with no grade is `[unverified]` — probe it on low-stakes work before trusting it with a top-tier task.

## 5. Quota discipline

The point of routing is to keep the good models available for the work that needs them.

- Free and fixed-pool capacity goes first, **when it holds the required grade**: OpenCode's daily free tier, Freebuff's hour pool, Antigravity's free account. None of them reaches S or S+, so high-grade work skips this lane.
- Quota-bound subscriptions come next, cheapest tier that can pass.
- Hard caps — Inception's monthly tokens, sail's monthly credit — are one-shot budgets. Check the remainder before spending, and report what is left after.
- A top model on a routine task is a defect. Name it and reroute.
- Escalate only on evidence: a failed check, a wrong result, or a task class the cheap model cannot hold.
- When a cap runs out, say so in one line instead of silently switching.

Spend detail and the grade scale live in `references/models.md` and `references/capability.md`. The research method, when a model needs a fresh verdict, is `references/models-research-handbook.md`.

## 6. When the work comes back

Check the claims against disk before believing them. A pasted "all tests pass" is a claim, not a result.

Then one of three:

- **Clean** — do the git step: commit, push, open or update the PR. Report the branch and the next station.
- **Small miss** — typos, a missing import, a stale doc line, a failing lint. Fix it here, rerun the check, mention it.
- **Real gap** — the build failed, the scope grew, the design is wrong. Do not patch it silently. Write the next prompt with the failure as ground truth.

## Stop and ask

Ask one short question when:

- dirt has no traceable origin, or two routing rows both fit,
- the next step deletes, resets, or force-pushes,
- the operator's goal and the repo state disagree.

Otherwise keep moving and say what you did.

## Files

| File | Use |
| --- | --- |
| `references/repo-state-routing.md` | git/PR checks, stop rules, routing table |
| `references/report-format.md` | chat report shape (Hebrew: `report-format-hebrew.md`) |
| `references/models.md` | live inventory and quota table, per harness |
| `references/capability.md` | grades, task-class matrix, risk flags |
| `references/models-research-handbook.md` | how to grade a new or unverified model |
| `references/anti-patterns.md` | known routing mistakes |
| `references/deletion-audit.md` | auditing an operator cleanup |
| `scripts/models-sync.mjs` | diff live models against the inventory |
| `scripts/repo-triage.js` | collect triage facts in one pass |
| `scripts/benchlm-snapshot.mjs` | price snapshot for a model |
| `scripts/grade.js` | static audit of this skill and its evals |
