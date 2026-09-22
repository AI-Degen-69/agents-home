---
name: ecc-antigravity
description: Install and initialize ECC into a project for Google Antigravity (./.agents/) — stack detection, dry-run plan, approval-gated apply. Use when the user wants ECC rules, workflows, skills, or agents in an Antigravity project, or asks to set up, update, or repair ECC for Antigravity.
---

# ECC Antigravity — per-project install (`ecc-antigravity`)

Brings ECC into an Antigravity project the way project-init does for Claude:
detect the stack, show a dry-run plan, apply only after approval. The install
root is `./.agents/` (rules, workflows, skills, agents).

Run as `/ecc-antigravity`.

## Safety rules

1. Default to dry-run. Do not write under `./.agents/` until the user approves
   the concrete plan.
2. Preserve existing project guidance. If `./.agents/` (or a legacy `./.agent/`)
   already exists, inspect it and propose a merge/append plan instead of
   overwriting.
3. Use ECC's installer and manifest tooling. Do not hand-copy files.
4. Keep permissions narrow. Generated settings match detected build/test/lint
   tools; no broad shell access.
5. Report exactly what would change before applying anything.

## Detection inputs

Read the project root for stack signals:

- package manager files: `package.json`, lockfiles
- language manifests: `pyproject.toml`, `requirements.txt`, `go.mod`,
  `Cargo.toml`, `pom.xml`, `build.gradle`, `build.gradle.kts`
- framework files: `next.config.*`, `vite.config.*`, `tailwind.config.*`,
  `Dockerfile`, `docker-compose.yml`
- ECC config: `ecc-install.json`
- optional stack map: `config/project-stack-mappings.json` in the ECC repo

## Install flow

ECC source lives at `~/Agents/Tools/ECC`; run the scripts from there.

1. Resolve the plan:
   `node scripts/install-plan.js --target antigravity --json`
   (add `--config ecc-install.json`, `--profile <name>`, or
   `--skills <ids>` when the user names them).
2. Dry-run the apply:
   `node scripts/install-apply.js --target antigravity --dry-run --json [...]`
   with the same selectors.
3. Summarize: detected stacks with evidence, selected modules/components/skills,
   target paths under `./.agents/`, skipped unsupported items, files that would
   change.
4. Ask for approval, then run the apply command without `--dry-run`.

## Legacy layout

A stale `./.agent/` directory (old layout) next to a current `./.agents/` is
superseded — delete the legacy directory rather than repairing it back to life.
See [`ecc-maintain`](../ecc-maintain/SKILL.md) for the drift policy and the
doctor workflow.

## Output contract

Return:

1. detected stack evidence
2. proposed plan (modules/components/skills, target paths)
3. exact dry-run command used
4. exact apply command to run after approval
5. files/directories that would be created or changed
6. warnings about existing files, legacy layout, broad permissions, or
   unsupported items

## Related

- [`ecc-maintain`](../ecc-maintain/SKILL.md) — home targets (Hermes, OpenCode),
  doctor, drift policy
- `/project-init` — the generic ECC onboarding flow this skill follows for
  Antigravity
