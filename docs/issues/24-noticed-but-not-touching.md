# NOTICED-BUT-NOT-TOUCHING — Issue #24

Candidates spotted while building but deliberately left untouched. Any station may append an
`open` row; only Station VI (`vi-close-pipeline`) resolves rows.

| ID | Candidate | Discovered at | Evidence | Status | Resolution |
|---|---|---|---|---|---|
| N1 | **`.gitignore` does not cover Python/Node junk.** It lists only four entries (`.freebuff/`, `.playwright-cli/`, `desktop.ini`, `icon_*.ico`). `agents-home` is currently Markdown + Node, so nothing is produced — but the moment Python or Node tooling runs here, `__pycache__/`, `.pytest_cache/`, `.venv/`, `node_modules/` appear as untracked noise in every `git status`. This is the real junk-folder exposure, and `gitignore` — not `reviews.path_filters` — is its fix. | Station III (T2, after the operator raised junk folders) | `.gitignore` (4 entries); `git ls-files` clean of junk; `git status --porcelain --ignored` shows only the four ignored entries | open | — |

**Why it was not fixed here:** Issue #24 is scoped to correcting the CodeRabbit playbook and
resolving the configuration source. `.gitignore` was never in that scope, and the operator's own
direction was "filtering only eval" — which was answered (correctly) as *no change to
`path_filters`*, not as *change `.gitignore`*. Recorded rather than silently taken.

**Related but deliberately rejected:** adding `reviews.path_filters` entries for
`__pycache__` / `.pytest_cache` / `node_modules` to `.coderabbit.yaml`. No such folder is tracked
or cloned, so those filters would be dead configuration — and a non-`!`-prefixed pattern is an
INCLUDE pattern that would silently narrow the review rather than exclude anything.