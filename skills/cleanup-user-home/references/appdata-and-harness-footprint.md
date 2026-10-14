# AppData Sweep & Tool Footprint Audit

Two recurring jobs under the cleanup class: measuring/pruning `AppData` on a Windows host, and answering "is tool X installed anywhere, and what data does it leave behind".

## Measuring size on Windows (MSYS shell)

- **Never pipe `du` into `sort`** — the pipe buffers all incremental output, so a walk of a million-file tree exceeds any tool timeout and returns nothing. Run `du` bare (it prints as it goes), redirect to a file, and sort the file afterwards.
- **Bound each directory:** `timeout 100 du -sm <dir>`. A directory that fails to measure inside its own timeout is itself the finding — an oversized package cache.
- **Whole-tree walks:** run in the background with output to a file plus notify, then read the file. Do not sit in the foreground polling; free the turn for other work.
- Clear a stuck walk with `pkill -f "du -sm"` and delete the partial output file before re-running.

## AppData prune targets (safe, in reclaim order)

| Target | Action | Note |
|---|---|---|
| `Local/CrashDumps/*` | delete | List it early: a single stale dump routinely holds hundreds of MB to >1 GB; dumps are diagnostics for crashes that already closed |
| `Local/npm-cache/_logs` older than ~1 day | delete | npm writes a debug log per exec and never rotates them |
| `<harness>/cache/iso-chrome*` and similar numbered browser-profile copies | delete | Stale isolated browser profiles; the harness rebuilds them on demand. Confirm no live run is attached |
| `Local/Temp` entries older than 30 days | delete | |
| `Local/uv/cache` | `uv cache clean` | Rebuildable; use the tool's own command, not `rm` |
| `Local/npm-cache` | `npm cache clean --force` | Optional — only costs re-download time |

Report reclaimed space, and keep package caches as an explicit opt-in batch separate from the no-brainer deletes.

## Auditing a tool's footprint across harnesses

Cheap to expensive, in this order:

1. **Enumerate harness roots, never recall them:** `ls -d ~/.[a-z]*` plus the shared agent home and per-harness config roots — a path from memory is a stale path.
2. **Per-root name search:** `find <root> -iname '*<tool>*' -maxdepth 6`, widening only on a hit.
3. **Content search** in shared agent homes and harness config dirs for the tool name.
4. **Command traces:** the PowerShell `PSReadLine/ConsoleHost_history.txt` (install *and* removal commands both land there) and dated `npm-cache/_logs` exec records. A removal command in history outranks an older install command — the filesystem decides current state, not the last thing typed.
5. **Classify each hit:** installed (live files present) / removed (traces only) / false positive (the term appears inside a package cache or an unrelated data file — upstream content, not the user's install).
6. **Before deleting a plugin or skill dir, capture the recovery handle:** `git -C <dir> rev-parse HEAD`, `git status --porcelain`, upstream remote. A plugin installed as a clone often carries one hand-made file (a `rules/AGENTS.md` copy, say) as its only uncommitted change — deleting the parent removes both, so confirm that with `git status` first.
7. **Verify the removal** by re-running the same `find` and report the zero-hit output as positive evidence.

Pitfalls:

- Skill CLIs that accept several names (`npx skills remove <a> <b> <c>`) purge the matching skills from every harness skill dir at once; afterwards expect history traces but no files anywhere.
- A plugin directory's presence is the install signal even when no config file references it — check the plugins/root listing, not just the manifest.
- Never delete live runtime state (session indexes, interrupted-turn registries) even when it holds only stale entries; it self-cleans.

## Knowledge-base bloat (Obsidian vault and friends)

Same class, different root. A knowledge base is git-backed, so git history is the standing recovery handle — but never touch its git state unprompted; report modified/untracked counts only.

- **Icon and theme packs ship as `pack.zip` beside an already-extracted `pack/` directory.** The extracted tree is what the app loads, so the zip is pure weight. Delete the zip, keep the directory — this routinely hides tens of MB inside a vault that otherwise looks tiny.
- **An app may keep its own database inside the knowledge base** (`.freebuff/desktop.db`, `desktop-v2.db`). Two generations of the same DB plus `-wal`/`-shm` sidecars is the common shape; the older generation is superseded once the newer has a later mtime. Check `git ls-files <dir>` — tracked files survive in history after deletion, which is the recovery handle.
- **Web-clipper sample videos land in the attachments tree** and are mistaken for user content; match the filename against known sample names before treating them as untouchable.
- `.obsidian/*` is gitignored in a typical vault, so icon-zip and attachment deletions are local-only and need no commit.
