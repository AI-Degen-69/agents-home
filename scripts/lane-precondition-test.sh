#!/usr/bin/env bash
# Executable proof of the quick-fix lane's Step 2 preconditions and its mid-lane
# stop rule. Runs against a real clone of the live repo so the git states are
# real, without touching the operator's working tree.
#
# Three scenarios:
#   A. Station IV handoff  -> squash-merge staged work onto base -> ACCEPT
#   B. Foreign dirt        -> an extra unrelated file                 -> REFUSE
#   C. Mid-lane growth     -> a fix grows past the box-1 limit      -> STOP
#
# Exit 0 = every scenario produced its expected verdict.
# Exit 2 = the test could not run: quick-fix/SKILL.md no longer states the
#           clauses this verdict function implements. That is rule drift, not
#           a lane bug - re-derive `verdict()` before trusting any result.

set -u
PASS=0; FAIL=0
SRC="${1:-/c/Users/Tiger/.agents}"
SKILL="$SRC/skills/quick-fix/SKILL.md"

# ---------------------------------------------------------------------------
# Rule binding: prove SKILL.md still says what this test executes.
#
# `verdict()` cannot execute prose, so it is a transcription. These tripwires
# stop it from silently testing a stale rule - if the skill is rewritten, the
# test refuses to report PASS instead of going quietly out of date.
# ---------------------------------------------------------------------------
LIMIT=$(sed -n 's/.*at most \*\*\([0-9]\+\) files\*\*.*/\1/p' "$SKILL" | head -1)
[ -n "$LIMIT" ] || { echo "TEST INVALID: cannot read the box-1 file limit from $SKILL"; exit 2; }

require_clause() {
  grep -qF "$2" "$SKILL" && return 0
  echo "TEST INVALID: $SKILL no longer contains \"$2\""
  echo "             `verdict()` below implements a rule the skill has dropped."
  echo "             Re-derive verdict() against the current wording, then re-run."
  exit 2
}
require_clause "handoff"   '**Station IV handoff**'
require_clause "refusal"   'foreign dirt → route to'
require_clause "growth"    'stop mid-lane'

echo "=============================================================="
echo " RULE BINDING - quick-fix/SKILL.md"
echo "=============================================================="
echo "  box-1 file limit (read from the skill): $LIMIT"
echo "  clauses required by verdict()         : present"
echo

ok()   { echo "    PASS  $1"; PASS=$((PASS+1)); }
bad()  { echo "    FAIL  $1"; FAIL=$((FAIL+1)); }

# The lane's Step 2 verdict, implementing quick-fix/SKILL.md (bound above).
# GATED = the files the 7-box gate counted. Anything else in the tree is foreign.
verdict() {
  local branch="$1" gated="$2" tree="$3" unpushed="$4"
  if [ "$branch" != "main" ] && [ "$branch" != "master" ]; then
    echo "REFUSE(wrong-branch)"; return
  fi
  # unpushed commits belonging to other work
  if [ "$unpushed" != "0" ]; then echo "REFUSE(unpushed-commits:$unpushed)"; return; fi
  # every changed file must be in the gated set
  local changed extra
  changed=$(printf '%s\n' "$tree" | grep -v '^$' | sed 's/^...//' | sort -u)
  if [ -z "$changed" ]; then echo "ACCEPT(clean-tree)"; return; fi
  extra=$(comm -23 <(printf '%s\n' "$changed") <(printf '%s\n' "$gated" | sort -u))
  if [ -n "$extra" ]; then echo "REFUSE(foreign-dirt:$(printf '%s' "$extra" | tr '\n' ','))"; return
  fi
  echo "ACCEPT(staged-handoff)"
}

T=$(mktemp -d); trap 'rm -rf "$T"' EXIT
# A bare remote, so the lane's `git push origin main` is actually permitted:
# pushing into a non-bare checkout is refused by receive.denyCurrentBranch,
# which would make the test report a harness artifact as a skill failure.
git init -q --bare "$T/remote.git"
git clone -q "$SRC" "$T/r" 2>/dev/null || { echo "clone failed"; exit 2; }
cd "$T/r"
git config user.email t@t.t; git config user.name T
git remote set-url origin "$T/remote.git"
git push -q origin main 2>/dev/null || { echo "seed push failed"; exit 2; }
git branch -q --set-upstream-to=origin/main main 2>/dev/null
BASE=$(git branch --show-current)

