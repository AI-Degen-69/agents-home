# Issue #30 — `--out` caller audit for `grade.js`

Question: *Does any caller pass `--out` a value that is a legitimate output filename which
happens to match the Windows reserved-name pattern?*

Method: `grep -rn -- "--out " .` over the whole tree with `.git` excluded, plus a
`grep -rn "grade\.js"` sweep for anything that shells out to the grader.

## Result: 49 hits, 0 invocations

Counted against `origin/main` before this branch existed, so the number is not inflated by the
test script this issue adds:

```
$ git archive origin/main | tar -x -C "$W" && cd "$W"
$ grep -rn -- "--out " . | grep -v "^\./\.git/" | wc -l
49
```

| Category | Count | Example |
|---|---|---|
| Usage line inside `grade.js` (`--out <results.json>`) | 12 | `skills/*/scripts/grade.js:8` |
| Guard docblock mentioning `--out /dev/null` | 12 | `skills/*/scripts/grade.js:~192` |
| The runtime notice (`--out "..." is a null sink`) | 12 | `skills/*/scripts/grade.js:~238` |
| `usage:` string listing `[--out f.json]` | 12 | `skills/*/scripts/grade.js:~247` |
| Historical prose in `docs/issues/26-noticed-but-not-touching.md` (row N3) | 1 | the row that produced #30 |

Per-file: 4 hits x 12 `grade.js` copies + 1 in the #26 notes = 49.

Every one of the 49 is a string *inside a file*. None is a command that runs `grade.js`.

## Corroborating sweep: does anything invoke `grade.js`?

`grep -rn "grade\.js"` outside the `grade.js` files themselves returns only prose:

- `skills/create-issue/evals/intake.md:38` — "Grader: `scripts/grade.js` (zero-dependency Node...)"
- `skills/create-issue/README.md:44` — table row describing the file
- the same two lines repeated in `ii-plan-issue` and `vi-close-pipeline`
- `docs/issues/26-noticed-but-not-touching.md` rows N1/N2/N3

There is no `package.json`, no npm scripts, no `.github/workflows`, no Makefile, no CI config
of any kind in this repository. `scripts/` contains four maintenance tools
(`sync-harness-skills.ps1`, `sync-coderabbit.ps1`, `ecc-drift.ps1`, `pipeline-closure.js`) and
two bash proof scripts (`lane-precondition-test.sh`, `remote-branch-ownership-test.sh`); none
of them invokes `grade.js`.

## Decision

**A bare reserved name is never a legitimate `--out` target in this repo.**

`grade.js --out` is a human-typed, on-demand command. The only realistic values are a real
report path (`results.json`, `out/report.json`) or the Git Bash null sink. No automation passes
a name that could collide with `con` / `prn` / `aux` / `nul` / `com1-9` / `lpt1-9`, so discarding
those names cannot silently eat a report anyone depends on.

This decision is recorded in the guard's own docblock in all 12 `skills/*/scripts/grade.js`.

## Measured anchor behaviour

`WIN_DEVICE_RE` is anchored to the whole normalized string, so only a *bare* reserved name is
swallowed:

```
$ cd $T && node .../grade.js case --evals ... --out nul
[grade] --out "nul" is a null sink; output discarded, nothing written.
$ ls -a
.  ..                      # nothing written

$ node .../grade.js case --evals ... --out "$T/nul"
$ ls -a "$T"
nul                        # path-qualified: written normally
```

Git Bash rewrites a bare `/dev/null` argument to the string `nul`; it does not rewrite a
path-qualified `dir/nul`. The guard is therefore as narrow as it looks, and deliberately so.

## Proof

`scripts/grade-null-sink-test.sh` exercises all of this against the real `grade.js`, including a
negative control proving the guard is not simply refusing every write.