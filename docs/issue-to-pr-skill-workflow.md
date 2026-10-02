# Global Issue-to-PR Pipeline (Stations I–VI + system skills)

A universal, project-agnostic development pipeline deployed globally across all harnesses (Gemini CLI, Antigravity IDE, Hermes, OpenCode, Freebuff) under `~/.agents/skills/`.

**Convention:** a numbered prefix (`i-` through `vi-`) means the skill is a step in the chain, invoked in order — I → II → III → IIIB → IV → V → VI. Everything without a numeral is a **system skill**: the `pipeline-triage` state gate, the `create-issue` intake branch, and the ad-hoc `present-pr` visual presentation skill.

## Entry Point

**Session start:** one entry point for Issue work — `i-pick-issue` (Station I). It runs the state gate itself: when the tree is dirty, commits are unpushed, or a PR is open it hands off to `pipeline-triage` first. Ad-hoc requests (question, small fix, exploration) are not Issue work → `using-agent-skills`.

`pipeline-triage` — the state gate, **not a numbered station**. When the working tree has uncommitted changes, unpushed commits, or an open PR and the next step is unclear, it inspects git state (and starts a missing `coderabbit` review early so it runs in parallel) and routes to the one station that resumes or closes the work.

## Pipeline Architecture

```
[Gate]         pipeline-triage          State gate (read-only): dirty tree / unpushed commits / open PR → routes to the one station that resumes or closes the work. Not numbered.
     │
     ▼
[Station I]    i-pick-issue             Pick & Orchestrate: Discovery (lists all open issues, prioritizes by dependency order) → operator picks the issue + execution mode → drives II–VI
     │
     ├── nothing worth picking ──► [Intake] create-issue ──► publish issue + post @coderabbitai plan request (body only; skipped for trivial docs-only issues; retried once if no reply) ──► back to Discovery
     ▼
[Station II]   ii-plan-issue            Define & Plan (right-sizing, spec, constraints, reads any coderabbitai plan comment as a non-binding suggestion, records adopted/rejected facts in tasks/plan.md)
     │
     ▼
[Station III]  iii-build-plan           Build & Verify (TDD per task, atomic commits, auto-resolvers)
     │
     ├── corrections on fresh build ──► [Station IIIB] iiib-iterate-after-build
     │        (human feedback fix loop, no push)
     ▼
[Station IV]   iv-review-build-and-pr   Review & Ship (proof gate, OCR, ECC reviewers + Spec axis, 100% test gate, push, PR)
     │
     │  trigger handoff: IV posts @coderabbitai review, waits for ack,
     │  classifies (triggered / rate-limited N min / other reply / no ack),
     │  posts jump links, passes trigger status to V
     ▼
[Station V]    v-babysit-pr-and-merge   Babysit PR & Merge (consumes IV's trigger status; CodeRabbit 1-round review, reuse-first fallback on rate limit, squash merge, pull base)
     │
     ▼
[Station VI]   vi-close-pipeline        Close Pipeline (verify/close the issue, signal-based prune in any layout, investigate-before-stage, dead-code exception on the spot with zero-ref proof + tests, Clean Exit Gate: pushed / on base / spotless) — pipeline closeout
     │
     └── suggests (optional, outside pipeline) ──► present-pr   Ad-hoc visual HTML presentation; builds the story from the merged PR + conversation, runnable at any time
```

---

## The Pipeline Stations

