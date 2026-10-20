# CodeRabbit Interaction, Polling & Classification (`iv-review-build-and-pr` Step 5)

Detailed reference for PR title handling, rate-limit pre-checks, trigger acknowledgement polling, bot reply classification, and jump link extraction.

## 1. PR Title Replacement

CodeRabbit's effective configuration (`reviews.auto_title_placeholder` plus `reviews.auto_title_instructions`, configured in online account/org settings or repository configuration) detects `@coderabbitai` and generates the final PR title according to title instructions. Conventional-Commits types (`feat:`, `fix:`) belong to commit messages only — never write one into a PR title.

After creating the PR, verify the title was replaced:
```bash
gh pr view <pr_number> --json title
```
If the title is still exactly `@coderabbitai`, note in the handoff that CodeRabbit did not replace the placeholder (this may happen if settings are disabled or misconfigured). Never fall back to an invented hand-written title.

## 2. Allowance Pre-check (Plan-Gated)

`@coderabbitai rate limit` reports remaining review allowance and when the next review frees up **without consuming a review**. Post it only when quota is thin — but note this is a **chat-gated command**: on the Free plan it is refused with the "upgrade to CodeRabbit Essentials" notice, which is its own outcome, **never** "zero allowance". On Free, skip the comment entirely and read the allowance from the trigger acknowledgement.

```bash
gh pr comment <pr_number> --body "@coderabbitai rate limit"   # Free: declines — skip it
```

- **Allowance available (or probe skipped/unavailable):** post the trigger and run the 10-second acknowledgement wait.
- **Zero allowance reported:** do not post the trigger and do not run the ack wait. Report rate-limited status with reported minutes and stop.

## 3. Trigger & Ack Polling

Immediately post the review trigger comment:
```bash
gh pr comment <pr_number> --body "@coderabbitai review"
```

### Ack polling one-liners (10s wait, matches real rate-limit header):
**PowerShell:**
```powershell
Start-Sleep -Seconds 10; gh pr view <pr_number> --comments 2>&1 | Select-String "Action performed|Review triggered|Review limit reached|Next included review available|rate limited by coderabbit" | Select-Object -Last 6
```

**Bash fallback:**
```bash
sleep 10; gh pr view <pr_number> --comments 2>&1 | grep -iE "Action performed|Review triggered|Review limit reached|Next included review available|rate limited by coderabbit" | tail -6
```

## 4. Reply Classification Rules

Read CodeRabbit's reply by content, not by a single jq grab. One trigger typically produces two bot comments: (1) a run-status comment that may open with `## Review skipped` / "Auto reviews are disabled", and (2) the action reply carrying `Action performed` → `Review triggered.`. Classify from the full reply:

- `Review triggered.` ("Action performed" reply) — review started. Proceed to handoff.
- **Summary-only review:** acknowledgement with high-level summary and **no inline findings** (standard on private repos on Free plan). Not a pass and not a quality signal: hand off stating CodeRabbit produced no inline findings and verification rests on local gates.
- **Rate-limit reply (`## Review limit reached` / `rate limited by coderabbit.ai` / `Next included review available in N minutes`):** review NOT started. Record reported minutes in handoff report.
- **Any other refusal/skip notice (e.g. "does not re-review already reviewed commits", or Free-plan upgrade notice):** record verbatim.
- **`## Review skipped` / "Auto reviews are disabled on this repository":** repo configuration notice, not a refusal. Manual `@coderabbitai review` still runs as incremental review; locate `Action performed` → `Review triggered.` and classify as *review started*.
- **`## Review skipped: manual review required for this OSS repository`:** Open-Source public repo plan: check passes but yields no inline findings; `gh pr view --json reviews` stays at 0. Classify at once as *CodeRabbit skipped (OSS: manual review required on this public repo) — verification rests on local gates*.
- **No reply within ~10s:** report `trigger acknowledgement not received` honestly; do not claim review started.

## 5. Comment Links Extraction

Whenever the ack is anything other than `Review triggered.`, post direct jump links in the handoff report. Pull the `html_url` of each comment via the API:

```bash
gh api repos/:owner/:repo/issues/<pr_number>/comments --jq '.[] | select(.body | contains("@coderabbitai review")) | {trigger: .html_url}'
gh api repos/:owner/:repo/issues/<pr_number>/comments --jq '[.[] | select(.user.login | test("coderabbitai"))] | last | {reply: .html_url, body: .body[0:300]}'
```

**Note:** The bot's GitHub login is `coderabbitai[bot]`, not `coderabbitai`. Match with `.user.login | test("coderabbitai")` (substring test), never exact equality.
