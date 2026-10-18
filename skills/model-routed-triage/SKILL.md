---
name: model-routed-triage
description: Forensic repo triage plus per-task model routing. Use when a repository has accumulated branches, worktrees, stashes, open issues, and PRs that need auditing against main, prioritizing into jobs, and assigning each task an economical model plus pipeline skill. Reads the operator's model-price reference first, then triages, sequences, routes, and repeats for the next job after each completion.
---

# Model-Routed Triage

Audit first, route second, repeat per job. Economics before everything.

Conventions: `AGENTS_HOME` below means this machine's agents root
(`C:\Users\Tiger\.agents` here) — every absolute path hangs off it, so the
skill ports by changing one line.

## Step 0: Read the operator's economics (internal — do not print)

Read `AGENTS_HOME\skills\model-routed-triage\references\models.md`. Price every routing decision
exclusively from it — never from global per-token API costs. If the file is
missing or a listed model is absent, stop and ask; do not invent prices.
Also read `references/capability.md` for the worthiness/class → grade mapping; capability
ranks the cheapest-capable model per task class, `models.md` prices it.
Both files are organized **per harness** (identical structure under each
`## <Harness>` heading: pricing → effort levels → inventory table → grade
table → model justification). Model IDs (`M1`, `M2`, …) are stable **per
harness**, not global — a model absent from a harness's grade table is
`[unverified]` there and must not ship an irreversible final step.
This entire step is silent: no price tables, no value-math exposition — the
economics surface only as the Harness / Model / Effort choices in the Step 4
table.

Then establish value-for-money per candidate.

1. **Availability, not memory:** route only models listed in the file. Never
   recommend a model from training knowledge or web search unless the operator
   confirms it exists on their harnesses at a stated price.
