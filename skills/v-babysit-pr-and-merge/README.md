# v-babysit-pr-and-merge — Station V (Babysit PR & Merge)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Sits on the PR through one focused CodeRabbit review round (or agent
fallback), triages every comment ACCEPT/REJECT, then squash-merges on
green CI. Zero human in the loop.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).
> Multi-PR order: [`references/multi-pr-pipelining.md`](./references/multi-pr-pipelining.md).

## Pipeline position

- **Station:** V of VI.
- **Previous:** `iv-review-build-and-pr` (Review & Ship).
- **Next:** `vi-close-pipeline` (Close Pipeline).

## When to use / when not

| Use when | Don't use when |
|---|---|
| PR just opened and needs review tracking to merge | No PR yet — unpushed branch → `iv-review-build-and-pr` first |
| Review comments arrived on an open PR | Review was never triggered and no PR exists → Station IV opens it |
| Confirming zero unhandled blocking feedback before merge | Work already merged → `vi-close-pipeline` |

## How it works (short)

1. Ensures the PR exists (delegates opening to Station IV if needed),
   auto-triggers `@coderabbitai review` when auto-review skipped.
2. Waits on the deterministic **5m → 4m → 3m → 2m → 1m** countdown;
   on quota-limit falls back to the agent review path. A summary-only
   review (zero inline findings — the expected shape on a private Free
   repo) is `SUMMARY_ONLY`, never a clean pass: it routes to the
   Station IV evidence + delta-check reuse path.
3. Extracts comments, triages **ACCEPT** (Type A/B fixes) vs **REJECT**
   (with reasoned reply + thread resolve) — exactly one focused round,
   one batch commit + push.
4. Posts `@coderabbitai resolve` to close the review loop (reporting
   resolved / declined / no reply, or "not applicable" when there are no
   threads), probes `@coderabbitai configuration` first when a review
   contradicts the committed config, then merges (squash) on green CI and
   resets the local checkout to base. Reports
   triage + what was fixed (product location per item) in Hebrew — see the contracts in `SKILL.md`.
   Never claims a clean pass when the review never finished.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (countdown, triage, merge rules, Hebrew output contracts). |
| `references/review-loop.md` | Step 0 ship handshake + Step 1 review trigger and countdown. |
| `references/triage-and-apply.md` | Step 2 extraction/triage, Step 2B fallback review, Step 3 late rejections, Step 4 code application and thread replies. |
| `references/merge-and-reset.md` | Step 5 CI gate and merge, Step 5b post-merge local reset. |
| `references/multi-pr-pipelining.md` | Priority order + pipelining rules for multiple open PRs. |
| `evals/evals.json` | Eval set for the station. |

## Quality bar

One review round, every thread resolved with a reason, targeted tests
green after fixes, merge only on green CI (stuck-CodeRabbit context
excluded by rule) — and the checkout ends back on base.

## Example

```bash
/v-babysit-pr-and-merge 123
# → tracks PR #123 through review, triages comments, applies fixes,
#   squash-merges on green, hands off to /vi-close-pipeline
```
