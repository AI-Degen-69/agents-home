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

> **Scale in force: Artificial Analysis Intelligence Index v5.0, frontier
> F = 59 (Gemini 4 Carbon high), read 2026-11-02.** Bands recomputed from F:
> **S+ 51–59 · S 46–50 · A 39–45 · B 26–38 · C <26.** Every grade below was
> re-stamped on this scale; v4.3.2 numbers are historical and not comparable.
> The v5.0 basket is harder, so the mid-field dropped 7–14 pts while the
> frontier held — every free-tier model on OpenCode, Cline and Freebuff now sits
> at **B**, **A is empty**, **S is only M2 and Freebuff FB-10 (Argon 50)**, and
> **S+ is empty** (M2's max-effort 58 is the sole unconfirmed candidate).

---

## Antigravity

### Grades (best → worst)

School-style: **S+** (reserve) > **S** (top) > **A** > **B** > **C** > **D**.

| Grade | Meaning | Models earning it |
|---|---|---|
| S+ | Reserve: irreversible / money-adjacent / subtle-invariant work needing the strongest available | (none confirmed on Antigravity — M2's ceiling is AA 58 at max effort, but Antigravity does not surface which thinking tier it serves) |
| S | Top: long-horizon agentic coding, multi-step reasoning, review/audit needing judgment | **M2: Claude Opus 5.5** |
| A | Competent: well-scoped edits, mechanical execution under tests, straightforward research | (none — nothing on Antigravity reaches 39 on v5.0) |
| B | Light / probe: trivial mechanical tasks, closeout babysitting, free verification passes | **M1: Gemini 3.8 Flash** (31 high / 30 medium / 22 low on v5.0) |
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
- **Verdict:** earns **B** on the live scale — **AA v5.0: 31 high / 30 medium /
  22 low** (it read 41/40 on v4.3.2, which is what earned the old A). TB 2.1
  90.8% is elite but TB 4.0 19.1% plus a 28-pt gap to the live frontier keep it
  clearly out of S. It is the cheap supervised path on this harness, not a
  competent-grade model: **A-work routed here is an explicit downgrade — let
  tests decide and escalate to M2 if it flounders.** Quota-gated (5h + weekly) —
  route the final verification/review to an S model/human rather than burning
  the reserve on a non-worthy closeout. (Re-tier Nov 2, 2026 on v5.0.)

### Claude Opus 5.5 (M2) — evidence & grade justification

- **Release / params / context / license / modalities:** 2026-09-22, Anthropic;
  proprietary (no weights, size undisclosed); 1M ctx; text + image → text.
  Thinking cannot be switched off; effort ladder low / medium / high / xhigh /
  max.
- **Primary yardstick (AA, read 2026-11-02, Intelligence Index v5.0; live
  frontier F = 59 = Gemini 4 Carbon high):**
  - max — **58** (#2 of 59), $10.04/task, 96 tok/s, TTFT 640.9s, 220M tok/task
  - xhigh — 57 ($6.05) · high — 52 ($3.46, TTFT 47.5s) · medium — 48 ($2.45,
    TTFT 21.9s) · low — 35 ($0.98)
  - Source: https://artificialanalysis.ai/models/claude-opus-5-5
- **Hard numbers (Anthropic card, 2026-09-22, vendor; max effort unless noted):**
  Terminal-Bench 4.0 **66.4%** (±2.6, xhigh effort); FrontierCode v1.1 54.4%;
  CursorBench 4.0 57.8%; GDPval-AA v2.1 1846 Elo; AutomationBench 40.0%
  (run by Zapier, safeguard interventions counted as failures); HLE 67.7% with
  tools; Terminal-Bench-Science 0.1 58.7%; OSWorld 2.1 81.8% (partial).
  Cross-check: AA's independent TB 4.0 board tops out at Kimi K3.1 Pro 67.2% /
  Gemini 4 Carbon high 65.2%, so 66.4% sits in the plausible frontier range —
  vendor number, not an outlier claim.
- **Secondary (BenchLM, read 2026-11-02, separate scale — corroboration only):**
  overall 86.29 (#2), coding 82.87, agentic 90.07, knowledge 89.53;
  `evidenceStatus: supported`; 90% interval 81.63–90.94 (not validated);
  price $4.00/$20.00 since 2026-09-22 — matches AA and the vendor card.
- **Street check:** not swept this run (search backend returned no results for
  the queries tried). No contrary signal in the sources actually read.
- **Caps / caveats:**
  - **Serving tier unconfirmed** — Antigravity does not surface which thinking
    tier it hands out (or whether the ladder is selectable at all). Grade from
    the measured ladder, not the ceiling: xhigh/max = S+, high/medium = S,
    low = B.
  - **Heaviest quota draw on this harness.** 220M tokens/task at max and a
    640.9s TTFT mean one long session can flatten the 5-hour window; treat it
    as a focal-task model, never a background/babysitter.
  - **Safeguard fallbacks:** Anthropic re-routes most cybersecurity tasks to
    Opus 4.8 and biology / frontier-LLM-dev work to Opus 5 — a security-audit
    task can silently be answered by a different model. Zero-data-retention is
    an Anthropic API option, not something the Google subscription guarantees:
    treat prompts as leaving the machine.
- **Verdict:** earns **S** (F−1 at max effort, F−11 at high, F−11 at medium;
  S+ ceiling unconfirmed, B floor if the harness serves low). May route builds,
  planning, multi-step review and research here while the weekly quota holds;
  may not take the irreversible final step until max effort is confirmed
  selectable — nothing else on the board is S+, so that confirmation is the only
  route to a real S+ closeout (Freebuff FB-10 is S at 50 and cannot substitute).

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
| S+ | Reserve | (none — nothing on OpenCode clears 51; best is 32, 27 pts below F) |
| S | Top | (none — nothing on OpenCode clears 46) |
| A | Competent | (none — nothing on OpenCode reaches 39) |
| B | Light / probe | OC-4: GLM-5.3-Flash (28); OC-6: MiMo-V2.6-Flash (27); OC-3: DeepSeek V4.1 Flash (unmeasured on v5.0; 1017 refresh 32 = ceiling proxy); OC-2: Big Pickle (no page; street B); MiniMax M3.1 Flash (29, no `models.md` row) |
| C | Weak fit | OC-1: Beam (18); OC-9: Nemotron 3.5 Super VL (14); OC-7: Nemotron 3 Ultra (12; 47.7 partner figure is v4.3.2); OC-8: Nemotron 3.5 Lightning (6); OC-5: LongCat 2.5 Preview (Go collapse, slow); OC-10: Mercury 3 (no AA page; family prior 11–12) |
| D | Do not route | (none — all OpenCode models now carry at least provisional evidence) |

### Justification by model

**OC-3 — DeepSeek V4.1 Flash (B).** Released 2026-09-10; 552B MoE (8B
active prefill / 16B decode), 1M context, multimodal, MIT weights.
**AA v5.0: no index — the build is deprecated and unmeasured** (page reads
N/A; 212 tok/s, $0.30/$1.20). The 1017 refresh measures **32** (max), so 32 is
the ceiling proxy → B, not A. Old v4.3.2 figure was 39; do not quote it as
current. Beats GPT-5.6
Sol and Claude Opus-5.0 on DeepSWE v1.1 (74.2 vs 73.0), AutomationBench
(54.8 vs 45.8), Agent's Last Exam (31.8 vs 26.7), CyberGym (88.1 vs 84.5)
(vendor model card, as cited by Flowtivity). Free tier capped at 200K context
(paid = 1M) and time-limited.
Source: https://artificialanalysis.ai/models/deepseek-v4-1-flash

**OC-4 — GLM-5.3-Flash (B).** Z.ai, Aug 2026; 320B params (18B active), 1M
context, multimodal, MIT weights. **AA Intelligence Index v5.0: 28**
(independent; v4.3.2 read 42) — 4/4 Intelligence, 3/4 Cost ($0.15/$0.50). Free
tier capped at 200K context (paid = 1M) and time-limited; one tester found
DeepSeek V4.1 Flash stronger on agentic coding.
Source: https://artificialanalysis.ai/models/glm-5-3-flash

**OC-7 — Nemotron 3 Ultra (C).** NVIDIA, Jun 2026; 550B params, 262k
context, open-weight (OpenMDW) — largest/hardest-reasoning Nemotron.
**AA Intelligence Index v5.0: 12** (v4.3.2 read 23). ⚠️ The NVIDIA pre-release
partner figure **47.7** was measured on the v4.3.2 scale; it cannot be compared
to 12 and does not lift the grade. Free tier = 262k context, 163 tok/s; no
verified DeepSWE/Terminal-Bench 4.0 pass@1 vs DeepSeek.
Source: https://artificialanalysis.ai/models/nvidia-nemotron-3-ultra-550b-a55b
(Re-tier Nov 2, 2026: 12 = C band.)

**OC-9 — Nemotron 3.5 Super VL (C).** NVIDIA, Oct 2026; 120B MoE (12B
active), 1M context, open-weight (OpenMDW-1.1), text+image in / text out,
Hugging Face weights. **AA Intelligence Index v5.0: 14** (v4.3.2 read 26).
Vendor-reported only (not independently re-verified here): GPQA
Diamond 89.52%, SWE-Bench Verified 71.10%. Verbose: 170M output tokens/task
(median 100M). No separate DeepSWE/Terminal-Bench 4.0 pass@1 surfaced.
Source: https://artificialanalysis.ai/models/nemotron-3-5-super-vl

**OC-6 — MiMo-V2.6-Flash (B).** Xiaomi, Sep 2026; 309B MoE (15B active),
1M context, multimodal, MIT weights. **AA Intelligence Index v5.0: 27**
(v4.3.2 read 38; 38 tok/s, $0.13/task). benchlm #32/218 overall, #17/146
coding; slower (49 tok/s).
Terminal-Bench 4.0 24.2% → weaker on longest agentic suites. Free tier capped
at 200K context; time-limited.
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash

**OC-8 — Nemotron 3.5 Lightning (C).** NVIDIA, Aug 2026; 31.6B (3.6B
active), 1M context, open-weight (OpenMDW), text-in only. **AA Intelligence
Index v5.0: 6** (v4.3.2 read 13) — fastest thing on the roster (292 tok/s),
fast & cheap ($0.29/task) light/probe worker;
"less convincing as the one model that must do everything." Free tier: daily
quota, 1M context.
Source: https://artificialanalysis.ai/models/nemotron-3-5-lightning

**OC-1 — Beam = Reflection Beam 1.0 (C).** Reflection AI, Oct 16 2026; 501B
MoE (23B active), 1M ctx, text-in, Apache 2.0 weights. **AA Intelligence Index
v5.0: 18** (v4.3.2 read 30; 361 tok/s) — AutomationBench-AA 48.5%, TB 4.0 3.0%,
ARC-AGI-2 23.5%. ⚠️ Conflict: vendor card claims 81.6% SWE-bench
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

**MiniMax M3.1 Flash (B; no `models.md` row — not on the current roster).**
Released Oct 19 2026 (served anonymously beforehand as "Space Bunny"; 200T
anon tokens); 1M ctx, text+image in / text out,
proprietary (weights "later"), thinking always-on low→max (default max).
Harness ID: `space-bunny-free`.
**AA Intelligence Index v5.0: 29** (v4.3.2 read 43; 136 tok/s, $0.15/$0.60,
$0.49/task) — **verbose 180M tokens/task** (median 99M). ⚠️ Proxy rule
unchanged: the AA page measures the served API model, not the free
`space-bunny-free` tier — 29 is a ceiling, and the free tier runs below it. Vendor (tagged): DeepSWE v1.1 **73.7%**, OSWorld V2
**61.7**, ALE **29.6**, BankerToolBench **76.2**, CyberGym **82%** —
⚠️ harness unnamed, not comparable to DeepSeek's 77.0/35.4 (Mini-SWE-V2);
AA primary. Street (light): indie SWE-Mini **75%** (ties best free bug-fix),
Terminal 64%, HLE 28%, Omniscience +29; measured bug-fix 215/215 at both
efforts — default-max 6,673 toks/56s vs low 889 toks/9.5s (set effort
explicitly); "fast, needs explicit instructions; loops on long runs"
(anecdote-grade). Press headline (VB/Vectara: "beats DeepSeek + Opus 5, high
hallucination") unfetchable — headline-only, ungraded. Verdict: **B — usable
with guardrails (v5.0 Index 29; no longer the OpenCode leader)**; set effort
low/medium, never default-max; first-draft geometry stays C-work;
never the S+ final step.
Sources: https://artificialanalysis.ai/models/minimax-m3-1-flash
https://www.minimax.io/blog/minimax-m31f
https://fellipesoares.com.br/en/opencode-stealth-models-benchmarks/
https://huggingface.co/blog/karmen-beatapi/space-bunny-tested-real-cases-evaluation
Source: https://artificialanalysis.ai/models/minimax-m3-1-flash
(Re-tier Nov 2, 2026: v5.0 Index 29 = B band; the 43 was v4.3.2. Vendor
DeepSWE 73.7 + indie SWE-Mini 75% say competent-for-scoped-work, not top —
30 pts below the live frontier. Verbosity/effort guardrails stand; never the
S+ final step.)

**OC-10 — Mercury 3, Inception (C — provisional, probe-only).** Released
2026-10-19. Diffusion LLM (parallel draft refinement, not autoregressive),
proprietary, param count undisclosed ("40x Mercury 1" vendor claim). 1M ctx,
131,072 max output, tool calling + structured outputs, text-only (no image
input), OpenAI-compatible API (`https://api.inceptionlabs.ai/v1`), effort
ladder `instant/low/medium/high`, temperature 0.5–1.0. Vendor claims
1,068 tok/s on NVIDIA Blackwell, 4–8x GPT-6 Luna / Claude Haiku 5.5, and
"on par or better" with them on quality; launch table ahead on 10 of 12
benchmarks, Haiku leading long-context recall and one of two coding tests.
⚠️ **No AA page for Mercury 3** → per the no-evidence fallback it cannot
exceed C. Independent signals: **Benchable.ai** — 96% operational success,
instruction following 85% (90th pct), multi-step reasoning 96% accuracy
(96th-pct speed), programming 91%, **math 80.6% (28th pct)** (not
AA-calibrated); **Sam Witteveen** self-run — 10/10 on his agentic
tool-calling suite, 8/8 pro prompts, 4,200-word essay completed without
truncation, RAG pass (⚠️ video was **sponsored by Inception** → discounted
evidence). ⚠️ **Strong downward family prior:** AA has measured exactly two
Inception models — **Mercury 2 = Index 11, Mercury 2.5 = Index 12**, both
"below average" (price-class median 13) despite 499/781 tok/s; benchlm's Vals
Index puts Mercury 2.5 at 8.86%. Vendor's own scaling claim ("intelligence 3x
from Mercury 1 mini to Mercury 3") is arithmetically consistent with ~12,
**not** with Luna 28 / Haiku 36 → treat "same range as Luna/Haiku" as a
statement about Inception's private suite, not a calibrated cross-vendor
index. Verdict: **C — cheap/free fast worker, unproven intelligence.**
Guardrails: probe on your own three highest-volume task shapes before
trusting it; never the irreversible final step; re-grade the moment AA
publishes the page. **Data-policy hard stop:** Inception's ToS trains on
prompts/outputs by default ("Improve the model for everyone" toggle = OFF
opt-out) → **never route private/confidential repo content or code**.
Sources: https://www.inceptionlabs.ai/blog/introducing-mercury-3
https://docs.inceptionlabs.ai/get-started/models
https://benchable.ai/models/inception/mercury-3-20261019
https://artificialanalysis.ai/models/creators/inception
https://artificialanalysis.ai/models/mercury-2-5
https://www.youtube.com/watch?v=bEO_QeJU7U0 (sponsored)

> **First-party probe (Oct 21, 2026) — operator's own Inception key.** Measured,
> not claimed (probe ran through the FreeLLMAPI path on the same Inception
> account):
> - **Strict JSON mode + arithmetic**: returned `{"answer": 391, "city":
>   "Paris"}` — correct; 3.37s wall, but **689 of 701 completion tokens were
>   reasoning tokens** at `reasoning_effort: medium` → set effort low/none on
>   cheap tasks or the reasoning tax dominates.
> - **Tool calling**: valid `tool_calls` payload, correct arguments
>   (`{"city":"Tel Aviv","unit":"f"}`), **0.51s wall** — clean, no repair loop.
> - **Streaming speed**: TTFT **0.71s**, decode **~415 tok/s**, 728 completion
>   tokens in 2.46s wall (~296 tok/s end-to-end) — well below the vendor's
>   1,068 tok/s figure, which is decode-only on NVIDIA Blackwell and not
>   reproduced through the router path. Treat "1,068 tok/s" as unverified.
>
> Probe verdict: **C, probe-verified** — fast, instruction-strong, clean
> tool-calling, cheap/free — with the sibling AA prior (11/12) capping how much
> intelligence to assume. Good for drafts, first passes, latency-bound loops,
> and cheap parallel sub-agents. Never the final reviewer.

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
| S+ | Reserve | (none — best on Cline is 36, 23 pts below F) |
| S | Top | (none — nothing on Cline clears 46) |
| A | Competent | (none — nothing on Cline reaches 39) |
| B | Light / probe | CL-2: MiMo-V2.6-Flash (27); Muse Spark 1.3 Contributor (36 regular-tier proxy, free tier capped); MiniMax M3.1 Flash (29, no `models.md` row) |
| C | Weak fit | CL-3: Nemotron 3.5 Super VL (14); CL-1: Solar Mini 4 (no v5.0 index; 1% agentic, 18% knowledge); CL-4: Mercury 3 (no AA page; family prior 11–12) |
| D | Do not route | (none yet on Cline) |

### Justification by model

**MiniMax M3.1 Flash (B; same evidence as OpenCode's block — no `models.md`
row).** Same model, and on v5.0 the same **Index 29** (the 43 was v4.3.2).
Verbose + effort-burn → set effort explicitly. Inherits that verdict: B with
guardrails, never the S+ final step.
Source: same as OpenCode's MiniMax block.

**CL-3 — Nemotron 3.5 Super VL (C).** NVIDIA, Oct 2026; 120B MoE (12B active), 1M
ctx, open-weight (OpenMDW-1.1), text+image in / text out. **AA Intelligence
Index v5.0: 14** (v4.3.2 read 26); vendor-reported GPQA
Diamond 89.52%, SWE-Bench Verified 71.10% (not independently re-verified here).
Same underlying model as OpenCode's OC-9 (grade C there). Free on Cline via the
free dropdown; no stated 200K cap beyond per-account quota.
Source: https://artificialanalysis.ai/models/nemotron-3-5-super-vl
(Re-tier Nov 2, 2026: 14 = C band on both harnesses.)

**CL-2 — MiMo-V2.6-Flash (B).** Xiaomi, Sep 2026; 309B MoE (15B active), 1M ctx,
multimodal, MIT weights. **AA Intelligence Index v5.0: 27** (v4.3.2 read 38);
benchlm #32/218
overall, #17/146 coding; slower (49 tok/s), Terminal-Bench 4.0 24.2% (weaker on
longest agentic suites). Same model as OpenCode's OC-6 (grade B there).
Source: https://artificialanalysis.ai/models/mimo-v2-6-flash
(Re-tier Nov 2, 2026: 27 = B band; TB4 24.2% keeps it light/probe.)

**CL-1 — Solar Mini 4 (C).** Upstage, Sep 2026; 35B total / 3B active MoE, 1M ctx,
text→text only, proprietary (weights not released), knowledge cutoff Feb 2026.
**AA v5.0: no index** (page shows N/A; the 24 came from the AA article on the
v4.3.2 scale, and it is not portable). ⚠️ Weaknesses confirmed then:
Terminal-Bench 4.0 1%,
AutomationBench-AA 22%, knowledge accuracy 18% (AA-Omniscience −11). Fast decode
(208 tok/s) but 7.1 min/task (heavy token use). Route only for long-context
text-in reasoning; never research/QA, never agentic coding, never the irreversible
final step.
Source: https://artificialanalysis.ai/articles/korean-ai-lab-upstage-releases-solar-mini-4
(Re-tier Nov 2, 2026: no v5.0 yardstick + documented collapses = C.)

**CL-4 — Mercury 3 (C; same evidence as OC-10).** Same model, same verdict:
C, probe-only, no AA page, AA family prior 11–12, Benchable + sponsored-video
street. Free for the operator (own Inception key, 100M free tokens). Verified
on disk: Cline's native `inception` provider (`~/.cline/data/settings/
providers.json`, tokenSource manual) plus a `mercury-3` entry under its
`freellm` router provider. Inherits the OC-10 guardrails: probe before trust;
never the irreversible final step; never private/confidential repo content
(trains on prompts by default).
Source: same as OC-10.

**Muse Spark 1.3 Contributor (B — best free model on Cline, but not S).** Meta (MSL),
1.3 released 2 Sep 2026; multimodal reasoning, text+image+video (+audio/PDF) in /
text out, 1M ctx. ⚠️ The only benchmark numbers are for the **regular Muse Spark
1.3 (Standard/"Max" tier, $1.25/$4.25)**; the Contributor tier itself has no own
benches (OpenRouter lists "Not available"), so per your direction we use the
regular-version numbers as the capability proxy: **AA Intelligence Index v5.0:
36** (v4.3.2 read 48.1; the Coding 75.8 / Agentic 55.5 sub-indices quoted in
earlier notes belonged to that retired scale). Free Contributor caveats:
it is ≈92–95% cheaper ($0.10/$0.20), prompts/completions **may train Meta
models**, and—per TrueFoundry—**max reasoning is Standard-only**, so the free
tier is capped to low/medium reasoning and will run below the cited index in
practice. → Grade **B** (36 = B band, 23 pts below the live frontier; the
strongest thing on Cline by name, not by tier): probe-verify before any
S-grade work, and S builds go elsewhere (M2 / FB-10). No `models.md` Cline row
exists for it — add one before pricing it in a routing table.

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

## Claude Code

**Not installed on this machine** (Oct 21, 2026) — no Claude Code harness and
no provider config; the only `claude-code` artefact is a disabled Hermes
plugin. No models, no grades, nothing to route.

## Task-class matrix (which grade each kind of work demands)

Required grade is a property of the work class (harness-independent); the
Harness + Earned-by columns pin it to the model actually on that harness.

| Task class | Required grade | Harness | Earned by | Notes / risk |
|---|---|---|---|---|
| Planning / strategy | S | Antigravity | M2 | Opus 5.5 — confirm the thinking tier first; heavy quota draw, so plan here only when the weekly window is healthy. Fallback Freebuff FB-6. |
| Long-horizon agentic coding (build) | S | Antigravity | M2 | Opus 5.5 at high-or-better thinking (TB 4.0 66.4% vendor, AA 58 at max); M1 (B) supervised only. |
| Multi-step review / audit (judgment) | S | Antigravity | M2 | Strongest reviewer on this harness; security-flavored audits may be served by Opus 4.8 via safeguards. |
| Well-scoped code edits (tests decide) | A | Antigravity | M1 | No A on this harness: M1 is B (31) — an explicit downgrade, tests as arbiter, escalate to M2 if it flounders. |
| Mechanical execution / babysitting | B | Antigravity | M1 | M1 (31, 22 at low) is exactly the one you can afford to burn on mechanical work; M2 is not. |
| Research / extraction (no hard guarantees) | S | Antigravity | M2 | Opus 5.5 (HLE 67.7% with tools, GDPval 1846 Elo); M1 for light extraction only. |
| Final irreversible verification | S+ | Antigravity | — | No confirmed S+ anywhere: M2's max-effort tier is the only candidate and Antigravity doesn't expose which tier it serves. Price the risk, cross-check with Freebuff FB-10 (also S), keep a human in the loop. |
| Planning / strategy | S | OpenCode | — | No S on OpenCode — best is OC-3/1017 (32) / MiniMax (29) / OC-4 GLM (28), all B. Plan here only as an explicit downgrade with tests as arbiter, else route to Antigravity M2. |
| Long-horizon agentic coding (build) | S | OpenCode | — | No S builder on OpenCode — best B supervised only; real S builds go to Antigravity M2. |
| Multi-step review / audit (judgment) | S | OpenCode | — | No S reviewer on OpenCode — escalate to Antigravity M2. |
| Well-scoped code edits (tests decide) | A | OpenCode | OC-3 / OC-4 / MiniMax | Required A is unmet (nothing reaches 39): best B is OC-3 DeepSeek 32 proxy, MiniMax 29, OC-4 GLM 28 — explicit downgrade, tests decide. |
| Mechanical execution / babysitting | B | OpenCode | OC-6 / OC-1 / OC-9 | MiMo 27 / Beam 18 / Super VL 14; OC-2 Big Pickle for knowledge-flavored (no page, indie B-band). |
| Research / extraction (no hard guarantees) | S | OpenCode | — | No S researcher on OpenCode — OC-2 Big Pickle (Omniscience +43) for low-stakes only; real S research goes to Antigravity M2. |
| Final irreversible verification | S+ | OpenCode | — | No S+ on any harness — cross-check Antigravity M2 (S) with a human in the loop. |
| Planning / strategy | S | Cline | — | No S on Cline — best is the Muse Contributor 36 proxy (reasoning-capped), then MiniMax 29 / CL-2 MiMo 27. Downgrade only; else Antigravity M2. |
| Long-horizon agentic coding (build) | S | Cline | — | No S builder — Muse Contributor (36 ceiling, reasoning-capped) as an explicit downgrade with probe + tests; real S builds go to Antigravity M2. |
| Multi-step review / audit (judgment) | S | Cline | — | No S reviewer — human-check the final review; escalate to Antigravity M2. |
| Well-scoped code edits (tests decide) | A | Cline | CL-2 / MiniMax | Required A unmet: MiMo 27 / MiniMax 29 (B). Tests decide; CL-1 Solar is text-reasoning only. |
| Mechanical execution / babysitting | B | Cline | CL-3 / CL-1 | Super VL 14 / Solar Mini 4 (no v5.0 index; 1% agentic, 18% knowledge — not QA). |
| Final irreversible verification | S+ | Cline | — | No S+ on any harness — cross-check Antigravity M2 (S) with a human in the loop. |
| Planning / strategy | S | Freebuff | FB-10 | Argon 50 — the only S on the harness; 20h + 1 session/day, so ration it. FB-6 (36, 3h) is the B fallback. |
| Long-horizon agentic coding (build) | S | Freebuff | FB-10 | Argon (TB4 57%) is the only S builder; FB-11 DeepSeek-1017 (32, 5h, DeepSWE 77.0 vendor) is the B fallback once the daily slot is gone. |
| Multi-step review / audit (judgment) | S | Freebuff | FB-10 | Argon; FB-6 Muse (36) alt, FB-9 Haiku (36, verbose 6h) last. |
| Well-scoped code edits (tests decide) | A | Freebuff | FB-1 / FB-4 / FB-11 | Required A unmet (nothing reaches 39): MiMo 27 at 1h is cheapest, DeepSeek base 3h (32 proxy) and 1017 5h (32) follow. Tests decide. |
| Mechanical execution / babysitting | B | Freebuff | FB-1 | MiMo 27 at 1h — the cheapest slice on the whole board. |
| Research / extraction (no hard guarantees) | S | Freebuff | FB-10 | Argon; avoid GPT-6 Luna (28, TB4 13%, slow). |
| Final irreversible verification | S+ | Freebuff | — | No S+ anywhere — FB-10 is S (50). Cross-check Antigravity M2 (S) and keep a human in the loop. |

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

- **No confirmed S+ anywhere (Nov 2, 2026):** the S+ band is 51–59 and the
  highest score in the whole inventory is FB-10 at 50. Antigravity M2 may reach
  58 at max effort, but Antigravity doesn't expose which tier it serves — so
  every irreversible final step is unowned. Treat "S+ required" work as
  M2-or-human, not as an automated hop.
- **Board re-tiered on AA Intelligence Index v5.0 (Nov 2, 2026).** The live
  scale is v5.0 (9-eval basket), frontier **F = 59** (Gemini 4 Carbon high),
  bands **S+ 51–59 · S 46–50 · A 39–45 · B 26–38 · C <26**. Every grade in this
  file was re-stamped on it. v4.3.2 numbers are historical and not comparable
  point-for-point: Gemini 3.8 Flash reads 31 now vs 41 then, GLM-5.3-Flash 28 vs
  42, MiMo-V2.6-Flash 27 vs 38. **Consequence: A is empty, S is M2 and FB-10,
  every free-tier model on OpenCode/Cline/Freebuff is B.** Grade any newly
  added model on v5.0 from `models-research-handbook.md`; re-check every score
  within ~3 pts of a band edge (B/A edge at 38/39, S/S+ edge at 50/51).
- **Quota gating:** M1 and M2 are subscription-quota bound (5h + weekly). M2 is
  the heaviest draw on the harness (220M tokens/task, $10.04/task at max effort)
  — route worthy tasks first, never let it run as a background worker, and watch
  the weekly reset window.
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
