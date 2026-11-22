# Live model inventory

What this machine can actually reach, at what cost, right now. **Generated, not hand-written.** IDs come from `opencode models` and each harness's own picker. Grep this file before recommending a model; if the ID is absent, the model is not available.

Last enumeration: **2026-11-22**. Refresh with `node scripts/models-sync.mjs` (see `--help`).

Grades are not here. `capability.md` carries them, keyed by the same IDs. An ID with no grade is `[unverified]` and cannot be a top pick.

## Quota order

Spend top to bottom. A row higher up costs less of what is scarce.

| Rank | Pool | Billing | Ceiling | Notes |
| --- | --- | --- | --- | --- |
| 1 | OpenCode free tier | free, daily reset 00:00 Asia/Jerusalem | daily request quota | 11 models, small context on some |
| 2 | Freebuff | hours per day | Starter: 21 h/day + 60 h/month wallet | unused hours refund when you close early |
| 3 | Antigravity free account | 6 free accounts | free-tier quota, smaller than Pro | only Gemini 3.8 Flash + Claude Opus 4.6 |
| 4 | FreeLLMAPI | free router | rate limited | 14 models, provider of last resort |
| 5 | Antigravity Pro | one Google AI Pro plan | 5-hour + weekly window | best models live here; bank it for hard work |
| 6 | Inception | 100M free tokens per month, then stop | monthly token cap, never exceeded | no payment beyond the free grant |
| 7 | sail-ai-degen | $5 free credit per month | monthly dollar cap, never exceeded | no payment beyond the credit |
| 8 | OpenRouter | free tier | free-tier rate limit | route only `:free` IDs |

Hard caps at rank 6 and 7 are one-shot budgets. Check the remainder before spending, and report what is left. Never let a task run past a cap because the model looked good.

## Antigravity

One paid Google AI Pro plan plus six free accounts. Switch accounts in the app; the plan does not change mid-session.

| # | Model | Effort | Pool | Availability |
| --- | --- | --- | --- | --- |
| AG-1 | Gemini 3.8 Flash | Low / Medium / High | Pro + all 6 free | confirmed in picker |
| AG-2 | Claude Opus 5.5 | tier not surfaced | Pro only | confirmed in picker |
| AG-3 | Claude Sonnet 5.5 | tier not surfaced | Pro only | confirmed in picker |
| AG-4 | Claude Opus 4.6 | default | 6 free accounts only | free tier model list |

Free accounts reach AG-1 and AG-4 only. No Neon, Argon, or Hydrogen there. Route free-account work to AG-1 or AG-4, and keep AG-2 / AG-3 for the Pro window.

## OpenCode

Seven providers behind one CLI. The provider prefix is part of the model ID.

### `opencode/*` — daily free tier

| # | Model ID | Effort | Notes |
| --- | --- | --- | --- |
| OC-1 | `opencode/beam-free` | Low → Max | 1M ctx |
| OC-2 | `opencode/big-pickle` | none | stealth, no effort control |
| OC-3 | `opencode/deepseek-v4.1-flash-free` | Low / High / Max | 200K ctx on free |
| OC-4 | `opencode/flint-40b-free` | — | `[unverified]` |
| OC-5 | `opencode/hy4-flash-free` | — | `[unverified]` |
| OC-6 | `opencode/iceman-free` | — | `[unverified]` |
| OC-7 | `opencode/longcat-2.5-free` | none | 1M ctx, slow |
| OC-8 | `opencode/mimo-v2.6-flash-free` | Low → Max | full effort ladder |
| OC-9 | `opencode/nemotron-3.5-lightning-free` | none | speed tier |
| OC-10 | `opencode/nemotron-3.5-super-vl-free` | Low → Extra High | 1M ctx |
| OC-11 | `opencode/tidepool-alpha-free` | — | `[unverified]` |

Gone since the last inventory: `Nemotron 3 Ultra`, `GLM-5.3-Flash` (now `freellmapi/glm-5.3-flash`).

### `google/*` — Google subscription

25 IDs. Reached with `GEMINI_API_KEY`. The operator states this is covered by the Google subscription, not per-token billing. **Unconfirmed** — a Studio key normally bills per token. Treat it as quota-bound and cheap-first until the usage page proves otherwise.

Usable set: `gemini-4-neon`, `gemini-4-argon`, `gemini-4-hydrogen`, `gemini-4-carbon`, `gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-pro-preview`, `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`, plus the `-latest` aliases. Research and computer-use previews are not coding models.

### `openrouter/*` — free tier

357 IDs visible, free tier only. Route only IDs ending `:free`; everything else is unavailable:

