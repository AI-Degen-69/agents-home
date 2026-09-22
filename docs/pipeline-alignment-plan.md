# Pipeline Alignment Plan — Addy + Matt + ECC + gstack

> Living work plan. Items below are agreed decisions; execution happens at the end, station by station.
> Status: [ ] open, [x] done.
> **Language policy:** all files, skills, and docs are written in **English**. Only the Hebrew chat-output examples (output contracts) stay Hebrew.

## Phase 0 — Global contract (Claude-free)
- [x] Create `~/.agents/AGENTS.md` (new, English): the 6 rules from `using-agent-skills` (surface assumptions; stop when confused; push back when warranted; enforce simplicity; scope discipline incl. NOTICED-BUT-NOT-TOUCHING → future Issues; verify, don't assume) + router boundary + Router Charter (Session start) + pointer to `docs/issue-to-PR-pipeline.md` + source & date.
- [x] OpenCode: one pointer line inside the existing `~/.config/opencode/AGENTS.md`.
- [x] Gemini: create `~/.gemini/GEMINI.md` with a pointer line to the canonical contract.
- [x] Zero Claude changes (Claude is being removed from the setup).

## Phase 1 — Router boundary (1a + 1b)
- [x] 1a `x-workflow-issue`: boundary note (X owns Issue work; ad-hoc → `using-agent-skills`; ambiguous → ends-in-PR? then X; still ambiguous → one question).
- [x] 1b `pipeline-triage`: Step 0 session-start classification (continuation/unclear → table; new Issue work + clean repo → X; ad-hoc → `using-agent-skills`) + updated description ("Use at the start of any session when intent is unclear…").
- [x] Gate line at top of X: dirty branch / unpushed commits / open PR → run `pipeline-triage` first; no open issues → route to triage.
- [x] Router Charter in AGENTS.md: one question per router, one owner per request, max one handoff, triage owns git/PR state, ties → safer router.

## Phase 2 — Station I
- [x] Publish immediately (verify already implemented), Open questions section (what + why it matters + default) with needs-answers label for anything unresolved — never block publishing on open questions; II gains Step 0A.

## Phase 3 — Station II
- [x] Adopt from Addy: explicit dependency graph, XS–XL sizing, checkpoints every 2–3 tasks, never-overwrite-plan rule, tasks mapped to sub-issues with blocked-by.
- [x] Keep: right-sizing, CONSTRAINTS.md, Hebrew report contract, Step 0A, one evidence-based improvement proposal (verbatim quote; scope expansion = explicit opt-in; rejection recorded with reason).

## Phase 4 — Station III
- [x] Adopt from Addy: Rule 0 simplicity question before every task, NOTICED-BUT-NOT-TOUCHING capture, feature flags/safe defaults/rollback guidance, risk-first ordering, `git-workflow-and-versioning` for commit discipline.
- [x] Multi-tag rule: prefer splitting; remaining dual-tag task → primary specialist drives, secondary advises, risk-first; multi-tag line in `references/routing.md`.
- [x] Observability line: production-behavior task → instrumentation note from `observability-and-instrumentation`.
- [x] Keep: domain routing, Mode B, Hebrew report, 2 paths. (Evals parked until a real need.)

## Phase 5 — Station IIIB
- [x] Unchanged as a station (no separate /test station).
- [x] `browser-testing-with-devtools` named in verification routing for browser checks.
- [x] Regression test at the seam that reproduces the bug (Matt); no correct seam = architectural finding.
- [x] Track in `.skill-lock.json`: `diagnosing-bugs`, `click-path-audit`, `verification-before-completion`.

## Phase 6 — Station IV
- [x] Step 0 proof-before-review gate (live browser / targeted tests); failure → back to IIIB. Final post-fixes gate stays.
- [x] Step 1C Spec axis (Matt): diff vs issue + `tasks/plan.md` — missing / added-not-asked / implemented-wrong.
- [x] Citing gate (gstack): finding without verbatim quoted line → appendix only.
- [x] Approval standard (Addy): approve what improves; don't block on taste.
- [x] Install 8 ECC agents (wave 1) → `~/.agents/agents/`: code-reviewer, python-reviewer, go-reviewer, rust-reviewer, database-reviewer, security-reviewer, typescript-reviewer, react-reviewer (verified dependency-free persona files).
- [x] Honesty rule: reviewer not found on disk → skip and report, never invent; dependency scan on any future ECC install.
- [x] Ops: track vercel-react-best-practices, vercel-composition-patterns, web-design-guidelines in `.skill-lock.json`; fix the `open-code-review-delegate` reference.

## Phase 7 — Stations V, VI, VII, X
- [x] V, VII: unchanged.
- [x] VI: pointer line — post-merge dead code → `deprecation-and-migration`.
- [x] X: update IV description (proof gate → OCR → dynamic reviewers + Spec axis → final gate); add IIIB to the orchestration chain; add I branch in Discovery; refresh `issue-to-PR-pipeline.md` diagram + IV row + entry-point wording.

## Phase 12 — pipeline-triage
- [x] Row 2 caveat (operator corrections on a build → IIIB).
- [x] Terminology: `tasks/plan.md` + `tasks/todo.md` instead of "TASKS dir".
- [x] Ad-hoc line: non-Issue work → `using-agent-skills`.
- [x] Register in `.skill-lock.json` as a local skill; session-start entry-point reference in `issue-to-PR-pipeline.md`.

## Phase 11 — Validation & rollout
- [x] Validate every touched skill (X, I, II, III + routing.md, IIIB, IV, VI, pipeline-triage) + new files (AGENTS.md, GEMINI.md, 8 agents).
- [x] Mark plan complete + final Hebrew report.

## Added later

### Wave 2 ECC agents (2026-09-22) — done
- [x] Installed `silent-failure-hunter` → `~/.agents/agents/` (verified byte-identical to source; zero runtime dependencies). Wired into IV Step 1B as item 4, diff-triggered (catch/except, fallbacks, async, logging).
- [x] Absorbed `pr-test-analyzer` — NOT installed; its two unique ideas (changed-behavior → test mapping; gap rating critical/important/nice-to-have) folded into IV's Test Engineering Audit. Installing the persona would duplicate the existing axis.
- [x] Deferred `spec-miner` — NOT a Spec-axis candidate (correction of an earlier note: it is an OpenSpec brownfield documentation agent, unrelated to Matt's diff-vs-issue review axis). Future trigger: adopting OpenSpec, or a legacy refactor needing a behavioral baseline before Station II.
- [x] Deferred `a11y-architect` — a build agent, not a reviewer; IV already deploys `web-design-guidelines` + `frontend-ui-engineering` for WCAG/ARIA. Future trigger: a client project with ongoing accessibility-compliance requirements → install as a III build specialist, not an IV reviewer.
- [x] Registered all 9 ECC agents in `.skill-lock.json` (`kind: ecc-agent`, source affaan-m/ECC) — closing a gap: wave-1 agents were installed on disk earlier but never registered.

### Wave 3 ECC agents + pipeline wiring (2026-09-22) — done
Full scan of ECC `main` (bf70150): all 68 agents read in full + 292 skill descriptions reviewed; 9 installed, the rest absorbed or deferred with recorded reasons.
- [x] Dependency scan on all 9 wave-3 agents (no MCP, no API keys, no runtime service deps; only work-time `npx` CLI usage) — honesty rule upheld.
- [x] Installed 9 agents → `~/.agents/agents/`: `build-error-resolver`, `react-build-resolver`, `go-build-resolver`, `rust-build-resolver`, `tdd-guide`, `refactor-cleaner`, `type-design-analyzer`, `code-explorer`, `doc-updater` (byte-identical verified against source).
- [x] Registered all 9 in `.skill-lock.json` (`kind: ecc-agent`).
- [x] Wiring: II Step 0A (`code-explorer` for large/legacy) + II Step 4 (`type-design-analyzer`); III Phase 1 (`tdd-guide`) + III Phase 2 (build-resolver family); IV Step 1B (`doc-updater`, diff-triggered); V Step 5 CI-failure triage (resolver family); VI Pattern 6 (`refactor-cleaner`).
- [x] Honesty rule kept at every wiring point: persona not found on disk → skip and record, never invent (אין להמציא).
- [x] Deferred agents (with future triggers): 14 additional language/framework reviewers (java/kotlin/csharp/swift/php/vue/django/fastapi/flutter/healthcare/rag/mle/cpp/fsharp) → on-demand install when such a project enters the pipeline; GAN harness trio (`gan-planner/generator/evaluator`) → different build paradigm; `agent-evaluator` + `harness-optimizer` → meta-tools for future pipeline self-evaluation; `docs-lookup` → MCP-dependent (failed dependency scan); non-pipeline agents (chief-of-staff, marketing-agent, seo-specialist, opensource trio, homelab/network trio) → outside issue-to-PR scope.
- [x] ECC skills reviewed, not installed: `delivery-gate` (IV enforcement hook — revisit if verification-gate bypass shows up), `verification-loop` (IIIB final verify — revisit), `production-audit` (post-merge readiness — revisit), `browser-qa` (overlaps `browser-testing-with-devtools`), `windows-desktop-e2e` (trigger: a Windows desktop project).
- [x] Wave-3 e2e validation (sandbox, 2026-09-22): Stations II–V executed in a temp repo — mid-III build break resolved by generic `build-error-resolver` (stack persona absent → honesty skip recorded; zero net diff, gate green), IV `doc-updater` caught README/code signature drift (1-line fix), V resolver CI-triage restored a pushed parse break (1-char fix, one commit, CI green 3/3).  Sandbox build-failure log (preserved from the deleted sandbox): parse error at `src/calc.js:10` mid-III; stack Node.js — no dedicated `node-build-resolver` exists; honesty rule: stack persona not found on disk → skip recorded; generic `build-error-resolver` deployed from `~/.agents/agents/` (byte-verified install); minimal-diff fix (1 line restored to committed state), gate green, 3/3 tests pass, zero net diff vs HEAD.
