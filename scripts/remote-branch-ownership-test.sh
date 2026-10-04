#!/usr/bin/env bash
# Executable proof for Issue #26: the Clean Exit Gate must be able to FAIL.
#
# Station VI check 5 used to read `git fetch --prune` + `git branch`, neither of
# which can see a branch that still exists on the server - so a merged branch
# survived twice (#23, #25) while the gate reported a clean closeout. Prose that
# merely contains the right words proves nothing about that bug class, so this
# test transcribes the gate's verdict and feeds it `git ls-remote --heads`
# output directly.
#
# Three scenarios:
#   A. The verdict FAILS on a surviving merged branch, PASSES on a clean remote
#   B. Ordering holds: MERGED confirm < local -D < remote delete (line numbers)
#   C. No skill file claims --delete-branch removes the remote branch
#
# Exit 0 = every scenario produced its expected verdict.
# Exit 2 = a tripwire cannot read the rule this verdict implements. That is rule
#           drift, not a test bug - re-derive verdict() before trusting a result.

set -u
PASS=0; FAIL=0
# Default to the checkout this script lives in, so the test runs in any clone.
# A positional argument still wins, which is how the fixtures below are tested.
SRC="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
GATE="$SRC/skills/vi-close-pipeline/SKILL.md"
MERGE="$SRC/skills/v-babysit-pr-and-merge/references/merge-and-reset.md"
CONTRACT="$SRC/skills/v-babysit-pr-and-merge/SKILL.md"

# ---------------------------------------------------------------------------
# Rule binding: prove the files still say what this test executes.
# verdict() cannot execute prose, so it is a transcription. Without these
# tripwires the test would keep reporting PASS against a rule that is gone.
# ---------------------------------------------------------------------------
require_clause() {
  if [ ! -f "$1" ]; then
    echo "TEST INVALID: missing $1"; exit 2
  fi
  grep -qF "$2" "$1" && return 0
  echo "TEST INVALID: $1 no longer contains \"$2\""
  echo "             verdict() below implements a rule the skill has dropped."
  echo "             Re-derive verdict() against the current wording, then re-run."
  exit 2
}
require_clause "$GATE"     'git ls-remote --heads origin'
require_clause "$GATE"     'no merged feature branch survives on the server'
require_clause "$GATE"     'fails** this check'
require_clause "$MERGE"    'git push origin --delete <branch-name>'
require_clause "$MERGE"    'must print MERGED'
require_clause "$CONTRACT" 'git push origin --delete'

echo "=============================================================="
echo " RULE BINDING - check 5 / step 5b"
echo "=============================================================="
echo "  gate clause (server-observing) : present"
echo "  gate clause (merged-branch rule): present"
echo "  gate clause (can fail)         : present"
echo "  step 5b clause (remote delete) : present"
echo "  step 5b clause (MERGED guard)  : present"
echo "  contract clause (remote delete): present"
echo

ok()  { echo "    PASS  $1"; PASS=$((PASS+1)); }
bad() { echo "    FAIL  $1"; FAIL=$((FAIL+1)); }

# The Clean Exit Gate's check 5, implementing vi-close-pipeline/SKILL.md
# (bound above). Input is raw `git ls-remote --heads origin` output.
#   $1  base branch name
#   $2  the ls-remote output
#   $@  branches that are legitimately active (e.g. heads of open PRs)
# The rule is "no MERGED feature branch survives", NOT "the remote holds only
# the base branch" - an unrelated active head is not this gate's business, and
# failing on it would strand closeout on a healthy repo.
verdict() {
  local base="$1" lsremote="$2"; shift 2
  local allow="$base" a stray
  for a in "$@"; do allow="$allow|$a"; done
  stray=$(printf '%s\n' "$lsremote" | grep -v '^[[:space:]]*$' \
            | sed 's#.*refs/heads/##' \
            | awk -v allow="$allow" 'BEGIN{n=split(allow,A,"|");for(i=1;i<=n;i++)skip[A[i]]=1} !($0 in skip)')
  if [ -n "$stray" ]; then
    echo "FAIL(stale-remote-branch:$(printf '%s' "$stray" | tr '\n' ','))"; return
  fi
  echo "PASS(clean-remote)"
}

