---
name: iv-review-build-and-pr
description: Station IV (Review, Verify & Ship) — Universal shipping flow. Runs OCR delegation (deterministic file scope + rules, host-agent review, no LLM key), then ECC language/framework reviewers, applies fixes, executes the post-review Browser Gate (UI, fast-first, playwright-cli only — see Step 0.1 tool allowlist; DevTools MCP for profiling only) or targeted test gate (backend), pushes branch, and opens GitHub PR with @coderabbitai summary.
---

# Station IV: Review, Verify & PR (`iv-review-build-and-pr`)

This skill implements **Station IV (Review, Verify & Ship)** of the 6-station pipeline (I–VI). It works across **any project, language, or repository**, taking code completed in Station III (`iii-build-plan`), dynamically discovering and deploying language/framework specialist reviewers, applying fixes, enforcing the **Final Pre-Push Verification Gate** (live browser verification for UI or full regression test suite for backend), pushing to origin, opening a Pull Request linked to the issue, and recommending `v-babysit-pr-and-merge`.

## Pipeline Position

- **Station:** Station IV of VI
- **Previous Station:** `iii-build-plan` (Build)
- **Next Station:** `v-babysit-pr-and-merge` (Babysit & Merge)

---

## 1. Invocation

```bash
/iv-review-build-and-pr    # Runs multi-axis review, fix application, final verification, push, and PR opening
```

---

## 2. Protocol Under the Hood

### Step 0: Proof-Before-Review Gate (MANDATORY, FIRST)

**No review runs on unproven code.** Before Step 1, prove the build actually works. This station is the **single owner of browser-based verification** in the whole pipeline — no other station runs browser checks. This ownership applies whenever any UI change ships, regardless of which station built it.

1. **For Frontend / Web / UI changes — Browser Gate (fast-first, `playwright-cli` only):** start the project's preview server, then verify in this order with the **`playwright-cli`** skill (headless by default, compact snapshots, no MCP round-trips). Reach for `browser-testing-with-devtools` (chrome-devtools-mcp) **only** when the gate needs performance traces or profiling — never for routine render/DOM checks:
   - **API/HTTP smoke (no browser):** every key page and endpoint the change touches answers 200 with sane content (`curl` or equivalent).
   - **Programmatic DOM checks — one batched call (no screenshot):** `playwright-cli open <url>`, then a single `playwright-cli eval "<one function>"` that performs all DOM/layout checks and returns one small JSON verdict (required elements exist, table rows/columns render, layout has no overflow). Never one call per check.
   - **Console + network — one call each:** `playwright-cli console` → zero uncaught errors; `playwright-cli requests` → zero failed network requests (pull both once after the page settles — do not eyeball a screenshot for this).
   - **Screenshot — once, last:** a single `playwright-cli screenshot` as final visual proof, only after everything above is green, then `playwright-cli close`. Never per-iteration.
2. **For Backend / Logic changes:** run the targeted test suites for modified files — all green.
3. **On failure:** stop. Route the failure list to `iiib-iterate-after-build` as correction items, and re-enter this station only after IIIB is clean. Do not review broken code.
4. **On success:** record one gate line for the report (what was run, what passed), then continue to Step 1.

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
- **Never open a browser at all** when `curl` already proves the change. If the smoke check is green and the change has no visual/interactive surface, that *is* the gate — skip the browser.

### Step 1: OCR Delegation Review (MANDATORY, FIRST — embedded procedure)

Use OCR only for fixed work (file pick + rules). The thinking stays with you. No LLM key needed on OCR side. Source: `https://github.com/alibaba/open-code-review` (Apache-2.0), which publishes an equivalent upstream skill (`skills/open-code-review-delegate`) that this step embeds rather than depends on — no external skill file is required, and nothing breaks if the upstream skill is not installed. The full delegation procedure (preview, rules, diffs, per-file review, finding shape, coverage counts) lives in `references/ocr-delegation.md` — follow it exactly.

**Prerequisite:** the `ocr` CLI must be on PATH — `ocr --version`. If missing: `npm install -g @alibaba-group/open-code-review`, then retry once. `--format json` requires v1.9.0+ (verified locally: v1.12.10).

### Step 1B: Dynamic Reviewer Discovery & Multi-Axis Review (uses OCR output as input)

Feed the OCR file list + Rule Groups + OCR finds into each reviewer below (no file left out, line numbers from OCR win on conflicts). Inspect the diff (`git diff --name-only origin/<base>...HEAD`) and discover matching specialized reviewers from the project's agent repository (`.agents/agents/`, `~/.agents/agents/`, or builtins):

**Reviewer honesty rule:** a reviewer persona that is not found on disk is skipped — record the skip and the reason in the report. Never invent or simulate a missing reviewer (do not invent).

1. **General Code Quality (`code-review-and-quality`):**
   - Check diff clarity, clean naming, absence of dead code, and adherence to project patterns.
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
   - Map each changed behavior to the test that covers it; rate uncovered paths by impact (critical / important / nice-to-have). (Absorbed from ECC `pr-test-analyzer`.)
