# Global Issue-to-PR Pipeline (Stations I–VII + system skills)

A universal, project-agnostic development pipeline deployed globally across all harnesses (Gemini CLI, Antigravity IDE, Hermes, OpenCode, Freebuff) under `~/.agents/skills/`.

**Convention:** a numbered prefix (`i-` through `vii-`) means the skill is a step in the chain, invoked in order — I → II → III → IIIB → IV → V → VI → VII. Everything without a numeral is a **system skill**: the `pipeline-triage` state gate and the `create-issue` intake branch.

## Entry Point

**Session start:** one entry point for Issue work — `i-pick-issue` (Station I). It runs the state gate itself: when the tree is dirty, commits are unpushed, or a PR is open it hands off to `pipeline-triage` first. Ad-hoc requests (question, small fix, exploration) are not Issue work → `using-agent-skills`.

`pipeline-triage` — the state gate, **not a numbered station**. When the working tree has uncommitted changes, unpushed commits, or an open PR and the next step is unclear, it inspects git state (and starts a missing `coderabbit` review early so it runs in parallel) and routes to the one station that resumes or closes the work.

## Pipeline Architecture

```
[Gate]         pipeline-triage          State gate (read-only): dirty tree / unpushed commits / open PR → routes to the one station that resumes or closes the work. Not numbered.
     │
     ▼
[Station I]    i-pick-issue             Pick & Orchestrate: Discovery (lists all open issues, prioritizes by dependency order) → operator picks the issue + execution mode → drives II–VII
     │
     ├── nothing worth picking ──► [Intake] create-issue ──► publish issue ──► back to Discovery
     ▼
[Station II]   ii-plan-issue            Define & Plan (right-sizing, spec, constraints, tasks/plan.md)
     │
     ▼
[Station III]  iii-build-plan           Build & Verify (TDD per task, atomic commits, auto-resolvers)
     │
     ├── corrections on fresh build ──► [Station IIIB] iiib-iterate-after-build
     │        (human feedback fix loop, no push)
     ▼
[Station IV]   iv-review-build-and-pr   Review & Ship (proof gate, OCR, ECC reviewers + Spec axis, 100% test gate, push, PR)
     │
     │  trigger handoff: IV posts @coderabbitai review, waits for ack,
     │  classifies (triggered / rate-limited N min / other reply / no ack),
     │  posts jump links, passes trigger status to V
     ▼
[Station V]    v-babysit-pr-and-merge   Babysit PR & Merge (consumes IV's trigger status; CodeRabbit 1-round review, reuse-first fallback on rate limit, squash merge, pull base)
     │
     ▼
[Station VI]   vi-present-pr            Present PR (standalone visual HTML explanation: ELI5 showcase, visual aids & manual verification guide) — runs BEFORE pruning, it consumes the issue's plan/notes
     │
     ▼
[Station VII]  vii-prune-artifacts      Prune Artifacts (sweep stale per-issue plans & scratch for closed issues) — pipeline closeout
```

---

## The Pipeline Stations

