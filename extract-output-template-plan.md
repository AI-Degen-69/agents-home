# Task: Extract the Hebrew output template out of SKILL.md (10 localized stations)

Issues: agents-home #2 (the work) · #3 (lost evals) · #4 (pack-side decision — **closed: no English template ships**)

## Context (read fully before editing)

Ten stations in this home run **Hebrew** chat output contracts. They are translated by
hand into the public `issue-to-pr-skills` pack, and `scripts/sync-from-canonical.js`
in that repo copies from here. The translation cannot be derived mechanically.

The Hebrew currently sits **inside `SKILL.md`**, so `sync` refuses to copy those nine
files at all. They can never take upstream improvements automatically, and
`sync:check` is a wall of blocked files that never shrinks.

Goal: get the Hebrew out of `SKILL.md` so the file is English and syncable, with the
template in a separate file that never ships.

## What was measured

All 10 stations, canonical vs pack.

| Finding | Count |
|---|---|
| Stations with a Hebrew output contract | 9 of 10 (`pipeline-triage` has none) |
| Hebrew confined to the contract section | all 9 |
| Stations with Hebrew **outside** the contract | 5 |
| `i-pick-issue` eval assertions touching Hebrew | 2 of 22 |

Outside-the-contract, worst first: `v-babysit-pr-and-merge` (4 lines),
`ii-plan-issue` (3), `iv-review-build-and-pr` (2), `i-pick-issue` (1),
`iii-build-plan` (1).

The last row is why this is cheaper than it looks: the evals mostly assert on English
instruction text, so they keep working once the template moves out.

### Two kinds of Hebrew — do not confuse them

1. **Output-contract prose** — the report template. Belongs in the new file.
2. **Severity labels inside instructions** — `v-babysit-pr-and-merge` uses three Hebrew
   severity words (mandatory / recommended / skip) in a triage table. Already
   translated in the pack to `(Required)` / `(Recommended)` / `(skip)`. **Not** a
   template — just delete it.

Getting this backwards wastes a station: half the Hebrew that is *not* in a template
needs no new file at all.

## Decisions already taken

- One `SKILL.md` per station, not two files. The sync strips the local-only pointer.
- The pointer is identical in every station, so **one shared rule** covers all ten.
- Same path everywhere: `references/output-template.md`.
- **No placeholders.** The template becomes its own file, so the "string written in
  three places" problem does not exist.
- Strip is an explicit `<!-- local-only:begin --> / <!-- local-only:end -->` block, not
  a filename match — prose that merely *names* `output-template.md` is real content and
  must survive. Verified: two lines can carry the same path with opposite intent.
- `.gitignore` is irrelevant here — sync copies from disk, it does not go through git.

## Two rules to add, both in `scripts/sync-from-canonical.js` of the pack repo

**1. Do not copy the template file** — extend the existing `EXCLUDE` list:

```js
(rel) => rel === "references/output-template.md",
```

**2. Strip the marked block before publishing** — next to `rewrite`:

```js
const LOCAL_ONLY = /^[ \t]*<!-- local-only:begin -->[\s\S]*?^[ \t]*<!-- local-only:end -->[^\n]*\n?/gm;
const stripLocalOnly = (text) => text.replace(LOCAL_ONLY, "");
```

### Ordering — the part that breaks silently

The strip must run **before** `same(src, dest)`. That function compares the
post-processed source with the published file; strip after it and sync concludes the
file is already current, then never updates it again. No error, no warning.

## Per-station shape

Local:

```markdown
<!-- local-only:begin -->
The chat output template for this station is `references/output-template.md`.
Read it before writing your first report.
<!-- local-only:end -->
```

Published: the block is gone, and so is the file it pointed at. No dangling reference.

## Execution order

1. Add the two rules to the sync script. Without them there is no template, only an idea.
2. Do **`i-pick-issue` only** — hardest case: contract, an instruction that defines a
   string, and two Hebrew evals. If it works, there is a pattern for the other nine.
3. Acceptance:
   - `SKILL.md` has **zero** Hebrew characters
   - `sync:check` reports it syncable, not blocked
   - blocked count drops by one; **no new** file becomes blocked
   - no dangling `references/output-template.md` reference in the pack
   - the other 8 blocked files unchanged
4. Only then the remaining nine.

If the structure is wrong, one wrong file beats ten.

## Decided — the pack ships no output template

agents-home #4 is closed: **no English `references/output-template.md` in the published
pack.** The canonical home keeps the Hebrew template; the pack's `SKILL.md` carries the
instructions only, with the local-only pointer stripped on publish.

Consequence: there is no pack-side counterpart file to maintain, so the `EXCLUDE` rule
is the entire mechanism and the guard gains no second target.

## Where the sync rules are implemented

The two rules live in the **pack** repo (`issue-to-pr-skills/scripts/sync-from-canonical.js`),
not here. They are specified in full above and in agents-home#2, so nothing needs
re-deriving. Whoever writes them works on a pack-repo branch, after
[PR #50](https://github.com/AI-Degen-69/issue-to-pr-skills/pull/50) merges.

## Not in scope

- The other nine stations (step 4 only after the proof)
- `verify-mirror.js` not covering `references/*.md` — a real gap, filed separately in the
  pack repo
- The two dropped `i-pick-issue` assertions — issue #3, doable independently
