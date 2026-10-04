# NOTICED-BUT-NOT-TOUCHING — Issue #26

Candidates noticed while planning #26 and deliberately left untouched. Only Station VI
(`vi-close-pipeline`) resolves rows; every other station only appends `open` rows here.

| ID | candidate | discovering station | evidence | status | resolution |
|---|---|---|---|---|---|
| N1 | 12 `skills/*/scripts/grade.js` files carry a Windows null-sink guard (`isDiscardTarget` / `WIN_DEVICE_RE`) — foreign work from a parallel stream, present in the tree before #26 planning wrote anything and never authored by this issue. An untracked one-off patcher `scripts/patch-grade-null-guard.js` was present when this row was written and had vanished by the end of Station II, so the stream was live. | Station II (`ii-plan-issue`) | `git status` on branch `i26/…`; `git diff skills/vi-close-pipeline/scripts/grade.js` (+20/-1) | open | |
| N2 | That foreign work was **committed onto the #26 feature branch** by the parallel stream (`5ceb608` null-sink guard in12 `grade.js` files, `50b65d6` branch-independent `lane-precondition-test.sh`) and therefore rides inside the #26 PR diff. #26 asked for neither. Operator decision at Station III: keep them on this branch. | Station IV (`iv-review-build-and-pr`) | `git log main..HEAD`; `git diff origin/main...HEAD --name-only` | open | |
| N3 | The null-sink guard's exact interaction with `gh`/CodeRabbit grading paths (e.g. whether any caller passes `--out con`/`aux.txt` expecting a real file) was not audited — outside #26's scope, so the guard was reviewed for correctness only. | Station IV (`iv-review-build-and-pr`) | `skills/*/scripts/grade.js` `isDiscardTarget` | open | |