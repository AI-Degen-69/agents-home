---
name: iv-review-build-and-pr
description: Station IV (Review, Verify & Ship) — Universal shipping flow. Runs OCR delegation (deterministic file scope + rules, host-agent review, no LLM key), then stack-matched language/framework reviewers, applies fixes, executes the post-review Browser Gate (UI, fast-first, playwright-cli only — see Step 0.1 tool allowlist; DevTools MCP for profiling only) or targeted test gate (backend), pushes branch, and opens GitHub PR with @coderabbitai summary.
---

# Station IV: Review, Verify & PR (`iv-review-build-and-pr`)

This skill implements **Station IV (Review, Verify & Ship)** of the 6-station pipeline (I–VI). It works across **any project, language, or repository**, taking code completed in Station III (`iii-build-plan`), dynamically discovering and deploying language/framework specialist reviewers, applying fixes, enforcing the **Final Pre-Push Verification Gate** (live browser verification for UI or full regression test suite for backend), pushing to origin, opening a Pull Request linked to the issue, and recommending `v-babysit-pr-and-merge`.

## Pipeline Position

- **Station:** Station IV of VI
- **Previous Station:** `iii-build-plan` (Build)
- **Next Station:** `quick-fix` (only on a Step 0.2 divert — which itself requires a `quick-fix`-labeled issue, the gate passing, and the operator's choice) or `v-babysit-pr-and-merge` (Babysit & Merge)

---

## 1. Invocation

```bash
/iv-review-build-and-pr    # Runs multi-axis review, fix application, final verification, push, and PR opening
```

---

## 2. Protocol Under the Hood

### Step 0: Proof-Before-Review Gate (MANDATORY, FIRST)

**No review runs on unproven code.** Before Step 1, prove the build actually works. This station is the **single owner of browser-based verification** in the whole pipeline — no other station runs browser checks. This ownership applies whenever any UI change ships, regardless of which station built it.

**Scope — pipeline only.** The Step 0 and Step 3 gates run solely inside an explicit Station IV invocation (`/iv-review-build-and-pr`) on a feature branch headed for a PR. They are never run during interactive chat turns, prototyping, or quick-build iterations, and never over an explicit opt-out ("just build", "no browser check", "don't stall on browsing" — skip the browser entirely and say so in the report). No other station, and no ordinary turn, launches browser sessions on this skill's authority.

1. **For Frontend / Web / UI changes — Browser Gate (fast-first, `playwright-cli` only):** start the project's preview server, then verify in this order with the **`playwright-cli`** skill (headless by default, compact snapshots, no MCP round-trips). Reach for `browser-testing-with-devtools` (chrome-devtools-mcp) **only** when the gate needs performance traces or profiling — never for routine render/DOM checks:
   - **API/HTTP smoke (no browser):** every key page and endpoint the change touches answers 200 with sane content (`curl` or equivalent). For a diff touching a served static asset (a JS label, a CSS token), curl the asset path itself and grep the served bytes for the new string and the absence of the old — that proves the file ships without a browser.
   - **Discover the dev-server port from the app's Vite/server config before starting it** — do not assume `5173`. A `vite.config.*` with an explicit `server.port` (e.g. `8080`) overrides the default; probing the default port first burns the wall-clock budget on a `curl 000`. Grep the config for `port`/`host` and health-check the real port. Boot the server as a background process, then poll it (bounded loop of `curl` with short sleeps) until `200` before any browser call — never a blind `sleep`.
   - **To exercise a locale/direction toggle, set the app's persisted language key via storage, then reload** — do not click through the language switcher. Find the `localStorage` key (grep the i18n provider for the `STORAGE_KEY`/`setItem`), `playwright-cli localstorage-set <key> he`, `goto` the URL again, then verify. One reloaded `eval` then asserts the flip (e.g. gradient `to left`, `dir=rtl`) — text/element checks per page. Deep-dive recipe and failure modes: `references/dom-gate-introspection.md`.
   - **Filter console/network noise before judging errors.** Dev servers attach external services (HMR/live-reload on another port, React DevTools hints, framework future-flag warnings) that are unrelated to the change. Grep the `playwright-cli console`/`requests` output for app-level failures and drop known non-app lines (connection-refused to the live-reload port, dev warnings); a red count driven only by those is not a product failure. Also dismiss a route's own `404` console entry when it comes from probing a wrong path — fix the path, don't count it as a defect.
   - **Programmatic DOM checks — one batched call (no screenshot):** `playwright-cli open <url>`, then a single `playwright-cli eval "<one function>"` that performs all DOM/layout checks and returns one small JSON verdict (required elements exist, table rows/columns render, layout has no overflow). Never one call per check.
   - **Console + network — one call each:** `playwright-cli console` → zero uncaught errors; `playwright-cli requests` → zero failed network requests (pull both once after the page settles — do not eyeball a screenshot for this).
   - **Screenshot — once, last:** a single `playwright-cli screenshot` as final visual proof, only after everything above is green, then `playwright-cli close`. Never per-iteration.
2. **For Backend / Logic changes:** run the targeted test suites for modified files — all green. **Deletion carve-out:** when the diff deletes a module or symbol, run the full suite locally once before this gate passes — importers of a deleted symbol sit in files the diff never touched, and a multi-name import line (`from pkg import a, b, deleted`) is invisible to a narrow `from pkg import deleted` grep, so the CI shard you did not run locally catches exactly that. (The per-task full-suite ban stays; this is one pre-push run, not a per-task sweep.)
3. **On failure:** stop. Route the failure list to `iiib-iterate-after-build` as correction items, and re-enter this station only after IIIB is clean. Do not review broken code.
4. **On success:** record one gate line for the report (what was run, what passed), then continue to Step 1.

**Pitfall — Red‑by‑design guard tests:** Some tests (e.g., a scanner that fails when forbidden patterns appear outside a canonical module) are intended to fail until later work moves the consumers. Treat a failure that matches the documented expected red list as *proved* (not a regression). Do not route it to `iiib-iterate-after-build`. Instead, record the red list as proof that the guard works and continue to Step 1.

#### Step 0.1: Tool allowlist, attempt budget, and abort rule (MANDATORY)

**Allowed tools for this gate — nothing else:**

| Need                                  | Tool                                                  | Allowed         |
| ------------------------------------- | ----------------------------------------------------- | --------------- |
| API/HTTP smoke                        | `curl` (or `Invoke-WebRequest`)                       | yes             |
| DOM / render / console / network      | **`playwright-cli`**                                  | yes             |
| Perf traces / profiling               | `browser-testing-with-devtools` (chrome-devtools-mcp) | only for traces |
| **Any other browser CLI or MCP tool** | —                                                     | **NO**          |

Only the tools listed above may run in this gate. No other browser automation tool is permitted, and none is a substitute for a failing one. Daemon-backed browser CLIs in particular retry internally several times per call before surfacing a failure, so a single dead session silently burns dozens of attempts — that is why the gate is pinned to a daemon-free tool and a hard call cap.

**Fast-path target — aim for 3 calls plus one optional screenshot when checks can be batched. This is not the whole-gate limit. Count every gate call, including `open`, `eval`, `console`, `requests`, `screenshot`, and `close`, toward the hard cap of 8.**

**Abort rule — mandatory, no exceptions:**

- **A tool fails twice → stop using that tool.** Do not retry it a third time, and do not substitute a different browser tool. Record the failure and move to the next gate item.
- **The whole gate is capped at 8 tool calls.** At the cap, stop and report.
- **A dead browser session is not a product failure.** If the tooling cannot verify (daemon down, port taken, server not up), that is an *unverified* gate, **not** a red gate. Do **not** route it to `iiib-iterate-after-build` as a correction item — there is no defect to fix, and sending one wastes a full fix loop.
- **Unverified is an allowed outcome, and the honest one.** A gate that reports "curl smoke green (3/3), DOM check unverified — playwright session failed to launch" passes this station. Fabricating a pass, or looping on broken tooling to manufacture one, does not.
- **An unverified gate is a PR-body disclosure, never a silent omission.** When any gate item ends `unverified`, the Step 5 PR body MUST carry a `## Verification` section naming exactly what was proven, what was not, and the tooling reason. A reviewer reading only the PR must never read an unverified gate as a passed one. Omitting the section is as dishonest as fabricating the pass — and it blocks the station just as hard.
- **Wall-clock budget — 5 minutes, then move on.** The gate has 5 minutes from the first browser call (preview-server boot excluded, capped at 120s). A single tool call gets 90s before it is abandoned and counted as a failure. Under 60s remaining → no new checks, go straight to reporting. On expiry, stop all browser calls at once: unrun items are `unverified` ("time-box expired") and disclosed in the PR body's `## Verification` section. Expiry is never a product failure and never routes to `iiib-iterate-after-build`.
- **Never open a browser at all** when `curl` already proves the change. If the smoke check is green and the change has no visual/interactive surface, that *is* the gate — skip the browser.

#### Step 0.2: Quick-Fix Lane Divert (after the proof gate, before any review work)

Last chance to skip the review machinery, and the most valuable one — Steps 1 and 1B (OCR plus every reviewer) plus the CodeRabbit round are the bulk of the cost. Step 0 has already proved the build works, so the gate below runs against known-good code.

**The label precondition comes first.** Read the current labels of the linked issue
(`gh issue view <number> --json labels`). If no issue is linked, or the issue lacks the `quick-fix` label,
skip the gate entirely — continue into Step 1 normally, with no gate text and no lane offer.

Read `git diff --name-only origin/<base>...HEAD`. If the **entire** change passes the **7-box gate** in `quick-fix`, offer the operator the lane in one line (push straight to `main`, no PR, no reviewers, no CodeRabbit). **Yes** → hand off to `quick-fix`, passing your 7-box verdict with the handoff so the lane re-checks only size and its own diff instead of re-reading the issue; **no, or any box fails** → continue into Step 1 normally, and remove the label (`gh issue edit <number> --remove-label "quick-fix"`) — this diff has already disproved the lane.

One mechanical difference from the earlier divert points: the work is already committed on a feature branch, while `quick-fix` works on the base branch. Before handing off, return to base carrying the change:

```bash
git switch <base> && git merge --squash <feature-branch>
```

That leaves the work staged and uncommitted on `main` — one of the two tree states `quick-fix`
accepts (the other being a clean tree), and the one its step 2 names explicitly. Do not create a PR
as a substitute when the lane is declined; declining means the full pipeline runs as written.

### Step 1: OCR Delegation Review (MANDATORY, FIRST — embedded procedure)

Use OCR only for fixed work (file pick + rules). The thinking stays with you. No LLM key needed on OCR side. Source: `https://github.com/alibaba/open-code-review` (Apache-2.0), which publishes an equivalent upstream skill (`skills/open-code-review-delegate`) that this step embeds rather than depends on — no external skill file is required, and nothing breaks if the upstream skill is not installed. The full delegation procedure (preview, rules, diffs, per-file review, finding shape, coverage counts) lives in `references/ocr-delegation.md` — follow it exactly.

**Prerequisite:** the `ocr` CLI must be on PATH — `ocr --version`. If missing: `npm install -g @alibaba-group/open-code-review`, then retry once. `--format json` requires v1.9.0+ (verified locally: v1.12.10).

### Step 1B: Dynamic Reviewer Discovery & Multi-Axis Review (uses OCR output as input)

Feed the OCR file list + Rule Groups + OCR finds into each reviewer below (no file left out, line numbers from OCR win on conflicts). Inspect the diff (`git diff --name-only origin/<base>...HEAD`) and discover matching specialized reviewers from the project's agent repository (`.agents/agents/`, `~/.agents/agents/`, or builtins):

**Reviewer honesty rule:** a reviewer persona that is not found on disk is skipped — record the skip and the reason in the report. Never invent or simulate a missing reviewer (do not invent).

1. **General Code Quality (`code-review-and-quality`):**
   - Check diff clarity, clean naming, absence of dead code, and adherence to project patterns.
   - **Mechanical dead-import scan without a linter:** when no linter is installed, a stdlib AST pass (collect `Import`/`ImportFrom` names; collect `Name` nodes plus attribute roots; diff) finds unused imports in the touched files. It false-positives on string annotations (`"SellFlow"` inside `Optional[...]`) and misses function-local imports inside `try` blocks — verify each hit against real usage, and check whether it exists on `origin/<base>` before calling it this diff's finding; a pre-existing wart is not a regression.
2. **Security & Hardening (`security-and-hardening` / `security-reviewer`):**
   - Audit all new inputs, secrets, session boundaries, and dependency vulnerabilities.
3. **Dynamic Language & Framework Specialists (Auto-Detected from Diff):**
   - **Python files modified (.py):** Deploy `python-reviewer` (asyncio patterns, type hinting, PEP 8, memory leaks). If FastAPI/Django endpoints touched: also apply `api-and-interface-design` (REST contracts, endpoint boundaries).
   - **TypeScript / JavaScript files modified (.ts, .js — no React):** Deploy `typescript-reviewer` (type safety, async correctness, Node/web security, idiomatic patterns).
   - **React files modified (.tsx, .jsx, or React component logic):** Deploy BOTH `typescript-reviewer` AND `react-reviewer` per their scope split (typescript-reviewer owns generic TS/async/Node lanes; react-reviewer owns hooks, a11y, RSC boundaries, render performance, React security). Load `vercel-react-best-practices` (component/data-fetching guidance) and `vercel-composition-patterns` (component architecture) as advisory checklists feeding the react-reviewer axis — not as separate reviewers.
   - **Vue touched:** add `frontend-ui-engineering` (components, state, layout review).
   - **Rust files modified (.rs):** Deploy `rust-reviewer` (lifetimes, unsafe blocks, concurrency, borrowing).
   - **Go files modified (.go):** Deploy `go-reviewer` (goroutines, error handling, interface boundaries).
   - **Database / Schema files touched (.sql, ORM models):** Deploy `database-reviewer` (N+1 queries, indexes, migrations).
   - **CSS / UI Components touched:** Deploy `web-design-guidelines` (accessibility, ARIA roles, contrast) with `frontend-ui-engineering` (WCAG requirements, responsive layout).
4. **Silent Failure Hunt (`silent-failure-hunter`, diff-triggered):**
   - Deploy whenever the diff touches catch/except blocks, fallback defaults, async paths, or logging. Hunt swallowed errors, empty catch blocks, dangerous fallbacks (`.catch(() => [])`), lost stack traces, and missing error propagation.
5. **Test Engineering Audit (`test-driven-development`):**
   - Verify that test assertions test real domain behavior and edge cases, not hollow mocks.
   - Map each changed behavior to the test that covers it; rate uncovered paths by impact (critical / important / nice-to-have).
6. **Docs Drift (`doc-updater`, diff-triggered):**
   - Deploy when the diff touches `*.md` files, docstrings, or README/docs adjacent to changed behavior. Verify that documentation touched by the diff still matches the code — no stale examples, no outdated API references. Persona from `~/.agents/agents/`; not found on disk → skip and record the skip (do not invent).

### Step 1C: Spec Axis — Diff vs Issue & Plan (from Matt Pocock's two-axis review)

Before applying fixes, run the Spec axis in full:

1. Load the linked GitHub issue (`gh issue view <n> --comments`) and the plan (`tasks/plan.md`).
2. Compare the diff against them and report, with the spec line quoted for every finding:
   - **Missing** — requirements the issue/plan asked for that are absent or partial.
   - **Added-not-asked** — behavior in the diff that nothing requested (scope creep; the NOTICED-BUT-NOT-TOUCHING leftovers of Station III belong here — flag, don't silently keep). Review findings that are out of scope become `open` rows in `docs/backlog/i<id>-<slug>.md`; only Station VI (`vi-close-pipeline`) resolves them.
   - **Implemented-wrong** — requirements that look implemented but behave differently than specified.
3. Spec-axis findings join the fix list (Step 2) with severity from operator impact. Spec axis runs **separately** from the quality axes — never merged or re-ranked into them: "follows every standard but implements the wrong thing" is not the same finding as "implements correctly but breaks standards".

### Step 2: Apply Review Fixes Locally

- Merge OCR finds (Critical/High first, then Medium), reviewer finds, and Spec-axis findings. One list, no dupes.
- For any actionable findings (nits, type errors, edge-case risks):
  - Apply minimal, clean fixes directly to the local codebase.
  - Create a clean fix commit: `fix(review): address review feedback`.
- **A regression test that locks the fixed behavior is a shippable improvement, not scope creep.** When the change is verifiable (a direction/locale flip, an invariant the bug violated) and the repo can render the surface, add a focused spec alongside the fix and commit it under its own `test(...)` message. A passing new test that encodes the acceptance criterion strengthens the gate; leave a purely speculative refactor (e.g. extracting a shared helper across call sites) **unfolded** when the plan marks it optional — Simplicity First wins unless the operator adopts it.

### Step 3: Final Post-Review Verification Gate (MANDATORY)

**Before any code is pushed or a PR is opened, the entire change must be verified post-fixes:**

**Approval standard (from Addy):** approve a change when it definitely improves overall code health, even if it isn't perfect. Perfect code doesn't exist — never block a review on taste or on "how I would have written it".

**Citing gate:** every finding carries its motivating evidence — the verbatim quoted line(s) that triggered it. A finding without a quotable line goes to the appendix as unverified; it never enters the main report.

1. **For Frontend / Web / UI Changes — re-run the Step 0 Browser Gate (fast-first) on the fixed code:** same order, same bar — zero uncaught console errors, zero failed network requests.
2. **For Backend / API / Logic Changes:**
  - Run targeted test suites matching modified files (e.g. `pytest tests/test_<module>.py`) to confirm zero regressions in touched modules. Avoid running full repository test sweeps locally; GitHub CI runs the full regression suite on push as the merge gate.
  - **Compare failures against the base before calling them regressions.** If the suite shows failures, establish the base's failure count (run the same suite against `origin/<base>` — a throwaway worktree with its own `pnpm install`, since `node_modules` is not shared) and prove the failing set is identical. Equal counts = pre-existing, not a new regression; do not block the push, and disclose the baseline in the PR body's `## Verification` section. A genuinely larger failing set on the branch is a real regression and blocks the push. Add the new spec for the fix to the same run so its pass is counted with the touched modules.
  - If review fixes in Step 2 modified logic, run targeted tests for those modified files. If Step 2 applied no logic changes, Step 0's proof already stands.
  - **Inspect PR status checks with `gh pr checks <pr>`.** `gh run list` takes `--branch`/`--commit`/`--workflow` but NOT `--pr` (rejected, exit code 1); chaining it with `&&` before a merge/push silently aborts the later commands. Run status probes on their own line (or `|| true`); never place a possibly-failing probe in the middle of a merge chain.
3. **Clean up gate-scaffolding before the final push.** Remove the throwaway base worktree (`git worktree remove --force <path>`, then `git worktree prune`; a remove that reports "not a working tree" just means prune already cleared it) and delete browser-session artifacts the gate created (e.g. `.playwright-cli/`). These are your own litter — they must not ride along in `git status` when the branch is pushed. A `gh pr create` warning about uncommitted changes refers to any residual tree state, not just the diff. Kill a gate preview server by PID, never by image name: find it with `netstat -ano | grep ":<port>.*LISTENING"` and `taskkill /F /PID <pid>` — in git-bash the double-slash form (`//F`) is passed through literally and fails, and a blanket `taskkill /IM python.exe` kills unrelated processes on the host.
3. **Only when verification is green may the agent push** — where "green" means *proved or honestly unverified*: every check either passed, or ended `unverified` under the Step 0.1 abort rule and is disclosed in the PR body's `## Verification` section. **A genuine failure** (a check that ran and failed) blocks the push and returns to `iiib-iterate-after-build`. An unverified gate does not: there is no defect to fix, so blocking would stall the pipeline on broken tooling. Record the trigger status honestly — never present an unverified item as passed.

### Step 4: Git Synchronization & Push (`git-workflow-and-versioning`)

- Confirm active on a dedicated feature branch (never push directly to `master`/`main`). A direct push to the base branch happens in exactly one place: the Step 0.2 quick-fix divert, which routes through `quick-fix` and never reaches these steps.

- Fetch and merge latest base branch:

  ```bash
  git fetch origin <base> && git merge origin/<base> --no-edit
  ```

- **Merge conflicts — additive appends must keep BOTH sides.** When a parallel stream appended code/tests to the same file end you did, git interleaves the two blocks. `git checkout --ours/--theirs` picks ONE whole side and silently drops the other stream's work (including your own just-built tests if you pick theirs) — never resolve a conflict that way without first reading what each side contains. Take the incoming file, then re-apply your own additions on top; keep every independent block. For shared per-task artifacts that legitimately collide (`tasks/plan.md`, `tasks/todo.md`), keep the side belonging to the issue this branch builds and say so in the merge commit. Per-issue plan/contract files (`tasks/plan.md`, `tasks/todo.md`, `CONSTRAINTS.md`) are a special case: when main overwrites them for a *different* issue (the file is per-issue, not additive), "keep both sides additive" does not apply — keep the side belonging to the issue this branch builds; the incoming version is that other issue's plan, not new blocks of yours. Re-run Step 3 on the merged tree, since your tests now sit atop main's content.

- **MANDATORY — re-verify the MERGE RESULT before push.** Merging the base branch changes the code under test: another stream's change to a shared file can break your behavior even though both sides passed alone. The Step 0/3 gates ran on your branch *before* the merge and do not cover the merged tree. After a clean merge, re-run the same gate on the merged state — targeted test suites for touched modules, and the Browser Gate for any UI change — and push only when that post-merge run is green. A genuine post-merge failure blocks the push; fix it on the branch (a cross-stream interaction is a real defect, not a tooling problem) and re-gate before pushing.

- Push branch to remote:

  ```bash
  git push -u origin <branch-name>
  ```

### Step 5: Open Pull Request & Trigger Review

#### Step 5a: Generate Diagram-First Summary (before PR body)

Classify the change type from the diff and generate the **smallest visual
that makes the change clear**. Full algorithm: `references/diagram-generation.md`.

```bash
git diff --name-only origin/<base>...HEAD   # classify change type
```

| Change Type | Diagram | Signals |
|---|---|---|
| API / interface change | Mermaid contract diagram | `.d.ts`, `routes/*`, `openapi*` |
| New feature / module | File tree + call tree | new files/dirs, new exports |
| Refactor (no behavior change) | File-tree diff (before/after) | renamed symbols, moved functions |
| Bug fix | State transition (before→after) | logic branches, conditionals |
| UI change | Before/after screenshot | `.tsx`/`.jsx`/`.css` |
| Config / docs only | Inline diff snippet | `.json`/`.yaml`/`.md` only |

The diagram goes as the **first** element of `## Summary` — a `## Change Visual`
section. Prose summary follows below it.

#### Step 5b: Assess Merge Danger (before PR body)

Compute three dimensions from the live diff. Full algorithm:
`references/merge-danger.md`.

1. **Decision type:** one-way door (DB migration, data transform, external API
   contract) or two-way door (internal refactor, new module, config tweak).
2. **Blast radius:** files / directories / modules / public API surface —
   mapped to Minimal / Low / Moderate / High.
3. **Rollback feasibility:** easy (revert, no state impact) / moderate
   (consumers must migrate) / hard (data has migrated, backup restore needed).

Append a `## Merge Danger` section to the PR body right after `## Summary`.

> **High blast radius** → flag the PR for explicit human review before Station V
> attempts an autonomous merge. The Merge Danger section is informational — it
> drives review depth, never blocks PR creation.

---

**CodeRabbit writes the PR title — you do not.** Use exactly `@coderabbitai`
as the PR title. Do NOT generate the actual PR title yourself. Do NOT add tags
such as `[FIX]`, `[ADD]`, `[IMPROVE]`, etc. yourself. CodeRabbit's effective
configuration (`reviews.auto_title_placeholder` plus
`reviews.auto_title_instructions`, configured in online account/org settings or central configuration)
detects `@coderabbitai` and generates the final PR title according to title instructions.
Conventional-Commits types (`feat:`, `fix:`) belong to commit messages only — never write one into a PR title.

```bash
gh pr create --title "@coderabbitai" --body "## Change Visual`n<diagram>`n`n## Summary`n<brief prose>`n`n## Merge Danger`n<decision> · <blast radius> · <rollback>`n`n## How to verify`n<exact launch + expected value>`n`nCloses #<issue>`n`n@coderabbitai summary"
```

**The body is the verification artifact every later station reads.** Follow the repo's PR template when it defines one — in this repo `## Why`, `## Test output`, `## How to verify`, `Closes #<issue>` (`docs/agents/git-workflow.md`). The PR body must now contain these sections in order:

1. `## Change Visual` — the diagram-first summary (Step 5a)
2. `## Summary` — brief prose explaining the visual, if needed
3. `## Merge Danger` — decision type, blast radius, rollback feasibility (Step 5b)
4. `## How to verify` — the exact launch command and the exact value the operator should see, copy-paste runnable, including whatever flag or store makes the surface show the thing
5. `## Test output` — from the Step 3 verification gate
6. `Closes #<issue>` + `@coderabbitai summary`

Stations V and VI read the `## How to verify` block instead of inventing their own; a body without it guarantees the drift you then have to explain. A body missing `## Change Visual` or `## Merge Danger` should be amended before handoff.

**After creating the PR, verify the title was replaced:** run `gh pr view <pr_number> --json title` and if the title is still exactly `@coderabbitai`, note in the handoff that CodeRabbit did not replace the placeholder (this may happen if settings are disabled or misconfigured). Never fall back to an invented hand-written title.

Immediately post the review trigger comment:

```bash
gh pr comment <pr_number> --body "@coderabbitai review"
```

**Wait for the trigger acknowledgement (MANDATORY before handoff):** Do not conclude the station on a blind post. Post the trigger, wait **10s**, read CodeRabbit's reply to the trigger comment, and classify it:

- `Review triggered.` ("Action performed" reply) — review started. Proceed to handoff.
- Rate-limit reply (`## Review limit reached` / `rate limited by coderabbit.ai` / `Next included review available in N minutes`) — review NOT started. Record the reported minutes and carry them into the handoff report.
- **Summary-only review** (private repo on Free plan) / **`## Review skipped: manual review required for this OSS repository`** / **no reply within ~10s** — record status honestly; verification rests on local gates.
- Full classification details, rate-limit pre-checks, and polling one-liners: `references/coderabbit-interaction.md`.

**Comment links (mandatory whenever the ack is anything other than `Review triggered.`):** post direct jump links in the handoff report so the operator can reach the exchange in one click (API query: `references/coderabbit-interaction.md`). Note that the bot login is `coderabbitai[bot]`.

**Handoff:** Conclude Station IV and recommend `v-babysit-pr-and-merge`. The handoff report MUST state the trigger status in one line, choosing exactly one of: *review started* / *rate limited (N minutes)* / **summary-only review — no findings expected on a private Free repo; verification rests on the local gates** / *CodeRabbit skipped (OSS: manual review required on this public repo) — no inline findings; verification rests on the local gates* / *other reply (quoted)* / *no acknowledgement*. Station V reads this line to classify the review, so it must never present a summary-only review as a pass.

---

## Report rules (mandatory)

List review findings per reviewer (name + what was found + fixed or not). A reviewer with nothing found is not listed. The What-now section carries the PR hyperlink and the CodeRabbit trigger status line. The summary is 3 quick lines, not a journey.

<!-- local-only:iv-review-build-and-pr:output-template-begin -->
The chat output template for this station is `references/english-template.md` (default).
Read it before writing your first report.
If the operator explicitly requests Hebrew output, use the Hebrew template at `references/hebrew-template.md`.
<!-- local-only:iv-review-build-and-pr:output-template-end -->
