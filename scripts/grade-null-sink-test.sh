#!/usr/bin/env bash
# Executable proof for Issue #30: the grade.js null-sink guard must DISCARD a
# reserved-name --out target, and must still WRITE an ordinary one.
#
# Before this script existed the guard shipped via PR #29 with nothing asserting
# it. A silently discarded grade report is indistinguishable from a successful run
# to anyone reading the exit code, so the property is now proven by running the
# real grade.js - not by re-implementing WIN_DEVICE_RE here. Testing the real
# artifact also means this file cannot drift away from the code the way a
# transcribed verdict() can.
#
# Four scenarios:
#   A. --out nul in a sandbox        -> nothing written; stderr names the sink
#   B. --out /dev/null, /dev/nul     -> nothing written (why the guard exists)
#   C. --out nul.txt, con, COM1      -> nothing written (extension / case forms)
#   D. --out <tmp>/real.json         -> written, valid JSON, not misreported
#      --out <tmp>/nul               -> written: the regex is anchored, so a
#                                       path-qualified name is an ordinary file
#
# "Nothing written" is asserted by diffing the sandbox before and after each run,
# never by testing one guessed path: Git Bash rewrites a bare /dev/null argument
# to the string `nul`, so the file that a regression would create is not always at
# the path that was passed.
#
# Exit 0 = every scenario produced its expected outcome.
# Exit 1 = a scenario failed.
# Exit 2 = the test could not run (grade.js, evals, node, or the guard missing) -
#           a fixture problem, not a verdict.

set -u
PASS=0; FAIL=0
# Default to the checkout this script lives in, so the test runs in any clone.
# A positional argument still wins, which is how the anti-cheat mutation in
# T4 points the test at a deliberately broken copy.
SRC="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
GRADE="$SRC/skills/ii-plan-issue/scripts/grade.js"
EVALS="$SRC/skills/ii-plan-issue/evals/evals.json"
SKILL="$SRC/skills/ii-plan-issue/SKILL.md"

# ---------------------------------------------------------------------------
# Fixture binding: the scenarios below cannot assert anything without these.
# ---------------------------------------------------------------------------
for f in "$GRADE" "$EVALS" "$SKILL"; do
  if [ ! -f "$f" ]; then
    echo "TEST INVALID: missing $f"
    echo "             grade.js or its evals moved - re-point GRADE/EVALS/SKILL."
    exit 2
  fi
done
if ! command -v node >/dev/null 2>&1; then
  echo "TEST INVALID: node is not on PATH"; exit 2
fi
# The guard itself must still be present, or scenarios A-C would "pass" for the
# wrong reason. This tripwire keeps the negative control honest.
#
# Match the DECLARATION, not the identifier: `isDiscardTarget` still mentions
# WIN_DEVICE_RE in its body, so a plain substring search keeps matching after the
# `const` line is deleted - and the tripwire would stay quiet while the guard was
# actually gone. Anchoring on the declaration is what makes this a real check.
if ! grep -qE '^const WIN_DEVICE_RE[[:space:]]*=' "$GRADE"; then
  echo "TEST INVALID: $GRADE no longer declares WIN_DEVICE_RE"
  echo "             If the guard was removed on purpose these scenarios are"
  echo "             meaningless - delete this test rather than trust its verdict."
  exit 2
fi

echo "=============================================================="
echo " FIXTURES - grade.js null-sink guard"
echo "=============================================================="
echo "  grade.js : $GRADE"
echo "  evals    : $EVALS"
echo "  skill    : $SKILL"
echo

ok()  { echo "    PASS  $1"; PASS=$((PASS+1)); }
bad() { echo "    FAIL  $1"; FAIL=$((FAIL+1)); }

T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
# cwd matters: scenarios A-C pass BARE names, so any file a regression creates
# lands in whatever directory grade.js is launched from. Run from the sandbox so
# a regression cannot litter the operator's working tree.
cd "$T" || { echo "TEST INVALID: cannot cd to sandbox"; exit 2; }

# Everything currently in the sandbox, one path per line.
sandbox_listing() { (cd "$T" && find . -mindepth 1 | sort); }

