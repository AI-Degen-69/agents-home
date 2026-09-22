---
name: ecc-maintain
description: Update, audit, and safely repair the home-scoped ECC installs for Hermes and OpenCode. Use when the user wants to update ECC, check whether an install has drifted, fix a broken or partial install, or asks "is ECC healthy", "update ECC", "run ecc doctor", or "/ecc-maintain".
---

# ECC maintenance for home-scoped harnesses

Hermes and OpenCode are `managed-home` targets: one install covers every project, so
there is no per-project variant. This skill covers keeping them current and healthy.

| Target | Root | Install mode |
|---|---|---|
| `hermes-home` | `C:\Users\Tiger\.hermes` | `managed-home` |
| `opencode-home` | `C:\Users\Tiger\.config\opencode` | `managed-home` |

Freebuff is **not an ECC target** — it does not appear in the installer's target list and
has no skill system of its own (`~/.config/manicode/`, `~/.freebuff/desktop-v2.db`). There
is nothing to install or maintain for it.

## Audit

Always start here. It is read-only.

```powershell
node "$env:USERPROFILE\Agents\Tools\ECC\scripts\ecc.js" doctor
```

```powershell
node "$env:USERPROFILE\Agents\Tools\ECC\scripts\ecc.js" list-installed
```

`doctor` reports one block per target. Interpret the statuses:

- `OK` — nothing to do.
- `repo-version-mismatch` — the recorded version is older than the repo. Fix by updating
  the repo, then repairing (see below).
- `drifted-managed-files: N managed file(s) differ from the source repo` — N files were
  edited after install. **This is not automatically a problem.** Some drift is deliberate.

## Updating the repo

The ECC source lives at `~/Agents/Tools/ECC` and is npm-linked as `ecc-universal`, so
pulling updates every target's source of truth at once.

```powershell
cd "$env:USERPROFILE\Agents\Tools\ECC"; git fetch origin; git status --short
```

If `package-lock.json` or `yarn.lock` show as modified, they are generated files and can
be discarded with `git checkout -- package-lock.json yarn.lock`. Back them up to the
scratchpad first if the user wants a way back. Then:

```powershell
cd "$env:USERPROFILE\Agents\Tools\ECC"; git merge --ff-only origin/main; Get-Content VERSION
```

If the OpenCode target is installed, rebuild its plugin payload after pulling — the
installer refuses to run without it:

```powershell
cd "$env:USERPROFILE\Agents\Tools\ECC"; node scripts/build-opencode.js
```

## Repairing — check before you run it

`ecc repair` restores ECC-managed files to their source-repo contents. It will silently
revert deliberate user customizations, so never run it blind.

```powershell
node "$env:USERPROFILE\Agents\Tools\ECC\scripts\ecc.js" --dry-run repair
```

Read the `Repaired paths: N` line per target.

- `N = 0` — safe.
- `N > 0` — identify what those files are before proceeding. If any of them is something
  the user deliberately changed, **do not repair that target**. Say which files would be
  lost and let the user decide.

Note that `--dry-run` does not reliably suppress writes in ECC 2.2.1, so verify the
filesystem afterwards rather than trusting the flag.

## Drift policy — newest install wins

The most recent install is the source of truth. When ECC overwrites a file during an
install, that is the intended outcome, not damage to undo. Do not restore older
user-authored versions of ECC-managed files, and do not keep `<name>-ecc` split copies
created to survive an earlier collision. Let the current repo contents stand and let
`doctor` report `OK`.

`opencode-home` (installed 2026-09-04) is the reference case. Its
`skills/git-workflow/SKILL.md` had been kept as Tiger's own ~116-line version; the
2026-09-04 install replaced it with ECC's 716-line version, and on 2026-09-06 that
outcome was confirmed as correct. The `git-workflow-ecc/` duplicate directory that
existed only to hold ECC's copy was deleted at the same time. Tiger's own git convention
still lives at `~/.claude/skills/git-workflow/SKILL.md` and is referenced from the global
`CLAUDE.md`; that copy is not ECC-managed and is unaffected.

`hermes-home` (installed 2026-08-23) was brought in line on 2026-09-06 and now reports
`OK`. Its `AGENTS.md` had been Tiger's own documentation of the Hermes runtime home,
which was accurate rather than stale, so it was renamed to `~/.hermes/HERMES-RUNTIME.md`
instead of being deleted, and ECC's `AGENTS.md` was installed at the managed path. The
`AGENTS.ecc.md` and `README.ecc.md` duplicate copies were removed at the same time.

Note that ECC's `AGENTS.md` describes the ECC repo itself, so inside a runtime home like
`~/.hermes` it is not useful orientation. `HERMES-RUNTIME.md` is the file to read there,
and `STACK.md` links to it so agents still find it.

## Where user documentation belongs

Never keep user-authored documentation under a filename ECC manages. `AGENTS.md` and
`README.md` are ECC-managed at every install root and are overwritten on every install,
so anything written there is lost without warning. Check membership before writing:

```powershell
node -e "const s=require('C:/Users/Tiger/.hermes/ecc-install-state.json');console.log(s.operations.some(o=>(o.destinationPath||'').endsWith('AGENTS.md')))"
```

In `~/.hermes` the unmanaged files are `STACK.md`, `SOUL.md`, `HERMES-RUNTIME.md` and
`config.yaml`; that is where durable notes go. When an install overwrites something that
turns out to be genuinely correct documentation, rename it out of the managed path and
link to it from an unmanaged file, rather than deleting it or accepting permanent drift.
That keeps `doctor` clean without losing verified information.

## Legacy project installs

A `managed-project` install is invisible to `doctor` unless the cwd is that project, so
running `doctor` from a neutral directory reports only the `managed-home` targets. Check
project roots separately.

`~/Agents/Projects/spread-hunter-live` carried an abandoned `antigravity-project` install
under `.agent/` (legacy layout, repoVersion 2.2.0) reporting `legacy-antigravity-layout`,
`missing-managed-files: 189`, and `repo-version-mismatch`. It had been superseded by a
`.agents/` directory in the new layout, and was deleted outright on 2026-09-06 without
backup, which cleared the report's only error.

When a project reports `legacy-antigravity-layout` together with a large missing-file
count, check whether `.agents/` already supersedes `.agent/`. If it does, delete the
legacy directory rather than repairing it back to life.

## Collision procedure

Superseded by the drift policy above: by default ECC's version wins and the user-authored
file is not preserved. Use this only when Tiger explicitly asks to keep both a user skill
and an ECC skill that share a name:

1. `mkdir <name>-ecc` and move ECC's `SKILL.md` into it.
2. Edit the `name:` field in that file's frontmatter to `<name>-ecc`, otherwise both load
   under the same name.
3. Restore the user's file to the original path.
4. Expect `doctor` to report drift for that target from then on, and leave it alone.

## Related

- [`ecc-antigravity`](../ecc-antigravity/SKILL.md) — per-project install for Antigravity (`./.agents`)
- ecc-claude-project — per-project install for Claude Code (`./.claude`, external / not installed in this skills root)
