# SPEC — Issue #26: Give the Clean Exit Gate an explicit owner for merged remote branches

Branch: `i26/give-the-clean-exit-gate-an-explicit-owner-for-mer` | Issue: #26

> Reconciliation note: this file previously held the Issue #24 spec (issue closed, merged as
> PR #25). Issue #24 is closed and its work landed, so the spec is replaced. The full #24 spec
> remains in git history at `SPEC.md` on `main`.

## Goal

Station VI's Clean Exit Gate check 5 cannot observe the failure it is written to catch: a merged
feature branch that still exists on the remote. No step in the pipeline owns remote-branch deletion.
Give the pipeline one explicit owner, and give check 5 a command that can actually fail.

## The defect, as written in the repo today

| Site | Current text | Why it cannot work |
|---|---|---|
| `skills/vi-close-pipeline/SKILL.md:117` | `git fetch --prune` -> no dead remote branches; `git branch` -> no leftover merged feature branches. | `fetch --prune` removes stale *remote-tracking refs*; it neither reports nor deletes branches that still exist on the server. `git branch` without `-a` is local-only. |
| `skills/v-babysit-pr-and-merge/references/merge-and-reset.md:61-64` | local `-D` + `git fetch --prune`, with the claim "the remote branch was already removed by `--delete-branch`". | Nothing in the pipeline pushes a delete to the server. |
| `skills/v-babysit-pr-and-merge/SKILL.md:113` | "force-delete the local branch (`-D` …) and `git fetch --prune`". | Same gap, in the file `merge-and-reset.md` itself declares "the source of truth". |
| `skills/vi-close-pipeline/README.md:40` | "the **Clean Exit Gate**: pushed, on base, empty status, synced, no dead branches, no related stashes." | Restates check 5's unprovable claim in prose. |

All four line references were read and confirmed accurate at plan time.

## What was measured (not assumed)

| Question | Measurement | Verdict |
|---|---|---|
| Is the token scope the reason `--delete-branch` fails? | `gh auth status` -> token `gho_...`, scopes `gist, read:org, repo, workflow` | **No.** `repo` scope is present, so this is not a permissions / app-installation problem. |
| Does the repo auto-delete head branches on merge? | `gh repo view --json deleteBranchOnMerge` -> `false` | **No.** The server-side setting that would remove a merged head branch is off. |
| Does the explicit delete work on this repo? | Issue #26 records `git push origin --delete` succeeding on both #23 and #25 | **Yes.** The explicit push is the working mechanism; `--delete-branch` is recorded as best-effort. |
| Is the remote dirty right now? | `git ls-remote --heads origin` -> `main` only | Clean — both historical strays were removed by hand, exactly as the issue says. |

Default branch is `main`; `gh` 2.91.0; `node` v24.14.1; the `git fetch --prune` behaviour on #25 was
measured in a prior session and is recorded in the issue.

## Goal state

1. **Check 5 observes the server.** `git ls-remote --heads origin`, filtered against the base
   branch, and a surviving merged branch **fails** the gate.
2. **Station V owns the delete.** `git push origin --delete <branch>`, ordered strictly *after* the
   existing `MERGED` confirmation, local `-D` then remote delete — never remote-first.
3. **Honest reporting.** Step 5b reports `deleted` / `already gone` / `declined` — never silence,
   never implying success.
4. **No file claims `--delete-branch` removes the remote branch.**

## Acceptance criteria

- [ ] Gate check 5 observes server-side branches (e.g. `git ls-remote --heads`) and a surviving
      merged branch fails it, **verified by test**.
- [ ] Station V step 5b deletes the merged remote branch, ordered after the existing `MERGED`
      confirmation, and reports the result honestly (deleted / declined / already gone).
- [ ] Neither file implies `--delete-branch` is what removes the remote branch.
- [ ] Verification command:
      `grep -q 'ls-remote --heads' skills/vi-close-pipeline/SKILL.md && grep -q 'git push origin --delete' skills/v-babysit-pr-and-merge/references/merge-and-reset.md && node skills/skill-workbench/scripts/validate.js --all | grep -q '0 fail' && echo BRANCH-OWNED`

## Edge cases

- **The remote delete must never run before the `MERGED` confirmation.** Squash merges leave the
  local branch with commits that are not ancestors of base; deleting the remote first would strand
  commits with no ref. Order is: confirm `MERGED` -> local `-D` -> remote delete.
- **`git push origin --delete` on an already-gone branch is a success, not a failure.** The step
  must distinguish "deleted" from "already gone" and say which — a silent no-op is the ambiguity
  this issue exists to remove.
- **A blocked remote delete must block closeout.** Station VI already has a "Blocked / Incomplete"
  section that makes a blocked gate an honest outcome ("never round it up to closed"); this issue
  adds a blocking item there rather than inventing a new policy.
- **Do not edit `evals/snapshots/v0-SKILL.md`.** It holds a past version of the skill; the
  validator and closure scripts skip it for that reason.

## Out of scope

Merge strategy (squash stays), `pipeline-triage`'s routing table, git hosting configuration
(including flipping `deleteBranchOnMerge`), and any station skill not listed above.