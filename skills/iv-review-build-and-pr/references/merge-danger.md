## Merge Danger Assessment

Part of `iv-review-build-and-pr` (Station IV). Loaded on demand — the
step contract in `SKILL.md` is the source of truth; this file holds the detail.

### Goal

Before opening the PR, compute a **## Merge Danger** section that tells
the reviewer the risk profile in three dimensions: **decision type**,
**blast radius**, and **rollback feasibility**. Place it in the PR body
right after `## Summary` and before `## How to verify`.

### Step 5b: Assess Merge Danger

#### 1. Decision Type (one-way vs two-way door)

| Signal | Type |
|---|---|
| DB schema migration, data transformation, external API contract change | **One-way door** |
| Public API method/signature change, config value change | **Two-way door** |
| Internal refactor, new file/module, test only | **Two-way door** |

Heuristics — check these in order, pick the first match:
- `ALTER TABLE`, migration file, `data:` column in diff → one-way
- Files matching `*.d.ts`, `*.schema.ts`, `routes/*`, `openapi*` → one-way
- Everything else → two-way

#### 2. Blast Radius

Count affected units from `git diff --name-only origin/<base>...HEAD`:

| Metric | Source |
|---|---|
| **Files** | `git diff --name-only origin/<base>...HEAD \| wc -l` |
| **Directories** | `git diff --name-only origin/<base>...HEAD \| xargs dirname \| sort -u \| wc -l` |
| **Modules/domains** | Group by top-level dir under `src/` (or project-defined module root) |
| **Public API surface** | `rg "^export" <touched files>` count |

Map to a qualitative level:

| Files | Directories | Risk Level |
|---|---|---|
| 1 | 1 | Minimal |
| ≤ 3 | ≤ 2 | Low |
| ≤ 10 | ≤ 5 | Moderate |
| > 10 | > 5 | High |

#### 3. Rollback Feasibility

| Category | Rollback |
|---|---|
| Config / docs | **Easy** — `git revert` suffices, no state impact |
| Internal code refactor (≤ 3 files) | **Easy** — full revert, no external state |
| New feature (additive only) | **Easy** — feature flag can be off, revert clean |
| Public API change | **Moderate** — consumers must migrate, version bump |
| DB schema migration | **Hard** — data may have migrated; revert loses data |
| Data migration / transformation | **Hard** — rollback requires backup restore |

Heuristics — check in order:
- Diff contains `ALTER TABLE`, migration file, or data transform → hard
- Diff touches `routes/*`, `*.d.ts`, public exports → moderate
- Only additive (new files/functions) or config/docs → easy

### Output Format

Append this exact section to the PR body:

```markdown
## Merge Danger

- **Decision:** Two-way door (reversible)
- **Blast radius:** 3 files (2 components, 1 config) — [Low]
- **Rollback:** Easy — full revert via `git revert`, no data/state impact
- **Red flags:** None
```

If any red flag is present, list it:
```markdown
- **Red flags:** Database schema migration detected — requires backup verification before merge
```

### Rules

- Always compute from the live diff — never assume from ticket size.
- If blast radius crosses into "High" territory, flag the PR for explicit
  human review before Station V attempts an autonomous merge.
- The `## Merge Danger` section is informational — it feeds into Station V's
  review-depth decision but does not block PR creation.
