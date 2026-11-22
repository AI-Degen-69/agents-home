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
| 3 | Antigravity free account | 6 free accounts | free-tier quota, smaller than Pro | Gemini 3.8 Flash only after Nov 30 |
| 4 | Antigravity Pro | one Google AI Pro plan | **two buckets**: Gemini; Claude + GPT. Each 5-hour + weekly | best models live here; bank it for hard work |
| 5 | Inception | 100M free tokens per month, then stop | monthly token cap, never exceeded | no payment beyond the free grant |
| 6 | sail-ai-degen | $5 free credit per month | monthly dollar cap, never exceeded | no payment beyond the credit |
| 7 | OpenRouter | free tier | free-tier rate limit | route only `:free` IDs |

Hard caps at rank 6 and 7 are one-shot budgets. Check the remainder before spending, and report what is left. Never let a task run past a cap because the model looked good.

## Antigravity

One paid Google AI Pro plan plus six free accounts. **Two quota buckets, not one:** the
Gemini models draw on a Gemini bucket, and the Claude and GPT models draw on a separate
bucket. Each has a five-hour window and a weekly window. Burning a Claude run does not
touch the Gemini pool, so an Orchestrator run that plans on Claude and executes on Hydrogen
splits its cost across both.

### Models

| # | Model | Thinking | Plan | Note |
| --- | --- | --- | --- | --- |
| AG-1 | Gemini 3.8 Flash | Low / Medium / High | Free, Pro, Ultra, Enterprise | the only model left on Free after Nov 30 |
| AG-2 | Claude Opus 5.5 (Thinking) | Low / Medium / High | Pro, Ultra, Enterprise | can be the planner |
| AG-3 | Claude Sonnet 5.5 (Thinking) | Low / Medium / High | Pro, Ultra, Enterprise | can be the executor |
| AG-4 | Claude Opus 4.6 (Thinking) | Low / Medium / High | Free and Pro | **removed Nov 30, 2026** |
| AG-5 | Gemini 4 Neon | Low / Medium / High / Extra | Pro, Ultra | default model; 512K ctx here, not 1M |
| AG-6 | Gemini 4 Argon | Low / Medium / High | Pro†, Ultra | can be the planner |
| AG-7 | Gemini 4 Hydrogen | Low / Medium / High / Extra | Pro, Ultra | default executor |
| AG-8 | GPT-OSS 120B | Medium only | Free and Pro | **removed Nov 30, 2026** |
| AG-9 | Claude Sonnet 4.6 (Thinking) | Low / Medium / High | Free and Pro | **removed Nov 30, 2026** |
| AG-10 | Gemini 4 Carbon | Low / Medium / High | **Ultra only** | shows Unavailable on Pro |

Enterprise-only rows: Gemini 3.7 Flash, Gemini 3.6 Flash, Gemini 3.1 Pro.

Free accounts reach AG-1, AG-4, AG-8 and AG-9 today, and **only AG-1 after Nov 30, 2026**.
That is B at best, so every S and S+ path needs the paid Pro plan.

Tiers are Low / Medium / High / Extra. Medium is the default on every Gemini 4 row.

### Orchestrator — two roles, one conversation

Not a model. It pairs a **planner** with an **executor** inside one session.

| Role | What it does | Supported |
| --- | --- | --- |
| Planner | explores the codebase, writes the plan, reviews progress, answers questions | Gemini 4 Neon (default), Gemini 4 Carbon, Gemini 4 Argon, Claude Opus 5.5 |
| Executor | searches, edits files, runs builds and tests, verifies against the plan | Gemini 4 Hydrogen (default), Claude Sonnet 5.5 |

- Defaults: **Settings > Models > Orchestrator Settings**. Per-conversation planner override:
  hover Orchestrator in the App. The palette picks the **planner only** — the executor is set
  in Orchestrator Settings, not in that menu.
- On a **Pro plan the planner palette shows three rows: Neon, Argon, Claude Opus 5.5.** Carbon
  exists in the docs list but is Ultra-only, so it never appears on Pro. The row label shows the
  current default and its tier, for example `Orchestrator · Gemini 4 Neon Extra`.
- **CLI is out of scope.** This skill routes the Antigravity desktop app only, because that is
  the surface in use. Ignore CLI-tier notes in vendor pages.
- Enterprise: Carbon High + Hydrogen High, fixed. Not your plan.
- Flow: read-only plan → executor implements → control returns on friction (a verification
  failing twice, an interface that behaves differently, a design choice the plan left open)
  → planner repairs the plan and hands back. On long tasks the planner reviews progress, and
  it reviews again whenever you send a message.
- A question, review, or explanation is answered by the **planner directly**. It is not
  delegated to the executor.
- Vendor measure: Terminal-Bench 4.1 near-Carbon task success, **24% less quota, 19% faster**.

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

