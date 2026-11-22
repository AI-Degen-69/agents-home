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
> **no AA model page / no own benches** (e.g. the 100k-context Haiku 5.5 on
> Freebuff - AA/OpenRouter list the tier as "Not available"), cite the AA article or the
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

The only S+ surface in the inventory, and the only one where one run can spend two quota
buckets at once. Grades follow the **selected thinking tier**, because the picker exposes it.

### Grades (best → worst)

| Grade | Meaning | Models at this tier |
|---|---|---|
| S+ | Reserve: irreversible / money-adjacent / subtle-invariant work | AG-5 Neon (Medium 55, High 60, Extra 61), AG-7 Hydrogen (High 51, Extra 54), AG-2 Opus 5.5 (High 52), AG-10 Carbon (Ultra only) |
| S | Top: long-horizon agentic coding, multi-step reasoning, review | AG-6 Argon (High 50), AG-2 Opus 5.5 (Medium 48) |
| A | Competent: well-scoped edits under tests, straightforward research | AG-5 Neon (Low 44), AG-3 Sonnet 5.5 (High 41), AG-7 Hydrogen (Medium 41) |
| B | Light / probe: mechanical work, babysitting, free verification passes | AG-1 Gemini 3.8 Flash (Medium 30, High 31), AG-2 Opus 5.5 (Low 35), AG-3 Sonnet 5.5 (Medium 30), AG-7 Hydrogen (Low 27) |
| C | Weak fit: deprecated, retiring, or unverified | AG-4 Opus 4.6, AG-9 Sonnet 4.6, AG-8 GPT-OSS 120B, AG-3 Sonnet 5.5 (Low 25), AG-1 Gemini 3.8 Flash (Low 22) |
| D | Do not route | none |

### Evidence

| # | Model | Grade | One line | Source |
|---|---|---|---|---|
| AG-5 | Gemini 4 Neon | S+ | AA 61 Extra / 60 High / 55 Medium / 44 Low; #1 AA Coding Agent Index 58.6; AutomationBench 56.3; 32% cheaper than Carbon at High; 512K ctx on this harness | antigravity.google/docs/models + artificialanalysis.ai/models/gemini-4-neon |
| AG-7 | Gemini 4 Hydrogen | S+ | AA 54 Extra / 51 High / 41 Medium / 27 Low; TB 4.1 57% vs 3.8 Flash 18.2%; $1.50/$7.50 | antigravity.google/blog/gemini-4-hydrogen-in-google-antigravity |
| AG-2 | Claude Opus 5.5 | S+ | AA 52 High / 48 Medium / 35 Low; TB 4.0 66.4% vendor; the picker stops at High | artificialanalysis.ai/models/claude-opus-5-5 |
| AG-6 | Gemini 4 Argon | S | AA 50 High / 48 Medium; slowest row at 26.2 min/task, $4/$20; planner-capable | artificialanalysis.ai/models/gemini-4-argon |
| AG-10 | Gemini 4 Carbon | S+ | AA 60 highest; the strongest planner listed; Ultra only, so it reads Unavailable on Pro | antigravity.google/docs/models |
| AG-3 | Claude Sonnet 5.5 | A | AA 41 High / 30 Medium / 25 Low; executor-capable; no Extra tier in the picker | artificialanalysis.ai/models/claude-sonnet-5-5 |
| AG-1 | Gemini 3.8 Flash | B | AA 31 High / 30 Medium / 22 Low; TB 4.1 18.2% | antigravity.google/docs/models |
| AG-4 | Claude Opus 4.6 | C | Deprecated, AA index withdrawn; **retires Nov 30, 2026** | artificialanalysis.ai/models/claude-opus-4-6 |
| AG-9 | Claude Sonnet 4.6 | C | Deprecated, AA index withdrawn; **retires Nov 30, 2026** | artificialanalysis.ai/models/claude-sonnet-4-6 |
| AG-8 | GPT-OSS 120B | C | Medium only, Notice flag, no AA read; **retires Nov 30, 2026** | picker 2026-11-22 |