6. **Docs Drift (`doc-updater`, diff-triggered):**
   - Deploy when the diff touches `*.md` files, docstrings, or README/docs adjacent to changed behavior. Verify that documentation touched by the diff still matches the code — no stale examples, no outdated API references. Persona from `~/.agents/agents/`; not found on disk → skip and record the skip (do not invent).

### Step 1C: Spec Axis — Diff vs Issue & Plan (from Matt Pocock's two-axis review)

Before applying fixes, run the Spec axis in full:

1. Load the linked GitHub issue (`gh issue view <n> --comments`) and the plan (`tasks/plan.md`).
2. Compare the diff against them and report, with the spec line quoted for every finding:
   - **Missing** — requirements the issue/plan asked for that are absent or partial.
    - **Added-not-asked** — behavior in the diff that nothing requested (scope creep; the NOTICED-BUT-NOT-TOUCHING leftovers of Station III belong here — flag, don't silently keep). Review findings that are out of scope become `open` rows in `docs/issues/<id>-noticed-but-not-touching.md`; only Station VI (`vi-close-pipeline`) resolves them.
   - **Implemented-wrong** — requirements that look implemented but behave differently than specified.
3. Spec-axis findings join the fix list (Step 2) with severity from operator impact. Spec axis runs **separately** from the quality axes — never merged or re-ranked into them: "follows every standard but implements the wrong thing" is not the same finding as "implements correctly but breaks standards".

### Step 2: Apply Review Fixes Locally

- Merge OCR finds (Critical/High first, then Medium), reviewer finds, and Spec-axis findings. One list, no dupes.
- For any actionable findings (nits, type errors, edge-case risks):
  - Apply minimal, clean fixes directly to the local codebase.
  - Create a clean fix commit: `fix(review): address review feedback`.

### Step 3: Final Post-Review Verification Gate (MANDATORY)

**Before any code is pushed or a PR is opened, the entire change must be verified post-fixes:**

**Approval standard (from Addy):** approve a change when it definitely improves overall code health, even if it isn't perfect. Perfect code doesn't exist — never block a review on taste or on "how I would have written it".

**Citing gate:** every finding carries its motivating evidence — the verbatim quoted line(s) that triggered it. A finding without a quotable line goes to the appendix as unverified; it never enters the main report.

1. **For Frontend / Web / UI Changes — re-run the Step 0 Browser Gate (fast-first) on the fixed code:** same order, same bar — zero uncaught console errors, zero failed network requests.
2. **For Backend / API / Logic Changes:**
   - Run targeted test suites matching modified files (e.g. `pytest tests/test_<module>.py`) to confirm zero regressions in touched modules. Avoid running full repository test sweeps locally; GitHub CI runs the full regression suite on push as the merge gate.
   - If review fixes in Step 2 modified logic, run targeted tests for those modified files. If Step 2 applied no logic changes, Step 0's proof already stands.
3. **Only when verification is green may the agent push** — where "green" means *proved or honestly unverified*: every check either passed, or ended `unverified` under the Step 0.1 abort rule and is disclosed in the PR body's `## Verification` section. **A genuine failure** (a check that ran and failed) blocks the push and returns to `iiib-iterate-after-build`. An unverified gate does not: there is no defect to fix, so blocking would stall the pipeline on broken tooling. Record the trigger status honestly — never present an unverified item as passed.

### Step 4: Git Synchronization & Push (`git-workflow-and-versioning`)

- Confirm active on a dedicated feature branch (never push directly to `master`/`main`).
- Fetch and merge latest base branch:

  ```bash
  git fetch origin <base> && git merge origin/<base> --no-edit
  ```
- Push branch to remote:

  ```bash
  git push -u origin <branch-name>
  ```

### Step 5: Open Pull Request & Trigger Review

**CodeRabbit writes the PR title — you do not.** Pass the `reviews.auto_title_placeholder`
keyword as the title and CodeRabbit replaces it with a title built from
`reviews.auto_title_instructions`. The TAG vocabulary defined there (`[ADD] [CREATE] [FIX]
[IMPROVE] [REFACTOR] [OPTIMIZE] [TEST] [DOCUMENT] [FORMAT] [UPDATE] [CONFIGURE] [REVERT]`) is the
**single title grammar** for every PR in the pipeline. Conventional-Commits types (`feat:`, `fix:`)
belong to commit messages only — never write one into a PR title. See
`config/coderabbit/README.md` for the full command playbook.

```bash
gh pr create --title "@coderabbitai" --body "## Summary`n...`n`nCloses #<issue>`n`n@coderabbitai summary"
```

Preconditions for the handover, both required: the repo's `.coderabbit.yaml` sets
`reviews.auto_title_placeholder` (default `@coderabbitai`) **and** `reviews.auto_title_instructions`.
If either is missing, CodeRabbit cannot write a compliant title — say so in the handoff instead of
silently falling back to a hand-written title.

**Allowance pre-check (plan-gated — know what it costs before you spend it):**
`@coderabbitai rate limit` reports the remaining review allowance and when the next review frees
up **without consuming a review**. It is worth posting when the quota is thin — but it is a
**chat-gated command**: on the Free plan it is refused with the "upgrade to CodeRabbit Essentials"
notice, and that refusal is its own outcome, **never** "zero allowance". On a paid tier, branch on
the answer (allowance available → trigger now; no allowance → carry the reported minutes into the
handoff instead of spending a 60-second wait on a trigger that will be declined). On Free, skip the
comment entirely and read the allowance from the trigger acknowledgement below — it carries the same
signal. This is a pre-check only; it does not replace the post-trigger ack.

```bash
gh pr comment <pr_number> --body "@coderabbitai rate limit"   # Free: declines — skip it
```

Immediately post the review trigger comment (**post exactly once** — pick ONE of the two forms below, never both):

```bash
gh pr comment <pr_number> --body "@coderabbitai review"
```

Fresh-run one-liner alternative (post + 15s wait + poll in one — use INSTEAD of the snippet above):

```powershell
gh pr comment <pr_number> --body "@coderabbitai review" 2>&1 | Select-Object -Last 1; Start-Sleep -Seconds 60; gh pr view <pr_number> --comments 2>&1 | Select-String "Action performed|Review triggered|Review limit reached|Next included review available|rate limited by coderabbit" | Select-Object -Last 6
```

**Wait for the trigger acknowledgement (MANDATORY before handoff):** Do not conclude the station on a blind post. Post the trigger, wait **60s**, then read CodeRabbit's reply to the trigger comment once, then classify it:

- `Review triggered.` ("Action performed" reply) — review started. Proceed to handoff.
- **Summary-only review** — an acknowledgement with a high-level summary and **no inline findings**. This is the expected shape on a **private repo on the Free plan**, where PR reviews are summarization-only. It is **not** a pass and **not** a quality signal: hand off stating plainly that CodeRabbit produced no findings here and that verification rests on the local gates (OCR delegation, type-matched reviewers, Spec axis, targeted tests). Never imply a bot review approved the code. Public repos and paid tiers do produce inline findings, so read the reply rather than assuming this shape.
- Rate-limit reply (`## Review limit reached` / `rate limited by coderabbit.ai` / `Next included review available in N minutes`) — review NOT started. Record the reported minutes and carry them into the handoff report so the operator (and Station V) know the quota window.
- Any other refusal/skip notice (e.g. "does not re-review already reviewed commits", or the Free-plan "upgrade to CodeRabbit Essentials" notice on a chat-gated command) — record verbatim; it may mean incremental review found nothing new, which is itself a signal Station V must read (not a silent pass). An upgrade refusal is a plan gate, not a quota reading.
- No reply within ~60s — report `trigger acknowledgement not received` honestly; do not claim the review started.
- **Ack polling (PowerShell, 60s wait, matches the real rate-limit header):** only when the trigger was already posted via the snippet above — do NOT re-post:

```powershell
Start-Sleep -Seconds 60; gh pr view <pr_number> --comments 2>&1 | Select-String "Action performed|Review triggered|Review limit reached|Next included review available|rate limited by coderabbit" | Select-Object -Last 6
```

- **Ack polling (bash fallback, same 60s wait, same markers):**

```bash
sleep 60; gh pr view <pr_number> --comments 2>&1 | grep -iE "Action performed|Review triggered|Review limit reached|Next included review available|rate limited by coderabbit" | tail -6
```

**Comment links (mandatory whenever the ack is anything other than `Review triggered.`):** post direct jump links in the handoff report so the operator can reach the exchange in one click — both the trigger comment and CodeRabbit's reply. Pull the `html_url` of each comment via the API:

```bash
gh api repos/:owner/:repo/issues/<pr_number>/comments --jq '.[] | select(.body | contains("@coderabbitai review")) | {trigger: .html_url}'
gh api repos/:owner/:repo/issues/<pr_number>/comments --jq '[.[] | select(.user.login == "coderabbitai")] | last | {reply: .html_url, body: .body[0:300]}'
```

  Report shape: `Trigger: <html_url>` / `CodeRabbit reply: <html_url>` (e.g. `https://github.com/<owner>/<repo>/pull/<n>#issuecomment-<id>`). For the no-reply case, post the trigger-comment link alone.

**Handoff:** Conclude Station IV and recommend `v-babysit-pr-and-merge`. The handoff report MUST state the trigger status in one line, choosing exactly one of: *review started* / *rate limited (N minutes)* / **summary-only review — no findings expected on a private Free repo; verification rests on the local gates** / *other reply (quoted)* / *no acknowledgement*. Station V reads this line to classify the review, so it must never present a summary-only review as a pass.

---

## Report rules (mandatory)

List review findings per reviewer (name + what was found + fixed or not). A reviewer with nothing found is not listed. The What-now section carries the PR hyperlink and the CodeRabbit trigger status line. The summary is 3 quick lines, not a journey.

<!-- local-only:begin -->
The chat output template for this station is `references/output-template.md`.
Read it before writing your first report.
<!-- local-only:end -->

