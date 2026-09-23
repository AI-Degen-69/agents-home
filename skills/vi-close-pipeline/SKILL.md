---
name: vi-close-pipeline
description: "Station VI (Close Pipeline) — Final station. Post-merge closeout: verifies the issue is closed, sweeps stale per-issue artifacts via signal-based discovery (works in any project layout), investigates before staging anything to git, handles dead code on the spot as the pipeline's single approved code-change exception (zero-reference proof + targeted tests), and ends with the mandatory Clean Exit Gate — base branch pushed, synced, spotless, ready for the next run."
---

# Station VI: Close Pipeline (`vi-close-pipeline`)

Post-merge closeout that leaves the repository carrying only live knowledge — and leaves the working folder on a clean, synced base branch, ready for the next issue. Works across **any project, language, or repository** without assuming repo-specific folder naming.

## Pipeline Position
- **Station:** Station VI of VI — pipeline closeout
- **Previous Station:** `v-babysit-pr-and-merge` (Babysit & Merge)
- **Next Station:** none — the pipeline ends here
- **Optional follow-up (outside the pipeline):** suggest `/present-pr <id>` — the ad-hoc visual presentation skill. It is NOT a pipeline station and is never mandatory.

---

## 1. Step 0 — Verify Merge & Close the Issue

1. Confirm the PR is merged: `gh pr view <n> --json state --jq .state` → must be `MERGED`. If not merged, stop and route back to `v-babysit-pr-and-merge`.
2. Check the issue: `gh issue view <id> --json state`.
   - If **CLOSED** — continue.
   - If **OPEN but the PR is MERGED** (the PR body lacked `Closes #<id>`) — close it now:
     `gh issue close <id> --comment "Closed via PR #<n> (merged)."` and report it.
   - If tracker state is ambiguous — ask the operator. Never guess.

---

## 2. Signal-Based Artifact Discovery (generic — never assume layout)

A file is a **prune candidate** if it carries an identity of specific, finished work. Detect by signals, not by folder names:

1. **Filename signal:** the issue/PR number or slug in the name (`42-*`, `*42*plan*`, `<slug>-todo`).
2. **Content signal:** frontmatter (`issue: 42`), references to `#<id>` or the PR URL, or a checklist tied to the shipped work.
3. **History signal:** the file was created/touched only by commits of the merged feature branch (`git log --follow -- <file>`).
4. **Location signal (weak, corroborating only):** lives outside recognized knowledge homes — typical scratch spots are `tasks/`, `scratch/`, temp dirs, repo root — but ANY path can host a candidate, and ANY path can host a keeper.

Scan the whole repo (excluding `.git/`, dependency folders, build output) for `*.md`, `*.txt`, `*.html`, loose scripts, and scratch-like directories. Match candidates against the just-merged issue AND against any other closed issue whose leftovers are still lying around.

---

## 3. Two-Gate Obsolescence Test

A candidate file is eligible for deletion **only when BOTH conditions hold**:
1. **Work is Closed:** the associated issue is CLOSED / PR MERGED (verified in Step 0 or via tracker CLI).
2. **Zero Inbound References:** a full repo-wide search (excluding `.git/`) finds zero active references or links to the file.
- If either gate fails (work open OR file referenced): the file MUST be kept.
- Ambiguous tracker state → prompt the operator, never guess.

---

## 4. Knowledge Is Untouchable (Strict Preservation Rule)

**PERMANENT KNOWLEDGE — never deleted:**
1. **Visual presentations:** `docs/issues/<id>-presentation-*.html` (legacy: `<id>-showcase-*.html`, `<id>-explained.html`) — historical showcases of record, kept even when the issue is closed.
2. **Research papers & findings:** `runs/.../research-papers/`, dated reports and benchmarks.
3. **Active planning & backlog:** `TODO.md`, `ideas/`, active RFCs.
4. **Permanent docs:** anything linked from `README.md` or indexed in project documentation.

---

## 5. Investigate Before You Touch (no blind git adds)

Every untracked or unknown file the sweep finds gets **read and classified first**: permanent knowledge / prune candidate / foreign (belongs to other in-flight work).
- Knowledge → stage it (see commits below).
- Prune candidate → two-gate test.
- Foreign → leave it alone and name it in the report. **Never `git add` a file you have not read.**