| Step | Canonical Name | Slash Command / Trigger | Purpose |
|---|---|---|---|
| **Gate** (not numbered, runs before I) | `pipeline-triage` | `/pipeline-triage` | State gate — reads git/PR state and routes to the one station that resumes or closes the work. Not numbered. |
| **I** | `i-pick-issue` | `/i-pick-issue` (or `<id>`) | Station I (Pick & Orchestrate) — the single entry point for Issue work. **No args:** Discovery mode — lists all open issues, groups by domain, recommends the next logical issue by dependency order.<br>**With `<id>`:** drives Stations II through VI to merge and closeout. |
| **Intake** (branch off I, not numbered) | `create-issue` | `/create-issue <idea>` | Intake branch — turn a raw thought into a researched GitHub issue labeled `ready-for-agent`, then post the canonical `@coderabbitai plan` request as its own comment (prompt body only; skipped for trivial docs-only issues; retried once if no reply lands). The plan arrives while the operator is still in Station I, so it is already waiting when the work resumes. Its output re-enters Discovery. Not numbered. |
| **II** | `ii-plan-issue` | `/ii-plan-issue` (or `<id>`) | Station II (Plan): Claims issue (with `<id>` or auto-selects recommended if no arg), auto-detects tech stack and test framework, runs right-sizing, reads any `coderabbitai` plan comment as a non-binding suggestion (records what was adopted / rejected / left `[UNVERIFIED]` in `tasks/plan.md`), locks `CONSTRAINTS.md`, writes `tasks/plan.md`. |
| **III** | `iii-build-plan` | `/iii-build-plan auto` | Station III (Build): Consumes `tasks/plan.md`, implements tasks via type-aware execution (frontend-ui-engineering, TDD, debug), code simplification, and local commits. |
| **III-B** | `iiib-iterate-after-build` | `/iiib-iterate-after-build` | Station III-B (Iterate After Build): the operator reports corrections on a fresh build in free text — each item is classified, fixed by the right specialist skill, committed atomically, nothing pushed. Also entered from IV when the proof gate fails. |
| **IV** | `iv-review-build-and-pr` | `/iv-review-build-and-pr` | Station IV (Review, Verify & Ship): proof-before-review gate (browser or tests; failure → IIIB), OCR delegation scan, dynamic ECC reviewers (`.py/.ts/.tsx/.rs/.go/.sql/a11y`; React diffs get `typescript-reviewer` + `react-reviewer` together) plus the Spec axis (missing / added-not-asked / implemented-wrong), local fix commits, final verification gate, pushes branch, opens PR, posts `@coderabbitai review`, **waits for CodeRabbit's acknowledgement** and classifies it (triggered / rate-limited with reported minutes / other reply / no ack) with jump links on any non-clean ack. |
| **V** | `v-babysit-pr-and-merge` | `/v-babysit-pr-and-merge` | Station V (Babysit & Merge): **consumes Station IV's trigger-status handoff** (no re-detection), 1-round CodeRabbit review tracking (5m-4m-3m-2m-1m countdown), reuse-first fallback on rate limit (Station IV review evidence + delta check before any fresh subagent review), autonomous triage, squash merge, and fast-forwards local base branch (`master`/`main`). |
| **VI** | `vi-close-pipeline` | `/vi-close-pipeline` | Station VI (Close Pipeline): verifies/closes the issue, signal-based sweep of stale per-issue artifacts in any project layout (two-gate obsolescence test, strict knowledge preservation, investigate-before-stage), on-the-spot dead-code removal with zero-reference proof + targeted tests, and the mandatory Clean Exit Gate (pushed, on base, spotless, no leftover branches). Pipeline closeout. |
| ad-hoc (not numbered) | `present-pr` | `/present-pr <id>` (or `explain`) | Visual HTML presentation in `docs/issues/<id>-presentation-*.html` — ELI5 explanation, visual aids, manual verification guide; absorbs the former `explain` builtin. Not a station: suggested by VI, runnable any time, sources the story from the merged PR + conversation (plan/notes are a bonus, not a requirement). |

---

## Chat Reporting Contract

Concise status in every chat message, in plain everyday language; full detail lives in the GitHub issue, PR, and task files. No status-only messages without the contract fields. The contracts themselves stay in each skill's `SKILL.md` — the shape per reporter:

