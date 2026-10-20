# Models Research Handbook

A reusable, evidence-first method for evaluating any AI model before routing
work to it. System-agnostic: it applies whether models are priced per token,
per hour, per subscription quota, or free tier. No model earns a capability
tier from memory, marketing, or a single anecdote — only from calibrated data
plus a light street-check.

## 1. Guiding principles

1. **Calibrated yardstick first.** One independent, cross-model index anchors
   every comparison. Vendor numbers and community praise are interpreted
   against it, never instead of it.
2. **Pass rates over adjectives.** "Fast", "smart", "beats the frontier" are
   not evidence. Versioned benchmark scores with pass@1 percentages are.
3. **Source hierarchy is explicit.** Independent re-runs outrank vendor cards.
   Multiple independent community reports outrank one. A sponsored article
   outranks nothing.
4. **Conflicts are surfaced, not resolved silently.** When sources diverge,
   record both, nominate the most authoritative as primary, and flag it.
5. **Absence of evidence caps the grade.** A model with no public benchmarks
   is unverified — probe-only, never trusted with an irreversible final step.
6. **Tiers describe the work, not the hype.** Final output maps task classes
   (planning, build, review, mechanical execution, research, final check) to
   the minimum tier that clears them, with evidence cited per tier.

## 2. Evidence hierarchy (strongest to weakest)

| Rank | Source type | Weight |
|---|---|---|
| 1 | Independent cross-model index (e.g. Artificial Analysis Intelligence / Coding / Agentic indices) | Primary — anchors the tier |
| 2 | Independent third-party re-runs with pass@1: SWE-bench (Verified / Pro / Multilingual), LiveCodeBench, CyberGym, AutomationBench, OSWorld | Strong — confirms or adjusts tier |
| 3 | Vendor model card with methodology + raw numbers | Signal — never sufficient alone |
| 4 | Open-weight artifacts (weights, license, context, schema) + playground comparisons (e.g. OpenRouter compare) | Context — bounds fit |
| 5 | GitHub issues / discussions / release threads | Light — failure patterns only |
| 6 | Reddit / forum consensus (multiple independent reports, same direction) | Light — corroboration only |
| 7 | Press / blog / video reviews | Zero by default — numbers or nothing |

Tiers are set by ranks 1–2, bounded by rank 4, nudged by 5–6, never set by
3 or 7 alone.

## 3. Where to get the data

### 3.1 Primary yardstick — read first (prefer API/MCP on Free; page-read only what Free omits)

- **Preferred: AA Data API / MCP (Free tier covers this step).**
  Same data either way; MCP gets double quota. Use whichever fits the session:
  - **MCP (interactive):** server `https://mcp.artificialanalysis.ai/mcp`, OAuth
    sign-in, no key. Works in any MCP client with remote servers. Free = 200
    tool calls / 24h window; Pro = 1,000. Ask in natural language
    (e.g. "highest Intelligence Index under $1/M input tokens?", "compare the
    three fastest on speed + price"). Agent looks up the OpenAPI spec itself.
  - **REST (scripts / unattended):** base `https://artificialanalysis.ai/api/v2`,
    key in `x-api-key` header. Free = 100 req / fixed 24h window; Pro = 500.
    Backend agents use REST (MCP needs a human OAuth sign-in).
    Free endpoint: `GET /language/models/free` — paginated (`?page=N`),
    envelope `{tier, pagination, data}`, quota headers `X-AA-Tier`,
    `X-RateLimit-Limit/Remaining/Reset`, `Retry-After` on 429.
  - **What Free covers:** headline Intelligence / Coding / Agentic indices, the
    six Capability Indexes, median performance, input/output prices,
    `intelligence_index_version` (currently v4.3.2 — record it; compare scores
    only within the same major version), slug, release date. Null = not
    measured, never zero.
  - **What Free omits (still page-read):** full eval set, token counts, blended
    pricing, percentiles, context window, params, modalities, licensing,
    provider detail. Those need Pro (`GET /language/models`,
    `GET /language/models/{slug}`) or the model page below.
  - **Attribution required** on all tiers (visible AA byline/link) + Data
    Platform Terms apply.
- **Fallback / supplement — AA model page:** `https://artificialanalysis.ai/models/<slug>`.
  Use for whatever Free omits (context window, full eval breakdown, TB 2.1 vs
  4.0 splits) and for Pro-only fields when no Pro key exists. Record
  Intelligence Index, Coding / Agentic scores, speed (tok/s), cost tier,
  verbosity (tokens/task), context window. Cite slug + URL + date read.
- **AA leaderboards / articles:** contextualize the score (median for weight
  class, rank among peers). Frontier read (§5.1 step 1) may come from
  `GET /language/models/free` (top Intelligence Index = F) instead of the
  leaderboard page.

### 3.2 Hard benchmarks — versioned pass@1 numbers

Always record benchmark version + percentage + source + vendor/independent tag.
Core suites for coding/agent routing:

- Long-horizon agentic coding: DeepSWE (v1.1+), Terminal-Bench (2.1 and 4.0
  separately), SWE-Bench Verified.
- Reasoning / knowledge: Humanity's Last Exam (HLE-Verified), GPQA Diamond.
- Tool-use / automation: CyberGym, AutomationBench, Agent's Last Exam.
- Efficiency: output tokens/task, time-to-first-token, tok/s — bound routing
  cost even though they don't set capability tier.

- **AA-Briefcase, GDPval, SciCode** for knowledge-work coverage.

Find them on the AA model page first, then the vendor card (tag vendor), then
independent re-runs (tag re-runner + date).

### 3.3 Deployability envelope

- Weights + license (MIT / Apache / custom / proprietary).
- Exact-tier context window (free tiers are often capped below paid — verify
  per tier, never assume parity).
- Modalities (text, image, video, audio, PDF).
- Reasoning/effort controls exposed (none / low / medium / high / max).
- Cost basis in operator's unit (per-token, per-hour, per-session, quota
  window + reset cadence, sessions/day caps, promotional limits).

