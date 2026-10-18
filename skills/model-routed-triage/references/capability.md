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
> a metric, and tagged as vendor-reported. For free-tier variants that have **no
> AA model page / no own benches** (e.g. Muse Spark 1.3 Contributor, Solar Mini 4 —
> AA/OpenRouter list the free tier as "Not available"), cite the AA article or the
> OpenRouter compare page and use the **regular / Standard-tier** numbers as the
> capability proxy, flagging free-tier caps (e.g. max-reasoning is Standard-only,
> data-train trade, context/time limits).
>
> A model listed in `models.md` but absent from a harness's grade table is
> `[unverified]` there — do not route it for an irreversible final step.

---

## Antigravity

### Grades (best → worst)

School-style: **S+** (reserve) > **S** (top) > **A** > **B** > **C** > **D**.

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve: irreversible / money-adjacent / subtle-invariant work needing the strongest available | (none yet on Antigravity) |
| S | Top: long-horizon agentic coding, multi-step reasoning, review/audit needing judgment | **M1: Gemini 3.8 Flash** |
| A | Competent: well-scoped edits, mechanical execution under tests, straightforward research | (none yet on Antigravity) |
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
- **Verdict:** earns **S**. Quota-gated (5h + weekly), so for the *final,
  irreversible* step of a big job it is graded **high-risk** — route the final
  verification/review to an S+ model/human rather than burning the reserve on a
  non-worthy closeout.

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

## Codex

> *(add your Codex models here — same grade-table shape as Antigravity)*

### Grades (best → worst)

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve | (none yet on Codex) |
| S | Top | (none yet on Codex) |
| A | Competent | (none yet on Codex) |
| B | Light / probe | (none yet on Codex) |
| C | Weak fit | (none yet on Codex) |
| D | Do not route | (none yet on Codex) |

---

## OpenCode

### Grades (best → worst)

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve | (none yet on OpenCode) |
| S | Top | OC-3: DeepSeek V4.1 Flash Free |
| A | Competent | OC-4: GLM-5.3-Flash Free; OC-6: MiMo-V2.6-Flash Free; OC-7: Nemotron 3 Ultra Free; OC-9: Nemotron 3.5 Super VL Free |
| B | Light / probe | OC-8: Nemotron 3.5 Lightning Free |
| C | Weak fit | (none yet on OpenCode) |
| D | Do not route | OC-1 Beam Free; OC-2 Big Pickle; OC-5 LongCat 2.5 Preview Free; OC-10 Space Bunny Free — all unverified, no public benchmarks |

### Justification by model

**OC-3 — DeepSeek V4.1 Flash Free (S).** Released 2026-09-10; 552B MoE (8B
active prefill / 16B decode), 1M context, multimodal, MIT weights.
**Artificial Analysis Intelligence Index: 39** (independent; median 19 for
open-weight large) — 4/4 Intelligence, 4/4 Speed (176 tok/s). Beats GPT-5.6
Sol and Claude Opus-5.0 on DeepSWE v1.1 (74.2 vs 73.0), AutomationBench
(54.8 vs 45.8), Agent's Last Exam (31.8 vs 26.7), CyberGym (88.1 vs 84.5)
(vendor model card, as cited by Flowtivity). Free tier capped at 200K context
(paid = 1M) and time-limited.
Source: https://artificialanalysis.ai/models/deepseek-v4-1-flash

**OC-4 — GLM-5.3-Flash Free (A).** Z.ai, Aug 2026; 320B params (18B active), 1M
context, multimodal, MIT weights. **Artificial Analysis Intelligence Index: 42**
(independent; highest among these OpenCode models, median 19 for open-weight
large) — 4/4 Intelligence, 3/4 Cost ($0.15/$0.50). Free tier capped at 200K
context (paid = 1M) and time-limited; one tester found DeepSeek V4.1 Flash
stronger on agentic coding.
Source: https://artificialanalysis.ai/models/glm-5-3-flash

**OC-7 — Nemotron 3 Ultra Free (A).** NVIDIA, Jun 2026; 550B params, 1M
context, open-weight (OpenMDW) — largest/hardest-reasoning Nemotron.
**Artificial Analysis Intelligence Index: 23** on the GA model page (independent;
median 18), 190 tok/s. ⚠️ Conflict: NVIDIA's pre-release partner launch article
reports **47.7** (NVFP4) / 48.2 (BF16), ahead of Gemma 4 31B (39.2) and behind
Kimi K2.6 (53.9). Treat the 47.7 figure as pre-GA/partner-eval until the public
index matches; flag before routing worth work. Free tier = 1M context; no
verified DeepSWE/Terminal-Bench 4.0 pass@1 vs DeepSeek.
Source: https://artificialanalysis.ai/models/nvidia-nemotron-3-ultra-550b-a55b

