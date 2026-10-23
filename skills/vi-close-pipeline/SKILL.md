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

## Files

- `references/english-template.md` — English chat output contract (default, success + blocked templates). Read before writing any report.
- `references/hebrew-template.md` — Hebrew chat output contract (when operator requests Hebrew output).
- `references/concurrent-git-state-recovery.md` — recipe for recovering a commit that landed on a foreign branch mid-session.
- `references/worktree-and-branch-cleanup.md` — clearing post-merge residue: fast-forward without a dirty-tree dead end, verifying a worktree before removal, `Permission denied` / `Device or resource busy` on directory delete, worktrees that appear mid-session, branch deletion after a merge, and the doc blast radius of a deletion.
- `scripts/grade.js` — deterministic grader for the eval set (`audit` / `case` modes, zero dependencies). Use to verify eval output.
- `evals/evals.json` — this skill's own eval set (2 cases).

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

**PERMANENT KNOWLEDGE — preserved and committed:**
1. **Visual presentations:** `docs/pr-presentations/<pr>-<slug>.html` — permanent showcases of record. If created by `present-pr` and still untracked or uncommitted, **commit them automatically to the base branch** (`docs(presentation): archive visual showcase for #<id>`) and push. They are never treated as dirty residue.
2. **Research papers & findings:** `runs/.../research-papers/`, dated reports and benchmarks.
3. **Active planning & backlog:** `TODO.md`, `ideas/`, active RFCs.
4. **Permanent docs:** anything linked from `README.md` or indexed in project documentation.
5. **NOTICED-BUT-NOT-TOUCHING ledger:** `docs/backlog/i<id>-<slug>.md` — the per-issue candidate record defined below; never pruned, even when its issue is closed. A task instruction to delete a ledger loses to this rule: keep the file and the row, and re-home an `open` row **verbatim** into the successor ledger only if the file genuinely must go. An `open` row is never deleted and never paraphrase-rewritten to look resolved.

---

## 5. Investigate Before You Touch (no blind git adds)

Every untracked or unknown file the sweep finds gets **read and classified first**: permanent knowledge / prune candidate / foreign (belongs to other in-flight work).
- **Presentation showcase:** (`docs/pr-presentations/<pr>-<slug>.html`) → stage and commit with `docs(presentation): archive visual showcase for #<id>`, then push.
- **Other Permanent Knowledge:** → stage it with appropriate message.
- **Prune candidate:** (`tasks/plan.md`, `tasks/todo.md`, temporary scratch files) → delete them.
- **Foreign:** → leave it alone and name it in the report. **Never `git add` a file you have not read.**

### Relocate misplaced keepers
A valuable document sitting in scratch or repo root → propose moving it to its own home under `docs/` with a clean kebab-case name: `pr-presentations/` for a PR showcase, `explanations/` for an explainer, `backlog/` for a candidate ledger, `specs/` for a design, `plans/` for a plan, `interviews/` for an intent record. Confirm before moving; update inbound references.

**The repo's own naming contract wins over any name suggested here.** If the project documents one (`docs/agents/naming.md`, a layout guard test, a `docs/` map), read it first and follow it exactly: a name that matches this station's example but breaks the repo's guard is a red test, not a tidy-up. Where the contract exists, it owns which folder is legal, and inventing a sibling folder for the new file is the mistake the contract exists to prevent.

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

1. **Dry-run preview table first** — Keep / Delete / Relocate / Dead-code, with path, classification, issue state, and rationale per row. Get operator approval when anything is non-obvious. Include every doc that *points at* a deletion target in the table: deleting `tasks/` orphans a README layout line, and that line belongs in the same deletions-only commit.
2. Delete approved files; verify and remove now-empty directories.
2b. Clear the merged branch's on-disk residue — worktrees first, then local and remote branches — per `references/worktree-and-branch-cleanup.md`. A merged PR removes nothing locally. `git merge --ff-only origin/main` syncs the base branch where `git pull --ff-only` dead-ends on a dirty runtime artifact.
3. Handle dead code per Section 6.
4. **Docs-only sweeps skip the PR.** When the entire change is markdown deletions/relocations or archived HTML under `docs/` — no code, tests, config, or runtime touched — commit and push straight to the base branch. No feature branch, no PR, no CodeRabbit round: a review cycle on a doc move buys nothing and the operator has said so.
5. Commit(s), keeping concerns separate:
   - `chore: prune closed-issue artifacts (#<id>)` for deletions/relocations/staged keepers.
   - `refactor: remove dead code from #<id>` if Section 6 fired.
   - If foreign dirt exists (files you did not touch), commit ONLY your files and list the foreign paths in the report — never bundle strangers.
   - **Re-verify the checkout in the same command as the commit**, not minutes earlier: `git branch --show-current` + `git status --porcelain`. A concurrent actor (another agent session on the same clone) can switch the checkout to a feature branch between your gate checks and your commit, and the push then lands on their branch. If that already happened, recover with `references/concurrent-git-state-recovery.md`.

