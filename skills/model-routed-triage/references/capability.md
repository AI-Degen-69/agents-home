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

---

## Antigravity

### Grades (best → worst)

School-style: **S+** (reserve) > **S** (top) > **A** > **B** > **C** > **D**.

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve: irreversible / money-adjacent / subtle-invariant work needing the strongest available | (none on Antigravity — Index 41, A band) |
| S | Top: long-horizon agentic coding, multi-step reasoning, review/audit needing judgment | (none on Antigravity — M1 is A globally; S-work routes to Freebuff FB-6 / Cline CL-4) |
| A | Competent: well-scoped edits, mechanical execution under tests, straightforward research | **M1: Gemini 3.8 Flash** |
| B | Light / probe: trivial mechanical tasks, closeout babysitting, free verification passes | (none yet on Antigravity) |
| C | Weak fit: known benchmark gaps; usable with guardrails | (none yet on Antigravity) |
| D | Do not route: capability below bar | (none yet on Antigravity) |

### Gemini 3.8 Flash (M1) — evidence & grade justification

- **Release:** 2026-09-02. API ID `gemini-3.8-flash`. General availability via
  Google AI Studio & Gemini Enterprise Agent Platform.
- **Positioning:** "the best reasoning & coding Flash yet" at 3.7's speed/cost.
- **Benchmarks (authoritative sources):**
  - Terminal-Bench 2.1 — **90.8%** (up from 3.7's 81.6%) — strong long-horizon coding agent.
  - DeepSWE v1.1 (long-horizon coding) — outperforms most larger frontier models.
  - Vals Finance Agent V2 — #2 of 78.
  - HLE-Verified — **54.9%** multi-step STEM/humanities reasoning.
  - CharXiv (reasoning, no tools) — 86.2%; LVBench — 87.1%; BioMysteryBench human-solvable — 88.8%.
  - Terminal-Bench 4.0 — 19.1% → **weak** on this harder/longer agent suite (flag).
- **Valuation:** Vals Index #17/47 (overall 54.89%); strong on finance/legal agent tasks.
- **Safety note:** Google DeepMind model card (Sep 2026) states 3.8 Flash shows
  no material safety-level increase over 3.7 Flash per the Frontier Safety
  Framework.
- **Verdict:** earns **A** (Index 41 high / 40 medium — A band; TB 2.1 90.8% is
  elite but TB 4.0 19.1% + Index 10+ pts below the live frontier keep it out of
  S globally). Quota-gated (5h + weekly) — route the final
  verification/review to an S+ model/human rather than burning the reserve on a
  non-worthy closeout. (Global re-tier: previously S on a stale scale.)

---

## Hermes

> *(add your Hermes models here — same grade-table shape as Antigravity)*

### Grades (best → worst)

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve | (none yet on Hermes) |
| S | Top | (none yet on Hermes) |
| A | Competent | (none yet on Hermes) |
| B | Light / probe | (none yet on Hermes) |
| C | Weak fit | (none yet on Hermes) |
| D | Do not route | (none yet on Hermes) |

---

## OpenCode

### Grades (best → worst)

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve | (none — nothing on OpenCode clears Index 50) |
| S | Top | (none — nothing on OpenCode clears Index 45) |
| A | Competent | OC-10: MiniMax M3.1 Flash (43); OC-4: GLM-5.3-Flash (42); OC-3: DeepSeek V4.1 Flash (39); OC-6: MiMo-V2.6-Flash (38) |
| B | Light / probe | OC-9: Nemotron 3.5 Super VL (26); OC-1: Beam (30); OC-2: Big Pickle (no page; indie B-band) |
| C | Weak fit | OC-7: Nemotron 3 Ultra (GA page 23; 47.7 pre-release conflict); OC-8: Nemotron 3.5 Lightning (13); OC-5: LongCat 2.5 Preview (Go collapse, slow) |
| D | Do not route | (none — all OpenCode models now carry at least provisional evidence) |

### Justification by model

**OC-3 — DeepSeek V4.1 Flash (A).** Released 2026-09-10; 552B MoE (8B
active prefill / 16B decode), 1M context, multimodal, MIT weights.
**Artificial Analysis Intelligence Index: 39** (independent; median 19 for
open-weight large) — 4/4 Intelligence, 4/4 Speed (176 tok/s). Beats GPT-5.6
Sol and Claude Opus-5.0 on DeepSWE v1.1 (74.2 vs 73.0), AutomationBench
(54.8 vs 45.8), Agent's Last Exam (31.8 vs 26.7), CyberGym (88.1 vs 84.5)
(vendor model card, as cited by Flowtivity). Free tier capped at 200K context
(paid = 1M) and time-limited.
Source: https://artificialanalysis.ai/models/deepseek-v4-1-flash

**OC-4 — GLM-5.3-Flash (A).** Z.ai, Aug 2026; 320B params (18B active), 1M
context, multimodal, MIT weights. **Artificial Analysis Intelligence Index: 42**
(independent; highest among these OpenCode models, median 19 for open-weight
large) — 4/4 Intelligence, 3/4 Cost ($0.15/$0.50). Free tier capped at 200K
context (paid = 1M) and time-limited; one tester found DeepSeek V4.1 Flash
stronger on agentic coding.
Source: https://artificialanalysis.ai/models/glm-5-3-flash

**OC-7 — Nemotron 3 Ultra (C).** NVIDIA, Jun 2026; 550B params, 1M
context, open-weight (OpenMDW) — largest/hardest-reasoning Nemotron.
**Artificial Analysis Intelligence Index: 23** on the GA model page (independent;
median 18), 190 tok/s. ⚠️ Conflict: NVIDIA's pre-release partner launch article
reports **47.7** (NVFP4) / 48.2 (BF16), ahead of Gemma 4 31B (39.2) and behind
Kimi K2.6 (53.9). Treat the 47.7 figure as pre-GA/partner-eval until the public
index matches; flag before routing worth work. Free tier = 1M context; no
verified DeepSWE/Terminal-Bench 4.0 pass@1 vs DeepSeek.
Source: https://artificialanalysis.ai/models/nvidia-nemotron-3-ultra-550b-a55b
(Global re-tier: GA page Index 23 = C band. The 47.7 partner figure would be S
if the public index ever converges to it — until then, guardrailed only.)

**OC-9 — Nemotron 3.5 Super VL (B).** NVIDIA, Oct 2026; 120B MoE (12B
active), 1M context, open-weight (OpenMDW-1.1), text+image in / text out,
Hugging Face weights. **Artificial Analysis Intelligence Index: 26**
(independent; 4/4 quality, well above the 8 median for open-weight
medium-size models), spanning AA-Briefcase, GDPval-AA, AutomationBench-AA,
Terminal-Bench 4.0, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, AA-Omniscience,
AA-LCR v1.1. Vendor-reported only (not independently re-verified here): GPQA
Diamond 89.52%, SWE-Bench Verified 71.10%. Verbose: 170M output tokens/task
(median 100M). No separate DeepSWE/Terminal-Bench 4.0 pass@1 surfaced.
Source: https://artificialanalysis.ai/models/nemotron-3-5-super-vl

**OC-6 — MiMo-V2.6-Flash (A).** Xiaomi, Sep 2026; 309B MoE (15B active),
1M context, multimodal, MIT weights. **Artificial Analysis Intelligence Index:
38** (independent; median 18 for open-weight large) — 4/4 Intelligence, 1/4 Cost
($0.14/$0.28). benchlm #32/218 overall, #17/146 coding; slower (49 tok/s).
Terminal-Bench 4.0 24.2% → weaker on longest agentic suites. Free tier capped
at 200K context; time-limited.
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash

**OC-8 — Nemotron 3.5 Lightning (B).** NVIDIA, Aug 2026; 31.6B (3.6B
active), 1M context, open-weight (OpenMDW), text-in only. **Artificial Analysis
Intelligence Index: 13** (independent; median 8 for open-weight small) — 4/4
Speed (300 tok/s), 3/4 Verbosity. Fast & cheap ($0.06/$0.20) light/probe worker;
"less convincing as the one model that must do everything." Free tier: daily
quota, 1M context.
Source: https://artificialanalysis.ai/models/nemotron-3-5-lightning

**OC-1 — Beam = Reflection Beam 1.0 (C).** Reflection AI, Oct 16 2026; 501B
MoE (23B active), 1M ctx, text-in, Apache 2.0 weights. **AA Intelligence Index:
30** (independent; #2 US open-weight) — Coding Agent Index 28 (15 pts behind
next setup), AutomationBench-AA 48.5%, CritPt 13.1%, TB 4.0 3.0%, AA-Briefcase
976 Elo, ARC-AGI-2 23.5%. ⚠️ Conflict: vendor card claims 81.6% SWE-bench
Verified / 80.1% TB v2.1 (different suite versions from AA's TB 4.0) — take AA
as primary. Street: X praises license + token thrift + free trials; doubts =
trails smaller Qwen 3.8 27B, needs ~280GB NVFP4 (4×B200) so "open ≠ local";
indie coding board 42.36/80 (rank #46).
Sources: https://artificialanalysis.ai/models/ (Beam page)
https://aicodingdaily.com/model/beam

**OC-2 — Big Pickle (B).** Zen stealth model. No vendor, no card, no AA page — graded
purely on third-party street, so B with guardrails, never S. Indie 5-bench
suite (254 items, same harness): Omniscience **+43** (best of 5 incl. paid
refs), HLE 38%, SciCode 44%, Terminal-Bench 71%, SWE-Mini 65% — best knower,
mid coder. GitHub repro on SWE Atlas Codebase QnA: **50.8%** (63/124), top of
the Mini-SWE-Agent scaffold class, logs published. ⚠️ Single-runner evidence;
no independent re-run yet.
Sources: https://fellipesoares.com.br/en/opencode-stealth-models-benchmarks/
https://github.com/PhillipChaffee/big-pickle-swe-atlas

**OC-10 — MiniMax M3.1 Flash (A).**
Released Oct 19 2026 (served anonymously beforehand as "Space Bunny"; 200T
anon tokens); 1M ctx, text+image in / text out,
proprietary (weights "later"), thinking always-on low→max (default max).
Harness ID: `space-bunny-free`.
**AA Intelligence Index: 43** (independent; 4/4, #4/173 price class, median
13) — 122.8 tok/s, TTFT 1.12s, $0.15/$0.60 ($0.22/task), **verbose 180M
tokens/task** (median 99M). ⚠️ Proxy rule: the AA page measures the served
API model, not the free `space-bunny-free` tier — the 43 is an S-ceiling,
not a free-tier grade. Vendor (tagged): DeepSWE v1.1 **73.7%**, OSWorld V2
**61.7**, ALE **29.6**, BankerToolBench **76.2**, CyberGym **82%** —
⚠️ harness unnamed, not comparable to DeepSeek's 77.0/35.4 (Mini-SWE-V2);
AA primary. Street (light): indie SWE-Mini **75%** (ties best free bug-fix),
Terminal 64%, HLE 28%, Omniscience +29; measured bug-fix 215/215 at both
efforts — default-max 6,673 toks/56s vs low 889 toks/9.5s (set effort
explicitly); "fast, needs explicit instructions; loops on long runs"
(anecdote-grade). Press headline (VB/Vectara: "beats DeepSeek + Opus 5, high
hallucination") unfetchable — headline-only, ungraded. Verdict: **A — competent
globally (Index 43), strongest OpenCode Index alongside GLM 42**; set effort
low/medium, never default-max; first-draft geometry stays C-work;
never the S+ final step.
Sources: https://artificialanalysis.ai/models/minimax-m3-1-flash
https://www.minimax.io/blog/minimax-m31f
https://fellipesoares.com.br/en/opencode-stealth-models-benchmarks/
https://huggingface.co/blog/karmen-beatapi/space-bunny-tested-real-cases-evaluation
Source: https://artificialanalysis.ai/models/minimax-m3-1-flash
(Global re-tier Oct 20, 2026: Index 43 = A band. Vendor DeepSWE 73.7 +
indie SWE-Mini 75% confirm competent, not top — 15 pts below the live
frontier. Verbosity/effort guardrails stand; never the S+ final step.)

**OC-5 — LongCat 2.5 Preview, Meituan (C).** 1.6T MoE (~48B active), 1M
ctx; official repo claims TB 2.1 70.8 / SWE-bench Pro 59.5 (vendor-reported).
Indie board: **46.65/80** (rank #43) — Go 0.9/5 collapse vs Dart/Flutter 4/5,
slowest runs (16:50); verdict "finishes yet lags, small tasks only." Weakest
street of the four: C, Go and deadline agent loops excluded.
Source: https://aicodingdaily.com/model/longcat-2-5-preview

---

## Cline

The Cline free tier gives all five models on the free dropdown (image_b03dd9.png)
with a shared None/Low/Medium/High/Extra thinking-effort control (image_97b6fa.png).
Per-user, you rotate multiple accounts for fresh quotas, so cost is treated as ~free
with account-quota limits (not a daily-reset clock). Grades are harness-fit only
for models actually switchable on Cline.

### Grades (best → worst)

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve | (none yet on Cline) |
| S+ | Reserve | (none — nothing on Cline clears Index 50) |
| S | Top | CL-4: Muse Spark 1.3 Contributor (48.1 proxy) |
| A | Competent | CL-5: MiniMax M3.1 Flash (43); CL-2: MiMo-V2.6-Flash (38) |
| B | Light / probe | CL-3: Nemotron 3.5 Super VL (26); CL-1: Solar Mini 4 (24) |
| C | Weak fit | (none yet on Cline) |
| D | Do not route | (none yet on Cline) |

### Justification by model

**CL-5 — MiniMax M3.1 Flash (A; same evidence as OC-10).** Same model,
same Index 43: competent globally, strongest alongside GLM on OpenCode's
scale. Verbose + effort-burn → set effort explicitly. Inherits the OC-10
verdict: A, never the S+ final step.
Source: same as OC-10.

**CL-3 — Nemotron 3.5 Super VL (B).** NVIDIA, Oct 2026; 120B MoE (12B active), 1M
ctx, open-weight (OpenMDW-1.1), text+image in / text out. **Artificial Analysis
Intelligence Index: 26** (independent; 4/4 quality, well above the 8 median for
open-weight medium-size), spanning all 10 Index evals; vendor-reported GPQA
Diamond 89.52%, SWE-Bench Verified 71.10% (not independently re-verified here).
Same underlying model as OpenCode's OC-9 (grade A there). Free on Cline via the
free dropdown; no stated 200K cap beyond per-account quota.
Source: https://artificialanalysis.ai/models/nemotron-3-5-super-vl
(Global re-tier: Index 26 = B band on both harnesses.)

**CL-2 — MiMo-V2.6-Flash (A).** Xiaomi, Sep 2026; 309B MoE (15B active), 1M ctx,
multimodal, MIT weights. **Artificial Analysis Intelligence Index: 38**
(independent; median 18 for open-weight large) — 4/4 Intelligence; benchlm #32/218
overall, #17/146 coding; slower (49 tok/s), Terminal-Bench 4.0 24.2% (weaker on
longest agentic suites). Same model as OpenCode's OC-6 (grade A there).
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash
(Global re-tier: Index 38 = A floor; TB4 24.2% keeps it competent.)

**CL-1 — Solar Mini 4 (B).** Upstage, Sep 2026; 35B total / 3B active MoE, 1M ctx,
text→text only, proprietary (weights not released), knowledge cutoff Feb 2026.
**Artificial Analysis Intelligence Index: 24** (per the AA article — no dedicated
model page, slug 404s) — Pareto-optimal for <3B active; long-context strength
(AA-LCR 83%, matches GPT-6 Luna). ⚠️ Weaknesses: Terminal-Bench 4.0 1%,
AutomationBench-AA 22%, knowledge accuracy 18% (AA-Omniscience −11). Fast decode
(208 tok/s) but 7.1 min/task (heavy token use). Route only for long-context
text-in reasoning; never research/QA, never agentic coding, never the irreversible
final step.
Source: https://artificialanalysis.ai/articles/korean-ai-lab-upstage-releases-solar-mini-4
(Global re-tier: Index 24 = B band. Long-context text-in strength stands;
never research/QA, never agentic coding.)

**CL-4 — Muse Spark 1.3 Contributor (S — top free model on Cline).** Meta (MSL),
1.3 released 2 Sep 2026; multimodal reasoning, text+image+video (+audio/PDF) in /
text out, 1M ctx. ⚠️ The only benchmark numbers are for the **regular Muse Spark
1.3 (Standard/"Max" tier, $1.25/$4.25)**; the Contributor tier itself has no own
benches (OpenRouter lists "Not available"), so per your direction we use the
regular-version numbers as the capability proxy: **Artificial Analysis
Intelligence Index 48.1**, Coding Index 75.8, Agentic Index 55.5 — an S-class
ceiling (48.1 > DeepSeek Flash's 39 on the Intelligence Index; Coding 75.8 is
frontier-tier agentic coding; Agentic 55.5 strong). Free Contributor caveats:
it is ≈92–95% cheaper ($0.10/$0.20), prompts/completions **may train Meta
models**, and—per TrueFoundry—**max reasoning is Standard-only**, so the free
tier is capped to low/medium reasoning and will run below the cited indices in
practice. → Grade **S** (48.1 = S band 45–49 globally; top of your inventory,
10 pts below the live frontier 58): probe-verify before routing real S-grade
work; never the
irreversible final step without an S+ cross-check. Re-grade once
Contributor-specific benches publish.

> 📌 **Related, not on the Cline free dropdown:** Muse Spark **Open** (Meta,
> 15 Oct 2026) is a coding-optimized **open-weights** MoE (816B-A42B, Apache-2.0
> via Hugging Face), Standard tier $1.25/$4.25 on OpenRouter, 1M ctx, tool-calling.
> Paid and absent from the Cline free dropdown → not a CL entry. It is the
> S-class Muse candidate **if** you add a paid/non-free Muse tier to a harness.
Sources: https://artificialanalysis.ai/models/muse-spark-1-3 (Standard/"Max" —
         these regular-tier indices are the CL-4 proxy)
         https://openrouter.ai/compare/meta/muse-spark-1-3/meta/muse-spark-1-3-contributor
         (regular-version numbers 48.1 / 75.8 / 55.5; free tiers "Not available")
         https://www.truefoundry.com/blog/muse-spark-1-3 (Standard vs Contributor;
         max reasoning is Standard-only; uncitable image scorecard)

---

## Freebuff

Freebuff is **time-billed, not token-billed** (see models.md hours): a daily hour
pool (refill 12:00 AM Asia/Jerusalem) funded by the $8/mo Starter (21h/day,
observed 19/21) + 60h wallet/mo that replaces unused bonus. Higher models burn the
pool faster; route the smallest time-slice that clears the grade. No S+ anywhere.

### Grades (best → worst)

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve | FB-10: Gemini 4 Argon (53 — live frontier cluster) |
| S | Top | FB-6: Muse Spark 1.3 (48.1); FB-12: DeepSeek V4.1 Flash 1017 (45 ceiling, probe-first) |
| A | Competent | FB-9: Claude Haiku 5.5 (43, 100k-context variant); FB-11: MiniMax M3.1 Flash (43); FB-7: GLM 5.3 Flash (42); FB-4 / FB-5: DeepSeek V4.1 Flash (39); FB-1 / FB-2 / FB-3: MiMo 2.6 Flash (38); FB-8: GPT-6 Luna (38) |
| B | Light / probe | (none on Freebuff — A-models cover it: FB-11 free, FB-1 1h) |
| C | Weak fit | (none on Freebuff) |
| D | Do not route | (none yet on Freebuff) |

### Justification by model

**FB-10 — Gemini 4 Argon (S+).** Google, 30 Sep 2026; proprietary, reasoning,
text+image→text, 1M ctx. **Artificial Analysis Intelligence Index: 53** (independent;
highest in the cohort, 4/4 Intelligence) — TB4 57%, #1 AutomationBench-AA 78%
(7 pts over Claude Sonnet 5.5), AA-Briefcase 1494 Elo, lowest hallucination (15%)
among models scoring 45+. Verbose (110M tokens/task). ⚠️ Freebuff: **20h/session
+ Promotional · 1 session/day** and $2.00/$10.00 per token — not routine; use the
single daily slot only for high-value S+ work. **Your only reserve-grade model:
Index 53, live frontier cluster (Opus 5.5 max 58, Astra max 53).**
Source: https://artificialanalysis.ai/models/gemini-4-argon
(Global re-tier: 53 = S+ band 50+. The "no S+ on Freebuff" flag is retired.)

**FB-6 — Muse Spark 1.3 (S).** Meta (MSL), 2 Sep 2026; multimodal reasoning
(text+image+video+audio/PDF→text), 1M ctx, Standard/"Max" tier. **AA Intelligence
Index 48.1 / Coding Index 75.8 / Agentic Index 55.5** — S-class ceiling, the
cohort's strongest coding. ⚠️ Freebuff: **3h/session** — best S-value here; this is
the Standard tier (no free-tier cap, unlike Cline's CL-4 Contributor).
(Global re-tier: 48.1 = S band 45–49. Strong coding, but 10 pts below the live
frontier — top, not reserve.)
Sources: https://artificialanalysis.ai/models/muse-spark-1-3
         https://openrouter.ai/compare/meta/muse-spark-1-3/meta/muse-spark-1-3-contributor

**FB-9 — Claude Haiku 5.5 (S).** Anthropic, 7 Oct 2026; reasoning,
text+image→text, 1M ctx (per AA) — Freebuff exposes the 100k-context variant.
**AA Intelligence Index: 43** (independent; 4/4 Intelligence); TB4 33%, AA-Briefcase
1578 Elo (within CI of GPT-6 Astra max / Claude Fable 5.1 high). ⚠️ Freebuff:
**6h/session**; **very verbose (440M tokens/task) → burns hours fast**; S-ceiling,
probe first. (A 15h "Claude Haiku 5.5" row was also observed — variant unreconciled.)
(Global re-tier: 43 = A band globally. Kept at S-ceiling per verbosity + probe-first
practice on this harness — revisit if verbosity drops.)
Source: https://artificialanalysis.ai/models/claude-haiku-5-5

**FB-4 / FB-5 — DeepSeek V4.1 Flash (Fast) (A).** DeepSeek, 10 Sep 2026; 552B MoE
(8B/16B), 1M ctx, multimodal, MIT. **AA Intelligence Index: 39** (independent) —
DeepSWE 74.2 (beats GPT-5.6 Sol 73.0), AutomationBench 54.8, Agent's Last Exam 31.8
vs 26.7, CyberGym 88.1 vs 84.5; 4/4 Intelligence, 4/4 Speed (176 tok/s). Freebuff's
**recommended default (3h)**; Fast variant 5h. Full 1M context here (unlike OpenCode's
200K free cap). (Global re-tier: 39 = A band. Recommended default stands —
best A-value, not S.)
Source: https://artificialanalysis.ai/models/deepseek-v4-1-flash

**FB-12 — DeepSeek V4.1 Flash 1017 (S-ceiling; probe-first).** DeepSeek, 17 Oct
2026 refresh of V4.1 Flash (`deepseek-flash` now routes to 1017; MIT, 552B MoE,
8B/16B, 1M ctx, text+image→text). **AA Intelligence Index: 45, Max tier
(v4.3.2, read Oct 20, 2026)** — ceiling proxy: Freebuff serving tier
unconfirmed vs benchmarked Max, so the 45 is a ceiling, not a floor. Vendor
changelog (DeepSeek API docs + QZ/Bloomberg re-report, independent
reproduction absent): DeepSWE v1.1 74.2→**77.0**, Terminal-Bench 4.0
31.2→**42.3** (Claude Code harness per QZ), HLE no-tools 36.8→**42.6**,
ProgramBench 20.3→**29.1**; shorter outputs, ~$0.20/task API-side, 209 tok/s,
but still verbose (AA: 210M tokens/task vs 140M median). Meyer's street check
(Oct 18, 2026) agrees directionally but flags: all numbers vendor-sourced,
rivals compared a generation old, still trails Claude Opus 5 on hardest
reasoning/vision. Grade: **S-band ceiling (45 = S floor 45–49) but S-ceiling
probe-first** — same treatment as FB-9: free-tier/unconfirmed-tier output runs
below the cited Max index; verify with a probe before S-grade work; never the
irreversible final step (S+ stays FB-10). Freebuff cost: **5h/session**
(operator-confirmed Oct 20, 2026) — same burn as FB-5 Fast; pricier than the
FB-4 base (3h), so prefer FB-12 only where the 1017 gains matter (agentic
coding depth), else FB-4 for routine A-work. Distinct entry from FB-4/FB-5 base (AA 39): routes preferring 1017
should name FB-12 explicitly.
Sources: https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017
         https://api-docs.deepseek.com/news/news261017/ (vendor changelog)
         https://qz.com/deepseek-v4-1-flash-1017-model-update-benchmarks-101926
         https://thorstenmeyerai.com/reality-check/deepseek-v4-1-flash-1017-agents-price-benchmarks/ (street, vendor-numbers caveat)

**FB-11 — MiniMax M3.1 Flash (A; same evidence as OC-10).** Same model,
same Index 43: competent globally. Free on Freebuff
(no hour burn — cheapest Freebuff worker alongside FB-1 MiMo 1h). Inherits the
OC-10 verdict: A, never the S+ final step.
Source: same as OC-10.

**FB-8 — GPT-6 Luna (A).** OpenAI, 22 Sep 2026; reasoning, text+image→text, 1M ctx,
proprietary. **AA Intelligence Index: 38** (independent; median 13) — outranks
GPT-5.6; GDPval-AA, Vals Finance Agent V2 #2/78, HLE-Verified. ⚠️ Weaknesses:
Terminal-Bench 4.0 13% (weak agentic coding), slow (TTFT ~113s, 140M tokens/task),
verbose. Freebuff: 4h. Use for knowledge/multimodal reasoning, not agentic coding.
Source: https://artificialanalysis.ai/models/gpt-6-luna

**FB-7 — GLM 5.3 Flash (A).** Z.ai, Aug 2026; 320B (18B active), 1M ctx, multimodal,
MIT. **AA Intelligence Index: 42** (independent; 4/4 Intelligence, 3/4 Cost); one
tester found DeepSeek stronger on agentic coding. Freebuff: 4h.
(Global re-tier: 42 = A band.)
Source: https://artificialanalysis.ai/models/glm-5-3-flash

**FB-1 / FB-2 / FB-3 — MiMo 2.6 Flash / Flash Fast / Pro (A).** Xiaomi, Sep 2026; 309B
MoE (15B active), 1M ctx, multimodal, MIT. **AA Intelligence Index: 38** (independent;
4/4 Intelligence); benchlm #32/218 overall, #17/146 coding; slower (49 tok/s);
Terminal-Bench 4.0 24.2% (weaker on longest agentic suites). Freebuff variants: base
1h, Fast 2h, Pro 5h — same AA-38 backbone. **Cheapest capable Freebuff worker (1h).**
(Global re-tier: 38 = A floor.)
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash

## Task-class matrix (which grade each kind of work demands)

Required grade is a property of the work class (harness-independent); the
Harness + Earned-by columns pin it to the model actually on that harness.

| Task class | Required grade | Harness | Earned by | Notes / risk |
|---|---|---|---|---|
| Planning / strategy | S | Antigravity | — | No S on Antigravity (M1 is A globally) — plan here only if cross-checked, else Freebuff FB-6 / FB-12 (probe-first) / Cline CL-4. |
| Long-horizon agentic coding (build) | S | Antigravity | — | No S builder on Antigravity — M1 (A) supervised only; real S builds go to Freebuff FB-6. |
| Multi-step review / audit (judgment) | S | Antigravity | — | No S reviewer on Antigravity — escalate. |
| Well-scoped code edits (tests decide) | A | Antigravity | M1 | M1's home turf (TB 2.1 90.8%). |
| Mechanical execution / babysitting | B | Antigravity | — | M1 is overkill & quota-costly; don't route here. |
| Research / extraction (no hard guarantees) | S | Antigravity | — | No S researcher on Antigravity — M1 (A) for light extraction only. |
| Final irreversible verification | S+ | Antigravity | — | No S+ on Antigravity — price the risk; cross-check with Freebuff FB-10. |
| Planning / strategy | S | OpenCode | — | No S on OpenCode — best available is A (OC-10 MiniMax 43 / OC-4 GLM 42); plan here only if cross-checked, else route to Cline CL-4 / Freebuff FB-6. |
| Long-horizon agentic coding (build) | S | OpenCode | — | No S builder on OpenCode — OC-10/OC-4 (A) supervised only; real S builds go to Freebuff FB-6 / Cline CL-4. |
| Multi-step review / audit (judgment) | S | OpenCode | — | No S reviewer on OpenCode — escalate to S harnesses. |
| Well-scoped code edits (tests decide) | A | OpenCode | OC-10 / OC-4 / OC-3 / OC-6 | MiniMax 43 / GLM 42 lead; DeepSeek 39 / MiMo 38 follow. |
| Mechanical execution / babysitting | B | OpenCode | OC-9 / OC-1 (OC-2 alt.) | Super VL 26 / Beam 30; OC-2 Big Pickle for knowledge-flavored (no page, indie B-band). |
| Research / extraction (no hard guarantees) | S | OpenCode | — | No S researcher on OpenCode — OC-2 Big Pickle (Omniscience +43) for low-stakes only; real S research elsewhere. |
| Final irreversible verification | S+ | OpenCode | — | No S+ on OpenCode — price the risk; cross-check with Freebuff FB-10. |
| Planning / strategy | S | Cline | CL-4 | Muse Contributor (48.1 proxy); reasoning-capped → probe before high-stakes. |
| Long-horizon agentic coding (build) | S | Cline | CL-4 | Strongest free agentic coder (Coding 75.8); reasoning-capped → probe first. |
| Multi-step review / audit (judgment) | S | Cline | CL-4 | Muse (Agentic 55.5, Intel 48.1); free/reasoning-capped → human-check final review. |
| Well-scoped code edits (tests decide) | A | Cline | CL-5 / CL-2 | MiniMax 43 / MiMo 38; CL-4 (S) available if needed. |
| Mechanical execution / babysitting | B | Cline | CL-3 / CL-1 | Super VL 26 / Solar 24 (text-only; 18% knowledge — not QA). |
| Final irreversible verification | S+ | Cline | — | No S+ on Cline — price the risk; cross-check with Freebuff FB-10. |
| Planning / strategy | S | Freebuff | FB-6 | Muse 3h — best S-value; FB-12 1017 (5h, probe-first) alt. |
| Long-horizon agentic coding (build) | S | Freebuff | FB-6 | Muse (Coding 75.8) leads S builds; FB-12 DeepSeek-1017 (5h; DeepSWE 77.0 vendor, TB4 42.3; probe-first) supervised alt; FB-4 base DeepSeek (A, 3h) fallback. |
| Multi-step review / audit (judgment) | S | Freebuff | FB-6 | Muse; FB-9 Haiku S-ceiling alt (verbose 6h). |
| Well-scoped code edits (tests decide) | A | Freebuff | FB-11 / FB-7 / FB-4 / FB-1 | MiniMax free (no burn) leads; GLM 4h / DeepSeek base 3h / MiMo 1h alts. FB-12 (5h) only if 1017 depth needed. |
| Mechanical execution / babysitting | B | Freebuff | — | No B-grade needed — A-models cover it (FB-11 free, FB-1 1h). |
| Research / extraction (no hard guarantees) | S | Freebuff | FB-6 | Muse S; avoid GPT-6 Luna (13% agentic, slow). |
| Final irreversible verification | S+ | Freebuff | FB-10 | Argon 53 — your only reserve-grade model; 1 session/day, high-value only. |

---

## Risk flags

- **No S+ on Antigravity or OpenCode:** no model clears Index 50 there. Flag every such decision.
- **Quota gating:** M1 is subscription-quota bound (5h + weekly). Route worthy tasks first; defer low-worth work. Watch the weekly reset window.
- **Terminal-Bench 4.0 weak:** M1's 19.1% keeps it A globally — avoid routing the hardest long-horizon agent suites as if it were frontier-class.
- **S+ now exists (global re-tier Oct 20, 2026):** FB-10 Gemini 4 Argon 53 =
  live frontier cluster (top 58). Retires all "no S+ on Freebuff" flags —
  FB-10 is the reserve-grade closeout path (1 session/day).
- **OpenCode/Cline have no S or S+:** best available is A (MiniMax 43, GLM 42)
  / S-proxy (Muse 48.1). S-work routes to Freebuff/Cline-CL-4; S+ closeouts to
  FB-10. Task matrix reflects the gaps honestly.
- **Nemotron 3 Ultra is C on the GA page (23):** the 47.7 partner figure would
  be S if the public index converges — until then, guardrailed only.
- **Super VL is B (26) on both harnesses:** vendor GPQA/SWE numbers cannot lift
  it above the yardstick without independent re-verification.
- **OC-10 / CL-5 / FB-11 MiniMax M3.1 Flash (A):** Index 43 = A band globally
  (15 pts below frontier 58); vendor DeepSWE 73.7 harness-unnamed (AA primary);
  indie SWE-Mini 75%; verbose 180M/task + default-max burn → set effort
  low/medium explicitly; geometry first-drafts C-work; HHEM unmeasured → no
  summarization/RAG routing until scored; never S+ final step.
- **OpenCode free context caps:** DeepSeek V4.1 Flash Free and GLM-5.3-Flash Free are capped at 200K context (paid = 1M); verify the cap serves the task before routing.
- **Nemotron 3 Ultra score conflict:** GA model page AA 23 vs pre-release partner 47.7 — grade C on the GA page; flag before routing worth work.
- **Cline free tiers are account-quota-limited** (rotate accounts for fresh quotas); watch per-account limits before a long run, not a daily-reset clock.
- **CL-1 Solar Mini 4 (B, text-only):** 1% agentic coding + 18% knowledge accuracy → long-context text-in reasoning only; never research/QA, never coding.
- **CL-4 Muse Spark 1.3 Contributor (S, but free-tier caveats):** grade S uses the regular-tier AA indices as the proxy (Intelligence 48.1 / Coding 75.8 / Agentic 55.5) because the free Contributor tier has no own benches; the free tier is capped to low/medium reasoning (max reasoning is Standard-only) and trades data for price, so real free-tier output runs below the cited indices — probe-verify before S-grade work; never the irreversible final step.
- **No S+ (and no S with verified free-tier benches) on Cline:** CL-4 Muse Contributor is graded S on regular-tier indices (ceiling), but the irreversible final step stays S+ only; cross-check S-grade closeouts with Freebuff FB-10.
- **Freebuff is time-billed, not token-billed:** 21h/day (Starter $8/mo) + 60h wallet/mo (replaces unused); refill 12:00 AM Asia/Jerusalem. Higher models burn the pool faster — route the smallest time-slice that clears the grade.
- **FB-9 Claude Haiku 5.5 (S, 6h):** 100k-context variant; very verbose (440M tokens/task) → hours burn fast; treat as S-ceiling, probe first. (A 15h "Claude Haiku 5.5" row was also observed — if confirmed as the regular-context variant, add as a separate row, ctx in notes.)
- **FB-12 DeepSeek V4.1 Flash 1017 (S-ceiling, 5h, probe-first):** AA 45 is the
  Max-tier ceiling; Freebuff serving tier unconfirmed, all deltas
  vendor-sourced/unreproduced — probe before S work; never the
  irreversible final step. Same burn as FB-5 Fast; prefer FB-4 base (3h) for
  routine A-work.
- **FB-10 Gemini 4 Argon (S+, 20h):** Promotional · **1 session/day** only —
  reserve-grade closeout path; use the single daily slot for high-value S+ work.
- **FB-4/5 DeepSeek V4.1 Flash (A, 3h/5h):** Freebuff's best A-value (recommended default); 1M ctx (no 200K cap here).
- **FB-8 GPT-6 Luna (A, 4h):** weak agentic coding (TB4 13%) + slow (TTFT ~113s, 140M tok/task) → knowledge/multimodal reasoning only, not coding.
- **No S+ on Freebuff:** no irreversible-final-step candidate; cross-check S closeouts with Antigravity (M1).
