# NOTICED-BUT-NOT-TOUCHING — Issue #26

Candidates noticed while planning #26 and deliberately left untouched. Only Station VI
(`vi-close-pipeline`) resolves rows; every other station only appends `open` rows here.

| ID | candidate | discovering station | evidence | status | resolution |
|---|---|---|---|---|---|
| N1 | 12 `skills/*/scripts/grade.js` files carry an uncommitted Windows null-sink guard (`isDiscardTarget` / `WIN_DEVICE_RE`) — foreign work from a parallel stream, present in the tree before #26 planning wrote anything and never touched by this issue. An untracked one-off patcher `scripts/patch-grade-null-guard.js` was present when this row was written and had vanished by the end of Station II, so the stream is live. | Station II (`ii-plan-issue`) | `git status` on branch `i26/…`; `git diff skills/vi-close-pipeline/scripts/grade.js` (+20/-1) | open | |