| Step | Canonical Name | Slash Command / Trigger | Purpose |
|---|---|---|---|
| **Gate** (not numbered, runs before I) | `pipeline-triage` | `/pipeline-triage` | State gate — reads git/PR state and routes to the one station that resumes or closes the work. Not numbered. |
| **I** | `i-pick-issue` | `/i-pick-issue` (or `<id>`) | Station I (Pick & Orchestrate) — the single entry point for Issue work. **No args:** Discovery mode — lists all open issues, groups by domain, recommends the next logical issue by dependency order.<br>**With `<id>`:** drives Stations II through VII to merge, presentation and prune. |
| **Intake** (branch off I, not numbered) | `create-issue` | `/create-issue <idea>` | Intake branch — turn a raw thought into a researched GitHub issue labeled `ready-for-agent`; its output re-enters Discovery. Not numbered. |
| **II** | `ii-plan-issue` | `/ii-plan-issue` (or `<id>`) | Station II (Plan): Claims issue (with `<id>` or auto-selects recommended if no arg), auto-detects tech stack and test framework, runs right-sizing, locks `CONSTRAINTS.md`, writes `tasks/plan.md`. |
| **III** | `iii-build-plan` | `/iii-build-plan auto` | Station III (Build): Consumes `tasks/plan.md`, implements tasks via type-aware execution (frontend-ui-engineering, TDD, debug), code simplification, and local commits. |
| **III-B** | `iiib-iterate-after-build` | `/iiib-iterate-after-build` | Station III-B (Iterate After Build): the operator reports corrections on a fresh build in free text — each item is classified, fixed by the right specialist skill, committed atomically, nothing pushed. Also entered from IV when the proof gate fails. |
| **IV** | `iv-review-build-and-pr` | `/iv-review-build-and-pr` | Station IV (Review, Verify & Ship): proof-before-review gate (browser or tests; failure → IIIB), OCR delegation scan, dynamic ECC reviewers (`.py/.ts/.tsx/.rs/.go/.sql/a11y`; React diffs get `typescript-reviewer` + `react-reviewer` together) plus the Spec axis (missing / added-not-asked / implemented-wrong), local fix commits, final verification gate, pushes branch, opens PR, posts `@coderabbitai review`, **waits for CodeRabbit's acknowledgement** and classifies it (triggered / rate-limited with reported minutes / other reply / no ack) with jump links on any non-clean ack. |
| **V** | `v-babysit-pr-and-merge` | `/v-babysit-pr-and-merge` | Station V (Babysit & Merge): **consumes Station IV's trigger-status handoff** (no re-detection), 1-round CodeRabbit review tracking (5m-4m-3m-2m-1m countdown), reuse-first fallback on rate limit (Station IV review evidence + delta check before any fresh subagent review), autonomous triage, squash merge, and fast-forwards local base branch (`master`/`main`). |
| **VI** | `vi-present-pr` | `/vi-present-pr <id>` | Station VI (Present PR): Standalone visual HTML explanation in `docs/issues/<id>-presentation-*.html` — ELI5 explanation, visual aids, manual verification guide. Runs BEFORE pruning (consumes the issue's plan/notes); static checks + fire-and-forget browser reveal. Absorbs the former `explain` builtin (also runs standalone). |
| **VII** | `vii-prune-artifacts` | `/vii-prune-artifacts` | Station VII (Prune): Post-merge sweep of stale per-issue plans and scratch files whose issues are CLOSED and unreferenced, strictly preserving knowledge and reports. Pipeline closeout — runs AFTER presenting. |

---

## Chat Output Contract (חובת דיווח אחידה ומדויקת בעברית)

Every pipeline step reports to the operator at the end of its execution in friendly, everyday Hebrew with step-tailored details — the `pipeline-triage` gate first, then the stations, then the `create-issue` intake branch:

1. **Gate (`pipeline-triage`):** שני חלקים בלבד — 📊 מצב (ענף, קדימה/אחורה, מבוימים/לא מבוימים/לא נעקבים, PR, סטאשים; וכל קובץ וסטאש עם סיווג של שורה) ו־🎯 החלטה (לאיזו תחנה מנותב ההמשך). ללא שורת אישור וללא הסבר מה התחנה עושה.
2. **Station I (`i-pick-issue`):** במצב Discovery: רשימת כל ה-issues הפתוחים בחלוקה לנושאים, סדר עבודה מומלץ והמלצה על ה-Issue הבא. במצב תזמור: ליווי רציף של תחנות II עד VII.
3. **Intake branch (`create-issue`):** קישור ישיר ל-Issue שנוצר, תוויות, ופירוט תמציתי של הקבצים שנבדקו במחקר המקדים.
4. **Station II (`ii-plan-issue`):** הסבר ברור ובשפה פשוטה של מה שתוכנן, שפת הפרויקט והטסטים שזוהו, ספי איכות שננעלו, ורשימת המשימות מ-`tasks/plan.md`.
5. **Station III (`iii-build-plan`):** סקילים שהופעלו ומה בוצע בפועל בכל סקיל, קבצים ששונו/נוספו, תיאור הבעיה של ה-Issue ומה בוצע כדי לפתור אותה, והמלצה לעבור ל-`/iv-review-build-and-pr`.
6. **Station IV (`iv-review-build-and-pr`):** ממצאי הסקירה המקבילית ותיקונים, ובסיום: פרטי הענף, קישור ישיר ל-PR, אימות סופי (דפדפן/קוד), סיכום קצר של מה נעשה והמלצה ל-`/v-babysit-pr-and-merge`.
7. **Station V (`v-babysit-pr-and-merge`):** הצגת הערות CodeRabbit בסגנון המקורי עם החלטות וציטוטים, קישור ל-PR עם `🟢 MERGED`, סיכום התיקונים שבוצעו, והמלצה ל-`/vi-present-pr`.
8. **Station VI (`vi-present-pr`):** פרטי ה-Issue וה-PR, הפקת המצגת מחומרי התכנון שעוד על הדיסק, והמלצה ל-`/vii-prune-artifacts` לסגירת הצינור.
9. **Station VII (`vii-prune-artifacts`):** פירוט שאריות שנוקו מ-`tasks/` ו-`scratch/` של ה-Issue שנסגר, נכסי ידע ו-Showcase שנשמרו (כולל המצגת שהופקה בתחנה הקודמת), ואין תחנה נוספת — סוף הצינור.

---

## Artifact Homes & Governance

Three homes, three purposes — never mixed:

1. `runs/.../research-papers/` — **per-run** research papers and experiment findings.
2. `docs/issues/<id>-presentation-<slug>.html` — **per-issue** visual HTML explanation & showcase artifacts (Station VI; legacy names `<id>-showcase-*.html` and `<id>-explained.html` remain recognized).
3. `.freebuff/`, `%TEMP%` — **transient scratch / preview only**. Never the canonical home of anything.

---

## Global Deployment & Linking

All skills live canonically in `C:\Users\Tiger\.agents\skills\`.
The per-harness link-type matrix is the single source of truth in
`skills/README.md` — read it before linking a skill or copying one. In short:
Hermes consumes **Junctions**; Gemini CLI / Antigravity need **SymbolicLinks**
(junctions are invisible to them); OpenCode Desktop consumes **Junctions** like Hermes;
Freebuff resolves repo-local skill dirs. `scripts/sync-harness-skills.ps1` is the
one command that applies those rules.

---

## Harness Link Sync

`scripts/sync-harness-skills.ps1` re-points the harness roots at the canonical skill folders: `-Name <skill>` for one skill, `-All` for every skill, `-Check` to report without writing.

- **Hermes** (`AppData/Local/hermes/skills/`) consumes **Junctions**.
- **Gemini CLI / Antigravity** (`~/.gemini/config/skills/`) need **SymbolicLinks** - junctions are invisible to it.
- Creating a SymbolicLink needs `SeCreateSymbolicLinkPrivilege`. In a non-admin shell the script falls back to a real-directory copy, which does **not** track later edits to the canonical skill - re-run the script after editing a skill to refresh it.
- **OpenCode Desktop** (`~/.config/opencode/skills/`) consumes **Junctions** too, with no privilege needed. An entry that is any link kind pointing at canonical counts as ok (the root already holds a few SymbolicLinks); a stale real-directory copy is replaced with a Junction. ECC-pack folders that live only there have no canonical counterpart and are left alone.
