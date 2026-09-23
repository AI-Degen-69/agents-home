---
name: cleanup-user-home
description: Clean orphaned dotfiles, junk logs, and duplicate folders in a Windows home directory without breaking active tools. Use when home is cluttered with dot-dirs, history files, pid/log junk, or stale project copies and a safe survey-classify-verify-delete sweep is needed.
---

# User Home Folder Cleanup

Safe sweep for `C:\Users\<name>`-style home directories: inventory clutter, classify keep vs delete, verify activity, then delete with Windows-safe fallbacks.

## Core Objective

Deliverable: a leaner home directory with zero breakage to active tools, git repos, and live projects.

## Workflow

### 1. Snapshot First
- Record start state: counts of dot-files, dot-dirs, and top-level normal items.
- Never delete without a preview table approved by the operator.

### 2. Inventory (Three Passes)
1. **Dot single-files:** list `.*` files only (not dirs). Read tiny configs (`.npmrc`, `.gitconfig`, `.bashrc`, `.profile`) before classifying.
2. **Dot-directories:** for each, capture item-count + last-write date. Flag mass same-timestamp empty dummies (e.g. 17/09/2026 05:23 1-item folders) as script exhaust.
3. **Normal top-level items:** list files + dirs with size/date. Flag `*.pid`, `*.log`, `hook_hits.txt`, `audit*.json`, `emb*.json`, `ecc_tree.json` as junk candidates.

### 3. Classify — Keep vs Delete
**Safe to delete:**
- `*.backup`, `*.bak`, `*.tmp`, `.dev-registry.json`, `.rdev-registry.json`
- Shell histories: `.bash_history`, `.node_repl_history`, `.python_history`, `.viminfo`, `.limbo_history`
- Pid/log junk: `server.pid`, `ui.pid`, `peak-measure-*.log`, `hook_hits.txt`
- Orphan audit dumps: `audit.json`, `audit2.json`, `ecc_tree.json`, `emb1.json`, `emb2.json`
- Empty dummy dot-dirs (1 item, same mass timestamp), numeric temp floods (e.g. `Agents/.tmp.driveupload` 12k files), scratch files (`scratch_fix*.ps1`)
- Stale project copies only after live-copy verification (see step 4)

**Never touch without explicit approval:**
- `.bash_profile`, `.bashrc`, `.profile`, `.gitconfig`, `.npmrc`, `.claude.json`, `.fim-cache`
- Active knowledge bases (e.g. `Vault/` with fresh git), active task workspaces (e.g. `Cron_Workspaces/disk-cleanup/latest.*` fresh)
- Config dirs of tools still installed (git, npm, ssh, editors, CLIs) — keep anything whose tool is active

### 4. Verify Before Delete (Two Gates)
Both must hold:
1. **Not active:** last-write is old AND no fresh git activity AND no reference from live project. For duplicates: prove live copy exists (e.g. `Agents/Projects/AI Trading/crypto-spread` updated 20/09 beats `antigravity/crypto-spread` from 31/08).
2. **Zero blast radius:** search for inbound references; if ambiguous, ask operator — never guess.

Deep-dive suspicious dirs first: top-level content + counts + dates (as done for `Agents`, `Agent-Reach`, `agent`, `antigravity`, `Cron_Workspaces`, `data`, `Vault`).

### 5. Delete Windows-Safe
- Small sets: PowerShell `Remove-Item -Force`.
- Large sets (timeouts): fallback to `cmd /c rmdir /s /q "<path>"`.
- Stuck `extensions/`-style folders with many small files: delete piecewise file-by-file, then remove folder.
- After each batch: re-count to confirm (e.g. dot count 85 -> 31, junk 9 -> 0).

### 6. Report (Hebrew RTL Tables)
- Preview table before: path | items | date | verdict | reason.
- Summary after: what was deleted, what was kept + why, next decision points (e.g. `agent/skills` + `data/skills` 1-item dummies pending).

## Safety Guardrails
- Dry-run preview table first; no blind deletes.
- One category per batch; verify between batches.
- Large deletes via `cmd rmdir`, not hanging PowerShell loops.
- Stop and ask when tracker/live state is ambiguous.

## What This Is Not
- Not a repo prune for closed issues (that is `vi-close-pipeline`).
- Not a rewrite of configs; only removes, never edits live configs.