2. **Harness fit:** each task runs in a specific harness. A model is eligible only where it is actually installed and switchable — note the harness per assignment.
2b. **Confidentiality before routing:** if the repository or task is private/confidential, do not route to models whose data policy trains on prompts/completions (e.g. CL-4 Muse Spark Contributor on Cline). Route to no-train or open-weight models only; verify the model's data policy exists and is acceptable before selection.
3. **Capability evidence:** use benchmark figures only from sources read in
   this session (or prior verified session notes); vendor-reported numbers
   are labeled as such. No invented scores. Where no data exists, say so and
   price the risk instead (e.g. "free probe on the planning step; escalate on
   a sloppy plan").
   - **Primary yardstick = Artificial Analysis Intelligence Index.** For any
     model, read `https://artificialanalysis.ai/models/<model-name>` first and
     use its Intelligence Index score as the calibrated, cross-model evidence;
     cite the slug/URL in `references/capability.md`. If a model is absent from
     AA (common for stealth/free tiers), state that explicitly and fall back to
     cited third-party pass@1 numbers — never vendor copy alone.
   - **Vendor "beats the frontier" claims are signal, not proof.** A model card
     stating "beats GPT-X / Claude-Y on DeepSWE…" is not verified capability
     unless an independent source (AA index, or a citable third-party re-run
     with pass@1 numbers) backs it. Never let one unverified "beats" claim
     carry a grade.
   - **Score conflicts must be surfaced, not resolved.** When a model shows
     different numbers across sources (e.g. a partner-launch figure vs the GA
     model-page index), record both, take the most authoritative (GA model page)
     as primary, and flag the conflict in the risk flags.
   - **Free-tier / absent free tier.** A model's free tier is frequently absent
     from Artificial Analysis. When it is, grade `[unverified]` (or C/D) and route
     probe-only — do **not** back-infer the free tier's grade from the provider's
     paid/Max index; the gap can be a full grade band and community reports rate
     free tiers as average or degraded vs Max. Keep `[unverified]`/`C` models off
     the irreversible final step; re-grade once free-tier benchmarks surface.
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

Collect the repository surfaces in one pass:
```bash
node scripts/repo-triage.js
```
Or inspect manually:
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

- `AGENTS_HOME\skills\README.md` (pipeline table: stations
  I–VI plus `pipeline-triage` gate, `create-issue` intake, `quick-fix` lane)
- `ii-plan-issue\SKILL.md`, `iii-build-plan\SKILL.md`,
  `iv-review-build-and-pr\SKILL.md`, `v-babysit-pr-and-merge\SKILL.md`,
  `vi-close-pipeline\SKILL.md`, `pipeline-triage\SKILL.md`,
  `quick-fix\SKILL.md` (all relative to `AGENTS_HOME\skills`)

For each task, judge fit internally — never print a fit section. A one-line
fit note may live inside the Suggested Skill cell only when it clarifies the
choice; otherwise the selection speaks for itself. Pipeline skills are
suggestions, never mandates — `None` / `Prompt Only` is a valid, complete
routing when nothing fits. Re-read a skill when the task shape is unusual
rather than routing from memory.

## Step 4: Per-task routing & executable cards

Keep the routing table clean and concise for fast scanning, and place the ready-to-run Prompt and Setup blocks directly below the table in dedicated, copy-pasteable Markdown blocks.

### 1. Routing Summary Table

Columns (left to right): `Task | Harness / Model / Effort | Suggested Skill | Objective`.

- **Task:** ID plus human-readable title (e.g. `T1 — Plan the board refresh`).
- **Harness / Model / Effort:** one combined cell (e.g. `Freebuff / DeepSeek V4.1 Flash / High`). Effort is always stated.
- **Suggested Skill:** slash command / skill link only when directly relevant (e.g. `/ii-plan-issue`); otherwise blank or N/A.
- **Objective:** One plain-language summary line describing what the session delivers.

### 2. Executable Task Cards (Ready for Copy-Paste)

For each task in the table, provide an executable task section immediately following:

#### Task [ID]: [Title]

**Your setup:**

- **Directory:** exact worktree/checkout path to open the session in.
- **Branch:** exact branch the session must be on (feature branch for build and later stations, `main` for planning intake).
- **Pre-flight Verify:**

```powershell
git status --short                     # Expected: empty (clean tree)
git rev-list --count HEAD..origin/main # Expected: 0 (synchronized)
```

**Session Prompt (Copy & Paste):**
Place the entire ready-to-run session prompt in a single clean code block (` ```markdown `).

Prompt rules:

- **Strictly forbid skill boilerplate across ALL stations**: Never recite general station mechanics, standard skill workflows, TDD loops, or review checklists that the station skill already defines. General discipline belongs in the cited station skill (e.g. `/ii-plan-issue`, `/iii-build-plan`, `/iv-review-build-and-pr`, `/v-babysit-pr-and-merge`, `/vi-close-pipeline`), which the executing model reads itself.
- **Mandate pure domain-specific delta & intelligence per station type**:
  - **Station II / III (Plan / Build)**: Problem-specific architectural intent, exact formulas, invariants (`round(p_up + p_down, 4) <= round(cfg.max_pair_cost, 4)`), domain edge cases, parameter thresholds, and subsystem files.
  - **Station IV / V (Review / Babysit)**: Strictly FORBID repeating generic review rules (e.g. "one review round", "no secondary review", "CI is merge gate"). MUST state issue-specific diff invariants, anticipated reviewer traps/false-positives (e.g. why an equality check is correct, why telemetry must not be consumed in loop), and targeted test commands for touched modules.
  - **Station VI (Closeout)**: Strictly FORBID generic closeout lines (e.g. "verify issue is closed"). MUST name the exact per-issue plan/constraint files to clear, specific symbols/functions to verify zero unwanted references for, and exact cleanup targets.
- Structure:
  1. `# Context & Target`: Issue link, current state, and the specific station goal.
  2. `# Domain Intelligence & Traps`: Architectural rules, mathematical invariants, domain edge cases, traps to avoid, and exact subsystem files/parameters.
  3. `# Job Guards`: Sync check, forbidden outcomes, and out-of-scope recording home (`docs/issues/<n>-noticed-but-not-touching.md` with owner and when).
  4. `# Checkpoint`: Precise, verifiable exit condition.

Do NOT nest markdown prompt code blocks inside table cells. Keep them full-width, clean, and immediately copyable.

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
7. **No external round substitutes for station reviewers** — rule lives in
   Class 2's standing-substitutes ban below; this guard exists only so the
   routing table states it per task.
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
     Skipping a local specialist requires proof of absence (directory
     listing or PATH check quoted in the report), never an assumption.
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

Full list of operational pitfalls and prevention rules: see [`references/anti-patterns.md`](references/anti-patterns.md).
Key rules: verify branch divergence with `git rev-list --count` before starting, pair `models.md` with `capability.md` (never route cheapest-first blindly), and never let an `[unverified]` model ship an irreversible final step.
