# OCR Delegation Procedure (`iv-review-build-and-pr` Step 1)

Use OCR only for fixed work (file pick + rules). The thinking stays with you. No LLM key needed on OCR side. Source: `https://github.com/alibaba/open-code-review` (Apache-2.0).

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
