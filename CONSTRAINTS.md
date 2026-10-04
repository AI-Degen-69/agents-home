# CONSTRAINTS — Issue #30

Branch: `i30/grade-null-sink-guard-test` | Issue: #30

## Stack (auto-detected)
- Runtime: Node.js (zero-dependency, CommonJS, `fs` only)
- Test runner: **none** — repo convention is standalone `bash` proof scripts in `scripts/*-test.sh`
  printing PASS/FAIL counters, exit 0 = all pass, 1 = a scenario failed, 2 = test invalid.
- No `package.json`, no CI config. Verification = running the script directly.

## Hard boundaries
1. **Zero regressions** — `scripts/grade-null-sink-test.sh` must exit 0.
2. **No new dependency.** `node` + `bash` only, stdlib only.
3. **Guard semantics frozen.** `WIN_DEVICE_RE` and `isDiscardTarget` bodies are NOT modified.
   This issue proves the guard; it does not change it.
4. **Docblock edits only** inside `skills/*/scripts/grade.js`. No logic, no reformat, no reorder.
5. **Anti-cheat** — the test must FAIL if the guard is removed. A test that passes with the
   guard deleted is not a test. Proved in Task 4.
6. **No working-tree pollution** — every `grade.js` invocation runs in a `mktemp -d` sandbox
   removed on exit; the script fails if a stray file is left behind.
7. **No scope expansion** — no change to matching rules, no eval-pipeline change, no Windows
   path work outside `grade.js`.

## Performance ceiling
Four `node grade.js` invocations total. Budget under 15s wall clock. No threshold assertion
beyond the exit code.

## Test design constraint
`lane-precondition-test.sh` transcribes prose rules into a `verdict()` shell function, which
drifts when the skill is rewritten. Not applicable here: the guard is real executable code, so
the test invokes the real `grade.js` instead of re-implementing the regex. That removes the
rule-drift risk, so no `require_clause` tripwire is needed.