# Capability reference

Maps **task classes** → **required capability grades**, and grades → models.
Pairs with `models.md` (price/availability) so routing minimizes cost while
guaranteeing capability per task class.

Each harness gets the **same structure** (Grades table → model justification).
A model's grade is harness-specific — a model is routeable only where it is
actually installed and switchable on that harness (the skill's "Harness fit"
rule). Add a new harness by copying the block and renaming.

> Grade is earned from **benchmark evidence read in this session**, not
> training memory (per the skill's "Capability evidence" rule).
>
> **Sources:** [Artificial Analysis](https://artificialanalysis.ai/models/) is the
> primary independent benchmark source for every model — use the slug template
> `https://artificialanalysis.ai/models/<model-name>` (e.g.
> `.../nemotron-3-5-super-vl`). Vendor model cards are cited only where AA lacks
> a metric, and tagged as vendor-reported. For serving-tier variants that have
> **no AA model page / no own benches** (e.g. Muse Spark 1.3 Contributor, Solar Mini 4 —
> AA/OpenRouter list the tier as "Not available"), cite the AA article or the
> OpenRouter compare page and use the **regular / Standard-tier** numbers as the
> capability proxy, flagging the tier's caps (e.g. max-reasoning is Standard-only,
> data-train trade, context/time limits).
>
> **No-evidence fallback:** AA absent → cap at D/unverified, probe-only. Then
> company post (params/ctx/card numbers tagged vendor-reported, never
> grade-carrying alone) → street sweep (GitHub repros > HF case files > indie
> multi-bench > X/Reddit patterns; single post = anecdote; sponsored or
> no-methodology articles rejected). Two independent non-vendor signals in the
> same direction = provisional C/B with guardrails; vendor-only or one signal =
> stays D; S needs AA.
>
> A model listed in `models.md` but absent from a harness's grade table is
> `[unverified]` there — do not route it for an irreversible final step.

> **Scale in force: Artificial Analysis Intelligence Index v5.0.** Bands:
> **S+ 51+ · S 46–50 · A 39–45 · B 26–38 · C <26.** The highest measured model
> is Gemini 4 Neon at 61 (Extra High), read 2026-11-22. v4.3.2 numbers are
> historical and not comparable.
>
> Antigravity is graded at the **selectable tier**, not the model ceiling. Its
> picker caps the Claude rows at High, so Opus 5.5 reaches S+ at High (52) and
> Sonnet 5.5 tops out at A (41). Every free-tier model elsewhere still sits at
> **B** or below.

---

## Antigravity

The Pro plan holds the only S+ models in the inventory. Effort is selectable, so the
grade depends on the tier picked. Each row lists the ladder.

### Grades (best → worst)

| Grade | Meaning | Models at this tier |
|---|---|---|
| S+ | Reserve: irreversible / money-adjacent / subtle-invariant work | AG-5 Neon (medium, high, extra high), AG-2 Opus 5.5 (high), AG-7 Hydrogen (high, extra high) |
| S | Top: long-horizon agentic coding, multi-step reasoning, review | AG-6 Argon (high, medium), AG-2 Opus 5.5 (medium) |
| A | Competent: well-scoped edits under tests, straightforward research | AG-5 Neon (low), AG-3 Sonnet 5.5 (high), AG-7 Hydrogen (medium) |
| B | Light / probe: mechanical work, babysitting, free verification passes | AG-1 Gemini 3.8 Flash (medium, high), AG-3 Sonnet 5.5 (medium), AG-2 Opus 5.5 (low), AG-7 Hydrogen (low) |
| C | Weak fit: below the bar, deprecated, or unverified | AG-4 Opus 4.6, AG-9 Sonnet 4.6, AG-3 Sonnet 5.5 (low), AG-1 Gemini 3.8 Flash (low), AG-8 GPT-OSS 120B |
| D | Do not route | none |

### Evidence

| # | Model | Grade | One line | Source |
|---|---|---|---|---|
| AG-5 | Gemini 4 Neon | S+ | AA 61 extra-high / 60 high / 55 medium / 44 low; agentic coding focus; 283M output tokens at extra high vs 62.9M at medium — route Medium | artificialanalysis.ai/models/gemini-4-neon |
| AG-7 | Gemini 4 Hydrogen | S+ | AA 54 extra-high / 51 high / 41 medium / 27 low; cheapest S+ at $1.50/$7.50, 163 tok/s, but 304M tokens at extra high | artificialanalysis.ai/models/gemini-4-hydrogen |
| AG-2 | Claude Opus 5.5 | S+ | AA 52 high / 48 medium / 35 low; TB 4.0 66.4% vendor; the picker offers no xhigh or max, so High is the top | artificialanalysis.ai/models/claude-opus-5-5 |
| AG-6 | Gemini 4 Argon | S | AA 50 high / 48 medium; same model as Freebuff FB-10; slowest row here at 26.2 min/task, $4/$20 | artificialanalysis.ai/models/gemini-4-argon |
| AG-3 | Claude Sonnet 5.5 | A | AA 41 high / 30 medium / 25 low; no xhigh or max in the picker, so A is its ceiling on this harness | artificialanalysis.ai/models/claude-sonnet-5-5 |
| AG-1 | Gemini 3.8 Flash | B | AA 31 high / 30 medium / 22 low; TB 4.0 19.1% — cheap supervised path, escalate if it flounders | artificialanalysis.ai/models/gemini-3-8-flash |
| AG-4 | Claude Opus 4.6 | C | Deprecated; AA withdrew the index (N/A). 1M ctx, $5/$25. Only free-account alternative to AG-1 | artificialanalysis.ai/models/claude-opus-4-6 |
| AG-8 | GPT-OSS 120B | C | Medium effort only, carries a Notice flag; no AA page read — unverified, probe before routing | picker 2026-11-22 |
| AG-9 | Claude Sonnet 4.6 | C | Deprecated; AA withdrew the index (N/A). 1M ctx, $3/$15. Free-account row, alongside AG-4 | artificialanalysis.ai/models/claude-sonnet-4-6 |

**Free accounts top out at B.** AG-1 Gemini 3.8 Flash is the only usable free-tier model, and both Claude 4.6 rows are deprecated with no AA index. Every S and S+ path needs the Pro plan: Neon, Argon, Hydrogen, Opus 5.5, Sonnet 5.5.

Gemini 4 Carbon appears in the picker as Unavailable. Do not route it.

### Orchestrator — a cost mode, not a capability mode

Tooltip: "Offloads routine steps to a faster executor. Same quality, fewer tokens used."
It wraps AG-5 Neon, AG-6 Argon, or AG-2 Opus 5.5 at Low / Medium / High.

It changes **which model executes a step**. It does not change the ceiling of the model you
picked and it adds no capability. It trades token spend for provenance.

**Ask one question about each offloaded step: is it evidence, or is it judgment?**

- **Evidence steps** produce something a tool can check: run the tests, read the file, diff,
  grep, lint, list, build. A wrong one fails loudly.
- **Judgment steps** produce a claim about the code: what this diff means, whether the design
  is safe, what the requirement actually is, which test to write.

Orchestrator is safe when it takes **only evidence steps** and a deterministic check runs after
each one. The judge stays the model you picked, and a bad step is rejected before any conclusion
exists. It is unsafe when it takes a **comprehension or judgment step**, because a wrong summary
does not fail loudly. It quietly rewrites the artifact the big model is looking at, so the review
ends up sound about the summary and wrong about the code, and the unnamed executor hides which.

**So the axis is not build-versus-audit. It is whether the offloaded step can be checked.**

| Situation | Verdict |
| --- | --- |
| Long build, tests or compiler after every step | Orchestrator is the cost mode to take |
| Review where the reviewer reads the diff itself, executor runs tests/lint/build | Orchestrator is fine |
| Review where the executor summarises the code first | Flat model |
| Formal audit, incident trail, compliance, security sign-off | Flat model |
| Migration with subtle invariants, irreversible operation | Flat model |
| Repo with no test or type checker | Flat model |

**Audit stays flat for a reason that is not capability.** Neon does not review worse through an
orchestrator. But an audit's product is a claim about what was examined. If a delegated step
condensed the evidence, the audit's scope is the condensation, and you cannot sign for a scope
you cannot see. That is a provenance limit, not an intelligence limit.

**Grade:** the run's ceiling is X's grade. The effective grade is one step lower until a
deterministic check gates every offloaded step.

**First use is an A/B, not a default.** Run one representative task flat on Neon Medium, then
the same task through Orchestrator-on-Neon-Medium. Compare pass rate and window spent, and
record both numbers here. Until that exists, treat the mode as unverified.

## OpenCode

### Grades (best → worst)

| Grade | Meaning | Models |
|---|---|---|
| S+ | Reserve | none |
| S | Top | none |
| A | Competent | none |
| B | Light / probe | OC-3 DeepSeek V4.1 Flash (32), OC-5 MiMo V2.6 Flash (27), OC-2 Big Pickle (street, no page) |
| C | Weak fit | OC-1 Beam (18), OC-7 Nemotron 3.5 Super VL (14), OC-6 Nemotron 3.5 Lightning (6), OC-4 LongCat 2.5 (slow, Go collapse), OC-8 hy4 (no benchmark), OC-9 tidepool (no benchmark) |
| D | Do not route | none |

### Evidence

| # | Model | Grade | One line | Source |
|---|---|---|---|---|
| OC-1 | Beam (Reflection) | C | AA 18; 501B MoE, 1M ctx; TB 4.0 3% — weak agentic | artificialanalysis.ai/models (Beam) |
| OC-2 | Big Pickle | B | No AA page; indie Omniscience +43, SWE Atlas 50.8% — best free knower, mid coder | github.com/PhillipChaffee/big-pickle-swe-atlas |
| OC-3 | DeepSeek V4.1 Flash | B | AA 32 via 1017 proxy; strongest free coder; 200K ctx | artificialanalysis.ai/models/deepseek-v4-1-flash |
| OC-4 | LongCat 2.5 Preview | C | Indie 46.65/80, slowest runs, Go 0.9/5 — small tasks only | aicodingdaily.com/model/longcat-2-5-preview |
| OC-5 | MiMo V2.6 Flash | B | AA 27; TB 4.0 24.2% — weak on long agentic suites | artificialanalysis.ai/models/mimo-v2-6-flash |
| OC-6 | Nemotron 3.5 Lightning | C | AA 6; 292 tok/s — fastest, probe only | artificialanalysis.ai/models/nemotron-3-5-lightning |
| OC-7 | Nemotron 3.5 Super VL | C | AA 14; 170M output tokens/task — very verbose | artificialanalysis.ai/models/nemotron-3-5-super-vl |
| OC-8 | hy4-flash | C | No benchmark; probe answered in 7s — unproven | first-party probe 2026-11-22 |
| OC-9 | tidepool-alpha | C | No benchmark; probe answered in 5.3s — unproven | first-party probe 2026-11-22 |

Probe-verified models stay C until a benchmark page exists.

## sail-ai-degen

### Grades (best → worst)

| Grade | Meaning | Models |
|---|---|---|
| B | Light / probe | SA-1 DeepSeek V4.1 Flash 1017 (AA 32) |
| C | Weak fit | SA-2 GLM-5.3 (no page read), SA-3 GLM-5.3 balanced (same model, slower tier) |
| D | Do not route | SA-4 `glm-5.3-flex`, SA-5 `kimi-k3` — both fail at the API |

### Evidence

| # | Model | Grade | One line | Source |
|---|---|---|---|---|
| SA-1 | DeepSeek V4.1 Flash 1017 | B | AA 32; 2.6s probe; strongest model on the $5 credit | artificialanalysis.ai/models/deepseek-v4-1-flash |
| SA-2 | GLM-5.3 | C | 4.6s probe; no benchmark page read yet — unproven | first-party probe 2026-11-22 |
| SA-3 | GLM-5.3 balanced | C | Same weights, balanced effort tier, 16.2s on a one-word reply | first-party probe 2026-11-22 |

## Inception

### Grades (best → worst)

| Grade | Meaning | Models |
|---|---|---|
| C | Weak fit | IN-1 Mercury 3 — fast, unproven intelligence, trains on prompts |
| D | Do not route | Mercury 2.5 (AA 12), Mercury 2 (AA 11), Mercury Edit 2 (edits only) |

### Evidence

| # | Model | Grade | One line | Source |
|---|---|---|---|---|
| IN-1 | Mercury 3 | C | Diffusion LLM, 1M ctx; probe: TTFT 0.71s, 415 tok/s, clean tool calls; no AA page; family prior 11-12 | docs.inceptionlabs.ai + first-party probe 2026-10-21 |

**Data-policy stop:** Inception trains on prompts and outputs by default. Never send private or confidential repo content. Public or throwaway code only, and only after the dashboard toggle is confirmed off.

## OpenRouter

Free tier only. Paid variants are out of scope.

### Grades (best → worst)

| Grade | Meaning | Models |
|---|---|---|
| B | Light / probe | OR-1 Particle-1 — base-class accuracy at ~45% fewer tokens |
| C | Weak fit | OR-2 ERNIE 5.5 Flash Preview, OR-3 Nemotron 3 Ultra (AA 12), OR-4 Nemotron 3.5 Super VL (AA 14) |
| D | Do not route | Nemotron 3.5 Lightning, Nemotron 3 Nano Omni, Gemma 4 31B, Gemma 4 26B-A4B, Ling 3.2 Flash, Flint v1.0, LFM 3 1.7B — no coding evidence above the free bar |

### Evidence

| # | Model | Grade | One line | Source |
|---|---|---|---|---|
| OR-1 | Particle-1 | B | Vendor DeepSWE 1.1 72.57% vs base 71.15%; ~45% fewer tokens, $0.22 vs $0.34 per task, GPQA 90.4 vs 90.9 — same class as DeepSeek V4.1 Flash, cheaper; vendor-run, no independent re-run; 1.4s probe | particle.ai/blog/introducing-particle-1 |
| OR-2 | ERNIE 5.5 Flash Preview | C | 280B total / 14B active, 1M ctx, Apache 2.0 weights "soon"; self-described mid-training checkpoint, benchmarks only as an image, no AA page; 2.2s probe | ernie.baidu.com/release/ernie-5-5-flash-preview |
| OR-3 | Nemotron 3 Ultra | C | AA 12 | artificialanalysis.ai/models/nvidia-nemotron-3-ultra-550b-a55b |
| OR-4 | Nemotron 3.5 Super VL | C | AA 14, 170M output tokens/task | artificialanalysis.ai/models/nemotron-3-5-super-vl |

## Freebuff

Freebuff is **time-billed, not token-billed** (see models.md hours): a daily hour
pool (refill 12:00 AM Asia/Jerusalem) funded by the $8/mo Starter (21h/day,
observed 19/21) + 60h wallet/mo that replaces unused bonus. Higher models burn the
pool faster; route the smallest time-slice that clears the grade. No S+ anywhere —
the best thing here is 50, 9 pts below the live frontier.

### Grades (best → worst)

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve | (none — best is 50, 9 pts below F) |
| S | Top | FB-10: Gemini 4 Argon (50) |
| A | Competent | (none — nothing on Freebuff reaches 39) |
| B | Light / probe | FB-6: Muse Spark 1.3 (36); FB-9: Claude Haiku 5.5 (36, 100k-context variant); FB-11: DeepSeek V4.1 Flash 1017 (32); FB-4 / FB-5: DeepSeek V4.1 Flash base (unmeasured on v5.0; 32 refresh = ceiling proxy); FB-3: MiMo 2.6 Pro (30); FB-7: GLM 5.3 Flash (28); FB-8: GPT-6 Luna (28, TB4 13%); FB-1 / FB-2: MiMo 2.6 Flash (27) |
| C | Weak fit | FB-12: Mercury 3 (no AA page; family prior 11–12) |
| D | Do not route | (none yet on Freebuff) |

### Justification by model

**FB-10 — Gemini 4 Argon (S).** Google, 30 Sep 2026; proprietary, reasoning,
text+image→text, 1M ctx. **AA Intelligence Index v5.0: 50** (independent;
highest in the cohort, 4/4 Intelligence; v4.3.2 read 53) — TB4 57%, #1
AutomationBench-AA 78% (7 pts over Claude Sonnet 5.5), AA-Briefcase 1494 Elo,
lowest hallucination (15%) among models scoring 45+ on the retired scale.
Verbose (110M tokens/task). ⚠️ Freebuff: **20h/session
+ Promotional · 1 session/day** and $2.00/$10.00 per token — not routine; use the
single daily slot only for high-value work. **The strongest model on Freebuff:
50, the S floor of the v5.0 band, 9 pts under F.**
Source: https://artificialanalysis.ai/models/gemini-4-argon
(Re-tier Nov 2, 2026: 50 = S band 46–50. It is no longer S+ — the S+ band starts
at 51 and nothing on Freebuff clears it.)

**FB-6 — Muse Spark 1.3 (B).** Meta (MSL), 2 Sep 2026; multimodal reasoning
(text+image+video+audio/PDF→text), 1M ctx, Standard/"Max" tier. **AA Intelligence
Index v5.0: 36** (v4.3.2 read 48.1; the Coding 75.8 / Agentic 55.5 sub-indices
belonged to that retired scale). ⚠️ Freebuff: **3h/session** — the cheapest
3h slice that reaches 36; this is the Standard tier (no free-tier cap, unlike
Cline's Muse Contributor).
(Re-tier Nov 2, 2026: 36 = B band, 23 pts below the live frontier. Still the best
coding value on the harness, but it is B work — verify with tests.)
Sources: https://artificialanalysis.ai/models/muse-spark-1-3
         https://openrouter.ai/compare/meta/muse-spark-1-3/meta/muse-spark-1-3-contributor

**FB-9 — Claude Haiku 5.5 (B).** Anthropic, 7 Oct 2026; reasoning,
text+image→text, 1M ctx (per AA) — Freebuff exposes the 100k-context variant.
**AA Intelligence Index v5.0: 36 max** (34 xhigh, 30 high, 25 medium, 19 low;
v4.3.2 read 43); TB4 33%, AA-Briefcase 1578 Elo. ⚠️ Freebuff:
**6h/session**; **very verbose (440M tokens/task) → burns hours fast**. At 6h for
36 it is strictly worse value than FB-6 (3h for 36) — route it only when its
specific strengths matter, and never as the final step. (A 15h "Claude Haiku 5.5"
row was also observed — variant unreconciled.)
(Re-tier Nov 2, 2026: 36 = B band; the old S-ceiling was a v4.3.2 reading.)
Source: https://artificialanalysis.ai/models/claude-haiku-5-5

**FB-4 / FB-5 — DeepSeek V4.1 Flash (Fast) (B).** DeepSeek, 10 Sep 2026; 552B MoE
(8B/16B), 1M ctx, multimodal, MIT. **AA v5.0: no index — this build is deprecated
and unmeasured** (page reads N/A). The 1017 refresh measures **32**, so 32 is the
ceiling proxy → B. Old v4.3.2 figure was 39; do not quote it as current.
Vendor card: DeepSWE 74.2 (beats GPT-5.6 Sol 73.0), AutomationBench 54.8,
Agent's Last Exam 31.8 vs 26.7, CyberGym 88.1 vs 84.5. Freebuff's
**recommended default (3h)**; Fast variant 5h. Full 1M context here (unlike
OpenCode's 200K free cap). → Cheapest 3h slice at B; prefer it over FB-11 when
the 1017 deltas don't matter.
Source: https://artificialanalysis.ai/models/deepseek-v4-1-flash

**FB-11 — DeepSeek V4.1 Flash 1017 (B; probe-first).** DeepSeek, 17 Oct
2026 refresh of V4.1 Flash (`deepseek-flash` now routes to 1017; MIT, 552B MoE,
8B/16B, 1M ctx, text+image→text). **AA Intelligence Index v5.0: 32** (max; 29 at
the lower measured tier) — and Freebuff's serving tier is unconfirmed vs the
benchmarked max, so 32 is a ceiling, not a floor. Vendor changelog (DeepSeek API
docs + QZ/Bloomberg re-report, independent reproduction absent): DeepSWE v1.1
74.2→**77.0**, Terminal-Bench 4.0 31.2→**42.3** (Claude Code harness per QZ),
HLE no-tools 36.8→**42.6**, ProgramBench 20.3→**29.1**; shorter outputs,
~$0.20/task API-side, 209 tok/s, but still verbose (AA: 210M tokens/task vs 140M
median). Meyer's street check (Oct 18, 2026) agrees directionally but flags: all
numbers vendor-sourced, rivals compared a generation old, still trails Claude
Opus 5 on hardest reasoning/vision. Grade: **B, probe-first** — the vendor deltas
are real enough to prefer 1017 over the base for agentic coding depth, but 32 is
B and nothing more; verify with tests. Freebuff cost: **5h/session**
(operator-confirmed Oct 20, 2026) — pricier than the FB-4 base (3h), so prefer
FB-4 for routine work.
Sources: https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017
         https://api-docs.deepseek.com/news/news261017/ (vendor changelog)
         https://qz.com/deepseek-v4-1-flash-1017-model-update-benchmarks-101926
         https://thorstenmeyerai.com/reality-check/deepseek-v4-1-flash-1017-agents-price-benchmarks/ (street, vendor-numbers caveat)

**FB-8 — GPT-6 Luna (B).** OpenAI, 22 Sep 2026; reasoning, text+image→text, 1M ctx,
proprietary. **AA Intelligence Index v5.0: 28 max** (23 / 21 / 10 at lower tiers;
v4.3.2 read 38) — outranks GPT-5.6; GDPval-AA, Vals Finance Agent V2 #2/78,
HLE-Verified. ⚠️ Weaknesses:
Terminal-Bench 4.0 13% (weak agentic coding), slow (TTFT ~113s, 140M tokens/task),
verbose. Freebuff: 4h. Use for knowledge/multimodal reasoning, not agentic coding.
(Re-tier Nov 2, 2026: 28 = B band; the weak agentic profile is unchanged.)
Source: https://artificialanalysis.ai/models/gpt-6-luna

**FB-7 — GLM 5.3 Flash (B).** Z.ai, Aug 2026; 320B (18B active), 1M ctx, multimodal,
MIT. **AA Intelligence Index v5.0: 28** (v4.3.2 read 42; 4/4 Intelligence, 3/4
Cost); one tester found DeepSeek stronger on agentic coding. Freebuff: 4h.
(Re-tier Nov 2, 2026: 28 = B band; same model as OC-4.)
Source: https://artificialanalysis.ai/models/glm-5-3-flash

**FB-1 / FB-2 / FB-3 — MiMo 2.6 Flash / Flash Fast / Pro (B).** Xiaomi, Sep 2026;
309B MoE (15B active), 1M ctx, multimodal, MIT. Base/Fast = **AA v5.0 27**;
Pro = **30** (v4.3.2 read 38 for the family); benchlm #32/218 overall, #17/146
coding; slower (49 tok/s); Terminal-Bench 4.0 24.2% (weaker on longest agentic
suites). Freebuff variants: base 1h, Fast 2h, Pro 5h — **the 1h base is the
cheapest worker on the whole board**. Pro's 5h for 30 is poor value against
FB-6 (3h for 36).
(Re-tier Nov 2, 2026: 27/30 = B band.)
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash

**FB-12 — Mercury 3 (C; same evidence as OC-10).** Same model, same verdict:
C, probe-only, no AA page, AA family prior 11–12, Benchable + sponsored-video
street. BYOK against the operator's own Inception key → 100M free tokens per
new key, then $0.20/$0.70 list (50% launch $0.10/$0.35); Freebuff hour-burn
for BYOK entries unconfirmed. Connection caps (32,768 ctx / 4,096 out) are
below the model's 1M / 131,072 → raise before long-context work.
Source: same as OC-10.

> MiniMax M3.1 Flash was removed from the Freebuff roster on 2026-11-02 — do not
> route it here; it stays OC-only (and on Cline's free dropdown). Use FB-1 MiMo
> (1h) for the cheapest slice.

## Task-class matrix (which grade each kind of work demands)

Required grade is a property of the work class (harness-independent); the
Harness + Earned-by columns pin it to the model actually on that harness.

| Task class | Required grade | Harness | Earned by | Notes / risk |
|---|---|---|---|---|
| Planning / strategy | S | Antigravity | M2 / M3 | Opus 5.5 at High (52) or Medium (48); Sonnet 5.5 at High (41) is only A. Fallback Freebuff FB-10 (Argon 50). |
| Long-horizon agentic coding (build) | S | Antigravity | M2 / AG-5 | Opus 5.5 at High (52, TB 4.0 66.4% vendor) or Gemini 4 Neon at Medium (55, cheaper per token). Orchestrator-on-Neon-Medium is the cost mode for a long build that tests gate. M1 (B) supervised only. |
| Multi-step review / audit (judgment) | S | Antigravity | M2 | Opus 5.5 is the strongest reviewer here; security-flavored audits may be served by Opus 4.8 via safeguards. |
| Well-scoped code edits (tests decide) | A | Antigravity | M3 / AG-5 | Sonnet 5.5 at High = 41 = A is the cheap path; Neon at Low (44) also lands in A. M1 (31) as fallback under tests. |
| Mechanical execution / babysitting | B | Antigravity | M1 / M3 | M1 (31, 22 at low) and M3 at Medium/Low (30/25) are what you can afford to burn; M2 is not. |
| Research / extraction (no hard guarantees) | S | Antigravity | M2 / AG-5 | Opus 5.5 (HLE 67.7% with tools, GDPval 1846 Elo); Neon at Medium (55) is the cheaper S+ researcher if the window allows. |
| Final irreversible verification | S+ | Antigravity | AG-5 / AG-7 / M2 | Selectable at last: Neon at Medium 55 or above, Hydrogen at High 51 or above, Opus 5.5 at High 52. Prefer Neon at Medium (62.9M tokens) over Extra High (283M). Keep a human on the final step. |
| Planning / strategy | S | OpenCode | — | No S on OpenCode — best is OC-3 (32) and OC-5 (27), both B. Plan here only as an explicit downgrade with tests as arbiter, else route to Antigravity M2. |
| Long-horizon agentic coding (build) | S | OpenCode | — | No S builder on OpenCode — best B supervised only; real S builds go to Antigravity M2. |
| Multi-step review / audit (judgment) | S | OpenCode | — | No S reviewer on OpenCode — escalate to Antigravity M2. |
| Well-scoped code edits (tests decide) | A | OpenCode | OC-3 / OC-4 / MiniMax | Required A is unmet (nothing reaches 39): best B is OC-3 DeepSeek 32 proxy, MiniMax 29, OC-4 GLM 28 — explicit downgrade, tests decide. |
| Mechanical execution / babysitting | B | OpenCode | OC-5 / OC-1 / OC-7 | MiMo 27 / Beam 18 / Super VL 14; OC-2 Big Pickle for knowledge-flavored work. |
| Research / extraction (no hard guarantees) | S | OpenCode | — | No S researcher on OpenCode — OC-2 Big Pickle (Omniscience +43) for low-stakes only; real S research goes to Antigravity M2. |
| Final irreversible verification | S+ | OpenCode | — | No S+ on OpenCode — route the S+ step to Antigravity AG-5 with a human in the loop. |
| Planning / strategy | S | Freebuff | FB-10 | Argon 50 — the only S on the harness; 20h + 1 session/day, so ration it. FB-6 (36, 3h) is the B fallback. |
| Long-horizon agentic coding (build) | S | Freebuff | FB-10 | Argon (TB4 57%) is the only S builder; FB-11 DeepSeek-1017 (32, 5h, DeepSWE 77.0 vendor) is the B fallback once the daily slot is gone. |
| Multi-step review / audit (judgment) | S | Freebuff | FB-10 | Argon; FB-6 Muse (36) alt, FB-9 Haiku (36, verbose 6h) last. |
| Well-scoped code edits (tests decide) | A | Freebuff | FB-1 / FB-4 / FB-11 | Required A unmet (nothing reaches 39): MiMo 27 at 1h is cheapest, DeepSeek base 3h (32 proxy) and 1017 5h (32) follow. Tests decide. |
| Mechanical execution / babysitting | B | Freebuff | FB-1 | MiMo 27 at 1h — the cheapest slice on the whole board. |
| Research / extraction (no hard guarantees) | S | Freebuff | FB-10 | Argon; avoid GPT-6 Luna (28, TB4 13%, slow). |
| Final irreversible verification | S+ | Freebuff | — | No S+ on Freebuff — FB-10 is S (50). Route the S+ step to Antigravity AG-5 and keep a human in the loop. |

> **Mercury 3 (OC-10 / CL-4 / FB-12) is graded C** — below every
> required grade in this matrix, so it earns **no matrix row**. It is a
> *probe* instrument: run it on a cheap, reversible task (a draft, a first
> pass, a latency-sensitive loop) and let a graded model decide. It must never
> take the S/S+/irreversible slot on any harness.
>
> **Hermes** holds no Inception entry (provider `nous`, openrouter + gemini
> fallbacks) and **Claude Code is not installed** → no Mercury 3 routing on
> either. S-class work stays on Antigravity M2 and Freebuff FB-10.

---

## Risk flags

- **S+ exists, but only on the Pro plan (Nov 22, 2026):** Gemini 4 Neon reaches 55
  at Medium and 61 at Extra High, Hydrogen reaches 51 at High, and Opus 5.5
  reaches 52 at High. All are Pro-only. The six free accounts reach Gemini 3.8
  Flash (B) plus the deprecated Claude Opus 4.6 and Sonnet 4.6 (C), so a free
  account cannot close out an S or S+ task.
- **Neon cost:** 62.9M output tokens per task at Medium, 283M at Extra High. Route
  Medium unless the 5-hour window is wide open.
- **Claude rows are capped at High (Nov 22, 2026):** the picker offers Low /
  Medium / High only. Opus 5.5 reads 52 / 48 / 35, Sonnet 5.5 reads 41 / 30 / 25,
  so Sonnet's AA-max 54 is unreachable here. Grade the tier, never the model card.
- **M3 Claude Sonnet 5.5:** shares the **Claude quota bucket** with M2. AA v5.0
  ladder High 41 (A) / Medium 30 (B) / Low 25 (C); High is its ceiling on this
  harness. $2/$10, 1M ctx. Prefer M3 over M2 for cost-sensitive A work; M2 stays
  the stronger reviewer. Watch the Claude bucket, not just the Gemini one.
- **Orchestrator is a cost mode, not a model:** it wraps Neon, Argon, or Opus 5.5 and
  sends some steps to an undisclosed executor. The rule is per step, not per task: safe
  when the offloaded step is evidence a tool can check, unsafe when it is comprehension or
  judgment the big model then trusts. Audits and signed reviews stay flat because their
  product is a claim about what was examined. First use is an A/B against the flat model.
- **Board re-tiered on AA Intelligence Index v5.0.** Bands **S+ 51+ · S 46–50 ·
  A 39–45 · B 26–38 · C <26**. Highest measured is Gemini 4 Neon at 61. Every
  grade in this file is stamped on v5.0. v4.3.2 numbers are historical: Gemini 3.8
  Flash reads 31 now vs 41 then, GLM-5.3-Flash 28 vs 42, MiMo-V2.6-Flash 27 vs 38.
  **Consequence: A is thin, S+ is Antigravity-only, every free-tier model is B.**
  Grade any newly added model on v5.0 from `models-research-handbook.md`; re-check
  every score within ~3 pts of a band edge (B/A edge at 38/39, S/S+ edge at 50/51).
- **Quota gating:** the Antigravity plan is bound by a 5-hour window plus a weekly
  cap. Neon at Medium and Opus 5.5 at High are both heavy draws — route worthy
  tasks first, never run them as a background worker, and watch the reset window.
- **Terminal-Bench 4.0 weak:** M1's 19.1% plus its v5.0 index of 31 keeps it B — do not route the hardest long-horizon agent suites here as if it were frontier-class.
- **No S+ on Freebuff:** FB-10 Gemini 4 Argon is now **S (50)**, 9 pts under F —
  it was re-graded down on v5.0. It stays the harness's best (1 session/day), but
  it is not a reserve-grade closeout path; nothing is.
- **OpenCode/Cline have no S or S+:** best available is B — OC-3 DeepSeek 32
  proxy, MiniMax 29, OC-4 GLM 28 on OpenCode; Muse Contributor 36 proxy,
  MiniMax 29, CL-2 MiMo 27 on Cline. S-work routes to Antigravity M2 or FB-10.
  The task matrix reflects the gaps honestly.
- **Nemotron 3 Ultra is C on the v5.0 page (12):** the 47.7 partner figure was a
  v4.3.2-scale number and cannot lift it — guardrailed only.
- **Super VL is C (14) on both harnesses:** vendor GPQA/SWE numbers cannot lift
  it above the yardstick without independent re-verification.
- **MiniMax M3.1 Flash (B) — OC and Cline only:** removed from the Freebuff
  roster on 2026-11-02 → no Freebuff routing, no FB id. Index 29 on v5.0
  (the 43 was v4.3.2), 30 pts below frontier 59; vendor DeepSWE 73.7
  harness-unnamed (AA primary); indie SWE-Mini 75%; verbose 180M/task +
  default-max burn → set effort low/medium explicitly; geometry first-drafts
  C-work; HHEM unmeasured → no summarization/RAG routing until scored; never
  the final step.
- **Freebuff ids were normalized 2026-11-02 to match `models.md`:** **FB-11** is
  the DeepSeek V4.1 Flash 1017 refresh (5h) and **FB-12** is Mercury 3. The old
  labels (1017 under FB-12, Mercury under FB-13) are retired — read `models.md`
  before quoting any FB id.
- **OpenCode free context caps:** DeepSeek V4.1 Flash Free and GLM-5.3-Flash Free are capped at 200K context (paid = 1M); verify the cap serves the task before routing.
- **Cline free tiers are account-quota-limited** (rotate accounts for fresh quotas); watch per-account limits before a long run, not a daily-reset clock.
- **CL-1 Solar Mini 4 (C, text-only):** no v5.0 index (the 24 was v4.3.2); 1% agentic coding + 18% knowledge accuracy → long-context text-in reasoning only; never research/QA, never coding.
- **Muse Spark 1.3 Contributor (B, no `models.md` Cline id):** graded on the regular-tier v5.0 index (**36**) because the free Contributor tier has no own benches; the free tier is capped to low/medium reasoning (max reasoning is Standard-only) and trades data for price, so real free-tier output runs below 36. Probe before any S-grade work; it is B, not S.
- **No S+ and no S on Cline:** its best is Muse Contributor at 36 (B, ceiling proxy). The irreversible final step is unowned on every harness.
- **Mercury 3 (OC-10 / CL-4 / FB-12) — C, probe-only, five hard flags:**
  (1) **No AA page** — nothing independent has reproduced the vendor claim;
  the AA family prior (Mercury 2 = 11, Mercury 2.5 = 12) points well below
  Luna 28 / Haiku 36 on v5.0, so "beats Luna/Haiku" is a statement about Inception's
  private suite. (2) **Trains on your prompts by default** — ToS grants a
  perpetual license to train on User Submissions; opt-out is the platform
  toggle "Improve the model for everyone" → OFF. **Never send private repo
  code, secrets, or confidential context.** (3) **Sponsored evidence** — the
  most detailed third-party write-up (Witteveen) was sponsored by Inception;
  discount it. (4) **Launch discount is temporary** — $0.10/$0.35 is 50% off
  the $0.20/$0.70 list, and the operator's free runway is 100M tokens per new
  key; re-check the rate before any long run. Where the provider is wired:
  **OpenCode ships a native `inception` provider** (models.dev catalog —
  model ref `inception/mercury-3`, limits ctx 1,000,000 / output 131,072,
  effort low/medium/high, tool_call + structured_output) authenticated with the
  operator's own key (`opencode.db` credential table, integration_id
  `inception`); the same key is also wired in the FreeLLMAPI router (custom
  platform `mercury-3`, where `context_window` is NULL) and in Freebuff BYOK
  (connection declares 32,768 ctx / 4,096 out — raise). Cline has the same
  native `inception` provider (verified in `~/.cline/data/settings/
  providers.json`) and also lists `mercury-3` under its `freellm` router
  provider. **Hermes is not wired to Inception; Claude Code is not
  installed.** (5) **Vendor speed
  not reproduced**: measured Oct 21 — TTFT 0.71s, decode ~415 tok/s, ~296
  tok/s end-to-end, vs the advertised 1,068 tok/s decode-only on NVIDIA
  Blackwell. Use the measured number for planning, not the headline.
- **Freebuff is time-billed, not token-billed:** 21h/day (Starter $8/mo) + 60h wallet/mo (replaces unused); refill 12:00 AM Asia/Jerusalem. Higher models burn the pool faster — route the smallest time-slice that clears the grade.
- **FB-9 Claude Haiku 5.5 (B, 6h):** 100k-context variant; AA v5.0 36 max (19 at low); very verbose (440M tokens/task) → hours burn fast, and 6h for 36 is worse value than FB-6's 3h for 36. (A 15h "Claude Haiku 5.5" row was also observed — if confirmed as the regular-context variant, add as a separate row, ctx in notes.)
- **FB-11 DeepSeek V4.1 Flash 1017 (B, 5h, probe-first):** AA v5.0 32 is the
  max-tier ceiling; Freebuff's serving tier is unconfirmed and all deltas are
  vendor-sourced/unreproduced — probe before trusting, and it is B work, not S.
  Same burn as FB-5 Fast; prefer FB-4 base (3h) for routine work.
- **FB-10 Gemini 4 Argon (S, 20h):** Promotional · **1 session/day** only. The
  best model on Freebuff at 50 — ration the single daily slot for high-value work,
  but it does not close out an S+ requirement.
- **FB-4/5 DeepSeek V4.1 Flash (B, 3h/5h):** no v5.0 index (deprecated build);
  32 from the 1017 refresh is the ceiling proxy. Freebuff's recommended default;
  1M ctx (no 200K cap here).
- **FB-8 GPT-6 Luna (B, 4h):** AA v5.0 28 max, weak agentic coding (TB4 13%) + slow (TTFT ~113s, 140M tok/task) → knowledge/multimodal reasoning only, not coding.
