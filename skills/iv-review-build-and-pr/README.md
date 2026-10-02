# iv-review-build-and-pr — Station IV (Review, Verify & Ship)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Multi-axis review, fix application, final verification, push, and PR —
with an honest one-line CodeRabbit ack status. The only station that pushes.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).
> OCR delegation: [`references/ocr-delegation.md`](./references/ocr-delegation.md).

## Pipeline position

- **Station:** IV of VI.
- **Previous:** `iii-build-plan` (Build) — or `iiib-iterate-after-build` when corrections ran.
- **Next:** `v-babysit-pr-and-merge` (Babysit & Merge).

## When to use / when not

| Use when | Don't use when |
|---|---|
| Fresh build is done and needs review + shipping | Build has known operator-reported bugs → `iiib-iterate-after-build` first |
| Feature branch with unpushed commits, no PR yet | PR already open with review comments → `v-babysit-pr-and-merge` |
| Re-entering after IIIB went green | Nothing built yet → `iii-build-plan` |

## How it works (short)

1. **Proof-before-review gate first** — browser gate for UI
   (`playwright-cli` **only** — no other browser tool, see Step 0.1;
   DevTools MCP for profiling only) or targeted tests for backend. Failure
   routes back to IIIB; broken code is never reviewed. Tooling that can't
   verify yields an *unverified* gate, not a red one — see Step 0.1.
2. **OCR delegation review**, then language/framework specialist
   reviewers (plus the Spec axis: diff vs issue + `tasks/plan.md`).
   Fixes applied as local commits; clean reviewers get one line.
3. **Final verification gate**, then push + open the PR
   (`@coderabbitai summary`, review trigger), with comment links whenever
   the ack is anything but `Review triggered.`
4. Hands off to Station V. Reports what the review changed (grouped by tag) + branch + PR link + honest CodeRabbit status — see the report template in
   `SKILL.md`. Tests are an internal gate, never mentioned in the report.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (gates, review protocol, push + PR, Hebrew output contract). |
| `references/ocr-delegation.md` | OCR delegation procedure, embedded from the upstream `open-code-review-delegate` skill (flags, file scope, host-agent review, gotchas). |
| `evals/` | Eval set + pre-workbench snapshot. |

## Quality bar

The PR ships only proven-green code; every reviewer that ran is
accounted for in one line each; the handoff states the CodeRabbit
trigger status honestly (started / rate-limited / other / no ack).

## Example

```bash
/iv-review-build-and-pr
# → proves the build, runs reviewers, fixes, verifies, pushes,
#   opens the PR with summary + review trigger, hands off to babysit
```
