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

| Window | Resets | Notes |
|---|---|---|
| 5-hour cap | every ~3h 12m | 87% remaining at last observation |
| Weekly quota | every ~5d 20h | 74% remaining at last observation |

**Effort levels** are a soft proxy for token budget / expected runtime a task
consumes. Assign Low / Medium / High based on the job, then check remaining
quota before routing.

### Inventory

| # | Model | Effort Levels | Cost basis | Effective cap / notes | Availability |
|---|---|---|---|---|---|
| M1 | Gemini 3.8 Flash | Low / Medium / High | Google AI subscription: 5-hour + weekly quota | Leader for Antigravity. Quota-gated. | Verified — api id `gemini-3.8-flash` (Sep 2, 2026); benchmarks cited in capability.md |

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

## Codex

> *(add your Codex models here — same table shape as Antigravity)*

### Inventory

| # | Model | Effort Levels | Cost basis | Effective cap / notes | Availability |
|---|---|---|---|---|---|
| *(none yet)* | | | | | |

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

| # | Model | Effort Levels | Cost basis | Effective cap / notes | Availability |
|---|---|---|---|---|---|
| OC-1 | Beam Free | Default, Low, Medium, High, Extra High, Max | Free | Fast tier; currently the active default (selected). | OpenCode dropdown; user-reported |
| OC-2 | Big Pickle | None | Free | No effort control exposed. | OpenCode dropdown; user-reported |
| OC-3 | DeepSeek V4.1 Flash Free | Default, Low, High, Max | Free | DeepSeek family; capped at Max effort; free tier limited to 200K ctx. | OpenCode dropdown; user-reported |
| OC-4 | GLM-5.3-Flash Free | Default, Low, High, Max | Free | Zhipu GLM family; capped effort set; free tier limited to 200K ctx. | OpenCode dropdown; user-reported |
| OC-5 | LongCat 2.5 Preview Free | None | Free | Preview build; no effort control. | OpenCode dropdown; user-reported |
| OC-6 | MiMo-V2.6-Flash Free | Default, Low, Medium, High, Extra High, Max | Free | MiMo (Xiaomi) Flash variant; full effort ladder. | OpenCode dropdown; user-reported |
| OC-7 | Nemotron 3 Ultra Free | None | Free | NVIDIA largest/hardest-reasoning Nemotron; free tier = 1M ctx. | OpenCode dropdown; user-reported |
| OC-8 | Nemotron 3.5 Lightning Free | None | Free | Speed-focused variant; no effort levels surfaced. | OpenCode dropdown; user-reported |
| OC-9 | Nemotron 3.5 Super VL Free | Default, None, Minimal, Low, Medium, High, Extra High | Free | NVIDIA 120B open-weight MoE; only Nemotron with effort ladder. | OpenCode dropdown; user-reported |
| OC-10 | Space Bunny Free | Default, Low, Medium, High, Extra High, Max | Free | Full effort ladder exposed. | OpenCode dropdown; user-reported |

### Update log
- Added OC-1..OC-10 from the OpenCode free-tier dropdown (images image_3e2797.png,
  image_7ea323.png). Effort levels per model from user; cost = Free daily-reset
  quota (not unlimited). Capabilities/grades in capability.md.

---

## Cline

Pricing: **Free** with limited usage at no cost (Cline UI header note: "Try with
limited usage at no cost"). You rotate multiple accounts for fresh quotas, so treat
cost as ~effectively unlimited. **Effort levels = thinking effort:** None / Low /
Medium / High / Extra (per the Cline dropdown, image_97b6fa.png).

### Inventory

| # | Model | Effort levels | Cost basis | Effective cap / notes | Availability |
|---|---|---|---|---|---|
| CL-1 | Solar Mini 4 | None / Low / Medium / High / Extra | Free | Compact 35B MoE. | Cline dropdown; image_b03dd9.png |
| CL-2 | MiMo-V2.6-Flash | None / Low / Medium / High / Extra | Free | 309B MoE (15B active); same underlying model as OC-6. | Cline dropdown |
| CL-3 | Nemotron 3.5 Super VL | None / Low / Medium / High / Extra | Free | NVIDIA 120B MoE (12B active); 1M ctx; AA index 26. | Cline dropdown |
| CL-4 | Muse Spark 1.3 Contributor | None / Low / Medium / High / Extra | Free | Meta multimodal reasoning; regular-tier AA Intel 48.1 / Coding 75.8 / Agentic 55.5 (proxy; free tier reasoning-capped). | Cline dropdown; user-reported |

### Update log
- Added CL-1..CL-4 from the Cline free-tier dropdown (image_b03dd9.png); thinking
  levels confirmed from image_97b6fa.png. Cost = free limited-usage rotated
  across accounts → effectively unlimited. Grades in capability.md.

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

| # | Model | Effort levels | Cost (Freebuff hours) | Effective cap / notes | Availability |
|---|---|---|---|---|---|
| FB-1 | MiMo 2.6 Flash | N/A (base) | 1h | Cheapest capable; AA 38 (A). | Freebuff hours pool |
| FB-2 | MiMo v2.6 Flash Fast | N/A (Fast) | 2h | Speed variant of MiMo Flash. | Freebuff hours pool |
| FB-3 | MiMo 2.6 Pro | N/A (Pro) | 5h | Higher-tier MiMo; same AA 38 (A). | Freebuff hours pool |
| FB-4 | DeepSeek V4.1 Flash | N/A | 3h | Recommended default; AA 39 (S). | Freebuff hours pool; image_0116c1.png |
| FB-5 | DeepSeek V4.1 Flash Fast | N/A (Fast) | 5h | Speed variant; AA 39 (S). | Freebuff hours pool |
| FB-6 | Muse Spark 1.3 | N/A | 3h | Standard tier (not the free Contributor); AA Intel 48.1 / Coding 75.8 / Agentic 55.5 (S). | Freebuff hours pool |
| FB-7 | GLM 5.3 Flash | N/A | 4h | Zhipu; AA 42 (A). | Freebuff hours pool |
| FB-8 | GPT-6 Luna | N/A | 4h | OpenAI; AA 38 (A); weak TB4 13%, slow TTFT. | Freebuff hours pool |
| FB-9 | Claude Haiku 5.5 · 100k ctx | N/A | 6h | Anthropic; AA 43 (S); 440M tokens/task — burns hours fast. | Freebuff hours pool; image_084962.png |
| FB-10 | Gemini 4 Argon | N/A | 20h | Google; AA 53 (S); Promotional · **1 session/day**; $2.00/$10.00 token. | Freebuff hours pool; image_d241b0.png |

Notes: FB-1..FB-10 costs are hours consumed per session from the daily 21h
(subscriber) / 5h (free) pool (refill 12:00 AM Asia/Jerusalem). FB-10 Gemini 4
Argon is hard-gated to **1 session/day** (Promotional) in addition to its 20h cost.
A second "Claude Haiku 5.5" row at 15h was observed in image_d241b0.png but not
reconciled (likely a higher-context/usage variant) → folded into FB-9 as a note.

### Update log
- Added Freebuff harness FB-1..FB-10 from the Freebuff model/pricing dropdown
  (images image_0116c1.png, image_084962.png, image_d241b0.png) + hours policy
  (image_5b0e6d.png) + plan (image_fa369d.png). Time-based billing ($8/mo Starter
  = 21h/day; refill 12:00 AM Asia/Jerusalem; early-close refunds). Grades in
  capability.md.
