# Source-Scanning Guard Tests — Pitfalls & Patterns

Guidance for Station III when implementing tests that scan repository source code (no-drift guards, boundary enforcement, deprecation checks).

---

## 1. Role & "Red-by-Design" Contract

Source-scanning guard tests verify that forbidden patterns (e.g., deprecated modules, private imports, legacy APIs) do not leak into production code.

- **Deliberately Red Output:** When a plan introduces a guard test *before* moving consumer call sites, the test is designed to fail initially. The red failure output is the deliverable and work order for downstream tasks.
- **Station IV Pre-check:** Under Station IV rules, a test failure that matches the documented expected red list is classified as *proved* (proof the guard detects violations), not a regression.
- **Never Widen Scope:** When creating a red-by-design guard, never widen scope to fix existing violations unless the current task explicitly owns them. Greening belongs to the tasks assigned to migrate callers.

---

## 2. Scanner Design Pitfalls

### Pitfall 1: Phrase-Shaped Import Grep
- **The Bug:** Matching regex patterns like `from X import target` or `import target`.
- **Why it breaks:** Multi-name imports (`from X import a, target, b`) or aliased imports (`from X import target as t`) hide the symbol from phrase matching.
- **The Fix:** Match bare identifiers with word boundaries on import lines:
  ```bash
  grep -rnE "\b<name>\b" --include="*.py" | grep -i import
  ```
  Or handle parenthesized multi-line imports:
  ```python
  from pkg import (
      feature_a,
      target_module,  # missed by line-by-line grep if only looking for 'from pkg'
  )
  ```

### Pitfall 2: AST vs. Raw String Grep
- **The Bug:** Raw regex matches occurrences inside comments, docstrings, log messages, and type annotations in strings (`"Optional['OldService']"`).
- **The Fix:** Where possible, use standard library AST parsing rather than raw text matching:
  - Python: `ast.parse()` collecting `ast.Import` and `ast.ImportFrom` nodes.
  - Node.js / TypeScript: standard AST visitor or token walker.
  - If using regex: strip single-line comments (`#`, `//`) and block quotes before checking.

### Pitfall 3: Scanner Self-Matching & Exclusions
A source scanner recursively searching the repository will easily trigger false positives on:
1. **Self-reference:** The guard test file itself contains the search pattern or identifier name. Always exclude `__file__` or the test's own path.
2. **Test suites & fixtures:** Test fixtures, historical snapshots, and mock objects often intentionally reference legacy components. Explicitly define root scan directories (e.g. only `src/` or `app/`), or exclude `tests/`, `fixtures/`, `evals/`.
3. **Third-party & build trees:** Always exclude `.git/`, `node_modules/`, `vendor/`, `.venv/`, `dist/`, `build/`, and cache directories (`__pycache__`).

### Pitfall 4: Inconsistent Output Contract
- **The Bug:** The guard test raises a generic assertion like `assert len(matches) == 0` without printing actionable coordinates.
- **The Fix:** Format every violation in standard grep format so it can be captured verbatim into `tasks/plan.md`:
  ```text
  path/to/file.py:42: from old_module import feature
  ```
  Provide the total offender count and exact lines so downstream cleanup tasks have deterministic targets.

---

## 3. Checklist for Implementing a Guard Test

- [ ] Target scan directory restricted (e.g. `src/` only, not entire repo root).
- [ ] Exclusions active: self file, `tests/`, `fixtures/`, `node_modules/`, `.git/`, `.venv/`.
- [ ] Word boundary regex (`\b<name>\b`) or AST parsing used instead of naive phrase match.
- [ ] Multi-name and multi-line imports handled.
- [ ] Comments, strings, and docstrings ignored or filtered.
- [ ] Actionable failure output emitted (`<file>:<line>: <content>`).
- [ ] If red-by-design: capture verbatim output into `tasks/plan.md` as downstream tasks.