**OC-9 — Nemotron 3.5 Super VL Free (A).** NVIDIA, Oct 2026; 120B MoE (12B
active), 1M context, open-weight (OpenMDW-1.1), text+image in / text out,
Hugging Face weights. **Artificial Analysis Intelligence Index: 26**
(independent; 4/4 quality, well above the 8 median for open-weight
medium-size models), spanning AA-Briefcase, GDPval-AA, AutomationBench-AA,
Terminal-Bench 4.0, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, AA-Omniscience,
AA-LCR v1.1. Vendor-reported only (not independently re-verified here): GPQA
Diamond 89.52%, SWE-Bench Verified 71.10%. Verbose: 170M output tokens/task
(median 100M). No separate DeepSWE/Terminal-Bench 4.0 pass@1 surfaced.
Source: https://artificialanalysis.ai/models/nemotron-3-5-super-vl

**OC-6 — MiMo-V2.6-Flash Free (A).** Xiaomi, Sep 2026; 309B MoE (15B active),
1M context, multimodal, MIT weights. **Artificial Analysis Intelligence Index:
38** (independent; median 18 for open-weight large) — 4/4 Intelligence, 1/4 Cost
($0.14/$0.28). benchlm #32/218 overall, #17/146 coding; slower (49 tok/s).
Terminal-Bench 4.0 24.2% → weaker on longest agentic suites. Free tier capped
at 200K context; time-limited.
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash

**OC-8 — Nemotron 3.5 Lightning Free (B).** NVIDIA, Aug 2026; 31.6B (3.6B
active), 1M context, open-weight (OpenMDW), text-in only. **Artificial Analysis
Intelligence Index: 13** (independent; median 8 for open-weight small) — 4/4
Speed (300 tok/s), 3/4 Verbosity. Fast & cheap ($0.06/$0.20) light/probe worker;
"less convincing as the one model that must do everything." Free tier: daily
quota, 1M context.
Source: https://artificialanalysis.ai/models/nemotron-3-5-lightning

**OC-1 / OC-2 / OC-5 / OC-10 — Beam Free, Big Pickle, LongCat 2.5 Preview Free,
Space Bunny Free (D, unverified).** Stealth / limited-time free tiers with no
model cards and no public benchmarks. No evidence to grade above D — price the
risk; treat as probe-only, never the final step of an irreversible task.

---

## Cline

The Cline free tier gives all four models on the free dropdown (image_b03dd9.png)
with a shared None/Low/Medium/High/Extra thinking-effort control (image_97b6fa.png).
Per-user, you rotate multiple accounts for fresh quotas, so cost is treated as ~free
with account-quota limits (not a daily-reset clock). Grades are harness-fit only
for models actually switchable on Cline.

### Grades (best → worst)

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve | (none yet on Cline) |
| S | Top | CL-4: Muse Spark 1.3 Contributor |
| A | Competent | CL-2: MiMo-V2.6-Flash; CL-3: Nemotron 3.5 Super VL |
| B | Light / probe | CL-1: Solar Mini 4 |
| C | Weak fit | (none yet on Cline) |
| D | Do not route | (none yet on Cline) |

### Justification by model

**CL-3 — Nemotron 3.5 Super VL (A).** NVIDIA, Oct 2026; 120B MoE (12B active), 1M
ctx, open-weight (OpenMDW-1.1), text+image in / text out. **Artificial Analysis
Intelligence Index: 26** (independent; 4/4 quality, well above the 8 median for
open-weight medium-size), spanning all 10 Index evals; vendor-reported GPQA
Diamond 89.52%, SWE-Bench Verified 71.10% (not independently re-verified here).
Same underlying model as OpenCode's OC-9 (grade A there). Free on Cline via the
free dropdown; no stated 200K cap beyond per-account quota.
Source: https://artificialanalysis.ai/models/nemotron-3-5-super-vl

