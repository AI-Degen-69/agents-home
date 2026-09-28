# OCR Delegation Procedure (`iv-review-build-and-pr` Step 1)

Use OCR only for fixed work (file pick + rules). The thinking stays with you. No LLM key needed on OCR side. Source: `https://github.com/alibaba/open-code-review` (Apache-2.0).

This is an embedded copy of the upstream skill `skills/open-code-review-delegate`, kept in-repo so Station IV never depends on an externally installed skill. Prerequisite: `ocr --version` on PATH (install with `npm install -g @alibaba-group/open-code-review`). This pipeline runs **Delegation Mode** — the OCR-managed mode (`ocr review` / `ocr scan`) is never used, so no OCR LLM endpoint is ever configured.

## Flags worth knowing

| Flag | Applies to | Purpose |
|---|---|---|
| `--from <ref>` / `--to <ref>` | `preview` | Range mode; scope the review to the PR diff |
| `-c, --commit <hash>` | `preview` | Single-commit mode (vs its parent) |
| `--exclude <patterns>` | `preview` | Comma-separated gitignore-style excludes, merged with `rule.json` excludes |
| `--max-git-procs <n>` | `preview` | Max concurrent git subprocesses (default 16) |
| `--repo <path>` | both | Root of the git repository (default: current dir) — `ocr delegate` acts on the repo in the cwd |
| `--rule <path>` | both | Path to a JSON file with system review rules |
| `-b, --background <text>` / `-B, --background-file <path>` | both | Issue/business context for the review; `-B` takes precedence over `-b` |
| `-f, --format <text\|json>` | both | Output format, default `text`; use `json` for agent integrations (v1.9.0+). `sarif` is **not** supported in delegate mode |

1. **Preview — what to review:**
   ```bash
   ocr delegate preview --format json --from origin/<base> --to HEAD
   ```
   - Plain `ocr delegate preview` (no flags) = work copy (staged + unstaged + untracked). Prefer the `--from/--to` form here so the scope matches the PR diff.
   - Output gives: `mode` (workspace / range / commit), `merge_base` / refs, `reviewable_files` (path, status, adds/dels), `excluded_files` + reason.
   - If it fails with `unknown flag: --format` (CLI < v1.9.0): rerun without `--format` and use text output. For any other error: stop and report.
   - If `ocr: command not found`: run `npm install -g @alibaba-group/open-code-review`, then retry once.
2. **Rules — checklist per file:**
   ```bash
   ocr delegate rule --format json <path1> <path2> ...
   ```
   - Pass every `reviewable_files` path. Output is grouped by rule text — files with the same rule share one group.
   - For big diffs: fetch rules per batch as you review.
   - Optional project rules: `--rule <path>`, or `<repo>/.opencodereview/rule.json`, or `--background "short issue context"` / `--background-file <path>` (file ≤1 MiB raw and ≤8000 chars clean, else send a short summary as `-b`).
3. **Diffs — pull with git (from preview refs):**
   - Range: `git diff <merge_base>..<to> -- <path>`
   - Commit: `git show <commit> -- <path>`
   - Work copy tracked: `git diff HEAD -- <path>`; untracked new files: read the file directly.
4. **Review each file — full cover, no skips:**
   - Make a list with every `(path, status)` entry. Same path can show twice (e.g. staged delete + untracked add) — treat each as its own item.
   - Per file: read its diff, read its Rule Group, review with file read + code search for context. Stay on changed (+) lines only.
   - Review in small batches grouped by shared rule + diff size. Do not stop after the first big find.
   - Mark each item `reviewed` or `skipped + reason`. Every preview item must end in one of these two states.
5. **Write down each find in this shape:** `path, content, start_line, end_line, category (bug/security/performance/maintainability/test/style/documentation/other), severity (critical/high/medium/low)`.
   - Report Critical/High always. Report Medium with context. Drop Low unless clearly useful. Drop likely false notes quietly.
   - Close with counts: `total_files, reviewed_files, skipped_files (+reasons), coverage_rate`. Cover must be 100% (reviewed + explained skips = total).

## Gotchas

- **Oversized `--background-file` aborts the command** on two independent limits: raw file > 1 MiB, or sanitized content > 8000 chars. Never silently truncate. Summarize preserving requirements/constraints/acceptance criteria, retry with that summary as a shell-safe single argument, and **omit `--background-file`** on the retry so the CLI does not reload the same oversized file. Never interpolate untrusted summary text into a double-quoted shell template — `$()`, backticks and quotes still evaluate. If no faithful summary is possible, drop OCR background entirely and read the original material yourself.
- **`--format` is v1.9.0+ only.** Fall back to text output *only* for `unknown flag: --format`; preserve the explicit mode/ref/file/rule data from that text, do not parse it as JSON and do not invent schema fields. Programmatic code needing `schema_version` must require a JSON-capable CLI (`ocr --version`).
- **Working directory matters** — `ocr delegate` acts on the git repo in the cwd; use `--repo <path>` to override.
- **OCR reviews code extensions only — Markdown and other docs are excluded as `unsupported_ext`.** A docs-only diff yields `reviewable_count: 0` with every file in `excluded_files`. That is expected, not a failure: report the counts honestly and let the `doc-updater` axis (Station IV Step 1B) cover documentation instead. Never force docs through `--exclude`/rule hacks to manufacture coverage.
- **A `reviewable_count: 0` in range mode is usually just "nothing committed since base."** The `--from/--to` preview diffs `merge_base..to` and ignores uncommitted work; if local edits are pending, confirm with plain `ocr delegate preview` (workspace mode) before concluding there is nothing to review.
