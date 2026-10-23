## Finding Classification Taxonomy

Part of `retro` (Station VI-B). Full source of truth: `SKILL.md`.

### Classification Rule

Every finding from a coding session is **mechanical** or a **judgment call**.
This determines what action to propose:

---

### Mechanical Findings → Deterministic Check

A finding is **mechanical** when it describes a pattern that can be
detected and enforced by **a tool** — a linter rule, a pre-commit hook,
or a CI job. If the same violation could recur in a future session,
it gets an automated check.

| Pattern | Example | Check Type |
|---|---|---|
| Wrong import style | `import {` instead of `import type` for type-only imports | ESLint rule |
| Unused variables | `const x = …` never read after assignment | ESLint / TypeScript `noUnusedLocals` |
| Hardcoded secrets | API key in source | `gitleaks` CI job |
| Forbidden APIs | `os.system()` instead of `subprocess` | ESLint / custom rule |
| Format drift | Inconsistent indentation, trailing whitespace | Prettier + pre-commit hook |
| Missing return type | Function with no explicit return type | TypeScript `explicitReturnType` |
| Wrong folder usage | API calls in UI components | ESLint path rule |
| Naming conventions | `handleSubmit` vs `onClickSave` inconsistency | ESLint naming rule |
| Direct DOM manipulation | `document.getElementById` in React | ESLint @typescript-eslint/no-restricted-syntax |

**Propose:** the specific linter rule, pre-commit hook, or CI job that
would catch this statically. Include config snippet.

---

### Judgment-Call Findings → CODING_STANDARDS.md

A finding is a **judgment call** when it involves style, architecture,
or convention decisions that require human interpretation. A tool
cannot definitively say whether the choice is right or wrong.

| Pattern | Example | Where to record |
|---|---|---|
| Component granularity | "This component is too large" | CODING_STANDARDS.md |
| Error message quality | "Error message is not actionable" | CODING_STANDARDS.md |
| API design choice | "This endpoint does too much" | ADR |
| State management pattern | "Should this be a store or prop?" | AGENTS.md / CODING_STANDARDS.md |
| Test strategy | "Should this be unit or integration?" | CODING_STANDARDS.md |
| Documentation style | "Comment explains what, not why" | CODING_STANDARDS.md |

**Propose:** a `CODING_STANDARDS.md` entry with a clear principle and a
concrete before/after example. If the finding contradicts an existing
ADR, mark it and recommend whether to revisit the ADR.

---

### Decision Tree

```
Is the finding a repeated pattern that a tool could flag?
  ├── YES → Mechanical → propose lint rule / hook / CI job
  └── NO →  Is it a style, architecture, or convention choice?
             ├── YES → Judgment call → propose CODING_STANDARDS.md entry
             └── NO →  Is it a genuine code defect (bug, not environment)?
                        ├── YES → Route back to issue tracker as a new Issue
                        └── NO →  Is the repo missing guardrails entirely?
                                   ├── YES → Propose minimal baseline
                                   └── NO →  Re-classify above
```

---

### Edge Cases

- **"Too large" / "too complex" functions** → judgment call. The threshold
  depends on domain complexity. Record in `CODING_STANDARDS.md` with a
  concrete max-line-count or cyclomatic-complexity threshold per the
  project's eslint/prettier config.

- **"Missing test coverage"** → split: mechanical parts (e.g., uncovered
  branches → CI job with coverage threshold) become deterministic checks;
  judgment-call parts (e.g., "this test doesn't cover the edge case
  properly") go to `CODING_STANDARDS.md`.

- **"Agent took too long to find the right file"** → navigation pointer.
  Add to `AGENTS.md` under "Key Files" — this is neither mechanical nor
  a coding standard; it's an environment improvement.