### Orchestrator — grade the pair, not the planner alone

It is a planner/executor pair with a documented, closed supported list.

| Role | Models |
| --- | --- |
| Planner | Gemini 4 Neon (default), Gemini 4 Argon, Claude Opus 5.5 (App only), Gemini 4 Carbon (Ultra only) |
| Executor | Gemini 4 Hydrogen (default), Claude Sonnet 5.5 — set in Orchestrator Settings, not in the planner palette |

**Flow.** Read-only planning phase, then the executor implements. Control returns to the
planner on friction: a verification failing twice, an interface that behaves differently, or a
design choice the plan left open. The planner also reviews progress on long tasks.

**A review is not delegated.** A question, review, or explanation is answered by the planner
directly. That is why a review through Orchestrator keeps its evidence chain intact: Neon reads
the code, not a summary of it.

**Grading rule.** Both roles are graded. A run's grade is the **lower of the two** tiers in use,
not the planner's alone. Orchestrator-on-Neon-Medium with Hydrogen at High is 55 and 51: both
S+, so the run is S+ at a fraction of Neon's token cost. Hydrogen at Medium (41) drags the same
run down to A. Set the executor tier deliberately; it is the cheap half of the pair.

**Use it for:** feature work, bug fixes, refactoring, multi-file debugging, and reviews where
you want Neon's judgment with Hydrogen's execution. That is the vendor's own recommended default.

**Skip it for:** work where one model must hold the whole problem at maximum depth — designing a
distributed system from scratch, untangling concurrency races, multi-repo migrations. The docs
name those cases and route them to a flat Neon, Carbon, or Argon.

**Cost:** vendor measure on Terminal-Bench 4.1 is near-Carbon success at **24% less quota and
19% faster**. Treat the numbers as vendor-reported; the pair is free to try inside the window.

**Two-bucket trick:** planner on Claude Opus 5.5 draws the Claude bucket, executor Hydrogen draws
the Gemini bucket. That splits one run across both pools.

### The A/B that settles the pair (not run yet)

The vendor numbers are unreproduced on this machine, so the pair carries no grade it did not
inherit. One task settles it.

1. **Pick a task with a test gate:** one small feature in a repo whose suite fails before and
   passes after. Same prompt both runs, written once and pasted twice.
2. **Run A, flat.** Fresh conversation, Neon at Medium, Orchestrator off. Note the start time.
   End when the suite passes or you give up. Record: pass/fail, wall clock, the quota reading
   from Settings → Usage before and after, files touched, and every time you had to correct it.
3. **Reset.** `git reset --hard <sha>` plus `git clean -fd` to the exact starting commit. A
   different tree invalidates the comparison.
4. **Run B, Orchestrator.** Fresh conversation, planner Neon at Medium, executor Hydrogen at
   **High** in Orchestrator Settings. Same prompt. Record the same five facts, plus how many
   times control returned to the planner.
5. **Compare and write it here.** Pass/fail first — a cheaper failure is not a saving. If B
   passes, compare quota and minutes. If B fails where A passed, the executor tier is the
   suspect: rerun B once at Hydrogen Extra before drawing a conclusion.

What the app does not show, do not invent. If Usage reports only a percentage, record the
percentage. If it reports nothing, say the token comparison is unavailable and decide on pass
rate and minutes alone.

| Run | Planner | Executor | Pass | Minutes | Quota used | Corrections |
| --- | --- | --- | --- | --- | --- | --- |
| A | Neon Medium | — | | | | |
| B | Neon Medium | Hydrogen High | | | | |

### Plan gating

| Row | Free | Pro | Ultra |
| --- | --- | --- | --- |
| Gemini 4 Neon, Argon | no | yes | yes |
| Gemini 4 Hydrogen, Opus 5.5, Sonnet 5.5 | no | yes | yes |
| Gemini 4 Carbon | no | no | yes |
| Orchestrator | no | yes | yes |

