# Live model inventory

What this machine can actually reach, at what cost, right now. **Generated, not hand-written.** IDs come from `opencode models` and each harness's own picker. Grep this file before recommending a model; if the ID is absent, the model is not available.

Last enumeration: **2026-11-22**. Refresh with `node scripts/models-sync.mjs` (see `--help`).

Grades are not here. `capability.md` carries them, keyed by the same IDs. An ID with no grade is `[unverified]` and cannot be a top pick.

## Quota order

Spend top to bottom. A row higher up costs less of what is scarce.

| Rank | Pool | Billing | Ceiling | Notes |
| --- | --- | --- | --- | --- |
| 1 | OpenCode free tier | free, daily reset 00:00 Asia/Jerusalem | daily request quota | 9 models, small context on some |
| 2 | Freebuff | hours per day | Starter: 21 h/day + 60 h/month wallet | unused hours refund when you close early |
| 3 | Antigravity free account | 6 free accounts | free-tier quota, smaller than Pro | only Gemini 3.8 Flash + Claude Opus 4.6 |
| 4 | GitHub Copilot Free | 200 chat requests per month | monthly request cap, no overage | CLI only, low model ceiling |
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

Four documented providers behind one CLI. The provider prefix is part of the model ID.

### `opencode/*` — daily free tier

| # | Model ID | Effort | Notes |
| --- | --- | --- | --- |
| OC-1 | `opencode/beam-free` | Low → Max | 1M ctx |
| OC-2 | `opencode/big-pickle` | none | stealth, no effort control |
| OC-3 | `opencode/deepseek-v4.1-flash-free` | Low / High / Max | 200K ctx on free, strongest free coder |
| OC-4 | `opencode/longcat-2.5-free` | none | 1M ctx, slow |
| OC-5 | `opencode/mimo-v2.6-flash-free` | Low → Max | full effort ladder |
| OC-6 | `opencode/nemotron-3.5-lightning-free` | none | speed tier |
| OC-7 | `opencode/nemotron-3.5-super-vl-free` | Low → Extra High | 1M ctx |
| OC-8 | `opencode/hy4-flash-free` | — | answers in ~7s, no benchmark |
| OC-9 | `opencode/tidepool-alpha-free` | — | answers in ~5s, no benchmark |
Dropped 2026-11-22: `flint-40b-free`, `iceman-free` (no evidence), `Nemotron 3 Ultra` (gone). `GLM-5.3-Flash` left the tier.
### `openrouter/*` — free tier

357 IDs visible, free tier only. Route only IDs ending `:free`; everything else is unavailable:

`openrouter/baidu/ernie-5.5-flash-preview:free`, `openrouter/google/gemma-4-26b-a4b-it:free`, `openrouter/google/gemma-4-31b-it:free`, `openrouter/inclusionai/ling-3.2-flash:free`, `openrouter/liquid/lfm-3-1.7b:free`, `openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`, `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free`, `openrouter/nvidia/nemotron-3.5-lightning:free`, `openrouter/nvidia/nemotron-3.5-super-vl:free`, `openrouter/particle-ai/particle-1:free`, `openrouter/recursive/flint-v1.0:free`.

The `~vendor/model-latest` aliases are paid routing shortcuts, not free tier.

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

## GitHub Copilot

Plan: **Free** (`free_limited_copilot`, individual). Quota is **200 chat requests per month**, 177 remaining at the last read (2026-11-22), token-based billing on, no overage allowed. Endpoint: `api.individual.githubcopilot.com`.

The catalog lists 43 models. The plan enables **7**:

| # | Model ID | Class |
| --- | --- | --- |
| CP-1 | `gpt-5.6-luna` | lightweight |
| CP-2 | `gpt-6-luna` | lightweight |
| CP-3 | `claude-haiku-4.5` | lightweight |
| CP-4 | `mai-code-2-flash` | lightweight |
| CP-5 | `mai-code-1.1-flash` | lightweight |
| CP-6 | `gpt-4.1` | versatile |
| CP-7 | `gpt-4.1-2025-04-14` | same model, dated alias |

Blocked on this plan: Opus 5.5, Sonnet 5.5, Fable 5.2, GPT-6.1 Sol, GPT-6 Astra, Gemini 4 Argon, Kimi K3, and 25 others. Do not recommend them — the account cannot call them.

**Not in OpenCode.** The provider authenticates but exposes no `github-copilot/*` IDs, because the free-plan models are absent from the picker that OpenCode reads. Reachable through the Copilot CLI (`npm i -g @github/copilot`) only. Until `opencode models` lists them, route them as a manual step, never as an OpenCode model.

## Not routeable

| Harness | Why |
| --- | --- |
| Cline | removed 2026-11-22 — not in use |
| Hermes | removed 2026-11-22 — not in use |

## Update rules

1. Run `node scripts/models-sync.mjs` to list live IDs that have no row and rows that no longer exist.
2. Add a row only for an ID the command printed. Never add a model from memory or from a vendor page.
3. Delete a row the command no longer prints. Move it to the "gone" note in the same edit.
4. Capability lives in `capability.md`. This file holds availability and cost only.
5. New picker entries in the Antigravity and Freebuff apps are checked by hand and stamped with the date. No script reads those UIs.

## Update log

- 2026-11-22 — pass 1 review with the operator. Dropped `flint-40b-free` and `iceman-free`; probed `hy4-flash-free` (7s) and `tidepool-alpha-free` (5.3s), both unproven and graded C. Removed the `google/*` and `freellmapi/*` surfaces from routing. OpenCode free tier is now 9 rows.
- 2026-11-22 — rebuilt from live enumeration. 421 OpenCode IDs across 7 providers; Antigravity reduced to 4 rows after the free-account correction; Cline and Hermes dropped; OpenRouter documented for the first time; three dead rows removed.
