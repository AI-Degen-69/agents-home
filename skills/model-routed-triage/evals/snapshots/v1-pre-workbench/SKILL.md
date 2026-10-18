---
name: model-routed-triage-v1-pre-workbench
description: Forensic repo triage plus per-task model routing. Use when a repository has accumulated branches, worktrees, stashes, open issues, and PRs that need auditing against main, prioritizing into jobs, and assigning each task an economical model plus pipeline skill. Reads the operator's model-price reference first, then triages, sequences, routes, and repeats for the next job after each completion.
---

# Model-Routed Triage

Audit first, route second, repeat per job. Economics before everything.

## Step 0: Read the operator's economics (internal — do not print)

Read `C:\Users\Tiger\.agents\model-economics.md`. Price every routing decision
exclusively from it — never from global per-token API costs. If the file is
missing or a listed model is absent, stop and ask; do not invent prices.
This entire step is silent: no price tables, no value-math exposition — the
economics surface only as the Harness / Model / Effort choices in the Step 4
table.

Then establish value-for-money per candidate — price without capability is
meaningless:

1. **Availability, not memory:** route only models listed in the file. Never
   recommend a model from training knowledge or web search unless the operator
   confirms it exists on their harnesses at a stated price.
2. **Harness fit:** each task runs in a specific harness (opencode session,
   IDE agent, CLI runner). A model is eligible only where it is actually
   installed and switchable — note the harness per assignment.
