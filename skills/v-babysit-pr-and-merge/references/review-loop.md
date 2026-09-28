## The Review Loop - Step 0 (ship handshake) and Step 1 (trigger + countdown)

The station's review loop has three stages. Stage one is here: confirm or delegate the
PR, trigger the review, and wait out the countdown.

> Part of `v-babysit-pr-and-merge` (Station V). Loaded on demand — the station
> contract in `SKILL.md` is the source of truth; this file holds the detail.
### Step 0 — Ship Handshake (PR Found or Delegated to `iv-review-build-and-pr`)

If a PR already exists for the current branch:
1. Find it: `gh pr list --head <branch-name> --state open --json number,title,url` (or `gh pr view` if the number is known).
2. **Acknowledge to the operator which PR was found** — number, title, and URL (e.g. `Found PR #128: <title> — <url>`).
3. Record the PR number and proceed directly to Step 1.

If no PR exists: **do not create it yourself — delegate to `iv-review-build-and-pr`** (its review, type-matched reviewers, test gate, and PR standards apply). Invoke `iv-review-build-and-pr`, let it open the PR and post the `@coderabbitai review` comment, then resume this skill at Step 1 with the newly created PR.
1. **Pre-flight & Base Branch Sync:** (handled inside `iv-review-build-and-pr`)
   - Detect base branch (e.g. `origin/master` or `origin/main`):
     ```bash
     gh repo view --json defaultBranchRef -q .defaultBranchRef.name
     ```
   - Fetch and merge the base branch so the branch is fully up-to-date:
     ```bash
     git fetch origin <base> && git merge origin/<base> --no-edit
     ```
2. **Review & Quality Verification:** (handled inside `iv-review-build-and-pr`)
   - Type-matched parallel review; fixes applied before push.
   - **No separate full-suite run here** — `iii-build-plan` already ran the suite per task, and GitHub CI will run it again on push. Local re-runs at this point are redundant; CI on the PR is the merge gate.
3. **Commit & Push:** (handled inside `iv-review-build-and-pr`)
   ```bash
   git status
   git add <files>
   git commit -m "<type>(<scope>): <summary>"
   git push -u origin <branch-name>
   ```
4. **Open PR with Semantic Context:** (handled inside `iv-review-build-and-pr`)
   - Detect linked issue if present in branch name (e.g. `issue-61` -> `Closes #61`).
   - `iv-review-build-and-pr` creates the PR with `@coderabbitai summary` in the body and posts `@coderabbitai review` immediately.
   - Record PR number and URL.

---

### Step 1 — Review Trigger & Countdown Polling Cycle (5m → 4m → 3m → 2m → 1m)

1. **Verify the Review Trigger (`iv-review-build-and-pr` posts it at PR creation, babysitter verifies):**
   - CodeRabbit does **not** auto-review anymore — reviews start only from an explicit `@coderabbitai review` comment, which `iv-review-build-and-pr` posts immediately after opening the PR. By the time this station starts, the review is therefore usually already running.
   - **Consume Station IV's trigger-status handoff first (do not re-detect):** Station IV's handoff report already states the trigger status in one line — review started / rate limited (N minutes) / other bot reply (quoted, with jump links to the trigger comment and CodeRabbit's reply) / no acknowledgement. Carry that status forward as the initial review state:
     - `review started` → go straight to the check-first below (review may already be posted).
     - `rate limited (N minutes)` → do NOT start the countdown for the quota window; go directly to Step 2B's reuse path (Station IV's review evidence + delta check). The N-minute window is reported to the operator, never silently waited out.
     - `other bot reply` / `no acknowledgement` → treat as not-started: re-verify the bot's last reply via the jump links / API (state may have advanced since IV's handoff), and if still not triggered, follow the fallback below.
   - If this skill was invoked on a PR that has no review trigger comment yet (e.g. the PR was opened outside `iv-review-build-and-pr`, or the comment is missing), post it now — do not wait:
     ```bash
     gh pr comment <pr-number> --body "@coderabbitai review"
     ```
   - Output note: `Triggered CodeRabbit review via PR comment.`