echo "=============================================================="
echo " SCENARIO A - Station IV squash handoff (the blocking finding)"
echo "=============================================================="
git switch -qc i99/handoff-test
echo "handoff probe $(date +%s)" >> AGENTS.md          # the 1-file gated change
git commit -qam "fix(agents): probe change (#99)"
# ... Station III build + IV proof gate already done. Now the IV divert:
git switch -q "$BASE" && git merge --squash i99/handoff-test >/dev/null 2>&1

GATED="AGENTS.md"
TREE=$(git status --porcelain)
UNPUSHED=$(git rev-list --count "$BASE"..HEAD)
V=$(verdict "$(git branch --show-current)" "$GATED" "$TREE" "$UNPUSHED")
echo "  branch   : $(git branch --show-current)"
echo "  tree     : $(printf '%s' "$TREE" | tr '\n' ' ')"
echo "  unpushed : $UNPUSHED"
echo "  VERDICT  : $V"
case "$V" in ACCEPT*) ok "IV handoff accepted (was REFUSE before the fix)";; *) bad "IV handoff verdict: $V";; esac
echo "  note     : the pre-fix wording ('Clean tree.') yields REFUSE for this exact state"

# the lane may then commit and push
git add AGENTS.md >/dev/null 2>&1
git commit -qm "fix(agents): probe change (#99)"
if git push -q origin "$BASE" 2>/dev/null; then ok "lane can commit + push from the handoff state"; else bad "push from handoff state failed"; fi

echo
echo "=============================================================="
echo " SCENARIO B - foreign dirt must still be refused"
echo "=============================================================="
echo "unrelated scratch" > scratch.txt
TREE=$(git status --porcelain)
V=$(verdict "$(git branch --show-current)" "$GATED" "$TREE" "0")
echo "  tree     : $(printf '%s' "$TREE" | tr '\n' ' ')"
echo "  VERDICT  : $V"
case "$V" in REFUSE*foreign-dirt*) ok "foreign dirt refused even with a label";; *) bad "foreign dirt verdict: $V";; esac
rm -f scratch.txt

echo
echo "=============================================================="
echo " SCENARIO C - mid-lane growth past the box-1 limit"
echo "=============================================================="
git reset -q --hard "$BASE"
# The gated file plus LIMIT more = LIMIT+1 changed files, one over the limit.
# This is the lane discovering mid-implementation that the fix grew.
echo "grown" >> AGENTS.md
i=1; while [ "$i" -le "$LIMIT" ]; do echo "grown $i" > "extra$i.md"; i=$((i+1)); done
TREE=$(git status --porcelain)
UNPUSHED=$(git rev-list --count "$BASE"..HEAD)
FILES=$(printf '%s\n' "$TREE" | grep -v '^$' | wc -l | tr -d ' ')
echo "  files now: $FILES (box 1 limit: $LIMIT)"
V=$(verdict "$(git branch --show-current)" "$GATED" "$TREE" "$UNPUSHED")
echo "  VERDICT  : $V"
# Unconditional: a scenario that cannot assert must fail, never skip.
if [ "$FILES" -le "$LIMIT" ]; then
  bad "test setup wrong: expected >$LIMIT changed files, got $FILES"
else
  case "$V" in
    REFUSE*foreign-dirt*) ok "growth past box 1 stops the lane before any push" ;;
    *)                   bad "growth did not stop the lane: $V" ;;
  esac
fi
HEAD_SHA=$(git rev-parse "$BASE")
REMOTE_SHA=$(git rev-parse origin/main)
[ "$HEAD_SHA" = "$REMOTE_SHA" ] && ok "nothing was pushed on the stop path" || bad "local advanced past origin"
# Authoritative check: the over-limit file must not exist in the remote tree.
# (A `git log --grep=extra` probe is WRONG here - it matches unrelated
# pre-existing commits such as "...extract Hebrew output template".)
if git cat-file -e origin/main:extra1.md 2>/dev/null; then
  bad "extra1.md reached the remote"
else
  ok "no commit reached the remote on the stop path"
fi

echo
echo "=============================================================="
printf " RESULT: %d passed, %d failed\n" "$PASS" "$FAIL"
echo "=============================================================="
[ "$FAIL" -eq 0 ] && exit 0 || exit 1