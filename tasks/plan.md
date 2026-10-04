# Plan — Issue #30: Exercise the grade.js null-sink guard

Branch: `i30/grade-null-sink-guard-test` | Issue: #30
Tier: **Small** (task type: Code + Docs + Debug) | Verification: standalone bash proof script

## Open questions resolved from code (the `needs-answers` label)

### Q1 — Does any caller pass `--out` a bare reserved name?

**Answer: no. There are zero `--out` callers in this repo, so a bare reserved name is never a legitimate target here.**

Full enumeration (`grep -rn -- "--out " .` over the whole tree, `.git` excluded) yields 37 hits,
and every one of them is a string *inside a file*, never a command that invokes `grade.js`:

| Category | Count | Example |
|---|---|---|
| Usage/doc lines inside `grade.js` itself | 36 (12 files x 3) | `skills/*/scripts/grade.js:8` `--out <results.json>` |
| Guard docblock mentioning `/dev/null` | included above | `skills/*/scripts/grade.js:213` |
| Historical prose (`docs/issues/26-...md` row N3) | 1 | the row that produced this issue |

Corroborating evidence that nothing shells out to `grade.js`:
- `grep -rn "grade\.js"` outside `scripts/grade.js` itself returns only `evals/intake.md` and
  `README.md` prose lines ("Grader: `scripts/grade.js`"), plus `docs/issues/26-...md`.
- No `package.json`, no npm scripts, no `.github/workflows`, no Makefile, no CI config at all.
- `scripts/` holds four maintenance tools (`sync-harness-skills.ps1`, `sync-coderabbit.ps1`,
  `ecc-drift.ps1`, `pipeline-closure.js`) and two proof scripts; none invokes `grade.js`.

So `grade.js --out` is a **human-typed, on-demand** command. The only realistic values a caller
passes are a real report path (`results.json`, `out/report.json`) or the Git Bash null sink.

**Decision: a bare reserved name is never legitimate.** Record it in the guard docblock.

### Q2 — Is the guard actually correct? (measured, not assumed)

Verified live during Station II:

```
$ node skills/ii-plan-issue/scripts/grade.js case --evals ... --out "$T/nul"
  -> writes $T/nul          # path-qualified: NOT discarded. Regex is anchored to the whole
                             # normalized string, so only a *bare* reserved name is swallowed.

$ node .../grade.js case --evals ... --out nul        # run from inside $T
[grade] --out "nul" is a null sink; output discarded, nothing written.
$ ls -a
.  ..
```

The guard behaves exactly as the issue suspected: narrow, and correct. The asymmetry the issue
names (silent discard that looks like success) is real — `grade.js` still exits 0 and still prints
the summary to stdout — but it now has a stderr line naming the discarded value.

Note the `$T/nul` case: Git Bash does **not** rewrite a path-qualified `/nul`, only a bare `/dev/null`
argument. That is worth one sentence in the docblock so the next reader does not re-open it.

### CodeRabbit plan intake
No `coderabbitai` comment on #30. Nothing adopted, nothing rejected, nothing `[UNVERIFIED]`.

## Spec (Small tier — embedded, no SPEC.md)

**Goal.** Prove, executably, that the null-sink guard discards `--out nul` instead of writing a
file, and record the reserved-name decision in the guard's own docblock.

**Acceptance criteria (from the issue, mapped to tasks):**
1. Every `--out` caller enumerated with its value → Task 1 (the table above, plus
   `docs/issues/30-caller-audit.md`).
2. The decision written in the guard docblock → Task 2.
3. A runnable test proving `--out nul` writes nothing, no new dependency → Task 3.

