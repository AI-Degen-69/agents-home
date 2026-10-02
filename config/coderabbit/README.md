# CodeRabbit playbook

Canonical knowledge for how CodeRabbit is configured, commanded, and verified here and in the repos it reviews. Companion to [`config/coderabbit/.coderabbit.yaml`](.coderabbit.yaml) — read this before editing that file. Everything below is grounded in the vendor docs fetched on **2026-10-02**; where the docs conflict with themselves, it is marked unresolved with a probe instead of being picked silently.

**Sources (verified 2026-10-02 against docs.coderabbit.ai):**

- [Configuration reference](https://docs.coderabbit.ai/reference/configuration) — schema-generated; page last updated 2026-09-30
- [Review commands reference](https://docs.coderabbit.ai/reference/review-commands)
- [Plans and feature limits](https://docs.coderabbit.ai/management/plans)
- [Configuration overview](https://docs.coderabbit.ai/guides/configuration-overview) · [Central configuration](https://docs.coderabbit.ai/configuration/central-configuration) · [YAML configuration](https://docs.coderabbit.ai/getting-started/yaml-configuration)
- [Code guidelines](https://docs.coderabbit.ai/knowledge-base/code-guidelines) · [Issue Planner](https://docs.coderabbit.ai/issues/planner)

**Operator tier: Free** — verified by CodeRabbit's own refusal of the `@coderabbitai plan` request on issue #5 ("The author of this PR is on the CodeRabbit Free Plan…"). Read every plan-gated row below through that lens. Note that new organizations start on a 14-day Advanced trial, so behavior can change when the trial ends.

## Command table

Every command from the vendor's [review-commands reference](https://docs.coderabbit.ai/reference/review-commands), plus `@coderabbitai plan` from the [Issue Planner](https://docs.coderabbit.ai/issues/planner). Commands post as `@coderabbitai` (service-account handle varies by platform). "Where to post" is strict: several commands silently do nothing from the wrong place.

| Command | What it does | Where to post | Plan requirement / config gate |
|---|---|---|---|
| `@coderabbitai review` | Incremental review — new changes only, comments on what changed since the last pass | PR comment | Uses 1 PR review from the allowance. Free-tier caveat: see the note below the plan-gating table |
| `@coderabbitai full review` | Complete review of all files from scratch | PR comment | Uses 1 PR review from the allowance |
| `@coderabbitai pause` | Temporarily stops automatic reviews | PR comment | — |
| `@coderabbitai resume` | Restarts automatic reviews after a pause | PR comment | — |
| `@coderabbitai ignore` | Permanently disables automatic reviews for this PR | **PR description only** — not comments; remove the text to re-enable | — |
| `@coderabbitai summary` | Not a command — a placeholder in the PR description replaced by the high-level summary | **PR description** (placeholder; customizable via `reviews.high_level_summary_placeholder`) | — |
| `@coderabbitai generate docstrings` | Generates/improves docstrings for changed functions and opens a follow-up PR | PR comment | Essentials+; requires `reviews.finishing_touches.docstrings.enabled` (default true) |
| `@coderabbitai generate unit tests` | Generates unit tests for the PR's changes | PR comment | **Team+**; requires `reviews.finishing_touches.unit_tests.enabled` (default true) |
| `@coderabbitai autofix` | Applies fixes for unresolved review findings; a reply inside a thread limits the fix to that thread | PR comment (or inline reply) | Essentials+ (`reviews.finishing_touches.autofix.enabled`, default true). Stops on merge conflicts |
| `@coderabbitai autofix stacked pr` | Same, but delivers the fixes on a stacked PR | PR comment | Essentials+ |
| `@coderabbitai local commit` | Commits the most recent CodeRabbit-prepared change | Reply to the CodeRabbit-authored comment carrying the payload (GitHub uses the Commit checkbox instead) | Follows a prepared-change feature (Autofix/Simplify) |
| `@coderabbitai fix-ci` | Investigates failing CI and delivers fixes as a stacked PR; `fix-ci commit` commits directly | PR comment | **Team+**; `reviews.finishing_touches.fix_ci.enabled` (default true); GitHub and Azure DevOps |
| `@coderabbitai generate sequence diagram` | Creates a sequence diagram of the PR's changes | PR comment | — |
| `@coderabbitai approve` | Resolves all unresolved CodeRabbit threads, then attempts approval | **New top-level PR comment** — not supported in thread replies | Submits an approval only when `reviews.request_changes_workflow` is enabled; otherwise it resolves threads and reports approval disabled. Author usage governed by `reviews.allow_author_approval` |
| `@coderabbitai resolve` | Marks all CodeRabbit review comments as resolved | **New top-level PR comment** — not supported in thread/inline replies | — |
| `@coderabbitai rate limit` | Remaining PR review allowance and when the next review frees up — **does not consume a review** | PR comment | — |
| `@coderabbitai configuration` | Prints the fully resolved config annotated with the source of every value | PR comment | — |
| `@coderabbitai generate configuration` | Opens a PR that adds the current resolved config as `.coderabbit.yaml` | PR comment | — |
| `@coderabbitai emit path instructions` | Merges up to 7 days of path-instruction suggestions into `reviews.path_instructions` and opens a PR | PR comment | Needs a platform that can open PRs |
| `@coderabbitai generate project vocabulary` | Lists up to 50 project-specific terms with their spellings | PR comment | — |
| `@coderabbitai help` | Quick reference of available commands | PR comment | — |
| `@coderabbitai configuration override` | Adjusts a small set of settings for one PR only | **PR description**: the plain-text line immediately followed by a fenced YAML block (line outside the fence) | Accepts only `reviews.review_details` and `knowledge_base.code_guidelines.filePatterns`; guidelines from fork PRs are rejected |
| `@coderabbitai plan` | Generates a Coding Plan for an issue (posted back as an issue comment on GitHub/GitLab; 5–10 min) | **Issue comment** on any issue | **Team+** (issue planning). On Free it returns a refusal — observed on agents-home #5 |

## Plan-gating table

Per the [plans page](https://docs.coderabbit.ai/management/plans) and per-command notes above. "—" means the docs do not gate it; it still needs a working account.

| Capability | Free | Essentials | Team | Advanced / Enterprise |
|---|---|---|---|---|
| AI code review on PRs | Summarization only per the plan description — **contradicted by the rate table**, see below | Included | Included | Included |
| Rate limits (per developer/hour) | 3 PR reviews · 3 files/review | 5 | 8 | Advanced 10 / Enterprise 12 |
| Autofix | — | Included | Included | Included |
| Docstrings | — | Included | Included | Included |
| Built-in Pre-Merge Checks | — | Included | Included | Included |
| Knowledge base (incl. code guidelines) | — | Included | Included | Included |
| Linter and SAST tool support (`reviews.tools.*`) | — | Included | Included | Included |
| MCP server connections | — | 5 | 10 | Advanced 15 / Enterprise 20 |
| Issue planning (`@coderabbitai plan`) | Refused (observed) | — | Included | Included |
| CI fixer (`fix-ci`) | — | — | Included | Included |
| Unit test generation | — | — | Included | Included |
| Merge-conflict resolution | — | — | Included | Included |
| Triage | — | — | Included | Included |
| Change Stack core experience | — | Included | Included | Included |
| Change Stack AI chat / coding-agent tasks | — | — | Included | Included |
| Custom Finishing Touch recipes | 0 | 0 (public non-trial repos: exception up to 10) | 10 | Advanced 20 / Enterprise 20 |
| Custom Pre-Merge Checks | 0 | 0 (public non-trial repos: exception up to 10) | 10 | Advanced 20 / Enterprise 20 |
| Linked repositories (multi-repo analysis) | 0 | 1 | 5 | Advanced 10 / Enterprise 20 |
| Continuous PR security review / AI Deep Scan | — | — | — | Advanced; Deep Scan usage-based |

**The Free-tier contradiction — recorded as unresolved.** The Free plan description says "PR summarization only; code reviews are available through the VS Code extension and CLI", while the same page's rate table lists Free as 3 PR reviews/hour with 3 files/review — and this account demonstrably gets PR reviews and a `plan` refusal. Two probes settle it per repo: `@coderabbitai rate limit` (allowance truth) and `@coderabbitai configuration` (what is actually enabled). Also observed: the Chat feature refuses on Free ("upgrade to CodeRabbit Essentials"), despite Free appearing in the rate table. Do not resolve this by argument — probe it.

## Config cheat-sheet

The schema keys that actually change outcomes, with "set this when…" and the configuration precedence rules.

## Set / do not set

The deliberate decision list: which keys belong in the committed YAML, which belong in the UI, and which are noise here.

## Distribution options

How configuration reaches a repository — repo file, central repository, `remote_config`, UI layers — and how this home syncs today.

## Verification recipes

Copy-pasteable `gh` one-liners for the four probes: resolved config, remaining allowance, plan-gated command response, and auto-title behavior.