2. **Check-First — Never Wait Blind (MANDATORY before any countdown):**
   - Immediately after verifying the trigger, pull the PR's current comments AND inline review threads before starting any wait timer:
     ```bash
     gh pr view <pr-number> --json comments,reviews --jq "[.comments[] | {author: .author.login, body: .body[0:200]}]"
     gh api repos/:owner/:repo/pulls/<pr_number>/comments --paginate --jq ".[] | {id, path, line, body: .body[0:200]}"
     ```
   - If actionable review content (summary review, inline findings) is ALREADY posted: skip the entire 5m → 4m → 3m → 2m → 1m countdown and proceed directly to Step 2 extraction & triage. Output note: `Review already posted — countdown skipped, proceeding to triage.`
   - Start the countdown ONLY when no review content exists yet (only the trigger comment and/or the bot's invocation ack are present).
   - Rationale: CodeRabbit often finishes fast or the skill resumes after a delay; waiting a full 5 minutes while comments sit ready wastes a cycle and ignores available work.

3. **Read Every New CodeRabbit Comment — Differentiate Its Kind:**
   On each countdown check, read every comment CodeRabbit posted since the last check. Classify each one before acting:
    - **Usage-limit / status comments** — e.g. `## Review limit reached`, `rate limited by coderabbit.ai`, `Next included review available in N minutes`, `Review skipped: ...`. These carry **no review content**. Action: do NOT wait for the quota — skip immediately to the manual review fallback (Step 2B, agent fallback review).
   - **Actual review content** — a summary review, actionable inline comments, findings, or information relevant to the diff. These are the working output. Action: proceed to Step 2 extraction and triage on them.
   - Never treat a usage-limit comment as a completed review, and never treat a summary-only comment as the end of review comments still being posted. A green check can still mean `Review skipped` — read the text, not the color.

4. **Priority & Fallback Strategy:**
   - **Priority 1**: Let CodeRabbit perform its single review pass.
   - **Priority 2 (Rate Limit / Quota Exceeded)**: If a usage-limit comment says the review limit has been reached, do NOT wait. Go to Step 2B — reuse path first (Station IV's review evidence + delta check); the full subagent fallback only if reuse does not apply.
   - **Priority 3 (No Stall)**: Never stall development on third-party quotas.

5. **Countdown Polling Schedule (5m → 4m → 3m → 2m → 1m):**
   - Use the non-blocking `schedule` tool (or non-blocking background timers in agent environments) instead of long blocking shell sleeps.
   - **HARD RULE — never shorten the waits.** The first wait is a **minimum of 5 minutes**; never substitute 30s/60s/"quick check" timers. Reviews typically take 2–5 minutes to appear; do not decompose the 5-minute wait into short timers.
     - **Check 1**: After **5 minutes** (300s).
     - **Check 2**: If not finished, wait **4 minutes** (240s).
     - **Check 3**: If not finished, wait **3 minutes** (180s).
     - **Check 4**: If not finished, wait **2 minutes** (120s).
     - **Check 5+**: If not finished, poll **every 1 minute** (60s) (up to ~16-18 mins total timeout).
   - *If other open PRs exist with actionable feedback, pipeline and work on them during these windows.*

6. **Completion Inspection (classify honestly — never invent a clean pass):**
   - Check review state:
     ```bash
     gh pr view <pr-number> --json comments,reviews,statusCheckRollup,title
     ```
   - Classify into exactly one status and carry it into all reports:
     - `COMPLETED` — summary review and/or inline findings posted. Proceed to Step 2.
     - `IN_PROGRESS_STUCK` — only the "Currently processing new changes..." placeholder exists, zero inline comments, zero reviews, and the `CodeRabbit` check is still `PENDING` after the countdown (as in PR #244). NOT a clean pass — the review never finished.
      - `RATE_LIMITED / SKIPPED` — usage-limit text (`## Review limit reached`, `rate limited by coderabbit.ai`, `Next included review available in N minutes`, `Review skipped`) or a false rejection like `Pull request is closed` on an open PR. Also NOT a clean pass.
     - If rate limit reached or review timed out (>16 mins): fallback immediately to **Step 2B (Agent Fallback Review)** and keep the stuck status for the chat report.
     - When finished (`COMPLETED`): proceed immediately to Step 2.

---