| # | Model ID | Grade | Note |
| --- | --- | --- | --- |
| OR-1 | `openrouter/particle-ai/particle-1:free` | D | base-class accuracy, ~45% fewer tokens; 1.4s probe; vendor-only evidence |
| OR-2 | `openrouter/baidu/ernie-5.5-flash-preview:free` | C | 280B/14B active, 1M ctx, preview; 2.2s probe |
| OR-3 | `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` | C | AA 12 |
| OR-4 | `openrouter/nvidia/nemotron-3.5-super-vl:free` | C | AA 14, verbose |

Dropped 2026-11-22 from this surface: gemma-4-31b, gemma-4-26b-a4b, ling-3.2-flash, flint-v1.0, lfm-3-1.7b, nemotron-3.5-lightning, nemotron-3-nano-omni. None showed coding evidence above the free bar.

The `~vendor/model-latest` aliases are paid routing shortcuts, not free tier.

### `inception/*` — 100M free tokens per month

| # | Model ID | Notes |
| --- | --- | --- |
| IN-1 | `inception/mercury-3` | 1M ctx, effort low/medium/high, fastest decode |

Only `mercury-3` is routed. The older generations and the edit-only model are dropped. **Data policy:** Inception trains on prompts by default. Use it for public or throwaway code only, and confirm the dashboard toggle is off before anything private.

### `sail-ai-degen/*` — $5 free credit per month

| # | Model ID | Notes |
| --- | --- | --- |
| SA-1 | `sail-ai-degen/deepseek-v4.1-flash-1017` | 2.6s probe, DeepSeek 1017 refresh |
| SA-2 | `sail-ai-degen/glm-5.3` | 4.6s probe |
| SA-3 | `sail-ai-degen/glm-5.3-balanced` | 16.2s probe, slow tier |

Probed 2026-11-22. Two listed IDs are broken and stay out: `glm-5.3-flex` rejects synchronous calls (flex is batch only), and `kimi-k3` returns `model not supported` from the upstream backend.

`sail-heshbon-zevel` mirrors these five IDs on a sibling account that is not in use. Ignore it.

## Freebuff

Time-based, not token-based. Starter is 21 h/day plus a 60 h monthly wallet that replaces unused bonus. Close sessions early to refund unused hours.

Six rows, hand-checked in the app on 2026-11-22. **Nothing here grades above B.**

| # | Model | Hours | Notes |
| --- | --- | --- | --- |
| FB-4 | DeepSeek V4.1 Flash | 2 | cheapest slice at B; recommended default |
| FB-6 | Muse Spark 1.3 | 3 | best measured score, tied at 36 |
| FB-5 | DeepSeek V4.1 Flash Fast | 3 | speed variant of FB-4 |
| FB-8 | GPT-6 Luna | 4 | weak agentic coding, slow first token |
| FB-9 | Claude Haiku 5.5 | 6 | 100K context, burns hours |
| FB-13 | Muse Ember | 6 | new; 1M ctx, 115M tokens/task |

Dropped from the roster on 2026-11-22: MiMo 2.6 Flash, MiMo 2.6 Flash Fast, MiMo 2.6 Pro, GLM 5.3 Flash, Gemini 4 Argon, DeepSeek V4.1 Flash 1017, and Mercury 3 BYOK. Argon was the only S model here, so Freebuff is now overflow capacity for B work only. Its S and S+ work moved to Antigravity AG-6.

The $8/mo Starter is **kept** with that cut (operator decision, 2026-11-22). 2 h for FB-4 is still the cheapest way to run a real task without touching either Antigravity window.

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

- 2026-11-22 — pass 6 review. Freebuff roster hand-checked in the app: six rows remain out of twelve. Gemini 4 Argon, MiMo, GLM 5.3 Flash, DeepSeek 1017 and Mercury 3 BYOK are gone; Muse Ember is new at 6 h. Nothing on the surface grades above B now.
- 2026-11-22 — pass 4 review. OpenRouter closes at four rows: Particle-1, ERNIE 5.5 Flash Preview, Nemotron 3 Ultra, Nemotron 3.5 Super VL. Seven free IDs dropped for lack of coding evidence.
- 2026-11-22 — pass 3 review. Inception keeps only `mercury-3`; the older generations and the edit-only model are dropped.
- 2026-11-22 — pass 2 review. Probed all five sail IDs: three answer, `glm-5.3-flex` and `kimi-k3` fail at the API. Copilot removed — its chat endpoint rejects every model this token reaches.
- 2026-11-22 — pass 1 review with the operator. Dropped `flint-40b-free` and `iceman-free`; probed `hy4-flash-free` (7s) and `tidepool-alpha-free` (5.3s), both unproven and graded C. Removed the `google/*` and `freellmapi/*` surfaces from routing. OpenCode free tier is now 9 rows.
- 2026-11-22 — rebuilt from live enumeration. 421 OpenCode IDs across 7 providers; Antigravity reduced to 4 rows after the free-account correction; Cline and Hermes dropped; OpenRouter documented for the first time; three dead rows removed.