### Relocate misplaced keepers
A valuable document sitting in scratch or repo root → propose moving it to `docs/` or `docs/issues/` with a clean kebab-case name (`<topic>-<date>-<kind>.<ext>`). Confirm before moving; update inbound references.

---

## 6. Dead Code — the Pipeline's Single Approved Code-Change Exception

Dead or zombie code tied to the merged work (unused modules, superseded APIs, orphaned exports) is handled **on the spot, in this station** — no new issue, no full pipeline. Guardrails compensate for bypassing review:

1. **Mechanical proof of zero references first:** run the ecosystem tool where applicable (`knip` / `depcheck` / `ts-prune` for TS/JS, `vulture` for Python, `deadcode` for Go — whatever the project has), PLUS a repo-wide text search. Both must agree: zero live references.
2. **Run the targeted tests after deletion.** Any failure → `git checkout` the deletion, report it, stop that item. Never push broken code.
3. **One focused commit:** `refactor: remove dead code from #<id>`.
4. **Any ambiguity** (dynamic imports, reflection, string-based references, public API surface) → do NOT touch. List it in the report as "suspected dead code — needs human judgment".
5. Larger deprecations (renaming live APIs, migrating consumers) are out of scope → route to `deprecation-and-migration`.

---

## 7. Execution Order (strict)

1. **Dry-run preview table first** — Keep / Delete / Relocate / Dead-code, with path, classification, issue state, and rationale per row. Get operator approval when anything is non-obvious.
2. Delete approved files; verify and remove now-empty directories.
3. Handle dead code per Section 6.
4. Commit(s), keeping concerns separate:
   - `chore: prune closed-issue artifacts (#<id>)` for deletions/relocations/staged keepers.
   - `refactor: remove dead code from #<id>` if Section 6 fired.
   - If foreign dirt exists (files you did not touch), commit ONLY your files and list the foreign paths in the report — never bundle strangers.

---

## 8. The Clean Exit Gate (mandatory, last step)

The pipeline is NOT closed until every check passes:

1. `git push` — nothing committed locally stays unpushed.
2. Confirm checkout is on the base branch (`master`/`main` per `gh repo view --json defaultBranchRef`).
3. `git status --porcelain` → **empty**.
4. `git status` → `up to date with 'origin/<base>'` (no ahead/behind).
5. `git fetch --prune` → no dead remote branches; `git branch` → no leftover merged feature branches.
6. Stashes: none related to this issue remain (list any foreign stashes in the report).

If any check fails → fix it or escalate with the exact state. **Never declare closeout on a dirty or diverged folder.**

---

## Hebrew Chat Output Contract (חובת דיווח בעברית)

```markdown
# 🏁 VI - סגירת צינור — Issue #<id>:

## ✅ סטטוס Issue ו-PR:
* **PR:** [#<n>](<url>) 🟢 MERGED
* **Issue:** [#<id>](<url>) — סגור (או: נסגר עכשיו ע"י התחנה — ה-PR מוזג בלי `Closes`)

## 🗑️ שאריות וקבצים זמניים שנוקו:
* [רשימת קבצים שנמחקו/הועברו, עם שורת נימוק אחת לכל אחד]
*(אם לא נמצאו: "הריפו נקי לחלוטין — לא נמצאו שאריות למחיקה.")*

## 🛡️ נכסי ידע קבועים שנשמרו:
* **מצגות ויזואליות:** כל קובצי `docs/issues/*-presentation-*.html` נשמרו כתיעוד קבוע.
* **מחקר ותיעוד:** [מה שנשמר]

## 🧟 קוד מת:
* [מה הוסר + הוכחת אפס-הפניות + טסטים שעברו / "לא נמצא" / "חשוד בלבד — דורש שיקול אנושי: ..."]

## 🚪 שער יציאה נקי:
* **ענף:** `<base>` | **סטטוס:** נקי לחלוטין | **מסונכרן:** up to date עם `origin/<base>` | **אפס שינויים מחכים, אפס branches מתים**

## 🧠 סיכום:
[שורות בודדות בעברית פשוטה: מה נוקה, מה נשמר, והתיקייה מוכנה לעבודה הבאה.]

🎬 רוצה מצגת ויזואלית של השינוי? הרץ `/present-pr <id>` (אופציונלי — מחוץ לצינור).

👉 **שלב הבא:** אין — הצינור סגור. התיקייה על `<base>` נקי ומסונכרן, מוכן ל-`/i-pick-issue` הבא.
```

