---
name: cleanup-user-home
description: Clean orphaned dotfiles, junk logs, and duplicate folders in a Windows home directory without breaking active tools. Use when home is cluttered with dot-dirs, history files, pid/log junk, or stale project copies and a safe survey-classify-verify-delete sweep is needed.
---

# User Home Folder Cleanup

Safe sweep for `C:\Users\<name>`-style home directories: inventory clutter, classify keep vs delete, verify activity, then delete with Windows-safe fallbacks.

## Core Objective

Deliverable: a leaner home directory with zero breakage to active tools, git repos, and live projects.

Deep-dive recipes (AppData measurement, per-tool footprint audit across harnesses, knowledge-base bloat): `references/appdata-and-harness-footprint.md`.

## Workflow

### 1. Snapshot First
- Record start state: counts of dot-files, dot-dirs, and top-level normal items.
- Number the delete candidates in the preview table; when the operator replies with the batch numbers (e.g. `1 2 3`), execute exactly those batches in one turn without re-confirming each one.

### 2. Inventory (Three Passes)
1. **Dot single-files:** list `.*` files only (not dirs). Read tiny configs (`.npmrc`, `.gitconfig`, `.bashrc`, `.profile`) before classifying.
2. **Dot-directories:** for each, capture item-count + last-write date. Flag mass same-timestamp empty dummies (e.g. 17/09/2026 05:23 1-item folders) as script exhaust.
3. **Normal top-level items:** list files + dirs with size/date. Flag `*.pid`, `*.log`, `hook_hits.txt`, `audit*.json`, `emb*.json`, `ecc_tree.json` as junk candidates.
4. **AppData caches and dumps first** — cheap wins before any deep walk: `Local/CrashDumps` (one stale dump can exceed 1 GB), `Local/npm-cache/_logs`, `Local/Temp` entries older than 30 days, then package caches. Measure each with a bounded `timeout N du -sm <dir>` — a directory that cannot be measured inside its own timeout is itself the finding (an oversized cache).

### 3. Classify — Keep vs Delete
**Safe to delete:**
- `*.backup`, `*.bak`, `*.tmp`, `.dev-registry.json`, `.rdev-registry.json`
- Shell histories: `.bash_history`, `.node_repl_history`, `.python_history`, `.viminfo`, `.limbo_history`
- Pid/log junk: `server.pid`, `ui.pid`, `peak-measure-*.log`, `hook_hits.txt`
- Orphan audit dumps: `audit.json`, `audit2.json`, `ecc_tree.json`, `emb1.json`, `emb2.json`
- Empty dummy dot-dirs (1 item, same mass timestamp), numeric temp floods (e.g. `Agents/.tmp.driveupload` 12k files), scratch files (`scratch_fix*.ps1`)
- Stale project copies only after live-copy verification (see step 4)
- A search-term hit inside a package cache (`uv/cache/.../site-packages`, `npm-cache`) is upstream package content, never the user's install — exclude it from the tool's footprint

**Never touch without explicit approval:**
- `.bash_profile`, `.bashrc`, `.profile`, `.gitconfig`, `.npmrc`, `.claude.json`, `.fim-cache`
- Live runtime state files that merely *contain* stale entries (agent session/attempt indexes, interrupted-turn registries, session-keyed tool caches) — they self-clean and deleting them breaks live state
- Active knowledge bases (e.g. `Vault/` with fresh git), active task workspaces (e.g. `Cron_Workspaces/disk-cleanup/latest.*` fresh)
- Config dirs of tools still installed (git, npm, ssh, editors, CLIs) — keep anything whose tool is active

### 4. Verify Before Delete (Two Gates)
Both must hold:
1. **Not active:** last-write is old AND no fresh git activity AND no reference from live project. For duplicates: prove live copy exists (e.g. `Agents/Projects/AI Trading/crypto-spread` updated 20/09 beats `antigravity/crypto-spread` from 31/08).
2. **Zero blast radius:** search for inbound references; if ambiguous, ask operator — never guess.
3. **Git clone recovery handle:** before deleting a clone, run `git -C <dir> rev-parse HEAD` and `git status --porcelain`. A clean tree at a known upstream commit is fully restorable by re-cloning; only the dirty paths need a separate copy. Report the handle in the closeout.
4. **Derived-cache source check:** never call a cache "regenerable" until you have proven the source it indexes still exists. Open the cache, read a source path out of it, and confirm that path with `search_files (target='files')` — an index whose sources were already deleted is the *last copy*, not a rebuild. If the source is gone, say so plainly and check whether a second store (a SQLite search index, an FTS DB) still holds the content before deleting anything.

Deep-dive suspicious dirs first: top-level content + counts + dates (as done for `Agents`, `Agent-Reach`, `agent`, `antigravity`, `Cron_Workspaces`, `data`, `Vault`).

### 5. Delete Windows-Safe
- Small sets: PowerShell `Remove-Item -Force`.
- Large sets (timeouts): fallback to `cmd /c rmdir /s /q "<path>"`.
- Stuck `extensions/`-style folders with many small files: delete piecewise file-by-file, then remove folder.
- After each batch: re-count to confirm (e.g. dot count 85 -> 31, junk 9 -> 0).

### 5b. Measuring big trees (Windows gotchas)
- `du -sm <dir>` over `AppData` or any 20k+ file tree exceeds 600s and dies silently when piped to `sort` (no incremental output). Measure **one top-level subdir per call**, never pipe to sort, and set `timeout 300`.
- A du that prints nothing after 100s+ is a signal the target is huge — that alone flags it as a cleanup candidate.
- Biggest wins seen on this machine: `AppData\Local\CrashDumps` (a single 1.6 GB `.dmp`), `AppData\Local\hermes\cache\iso-chrome*` (stale isolated Chrome profiles, ~360 MB), `uv cache clean` (1.8 GiB, far faster than deleting `uv/cache` by hand), `npm cache clean --force`.
- Before deleting any SQLite `-wal`/`-shm` pair, checkpoint it (`PRAGMA wal_checkpoint(TRUNCATE)` via stdlib sqlite3) so uncommitted transactions merge into the main DB — then the WAL is safely removable.
- Icon/theme packs ship as a `.zip` next to their extracted folder (e.g. `.obsidian/icons/*.zip` + `tabler-icons/`); the extracted dir is what the app uses, so the zip is pure duplication.
- Delete a SQLite database together with its sidecars — `foo.db` implies `foo.db-wal` and `foo.db-shm`; leaving them behind orphans the next open of that path.
- Purge an oversized package cache with the tool's own command in the background, output to a log file: `{ uv cache clean; npm cache clean --force; } > <log> 2>&1` with notify, then read the log for the reclaimed figure. A foreground purge of a cache you could not even measure will exceed the tool timeout.

### 6. Report (Hebrew RTL Tables)
- Preview table before: path | items | date | verdict | reason.
- Summary after: what was deleted, what was kept + why, next decision points (e.g. `agent/skills` + `data/skills` 1-item dummies pending).

## Safety Guardrails
- Dry-run preview table first; no blind deletes.
- One category per batch; verify between batches.
- Large deletes via `cmd rmdir`, not hanging PowerShell loops.
- Measure sizes with `du` **unpiped** — `du ... | sort` buffers every line, so a walk of a million-file tree times out returning nothing; sort the output file afterwards instead.
- Stop and ask when tracker/live state is ambiguous.

## What This Is Not
- Not a repo prune for closed issues (that is `vi-close-pipeline`).
- Not a rewrite of configs; only removes, never edits live configs.
