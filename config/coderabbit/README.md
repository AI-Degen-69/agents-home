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

Keys from the [configuration reference](https://docs.coderabbit.ai/reference/configuration) (schema-generated, page updated 2026-09-30) that actually change outcomes. All names below are the documented ones — if a name is not here, it is not in the schema.

| Key | Default | Set this when… |
|---|---|---|
| `language` | `en-US` | reviews should read/write in another language |
| `tone_instructions` | `""` (max 250 chars) | you want a different review voice — rare |
| `reviews.profile` | `chill` | you want `quiet` (only the most important feedback) or `assertive` (more, possibly nitpicky) |
| `reviews.request_changes_workflow` | `false` | you deliberately want the approval path: auto-approve once comments are resolved, the latest commit is reviewed, and no pre-merge checks fail. It is also what lets `@coderabbitai approve` actually submit approval and `error`-level checks block a PR — read both effects before enabling |
| `reviews.allow_author_approval` | `true` | you want to stop PR authors using `approve`/`resolve` on their own PRs. Note: it cannot be re-enabled from branch config |
| `reviews.high_level_summary` | `true` | you want to change summary behavior; `reviews.high_level_summary_placeholder` (default `@coderabbitai summary`) is the PR-description placeholder it replaces |
| `reviews.auto_title_placeholder` | `@coderabbitai` | you want CodeRabbit to write the PR title: putting this keyword in the title triggers it. **Documented name is `auto_title_placeholder`** — older material says `auto_title_keyword`; that key does not exist in the current schema |
| `reviews.auto_title_instructions` | `""` | you want to control how the auto-generated title reads (this home's TAG vocabulary lives here) |
| `reviews.path_filters` | `[]` | you want files excluded from review — patterns also apply to the clone (sparse-checkout), so reviews get cheaper, not just cleaner |
| `reviews.path_instructions` | `[]` | path-scoped review guidance (`{path, instructions}`) — e.g. skill-authoring rules for `skills/**/*.md`. Do **not** put guideline filenames here (see below) |
| `reviews.auto_review.enabled` | `true` | you want to control automatic reviews: `.auto_incremental_review` (`true`), `.auto_pause_after_reviewed_commits` (`5`), `.drafts` (`false`), `.ignore_title_keywords` (`[]`), `.labels` (`[]`, positive/negative), `.base_branches` (`[]`), `.description_keyword` (`""`, the trigger when reviews are disabled) |
| `reviews.pre_merge_checks.*` | all modes `warning` | you want enforcement levels changed: `off` / `warning` / `error`, where "`error` requires resolution before merging. If the request-changes workflow is enabled, `error` can block the PR until the check passes". Covers `title`, `description`, `docstrings` (threshold 80), `issue_assessment`, `custom_checks`, and `override_requested_reviewers_only`. Built-in Pre-Merge Checks are documented as Essentials+ |
| `reviews.finishing_touches.*` | docstrings `true` · unit_tests `true` · simplify `false` · autofix `true` · fix_ci `true` · resolve_merge_conflict `true` | you want a finishing touch off (or know its plan gate): docstrings & autofix = Essentials+, fix_ci / unit_tests / merge-conflict = Team+. Custom recipes are plan-capped |
| `reviews.tools.*` | most tools `true` | a tool needs a `config_file` (ruff, eslint, golangci-lint, semgrep, …) or a specific analyzer should be off. Linter/SAST support is documented at Essentials+ |
| `knowledge_base.code_guidelines.enabled` | `true` | you want guidelines off entirely (set `false`) |
| `knowledge_base.code_guidelines.filePatterns` | `[]` | guidelines live outside the auto-detected set. `**/AGENTS.md`, `**/CLAUDE.md`, `**/.cursorrules`, `**/.gemini.md`, `**/.windsurfrules`, `**/.clinerules/*`, `**/.rules/*`, `**/AGENT.md` (case-sensitive) are detected automatically and scoped to their directory tree. Custom entries supplement the defaults; `[]` keeps them active. Entries can be a glob, a `{files, applyTo}` object, or source from another repo (`repo:path`). Knowledge base is documented at Essentials+ and is not available on self-hosted |
| `knowledge_base.opt_out` | `false` | you want to disable knowledge-base data retention |
| `remote_config` | unset | this repo should delegate to a shared config file: `{repository, ref, path}` (same owner/org, CodeRabbit must be able to read it) or a publicly reachable `{url}` (retrieved unauthenticated, 5s timeout — not recommended) |

**Precedence (how values actually win).** Configuration sources do not merge by default — the highest-priority source wins, unless inheritance is enabled. Order, highest first: workspace global overrides → organization global overrides → repository file → central `coderabbit` repository → repository UI → organization UI → workspace UI → schema defaults. Global overrides are applied last and win everywhere. `@coderabbitai configuration` prints the resolved values annotated with the source of each one — run it before blaming a setting.

## Set / do not set

The operator's decision list. "Set" assumes the plan gate is satisfied or the key is commented with its requirement.

**Set in the committed YAML:**

- `reviews.auto_title_placeholder` + `reviews.auto_title_instructions` — hand title-writing to CodeRabbit with the TAG vocabulary it should produce
- `reviews.path_filters` — exclude generated and low-signal trees (in this repo: the Playwright capture dir and eval trees — confirm against the actual tree before committing), which also shrinks the clone
- `reviews.pre_merge_checks.title.mode` — pick honestly: `warning` while the account cannot enforce (Free), `error` + `request_changes_workflow` only if merge blocking is genuinely wanted (Essentials+)
- `reviews.path_instructions` — path-scoped rules such as skill-authoring guidance for `skills/**/*.md` (visible to CodeRabbit regardless of tier; enforcement features are gated)
- `knowledge_base.code_guidelines.filePatterns` — only for patterns beyond the auto-detected guideline files (AGENTS.md is already covered by default)
- `language` / `reviews.profile` — only to pin a non-default choice

**Do not set:**

- Dead plan-gated knobs on this tier (enforceable pre-merge checks, knowledge base features, autofix, docstrings, unit tests, custom recipes) as working config — comment them with their plan requirement instead of committing silent no-ops
- Analyzers and linters for languages this repo does not contain — noise and slower reviews
- `remote_config.url` — publicly reachable and unauthenticated; use the repository form or central configuration
- Guideline filenames inside `reviews.path_instructions` — that makes CodeRabbit review those files as changed code instead of applying them as guidelines; use `knowledge_base.code_guidelines.filePatterns` or rely on auto-detection
- UI-only settings in YAML — if it is not in the schema, it does not belong in the file
- `reviews.allow_author_approval: false` unless intended — it cannot be undone from branch config

## Distribution options

How a repository receives its configuration, and what each route costs.

| Mechanism | What it is | Trade-offs |
|---|---|---|
| Repository file | `.coderabbit.yaml` in the repo root — recommended | Versioned, reviewed like code. **The config in the PR's own feature branch is the one used for that PR**, so config changes are testable on the PR that carries them |
| TypeScript config | `.coderabbit.config.ts` in the repo root | Programmatic, type-checked, composable fragments (`includeRemote` can pull from the central repo); a committed YAML always wins over it |
| Central repository | A `coderabbit` repo in the organization holding `.coderabbit.yaml` | Org-wide defaults for repos without their own file; CodeRabbit must be installed on the central repo; repo files override central; GitLab resolves the closest `coderabbit` repo in the group hierarchy |
| `remote_config` | This repo's file delegates to a shared file: `{repository, ref, path}` | Same owner/org only; a URL form exists but is public and unauthenticated (not recommended). Useful when a repo should not carry the full config inline |
| UI layers | Repository / organization / workspace settings, plus global overrides | No merge by default (enable inheritance to merge); global overrides outrank every file. Sources appear in the resolved-config output |

**This home today:** `scripts/sync-coderabbit.ps1` physically copies the canonical `config/coderabbit/.coderabbit.yaml` into the known repos, skipping any repo whose file differs from canonical (those merge the shared blocks by hand). The skip is deliberate protection, but every key canonical gains widens the hand-merge gap for diverged repos.

## Verification recipes

Copy-pasteable `gh` one-liners for the four probes: resolved config, remaining allowance, plan-gated command response, and auto-title behavior.
