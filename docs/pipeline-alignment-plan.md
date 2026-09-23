# Pipeline Alignment Plan — Addy + Matt + ECC + gstack

> Living work plan. Items below are agreed decisions; execution happens at the end, station by station.
> Status: [ ] open, [x] done.
> **Language policy:** all files, skills, and docs are written in **English**. Only the Hebrew chat-output examples (output contracts) stay Hebrew.

## Phase 0 — Global contract (Claude-free)
- [x] Create `~/.agents/AGENTS.md` (new, English): the 6 rules from `using-agent-skills` (surface assumptions; stop when confused; push back when warranted; enforce simplicity; scope discipline incl. NOTICED-BUT-NOT-TOUCHING → future Issues; verify, don't assume) + router boundary + Router Charter (Session start) + pointer to `docs/issue-to-PR-pipeline.md` (now `docs/issue-to-pr-skill-workflow.md`) + source & date.
- [x] OpenCode: one pointer line inside the existing `~/.config/opencode/AGENTS.md`.
- [x] Gemini: create `~/.gemini/GEMINI.md` with a pointer line to the canonical contract.
- [x] Zero Claude changes (Claude is being removed from the setup).

## Phase 1 — Router boundary (1a + 1b)
- [x] 1a `i-pick-issue`: boundary note (X owns Issue work; ad-hoc → `using-agent-skills`; ambiguous → ends-in-PR? then X; still ambiguous → one question).
- [x] 1b `pipeline-triage`: Step 0 session-start classification (continuation/unclear → table; new Issue work + clean repo → Station I; ad-hoc → `using-agent-skills`) + updated description ("Use at the start of any session when intent is unclear…").
- [x] Gate line at top of Station I: dirty branch / unpushed commits / open PR → run `pipeline-triage` first; no open issues → route to triage.
- [x] Router Charter in AGENTS.md: one entry point per request, max one handoff, triage owns git/PR state, ties → the safer path.

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
- [x] Station I: update IV description (proof gate → OCR → dynamic reviewers + Spec axis → final gate); add IIIB to the orchestration chain; add I branch in Discovery; refresh `issue-to-pr-skill-workflow.md` diagram + IV row + entry-point wording.

## Phase 12 — pipeline-triage
- [x] Row 2 caveat (operator corrections on a build → IIIB).
- [x] Terminology: `tasks/plan.md` + `tasks/todo.md` instead of "TASKS dir".
- [x] Ad-hoc line: non-Issue work → `using-agent-skills`.
- [x] Register in `.skill-lock.json` as a local skill; session-start entry-point reference in `issue-to-pr-skill-workflow.md`.

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

### Wave 4 — reviewer wiring correction (2026-09-22) — done
- [x] Audit finding: wave-1 `typescript-reviewer` + `react-reviewer` were installed and registered but never invoked — a later Station IV rewrite swapped them for the generic `code-reviewer` persona plus Vercel skills, leaving the specialized personas dormant.
- [x] `code-reviewer` audited: it is NOT an ECC persona and its React/Next.js checklist duplicates `react-reviewer`'s deeper rule set (its own React section is a shallow copy). Kept as the general-quality fallback reviewer for languages without a dedicated persona; no longer the TS/JS lane owner.
- [x] Station IV Step 1B realigned to the reviewers' own scope split: pure `.ts`/`.js` diff → `typescript-reviewer` only; `.tsx`/`.jsx`/React-logic diff → `typescript-reviewer` + `react-reviewer` together (both personas must be found on disk, else honesty-rule skip recorded).
- [x] Vercel skills (`vercel-react-best-practices`, `vercel-composition-patterns`) redefined as advisory checklists feeding the `react-reviewer` axis — loaded when React is touched, not deployed as independent reviewers.
- [x] `docs/issue-to-pr-skill-workflow.md` Station IV row updated to match.
- [x] Station IV Step 5 trigger-acknowledgement wait: after posting `@coderabbitai review`, wait (~3 min max) for CodeRabbit's reply to the trigger comment — `Review triggered.` / rate-limit with reported minutes / other bot reply / no ack — and state the trigger status in the handoff report, so Station V inherits a known review state instead of discovering it during the countdown. Whenever the ack is not `Review triggered.`, the report must also include direct `html_url` links to the trigger comment and to CodeRabbit's reply comment (one-click jump for the operator).
- [x] Station V Step 1 consumes Station IV's trigger-status handoff instead of re-detecting: `review started` → straight to check-first; `rate limited (N minutes)` → no countdown for the quota window, straight to Step 2B reuse path; `other reply`/`no ack` → re-verify via the jump links, then fallback if still not triggered.
- [x] Station V Step 2B anti-duplication rule: when CodeRabbit is rate limited on a PR that came through Station IV, do NOT re-run a full persona review of already-reviewed code. Reuse Station IV's recorded review findings as evidence, run only a lightweight delta check (diff unchanged since the gate + targeted tests + cover honesty-rule skips), and carry the status honestly. Full subagent fallback reserved for PRs opened outside the pipeline or with new commits after Station IV's gate.

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

### Station numbering restructure (2026-09-23) — done
- [x] `x-workflow-issue` → `i-pick-issue`: Station I is now the single entry point for Issue work (Discovery → operator picks the issue → execution-mode gate → drives II–VII).
- [x] `i-create-issue` → `create-issue`: removed from the numbering. It is the intake branch, invoked from Station I when the backlog has nothing worth picking; its output re-enters Discovery.
- [x] `pipeline-triage` stays unnumbered: it is the state gate that runs *before* Station I, not a station in the chain.
- [x] Convention locked in `AGENTS.md`, `skills/README.md` and `docs/issue-to-pr-skill-workflow.md`: a numbered prefix (`i-` through `vii-`) = a step in the chain, invoked in order; everything else = system skill.
- [x] Stations II–VII kept their numbers, so no other skill folder moved.
- [x] `AGENTS.md` Router Charter rewritten: three sibling routers → one entry point that calls `pipeline-triage` when the tree is dirty, commits are unpushed, or a PR is open.
- [x] Landed the in-flight VI/VII ordering fix (`vi-present-pr` before `vii-prune-artifacts`) and replaced the two dead `.skill-lock.json` keys (`vi-prune-artifacts`, `vii-present-pr`) with the real folders.
- [x] Station-count wording unified to 7-station pipeline (I–VII) (was a mix of 7-station / 8-station / of VII).
- [x] Fixed 10 stale `vii-present-pr` / `vi-prune-artifacts` references across 7 eval/reference files.
- [x] Harness roots re-pointed (Hermes Junction; Gemini CLI / Antigravity real-directory copy — no symlink privilege on this machine) and `scripts/sync-harness-skills.ps1` added to refresh copies.
- [x] Validated: `node skills/skill-workbench/scripts/validate.js --all` → 86 skills, 0 fail, 0 warn (includes `phantom-skill-refs`).

### Pipeline consistency sweep (2026-09-23) — done
Goal: one naming truth across docs, skills, scripts and configs after the restructure above — no live reference to a folder that no longer exists, and no ambiguous ordering.
- [x] Killed the last **live** stale references: `.gitignore` pointed at the deleted `docs/issue-to-PR-pipeline.md`; `skill-workbench/scripts/validate-lib.js` named `vii-present-pr` in a vocabulary comment.
- [x] Ordered both station tables (`docs/issue-to-pr-skill-workflow.md`, `skills/README.md`) as Gate → I → Intake → II…VII. The Intake row used to sit between the Gate and Station I, contradicting the architecture diagram, which hangs it off Station I.
- [x] Chat Output Contract now covers the `pipeline-triage` gate, and its intro no longer says "every station" — that wording silently excluded the gate and the intake branch. Items renumbered 1–9 (Gate, I, Intake, II…VII).
- [x] Deployment docs de-duplicated: the pipeline doc no longer repeats a Hermes+Gemini-only subset of the link-type matrix; it points at `skills/README.md` as the single source of truth.
- [x] `skills/README.md` deploy section now uses `scripts/sync-harness-skills.ps1` instead of the hand-written Junction/SymbolicLink pair, and records the no-privilege copy fallback.
- [x] **Rule — frozen fixtures:** `**/evals/snapshots/**` are immutable version fixtures. They keep the names that existed when they were frozen, are never edited to match a rename, and are not live references. Live docs, skills, scripts and configs must never name a folder that does not exist; history may, provided the rename is recorded in the log above.
- [x] Evidence at close: `validate.js --all` → **86 skills, 0 fail, 0 warn** (includes `phantom-skill-refs`); zero stale folder names left in any live file. `sync-harness-skills.ps1 -All -Check` → **10/10** pipeline skills are Junctions in Hermes; in Gemini 6 are SymbolicLinks and 4 (`i-pick-issue`, `create-issue`, `vi-present-pr`, `vii-prune-artifacts`) are real-directory copies because this shell has no `SeCreateSymbolicLinkPrivilege` — verified byte-identical to canonical, and they must be refreshed with the script after any edit to those skills.
- [x] Fixed one Hermes entry the checker could never verify: `cua-driver` was a junction whose Target PowerShell could not read, so `-Check` always flagged it as "needs link"; re-pointed at the canonical folder (it resolved before this change and resolves now).
- [x] Noted, deliberately not changed: 32 skills in this root were never linked into Hermes at all (third-party packs — vercel, opencli, ECC, pdf…), and `cleanup-user-home` / `skill-creator` / `click-path-audit` sit there as real directories rather than junctions. `sync-harness-skills.ps1 -All` (without `-Check`) links all of them; left alone here because the pipeline never touches them.