echo "=============================================================="
echo " SCENARIO A - the gate can actually fail"
echo "=============================================================="
# A1: the exact shape that survived on #25 - main plus one merged feature branch.
V=$(verdict main "$(cat <<'EOF'
a1b2c3d4e5f6	refs/heads/main
9f8e7d6c5b4a	refs/heads/i24/correct-the-coderabbit-playbook
EOF
)")
echo "  remote heads: main + i24/... (the #25 survivor)"
echo "  VERDICT     : $V"
case "$V" in FAIL*stale-remote-branch*) ok "surviving merged branch FAILS the gate (the old wording passed it)";; *) bad "stray branch verdict: $V";; esac

# A2: clean remote -> PASS
V=$(verdict main "$(printf 'a1b2c3d4e5f6\trefs/heads/main\n')")
echo "  remote heads: main only"
echo "  VERDICT     : $V"
case "$V" in PASS*) ok "clean remote passes the gate";; *) bad "clean remote verdict: $V";; esac

# A3: the pre-fix shape - `git fetch --prune` + `git branch` see nothing here.
V=$(verdict main "$(printf 'a1b2c3d4e5f6\trefs/heads/main\n9f8e7d6c5b4a\trefs/heads/i24/stale\n')")
echo "  same state, but pruned refs + local git branch see main only -> the old check would have passed"
echo "  VERDICT     : $V"
case "$V" in FAIL*) ok "server-observing verdict catches what the local-only check could not";; *) bad "old-check blind spot: $V";; esac

# A4: an UNRELATED ACTIVE branch is not a merged leftover. A base-only rule
# would fail here and strand closeout on a healthy repo.
V=$(verdict main "$(printf 'a1b2c3d4e5f6\trefs/heads/main\n9f8e7d6c5b4a\trefs/heads/i99/active-work\n')" i99/active-work)
echo "  remote heads: main + i99/active-work (an OPEN PR's head)"
echo "  VERDICT     : $V"
case "$V" in PASS*) ok "active branch from an open PR does NOT fail the gate";; *) bad "active branch wrongly failed: $V";; esac

# A5: a stale branch next to an active one is still caught.
V=$(verdict main "$(printf 'a1b2c3d4e5f6\trefs/heads/main\n9f8e7d6c5b4a\trefs/heads/i99/active-work\ndead123\t\trefs/heads/i24/stale\n')" i99/active-work)
echo "  remote heads: main + active + one stale"
echo "  VERDICT     : $V"
case "$V" in FAIL*stale-remote-branch:i24/stale*) ok "stale branch still caught alongside an active one";; *) bad "mixed-state verdict: $V";; esac

echo
echo "=============================================================="
echo " SCENARIO B - the delete is ordered after the guard"
echo "=============================================================="
M=$(grep -n 'must print MERGED' "$MERGE" | head -1 | cut -d: -f1)
D=$(grep -n 'git branch -D <branch-name>' "$MERGE" | head -1 | cut -d: -f1)
R=$(grep -n 'git push origin --delete <branch-name>' "$MERGE" | head -1 | cut -d: -f1)
echo "  MERGED confirm : line $M"
echo "  local -D       : line $D"
echo "  remote delete  : line $R"
if [ -z "$M" ] || [ -z "$D" ] || [ -z "$R" ]; then
  bad "could not locate all three clauses in merge-and-reset.md"
elif [ "$M" -lt "$D" ] && [ "$D" -lt "$R" ]; then
  ok "MERGED confirm < local -D < remote delete (never remote-first)"
else
  bad "ordering wrong: remote delete must come last, after the MERGED guard"
fi

echo
echo "=============================================================="
echo " SCENARIO C - no file credits --delete-branch with the removal"
echo "=============================================================="
# evals/snapshots holds a frozen past version; pipeline-closure.js skips it for
# the same reason, so it is excluded here too.
HITS=$(grep -rn --include='*.md' -iE 'already removed by `--delete-branch`|remote branch was already removed' "$SRC/skills" 2>/dev/null | grep -v '/evals/snapshots/')
if [ -z "$HITS" ]; then
  ok "no skill file claims --delete-branch removes the remote branch"
else
  bad "stale claim still present:"; printf '%s\n' "$HITS"
fi
grep -qF 'best-effort' "$MERGE" && ok "step 5b marks --delete-branch best-effort" || bad "step 5b does not qualify --delete-branch"

echo
echo "=============================================================="
printf " RESULT: %d passed, %d failed\n" "$PASS" "$FAIL"
echo "=============================================================="
[ "$FAIL" -eq 0 ] && echo "BRANCH-OWNERSHIP-OK" && exit 0 || exit 1