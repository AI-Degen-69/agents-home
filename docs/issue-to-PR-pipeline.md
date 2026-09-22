# Global Issue-to-PR Pipeline (Station X & Stations I–VII)

A universal, project-agnostic development pipeline deployed globally across all harnesses (Gemini CLI, Antigravity IDE, Hermes, OpenCode, Freebuff) under `~/.agents/skills/`.

## Entry Point

**Session start:** classify the request once against the Router Charter in `~/.agents/AGENTS.md` — one router owns a request, max one handoff:

1. Continuation / unclear intent / dirty repo / open PR → `pipeline-triage` (read-only; routes onward).
2. New Issue work, clean repo → `x-workflow-issue`.
3. Ad-hoc (question, small fix, exploration) → `using-agent-skills`.

`pipeline-triage` — dirty-repo triage. When the working tree has uncommitted changes, unpushed commits, or an open PR and the next step is unclear, it inspects git state (and starts a missing `coderabbit` review early so it runs in parallel) and routes to the right station below.

## Pipeline Architecture

```
[Station X]    x-workflow-issue        Discovery & Pipeline Orchestrator (lists, prioritizes, drives II–VII)
     │
     ├────────────────────────────────────────────────────────────────────────┐
     │                                                                        │
     ▼                                                                        │
[Station I]    i-create-issue          Intake raw idea → publish GitHub issue (ready-for-agent)
     │                                                                        │
     ▼                                                                        │
[Station II]   ii-plan-issue           Define & Plan (right-sizing, spec, constraints, tasks/plan.md)
     │                                                                        │
     ▼                                                                        │
[Station III]  iii-build-plan          Build & Verify (TDD per task, atomic commits, auto-resolvers)
     │                                                                        │
     ├── corrections on fresh build ──► [Station IIIB] iiib-iterate-after-build ──┐
     │        (human feedback fix loop, no push)                                  │
     ▼                                                                            │
[Station IV]   iv-review-build-and-pr  Review & Ship (proof gate, OCR, ECC reviewers + Spec axis, 100% test gate, push, PR)
     │                                                                        │
     ▼                                                                        │
[Station V]    v-babysit-pr-and-merge  Babysit PR & Merge (CodeRabbit 1-round review, squash merge, pull base)
     │                                                                        │
     ▼                                                                        │
[Station VI]   vi-prune-artifacts      Prune Artifacts (sweep stale per-issue plans & scratch for closed issues)
     │                                                                        │
     ▼                                                                        │
[Station VII]  vii-present-pr          Present PR (standalone visual HTML explanation: ELI5 showcase, free-range visual aids & manual verification guide)
```

---

## The Pipeline Stations

| Station | Canonical Name | Slash Command / Trigger | Purpose |
|---|---|---|---|
| **X** | `x-workflow-issue` | `/x-workflow-issue` (or `<id>`) | **No args:** Discovery mode — lists all open issues, groups by domain, recommends sequence.<br>**With `<id>`:** Pipeline orchestrator driving Stations II through VII. |
| **I** | `i-create-issue` | `/i-create-issue <idea>` | Turn raw thought into a researched GitHub issue labeled `ready-for-agent`. Researches real paths before drafting. |
| **II** | `ii-plan-issue` | `/ii-plan-issue` (or `<id>`) | Station II (Plan): Claims issue (with `<id>` or auto-selects recommended if no arg), auto-detects tech stack and test framework, runs right-sizing, locks `CONSTRAINTS.md`, writes `tasks/plan.md`. |
| **III** | `iii-build-plan` | `/iii-build-plan auto` | Station III (Build): Consumes `tasks/plan.md`, implements tasks via type-aware execution (frontend-ui-engineering, TDD, debug), code simplification, and local commits. |
| **IV** | `iv-review-build-and-pr` | `/iv-review-build-and-pr` | Station IV (Review, Verify & Ship): proof-before-review gate (browser or tests; failure → IIIB), OCR delegation scan, dynamic ECC reviewers (`.py/.ts/.rs/.go/.sql/a11y`) plus the Spec axis (missing / added-not-asked / implemented-wrong), local fix commits, final verification gate, pushes branch, and opens PR with `@coderabbitai summary`. |
| **V** | `v-babysit-pr-and-merge` | `/v-babysit-pr-and-merge` | Station V (Babysit & Merge): 1-round CodeRabbit review tracking (5m-4m-3m-2m-1m countdown or subagent fallback on limit), autonomous triage, squash merge, and fast-forwards local base branch (`master`/`main`). |
| **VI** | `vi-prune-artifacts` | `/vi-prune-artifacts` | Station VI (Prune): Post-merge sweep of stale per-issue plans and scratch files whose issues are CLOSED and unreferenced, strictly preserving knowledge and reports. |
| **VII** | `vii-present-pr` | `/vii-present-pr <id>` | Station VII (Present PR): Standalone visual HTML explanation in `docs/issues/<id>-presentation-*.html` — Before/After visual architecture, ELI5 explanation, free-range visual aids (diagrams, charts, timelines, animations), step-by-step manual verification guide, and verification in the Preview tab. Absorbs the former `explain` builtin (also runs standalone for non-pipeline visual explanations). |