### 3.4 Street check — Git, Reddit, community (light weight)

Catches what benchmarks miss (broken tool-calling, degraded free tiers,
verbosity, latency, data-policy concerns):

- **GitHub:** search model org repo + harness repos. One report = anecdote
  (note it). Three-plus same direction = pattern (adjust confidence, flag it).
- **Reddit / forums:** same rule. Multiple independent threads converging =
  pattern. Single viral post = anecdote. Record links + dates.
- **Weight cap:** street corroborates or cautions; never promotes a full tier
  above benchmark evidence, never rescues unverified from probe-only.

### 3.5 Articles and press — guilty until proven innocent

Reject outright when any hold: sponsored/affiliate/vendor-affiliated without
methodology; single cherry-picked bench with no version or baseline; "beats
X" with no independent re-run link; no date, version, or harness detail.
Accept only pieces citing re-runnable numbers or corroborating ranks 1–2 —
and cite the numbers, not the adjectives.

## 4. Conflict and gap rules

- **Score conflict:** record every figure with source + date. GA / canonical
  model page outranks pre-release partner posts and launch blogs. Flag until
  sources converge.
- **Unconfirmed weights — with a B-cap for the no-yardstick case:** when the serving tier's weights are unknown or
  differ from the benchmarked tier (e.g. a Contributor tier with capped
  reasoning and no own benches), the benchmarked numbers serve as an explicit
  ceiling proxy, labeled as proxy. Grade from the ceiling minus only the
  *measured or vendor-stated* caps — and when there is **no yardstick page at
  all** for the tier (neither its own nor a same-weights page), street evidence
  alone caps the grade at **B**, never above, until a yardstick lands.
- **Unknowns:** state what's unknown and price the risk instead of assuming
  the favorable value.
- **Anonymous / stealth models:** a model served under a placeholder name with
  no vendor, no card, and no yardstick page is unverified by definition —
  probe-only, never graded above B on street evidence alone. When the vendor
  later reveals the identity, re-run the full method under the canonical name
  and rename the entry; keep one alias line for traceability.

## 5. From evidence to tier

Ladder (adapt labels locally; keep ordering): **S+** reserve (irreversible work;
strongest evidence + clean street; usually empty) — **S** top (build, planning,
review) — **A** competent (scoped edits, tests decide) — **B** light/probe
(mechanical, babysitting) — **C** weak fit (guardrails only) — **D /
unverified** do-not-route (probe-only, never a final step).

### 5.1 Global anchoring (mandatory — every research run)

Never grade a model against only the local inventory, and never against a
stale frontier. Tiers are offsets from the **live** yardstick top, recomputed
every run:

1. **Read the frontier first.** Fetch the live AA leaderboard; record the top
   Intelligence Index score (= F), the frontier cluster shape, and the date.
   (Reference stamp: Oct 20 2026 → F = 58; cluster 52–58; slope 38–48; tail
   below. That stamp expires — it is an example, not the scale.)
