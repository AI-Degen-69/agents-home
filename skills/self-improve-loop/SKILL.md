---
name: self-improve-loop
description: Runs an autonomous codebase improvement loop across any repository. Dynamically inspects the project architecture, ranks improvement candidates, and gates each one through an internal self-deliberation step (adapted from the upstream grilling skill) before implementing with TDD, pushing a PR, and handling CodeRabbit reviews. Ends with a delivery gate that re-reads every created PR from the remote. Use when the user asks to "self improve" a codebase, run the improvement loop, or autonomously improve/refactor a repository.
---

# Autonomous Codebase Improvement Loop

A continuous improvement cycle executing across the current repository, gated on Step 8.

```
1. Explore → 2. Rank Candidates → 2.5. Internal Grilling Gate → 3. Branch & Plan → 4. TDD & Verify → 5. Push PR → 6. CodeRabbit Review & Fix → 7. Bridge → 8. Verify Delivery
```

---

## The Improvement Cycle

### Step 0: Verify the Vendored Chain (read-only pre-flight — before Step 1)
The loop runs on a chain of vendored skills; a folder that exists on disk is not yet one the harness can invoke. Before the first iteration — or whenever asked to confirm the loop is ready — run the read-only chain check in `references/verify-vendored-chain.md` (enumerate companions → resolve cross-references → confirm harness-root links → confirm loadability → exercise the gate). All five must pass; report any missing link as the blocker rather than starting Step 1 on a half-installed chain.