1. **Router (`pipeline-triage`):** repo state (branch, staged/unstaged/untracked, PR, stashes, every file and stash classified in one line) + the one routed station.
2. **Discovery (`i-pick-issue`):** open issues grouped by domain, recommended work order with rationale, the picked next issue. In orchestration mode: continuous progress across stations II through VI.
3. **Intake branch (`create-issue`):** link to the created issue, labels, and a compact list of the files checked in the preliminary research. Right after publishing, the plan request goes to CodeRabbit as an issue comment (except trivial docs-only issues) — the plan waits ready when work resumes in Station II.
4. **Station II (`ii-plan-issue`):** plain-language explanation of what was planned, the detected project language and tests, locked quality gates, and the task list from `tasks/plan.md`. An existing CodeRabbit plan comment is read as advice only (never as orders), and what was adopted or rejected is recorded briefly in `tasks/plan.md`.
5. **Station III (`iii-build-plan`):** which skills ran and what each one did, files changed/added, the issue's problem and what was done to solve it, and a recommendation to move to `/iv-review-build-and-pr`.
6. **Station IV (`iv-review-build-and-pr`):** parallel-review findings and fixes, then at the end: branch details, direct PR link, final verification (browser/code), a short summary of what was done, and a recommendation for `/v-babysit-pr-and-merge`.
7. **Station V (`v-babysit-pr-and-merge`):** CodeRabbit comments in their original style with decisions and quotes, PR link with MERGED status, summary of fixes applied, and a recommendation for `/vi-close-pipeline`.
8. **Station VI (`vi-close-pipeline`):** issue/PR status (and issue close if merged-but-open), leftovers cleaned per signal detection, dead code handled on the spot (zero-reference proof + tests), preserved knowledge assets, and a clean exit gate — synced and clean base branch, ready for the next run. No further station — end of the pipeline. Optional recommendation for `/present-pr`.
9. **`present-pr` (ad-hoc, unnumbered):** issue and PR details, a visual HTML presentation generated from the merged PR and the conversation (planning materials — bonus, not required), static verification, and browser opening.

---

## What's-changed reporting rule (all stations)

The chat reports **what changed in the product — never how it was saved.** No commit hashes, no commit counts, no clean-tree announcements, no test commands, no test counts, no skill names, no file paths with line numbers. Git and test details live in files (`tasks/plan.md`, the PR) — not in chat.

- The **branch name stays** where it identifies the work (`i<number>/<slug>` — number + title), and the return to a clean synced base gets **one line** in Station VI. Hashes and counts never appear.
- Every station reports changes **grouped by tag**, in fixed order: ➕ new → ✏️ changed → ❌ removed → 🩹 fixed (fixed = something broken now works, not a redesign). Groups with no content are omitted — never an empty group.
- Each item names the **product location** (page / tab / section), never a code path, plus what happened there. Max ~7 items; beyond that the skill groups instead of enumerating.

---

## Skill-Call Map (who calls whom)

Every external skill and reviewer persona each pipeline station invokes, read off the stations' own `SKILL.md` and `references/` files rather than a hand-maintained list. Station-to-station routing lives in the architecture diagram above; this table covers only the helper skills and personas a station delegates to. A name absent from a station's row is not invoked by that station.

**Coverage: 46 skills (10 pipeline + 33 first-order + 3 second-order) and all 17 personas.**