A free account reaches Gemini 3.8 Flash (B) and three rows that retire on Nov 30. It cannot
close out an S or S+ task on any plan tier.

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

Time-billed, not token-billed (see models.md hours). **All six rows grade B.** The
surface lost its only S row on 2026-11-22 when Gemini 4 Argon left the roster, so
Freebuff is overflow capacity for mechanical and light work, not a place to close
out an S or S+ task.

### Grades

| Grade | Models |
|---|---|
| A and above | none — the best measured score here is 36 |
| B | FB-6 Muse Spark 1.3 (36), FB-9 Claude Haiku 5.5 (36), FB-13 Muse Ember (36), FB-4 / FB-5 DeepSeek V4.1 Flash (32 proxy), FB-8 GPT-6 Luna (28) |

### Evidence

| # | Model | Grade | One line | Source |
|---|---|---|---|---|
| FB-6 | Muse Spark 1.3 | B | AA 36 on v5.0.1; multimodal reasoning, 1M ctx; 3 h | artificialanalysis.ai/models/muse-spark-1-3 |
| FB-9 | Claude Haiku 5.5 | B | AA 36 max; the 100k-context variant here; 440M tokens/task, so 6 h burns fast | artificialanalysis.ai/models/claude-haiku-5-5 |
| FB-13 | Muse Ember | B | Meta, 9 Nov 2026; AA 36 max / 34 xhigh, #2 of 40 in its price class; 1M ctx, $0.10/$0.50, 3.0 min/task, 115M tokens; 6 h | artificialanalysis.ai/models/muse-ember |
| FB-4 | DeepSeek V4.1 Flash | B | no v5.0 index for this build; 32 from the 1017 refresh is the ceiling proxy; 2 h, the cheapest B slice on the board | artificialanalysis.ai/models/deepseek-v4-1-flash |
| FB-5 | DeepSeek V4.1 Flash Fast | B | same model, faster serving, 3 h for the same cell | same as FB-4 |
| FB-8 | GPT-6 Luna | B | AA 28 max; TB 4.0 13%; TTFT ~113 s; knowledge work only, not agentic coding; 4 h | artificialanalysis.ai/models/gpt-6-luna |

### Routing

- **FB-4 is the default.** 2 h for a B cell is the cheapest work anywhere in the inventory.
- **FB-6 when a build needs the extra 4 points.** 3 h for 36. **FB-13** at 36 costs 6 h and
  only wins on context: 1M tokens and image input.
- **Overflow only.** Freebuff is what runs when both Antigravity windows are dry, or when the
  work does not deserve a window at all. S and S+ work goes to Antigravity AG-5 and AG-6.
- **The daily Argon slot is gone.** With it went the only reason to ration this surface.

## Task-class matrix (which grade each kind of work demands)

Required grade is a property of the work class (harness-independent); the
Harness + Earned-by columns pin it to the model actually on that harness.