2. **Check the clusters.** Note where the population bunches and where it
   slopes — clusters confirm the bands still fit; a new cliff or a compressed
   slope means re-read the bands, not just the numbers.
3. **Recompute bands from F:**
   - **S+ (reserve):** F−8 … F. Only these clear irreversible-final-step work.
   - **S (top):** F−13 … F−9. Clears builds, planning, review — never reserve.
   - **A (competent):** F−20 … F−14. Well-scoped edits where tests decide;
     stronger members stretch to supervised builds with guardrails.
   - **B (light/probe):** F−33 … F−21, **or** no yardstick page but solid
     independent street numbers. Mechanical work, babysitting, passes.
   - **C (weak fit):** below B with yardstick evidence, or single-runner
     indie with known collapses. Guardrails only.
   - **D / unverified:** no yardstick, no independent pass@1 — probe-only,
     regardless of F.
4. **Drift rule:** if F moved ≥3 pts since the last board stamp, flag the
   whole board for a re-tier before grading the new model — old grades are
   stale, not wrong. A rising frontier demotes yesterday's B to today's C by
   design: tiers state where a model stands on Earth *today*, timestamped,
   never a lifetime title.
5. **Then run the method.** Anchor the candidate on the yardstick (rank 1) →
   confirm/demote with versioned pass@1 (rank 2) → bound by deployability
   (rank 4) → adjust confidence with street (ranks 5–6) → write the
   justification → pin optimal tasks from the §6 matrix. Every claim carries
   its source; the grade carries the F-stamp it was computed against.

## 6. Tier to task-class matrix (sketch first, pin models after)

| Task class | Minimum tier | Rationale |
|---|---|---|
| Planning / strategy | S | Weak plan corrupts downstream |
| Long-horizon agentic coding (build) | S | Multi-step tool use; weak agents stall |
| Multi-step review / audit | S | Catches subtle invariant breaks |
| Well-scoped edits (tests decide) | A | Tests arbitrate; competence suffices |
| Mechanical execution / babysitting | B | Locked plan; cheapest capable wins |
| Research / extraction | S or A* | S when feeding irreversible calls; A when human re-checks |
| Final irreversible verification | S+ | Reserve only; none available = human or cross-check |

## 7. Recording template (per model)

```md
### <Model> (<ID>) — evidence and tier justification

- Release / params / context / license / modalities:
- Cost / quota envelope (this system):
- Primary yardstick: AA <n> (Coding <n> / Agentic <n>) — <slug URL> — <date>
- Hard numbers (versioned): <bench> <ver> — <%> (<source, vendor/indep, date>)
- Street check: <pattern or none> — <links + dates>
- Conflicts / gaps: <figures + primary + flag>
- Caps / caveats: <ctx, verbosity, latency, sessions/day, data policy>
- Verdict: earns <tier>. <May / may-not route line.>
```

### Worked miniature (shape, not content)

> Model X, 300B MoE, 1M context, MIT. AA Intelligence 38 (4/4). DeepSWE 74.2
> (independent re-run, v1.1) beating two frontier baselines; Terminal-Bench 4.0
> 24% (weaker on longest suites). Street: three independent reports of strong
> agentic coding, one of verbosity. Verdict: S for builds and planning with a
> verbosity guardrail; not S+ (TB4 gap + no reserve-grade street record).

## 8. Pre-publish checklist

- [ ] Yardstick read in-session, cited with slug/URL + date (API/MCP slug +
  `intelligence_index_version` counts as citation; page URL only for
  Free-omitted fields).
- [ ] Every pass@1 carries version + source + vendor/independent tag.
- [ ] No "beats X" without independent re-run or AA backing.
- [ ] Conflicts recorded, primary nominated, flag set.
- [ ] Free-tier gaps handled without back-inference from Max.
- [ ] Street linked with dates; patterns vs anecdotes distinguished.
- [ ] Articles rejected per 3.5 or cited for numbers only.
- [ ] Matrix updated; unverified barred from final steps.

## 9. Verified site catalog

Each site below was fetched and its Focus / Why-useful claims checked before
trusting. Two corrections are baked in: the LMArena canonical URL
(`lmarena.ai`, not a search URL) and METR (horizon/risk research, not a model
leaderboard). Blog/press URLs that 404 or rate-limit are cited as
headline-only, never as data.

### 9.1 General and composite benchmarks