---

## Chat Output Contract (חובת דיווח אחידה ומדויקת בעברית)

Every station must report to the operator at the end of its execution in friendly, everyday Hebrew with station-tailored details:

1. **Station X (`x-workflow-issue`):** במצב Discovery: רשימת כל ה-issues הפתוחים בחלוקה לנושאים, סדר עבודה מומלץ והמלצה על ה-Issue הבא. במצב תזמור: ליווי רציף של תחנות II עד VII.
2. **Station I (`i-create-issue`):** קישור ישיר ל-Issue שנוצר, תוויות, ופירוט תמציתי של הקבצים שנבדקו במחקר המקדים.
3. **Station II (`ii-plan-issue`):** הסבר ברור ובשפה פשוטה של מה שתוכנן, שפת הפרויקט והטסטים שזוהו, ספי איכות שננעלו, ורשימת המשימות מ-`tasks/plan.md`.
4. **Station III (`iii-build-plan`):** סקילים שהופעלו ומה בוצע בפועל בכל סקיל, קבצים ששונו/נוספו, תיאור הבעיה של ה-Issue ומה בוצע כדי לפתור אותה, והמלצה לעבור ל-`/iv-review-build-and-pr`.
5. **Station IV (`iv-review-build-and-pr`):** ממצאי הסקירה המקבילית ותיקונים, ובסיום: פרטי הענף, קישור ישיר ל-PR, אימות סופי (דפדפן/קוד), סיכום קצר של מה נעשה והמלצה ל-`/v-babysit-pr-and-merge`.
6. **Station V (`v-babysit-pr-and-merge`):** הצגת הערות CodeRabbit בסגנון המקורי עם החלטות וציטוטים, קישור ל-PR עם `🟢 MERGED`, סיכום התיקונים שבוצעו, והמלצה ל-`/vi-prune-artifacts`.
7. **Station VI (`vi-prune-artifacts`):** פירוט שאריות שנוקו מ-`tasks/` ו-`scratch/` של ה-Issue שנסגר, נכסי ידע ו-Showcase שנשמרו, והמלצה ל-`/vii-present-pr`.
8. **Station VII (`vii-present-pr`):** פרטי ה-Issue וה-PR עם `🟢 MERGED`, סיכום קצר, בדיקה ידנית בעיניים בלבד (ללא טסטים אוטומטיים), אישור אימות ההצגה בטאב ה-Preview (צילום מסך ולוגים), אישור פתיחה אוטומטית בדפדפן וב-Windows Explorer, ונתיב מקומי לקובץ.

---

## Artifact Homes & Governance

Three homes, three purposes — never mixed:

1. `runs/.../research-papers/` — **per-run** research papers and experiment findings.
2. `docs/issues/<id>-presentation-<slug>.html` — **per-issue** visual HTML explanation & showcase artifacts (Station VII; legacy names `<id>-showcase-*.html` and `<id>-explained.html` remain recognized).
3. `.freebuff/`, `%TEMP%` — **transient scratch / preview only**. Never the canonical home of anything.

---

## Global Deployment & Linking

All skills live canonically in `C:\Users\Tiger\.agents\skills\`.
They are consumed across harnesses via:

- **Hermes:** `AppData/Local/hermes/skills/` (Junction)
- **Gemini CLI / Antigravity IDE:** `~/.gemini/config/skills/` (**SymbolicLink** — mandatory for Gemini to resolve)