| Task class | Required grade | Harness | Earned by | Notes / risk |
|---|---|---|---|---|
| Planning / strategy | S | Antigravity | AG-6 / AG-2 | Argon at High (50) plans on the Gemini bucket; Opus 5.5 at High (52, S+) is stronger but spends the Claude bucket. Sonnet 5.5 at High (41) is only A. No Freebuff fallback — its best row is 36. |
| Long-horizon agentic coding (build) | S | Antigravity | Orchestrator (AG-5 + AG-7) | Neon at Medium (55) plans and reviews, Hydrogen at High (51) executes; both S+, so the pair grades S+. Set the executor tier deliberately — Hydrogen at Medium (41) drops the pair to A. Flat AG-5 or AG-2 at High when one model must hold the whole problem: distributed design, concurrency races, multi-repo migrations. |
| Multi-step review / audit (judgment) | S | Antigravity | AG-2 / AG-6 | Opus 5.5 at High (52) is the strongest reviewer; Argon at High (50) is the cheaper S reviewer. An Orchestrator pair keeps the evidence chain because reviews go to the planner directly. |
| Well-scoped code edits (tests decide) | A | Antigravity | AG-3 / AG-5 / AG-7 | Sonnet 5.5 at High (41) is the cheap A path; Neon at Low (44) and Hydrogen at Medium (41) also land in A. AG-1 (31, B) only under tests. |
| Mechanical execution / babysitting | B | Antigravity | AG-1 / AG-3 | Gemini 3.8 Flash (31, 22 at Low) and Sonnet 5.5 at Medium/Low (30/25) are what you can afford to burn. AG-1 is also the only row a free account keeps after Nov 30. |
| Research / extraction (no hard guarantees) | S | Antigravity | AG-2 / AG-5 | Opus 5.5 (HLE 67.7% with tools, GDPval 1846 Elo); Neon at Medium (55) is the cheaper S+ researcher if the window allows. |
| Final irreversible verification | S+ | Antigravity | AG-5 / AG-7 / AG-2 | Neon at Medium (55), Hydrogen at High (51), Opus 5.5 at High (52). An Orchestrator pair (Neon Medium + Hydrogen High) also grades S+ and spends less. Prefer Neon Medium (62.9M tokens) over Extra (283M). Keep a human on the final step. |
| Planning / strategy | S | OpenCode | — | No S on OpenCode — best is OC-3 (32) and OC-5 (27), both B. Plan here only as an explicit downgrade with tests as arbiter, else route to Antigravity AG-6. |
| Long-horizon agentic coding (build) | S | OpenCode | — | No S builder on OpenCode — best B supervised only; real S builds go to Antigravity AG-5. |
| Multi-step review / audit (judgment) | S | OpenCode | — | No S reviewer on OpenCode — escalate to Antigravity AG-2. |
| Well-scoped code edits (tests decide) | A | OpenCode | — | Required A unmet: best is OC-3 DeepSeek (32 proxy), MiniMax (29), OC-4 GLM (28), all B — explicit downgrade, tests decide. |
| Mechanical execution / babysitting | B | OpenCode | OC-5 / OC-1 / OC-7 | MiMo 27 / Beam 18 / Super VL 14; OC-2 Big Pickle for knowledge-flavored work. |
| Research / extraction (no hard guarantees) | S | OpenCode | — | No S researcher on OpenCode — OC-2 Big Pickle (Omniscience +43) for low-stakes only; real S research goes to Antigravity AG-2. |
| Final irreversible verification | S+ | OpenCode | — | No S+ on OpenCode — route the S+ step to Antigravity AG-5 with a human in the loop. |
| Planning / strategy | S | Freebuff | — | No S here — the best row is FB-6 at 36. S planning runs on Antigravity AG-2 or an Orchestrator pair. |
| Long-horizon agentic coding (build) | S | Freebuff | — | No S builder. FB-4 (32 proxy) is the fallback only when both Antigravity windows are dry; real S builds go to AG-5. |
| Multi-step review / audit (judgment) | S | Freebuff | — | No S reviewer. FB-6 (36) buys a cheap second opinion; the audit itself runs on Antigravity AG-2. |
| Well-scoped code edits (tests decide) | A | Freebuff | — | Required A unmet (nothing reaches 39): FB-4 at 2 h (32 proxy) is the cheapest slice here. Tests decide. |
| Mechanical execution / babysitting | B | Freebuff | FB-4 | DeepSeek V4.1 Flash at 2 h — the cheapest slice on the whole board. FB-6 (3 h, 36) when a build needs the extra 4 points. |
| Research / extraction (no hard guarantees) | S | Freebuff | — | No S researcher. FB-13 Muse Ember (36, 1M ctx, image input) for cheap extraction, not conclusions. Avoid GPT-6 Luna. |
| Final irreversible verification | S+ | Freebuff | — | No S+ and now no S either. The step runs on Antigravity AG-5 with a human in the loop. |

