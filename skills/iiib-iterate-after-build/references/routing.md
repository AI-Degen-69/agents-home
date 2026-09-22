# Routing Matrix — `iiib-iterate-after-build`

Canonical lookup for Section 2 in `SKILL.md`. Read the operator's free-text item, match the observable symptom to exactly one lane, then invoke the listed skill. `SKILL.md` is the trigger surface, this file is the detail.

| Operator words (examples) | Lane | Invoke | Notes |
|---|---|---|---|
| crash, error, traceback, console error, worked before and broke, wrong result | Bug / error / regression | `diagnosing-bugs`, then `debugging-and-error-recovery` | Full diagnosis loop first (red loop, minimise, ranked hypotheses, instrument), then triage checklist; add a regression test |
| button does nothing, click has no effect, form never submits, no error shown | Dead button | `click-path-audit` (procedure condensed in `click-path-audit.md`) | Trace handler calls in order; find the later write that undoes an earlier one; check shared-store side effects and async races |
| looks wrong, off-center, broken on mobile, bad spacing, hard to read, not accessible | UI / styling / mobile | `frontend-ui-engineering` (+ `tailwind-design-system` when design tokens apply) | This is a small rebuild, not debugging |
| slow, laggy, takes too long, times out | Performance | `performance-optimization` | Profile before optimizing |
| login, permission, secret, token, private data, user input | Security | `security-and-hardening` | Untrusted input, auth boundaries, secrets handling |

Fallback: item matches no lane → treat as Bug / error / regression, ask the operator exactly one focused question, never guess.
