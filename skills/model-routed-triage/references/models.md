# Models reference

Source of truth for **what is actually available to you**, per harness, at what
effective cost. The `model-routed-triage` skill reads this file in Step 0 and
routes only from this list — it never invents a model from memory. Update this
file whenever a harness/pricing/quota changes; the skill inherits every edit.

Each harness gets the **same structure** (Pricing → Effort levels → Inventory
table → Update log). Add a new harness by copying a block and renaming the
header. Model IDs are stable **per harness** (M1, M2, …).

> Harness eligibility: a model is routeable only where it is actually installed
> and switchable on that harness (per the skill's "Harness fit" rule).

---

## Antigravity

Pricing: quota-bound, not per-token. Two reset windows (last observed on the
live dashboard snapshot):

| Window       | Resets        | Notes                             |
| ------------ | ------------- | --------------------------------- |
| 5-hour cap   | every ~3h 12m | 87% remaining at last observation |
| Weekly quota | every ~5d 20h | 74% remaining at last observation |

**Effort levels** are a soft proxy for token budget / expected runtime a task
consumes. Assign Low / Medium / High based on the job, then check remaining
quota before routing.

### Inventory

| #   | Model            | Effort Levels       | Cost basis                                    | Effective cap / notes                | Availability                                                                          |
| --- | ---------------- | ------------------- | --------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------- |
| M1  | Gemini 3.8 Flash | Low / Medium / High | Google AI subscription: 5-hour + weekly quota | Leader for Antigravity. Quota-gated. | Verified — api id `gemini-3.8-flash` (Sep 2, 2026); benchmarks cited in capability.md |

### Update log

- Added M1 after quota structure confirmed from live dashboard snapshot
  (ephemeral); capability verification is the durable web sources in
  capability.md, not the dashboard image.

---

## Hermes

> *(add your Hermes models here — same table shape as Antigravity)*

### Update log

- *(none yet)*

---

## OpenCode

Pricing: **Free** ≠ unlimited. Each model carries a daily quota that resets at
**00:00 Asia/Jerusalem** (confirm the exact reset minute in OpenCode config;
treat expected spend as quota occupancy, not dollars). Effort levels vary per
model (see the Effort Levels column); models without an effort control are
listed as `None`.

### Inventory

| #     | Model                  | Effort Levels                                         | Cost basis  | Effective cap / notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Availability                                                                                                                                              |
| ----- | ---------------------- | ----------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OC-1  | Beam                   | Default, Low, Medium, High, Extra High, Max           | Free        | = Reflection Beam 1.0; 501B MoE (23B active), 1M ctx, Apache 2.0; AA Index 30, Coding Agent 28, TB4 3.0%; card SWE-bench 81.6% vendor-reported; ~280GB NVFP4, not local-runnable.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | OpenCode dropdown; AA + vendor card + X street                                                                                                            |
| OC-2  | Big Pickle             | None                                                  | Free        | Zen stealth, no effort control. Indie 5-bench: Omniscience +43, HLE 38%, TB 71%, SWE-Mini 65%; SWE Atlas QnA 50.8% (Mini-SWE-Agent best). No AA page, single-runner.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | OpenCode dropdown; indie benches + GitHub repro                                                                                                           |
| OC-3  | DeepSeek V4.1 Flash    | Default, Low, High, Max                               | Free        | DeepSeek family; capped at Max effort; free tier limited to 200K ctx.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | OpenCode dropdown; user-reported                                                                                                                          |
| OC-4  | GLM-5.3-Flash          | Default, Low, High, Max                               | Free        | Zhipu GLM family; capped effort set; free tier limited to 200K ctx.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | OpenCode dropdown; user-reported                                                                                                                          |
| OC-5  | LongCat 2.5 Preview    | None                                                  | Free        | Meituan; 1.6T MoE (~48B active), 1M ctx; official TB 2.1 70.8 vendor-reported; indie 46.65/80, Go 0.9/5 collapse, slowest runs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | OpenCode dropdown; vendor + indie board                                                                                                                   |
| OC-6  | MiMo-V2.6-Flash        | Default, Low, Medium, High, Extra High, Max           | Free        | MiMo (Xiaomi) Flash variant; full effort ladder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | OpenCode dropdown; user-reported                                                                                                                          |
| OC-7  | Nemotron 3 Ultra       | None                                                  | Free        | NVIDIA largest/hardest-reasoning Nemotron; free tier = 1M ctx.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | OpenCode dropdown; user-reported                                                                                                                          |
| OC-8  | Nemotron 3.5 Lightning | None                                                  | Free        | Speed-focused variant; no effort levels surfaced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | OpenCode dropdown; user-reported                                                                                                                          |
| OC-9  | Nemotron 3.5 Super VL  | Default, None, Minimal, Low, Medium, High, Extra High | Free        | NVIDIA 120B open-weight MoE; only Nemotron with effort ladder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | OpenCode dropdown; user-reported                                                                                                                          |
| OC-10 | Mercury 3              | low, medium, high                                     | Free (BYOK) | Diffusion LLM, Inception, 2026-10-19. **OpenCode ships a native `inception` provider** (models.dev catalog: api `https://api.inceptionlabs.ai/v1/`, env `INCEPTION_API_KEY`) with `mercury-2` / `mercury-2.5` / `mercury-3` / `mercury-edit-2` → model ref **`inception/mercury-3`**. Catalog limits: ctx **1,000,000**, output **131,072**, reasoning effort low/medium/high, tool_call + structured_output, text-only, cost $0.10/$0.35 (cache_read $0.01) — matches vendor. Cost for the operator = his own Inception key: **100M free tokens per new key**, then $0.20/$0.70 (50% launch $0.10/$0.35). Measured Oct 21 (through the FreeLLMAPI path on the same account): TTFT 0.71s, decode ~415 tok/s, tool call in 0.51s; reasoning tokens dominate at effort=medium. No AA page → `[unverified]`. | OpenCode native `inception` provider, operator's own key (operator-confirmed 2026-10-21; verified in `opencode.db` credential table + models.dev catalog) |

- Added OC-10 Mercury 3 (Oct 21, 2026) — **native OpenCode `inception` provider**
  (models.dev catalog entry `inception`: api `https://api.inceptionlabs.ai/v1/`,
  env `INCEPTION_API_KEY`), models mercury-2 / mercury-2.5 / mercury-3 /
  mercury-edit-2, operator's own key (stored in `opencode.db` → credential
  table, integration_id `inception`). Catalog limits for mercury-3: ctx
  1,000,000, output 131,072, effort low/medium/high, tool_call +
  structured_output. The same key is also wired in the FreeLLMAPI router
  (custom platform `mercury-3`) and in Freebuff BYOK — probe measurements came
  through the FreeLLMAPI path on the same account. Cost basis = 100M free
  tokens per new Inception key, then list price. Grade in capability.md.