5. **When the base branch is PR-protected, the sweep ships as its own PR.** Same rules as any change: branch off the base, deletions only (plus the blast-radius line and, if needed, the ledger disposition), one review round, merge, then fast-forward. CodeRabbit fires on request only — post `@coderabbitai review` as its own comment, check once for an existing review, then count down 5m → 1m. A `Review rate limited` check status is a quota answer, not a pass: run the fallback review yourself, post it as a PR comment, and say so honestly in the report.

   Fallback review checklist for a sweep PR — each line is a claim to verify, not a formality:
   1. **Scope** — `gh pr view <n> --json files` lists only the intended paths; a foreign dirty artifact (`data/*.db`, telemetry) showing in `git diff origin/main` must be absent from the PR's file list.
   2. **Shape** — deleted-vs-added counts (`--numstat`, all `0 <n>` for a deletions-only PR) and any markdown table the PR edits parses to a uniform column count.
   3. **Enums** — any status/state cell uses an allowed value from the documented set.
   4. **Evidence** — every claim the PR body makes about code cites `path:line` that was actually read this session.

---

## 8. Candidate Disposition — NOTICED-BUT-NOT-TOUCHING owner (Station VI)

Station VI is the single end-to-end owner of NOTICED-BUT-NOT-TOUCHING candidates. Any discovering station only appends an `open` row to the ledger; only Station VI resolves rows.

1. **Ledger:** `docs/backlog/i<id>-<slug>.md` — one Markdown table with columns `ID (N1, N2, …) | candidate (one line) | discovering station | evidence (path:line) | status | resolution`. Allowed statuses only: `open`, `published`, `duplicate`, `dismissed`. Each resolution is an issue reference (`#N`) or a dismissal reason. Absent ledger means zero candidates; a station creates the ledger only when recording its first candidate.
2. **Disposition:** read the ledger and present each `open` row to the operator — one decision per row: publish, dismiss with a reason, or confirm a duplicate. Before offering publish, search existing issues with the tracker list command; on a probable duplicate propose `duplicate #N` for confirmation. Verify the candidate's premise still holds on disk before publishing: find or grep the evidence path — a row whose target has already vanished (retention deleted the runtime files, another merge removed the code) closes as `dismissed` with the verified evidence, not as a published no-op ticket. When the operator's publish choice targeted a vanished target, state the finding plainly and record the dismissal rather than publishing an issue whose first act is discovering there is nothing to do. On a publish decision invoke `create-issue` with the candidate plus provenance (`Found during #<id>`) and record the returned issue number. Merged PR, clean tree, and automation never replace operator approval; `defer` is not a resolution — undecided stays `open`.

   **Never surface a bare row ID.** `row N1 is still open` in a closeout summary or status line reads as noise — the operator does not hold the ledger in their head, and a distractor row named only by ID gets asked about instead of the work. Either leave the ID out of the report entirely, or state the row at its **first** mention in the distilled form below — never the ID alone, never a paraphrase of the ledger's own paragraph. This applies to every station's report, not only to the disposition ask.

   **Presenting rows so the operator can decide.** Ledger prose is written for engineers; the disposition ask is for the operator. Distill each `open` row to **one plain sentence plus one tiny numeric example** (the cents/shares the row itself cites) — never the dense ledger paragraph. State the error's **direction**: conservative (overstates cost, cannot hide a loss) vs unsafe (shows a loss as good, hides real damage). Verify that framing against the code before presenting — a booked floor that guarantees a lower bound is conservative, and an undirected defect framing invites a rejection you cannot answer. Keep each disposition question to one line plus its example; a dense multi-row technical form times out, leaves every row `open`, and blocks the gate. When the ask times out or the operator asks "what does this mean", re-present in the distilled form; do not repeat the dense one.
