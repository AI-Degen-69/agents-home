---
name: vendor-due-diligence
description: "Use when deciding whether to trust or buy a product."
version: "1.0.0"
metadata:
  hermes:
    tags: [due-diligence, vendor-evaluation, trust-verification, product-review]
    related_skills: [research, grounded-citations]
---

# Vendor Due Diligence

## When to Use

The user links a product, bot, service, or paid tool and asks whether to trust it, buy it, or "what do you think" — or asks for questions to send a vendor before purchase. Common for trading tools, SaaS, and crypto-paid products.

## Core principle

The sales page is the claim, never the evidence. Every "proof" the vendor offers (testimonials, live demos, public profiles, changelog, videos) gets independently verified with live tools before you form a verdict. Report measured numbers and the vendor's own words — not adjectives.

## Procedure

1. **Read the whole page.** `web_extract` returns head+tail only; the full text is cached to disk. Paginate the omitted middle with `read_file` before analyzing — pricing, FAQ, payment terms, and refund policy hide there.
2. **Extract the money logic first.** What is sold, at what price, and what edge is claimed. Stress-test the mechanism itself (is the core economics real?), then separate mechanism from execution — vendor copy conflates the two, and execution difficulty is usually the real answer.
3. **Verify the trust claims with live checks:**
   - Linked public profiles/accounts: open each one. Compute ROI = total PnL / total volume. Sub-1% ROI on huge turnover = grinder economics, not alpha. Check open positions for live drawdown; check join dates for actual track-record length.
   - Changelog / release notes: recent entries with concrete technical detail = maintained; "planned release" placeholders = thin maintenance.
   - Videos: pull transcripts and frames with yt-dlp directly — exact commands in references/video-verification.md. Confirm the claimed content actually exists in the audio AND the frames, and cross-check the vendor's own words against the product being sold — a founder stating the strategy "no longer works" kills that product's pitch even while it stays in the store. For any streamed account screen, run the portfolio math-consistency check (same reference).
4. **Tabulate what you measured.** Show the arithmetic (ROI table), quote the vendor's own statements as evidence, and cite sources (URLs, video IDs, profile links). When video frames are evidence, report the exact numbers you read off them.
5. **Deliver:** verdict first → per-product logic check → verified evidence → red flags → recommendation tailored to the user's existing stack (never generic "it depends").
6. **Vendor-question package** (when asked): a short scan list in the user's language first, then the full vendor-facing message (English, or Russian when the vendor/community is Russian-speaking) in a copy-ready block, plus "how to read the answers" — which reply is a deal-breaker.

## Red-flag taxonomy

- **Pricing incoherence**: individual prices far above the bundle price → the bundle is the real price; individual numbers are inflated anchors.
- **No refunds + crypto-only payment** → no chargeback; the money is gone. Weigh every "trust us" answer against this.
- **Direct manual-wallet payment** ("send, then notify us") = zero buyer protection; steer to a processor/escrowed checkout.
- **Server-dependent updates** ("updates from our server") → ask whether the package is self-contained if the vendor disappears.
- **Inflated team claims** ("engineers from trading desks") vs solo-operator evidence in their own videos → discount every "production-grade" claim accordingly.
- **"Why sell a profitable product?"** → the answer is plausible for capacity-limited edges (market-making spreads decay under competition) and weak for directional-alpha claims. Judge per strategy type, not universally.
- **Label vs mechanism**: "arbitrage" for what is actually market-making, "non-stop live trading" streams with no trading audio — flag the gap between the marketing label and the verified mechanism.
- **Win-rate label inflation**: a pair-lock success rate (MM pairs bought below 1.00 "win" by construction) sold as "90% accuracy" on a directional market is a relabeled metric, not evidence — discount it toward the accounts' measured ROI.
- **Identical stream runtimes**: several "live non-stop" streams all ending within the same second = fixed-length recordings, not organic sessions — and identical durations are NOT proof of one recording re-uploaded (re-encoding changes hashes; read the on-screen numbers instead).
- **Claim oscillation**: the same vendor alternating honest disclaimers ("no 100% bot, losses are normal") with inflated claims ("90% accuracy", "faster than most traders") — discount the inflated claims toward the measured accounts, never the reverse.
- **PnL exceeding portfolio value**: implies withdrawals ≥ the difference — a real account extracting profits OR a fabricated page; indistinguishable without the wallet address, so it is a vendor question, not a verdict.

## Output shape (this user)

- Respond in Hebrew with ADHD-style formatting: verdict first, ≤5-item lists, emoji section headers, tables for measured numbers, one clear next step at the end.
- Evidence before opinion: your computed numbers and the vendor's own quotes come before your recommendation.
- Close with the concrete next move (send the questions, run the paper test, or walk away).