| Station | Invokes | When |
|---|---|---|
| **Gate** (`pipeline-triage`) | `using-agent-skills` | Ad-hoc (non-Issue) requests — route there and stop; this skill hands off at most once |
| **I** (`i-pick-issue`) | `context-engineering`, `using-agent-skills` | `context-engineering` after issue selection — locks session scope before opening files. `using-agent-skills` when the request is ad-hoc rather than Issue work |
| **Intake** (`create-issue`) | `using-agent-skills` | Hands a quick question or exploration back to the ad-hoc router instead of opening an issue |
| **II** (`ii-plan-issue`) | **Domain routing (Step 1):** Design/UI → `frontend-ui-engineering`, `frontend-design`, `tailwind-design-system`, `extract-design-system` · API/Backend → `api-and-interface-design` · Debug → `debugging-and-error-recovery`, `doubt-driven-development` · Performance → `performance-optimization` · Security → `security-and-hardening` · Docs → `documentation-and-adrs` · UX / Copy → `humanizer` · Research → `idea-refine` · Core (default) → `test-driven-development`, `incremental-implementation`<br>**Later steps:** `spec-driven-development` (Step 2 specification), `constraint-driven-development` (Step 3 quality guardrails), `planning-and-task-breakdown` (Step 6 task decomposition)<br>**Personas:** `code-explorer`, `type-design-analyzer` | Task-type classification before any plan is written; every task then carries a domain tag Station III routes on |
| **III** (`iii-build-plan`) | **Domain routing:** UI/Frontend/Design → `frontend-ui-engineering` (+ `tailwind-design-system` when tokens apply) · Code/Backend/API → `test-driven-development`, `source-driven-development`, `api-and-interface-design` · Debug/Defect → `debugging-and-error-recovery` · Performance → `performance-optimization` · Security → `security-and-hardening` · Docs → `documentation-and-adrs`<br>**Recurring:** `code-simplification` at the end of every task, `git-workflow-and-versioning` (commit discipline, feature flags, rollback), `observability-and-instrumentation` (production-facing changes)<br>**Personas:** `tdd-guide`, `build-error-resolver`, `react-build-resolver`, `go-build-resolver`, `rust-build-resolver` | Per task, by the domain tag Station II wrote. A persona absent from disk is skipped and the skip recorded — never invented |
| **IIIB** (`iiib-iterate-after-build`) | **Lane routing:** Bug/error/regression → `diagnosing-bugs`, then `debugging-and-error-recovery` · Dead button → `click-path-audit` · UI/styling/mobile → `frontend-ui-engineering` (+ `tailwind-design-system` when design tokens apply) · Performance → `performance-optimization` · Security → `security-and-hardening`<br>**Verification:** `playwright-cli`, `test-driven-development`, `verification-before-completion`<br>**Recurring:** `code-simplification` | One lane per operator-reported item; an item matching no lane is treated as a bug and one focused question is asked |
| **IV** (`iv-review-build-and-pr`) | **Proof gate:** `playwright-cli` only (no other browser tool; `browser-testing-with-devtools` for profiling only) · hard tool allowlist + 8-call cap + fail-twice-stop abort rule, since a dead browser daemon is an *unverified* gate, not a red one<br>**Quality axes:** `code-review-and-quality`, `security-and-hardening`, `test-driven-development`, `web-design-guidelines`<br>**Diff-matched specialists:** `python-reviewer`, `typescript-reviewer`, `react-reviewer`, `go-reviewer`, `rust-reviewer`, `database-reviewer`, `security-reviewer`, `silent-failure-hunter`, `doc-updater` — plus `api-and-interface-design`, `frontend-ui-engineering`, `vercel-react-best-practices`, `vercel-composition-patterns` as advisory input<br>**Gates:** `git-workflow-and-versioning` (sync & push), `verification-before-completion` | Proof-before-review first — no review runs on unproven code. Reviewer discovery is driven by `git diff --name-only`. OCR is an external delegation, not a local skill. A persona missing on disk is skipped and recorded |
| **V** (`v-babysit-pr-and-merge`) | **Skills:** none — GitHub API and CodeRabbit only<br>**Personas:** `code-reviewer`, `build-error-resolver`, `react-build-resolver`, `go-build-resolver`, `rust-build-resolver` | `code-reviewer` only on the full-fallback review path; build resolvers when CI fails on a stack |
| **VI** (`vi-close-pipeline`) | `deprecation-and-migration` | Only when dead-code removal is a large deprecation (live-API rename, consumer migration) — otherwise handled on the spot |
| **Ad-hoc** (`present-pr`) | none | Internal component kit only |