> **Freebuff is a B-only surface after 2026-11-22.** Gemini 4 Argon left the
> roster, and with it the only row that cleared S. Every remaining row grades B,
> so this harness can meet the mechanical and well-scoped rows and nothing above
> them.
>
> **Mercury 3 (OC-10) is graded C** — below every required grade in this matrix,
> so it earns **no matrix row**. It is a *probe* instrument: run it on a cheap,
> reversible task (a draft, a first pass, a latency-sensitive loop) and let a
> graded model decide. It must never take the S/S+/irreversible slot.
>
> **Hermes** holds no Inception entry and **Claude Code is not installed** → no
> Mercury 3 routing on either. S-class work stays on Antigravity AG-2 and AG-6.

---

## Risk flags

- **S+ exists, but only on the paid Pro plan (Nov 22, 2026):** Neon reaches 55 at
  Medium and 61 at Extra; Hydrogen reaches 51 at High; Opus 5.5 reaches 52 at High.
  Free accounts reach Gemini 3.8 Flash (B) plus three rows that retire on Nov 30,
  so they cannot close out an S or S+ task.
- **Neon context is 512K on Antigravity,** not the 1M on the AA card. Check the cap
  before routing a large repo.
- **Neon cost:** 62.9M output tokens per task at Medium, 283M at Extra. Route Medium
  unless the 5-hour window is wide open.
- **Two quota buckets (Nov 22, 2026):** Gemini models and Claude/GPT models are metered
  separately, each with a five-hour and a weekly window. An Opus-planned,
  Hydrogen-executed Orchestrator run spends both buckets instead of draining one.
- **Three rows retire Nov 30, 2026:** Claude Opus 4.6, Claude Sonnet 4.6 and
  GPT-OSS 120B. After that date a free account has Gemini 3.8 Flash only.
- **Claude rows are capped at High (Nov 22, 2026):** the picker offers Low /
  Medium / High only. Opus 5.5 (AG-2) reads 52 / 48 / 35, Sonnet 5.5 (AG-3) reads
  41 / 30 / 25, so Sonnet's AA-max 54 is unreachable here. Both draw the **Claude
  bucket**, separate from the Gemini bucket. Grade the tier, never the model card.
  Prefer AG-3 for cost-sensitive A work; AG-2 stays the stronger reviewer.
- **Orchestrator is a planner/executor pair, not a model:** the supported list is closed
  (planners Neon, Carbon, Argon, Opus 5.5; executors Hydrogen, Sonnet 5.5). Questions and
  reviews go to the planner directly, so a review keeps its evidence chain. Grade a run by
  the lower of the two tiers, and set the executor tier deliberately: Hydrogen at Medium
  drags an S+ plan down to A.
- **Claude rows in an Orchestrator pair are metered separately:** an Opus 5.5 planner draws
  the Claude bucket while Hydrogen draws the Gemini bucket.
- **Board re-tiered on AA Intelligence Index v5.0.** Bands **S+ 51+ · S 46–50 ·
  A 39–45 · B 26–38 · C <26**. Highest measured is Gemini 4 Neon at 61. Every
  grade in this file is stamped on v5.0. v4.3.2 numbers are historical: Gemini 3.8
  Flash reads 31 now vs 41 then, GLM-5.3-Flash 28 vs 42, MiMo-V2.6-Flash 27 vs 38.
  **Consequence: A and above exist only on Antigravity, every free-tier model is B.**
  Grade any newly added model on v5.0 from `models-research-handbook.md`; re-check
  every score within ~3 pts of a band edge (B/A edge at 38/39, S/S+ edge at 50/51).
- **Quota gating:** the Antigravity plan is bound by a 5-hour window plus a weekly
  cap. Neon at Medium and Opus 5.5 at High are both heavy draws — route worthy
  tasks first, never run them as a background worker, and watch the reset window.
