# Verify the Vendored Chain (read-only pre-flight)

The loop runs on a chain of vendored skills. A folder that exists on disk is not yet one the harness can invoke — run all five checks, read-only, and report any missing link as the blocker before starting Step 1.

Run the automated check in one step:
```bash
node scripts/verify-vendored-chain.js
```

## 1. Enumerate each vendored skill's folder
For each of `improve-codebase-architecture`, `codebase-design`, `grilling`, `domain-modeling`, plus the loop's own folder, list its contents (`search_files target='files'` or a directory listing). The chain is intact only when every `SKILL.md` and every declared companion is present:

- `improve-codebase-architecture` → `HTML-REPORT.md` + `agents/openai.yaml`
- `codebase-design` → `DEEPENING.md` + `DESIGN-IT-TWICE.md` + `agents/openai.yaml`
- `domain-modeling` → `GLOSSARY-FORMAT.md` + `ADR-FORMAT.md` + `agents/openai.yaml`
- `grilling` → `agents/openai.yaml`
- `self-improve-loop` → `references/merging-stacked-prs.md` + `references/verify-vendored-chain.md` + `scripts/verify-delivered-prs.js` + `scripts/verify-vendored-chain.js` + `evals/verify-delivered-prs.test.js`

## 2. Resolve the cross-references inside each SKILL.md
A companion named in prose is a promise — grep each SKILL.md for its linked filenames and confirm every target exists. A dangling `[X.md](X.md)` is a broken chain link even when the folder looks populated.

## 3. Confirm each folder is linked into the active harness root
Vendoring in `~/.agents/skills/` is not enough — every skill must also be symlinked/junctioned into the running profile's skills root (e.g. `AppData\Local\hermes\skills\`). List that root and check for a link to each canonical folder. An unlinked folder is invisible to the session even though it sits on disk.

## 4. Confirm loadability, not just presence
Cross-check the harness's registered skill list (`skills_list`); every chain link should appear. A skill that exists and is linked but is missing from the list has a registration problem (duplicate/orphan name in the harness root) — a link-repair problem, not a vendoring one. Fix the link before suspecting the skill file.

## 5. Exercise the loop's own gate
Run `node --test evals/verify-delivered-prs.test.js`; a green suite (every planted failure mode asserting a non-zero exit) proves the Step 8 gate can still catch a silent delivery defect. Then delete any `evals/tmp/` scratch dir the run leaves — a test artifact is litter, not a chain link.

All five must pass. A chain that is present-but-unlinked is not ready; an unloaded-but-vendored skill is not ready. Report exactly which link is missing.
