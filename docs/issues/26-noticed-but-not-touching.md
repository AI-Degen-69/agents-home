# NOTICED-BUT-NOT-TOUCHING — Issue #26

Candidates noticed while planning #26 and deliberately left untouched. Only Station VI
(`vi-close-pipeline`) resolves rows; every other station only appends `open` rows here.

| ID | candidate | discovering station | evidence | status | resolution |
|---|---|---|---|---|---|
| N1 | 14 `skills/*/scripts/grade.js` files carry an uncommitted Windows null-sink guard (`isDiscardTarget` / `WIN_DEVICE_RE`), plus an untracked one-off patcher `scripts/patch-grade-null-guard.js` — foreign work from a parallel stream, present in the tree before #26 planning wrote anything | Station II (`ii-plan-issue`) | `git status` on branch `i26/…`; `git diff skills/vi-close-pipeline/scripts/grade.js` (+20/-1) | open | |