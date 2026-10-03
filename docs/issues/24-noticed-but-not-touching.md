# NOTICED-BUT-NOT-TOUCHING — Issue #24

Candidates spotted while building but deliberately left untouched. Any station may append an
`open` row; only Station VI (`vi-close-pipeline`) resolves rows.

| ID | Candidate | Discovered at | Evidence | Status | Resolution |
|---|---|---|---|---|---|
| N1 | **`.gitignore` does not cover Python/Node junk.** It lists only four entries (`.freebuff/`, `.playwright-cli/`, `desktop.ini`, `icon_*.ico`) and none are language artifacts — yet the repo tracks **22 Python scripts**, including the `skills/skill-creator/scripts/` package (`__init__.py` beside sibling modules). Measured: one local import created `__pycache__/utils.cpython-312.pyc` and `git status` showed it as untracked, which reads as foreign dirt at Station VI's Clean Exit Gate. `gitignore` — not `reviews.path_filters` — is the fix. (An earlier draft of this row claimed the repo had no Python; that was wrong and is corrected here.) | Station III (T2, after the operator raised junk folders) | `.gitignore` (4 entries); `git ls-files -- '*.py'` returns 22 tracked scripts; measured `python -c "import utils"` created `skills/skill-creator/scripts/__pycache__/utils.cpython-312.pyc` and `git status --short` showed `?? skills/skill-creator/scripts/__pycache__/` | published | #27 |

**Why it was not fixed here:** Issue #24 is scoped to correcting the CodeRabbit playbook and
resolving the configuration source. `.gitignore` was never in that scope, and the operator's own
direction was "filtering only eval" — which was answered (correctly) as *no change to
`path_filters`*, not as *change `.gitignore`*. Recorded rather than silently taken.

**Related but deliberately rejected:** adding `reviews.path_filters` entries for
`__pycache__` / `.pytest_cache` / `node_modules` to `.coderabbit.yaml`. No such folder is tracked
or cloned, so those filters would be dead configuration — and a non-`!`-prefixed pattern is an
INCLUDE pattern that would silently narrow the review rather than exclude anything.