# Anti-patterns (learned)

Hard-learned operational traps to avoid during triage and model routing:

- **Starting work in a pre-existing worktree/branch without a freshness check.** Always verify divergence from `main` using `git rev-list --count`.
- **Mixing ledger rows, environment caveats, and tree state into one prose report** the operator cannot verify or locate.
- **Treating a skill's silence as permission.** Skills don't fetch, don't check branch freshness, and don't guard remotes.
- **Guard text without an independent tripwire.** Every guard must pair with a concrete command the operator can run in 30 seconds.
- **Pricing without capability.** Routing cheapest-first from `models.md` alone misassigns analysis/review tasks where capability, not price, carries the weight. Pair `references/models.md` (price) with `references/capability.md` (grade + task-class matrix), and never let an `[unverified]` model ship the final step of an irreversible task.
- **Ignoring hard caps.** Quota-gated models (e.g. 1 session/day, weekly caps) must gate worthiness before price is considered; `capability.md` encodes the ceiling per model, and a routing that ignores it spends the day's reserve on a non-worthy task. Always read the per-harness reset window stated under that harness in `models.md` before assigning quota-bound work.
- **Taking vendor "beats the frontier" at face value.** A model card's "beats GPT-X on X bench" claim, without an independent cross-model yardstick (AA Intelligence Index) or cited pass@1 numbers, is marketing signal — routing from it grades models above their independently-verified tier.
- **Hiding score conflicts.** When a model's reported numbers diverge across sources (e.g. a 47.7 partner figure vs a 23 GA-page figure), do not silently pick one — record both, pick the authoritative source, and flag the conflict; a silently mis-graded tier corrupts the whole task-class matrix above it.
