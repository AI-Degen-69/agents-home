# Auditing an operator-performed deletion cleanup

Use when the operator says they deleted "stale" / "irrelevant" / "old-version" files and
wants a verdict, a structure proposal, or a commit. The claim is a hypothesis; the repo
decides.

## 1. Inventory the deletions

```bash
git status --porcelain | grep '^ D' | awk '{print $2}' | cut -d/ -f1-2 | sort | uniq -c | sort -rn
```

Group by the first two path segments. This tells you whether the cleanup is one coherent
sweep (one folder family) or scattered.

## 2. Find what actually depends on each path

Three dependency channels, and source imports cover only the first:

| Channel | Probe |
|---|---|
| Runtime code | `grep -rn "<basename>" --include=*.py --include=*.ts --include=*.ps1 .` |
| Tests (fixtures live here) | same grep restricted to `tests/` — also grep for `Path(...) / "<basename>"` fragments |
| Generated-artifact contract | the repo's own layout/guard tests, e.g. `tests/test_*_layout*.py` |

A config or doc that no code imports can still be `json.loads(...)`'d or
`read_text()`'d by a test. Grep tests for the basename **before** reading the file to
judge whether it is stale — judgement is not evidence.

## 3. Let the suite arbitrate

Run the specific tests the grep named, then the directory's whole test file. Only after a
real `FileNotFoundError` or a guard assertion fails is a deletion confirmed as breaking;
"looks unused" never is.

## 4. Restore surgically

- `git restore <path>` per load-bearing file. Never restore the parent directory.
- Re-run the affected tests and report the pass count as the proof.
- Restored paths are *fixtures and contracts*, not evidence the operator was wrong about
everything else: keep the rest of the deletion intact.

## 5. Empty directories a guard test requires

Git does not track empty directories, so `git restore` of a swept folder leaves nothing
behind and the guard fails on a fresh clone. Fix with one `.gitkeep` (or a single restored
file when the contract already names one). Do not weaken the guard to tolerate a missing
directory — the guard's job is to prove it is not vacuous.

## 6. Directories holding only `__pycache__`

A directory that is (a) absent from `git ls-files <dir>` and (b) contains only
`__pycache__/` is orphaned bytecode from a pre-refactor layout. Confirm the move with
`git log --oneline -5 -- <dir>` and read the successor package's docstring — a module
`__init__.py` often documents why the old directory name was dangerous (e.g. namespace
package shadowing) and where the code went. Then deleting the shell is correct, including
when the operator asks "why is this folder empty".

## 7. Handing over a destructive wipe

For storage cleanup (`data/`, `runtime/`, `reports/`, logs) never execute the wipe yourself
in a review task. Deliver:

1. A tier table: what each directory is *for* (durable queryable stores vs. per-process
   state vs. derived output), since "keep in X" is unanswerable without the contract.
2. The exact command block in the operator's shell syntax (PowerShell for this user),
   with every preserved item named explicitly in an exclusion (`Where-Object Name -ne '<fixture>'`).
3. One line on what is recoverable anyway (`git log --diff-filter=D --name-only`), so the
   decision is not framed as irreversible.
4. One line on what you did NOT check, and the residual risk.

Committed fixture files inside a wiped tree (a demo DB, a seed JSON) are the trap: they
are tracked, so deleting them is a repo change, not a local cleanup.

## 8. Reporting shape

The operator asked for a verdict, not a log. Lead with the count of deletions that were
load-bearing and that they are restored + tests green. Then one table of file → why it
broke. Then the structure/policy proposal. Fold "everything else was genuinely stale"
into a single sentence — do not enumerate the 50 files that were fine.
