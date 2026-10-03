# Todo — Issue #7

Branch: i7/hand-pr-titles-the-review-allowance-and-resolve-to | Issue: #7

- [ ] **T1** [S] [Docs/UX-Copy] — Station IV hands the PR title to CodeRabbit
      (`iv-review-build-and-pr/SKILL.md:144-150`). Verify: Conventional-Commits grammar gone,
      score >= 100.
- [ ] **T2** [M] [Docs/UX-Copy] — Four-outcome ack classification + plan-gated allowance probe
      (`iv-review-build-and-pr/SKILL.md:164-169, 191`). Verify: `@coderabbitai rate limit` present
      and documented, existing evals still match, body <= 250 lines.
- [ ] **Checkpoint A** — Station IV contract internally consistent; four statuses reported.
- [ ] **T3** [M] [Docs/UX-Copy] — Station V: `resolve` before merge, `configuration` probe,
      false-clean-pass guard (`merge-and-reset.md:19-25`, `review-loop.md:100-105`,
      `triage-and-apply.md:87-95,121`). Verify: `@coderabbitai resolve` reachable from the station
      contract, existing V assertions still match, score >= 100.
- [ ] **T4** [S] [Docs] — `pipeline-triage/SKILL.md:58` trigger wording consistent; run the gates.
      Verify: `WIRING-OK`, validator 0 fail / 0 warn, three scores >= 100.
- [ ] **Checkpoint B** — acceptance command green; hand to Station IV (`iv-review-build-and-pr`).
