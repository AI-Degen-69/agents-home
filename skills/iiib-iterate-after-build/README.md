# iiib-iterate-after-build — Station IIIB (Iterate After Build)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

The human-feedback fix loop between build and review. The operator
describes corrections in free text; this station classifies each item,
routes it to the right specialist, fixes locally — no push, no PR.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).
> Routing matrix: [`references/routing.md`](./references/routing.md) ·
> Dead-button checklist: [`references/click-path-audit.md`](./references/click-path-audit.md).

## Pipeline position

- **Station:** IIIB of VI (feedback loop, not on the straight path).
- **Previous:** `iii-build-plan` (Build).
- **Next:** `iv-review-build-and-pr` (Review & Verify) — once the build is clean.

## When to use / when not

| Use when | Don't use when |
|---|---|
| Operator lists corrections after a fresh build | Build just finished with no corrections → `iv-review-build-and-pr` |
| Bug / dead button / UI tweak / slowness / security concern in new code | Code already pushed / PR open → corrections go through `v-babysit-pr-and-merge` |
| Unclear which specialist owns the fix | Starting new work from an issue → `ii-plan-issue` |

## How it works (short)

1. Splits the operator message into items; one line each: "Item N → Lane
   X because [observable reason]". The operator never picks a skill.
2. Lanes: bug/error → `diagnosing-bugs` + `debugging-and-error-recovery`;
   dead button → click-path checklist; UI/mobile → `frontend-ui-engineering`;
   slow → `performance-optimization`; auth/secrets → `security-and-hardening`.
3. Per item: reproduce → name the root cause → minimal fix → simplify →
   local commit (never push) → verify (browser check for UI, targeted
   tests for logic). Red verification stops the loop until green.
4. Loops until the operator reports clean, then hands off to Station IV.
   Reports what's fixed (product location + before/now) — see the report template in `SKILL.md`.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (classification, fix loop, guardrails, output contract). |
| `references/routing.md` | Correction-type → specialist-skill matrix. |
| `references/click-path-audit.md` | Dead-button diagnosis checklist. |
| `evals/evals.json` | Eval set for the station. |

## Quality bar

Every reported item is fixed, verified, and committed locally; nothing
outside the reported items is touched; nothing is pushed — Station IV
remains the only station that pushes.

## Example

```bash
/iiib-iterate-after-build the save button does nothing and the title is off-center on mobile
# → item 1 → dead-button lane, item 2 → UI lane; fixes locally, verifies,
#   loops until clean, hands off to /iv-review-build-and-pr
```