**CL-2 — MiMo-V2.6-Flash (A).** Xiaomi, Sep 2026; 309B MoE (15B active), 1M ctx,
multimodal, MIT weights. **Artificial Analysis Intelligence Index: 38**
(independent; median 18 for open-weight large) — 4/4 Intelligence; benchlm #32/218
overall, #17/146 coding; slower (49 tok/s), Terminal-Bench 4.0 24.2% (weaker on
longest agentic suites). Same model as OpenCode's OC-6 (grade A there).
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash

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
practice. → Grade **S** (capability ceiling), but free-tier/reasoning-cap means
treat as S-ceiling: probe-verify before routing real S-grade work; never the
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
| S+ | Reserve | (none yet on Freebuff) |
| S | Top | FB-10: Gemini 4 Argon; FB-6: Muse Spark 1.3; FB-9: Claude Haiku 5.5; FB-4 / FB-5: DeepSeek V4.1 Flash |
| A | Competent | FB-8: GPT-6 Luna; FB-7: GLM 5.3 Flash; FB-1 / FB-2 / FB-3: MiMo 2.6 Flash |
| B | Light / probe | (none yet on Freebuff) |
| C | Weak fit | (none yet on Freebuff) |
| D | Do not route | (none yet on Freebuff) |

### Justification by model

**FB-10 — Gemini 4 Argon (S).** Google, 30 Sep 2026; proprietary, reasoning,
text+image→text, 1M ctx. **Artificial Analysis Intelligence Index: 53** (independent;
highest in the cohort, 4/4 Intelligence) — TB4 57%, #1 AutomationBench-AA 78%
(7 pts over Claude Sonnet 5.5), AA-Briefcase 1494 Elo, lowest hallucination (15%)
among models scoring 45+. Verbose (110M tokens/task). ⚠️ Freebuff: **20h/session
+ Promotional · 1 session/day** and $2.00/$10.00 per token — not routine; use the
single daily slot only for high-value S work.
Source: https://artificialanalysis.ai/models/gemini-4-argon