- **Artificial Analysis** — Data API / MCP first, pages second.
  API: `GET /language/models/free` (Free: headline Intelligence / Coding /
  Agentic indices, 6 Capability Indexes, median perf, input/output prices,
  `intelligence_index_version`; paginated; key in `x-api-key`; 100 req / 24h).
  MCP: `https://mcp.artificialanalysis.ai/mcp` (same data, OAuth, 200 calls /
  24h, NL prompts). Pull: indices + version + prices + slug + release date.
  Pages (`.../leaderboards/models` + `.../models/<slug>`) only for what Free
  omits: context window, full eval set, TB 2.1 vs 4.0 splits, tok/s, TTFT,
  $/task, verbosity (tokens/task).
  The primary yardstick (rank 1). Limit: scores reflect paid-tier serving;
  free tiers are frequently absent — proxy rules (§4) apply.
- **LMArena** (`lmarena.ai`). Blind crowdsourced A/B, Bradley-Terry Elo, with
  Coding / Hard Prompts / Vision sub-boards. Pull: Elo overall + sub-board.
  Human-preference signal, not capability proof — never sets a tier alone.
- **Stanford HELM** (`crfm.stanford.edu/helm`). Academic multi-metric suite
  (accuracy, robustness, bias, toxicity, calibration). Pull: robustness/safety
  caveats other boards miss. Slow-moving by design — a complement, not the
  anchor.

### 9.2 Software engineering and agentic capabilities

- **SWE-bench family** (`swebench.com`): Verified (500), Pro V2 + HARD,
  Pro V2 + HARD, Multilingual, Multimodal, Lite. Real GitHub issues, not
  memorized snippets. Pull: % Resolved **plus the harness** (mini-SWE-agent
  vs Codex vs Claude Code) — same-model scores differ by harness, so
  cross-vendor tables without a named harness are not comparable.
- **LiveCodeBench** (`livecodebench.github.io`). Timestamped
  contest problems (LeetCode/AtCoder/Codeforces) for contamination-free coding
  scores, plus self-repair / execution / test-prediction scenarios. Pull:
  post-cutoff scores for models newer than the problem set.
- **Berkeley BFCL** (`gorilla.cs.berkeley.edu/leaderboard.html`, V4). AST +
  execution accuracy, FC vs Prompt mode,
  cost/latency columns. The tool-use reference for anything routed as an
  agent with external tools.
- **Scale Labs leaderboards** (`labs.scale.com/leaderboard`): 20+ private, refreshed sets (HLE Diamond, SWE-Bench Pro V2/HARD, SWE Atlas,
  MCP Atlas, Remote Labor Index) with ±CI. Pull: contamination-resistant
  scores. Note: a model's absence here is data about coverage, not evidence
  of weakness.

### 9.3 Advanced reasoning and expert knowledge

- **HLE (Humanity's Last Exam)** (`agi.safe.ai`): 2,500
  expert questions, published, Diamond + Rolling forks.
  Frontier accuracy still low — exactly why it replaced saturated MMLU/GSM8K.
  Pull: accuracy + calibration
  error; use as knowledge ceiling, never as a coding grade.
- **METR** (`metr.org`). Not a model leaderboard. A nonprofit
  measuring autonomy via task-completion time horizons (TH 1.0/1.1) plus
  frontier-risk reports. Use for horizon context ("how long a task can agents
  hold"), never for tier-setting.
- **Scale SEAL** folded into §9.2 above (Scale Labs = the live SEAL surface).

### 9.4 Open-source, embeddings, multimodal and factuality

- **Hugging Face + MTEB** (`huggingface.co/spaces/mteb/leaderboard`). Pull:
  retrieval NDCG@10 for RAG routing, OpenVLM for vision, weight repo +
  license for deployability. Never a coding-tier source.
- **Vectara HHEM leaderboard** (`github.com/vectara/hallucination-leaderboard`).
  HHEM-scored hallucination rate when summarizing short docs. Pull:
  hallucination % + factual-consistency % for any model routed to
  summarization/RAG. Cite the repo/HF board, not press write-ups.

### 9.5 Verification note

Every Focus / Why-useful claim above was checked live before believing it
(run: 2026-10-20): AA leaderboard + model page fetched; SWE-bench family
counts confirmed; BFCL version + date confirmed; Scale Labs boards + CI
confirmed; HLE size + publication confirmed; LiveCodeBench contamination
design confirmed; METR corrected from "leaderboard" to "horizon/risk
research". Re-verify any entry before depending on it — boards drift.


