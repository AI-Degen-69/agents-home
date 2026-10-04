---
name: vi-close-pipeline
description: "Station VI (Close Pipeline) — Final station. Post-merge closeout: verifies the issue is closed, sweeps stale per-issue artifacts via signal-based discovery (works in any project layout), investigates before staging anything to git, handles dead code on the spot as the pipeline's single approved code-change exception (zero-reference proof + targeted tests), and ends with the mandatory Clean Exit Gate — base branch pushed, synced, spotless, ready for the next run."
---

# Station VI: Close Pipeline (`vi-close-pipeline`)

Post-merge closeout that leaves the repository carrying only live knowledge — and leaves the working folder on a clean, synced base branch, ready for the next issue. Works across **any project, language, or repository** without assuming repo-specific folder naming.

## Pipeline Position
- **Station:** Station VI of VI — pipeline closeout
- **Previous Station:** `v-babysit-pr-and-merge` (Babysit & Merge)
- **Next Station:** none — the pipeline ends here
- **Optional follow-up (outside the pipeline):** suggest `/present-pr <id>` — the ad-hoc visual presentation skill. It is NOT a pipeline station and is never mandatory.

---

## 1. Step 0 — Verify Merge & Issue State

1. Confirm the PR is merged: `gh pr view <n> --json state --jq .state` → must be `MERGED`. If not merged, stop and route back to `v-babysit-pr-and-merge`.
2. Check the issue: `gh issue view <id> --json state`.
   - If **CLOSED** — continue. (Normal path — Station V Step 5a or GitHub `Closes #<id>` already handled this.)
   - If **OPEN but the PR is MERGED** — safety net: close it now:
     `gh issue close <id> --comment "Closed via PR #<n> (merged)."` and report it. (This means Station V's Step 5a was skipped or failed.)
   - If tracker state is ambiguous — ask the operator. Never guess.

---

## 2. Signal-Based Artifact Discovery (generic — never assume layout)

A file is a **prune candidate** if it carries an identity of specific, finished work. Detect by signals, not by folder names:

1. **Filename signal:** the issue/PR number or slug in the name (`42-*`, `*42*plan*`, `<slug>-todo`).
2. **Content signal:** frontmatter (`issue: 42`), references to `#<id>` or the PR URL, or a checklist tied to the shipped work.
3. **History signal:** the file was created/touched only by commits of the merged feature branch (`git log --follow -- <file>`).
4. **Location signal (weak, corroborating only):** lives outside recognized knowledge homes — typical scratch spots are `tasks/`, `scratch/`, temp dirs, repo root — but ANY path can host a candidate, and ANY path can host a keeper.

Scan the whole repo (excluding `.git/`, dependency folders, build output) for `*.md`, `*.txt`, `*.html`, loose scripts, and scratch-like directories. Match candidates against the just-merged issue AND against any other closed issue whose leftovers are still lying around.

---

## 3. Two-Gate Obsolescence Test

A candidate file is eligible for deletion **only when BOTH conditions hold**:
1. **Work is Closed:** the associated issue is CLOSED / PR MERGED (verified in Step 0 or via tracker CLI).
2. **Zero Inbound References:** a full repo-wide search (excluding `.git/`) finds zero active references or links to the file.
- If either gate fails (work open OR file referenced): the file MUST be kept.
- Ambiguous tracker state → prompt the operator, never guess.

---

## 4. Knowledge Is Untouchable (Strict Preservation Rule)

**PERMANENT KNOWLEDGE — never deleted:**
1. **Visual presentations:** `docs/issues/<id>-presentation-*.html` (legacy: `<id>-showcase-*.html`, `<id>-explained.html`) — historical showcases of record, kept even when the issue is closed.
2. **Research papers & findings:** `runs/.../research-papers/`, dated reports and benchmarks.
3. **Active planning & backlog:** `TODO.md`, `ideas/`, active RFCs.
4. **Permanent docs:** anything linked from `README.md` or indexed in project documentation.
5. **NOTICED-BUT-NOT-TOUCHING ledger:** `docs/issues/<id>-noticed-but-not-touching.md` — the per-issue candidate record defined below; never pruned, even when its issue is closed.

---

## 5. Investigate Before You Touch (no blind git adds)

Every untracked or unknown file the sweep finds gets **read and classified first**: permanent knowledge / prune candidate / foreign (belongs to other in-flight work).
- Knowledge → stage it (see commits below).
- Prune candidate → two-gate test.
- Foreign → leave it alone and name it in the report. **Never `git add` a file you have not read.**

### Relocate misplaced keepers
A valuable document sitting in scratch or repo root → propose moving it to `docs/` or `docs/issues/` with a clean kebab-case name (`<topic>-<date>-<kind>.<ext>`). Confirm before moving; update inbound references.

---

## 6. Dead Code — the Pipeline's Single Approved Code-Change Exception

Dead or zombie code tied to the merged work (unused modules, superseded APIs, orphaned exports) is handled **on the spot, in this station** — no new issue, no full pipeline. Guardrails compensate for bypassing review:

1. **Mechanical proof of zero references first:** run the ecosystem tool where applicable (knip / depcheck / ts-prune for TS/JS, vulture for Python, deadcode for Go — whatever the project has), PLUS a repo-wide text search. Both must agree: zero live references.
2. **Run the targeted tests after deletion.** Any failure → `git checkout` the deletion, report it, stop that item. Never push broken code.
3. **One focused commit:** `refactor: remove dead code from #<id>`.
4. **Any ambiguity** (dynamic imports, reflection, string-based references, public API surface) → do NOT touch. List it in the report as "suspected dead code — needs human judgment".
5. Larger deprecations (renaming live APIs, migrating consumers) are out of scope → route to `deprecation-and-migration`.

---

## 7. Execution Order (strict)

1. **Dry-run preview table first** — Keep / Delete / Relocate / Dead-code, with path, classification, issue state, and rationale per row. Get operator approval when anything is non-obvious.
2. Delete approved files; verify and remove now-empty directories.
3. Handle dead code per Section 6.
4. Commit(s), keeping concerns separate:
   - `chore: prune closed-issue artifacts (#<id>)` for deletions/relocations/staged keepers.
   - `refactor: remove dead code from #<id>` if Section 6 fired.
   - If foreign dirt exists (files you did not touch), commit ONLY your files and list the foreign paths in the report — never bundle strangers.

---

## 7B. Candidate Disposition — NOTICED-BUT-NOT-TOUCHING owner (Station VI)

Station VI is the single end-to-end owner of NOTICED-BUT-NOT-TOUCHING candidates. Any discovering station only appends an `open` row to the ledger; only Station VI resolves rows.

1. **Ledger:** `docs/issues/<id>-noticed-but-not-touching.md` — one Markdown table with columns `ID (N1, N2, …) | candidate (one line) | discovering station | evidence (path:line) | status | resolution`. Allowed statuses only: `open`, `published`, `duplicate`, `dismissed`. Each resolution is an issue reference (`#N`) or a dismissal reason. Absent ledger means zero candidates; a station creates the ledger only when recording its first candidate.
2. **Disposition:** read the ledger and present each `open` row to the operator — one decision per row: publish, dismiss with a reason, or confirm a duplicate. Before offering publish, search existing issues with the tracker list command; on a probable duplicate propose `duplicate #N` for confirmation. On a publish decision invoke `create-issue` with the candidate plus provenance (`Found during #<id>`) and record the returned issue number. Merged PR, clean tree, and automation never replace operator approval; `defer` is not a resolution — undecided stays `open`.
3. **Commit:** commit the ledger update alone (`chore: record noticed-but-not-touching disposition (#<id>)`); the Clean Exit Gate push sends it.

---

## 8. The Clean Exit Gate (mandatory, last step)

The pipeline is NOT closed until every check passes:

1. `git push` — nothing committed locally stays unpushed.
2. Confirm checkout is on the base branch (`master`/`main` per `gh repo view --json defaultBranchRef`).
3. `git status --porcelain` → **empty**.
4. `git status` → `up to date with 'origin/<base>'` (no ahead/behind).
5. Remote branches: `git ls-remote --heads origin` → **no merged feature branch survives on the server**, and `git branch` → no leftover merged feature branches. This half reads server state, because the local half cannot see it: `git fetch --prune` only drops stale *remote-tracking refs*, and `git branch` without `-a` never lists the remote at all. A merged branch still present in that output **fails** this check. **An unrelated active branch does not** — a head that still belongs to an open PR is not a leftover, and failing on it would strand closeout on a healthy repo; treat only branches with no open PR as violations. Station V step 5b owns deleting it (`git push origin --delete <branch>`); this gate observes and blocks, it does not delete.
6. Stashes: none related to this issue remain (list any foreign stashes in the report).
7. NOTICED-BUT-NOT-TOUCHING ledger contains zero rows with status `open` (absent ledger counts as zero).

If any check fails → fix it or escalate with the exact state. **Never declare closeout on a dirty or diverged folder.**

### Blocked / Incomplete — a real outcome, not a failure to hide

The Clean Exit Gate has exactly two honest endings: **closed** (all seven checks green) or
**blocked** (at least one check could not be made green). Report the blocked state as its
own outcome — never round it up to "closed" and never bury it under the success summary.

The report MUST name, for each blocking item: the exact failing check, the observed state
(verbatim command output, not a paraphrase), and what is needed to clear it. Blocking items
that make closeout **incomplete** rather than merely delayed:

1. **Foreign dirt** in `git status --porcelain` you did not create and may not commit.
2. **Failed push** — local commits unpushed, or the remote rejected the push.
3. **Residual branches, worktrees, or stashes** tied to this issue (or unattributable ones) — including a merged branch that survived on the remote (`git ls-remote --heads origin` still lists it). Clear it with `git push origin --delete <branch>`; never round a surviving branch up to "closed".
4. **API failure** — `gh` unauthenticated, rate-limited, or the tracker unreachable, so an
   issue-close or PR-merge state could not be confirmed.
5. **Unresolved `open` rows** in the NOTICED-BUT-NOT-TOUCHING ledger awaiting operator disposition.

When closeout ends blocked: keep every permanent-knowledge and uncommitted file intact,
do **not** force-push, do **not** force-delete branches, and do **not** close an issue whose
state you could not verify. Name the next action and who owns it.

### A presentation offered after this station ends with the same clean-exit check

`/present-pr <id>` may be suggested from this report, but building the page writes a file.
Offering it never exempts the folder from Section 8: when the operator accepts and the page
is staged or committed, re-run the Clean Exit Gate (`git push`, base branch, spotless, pruned)
before ending the session. A closeout that passed the gate and then went dirty by adding a
presentation file is **not** a clean exit — it ends blocked, and the report says so.

---

## 9. Final verification walkthrough (mandatory input to the report)

Build the walkthrough in the report from the live product, not from memory:

1. Name the real screen / tab / button the operator opens — never the presentation file.
2. Write at most 5 steps. Every step is: where → what to do → what to see.
3. Use `→` arrows between screens and give a direct link when one exists.
4. Say exactly what to look at (text, state, count) so the operator knows it worked.
5. Prefer visual proof. Backend-only with nothing to see → say so in one line plus how it was checked automatically.

---

<!-- local-only:begin -->
The chat output template for this station is `references/output-template.md`.
Read it before writing your first report.
<!-- local-only:end -->

