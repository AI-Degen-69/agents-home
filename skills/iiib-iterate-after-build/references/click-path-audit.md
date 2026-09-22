# Dead-Button Checklist (condensed from click-path-audit)

For the Dead button lane: the handler exists, nothing crashes, types are fine — but the final UI state contradicts what the button label promises. Check interaction side effects, not single functions.

## Step 1: Map the stores

For each state store (Zustand, Redux, context) in scope, list every action as `actionName → sets [...] resets [...]`. Flag DANGEROUS RESETS: actions that clear state owned by another action.

## Step 2: Trace the touchpoint

For the reported button, in handler call order, record per call: what state it reads, what it writes, and whether it resets anything as a side effect. Then check these patterns:

1. **Sequential undo** — call 1 sets X, a later call resets X. The first call was pointless.
2. **Async race** — two async calls resolve in either order and the last write wins unpredictably.
3. **Stale closure** — handler captures an old state value and writes it back.
4. **Missing transition** — handler validates but never performs the promised action (no API call, no state change).
5. **Dead path** — the real action sits behind a condition that is never true at click time.
6. **Effect interference** — a subscribed effect watches the set state and resets it right after.

## Step 3: Fix and guard

Fix the ordering or the owning action (move the reset, reorder the calls, or scope the side effect), then add a regression test that clicks the touchpoint and asserts the final state matches the button's promise.