3. **Capability evidence:** use benchmark figures only from sources read in
   this session (or prior verified session notes); vendor-reported numbers
   are labeled as such. No invented scores. Where no data exists, say so and
   price the risk instead (e.g. "free probe on the planning step; escalate on
   a sloppy plan").
4. **Value math:** cost = rate × expected wall time. But cheapest never wins
   automatically — capability carries weight, and the match runs both ways:
   - **Worthy tasks earn strong models.** Ambiguous scope, irreversible or
     money-adjacent consequences, subtle invariant preservation (e.g. PnL
     paths that must stay total-preserving), adversarial review — these
     justify the frontier reserve, because a weak pass costs more in rework
     than the hourly delta.
   - **Unworthy tasks must not burn frontier time.** Mechanical execution of
     a locked plan, well-gated refactors with red/green tests deciding
     correctness, babysitting, closeouts — a demolition hammer for a screw.
     Route the cheapest capable model and say why the ceiling is low.
   - **Rate limits and token budgets are costs too.** A frontier model that
     throttles mid-build is more expensive than its hourly rate suggests;
     factor availability windows into worthiness, not just dollars.
   State the expected spend per job so the operator sees what "value" means
   in money, not adjectives — and name which tasks were deemed worthy of the
   reserve and why, so the choice is auditable.

## Step 1: Forensic triage (evidence, not names)

Index every surface, then read actual contents — never judge by branch names,
PR titles, or issue labels:

1. `git branch -a -vv`, `git worktree list --verbose`, `git stash list`,
   `git status --porcelain -uall`, `gh pr list --state open/closed`,
   `gh issue list --state open`.
2. For each branch: divergence (`git rev-list --left-right --count
   main...<branch>`), ancestor check (`git merge-base --is-ancestor <branch>
   main` — note: check `$LASTEXITCODE`, a nonzero exit does not throw),
   and the three-dot content diff (`git diff main...<branch> --stat`).
   A branch whose tip is an ancestor of `main`, or whose unique diff is
   already merged under another hash, is superseded regardless of its name.
3. Read the diffs, file contents, and issue bodies. Verify each against
   current `main` architecture. Classify: integrate-ready / salvageable /
   superseded / obsolete.
4. Stashes: `git stash show --include-untracked --stat` per entry; check
   whether the contents already exist on `main` (grep for the new symbols).

Write the verdicts into audit tables (Branches & Worktrees / PRs & Issues /
Stashes & Scratches), each row ending in Keep / Salvage / Delete (or
Prioritize / Update / Close).

## Step 2: Prioritized job sequence (internal — do not print)

Synthesize Jobs 1..N (finish valuable WIP → prune dead weight → clean `main`),
each with context/directory, core task, deliverables + verification, and
carry-forward. After the operator completes a job, return here and produce
the routing table for the next most logical job by order and value. This
sequencing is working notes: never print it as a section — the chosen job's
tasks, order, and rationale surface inside the Step 4 table itself.

## Step 3: Read the pipeline skills before routing (internal — do not print)

Before assigning any skill in Step 4, read these in full — fit is judged
from their actual instructions, never from names or habit:

- `C:\Users\Tiger\.agents\skills\README.md` (pipeline table: stations
  I–VI plus `pipeline-triage` gate, `create-issue` intake, `quick-fix` lane)
- `ii-plan-issue\SKILL.md`, `iii-build-plan\SKILL.md`,
  `iv-review-build-and-pr\SKILL.md`, `v-babysit-pr-and-merge\SKILL.md`,
  `vi-close-pipeline\SKILL.md`, `pipeline-triage\SKILL.md`,
  `quick-fix\SKILL.md`

For each task, judge fit internally — never print a fit section. A one-line
fit note may live inside the Suggested Skill cell only when it clarifies the
choice; otherwise the selection speaks for itself. Pipeline skills are
suggestions, never mandates — `None` / `Prompt Only` is a valid, complete
routing when nothing fits. Re-read a skill when the task shape is unusual
rather than routing from memory.

## Step 4: Per-task routing table

Columns (left to right): `Task | Harness / Model / Effort | Suggested Skill | Prompt`.
- **Task:** ID plus clear human-readable title plus one short summary line
  written for non-developers — e.g. `T1 — Plan the board refresh: turn the
  issue into a buildable task list`. The ID (`T1`, `T2`, …) is the task's
  name for all later reference; what happens and why, no jargon.
- **Harness / Model / Effort:** one combined cell (e.g. `Freebuff /
  DeepSeek V4.1 Flash / High`). Effort is always stated.
- **Suggested Skill:** only when directly relevant; otherwise blank or N/A.
- **Prompt:** the ready-to-run session prompt, inside its own fenced code
  block with Markdown inside. Assign the cheapest capable model per station
  (free plans/closes, value builder, sharp bounded reviewer). The routing table is the last structured
  element: no detached paragraphs after it. Anything belonging to a task
  (including its setup) lives in that task's row, never in trailing text. Pipeline skills are suggestions, not mandates — include one
only where its instructions fit the task, else `None`/`Prompt Only`.

Output discipline (applies to every table, verdict, and recommendation):
list only what fits and is selected. Omit rejected models, non-fitting
stations, and failed alternatives entirely — no "quick-fix doesn't apply,"
no runner-up explanations, no failure inventories. If it is not assigned,
it does not appear. Noise-free output is a correctness requirement, not
a style preference.

Response formatting — every reply must scan in seconds: a clear header
hierarchy (`##` sections, `###` subsections, never flat walls of text),
**bold** on decisions, verdicts, and anything the operator must act on, and
a few topical emojis as visual anchors (e.g. 💰 economics, 🔍 triage,
🛣️ routing, ⚠️ warnings, ✅ done). Emojis mark structure, never decorate
prose — three to five per reply, always the same ones for the same things.

Issue and PR references are always hyperlinks, never bare numbers: resolve
the repo URL once (`git remote -v` or `gh repo view`), then render every
reference as `[#431](https://github.com/<owner>/<repo>/issues/431)` (or
`/pull/431` for PRs). The visible text stays short (`#431`); the link does
the navigating.

Prompt formatting: every generated prompt goes inside a fenced code block,
written with Markdown inside the block — agent-readable structure you can
also inspect. One block per task, copy-paste ready, no prose around it
that belongs inside it. Never restate the skill invocation inside the
prompt (no `/skill-name` first line) when the Suggested Skill column
already names it — the column carries the invocation, the block carries
only task instructions. And never duplicate the station skill's own
discipline into the prompt: the executing model reads the invoked skill
itself (slash-invokable in every harness here), so the block carries only
what the skill cannot know — the issue number, the named stale refs from
this audit, frozen repo-specific rules, and exact paths. General
procedure lives in the skill; job context lives in the block.

Every task row MUST also carry a **Your setup** block — the manual steps
you run before pasting the prompt, because harnesses default to
`main` and will happily start work on the wrong branch. The block is
structured, never a wall of text — short labeled lines with blank lines
between them:

- **Directory:** exact worktree/checkout path to open the session in.
- **Branch:** exact branch the session must be on (feature branch for build
  and later stations, `main` for planning intake). If the harness opens on
  `main` by default, say so and instruct the operator to switch the session
  to the feature branch first — never assume the harness follows the repo.
- **Verify:** every check as its own fenced code block, paste-ready, with
  the expected output stated on the line above it — shell verify commands
  and `gh` commands alike (issue comments, review triggers, checks). One
  command per block, never chained prose around them.
- State what each command must show before proceeding, and what stops the
  line (e.g. "ff-only fails → stop, do not merge").

Every generated prompt MUST carry the job-specific guards — the stale-ref
names from this audit, frozen repo rules, exact paths, and your
checkpoint format. General discipline (TDD loop, review gates, problem
classes) lives in the invoked station skill, which the executing model
reads itself: cite it by name, never paste it. A prompt that duplicates
the skill rots the moment the skill improves; a prompt that points at it
inherits every fix.

1. **Sync base first:** `git fetch origin`, compare `main` vs `origin/main`,
   `git pull --ff-only` if behind (stop on failure), tree clean. Station
   skills never fetch — this is always on the session.
2. **Staleness:** name every known-stale ref from the audit and forbid its
   reuse. Freshness is proven with `git rev-list --count`, never assumed
   from a branch/worktree's existence.
3. **No destructive git ops** (branch/worktree/remote deletes, stash drops,
   reverts of others' files) without declaring each one and receiving a yes.
4. **Three recording homes, never mixed — and every line carries an owner
   and a when:** code-level out-of-scope rows go in
   `docs/issues/<n>-noticed-but-not-touching.md` (Status open, Resolved-by
   empty); run-environment caveats go in named `tasks/plan.md` sections;
   tree state is proven by `git status`, never prose. A limitation line
   without an owner (model / you / named future issue) and a when
   (never / this round only / when-X-happens / your task with a date)
   is an incomplete report — send it back. Silence about a missing tool,
   person, or file is itself a defect in the report. Address the human
   reader as "you", never "the operator" — every owner and instruction
   must read as speaking to the person in front of the screen.
5. **Decided tree exit:** every uncommitted change ends committed-with-reason
   or reverted-with-reason; state any forbidden outcome explicitly.
6. **Scope disputes** route to the reviewer with a fix-size rule (fix in round
   if tiny, else justify the park in the row) — never back to the builder,
   never silent expansion.
7. **An external review round is never a substitute for station reviewers.**
   A triggered third-party review does not cover a skipped deterministic
   step or a skipped local specialist (reviewer personas, subagents, local
   CLIs). Skipping them requires proof of absence (a directory listing or
   PATH check quoted in the report), never an assumption — specialists that
   ship with your setup are present until proven otherwise. A skip with no
   reason is sent back for one line; a skip with a tooling reason needs
   named substitute coverage for that round only.
8. **Every problem is one of exactly three classes. Classify first, act
   second — "accept forever" is not a class:**
   - **Class 1 — trivially fixable in place** (e.g. a bad ambient value in
     the shell: correct it and rerun): fix it yourself before continuing.
     Never report as a failure something one command resolves; report the
     fix in one line ("was X, ran Y, green") and move on.
   - **Class 2 — tried, related, couldn't** (an expected input is absent —
     fixture, file, tool, or specialist): try once in place so the flow
     doesn't break. On failure, report what you attempted, and tell you
     exactly what you can run to verify and/or fix it (paste-ready command
     plus what it must show). If you cannot fix it either, the report
     states the proportionate measure for the problem's scope: substitute
     coverage for this round, a parked row with a named resolver, or a new
     issue. Standing substitutes are forbidden: a skipped reviewer is never
     covered by "the external round runs anyway" — an extra round is an
     addition, not a replacement, and rate limits make it unreliable as one.
   - **Class 3 — symptom of a bigger blocking problem** (this work depends
     on that fix): stop and report immediately, in plain words, with the
     reason — plus the explicit suggestion to either file an issue and fix
     it now, or finish this task first and address it right after the issue
     exists. Never silently work around a blocker.
   A limitation line that fits none of the three goes back as incomplete.
9. **Your checkpoint:** every station ends with branch name + file paths
   verifiable from `main` via `git show <branch>:<path>` — no chat-history
   dependence. Same-window model switches preserve context; confirm the prior
   station's exit state before switching.

## Anti-patterns (learned)

- Starting work in a pre-existing worktree/branch without a freshness check.
- Mixing ledger rows, environment caveats, and tree state into one prose
  report the operator cannot verify or locate.
- Treating a skill's silence as permission (skills don't fetch, don't check
  branch freshness, don't guard remotes).
- Guard text without an independent tripwire — every guard pairs with a
  command the operator can run in 30 seconds.
