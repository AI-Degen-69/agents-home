# TODO — Issue #30 (branch `i30/grade-null-sink-guard-test`)

- [ ] **T1** [S] `[Research/Docs]` — write `docs/issues/30-caller-audit.md` enumerating every
      `--out` caller. Verify: recorded count matches a fresh grep. `Depends on: —`
- [ ] **T2** [M] `[Docs]` — append the reserved-name decision + anchor rationale to the guard
      docblock in all 12 `skills/*/scripts/grade.js`. Verify: guard-block md5 identical across
      all 12; `grade.js case` still runs. `Depends on: T1`
- [ ] **T3** [S] `[Code/Debug]` — add `scripts/grade-null-sink-test.sh` with scenarios A–D.
      Verify: `bash scripts/grade-null-sink-test.sh` → exit 0, 4 PASS, 0 FAIL.
      `Depends on: T1, T2`
- [ ] **T4** [XS] `[Debug]` — anti-cheat: mutate a sandbox copy to remove the guard, prove
      scenario A fails. Verify: mutated run exits non-zero. `Depends on: T3`

Checkpoints: after T2, after T4.