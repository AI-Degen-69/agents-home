# Before / After Examples

## Part 1 — Core STE Rules

| Rule | Before | After | Why |
|---|---|---|---|
| Verb, not nominalization | "Perform an analysis of the error log." | "Analyze the error log." | Removes filler verb and names the action directly. |
| No phrasal verbs | "Spin up the worker and dive into the trace." | "Start the worker and inspect the trace." | Phrasal verbs carry unpredictable idioms. |
| Condition before action | "Restart the daemon if the health check fails." | "If the health check fails, restart the daemon." | Reader sees the test condition before the command. |
| One meaning per word | "Verify the config. Check the ports. Confirm startup." | "Check the config. Check the ports. Check startup." | Eliminates synonym rotation across one flow. |
| No noun clusters (4+ words) | "the agent task queue priority handler" | "the handler that sets task-queue priority" | Splits 6 stacked nouns into readable syntax. |
| No semicolons | "The cache missed; the worker queried the database." | "The cache missed. The worker queried the database." | Split clauses stay easier to parse. |

## Part 2 — Agent Outputs & Modality Safety

### Example A — Tool Description

**Before (44 words):**
> This tool will attempt to synchronize state across the various backends that have been configured, and if a conflict is detected it may resolve it automatically depending on the strategy that has been set, or otherwise it will surface the conflict for manual review.

**After (4 short sentences, <=16 words each):**
> The tool tries to synchronize state across the configured backends. If it finds a conflict, it reads the configured strategy. If the strategy allows automatic resolution, the tool may resolve the conflict without user input. If the tool does not resolve the conflict, it reports the conflict for manual review.

### Example B — Modality & Error Messages

**Before (28 words):**
> An error may have occurred while processing your request due to a possible mismatch in the expected data format, which could be caused by an outdated client version.

**After (preserves "may have" uncertainty):**
> Your request may have failed. The cause may be a data format mismatch against server expectations. An outdated client can cause this mismatch. Check your client version.

**Why "may have failed" stays:** Removing `"may have"` to enforce simple past (`"Your request failed."`) changes a suspect diagnosis into a false certainty. **Modality always outranks the simple-tense preference.**

### Example C — README / Feature Prose (STE-Core Mode)

**Before (34 words + marketing fluff):**
> Our caching layer is designed to slot seamlessly into your existing stack with minimal friction and no vendor lock-in; it leverages semantic similarity to dramatically reduce the cache misses that traditionally plague LLM workloads.

**After:**
> We built our cache layer to fit into your current stack without vendor lock-in. It uses semantic similarity to cut cache misses, a common problem in LLM workloads.