3. **Answering challenges with code, not the ledger.** Expect the operator to reject a row from domain knowledge ("a LIMIT order fills at my price — the price cannot move") or to ask what a route is. Trace the code before answering — call sites of the recording function, fallback constants, venue-response behavior — and answer with the proof (call site + line), not a ledger paraphrase. A "which routes" question gets a small table: route → trigger → what it records. If the trace shows the row's severity was overstated, say so plainly and offer the corrected disposition.
4. **Recording a dismissal — keep the row's prose, change only its verdict.** Real ledgers often arrive with a 6-column table (`# | noticed | why out of scope | owner | when | status`) and no resolution column. Add `Resolution` to the header and separator and to that one row, keep every existing cell verbatim, and blank `Owner`/`When` to `—` — a dismissed row has no owner or trigger, and leaving `you`/`when …` next to `dismissed` reads as still pending. Resolutions carry the re-open condition, not just a reason: *unreachable while <the invariant that prevents it>; re-open with its own ticket if <the condition that lifts it>*. Prove the edit with a column-count parse and a zero-`open` grep, not by eye:
   ```bash
   py -3.12 -c "import pathlib;[print(len(l.split('|'))-2) for l in pathlib.Path('<ledger>').read_text(encoding='utf-8').splitlines() if l.startswith('|')]"
   grep -c '| open |' <ledger>      # must be 0
   ```
   A prose grep for `open` will hit words like *opens* inside the row text — match the status cell, not the word.
5. **Commit:** commit the ledger update alone (`chore: record noticed-but-not-touching disposition (#<id>)`); the Clean Exit Gate push sends it.

---

## 9. The Clean Exit Gate (mandatory, last step)

The pipeline is NOT closed until every check passes:

1. `git push` — nothing committed locally stays unpushed.
2. Confirm checkout is on the base branch (`master`/`main` per `gh repo view --json defaultBranchRef`).
3. `git status --porcelain` → **empty**.
4. `git status` → `up to date with 'origin/<base>'` (no ahead/behind).
5. Remote branches: `git ls-remote --heads origin` → **no merged feature branch survives on the server**, and `git branch` → no leftover merged feature branches. This half reads server state, because the local half cannot see it: `git fetch --prune` only drops stale *remote-tracking refs*, and `git branch` without `-a` never lists the remote at all. A merged branch still present in that output **fails** this check. **An unrelated active branch does not** — a head that still belongs to an open PR is not a leftover, and failing on it would strand closeout on a healthy repo; treat only branches with no open PR as violations. Station V step 5b owns deleting it (`git push origin --delete <branch>`); this gate observes and blocks, it does not delete.
6. Worktrees: `git worktree list` shows the primary checkout and nothing belonging to this issue. **Re-read it here, not from session start** — a concurrent harness can register a worktree mid-sweep, and a stale reading misreports the gate. A worktree holding another actor's live uncommitted work is theirs: leave it, name the owner, report the check blocked rather than deleting their state.
7. Stashes: none related to this issue remain (list any foreign stashes in the report).
8. NOTICED-BUT-NOT-TOUCHING ledger contains zero rows with status `open` (absent ledger counts as zero).

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
6. **The checkout itself belongs to another actor** — HEAD sits on a feature branch carrying that actor's in-flight work (the branch was switched mid-session). Leave HEAD on their branch: moving to the base branch makes their next commit land on the wrong branch. Report blocked, name their branch as owner, and recover your own commit per `references/concurrent-git-state-recovery.md`.

When closeout ends blocked: keep every permanent-knowledge and uncommitted file intact,
do **not** force-push, do **not** force-delete branches, and do **not** close an issue whose
state you could not verify. Name the next action and who owns it.

### A presentation generated by `present-pr` is auto-committed and sealed

If `/present-pr <id>` was run, its generated showcase file in `docs/pr-presentations/<pr>-<slug>.html` is committed (`docs(presentation): archive visual showcase for #<id>`) and pushed as part of this station's sweep. The Clean Exit Gate runs after this commit, ensuring `git status --porcelain` is spotless and `origin/<base>` is up-to-date.

---

**Manual verification:** owned by Station V — after a successful merge it guides the operator through seeing the change live. This station does not repeat the walkthrough; its report stays a short closeout.

**Unless Station V did not run** (fast-lane merge, direct close, or a session that started at this station): then this station owes the walkthrough, and it starts by reading the artifacts — the PR body's `## How to verify`, the merged summary, and the issue body. Reuse what is there, correct what is stale, and name any deliberate deviation in one line. Never compose a walkthrough from scratch while a written one already exists; a closeout that contradicts the PR is worse than no closeout.

<!-- local-only:vi-close-pipeline:output-template-begin -->
The chat output template for this station is `references/english-template.md` (default).
Read it before writing your first report.
If the operator explicitly requests Hebrew output, use the Hebrew template at `references/hebrew-template.md`.
This block is stripped by the harness sync script (`scripts/sync-harness-skills.ps1`)
during publish — it is metadata for local use only and is never copied to harness links.
<!-- local-only:vi-close-pipeline:output-template-end -->