`openrouter/baidu/ernie-5.5-flash-preview:free`, `openrouter/google/gemma-4-26b-a4b-it:free`, `openrouter/google/gemma-4-31b-it:free`, `openrouter/inclusionai/ling-3.2-flash:free`, `openrouter/liquid/lfm-3-1.7b:free`, `openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`, `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free`, `openrouter/nvidia/nemotron-3.5-lightning:free`, `openrouter/nvidia/nemotron-3.5-super-vl:free`, `openrouter/particle-ai/particle-1:free`, `openrouter/recursive/flint-v1.0:free`.

The `~vendor/model-latest` aliases are paid routing shortcuts, not free tier.

### `freellmapi/*` — free router

| # | Model ID |
| --- | --- |
| FL-1 | `freellmapi/glm-5.3` |
| FL-2 | `freellmapi/glm-5.3-flash` |
| FL-3 | `freellmapi/kimi-k3` |
| FL-4 | `freellmapi/kimi-k2.6` |
| FL-5 | `freellmapi/deepseek-v4-flash-0731` |
| FL-6 | `freellmapi/gemini-3.8-flash` |
| FL-7 | `freellmapi/gemini-3.7-flash` |
| FL-8 | `freellmapi/gemini-3.6-flash` |
| FL-9 | `freellmapi/gemini-3.5-flash` |
| FL-10 | `freellmapi/claude-haiku-4-5` |
| FL-11 | `freellmapi/claude-sonnet-4-5` |
| FL-12 | `freellmapi/claude-opus-4-5` |
| FL-13 | `freellmapi/poolside-laguna-s-2.1` |
| FL-14 | `freellmapi/auto` |

Rate limited, order not guaranteed. `auto` picks by the router's own rule, so it cannot be priced.

### `inception/*` — 100M free tokens per month

| # | Model ID | Notes |
| --- | --- | --- |
| IN-1 | `inception/mercury-3` | 1M ctx, effort low/medium/high, fastest decode |
| IN-2 | `inception/mercury-2.5` | previous generation |
| IN-3 | `inception/mercury-2` | cheaper |
| IN-4 | `inception/mercury-edit-2` | edits only |

### `sail-ai-degen/*` — $5 free credit per month

| # | Model ID |
| --- | --- |
| SA-1 | `sail-ai-degen/deepseek-v4.1-flash-1017` |
| SA-2 | `sail-ai-degen/glm-5.3` |
| SA-3 | `sail-ai-degen/glm-5.3-balanced` |
| SA-4 | `sail-ai-degen/glm-5.3-flex` |
| SA-5 | `sail-ai-degen/kimi-k3` |

`sail-heshbon-zevel` mirrors these five IDs on a sibling account that is not in use. Ignore it.

## Freebuff

Time-based, not token-based. Starter is 21 h/day plus a 60 h monthly wallet that replaces unused bonus. Close sessions early to refund unused hours.

| # | Model | Hours | Notes |
| --- | --- | --- | --- |
| FB-1 | MiMo 2.6 Flash | 1 | cheapest capable |
| FB-2 | MiMo 2.6 Flash Fast | 2 | speed variant |
| FB-3 | MiMo 2.6 Pro | 5 | higher tier |
| FB-4 | DeepSeek V4.1 Flash | 3 | default build model |
| FB-5 | DeepSeek V4.1 Flash Fast | 5 | speed variant |
| FB-6 | Muse Spark 1.3 | 3 | standard tier |
| FB-7 | GLM 5.3 Flash | 4 | |
| FB-8 | GPT-6 Luna | 4 | weak tool use, slow first token |
| FB-9 | Claude Haiku 5.5 | 6 | 100K context, burns hours |
| FB-10 | Gemini 4 Argon | 20 | one session per day, promotional |
| FB-11 | DeepSeek V4.1 Flash 1017 | 5 | October refresh |
| FB-12 | Mercury 3 (BYOK) | free | Inception key, counts against IN-1's monthly cap |

## Not routeable

| Harness | Why |
| --- | --- |
| GitHub Copilot | authenticated in OpenCode but exposes no models. `opencode models` lists none, so nothing to route to. |
| Cline | removed 2026-11-22 — not in use |
| Hermes | removed 2026-11-22 — not in use |

## Update rules

1. Run `node scripts/models-sync.mjs` to list live IDs that have no row and rows that no longer exist.
2. Add a row only for an ID the command printed. Never add a model from memory or from a vendor page.
3. Delete a row the command no longer prints. Move it to the "gone" note in the same edit.
4. Capability lives in `capability.md`. This file holds availability and cost only.
5. New picker entries in the Antigravity and Freebuff apps are checked by hand and stamped with the date. No script reads those UIs.

## Update log

- 2026-11-22 — rebuilt from live enumeration. 421 OpenCode IDs across 7 providers; Antigravity reduced to 4 rows after the free-account correction; Cline and Hermes dropped; OpenRouter and Google documented for the first time; four new OpenCode free models added as `[unverified]`; three dead rows removed.