### Update log

- Added OC-1..OC-9 from the OpenCode free-tier dropdown (images image_3e2797.png,
  image_7ea323.png). Effort levels per model from user; cost = Free daily-reset
  quota (not unlimited). Capabilities/grades in capability.md.
- Re-graded OC-1/2/5 from D/unverified to provisional B/C (Oct 20, 2026):
  street evidence swept per the no-evidence fallback (company post → GitHub/HF/
  indie benches → X). OC-1 Beam = Reflection Beam 1.0 (AA 30, Coding Agent 28)
  → C; OC-2 Big Pickle (SWE Atlas 50.8%, Omniscience +43) → B; OC-5 LongCat 2.5
  (indie 46.65/80, Go collapse) → C. Justifications + sources in capability.md.

---

## Cline

Pricing: **Free** with limited usage at no cost (Cline UI header note: "Try with
limited usage at no cost"). You rotate multiple accounts for fresh quotas, so treat
cost as ~effectively unlimited. **Effort levels = thinking effort:** None / Low /
Medium / High / Extra (per the Cline dropdown, image_97b6fa.png).

### Inventory

| #    | Model                 | Effort levels                                     | Cost basis  | Effective cap / notes                                                                                                                                                                                                                                                 | Availability                                                                                                                                                                                                                                                                   |
| ---- | --------------------- | ------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CL-1 | Solar Mini 4          | None / Low / Medium / High / Extra                | Free        | Compact 35B MoE.                                                                                                                                                                                                                                                      | Cline dropdown; image_b03dd9.png                                                                                                                                                                                                                                               |
| CL-2 | MiMo-V2.6-Flash       | None / Low / Medium / High / Extra                | Free        | 309B MoE (15B active); same underlying model as OC-6.                                                                                                                                                                                                                 | Cline dropdown                                                                                                                                                                                                                                                                 |
| CL-3 | Nemotron 3.5 Super VL | None / Low / Medium / High / Extra                | Free        | NVIDIA 120B MoE (12B active); 1M ctx; AA index 26.                                                                                                                                                                                                                    | Cline dropdown                                                                                                                                                                                                                                                                 |
| CL-4 | Mercury 3             | low, medium, high (vendor also exposes `instant`) | Free (BYOK) | Same model as OC-11 — Inception diffusion LLM via the operator's own key (100M free tokens per new key, then $0.20/$0.70 list, 50% launch discount $0.10/$0.35). 1M ctx / 131,072 max out; tool calling + structured outputs; text-only. No AA page → `[unverified]`. | Cline: **native `inception` provider** verified in `~/.cline/data/settings/providers.json` (provider id `inception`, apiKey, tokenSource manual, set 2026-10-20); `mercury-3` is also listed under Cline's `freellm` (router) provider in `~/.cline/data/settings/models.json` |

### Update log

- Added CL-1..CL-3 from the Cline free-tier dropdown (image_b03dd9.png); thinking
  levels confirmed from image_97b6fa.png. Cost = free limited-usage rotated
  across accounts → effectively unlimited. Grades in capability.md.
- Added CL-4 Mercury 3 (Oct 21, 2026) — Inception custom OpenAI-compatible
  provider, operator's own key (100M free tokens per new key). Same model and
  evidence as OC-11. Verified on disk: `~/.cline/data/settings/providers.json`
  → provider `inception` (apiKey, tokenSource manual, updated 2026-10-20);
  `~/.cline/data/settings/models.json` also lists `mercury-3` under Cline's
  `freellm` (FreeLLMAPI router) provider.

---

## Freebuff

Pricing: **Time-based, not token-based** (image_5b0e6d.png). Usage draws from a
daily hour pool that refills at **12:00 AM Asia/Jerusalem**; your **Starter
$8/mo = 21 h/day** (observed 19/21 used, image_fa369d.png) + 60 h wallet/month
that **replaces** unused bonus (not additive); free/limited tier = 5 h/day; a
higher "full-access" tier offers 50 h/day. Higher-cost models burn the pool
faster; **close sessions early → unused hours auto-refund**. Higher-tier variants
(Fast/Pro) are the speed/capability proxy (no selectable thinking-effort control).

### Inventory

| #     | Model                    | Effort levels | Cost (Freebuff hours) | Effective cap / notes                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Availability                                  |
| ----- | ------------------------ | ------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| FB-1  | MiMo 2.6 Flash           | Low, Medium, Max   | 1h                    | Cheapest capable; AA 38 (A).                                                                                                                                                                                                                                                                                                                                                                                                                                              | Freebuff hours pool                           |
| FB-2  | MiMo v2.6 Flash Fast     | Low, Medium, Max   | 2h                    | Speed variant of MiMo Flash.                                                                                                                                                                                                                                                                                                                                                                                                                                              | Freebuff hours pool                           |
| FB-3  | MiMo 2.6 Pro             | Low, Medium, Max   | 5h                    | Higher-tier MiMo; same AA 38 (A).                                                                                                                                                                                                                                                                                                                                                                                                                                         | Freebuff hours pool                           |
| FB-4  | DeepSeek V4.1 Flash      | Low, Medium, Max   | 3h                    | Recommended default; AA 39 (A).                                                                                                                                                                                                                                                                                                                                                                                                                                           | Freebuff hours pool; image_0116c1.png         |
| FB-5  | DeepSeek V4.1 Flash Fast | Low, Medium, Max   | 5h                    | Speed variant; AA 39 (A).                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Freebuff hours pool                           |
| FB-6  | Muse Spark 1.3           | Low, Medium, Max   | 3h                    | Standard tier (not the free Contributor); AA Intel 48.1 / Coding 75.8 / Agentic 55.5 (S).                                                                                                                                                                                                                                                                                                                                                                                 | Freebuff hours pool                           |
| FB-7  | GLM 5.3 Flash            | Low, Medium, Max   | 4h                    | Zhipu; AA 42 (A).                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Freebuff hours pool                           |
| FB-8  | GPT-6 Luna               | Low, Medium, Max   | 4h                    | OpenAI; AA 38 (A); weak TB4 13%, slow TTFT.                                                                                                                                                                                                                                                                                                                                                                                                                               | Freebuff hours pool                           |
| FB-9  | Claude Haiku 5.5         | Low, Medium, Max   | 6h                    | 100k-context variant; Anthropic; AA 43 (A band; S-ceiling per verbosity + probe-first on this harness); 440M tokens/task — burns hours fast.                                                                                                                                                                                                                                                                                                                              | Freebuff hours pool; image_084962.png         |
| FB-10 | Gemini 4 Argon           | Low, Medium, Max   | 20h                   | Google; AA 53 (S+); Promotional · **1 session/day**; $2.00/$10.00 token.                                                                                                                                                                                                                                                                                                                                                                                                  | Freebuff hours pool; image_d241b0.png         |
| FB-11 | DeepSeek V4.1 Flash 1017 | Low, Medium, Max   | 5h                    | 17 Oct 2026 refresh; AA Intel 45 Max-tier (v4.3.2); vendor DeepSWE 77.0 / TB4 42.3 / HLE 42.6 (unreproduced); MIT, 1M ctx; verbose 210M/task. Distinct from FB-4/FB-5 base (AA 39).                                                                                                                                                                                                                                                                                       | Freebuff dropdown; user-reported              |
| FB-12 | Mercury 3                | Low, Medium, Max   | Free (BYOK)           | Inception diffusion LLM via the operator's own key: **100M free tokens per new key**, then $0.20/$0.70 list (50% launch $0.10/$0.35). BYOK connection `Custom OpenAI-compatible mercury-3` → https://api.inceptionlabs.ai/v1, model `mercury-3`. ⚠️ Connection declares contextWindow 32,768 / maxOutput 4,096 — under-provisioned vs the model's 1M / 131,072; raise if the harness allows. Freebuff hour-burn for BYOK entries unconfirmed. No AA page → `[unverified]`. | Freebuff BYOK (operator-confirmed 2026-10-21) |

Notes: FB-1..FB-10 costs are hours consumed per session from the daily 21h
(subscriber) / 5h (free) pool (refill 12:00 AM Asia/Jerusalem). FB-10 Gemini 4
Argon is hard-gated to **1 session/day** (Promotional) in addition to its 20h cost.
A second "Claude Haiku 5.5" row at 15h was observed in image_d241b0.png but not
reconciled (likely a higher-context/usage variant) → per operator, names stay
clean: FB-9 is the 100k-context variant (6h); if the 15h row is confirmed as the
regular-context variant, add it as a separate row with ctx in notes, same rule.

### Update log

- Added Freebuff harness FB-1..FB-10 from the Freebuff model/pricing dropdown
  (images image_0116c1.png, image_084962.png, image_d241b0.png) + hours policy
  (image_5b0e6d.png) + plan (image_fa369d.png). Time-based billing ($8/mo Starter
  = 21h/day; refill 12:00 AM Asia/Jerusalem; early-close refunds). Grades in
  capability.md.
- Added FB-11 DeepSeek V4.1 Flash 1017 (Oct 20, 2026; user-confirmed on
  Freebuff, distinct from FB-4/FB-5 base). AA Intel 45 Max-tier ceiling
  (v4.3.2); vendor deltas DeepSWE 77.0 / TB4 42.3 / HLE 42.6 unreproduced;
  S-ceiling probe-first; cost 5h operator-confirmed. Grade in capability.md.
- Added FB-12 Mercury 3 (Oct 21, 2026) — BYOK connection to the operator's
  Inception key (verified on disk: `.config/freebuff/byok/connections.json`).
  Same model and evidence as OC-11. Context/output caps in the connection are
  32,768 / 4,096 → raise. Freebuff hour-burn for BYOK models unknown.

---



### Update log

- (Oct 21, 2026) Removed the speculative CC-1 Mercury 3 row — the operator has
  no Claude Code. The Inception wirings that actually exist are OpenCode
  (native `inception` provider), Cline (native `inception` provider +
  `freellm` router entry), Freebuff (BYOK connection) and the FreeLLMAPI
  router itself.
