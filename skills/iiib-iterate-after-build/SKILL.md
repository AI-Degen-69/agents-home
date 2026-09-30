---
name: iiib-iterate-after-build
description: Station III-B (Iterate After Build) — human feedback fix loop between build and review. Use after iii-build-plan when the operator reports bugs, dead buttons, UI changes, slowness, or security concerns in freshly built code. Classifies each free-text comment, routes to the right specialist skill, fixes locally with atomic commits and no push, then hands off to iv-review-build-and-pr. Invoke whenever the operator lists corrections after a build.
---

# Station III-B: Iterate After Build (`iiib-iterate-after-build`)

The router for Path B. The operator describes corrections in free text after a build, and this skill classifies each item, fixes it with the right specialist skill, and loops until the build is clean. Nothing is pushed and no PR is opened here — pushing stays in Station IV.

## Pipeline Position

- **Station:** Station III-B of VI (human feedback loop)
- **Previous Station:** `iii-build-plan` (Build)
- **Next Station:** `iv-review-build-and-pr` (Review & Verify)

## 1. Invocation

```bash
/iiib-iterate-after-build <free-text corrections>   # e.g. the save button does nothing and the title is off-center on mobile
/iiib-iterate-after-build                           # no text: ask the operator for the correction list, then proceed
```

The operator never picks a skill. They describe what they saw. Classification is this skill's job.

## 2. Classify & Route

Split the operator message into separate items (one bug or change each). For every item, state one line: "Item N → Lane X because [observable reason]". The full matrix lives in `references/routing.md`:

- **Bug / error / regression** (crash, console error, worked before and broke): `diagnosing-bugs` for the full diagnosis loop (feedback loop, minimise, hypothesise, instrument, fix, regression test), then `debugging-and-error-recovery` for reproduce, localize, fix, and guard.
- **Dead button** (click does nothing, no error): follow the dead-button checklist in [references/click-path-audit.md](references/click-path-audit.md) — trace the handler call by call and find the state write that undoes an earlier one.
- **UI / styling / mobile change** (works but looks wrong): `frontend-ui-engineering` (plus `tailwind-design-system` when design tokens apply).
- **Slow**: `performance-optimization` — profile before optimizing.
- **Auth / secrets / untrusted input**: `security-and-hardening`.
- **Unclear**: treat as a bug, ask exactly one focused question, never guess.

## 3. Per-Item Fix Loop

For every item, in order:

1. **Reproduce** the item as the operator described it (click path, error text, screen size).
2. **Name the root cause**, not the symptom. No fix without a named cause.
3. **Apply the minimal fix** with the routed skill. One item, one fix.
4. **Simplify** with `code-simplification`: no dead code, no extra abstractions.
5. **Commit locally**: `<type>(<scope>): <summary> (#<issue>)`. Never push, never open a PR.
6. **Verify**: browser check for UI via `browser-testing-with-devtools` (live DOM, console, network — zero uncaught errors), and targeted test runner for logic via `test-driven-development` covering modified files, following `verification-before-completion` for what counts as proven. Do NOT run full test suites or redundant VBC sweeps per fix; the final pre-push gate in Station IV validates the overall state. Regression tests go at the seam that actually reproduces the bug (unit, integration, or e2e — whatever reaches the real pattern at the call site); when no correct seam exists, that itself is an architectural finding — record it in the commit and surface it in the report.
7. **Next item.** A red verification stops the loop until green.

## 4. Guardrails

Respect `CONSTRAINTS.md` (no skipped tests, no new external dependencies without approval, zero regressions in touched modules). Never touch code outside the reported items. Never push to origin — `iv-review-build-and-pr` is the only station that pushes.

## Hebrew Chat Output Contract

Report in clean, everyday Hebrew. Write for the customer who ordered the product, never for a developer. What's-changed only: one line per fixed item — product location + what was wrong in plain words, then what works now. No skill names, no commits, no tests, no file paths. Never use the word console. Say "checked in the browser, no errors" instead.

```markdown
# 🔁 IIIB - תיקונים אחרי בנייה (סיכום איטרציה):

## 🩹 מה תוקן?
* **[מיקום מוצרי]** — [לפני: מה לא עבד לאדם. עכשיו: מה עובד]

## ➕ מה חדש? / ✏️ מה שונה?
* [רק אם תיקון הוסיף או שינה משהו מעבר לתיקון עצמו — אחרת הקבוצה לא מופיעה]

👉 **שלב הבא:** `/iv-review-build-and-pr` — הכל עובד, מוכן לסקירה ושליחה.
```
