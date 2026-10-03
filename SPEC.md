# SPEC — Issue #24: Correct the CodeRabbit playbook after PR #23

Branch: `i24/correct-the-coderabbit-playbook-pr-23-disproved-three`

> Reconciliation note: this file previously held the completed Issue #7 spec (all tasks `[x]`,
> issue closed, merged as PR #23). Issue #7 is closed and its work landed, so the spec is replaced.
> The full #7 spec remains in git history at `SPEC.md` on `main`.

## Goal

The CodeRabbit playbook records three facts about this account that live measurement on PR #23
disproved, and the committed `.coderabbit.yaml` turns out **not to govern this repository at all**.
Correct the record so the next station plans against measurements, not assumptions.

## What PR #23 measured (all read from live artifacts, not inferred)

| Claim in the playbook | Line | Measured on PR #23 | Verdict |
|---|---|---|---|
| "The private repo is the untested path… summarization-only with no inline findings" | `README.md:86` | **5 inline findings** + a full walkthrough review | **FALSE** |
| "This account is Free with OSS access" | `README.md:84` | run config reported **`Plan: Advanced`** | **FALSE for PR reviews** |
| "Chat-dependent commands are refused on this account… Expect the same for `configuration`" | `README.md:87` | `@coderabbitai configuration` **returned the full resolved config** | **FALSE** |

Evidence sources: PR #23 review-in-progress comment (run config), and the resolved-config reply
at https://github.com/AI-Degen-69/agents-home/pull/23#issuecomment-5972661199 (466 lines of YAML).

## The root cause behind the config finding — resolved, not open

The issue asked whether `reviews.*` comes from Organization UI instead of the committed file.
**It does, and the reason is concrete:**

- `config/coderabbit/README.md:119` ranks the sources: `… organization global overrides →
  **repository file** → central coderabbit repo → repository UI → **organization UI** → …`.
  A repository file therefore *outranks* organization UI — so if the file were being read, the
  resolved config would name it.
- The resolved config instead annotates both keys we care about as
  `# Source: Organization UI (base)`:
  - `auto_title_placeholder: '@coderabbitai'`
  - `auto_title_instructions: 'Title format: "[TAG] short plain-English summary"…'`
  (the TAG vocabulary is character-for-character the one in the committed file.)
- **There is no `.coderabbit.yaml` at the repository root** — `Test-Path .coderabbit.yaml` → `False`;
  `git ls-files` lists exactly one: `config/coderabbit/.coderabbit.yaml`.
- The file's own header states CodeRabbit "reads YAML only from the git repo root or a central
  coderabbit repo — never from a local path". `config/coderabbit/` is not the repo root.

**Conclusion:** on `agents-home` the committed file is **inert**. The identical values live in the
Organization UI, which is why the observed behaviour still matches. The `sync-coderabbit.ps1`
copy model has never actually applied to this repository.

## Acceptance criteria

- [ ] `README.md` no longer claims this private repo is summarization-only, that the account is on
      Free for PR reviews, or that `configuration` is chat-refused; each carries the dated PR #23
      measurement that replaced it.
- [ ] `README.md` states the precedence finding: this repo has no root `.coderabbit.yaml`, the
      committed file at `config/coderabbit/` is not read by CodeRabbit, and `reviews.*` resolves
      from Organization UI — with the implication for the sync-copy model named.
- [ ] `.coderabbit.yaml` carries no claim that the pipeline writes titles itself and no stale line
      reference; comment text only, no setting changes.
- [ ] A note records that `SUMMARY_ONLY` is a guard for the summarization-only tier, **not** this
      repo's normal shape.
- [ ] Verification command: `! grep -q 'untested path' config/coderabbit/README.md &&
      ! grep -q 'is the work of #7' config/coderabbit/.coderabbit.yaml &&
      grep -q 'PR #23' config/coderabbit/README.md && echo FACTS-CORRECTED`

## Executed baseline (2026-10-03, `C:\Users\Tiger\.agents`)

- `node skills/skill-workbench/scripts/validate.js --all` → `Validated 90 skill(s): 0 fail, 0 warn`
- `node skills/skill-workbench/scripts/score.js skills/iv-review-build-and-pr` → `overall 100/100`,
  body 234 lines; `v-babysit-pr-and-merge` and `pipeline-triage` likewise 100/100.

## Edge cases

- **Do not delete the still-valid parts.** The Free-vs-paid rate figures, the "what spends a
  review" table, and the OSS-vs-UI precedence discussion remain correct; only the three disproved
  claims change.
- **`Plan: Advanced` may describe PR review, not issue planning.** `@coderabbitai plan` was still
  refused on issues #5 and #7. Record both facts side by side rather than collapsing them into one
  "the account is Advanced" claim.
- **The config comment must not imply the file works.** Fixing the stale `#7` pointer without adding
  the "not read from this path" note would make a doubly misleading comment.

## Out of scope

- Any `.coderabbit.yaml` **setting** change (comment text only).
- Any station skill's behaviour. The `SUMMARY_ONLY` wording in the stations is conditional
  ("on a private repo on the Free plan") and stays correct as a guard — only the playbook's claim
  that this is the *expected shape here* was wrong.
- Redesigning `sync-coderabbit.ps1`; the finding is recorded, the model is not changed.
- Any change to CodeRabbit's UI, plan, or billing.