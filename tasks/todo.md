# TODO — Issue #30 (branch `i30/grade-null-sink-guard-test`)

- [x] **T1** [S] `[Research/Docs]` — write `docs/issues/30-caller-audit.md` enumerating every
      `--out` caller. Verify: recorded count matches a fresh grep against `origin/main` (49 hits,
      4 per `grade.js` x 12 + 1 in the #26 notes). `Depends on: —`
- [x] **T2** [M] `[Docs]` — append the reserved-name decision + anchor rationale to the guard
      docblock in all 12 `skills/*/scripts/grade.js`. Verify: guard-block md5 identical across
      all 12; `grade.js case` still runs. `Depends on: T1`
- [x] **T3** [S] `[Code/Debug]` — add `scripts/grade-null-sink-test.sh` with scenarios A–D.
      Verify: `bash scripts/grade-null-sink-test.sh` → exit 0, **20 PASS, 0 FAIL**.
      `Depends on: T1, T2`
- [x] **T4** [XS] `[Debug]` — anti-cheat: mutate a sandbox copy to remove the guard, prove the
      suite goes red. Verify: mutated run exits 1 with 12 failures. `Depends on: T3`

Checkpoints: after T2 (12/12 docblocks updated, blocks byte-identical), after T4 (test proven
non-vacuous).

## Corrections made at Station IV

- **Caller count 37 → 49.** The Station II grep piped through a `grep -v output` filter that
  silently dropped 12 legitimate hits. Recounted against `origin/main` with no filter; the audit
  doc and `tasks/plan.md` now carry 49 and the per-category breakdown that produces it.
- **"Nothing written" assertion was path-specific.** It built `$T//dev/null` for the `/dev/*`
  scenarios and asserted on one guessed path. Now diffs the sandbox listing before/after each run.
- **`/dev/nul` was writing outside the sandbox.** Git Bash rewrites it to
  `C:/Program Files/Git/dev/nul`; node then opened that path as the Windows `NUL` device. Scoped
  `MSYS_NO_PATHCONV=1` to `/dev/*` arguments only, so node receives the literal value the guard is
  written to match and nothing is written into the Git installation.