# Run grade.js with --out "$1", echoing combined output.
#
# Path conversion is suppressed ONLY for arguments that start with `/dev/`.
# Git Bash rewrites `--out /dev/null` to the string `nul` and `--out /dev/nul` to
# `C:/Program Files/Git/dev/nul`; neither is the value the guard is written to
# match, and the second one writes into the Git installation rather than this
# sandbox. MSYS_NO_PATHCONV=1 hands node the literal argument so the guard is
# exercised on its own documented contract. Every other argument - including the
# absolute sandbox paths in scenario D - is left to convert normally, because
# node on Windows cannot open an untranslated `/tmp/...` MSYS path.
run_grade() {
  case "$1" in
    /dev/*) MSYS_NO_PATHCONV=1 node "$GRADE" case --evals "$EVALS" --skill "$SKILL" --out "$1" 2>&1 ;;
    *)     node "$GRADE" case --evals "$EVALS" --skill "$SKILL" --out "$1" 2>&1 ;;
  esac
}

# Assert that `run_grade "$1"` creates nothing anywhere in the sandbox.
assert_nothing_written() {
  local arg="$1" label="$2" before after out created
  before=$(sandbox_listing)
  out=$(run_grade "$arg")
  after=$(sandbox_listing)
  created=$(comm -13 <(printf '%s\n' "$before") <(printf '%s\n' "$after") | tr '\n' ' ')
  if [ -n "$created" ]; then
    bad "$label - --out '$arg' created: $created"
  else
    ok "$label - --out '$arg' wrote nothing"
  fi
  case "$out" in
    *"null sink"*) ok "$label - stderr names the discarded sink" ;;
    *)             bad "$label - no 'null sink' notice on stderr" ;;
  esac
}

echo "=============================================================="
echo " SCENARIO A - --out nul writes nothing (the core property)"
echo "=============================================================="
assert_nothing_written nul "A"
if [ -z "$(sandbox_listing)" ]; then
  ok "A - sandbox is empty after the run"
else
  bad "A - sandbox not clean: $(sandbox_listing | tr '\n' ' ')"
fi

# The real-world path that motivated the guard: the operator types `--out /dev/null`
# and Git Bash hands node the bare string `nul`. Reproduce that rewrite here with
# the conversion left ON, so the test covers the incident, not just the shape.
before=$(sandbox_listing)
RAW=$(node "$GRADE" case --evals "$EVALS" --skill "$SKILL" --out /dev/null 2>&1)
after=$(sandbox_listing)
CREATED=$(comm -13 <(printf '%s\n' "$before") <(printf '%s\n' "$after") | tr '\n' ' ')
case "$RAW" in
  *'is a null sink'*) ok "A - Git Bash rewrote /dev/null to 'nul' and the guard ate it" ;;
  *) bad "A - the /dev/null rewrite path did not report a null sink" ;;
esac
if [ -n "$CREATED" ]; then
  bad "A - the /dev/null rewrite path created: $CREATED"
else
  ok "A - the /dev/null rewrite path wrote nothing"
fi

echo
echo "=============================================================="
echo " SCENARIO B - the Git Bash null sinks the guard was built for"
echo "=============================================================="
assert_nothing_written /dev/null "B(/dev/null)"
assert_nothing_written /dev/nul  "B(/dev/nul)"

echo
echo "=============================================================="
echo " SCENARIO C - other reserved names, with and without extension"
echo "=============================================================="
assert_nothing_written nul.txt "C(nul.txt)"
assert_nothing_written con     "C(con)"
assert_nothing_written COM1    "C(COM1, case-insensitive)"

echo
echo "=============================================================="
echo " SCENARIO D - negative control: real paths ARE still written"
echo "=============================================================="
OUT=$(run_grade "$T/real.json")
if [ -f "$T/real.json" ]; then
  ok "D - path-qualified report written"
else
  bad "D - path-qualified report was NOT written (guard is over-broad?)"
fi
if node -e "JSON.parse(require('fs').readFileSync(process.argv[1],'utf8'))" "$T/real.json" 2>/dev/null; then
  ok "D - written file is valid JSON"
else
  bad "D - written file is not valid JSON"
fi
case "$OUT" in
  *"null sink"*) bad "D - an ordinary path was reported as a null sink" ;;
  *)             ok "D - ordinary path not misreported" ;;
esac

# The anchor is the whole point of the regex: `dir/nul` is a normal filename.
OUT2=$(run_grade "$T/nul")
if [ -f "$T/nul" ]; then
  ok "D - path-qualified 'nul' IS written (regex correctly anchored)"
else
  bad "D - path-qualified 'nul' was wrongly discarded"
fi
case "$OUT2" in
  *"null sink"*) bad "D - path-qualified 'nul' misreported as a null sink" ;;
  *)             ok "D - path-qualified 'nul' not misreported" ;;
esac

echo
echo "=============================================================="
printf " RESULT: %d passed, %d failed\n" "$PASS" "$FAIL"
echo "=============================================================="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1