- **Terminal-Bench 4.0 weak:** AG-1's 19.1% plus its v5.0 index of 31 keeps it B — do not route the hardest long-horizon agent suites here as if it were frontier-class.
- **Freebuff has no S row at all (Nov 22, 2026):** Gemini 4 Argon left the roster,
  so the best remaining score is 36 (B) at 3 h. Freebuff is overflow for B work;
  S and S+ work runs on Antigravity AG-5 or AG-6.
- **OpenCode has no S or S+:** best available is B — OC-3 DeepSeek 32 proxy,
  MiniMax 29, OC-4 GLM 28. S work routes to Antigravity. The task matrix reflects
  the gap honestly.
- **Nemotron 3 Ultra is C on the v5.0 page (12):** the 47.7 partner figure was a
  v4.3.2-scale number and cannot lift it — guardrailed only.
- **Super VL is C (14) on both harnesses:** vendor GPQA/SWE numbers cannot lift
  it above the yardstick without independent re-verification.
- **MiniMax M3.1 Flash (B) — OpenCode only:** removed from the Freebuff roster
  on 2026-11-02 → no Freebuff routing, no FB id. Index 29 on v5.0
  (the 43 was v4.3.2), 30 pts below frontier 59; vendor DeepSWE 73.7
  harness-unnamed (AA primary); indie SWE-Mini 75%; verbose 180M/task +
  default-max burn → set effort low/medium explicitly; geometry first-drafts
  C-work; HHEM unmeasured → no summarization/RAG routing until scored; never
  the final step.
- **Freebuff roster cut on 2026-11-22:** MiMo 2.6 Flash / Fast / Pro, GLM 5.3
  Flash, Gemini 4 Argon, DeepSeek V4.1 Flash 1017 and Mercury 3 left the app.
  FB-1, FB-2, FB-3, FB-7, FB-10, FB-11 and FB-12 are retired ids; FB-13 is the
  only addition (Muse Ember). Read `models.md` before quoting any FB id.
- **OpenCode free context caps:** DeepSeek V4.1 Flash Free and GLM-5.3-Flash Free are capped at 200K context (paid = 1M); verify the cap serves the task before routing.
- **Mercury 3 (OC-10) — C, probe-only, five hard flags:**
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
  `inception`). **Claude Code is not installed**, so OpenCode is the only surface
  that can reach it. (5) **Vendor speed
  not reproduced**: measured Oct 21 — TTFT 0.71s, decode ~415 tok/s, ~296
  tok/s end-to-end, vs the advertised 1,068 tok/s decode-only on NVIDIA
  Blackwell. Use the measured number for planning, not the headline.
- **Freebuff is time-billed, not token-billed:** 21h/day (Starter $8/mo) + 60h wallet/mo (replaces unused); refill 12:00 AM Asia/Jerusalem. Higher models burn the pool faster — route the smallest time-slice that clears the grade.
- **FB-4 DeepSeek V4.1 Flash (B, 2 h):** no v5.0 index for this build; 32 from the 1017 refresh is the ceiling proxy. The cheapest slice on the board and Freebuff's recommended default. 1M ctx.
- **FB-6 Muse Spark 1.3 (B, 3 h):** AA 36. The best measured score here; take it when a build needs the extra 4 points over FB-4.
- **FB-9 Claude Haiku 5.5 (B, 6 h):** 100k-context variant; AA 36 max (19 at low); very verbose (440M tokens/task), so the hours burn fast. Worse value than FB-6 at the same score.
- **FB-13 Muse Ember (B, 6 h):** Meta, 9 Nov 2026; AA 36 max / 34 xhigh; 1M ctx, image input, $0.10/$0.50, 3.0 min/task, 115M tokens. The only reason to pay 6 h over FB-6's 3 h is context, not score.
- **FB-8 GPT-6 Luna (B, 4 h):** AA 28 max, weak agentic coding (TB4 13%) + slow (TTFT ~113s, 140M tok/task) → knowledge/multimodal reasoning only, not coding.
