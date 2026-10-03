# Todo — Issue #24

Branch: i24/correct-the-coderabbit-playbook-pr-23-disproved-three | Issue: #24

- [x] **T1** [S] [Docs/Research] — Replace the three disproved claims in
      `config/coderabbit/README.md:80-92` with the PR #23 measurements. Verify: `untested path`
      gone, `PR #23` present, still-valid passages intact.
- [x] **T2** [M] [Docs/Research] — Record the config-source finding (no root `.coderabbit.yaml`;
      `reviews.*` resolves from Organization UI) and its consequence for the sync model. Verify:
      `scripts/sync-coderabbit.ps1` untouched.
- [x] **Checkpoint A** — no claim contradicted by PR #23 remains; every claim cites its artifact.
- [x] **T3** [XS] [Docs] — Fix `config/coderabbit/.coderabbit.yaml:53-55`, comment lines only.
      Verify: `is the work of #7` gone, `auto_title_*` settings byte-identical.
- [x] **T4** [S] [Docs] — Note that `SUMMARY_ONLY` is a tier guard, not this repo's normal shape;
      run the gates. Verify: `FACTS-CORRECTED`, validator 0 fail / 0 warn, diff limited to 2 files.
- [x] **Checkpoint B** — acceptance command green; hand to Station IV (`iv-review-build-and-pr`).

> Built 2026-10-03: `FACTS-CORRECTED` printed; validator 90 skills / 0 fail / 0 warn; the three
> in-scope station scores held at 100; `scripts/sync-coderabbit.ps1` and every `skills/**` file
> untouched. This checklist is kept in sync with `tasks/plan.md` because `pipeline-triage` routes
> on it.