```
create-issue ──────────► using-agent-skills (ad-hoc handoff)
pipeline-triage ───────► using-agent-skills (ad-hoc handoff)
i-pick-issue ──────────► context-engineering, using-agent-skills
ii-plan-issue ─────────► frontend-ui-engineering, frontend-design,
                         tailwind-design-system, extract-design-system,
                         api-and-interface-design,
                         debugging-and-error-recovery, doubt-driven-development,
                         performance-optimization, security-and-hardening,
                         documentation-and-adrs, humanizer, idea-refine,
                         test-driven-development, incremental-implementation,
                         spec-driven-development, constraint-driven-development,
                         planning-and-task-breakdown
                         + personas code-explorer, type-design-analyzer
iii-build-plan ────────► frontend-ui-engineering, tailwind-design-system,
                         test-driven-development, source-driven-development,
                         api-and-interface-design, debugging-and-error-recovery,
                         performance-optimization, security-and-hardening,
                         documentation-and-adrs, code-simplification,
                         git-workflow-and-versioning,
                         observability-and-instrumentation
                         + personas tdd-guide, build-error-resolver,
                           react/go/rust-build-resolver
iiib-iterate-after-build► diagnosing-bugs, debugging-and-error-recovery,
                         click-path-audit, frontend-ui-engineering,
                         tailwind-design-system, performance-optimization,
                         security-and-hardening, browser-testing-with-devtools,
                         test-driven-development, verification-before-completion,
                         code-simplification
iv-review-build-and-pr ─► playwright-cli, browser-testing-with-devtools,
                         code-review-and-quality, security-and-hardening,
                         test-driven-development, web-design-guidelines,
                         git-workflow-and-versioning,
                         verification-before-completion, api-and-interface-design,
                         frontend-ui-engineering, vercel-react-best-practices,
                         vercel-composition-patterns
                         + personas typescript/react/python/go/rust-reviewer,
                           database-reviewer, security-reviewer,
                           silent-failure-hunter, doc-updater
v-babysit-pr-and-merge ─► (skills: none — gh API + CodeRabbit only)
                         + personas code-reviewer, build-error-resolver,
                           react/go/rust-build-resolver
vi-close-pipeline ─────► deprecation-and-migration (exception only)
present-pr ────────────► (none — internal component kit only)
```

### Second-order calls

Three skills are not invoked by a station directly but by a skill a station already invokes. They belong to the shipped set too — drop one and the chain breaks mid-run.

| Skill | Invoked by |
|---|---|
| `ci-cd-and-automation` | `constraint-driven-development` |
| `interview-me` | `constraint-driven-development` |
| `shipping-and-launch` | `git-workflow-and-versioning`, `observability-and-instrumentation`, `using-agent-skills` |

**Shipped set: 46 skills = 10 pipeline + 33 first-order + 3 second-order.**

---

## Artifact Homes & Governance

Three homes, three purposes — never mixed:

1. `runs/.../research-papers/` — **per-run** research papers and experiment findings.
2. `docs/issues/<id>-presentation-<slug>.html` — **per-issue** visual HTML explanation & showcase artifacts (produced by the ad-hoc `present-pr` skill; legacy names `<id>-showcase-*.html` and `<id>-explained.html` remain recognized).
3. `.freebuff/`, `%TEMP%` — **transient scratch / preview only**. Never the canonical home of anything.

---

## Global Deployment & Linking

All skills live canonically in `C:\Users\Tiger\.agents\skills\`.
The per-harness link-type matrix is the single source of truth in
`skills/README.md` — read it before linking a skill or copying one. In short:
Hermes consumes **Junctions**; Gemini CLI / Antigravity need **SymbolicLinks**
(junctions are invisible to them); OpenCode Desktop consumes **Junctions** like Hermes;
Freebuff resolves repo-local skill dirs. `scripts/sync-harness-skills.ps1` is the
one command that applies those rules.

---

## Harness Link Sync

`scripts/sync-harness-skills.ps1` re-points the harness roots at the canonical skill folders: `-Name <skill>` for one skill, `-All` for every skill, `-Check` to report without writing.

- **Hermes** (`AppData/Local/hermes/skills/`) consumes **Junctions**.
- **Gemini CLI / Antigravity** (`~/.gemini/config/skills/`) need **SymbolicLinks** - junctions are invisible to it.
- Creating a SymbolicLink needs `SeCreateSymbolicLinkPrivilege`. In a non-admin shell the script falls back to a real-directory copy, which does **not** track later edits to the canonical skill - re-run the script after editing a skill to refresh it.
- **OpenCode Desktop** (`~/.config/opencode/skills/`) consumes **Junctions** too, with no privilege needed. An entry that is any link kind pointing at canonical counts as ok (the root already holds a few SymbolicLinks); a stale real-directory copy is replaced with a Junction. ECC-pack folders that live only there have no canonical counterpart and are left alone.
