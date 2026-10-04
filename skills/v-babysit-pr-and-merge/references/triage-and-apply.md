## Triage and Apply - Step 2 (extraction + triage), Step 2B (fallback review),
## Step 3 (late rejections), Step 4 (code application, tests, commit, thread replies)

Stage two of the review loop: pull every comment, decide each one yourself, and
apply the accepted fixes. The single round ends when no thread is left untriaged.


> Part of v-babysit-pr-and-merge (Station V). Loaded on demand - the station
contract in SKILL.md is the source of truth; this file holds the detail.

### Step 2 — Autonomous Review Extraction & Triage (Zero Automation Bias)

Never rubber-stamp bot reviews, and never ask the operator how to triage a comment. CodeRabbit frequently hallucinates domain-specific specifications (constants, limits, formats defined by the project's own domain), introduces breaking magic-number changes, or adds bloated dependencies. The agent decides every comment itself using the heuristics below.

#### 2.1 — Programmatic Comment Extraction

Pull the raw review comments through the GitHub API rather than scraping rendered PR text. This yields the exact anchors needed for autonomous code application in Step 4.

```bash
gh api repos/:owner/:repo/pulls/<pr_number>/comments \
  --paginate \
  --jq '.[] | {id, path, line, start_line, body}'
```

Required fields per comment:

| Field | Purpose |
| --- | --- |
| `id` | Comment ID used for the reply endpoint (`.../pulls/comments/<id>/replies`). |
| `path` | Repo-relative file the comment anchors to. |
| `line` | Last line of the target range (end of the hunk). |
| `start_line` | First line of the target range; `null` for single-line comments — treat as equal to `line`. |
| `body` | Markdown body containing the suggestion, proposed fix, or AI prompt. |

Also capture the GraphQL `threadId` for each comment so rejections can be resolved without a second lookup:

```bash
gh api graphql -f query='
  query($owner:String!, $repo:String!, $pr:Int!) {
    repository(owner:$owner, name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first:100) {
          nodes { id isResolved comments(first:1) { nodes { databaseId path line } } }
        }
      }
    }
  }' -f owner=<owner> -f repo=<repo> -F pr=<pr_number>
```

Map each `databaseId` back to the REST comment `id` to build the working triage table:
`(id, threadId, path, start_line, line, body, verdict)`.

**Zero extracted comments is not a verdict.** When extraction returns nothing, do not report a
clean pass. Check whether the review was `SUMMARY_ONLY` (see `review-loop.md` Step 1 item 6): on a
private repo on the Free plan that is the expected summary-only shape, and it routes to the Step 2B
reuse path — Station IV's recorded evidence plus a delta check — not to "the code is approved as
is". State which case you are in.

#### 2.2 — Single Review Round (Quota-Conscious)

This habit executes **exactly one focused review round** to conserve CodeRabbit quota and prevent indefinite review churn. All valid comments in this single round are triaged, fixed, tested, and resolved, followed directly by CI verification and merge.

#### 2.3 — Thoughtful Triage & Deliberation (No Blind Acceptance or Rejection)

Never rubber-stamp bot reviews, but also **never reject suggestions blindly without genuine deliberation**.
The agent must deliberate like a thoughtful senior staff engineer: evaluate each CodeRabbit comment on its technical merits against the codebase, domain requirements, and overall project value.

**Evaluate Thoughtfully:**
- **Code Improvements & Refinements:** If CodeRabbit points out a cleaner pattern, better typing, unhandled edge cases, or performance improvement — verify if it fits the project architecture. If it genuinely improves code quality, **ACCEPT** it, apply the fix, and verify with tests.
- **Constants & Configuration:** Don't reject out of habit — evaluate whether the suggestion fixes a real discrepancy or typo against the external specification. If the repo's existing constant is correct and intentional per the domain spec, **REJECT** with a concise technical explanation citing the spec.
- **Dependencies:** If CodeRabbit suggests a library or utility, evaluate: does this library eliminate substantial custom boilerplate/security risk, or is it bloat? If genuinely beneficial and lightweight, accept; if unnecessary bloat, decline with rationale.
- **Safety, Bugs & Errors (High Priority ACCEPT):** Unhandled exceptions, nil/None pointer dereferences, resource leaks, security bypasses, or missing error checks should be prioritized and accepted immediately.
- **Cosmetic / Out-of-Scope Churn:** If a comment is purely cosmetic or outside the PR's scope with zero behavioral value, politely decline with rationale.

**Deliberation Principle:** The agent thinks for itself, tests hypotheses against the actual codebase and tests, and makes principled decisions rather than relying on blunt heuristic lists.

#### 2.4 — Handle Every Rejection Immediately (Reply First, Never Resolve Silently)

For **every** REJECT — auto or judged — you MUST reply with an explicit `REJECT: <reason>` technical rationale through the GitHub API, then resolve the review thread through GraphQL so it cannot block merging:

```bash
# 1. Reply with a concrete, one-sentence technical rationale (must include pull request number)
gh api repos/:owner/:repo/pulls/<pr_number>/comments/<comment_id>/replies \   -f body="REJECT: the domain spec defines this constant as 0.01, so the suggested 0.001 would cause the external API to reject every request."

# 2. Resolve the thread so it clears from active PR blockers
gh api graphql -f query='mutation($t:ID!) { resolveReviewThread(input: {threadId: $t}) { thread { isResolved } } }' -F t=<thread_id>
```

Rationale must be specific and falsifiable — name the constant, the exception, the file, or the spec/domain rule. NEVER resolve a thread silently without an inline reply, and never leave a rejected comment open.

**Config contradiction → probe resolved config FIRST (before blaming the repo file or re-reviewing).**
When CodeRabbit's behaviour contradicts the committed `.coderabbit.yaml`, run the configuration
probe as the first diagnostic step and quote the resolved output in the report:

```bash
gh pr comment <pr_number> --body "@coderabbitai configuration"
```

The reply prints the fully resolved config annotated with the **source of every value** (repository
YAML, central configuration, UI settings, defaults, global overrides), which answers "why is
CodeRabbit not doing what I configured?" in one command. Compare it against `.coderabbit.yaml`
before concluding a setting is broken — sources do not merge by default and global overrides win
everywhere. This command is **chat-gated**: on the Free plan it is refused with the "upgrade to
CodeRabbit Essentials" notice. Record that refusal as a plan gate and fall back to the reuse path's
Station IV evidence plus the delta check — never treat the refusal as "config is fine".

### Step 2B — Agent Fallback Review (When CodeRabbit Limit Reached or Silent)
---

### Step 2B — Agent Fallback Review (When CodeRabbit Limit Reached or Silent)

Trigger this step when CodeRabbit reached its review limit, asks to wait 1 hour, or failed to review after the countdown. **The reuse path (item 0) comes first — the full subagent review is the exception, not the default.** Items 1–4 apply to the full fallback only; on the reuse path, skip to its last bullet (delta check → Step 4) and post the honest PR comment with the reuse variant (Station IV review + delta check, not a fresh review).

0. **Reuse Station IV's review before re-reviewing (anti-duplication rule):** If this PR came through `iv-review-build-and-pr`, the diff has ALREADY been through OCR delegation review + stack-matched reviewers + the Spec axis, with findings fixed and the final verification gate green. Do NOT invoke a fresh full review of already-reviewed code. Instead:
   - Pull Station IV's recorded review findings (the review report / fix commit history: `fix(review): address review feedback` commits, `gh pr view <pr-number> --json commits`), and treat them as the review evidence for this round.
   - Run only a **lightweight delta check**: confirm the pushed diff matches what Station IV reviewed (no commits added after the final gate), re-run the targeted test suite as the evidence of health, and spot-check any area Station IV flagged as low-confidence or skipped (cover exactly that gap with the matching reviewer).
   - Proceed to Step 4 application/merge path with the status carried honestly (`RATE_LIMITED — covered by Station IV review + delta check`).
   - Skip this reuse path only when the PR did NOT come through Station IV or new commits landed after Station IV's gate — run the full subagent fallback below in those cases.
1. **Full Fallback Review (only when reuse path does not apply) — Invoke `code-reviewer` Subagent:**
   - Launch the dedicated subagent with clean context:
     `invoke_subagent(TypeName="code-reviewer", Role="Code Reviewer", Prompt="Perform multi-axis review of PR <pr-number> diff across correctness, readability, architecture, security, and performance. List concrete actionable findings.")`
   - Review across five axes: correctness/logic bugs, edge cases, performance/limits, security/safety, and test coverage.
2. **Findings in chat** (Hebrew, never a code block — real `##` heading, one bold Hebrew sentence with the file in backticks, short free quote body with the fix):
   ## 🎯 נכונות פונקציונלית | 🟡 מינורי | ⚡ תיקון זריז
   **ללכוד ב־`scripts/filter_loop.py` את הזנב ואת האופסט מאותו מצב של הקובץ.**
   > - שורה שנוספת בזמן הקריאה נאבדת בשקט; לקחת אופסט לפני הקריאה כדי שהטווחים יחפפו.
   - Vocab (match `docs.coderabbit.ai/change-stack/findings`) — Category: 🎯 נכונות פונקציונלית, 🔒 אבטחה ופרטיות, 🗄️ שלמות מידע ואינטגרציה, ⚡ ביצועים וסקייל, 🩺 יציבות וזמינות, 📐 תחזוקה ואיכות קוד. Severity: 🔴 קריטי, 🟠 מייגור, 🟡 מינורי, ⚪ טריוויאלי. Effort: ⚡ תיקון זריז, 🏗️ מאמץ כבד, 🪙 תיקון זול ערך, 🚫 לא משתלם.
3. **Decide per finding:** critical/major block merge; minor when cheap; trivial/low-value only when touching that code, else declined with reason; poor tradeoffs declined; drop lows unless clearly useful. End chat with a single הבא line naming `vi-close-pipeline <id>` — no test counts, no process narration; the agent pushes and merges itself.
4. **Document & Triage:**
   - Note any real issues found as **ACCEPT** items and apply fixes immediately via Step 4.
   - Post a concise review comment to the PR — pick the honest reason, never a generic one. Variants: timeout (PR #244 case), rate-limit, and reuse (Station IV coverage + delta check, no fresh review):
    ```bash
    gh pr comment <pr-number> --body "### Objective Agent Review (CodeRabbit review timed out after ~Xm in progress)`n`n- **Diff verified:** <what was checked>`n- **Findings:** <summary or clean pass>"
    # Reuse variant:
    gh pr comment <pr-number> --body "### Review Coverage Note (CodeRabbit rate limited)`n`n- **Coverage:** pre-push review already performed by iv-review-build-and-pr (OCR + stack-matched reviewers + Spec axis); delta check confirms no commits since that gate; targeted tests re-run green.`n- **New findings:** <none / summary>"
    ```

---

### Step 3 — Late Rejections Only (Pointer, No Repeat)

Step 2.4 above is the single canonical REJECT flow (reply with `REJECT: <reason>`, then resolve via GraphQL). This step exists only for rejections discovered later in the round — apply the exact Step 2.4 procedure to them, no separate commands here.

**Exit condition for the round:** zero unresolved threads carrying a REJECT verdict, and zero threads resolved without an inline reply.

---

### Step 4 — Autonomous Code Application (One Commit Per Round)

**CRITICAL RULE:** NEVER invoke `@coderabbitai auto-fix` when any review comments in the round were rejected. The agent acts as the responsible engineer; CodeRabbit is purely advisory. A partial rejection means the bot's world model is wrong for this diff, so it must not be allowed to write code.

#### 4.1 — The Two Comment Types

Every ACCEPTed comment resolves to one of two application types, determined by its `body`.

**Type A — Committable Suggestions (```` ```suggestion ... ``` ````)**

The body contains a fenced ```` ```suggestion ```` block, typically under a `📝 Committable suggestion` heading.

1. Extract the replacement lines: everything between the ```` ```suggestion ```` fence opener and its closing fence.
2. **Pre-validate before applying:** Never paste blindly. Verify:
   - Does this suggestion require missing imports? If yes, add the imports to the file header.
   - Are variable/type names consistent with existing module conventions?
3. Replace the target lines — `start_line` through `line`, inclusive — directly in the local file at `path`. When `start_line` is `null`, replace the single line `line`.
4. Preserve the file's existing indentation style and line endings; splice cleanly.
5. Re-read the file after splicing to confirm the range landed where intended. Apply comments **per file in descending `line` order** so line anchors do not shift.

**Type B — Proposed Fixes / AI Prompts**

The body contains a `♻️ Proposed fix`, a `🤖 Prompt for AI Agents` block, or a prose diff rather than a committable suggestion.

1. Read the diff or prompt and extract the *intent* — the defect being described — not the literal text.
2. Implement the **minimal domain-specific fix** locally: the smallest edit that removes the defect while conforming to repo conventions, existing helpers, and the project's real domain constraints.
3. If the bot's suggested code is itself flawed or incomplete but the underlying defect is real, write the correct fix directly.

#### 4.2 — Verification & Surgical Self-Healing

Run targeted checks covering the touched code (auto-detect runner — `pytest tests/test_<module>.py`, `npm test -- <file>`; for UI/styling fixes re-run Station IV's Browser Gate, fast-first) before staging anything:

```bash
<project targeted test command>
```

- **All tests pass:** Proceed to the single batch commit.
- **A suggestion breaks a test / build:**
  1. **Surgical Fix Attempt:** Inspect the failure. Often the bot's idea was sound but had a small syntax slip, missing argument, or typo. Make a surgical adjustment to fix the syntax and re-test.
  2. **Revert & Reject (Only if fundamentally flawed):** If the suggestion is fundamentally broken, contradicts the domain spec, or cannot be made green cleanly:
     - Revert only the offending file: `git checkout <file>`
     - Reply to that comment's thread with the concrete rationale:
       ```bash
       gh api repos/:owner/:repo/pulls/comments/<comment_id>/replies \
         -f body="Reverted: applying this suggestion fails <test_id> — <traceback summary>. Keeping existing verified behavior."
       ```
     - Resolve the thread as a **REJECT**:
       ```bash
       gh api graphql -f query='mutation($t:ID!) { resolveReviewThread(input: {threadId: $t}) { thread { isResolved } } }' -F t=<thread_id>
       ```
     - Re-run targeted tests to confirm green status.

#### 4.3 — Single Batch Commit & Push (No Re-Reviews)

Since CodeRabbit on free/OSS quotas runs **exactly one review pass per PR**, all accepted fixes for the entire round go into **ONE single commit**, pushed once to origin:

```bash
git add <modified-files>
git commit -m "fix(review): apply CodeRabbit review fixes [accepted items]"
git push origin <branch-name>
```

**HARD RULE — no second trigger, ever:** do NOT re-post `@coderabbitai review` and do NOT wait for a secondary review pass. The PR is trigger-locked for the rest of the pipeline: the earlier trigger already consumed the review, and any new trigger would only hit the rate limit. Push the commit, then advance immediately to Step 4.4 and CI verification — if the `CodeRabbit` check is still `PENDING`, that is expected and is excluded from the merge gate (see the timeout-merge rule in `SKILL.md`).

#### 4.4 — Actively Reply and Resolve Addressed Threads (MANDATORY: Reply First, Never Resolve Blindly)

**IRON RULE — NEVER RESOLVE SILENTLY & NEVER BULK-RESOLVE UNTRIAGED THREADS:**
Every resolved review thread MUST have an explicit inline reply (`ACCEPT: <summary of fix>` or `REJECT: <reason>`) posted before resolution.
NEVER run a blind bulk-resolution script that automatically resolves threads across the PR without verifying whether they were addressed. New incremental review comments or re-reviews might have arrived; blindly resolving threads closes unaddressed issues!

1. **Reply inline to EACH addressed comment thread individually:**
   ```bash
   gh api repos/:owner/:repo/pulls/<pr_number>/comments/<comment_id>/replies \
     -f body="ACCEPT: Fixed in latest commit: <brief summary of fix applied>"
   ```

2. **Resolve ONLY the thread IDs that were explicitly triaged and replied to in this round:**
   ```bash
   gh api graphql -f query='mutation($id: ID!) { resolveReviewThread(input: {threadId: $id}) { thread { isResolved } } }' -F id="<thread_id>"
   ```

#### 4.5 — Post Summary Comment

Comment on the PR listing:

- Accepted items fixed (`file:line`, Type A or Type B).
- Rejected items dismissed, each with its one-sentence reason — including auto-rejects and self-healed reverts.
- Local test results (`116 passed in X.XXs`).