**Out of scope (issue's own words):** changing the guard's matching rules, changing the eval
pipeline, any Windows path work outside `grade.js`.

## Interface contracts

None. No public API, no exported type, no schema. `isDiscardTarget` and `WIN_DEVICE_RE` keep their
exact current bodies in all 12 files (verified byte-identical: the guard block md5s to
`3dbfc6aea5fdee04a160cb8a4dfff4c7` in every one of the 12 copies).

## Task decomposition

Dependency graph:
```
T1 (caller audit)
 └──> T3 (test)          # the test's docblock names the audited caller set
T2 (docblock x12) ──┐
                    └──> T3
T3 (test) ──> T4 (anti-cheat proof)
```
Ordering is risk-first: T3 is the task that can fail (a test that passes without the guard would
be worse than no test), so it lands before the docblock work is considered done.

### T1 — Audit and record every `--out` caller
- **Size:** S | **Domain:** `[Research]` + `[Docs]`
- **Files:** `docs/issues/30-caller-audit.md` (new)
- **Builds:** the enumeration table above, committed as a durable artifact so Station VI can
  point at it and a future session never re-runs the grep.
- **Helper:** none (plain shell + prose)
- **Depends on:** —
- **Verify:** `test -f docs/issues/30-caller-audit.md` and the recorded count matches a fresh
  `grep -rn -- "--out " . | grep -v '^\./\.git/' | wc -l`.

### T2 — Record the reserved-name decision in the guard docblock
- **Size:** M (12 files, same 4 added lines each) | **Domain:** `[Docs]`
- **Files:** all 12 `skills/*/scripts/grade.js` — docblock only
- **Builds:** append to the existing guard docblock:
  - the caller-audit conclusion (no in-repo caller; `grade.js --out` is human-typed)
  - why a bare reserved name can never be legitimate here
  - the measured anchor behaviour (path-qualified `dir/nul` is written; only bare `nul` is swallowed)
- **Helper:** none
- **Depends on:** T1
- **Verify:** guard block md5 is **identical across all 12** (drift check — they were identical
  before, they must stay identical), and `node -c` / an actual `grade.js case` run still works.

### T3 — Add `scripts/grade-null-sink-test.sh`
- **Size:** S | **Domain:** `[Code]` + `[Debug]`
- **Files:** `scripts/grade-null-sink-test.sh` (new)
- **Builds:** follows the repo's existing proof-script convention (`lane-precondition-test.sh`,
  `remote-branch-ownership-test.sh`): `set -u`, PASS/FAIL counters, three banner sections,
  `SRC="${1:-...}"` so it runs from any clone, mktemp sandbox + `trap` cleanup. Four scenarios:
  - **A** `--out nul` in a sandbox → no file named `nul` appears, stderr names the null sink
  - **B** `--out /dev/null` and `--out /dev/nul` → nothing written
  - **C** `--out nul.txt` and `--out con` → nothing written (the extension form)
  - **D** negative control: `--out $T/real.json` → the file **is** written with valid JSON
    (proves the guard is not simply refusing every write)
- **Depends on:** T1, T2
- **Verify:** `bash scripts/grade-null-sink-test.sh` → exit 0, 4 PASS, 0 FAIL.

### T4 — Prove the test is not vacuous (anti-cheat)
- **Size:** XS | **Domain:** `[Debug]`
- **Files:** none (throwaway mutation in the sandbox copy, reverted)
- **Builds:** copy the repo tree to a temp dir, delete the `isDiscardTarget` guard branch from one
  `grade.js` copy, run the test against that copy → scenario A must FAIL. Then discard the copy.
- **Depends on:** T3
- **Verify:** the mutated run exits non-zero. This is the evidence for CONSTRAINTS rule 5.

### Checkpoints
- After T2: "12/12 docblocks updated, guard blocks still byte-identical, `grade.js case` still runs."
- After T4: "test proven to fail without the guard." Then hand to Station IIIB / IV.

## One improvement proposal (evidence-based, adopt-by-default)

**Verbatim evidence, issue body:** *"The regex anchors the whole normalized string, so
`path/to/con` is **not** discarded — only a bare `con`, `nul.txt`, `com1`, etc."*

**Proposal:** T2's docblock addition states that path-qualified names are intentionally *written*,
because Git Bash only rewrites a bare `/dev/null` argument — the guard rewrites nothing else.
Classified as **simplification / documentation hardening**, grounded in a measurement taken in
Station II, and folded into T2. No scope expansion.

## Rejected
- **A full unit-test suite for the regex** (`/dev/null`, `/dev/nul`, `com1`, `aux.txt`,
  `path/to/con`, case-insensitivity): the operator chose the focused single test at the Station I
  mode gate, and the four scenarios in T3 already cover the discard property plus the negative
  control. Recorded here so it does not resurface.
- **`isDiscardTarget` unit-export** (`module.exports`): would add a public surface to satisfy a
  test. The real `grade.js` invocation is a stronger proof and needs no export.