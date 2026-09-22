# Domain Routing Matrix — `iii-build-plan`

Canonical lookup for Phase 1 step 3 in `SKILL.md`. Inspect the task's domain
tag in `tasks/plan.md`, then invoke the matching skill. Keep this table in
sync with `SKILL.md` — `SKILL.md` is the trigger surface, this file is the
detail.

| Domain tag | Invoke | Notes |
|---|---|---|
| UI / Frontend / Design | `frontend-ui-engineering` (+ `tailwind-design-system` when tokens/utilities apply) | Visual components, styling, layouts; accessible + responsive |
| Code / Backend / API | `test-driven-development`, `source-driven-development`, `api-and-interface-design` | TDD minimal code; official docs grounding for API usage |
| Debug / Defect | `debugging-and-error-recovery` | Root cause first, fix second |
| Performance | `performance-optimization` | Profile before optimizing |
| Security | `security-and-hardening` | Untrusted input, auth, secrets |
| Docs | `documentation-and-adrs` | ADRs for decisions, Diataxis for guides |

## Multiple tags on one task

Prefer **splitting** a multi-concern task into one single-tag task per concern at planning time (Station II). A task that legitimately keeps two tags (e.g. a settings form: UI + Security) routes as:

1. **Primary specialist** (first tag = highest risk per risk-first order) owns the implementation loop.
2. **Secondary specialist** advises: it sets its requirements and constraints up front; the primary applies them inside its own loop. They never run as two parallel implementations.
3. Station IV re-checks both axes at review time regardless.

Fallback: task with no clear tag → treat as Code / Backend / API, then
`code-simplification` as usual.
