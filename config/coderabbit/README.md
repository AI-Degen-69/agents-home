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

Every command the vendor documents, with where it must be posted and what it needs from the account.

## Plan-gating table

What each capability requires per plan, so nobody spends an hour on something that silently declines.

## Config cheat-sheet

The schema keys that actually change outcomes, with "set this when…" and the configuration precedence rules.

## Set / do not set

The deliberate decision list: which keys belong in the committed YAML, which belong in the UI, and which are noise here.

## Distribution options

How configuration reaches a repository — repo file, central repository, `remote_config`, UI layers — and how this home syncs today.

## Verification recipes

Copy-pasteable `gh` one-liners for the four probes: resolved config, remaining allowance, plan-gated command response, and auto-title behavior.