**FB-6 — Muse Spark 1.3 (S).** Meta (MSL), 2 Sep 2026; multimodal reasoning
(text+image+video+audio/PDF→text), 1M ctx, Standard/"Max" tier. **AA Intelligence
Index 48.1 / Coding Index 75.8 / Agentic Index 55.5** — S-class ceiling, the
cohort's strongest coding. ⚠️ Freebuff: **3h/session** — best S-value here; this is
the Standard tier (no free-tier cap, unlike Cline's CL-4 Contributor).
Sources: https://artificialanalysis.ai/models/muse-spark-1-3
         https://openrouter.ai/compare/meta/muse-spark-1-3/meta/muse-spark-1-3-contributor

**FB-9 — Claude Haiku 5.5 · 100k ctx (S).** Anthropic, 7 Oct 2026; reasoning,
text+image→text, 1M ctx (per AA) — Freebuff exposes the **100k-context** variant.
**AA Intelligence Index: 43** (independent; 4/4 Intelligence); TB4 33%, AA-Briefcase
1578 Elo (within CI of GPT-6 Astra max / Claude Fable 5.1 high). ⚠️ Freebuff:
**6h/session**; **very verbose (440M tokens/task) → burns hours fast**; S-ceiling,
probe first. (A 15h "Claude Haiku 5.5" row was also observed — variant unreconciled.)
Source: https://artificialanalysis.ai/models/claude-haiku-5-5

**FB-4 / FB-5 — DeepSeek V4.1 Flash (Fast) (S).** DeepSeek, 10 Sep 2026; 552B MoE
(8B/16B), 1M ctx, multimodal, MIT. **AA Intelligence Index: 39** (independent) —
DeepSWE 74.2 (beats GPT-5.6 Sol 73.0), AutomationBench 54.8, Agent's Last Exam 31.8
vs 26.7, CyberGym 88.1 vs 84.5; 4/4 Intelligence, 4/4 Speed (176 tok/s). Freebuff's
**recommended default (3h)**; Fast variant 5h. Full 1M context here (unlike OpenCode's
200K free cap).
Source: https://artificialanalysis.ai/models/deepseek-v4-1-flash

**FB-8 — GPT-6 Luna (A).** OpenAI, 22 Sep 2026; reasoning, text+image→text, 1M ctx,
proprietary. **AA Intelligence Index: 38** (independent; median 13) — outranks
GPT-5.6; GDPval-AA, Vals Finance Agent V2 #2/78, HLE-Verified. ⚠️ Weaknesses:
Terminal-Bench 4.0 13% (weak agentic coding), slow (TTFT ~113s, 140M tokens/task),
verbose. Freebuff: 4h. Use for knowledge/multimodal reasoning, not agentic coding.
Source: https://artificialanalysis.ai/models/gpt-6-luna

**FB-7 — GLM 5.3 Flash (A).** Z.ai, Aug 2026; 320B (18B active), 1M ctx, multimodal,
MIT. **AA Intelligence Index: 42** (independent; 4/4 Intelligence, 3/4 Cost); one
tester found DeepSeek stronger on agentic coding. Freebuff: 4h.
Source: https://artificialanalysis.ai/models/glm-5-3-flash

**FB-1 / FB-2 / FB-3 — MiMo 2.6 Flash / Flash Fast / Pro (A).** Xiaomi, Sep 2026; 309B
MoE (15B active), 1M ctx, multimodal, MIT. **AA Intelligence Index: 38** (independent;
4/4 Intelligence); benchlm #32/218 overall, #17/146 coding; slower (49 tok/s);
Terminal-Bench 4.0 24.2% (weaker on longest agentic suites). Freebuff variants: base
1h, Fast 2h, Pro 5h — same AA-38 backbone. **Cheapest capable Freebuff worker (1h).**
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash

## Task-class matrix (which grade each kind of work demands)

Required grade is a property of the work class (harness-independent); the
Harness + Earned-by columns pin it to the model actually on that harness.

| Task class | Required grade | Harness | Earned by | Notes / risk |
|---|---|---|---|---|
| Planning / strategy | S | Antigravity | M1 | Reasoning-heavy; 90.8% Terminal-Bench + HLE justify. |
| Long-horizon agentic coding (build) | S | Antigravity | M1 | DeepSWE win + Terminal-Bench 2.1 = strongest fit here. |
| Multi-step review / audit (judgment) | S | Antigravity | M1 | Outperforms frontier on reasoning/agentic tasks. |
| Well-scoped code edits (tests decide) | A | Antigravity | — | No A on Antigravity yet; M1 is the ceiling. |
| Mechanical execution / babysitting | B | Antigravity | — | M1 is overkill & quota-costly; don't route here. |
| Research / extraction (no hard guarantees) | S | Antigravity | M1 | Reasoning + knowledge strength useful; keep quota in mind. |
| Final irreversible verification | S+ | Antigravity | — | No S+ anywhere yet — price the risk; human or cross-check. |
| Planning / strategy | S | OpenCode | OC-3 | DeepSWE win; free tier 200K ctx, time-limited. |
| Long-horizon agentic coding (build) | S | OpenCode | OC-3 | Best free agentic coding bench here (DeepSWE 74.2). |
| Multi-step review / audit (judgment) | S | OpenCode | OC-3 | Strongest free reasoning/agentic evidence. |
| Well-scoped code edits (tests decide) | A | OpenCode | OC-4 / OC-6 / OC-7 / OC-9 | GLM / MiMo / Ultra / Super VL; DeepSeek (S) is the stronger ceiling. |
| Mechanical execution / babysitting | B | OpenCode | OC-8 | Lightning — fast, cheap, light/probe only. |
| Research / extraction (no hard guarantees) | S | OpenCode | OC-3 | Strongest general-reasoning free model. |
| Final irreversible verification | S+ | OpenCode | — | No S+ on OpenCode yet — price the risk; cross-check. |
| Planning / strategy | S | Cline | CL-4 | Muse Contributor (AA Intel 48.1); free-tier reasoning-capped → probe before high-stakes. |
| Long-horizon agentic coding (build) | S | Cline | CL-4 | Strongest free agentic coder (Coding 75.8); reasoning-capped → probe first. |
| Multi-step review / audit (judgment) | S | Cline | CL-4 | Muse (Agentic 55.5, Intel 48.1); free/reasoning-capped → human-check final review. |
| Well-scoped code edits (tests decide) | A | Cline | CL-2 / CL-3 | MiMo (AA 38) / Super VL (AA 26); prefer Super VL; CL-4 (S) available if needed. |
| Mechanical execution / babysitting | B | Cline | CL-1 | Solar (AA 24): long-context text only; 18% knowledge — not for QA. |
| Research / extraction (no hard guarantees) | S | Cline | CL-4 | Muse (Intel 48.1); avoid Solar (18% knowledge); probe before relying. |
| Final irreversible verification | S+ | Cline | — | No S+ on Cline — price the risk; cross-check with Antigravity. |
| Planning / strategy | S | Freebuff | FB-4 / FB-6 | DeepSeek 3h (recommended) or Muse 3h — best S-value. |
| Long-horizon agentic coding (build) | S | Freebuff | FB-4 / FB-5 | DeepSeek V4.1 Flash (DeepSWE 74.2); Fast 5h. |
| Multi-step review / audit (judgment) | S | Freebuff | FB-6 / FB-9 | Muse (Coding 75.8) or Claude 43; Claude very verbose (6h). |
| Well-scoped code edits (tests decide) | A | Freebuff | FB-1 | MiMo 1h — cheapest capable; overkill at A but lowest hours burn. |
| Mechanical execution / babysitting | B | Freebuff | — | No B-grade Freebuff model; cheapest capable = FB-1 MiMo (1h). |
| Research / extraction (no hard guarantees) | S | Freebuff | FB-4 / FB-6 | DeepSeek/Muse S; avoid GPT-6 Luna (13% agentic, slow). |
| Final irreversible verification | S+ | Freebuff | — | No S+ on Freebuff — price the risk; cross-check with Antigravity. |

---

## Risk flags

- **No S+ on Antigravity or OpenCode yet:** no model clears the irreversible-final-step bar. Flag every such decision.
- **Quota gating:** M1 is subscription-quota bound (5h + weekly). Route worthy tasks first; defer low-worth work. Watch the weekly reset window.
- **Terminal-Bench 4.0 weak:** avoid routing the hardest long-horizon agent suites to M1 as if it were S+ frontier-class.
- **OpenCode free tiers are time-limited + daily-quota:** OC-1/2/5/10 (Beam, Big Pickle, LongCat, Space Bunny) are stealth/limited-time with no model cards or benchmarks → D/unverified; never route an irreversible final step to them.
- **OpenCode free context caps:** DeepSeek V4.1 Flash Free and GLM-5.3-Flash Free are capped at 200K context (paid = 1M); verify the cap serves the task before routing.
- **Nemotron 3 Ultra score conflict:** GA model page AA 23 vs pre-release partner 47.7 — grade A but flag before routing worth work.
- **Cline free tiers are account-quota-limited** (rotate accounts for fresh quotas); watch per-account limits before a long run, not a daily-reset clock.
- **CL-1 Solar Mini 4 (B, text-only):** 1% agentic coding + 18% knowledge accuracy → long-context text-in reasoning only; never research/QA, never coding.
- **CL-4 Muse Spark 1.3 Contributor (S, but free-tier caveats):** grade S uses the regular-tier AA indices as the proxy (Intelligence 48.1 / Coding 75.8 / Agentic 55.5) because the free Contributor tier has no own benches; the free tier is capped to low/medium reasoning (max reasoning is Standard-only) and trades data for price, so real free-tier output runs below the cited indices — probe-verify before S-grade work; never the irreversible final step.
- **No S+ (and no S with verified free-tier benches) on Cline yet:** CL-4 Muse Contributor is graded S on regular-tier indices (ceiling), but the irreversible final step stays S+ only; cross-check S-grade closeouts with Antigravity/M1.
- **Freebuff is time-billed, not token-billed:** 21h/day (Starter $8/mo) + 60h wallet/mo (replaces unused); refill 12:00 AM Asia/Jerusalem. Higher models burn the pool faster — route the smallest time-slice that clears the grade.
- **FB-9 Claude Haiku 5.5 · 100k ctx (S, 6h):** very verbose (440M tokens/task) → hours burn fast; treat as S-ceiling, probe first. (A 15h "Claude Haiku 5.5" row was also observed — variant unreconciled.)
- **FB-10 Gemini 4 Argon (S, 20h):** Promotional · **1 session/day** only — do not treat as routine; use the single daily slot for high-value S work.
- **FB-4/5 DeepSeek V4.1 Flash (S, 3h/5h):** Freebuff's best S-value (recommended default); 1M ctx (no 200K cap here).
- **FB-8 GPT-6 Luna (A, 4h):** weak agentic coding (TB4 13%) + slow (TTFT ~113s, 140M tok/task) → knowledge/multimodal reasoning only, not coding.
- **No S+ on Freebuff:** no irreversible-final-step candidate; cross-check S closeouts with Antigravity (M1).
