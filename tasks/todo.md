# TODO — Issue #26

Branch: i26/give-the-clean-exit-gate-an-explicit-owner-for-mer | Issue: #26

- [ ] **T1** [S] [Docs] — `skills/vi-close-pipeline/SKILL.md:117`: check 5 observes `git ls-remote --heads origin`; a surviving merged branch FAILS; add the remote branch to the Blocked list. Depends on: —
- [ ] **T2** [M] [Docs] — `merge-and-reset.md:22,61-64`: annotate `--delete-branch` as best-effort; explicit `git push origin --delete` AFTER the `MERGED` confirm and AFTER local `-D`; report deleted / already gone / declined. Depends on: —
- [ ] **T3** [XS] [Docs] — `v-babysit-pr-and-merge/SKILL.md:113`: station contract mentions the remote delete. Depends on: — (must match T2)
- [ ] **T4** [XS] [Docs] — `vi-close-pipeline/README.md:40`: "no dead branches" → server-observed wording; `:25` untouched. Depends on: — (must match T1)
- [ ] **T5** [M] [Code/Docs] — `scripts/remote-branch-ownership-test.sh`: scenario A (verdict must FAIL on a stray merged branch), B (ordering by line number), C (no `--delete-branch` claim). Depends on: T1, T2, T3, T4

**Checkpoint A** — after T1+T2.
**Checkpoint B** — after T5: `BRANCH-OWNERSHIP-OK` + `BRANCH-OWNED`, validator 0 fail / 0 warn.

## Gates

```bash
bash scripts/remote-branch-ownership-test.sh          # exit 0
node skills/skill-workbench/scripts/validate.js --all # 0 fail, 0 warn
# issue AC command -> BRANCH-OWNED
```

## Out of scope

Merge strategy, `pipeline-triage`, git hosting config, `evals/snapshots/**`, and any station skill
outside the four sites.