### Step 1: Execute Codebase Improvement Exploration
- Run the exploration step from the upstream `skills/engineering/improve-codebase-architecture` skill if it is installed locally (source: https://github.com/mattpocock/skills/tree/main/skills/engineering/improve-codebase-architecture). **Installing that skill alone yields a stub** — it is declared `disable-model-invocation: true` and offloads its logic to `grilling`, `domain-modeling`, `codebase-design`, and its own `HTML-REPORT.md` + `agents/openai.yaml`. To get the full chain, clone the repo once and copy four folders:
  ```bash
  git clone --depth 1 https://github.com/mattpocock/skills "$TMPDIR/matt-skills"
  cp -r "$TMPDIR/matt-skills/skills/engineering/improve-codebase-architecture" ~/.agents/skills/
  cp -r "$TMPDIR/matt-skills/skills/engineering/codebase-design" ~/.agents/skills/
  cp -r "$TMPDIR/matt-skills/skills/productivity/grilling" ~/.agents/skills/
  cp -r "$TMPDIR/matt-skills/skills/engineering/domain-modeling" ~/.agents/skills/
  ```
  The dependency graph bottoms out at `grilling` and `domain-modeling` (both leaves). **Vendor the full chain by default** — the operator treats a half-installed dependency as a stub, not a partial win, and expects the complete self-contained set. Offer `codebase-design/` alone only when they explicitly ask for vocabulary-only. The four folders are already vendored in `~/.agents/skills/` on this machine — check there before re-cloning.
- **Vendor upstream conventions verbatim.** Copy each folder as-is: keep its frontmatter exactly, including `disable-model-invocation: true` — preserve the upstream invocation behavior, don't normalize it — and don't add fields the source doesn't use (e.g. `related_skills`); link companions inline the way the source does.
- **Durable operator conventions belong in `~/.agents/AGENTS.md`, not only in memory.** That file is the shared contract every harness syncs and reads (Freebuff, OpenCode, Gemini CLI, future ones); profile memory is profile-scoped and invisible to the other harnesses. When the operator asks for a rule that "others should know", write it there and commit it to the agents-home repo. Keep memory for state (what is installed, what is running); put conventions in the contract.
- **If the clone produces no directory in the terminal tool, run the identical command through `execute_code`'s `terminal()`** — it executes on a separate path that reaches the network when the direct terminal call does not. Clone to a native Windows path (the Hermes scratch dir), not a bare `/tmp`.
- Inspect git commit history (`git log --oneline -n 30`) and codebase hot spots across all top-level directories.
- **Discover scope with a live command, never from a recalled list.** Which repositories, directories, and project roots exist is a fact of the current filesystem, not of memory, a note, or a script's hardcoded array. When a question depends on the set of locations (which repos the loop ran in, where the working files are, which projects are active), enumerate that set with `search_files (target='files')` or a directory listing of the real root first, then report it. A remembered project path is a hypothesis — projects move, get renamed, and are deleted — and it silently narrows the search to folders that may no longer exist. When the operator names a repo or a file location you did not derive from the live tree, treat it as a correction and re-discover the whole scope rather than patching the remembered list.
- Look for shallow modules, seam leaks, latency bottlenecks, unhandled edge cases, or test gaps.
- **Caveat:** `grilling` and `domain-modeling` are auto-callable (`disable-model-invocation: false`), so once installed they may fire unprompted in unrelated sessions. Only vendor them if the full interactive workflow is wanted.
- **Highest-yield signal: logic duplicated between a writer and its gate.** When one module *produces* an artifact (a hash, a catalog, a copied file) and another *verifies* it, and both carry their own copy of the same table/parser/walker, a fix made in one silently diverges from the other — the pair can disagree while every gate stays green. Grep for the same helper name or the same literal table declared in two files, and for comments that point at each other ("see the other file, which applies the same …"). That cross-reference comment is the tell that the duplication is load-bearing, not cosmetic. Rank these `Strong`.
- **False-positive filter for git-log hot spots.** A cluster of commits fixing similar-sounding bugs is not proof of shared logic. Files that share a harness skeleton (same header, same scaffold, same preamble) but each prove a different property are independent by design — consolidating them destroys the per-issue proof. `git log` shows symptom recurrence; only a grep for the same helper name or literal table in two files shows shared code. Confirm the *logic* is shared before ranking a duplication candidate `Strong`.
- **If a shell `grep` prints a tool-usage banner instead of matches, it is aliased.** A `grep` returning `Usage: rtk.exe grep …` is a wrapper binary shadowing the real grep on PATH, not a missing pattern — and the wrapper truncates and reformats matches, so multi-line patterns and context blocks silently lose content. Read the file directly (`read_file`, `search_files`) instead of reformatting the shell command to satisfy the alias.

### Step 2: Extract & Rank Improvement Candidates
- Generate candidate cards with:
  - **Area / Files**: Path to affected files.
  - **Problem**: What causes friction, latency, or architectural shallowness.
  - **Solution**: Plain-English refactor / improvement plan.
  - **Benefits**: Locality, testability, leverage, or performance gains.
  - **Strength Badge**: `Strong`, `Worth exploring`, or `Speculative`.
- Append new candidates to the backlog in `SHARED_TASK_NOTES.md`: create it at the repository root if missing, and keep it out of commits by default — it is the loop's own working file (candidate backlog + iteration log).

### Step 2.5: Internal Grilling Gate (self-deliberation)
Upstream `grilling` interviews *the user*; this loop has no user in the seat, so the model runs both sides itself. Adapted from `skills/productivity/grilling` (Matt Pocock) — a **design tree worked in rounds**: each decision branches into the decisions that hang off it, and the *frontier* is every question whose prerequisites are already settled.

Work the top candidate from Step 2 through the tree. Use the local `codebase-design` skill (`~/.agents/skills/codebase-design/SKILL.md`, vendored) for the vocabulary — module, interface, depth, seam, adapter, leverage, locality — and its companion references (`DEEPENING.md`, `DESIGN-IT-TWICE.md`) when a seam or interface decision needs deepening.

1. **Build the frontier.** List every decision that must be settled before this candidate can be planned safely: constraint questions (does it touch a `AGENTS.md` boundary?), dependency questions (does it change a seam?), scope questions (`≤ 3` files / `≤ 120` lines?), test questions (can the deepened module be tested *through* its interface?), risk questions (destructive? reversible?). Ask the whole frontier at once — one round.
2. **Answer only what you're confident about.** For each question, use `codebase-design` vocabulary and live evidence (`read_file`, `search_files`, `git log`, web/docs when current facts matter):
   - **Confident** (evidence-backed or logically forced) → answer it, **remove it from the frontier**, and add the new questions its answer unlocks. Recompute the frontier and run the next round.
   - **Not confident** (guess would be needed) → **do not guess and do not accept the recommended answer.** Either resolve it with a tool call, or stop and surface the open question to the user. A candidate that survives on guesses is not ready for Step 3.
3. **Confidence rule (hard gate).** Every frontier question must be resolved by evidence or explicit reasoning — never by picking the recommended option to keep momentum. The recommended answer is accepted *only* when confidence is justified by a live check, a forced logical consequence, or an authoritative source. One unforced guess blocks the gate.
4. **Done when the frontier is empty.** Every branch visited, nothing silently assumed. The surviving internal answers *are* the plan's preconditions — carry them into Step 3. Record the settled answers in `SHARED_TASK_NOTES.md` so the plan is auditable. Report the gate outcome to the operator in plain English — the codebase-design vocabulary (seam, module, depth) is for the agent's internal precision, not the human's reading; name the files and say what changes in everyday words.
5. If the gate cannot close (an unresolvable question), skip this candidate, note why, and grill the next one — never let the loop improvise past the blocker.

This gate replaces the upstream interactive grilling loop; it produces the same settled decision tree without requiring a user, and it fails closed rather than guessing.

### Step 2.5 rule that also governs every destructive closeout: never act on an ambiguous assent
When a decision is destructive (deleting the loop's working files, closing a PR, merging, force-pushing), a bare "k" / "ok" / "sure" from the operator is not confirmation of a specific option — it is an ambiguous assent that maps to several choices with different consequences. Ask one short clarifying question with the concrete options, and proceed only on an explicit pick. A wrong guess here is irreversible (deleting `loop-delivery.json` while a PR is still open destroys the handle for finishing it). The mirror of this is the confidence rule above: when the human is the ambiguous party, stop and ask, exactly as you would when the evidence is too weak to answer.

### Step 3: Pick Candidate, Create Branch & Plan Review
- Select the highest-priority unaddressed candidate.
- Create git branch: `improve/loop-iter-<N>-<topic>` (or `optimize/`, `fix/`, `refactor/`).
- Formulate a clear, bounded plan:
  - Scope: $\le 3$ files, $\le 120$ lines changed.
  - Machine-decidable acceptance criteria.
  - Review plan against safety rails. Read the project's `AGENTS.md` or `README.md` to identify critical boundaries and files to avoid.

### Step 4: Implement with TDD & Verify Before Completion
- **Load the local `test-driven-development` skill before writing the test.** The step mandates RED/GREEN but does not point at the installed skill, so the agent free-styles the test shape. When no local TDD skill exists, write the test first per the RED/GREEN discipline below.
- **Write Test First (RED)**: Add unit/regression test reproducing the issue or validating the new capability.
- **Implement Minimal Fix (GREEN)**: Write clean, focused implementation.
- **Node test pitfall:** `await import(...)` only works at a module's top level, never inside a synchronous `test(() => {…})` callback — it throws `SyntaxError: Unexpected reserved word` and the whole file fails to load, reporting as one opaque "test failed". Import the module under test at the top of the file like any other import; reserve dynamic `import()` for genuinely lazy loads.
- **Run the project's declared test command, not an ad-hoc runner invocation.** `node --test <dir>` treats the directory as a single test file and reports one opaque "test failed" (pass 0 / fail 1) while `npm test` runs the real suite. Read the command from the manifest (`package.json` scripts, `Makefile`, CI config) and use exactly that.
- **Verification Gate**:
  - Automatically detect the project's native test runner (e.g., `npm test`, `pytest -q`, `cargo test`) and run the test suite. Must be 100% green.
  - Run standard linting tools (e.g., `ruff check .`, `eslint`, `cargo clippy`).
  - Ensure zero test assertions were deleted or weakened.
  - **Attribute failures before fixing: re-run the same gate on the clean base.** When the project gate fails on files the change never touched, check out the default branch (or the PR's base commit) and run the identical command. Failures that reproduce on the clean base are pre-existing drift — report them and leave them; only failures unique to the branch belong to this iteration. Never fix unrelated drift inside a loop iteration, and never report green while known failures stand.
  - **In a mirrored content repo, fixing a mirror mismatch surfaces the version gate next.** When a repo publishes a mirror of a canonical folder and runs a content-hash check (folder vs `version.json`/site hash), copying in new content moves the hash and the next gate stage fails with "content hash is stale" even though the mirror now passes. That stage is not an error you introduced — it is the repo's declared follow-up step: bump the version (`+1.0` for a skill/content change) then re-sync the site, and re-run the full gate. Follow the gate's own printed instruction instead of reverting the fix or forcing a green.

### Step 5: Push Branch & Open GitHub PR
- Create conventional commit: `<type>(<scope>): <summary>`.
- Tag checkpoint: `loop-iter-<N>-<timestamp>`.
- Push the branch, then the checkpoint tag alone: `git push -u origin <branchName>`, then `git push origin loop-iter-<N>-<timestamp>`. Do not use `--tags` — it would push every local tag.
- Open PR via `gh pr create`:
  - Title: `[IMPROVE] <scope>: <summary>` — the conventional commit subject, so the PR is identifiable in a list. **Never put a bot mention in the title.** This step used to prescribe exactly that title, and two live PRs ended up carrying it; a clobbered title destroys the PR's identity in a list view and leaves no error. To request a review, comment `@coderabbitai review` on the PR instead.
  - Body: Include loop iteration, area, branch, a summary of why, real test output, and verification steps.
- **Record intent for the Step 8 gate.** Append an entry to `loop-delivery.json` at the repository root (create it; keep it out of commits, same as `SHARED_TASK_NOTES.md`) recording exactly what you just created:
  ```json
  { "repo": "OWNER/NAME", "prs": [ { "iteration": 1, "number": 60,
      "branch": "improve/loop-iter-1-<topic>", "title": "[IMPROVE] ...",
      "headSha": "dc76409", "tag": "loop-iter-1-<timestamp>" } ] }
  ```
  `headSha` is `git rev-parse HEAD` after the final push of this iteration — re-take it after Step 6 pushes review fixes, since that moves the head. Append one entry per iteration; never edit an earlier entry to match reality.

### Step 6: Code Review & Targeted Fixes
- **Wait for Review (bounded):** CodeRabbit takes a few minutes. Wait 3 minutes, then poll `gh pr view --json comments,reviews` every 60 seconds, capped at 10 minutes of total wait. If no review has arrived by the cap, note it in `SHARED_TASK_NOTES.md`, skip the remaining review-response steps below (including the `@coderabbitai resolve` comment), and continue to Step 7 — never wait indefinitely.
- **Recognize a rate-limit, not a review.** The free OSS plan allows roughly one review per hour, so a loop that opens several PRs in one sitting gets later PRs answered with a "Review limit reached / next review in ~N minutes" notice instead of a real review. That notice is NOT a review — do not treat its presence as reviewed, and do not wait out the ~hour. Distinguish the two by grepping the bot comment for "Review limit reached" / "rate limited" versus an actual findings body ("No actionable comments" or a list of findings). Mark the PR *unverified* in `SHARED_TASK_NOTES.md` and continue.
- **Re-ping only after the head is final.** CodeRabbit is an incremental reviewer and will not re-review commits it already saw, so a `@coderabbitai review` posted before a rebase or a fix lands on stale commits. Finish the head first (rebase onto `main`, resolve conflicts, push), then ping — the review must cover the delivered head.
- **Detect that the review actually landed; the ack is not the review.** The bot's reply to `@coderabbitai review` is a ~400-byte "Action performed / Review finished" acknowledgement; the findings arrive later as a separate bot comment with a multi-KB body or as inline review comments, and `gh pr view --json reviews` can stay empty throughout. Poll `gh pr checks <n>` for the CodeRabbit check to reach "Review completed" and the issue-comments timeline (`gh api repos/OWNER/REPO/issues/<n>/comments`, filtering `coderabbitai[bot]`) for a body of ~5 KB or more. Zero inline comments plus a body containing "No actionable comments" is a clean review — mergeable.
- Inspect automated CodeRabbit review.
- **Severity Action Matrix**:
  - **Critical / High / Major**: Always fix immediately.
  - **Valid / High-value suggestions**: Fix and batch.
  - **Minor / Low / Nitpicks**: Leave out and skip.
- Batch all accepted fixes into **one commit** and push once.
- Post summary comment explaining what was resolved.
- Post separate `@coderabbitai resolve` comment.
- Leave PR as is.

### Step 7: Bridge & Move to Next Candidate (Loop)
- **Delivery Gate (mandatory, blocks the loop):** run Step 8 before *any* further iteration and before reporting the run as finished. A created PR is a claim, not a fact, until the remote confirms it.
- Record completed iteration in `SHARED_TASK_NOTES.md`.
- **Cleanup & Reset (guarded):** Before cleanup, run `git status --porcelain`. Anything it shows that the loop did not create is user work: stop and report it — no `git stash`, no `git clean -fd` over user files. Remove only the loop's throwaway artifacts (branch, checkpoint tag, any PR local state) — do **not** delete `SHARED_TASK_NOTES.md` or `loop-delivery.json` here; those persist until the run is fully finished (see **Run-End Cleanup** below). Then check out the repository's default branch (resolve it via `gh repo view --json defaultBranchRef --jq .defaultBranchRef.name`; fallback: `git symbolic-ref refs/remotes/origin/HEAD`) and `git pull`.
- **Iteration Cap:** Read the cap at loop start from the `MAX_ITERATIONS` environment variable (default: 3), and count this run's completed iterations from the log in `SHARED_TASK_NOTES.md` — a new invocation starts a fresh count. When the cap is reached, run the Step 8 gate one final time, then terminate the loop to protect API budget. Otherwise, immediately repeat from **Step 1**.
- **Run-End Cleanup (terminal only, never mid-loop):** once the loop is finished — Step 8 gate passed AND (cap reached OR no viable candidate remains) — delete the two working files the loop owns: `SHARED_TASK_NOTES.md` and `loop-delivery.json`. Both are kept out of commits (`.gitignore` them), so nothing in history depends on them.
  - **Confirm the run is terminal before deleting.** Read the iteration log in `SHARED_TASK_NOTES.md` and the manifest: if any iteration is still open, unmerged, or never reviewed, the run is mid-flight — close it out first (rebase, review, merge — see `references/merging-stacked-prs.md`), then delete. Working files left after a session mean either a finished run that never cleaned up or a run still in progress; the notes say which.
  - **Delete only after delivery is verified terminal.** Normally that is the final gate exiting 0. A gate that exits non-zero solely on the expected deltas — `state` FAIL on a merged PR, a `headSha` moved by a documented rebase (see Step 8) — still counts as delivered once every PR is MERGED and CI is green. Any other FAIL means the manifest still has work: fix the cause, re-run the gate, then clean up.
  - **Never delete mid-loop.** The iteration cap counts from `SHARED_TASK_NOTES.md`, and Step 8 reads intent from `loop-delivery.json`; removing either between iterations breaks the loop's own bookkeeping.
  - If the run ended **unverified** (gate could not run), delete both anyway but state that explicitly in the closeout — they are working state, not evidence.
  - These files are a within-run ledger. Step 1 re-derives candidates from the live codebase each invocation, so deleting them costs the next run nothing.
  - **Verifying cleanup is a discovery search, not a remembered list.** When asked whether leftovers exist, enumerate the locations with `search_files (target='files')` over the real root (e.g. the projects root, then the home directory) and report the exact boundary searched plus the file set returned. Never answer from a recalled project list, a memory entry, or a script's hardcoded repo array — those go stale, and reporting "nothing exists anywhere" from an unsearched scope is a false negative. If a search errors, times out, or is interrupted, that proves nothing: say the search failed and re-run it scoped, rather than concluding absence.

### Step 8: Verify Delivery Against the Remote (gate — never skip)
A loop that trusts its own notes will happily report a PR as delivered after something silently rewrote it. That is not hypothetical: in one run two PR titles were clobbered to `@coderabbitai`, every gate stayed green, and the notes still read "PR opened with body X". The loop had checked the *name* of the artifact, never its value.

Read every created PR back from GitHub and compare it field by field against `loop-delivery.json`:

```bash
node <this-skill-dir>/scripts/verify-delivered-prs.js --manifest loop-delivery.json
```

The gate checks, per PR: number, exact title, head branch, head SHA prefix, body non-empty, body names its branch, state is `OPEN`, not a draft, and the checkpoint tag exists on the remote. It prints `PASS`/`FAIL` per check with expected and actual values, and exits non-zero if anything mismatches.

- **Exit 0** → the remote holds what the loop intended. Record it and continue.
- **Exit non-zero** → **stop.** Do not record the iteration as delivered, do not report the run as finished, and do not start the next iteration. Fix the cause — restore the clobbered field with `gh pr edit`, re-push a moved head, or re-open a closed PR — then re-run the gate until it exits 0.
- **A merged PR fails the `state` check by design.** The gate asserts `state == OPEN`. Once the operator merges a loop PR, re-running the gate reports `state` FAIL on that PR while every other field (title, head SHA, branch, tag, body) still PASSes. That is the gate correctly refusing to call a *merged* PR an open one — not a defect. The merge is delivery beyond the gate's expectation. Read which check failed before reacting; only a non-`state` FAIL means the remote diverged from intent.
- **Operator merge policy:** when asked to merge the loop's PRs, merge only the ones that actually received a review and are clean; leave unreviewed (e.g. rate-limited) PRs open. See `references/merging-stacked-prs.md` for the rebase-and-merge procedure.
- **Never** edit `loop-delivery.json` to make the gate pass. Editing the expectation to match a wrong reality is the exact defect this gate exists to catch; the manifest records intent, not observation.
- If the gate itself cannot run (no `gh` auth, offline), say so explicitly and mark the iterations *unverified* in `SHARED_TASK_NOTES.md`. Never report "delivered" from an unrun gate.

Tests for the gate live in `evals/verify-delivered-prs.test.js` (`node --test evals/verify-delivered-prs.test.js`). They plant each failure mode and assert a non-zero exit, because a gate that cannot fail is the defect it is meant to prevent. Skill-level eval cases (basic run, gate failure, rate-limit notice, negative trigger) live in `evals/evals.json`.
