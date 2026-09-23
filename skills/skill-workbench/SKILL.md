---
name: skill-workbench
description: Single entry-point workbench for the skill lifecycle in the global agents folder — inventories all skills, validates them against the agentskills.io Specification, audits them with truthful confident-only criticism and proactive improvement proposals, and routes deep work to the right helper (skill-creator for authoring/evals, skill-refinement-loop for refinement). Use when the user says "skill workbench", asks to check/audit/validate/improve a skill, wants a skills health report, or asks where a skill sits in its lifecycle.
---

# Skill Workbench (`skill-workbench`)

The workbench for the whole skill lifecycle: **inventory → validate → audit →
route → deploy**. It is a coordinator and quality gate, not a reimplementation —
deep work is delegated to existing helpers.

**Home:** global agents folder (`~/.agents/skills/skill-workbench`), consumed by
all harnesses via the link-type matrix in `skills/README.md` (Junction for
Claude Code / Hermes, SymbolicLink for Gemini CLI / Antigravity).

## Files

- `references/spec-checklist.md` — the agentskills.io Specification distilled
  into checkable rules with stable check-ids. Read before interpreting any
  validator finding.
- `references/audit-policy.md` — truthful-criticism + proactive-improvement
  policy, and the standing audit/alignment flow. Read before auditing.
- `references/reporting-contract.md` — canonical progress-then-final-summary
  reporting contract, shared with `skill-refinement-loop`. Read before fixing
  findings or reporting on a batch of work.
- `scripts/validate.js` — zero-dependency validator (single skill or `--all`,
  `--json` for machine use). Exit 0 = clean, 1 = findings, 2 = usage error.
- `scripts/score.js` — zero-dependency scorer: 0–100 per metric + overall, for
  one skill (`--json` for machine use). Deterministic; reuses validate-lib.js.
- `scripts/inventory.js` — one-glance state of every skill in the root.
- `evals/evals.json` — this skill's own eval set.

## Modes

### 1. No args — Workbench Discovery

1. Run `node scripts/inventory.js` (add `--json` when another tool consumes it).
2. Present in this fixed order, each under its own header (every line opens
   with a Hebrew word):
   - Summary line first: `סך הכל <total> סקילים` + counts.
   - `## בדיקות חסרות 🧪` — top 3 most urgent without evals, then `ועוד X נוספים...` if more. Clean skills are never listed in full.
   - `## אזהרות ⚠️` — top 3, then `ועוד X נוספים...`.
   - `## לטפל קודם ❌` — top 3 violations, then `ועוד X נוספים...`.
3. Then `## המלצה 🎯` — exactly **one** skill (inventory.js ranks for you:
   violations first, then never-evaluated, then warns) plus one line on how to
   approach it (validate → audit → route).
4. Then `## בחירה 👉` — operator picks by number from the lists (e.g.
   `לטפל קודם 1` / `אזהרה 2` / `בדיקות 1`). List items open with a Hebrew
   word (`1. סקיל ...`).
5. **Halt for operator choice.** Do not pick silently.

### 2. With a skill name — Single-Skill Workbench

Work these steps in order; report after each so the operator sees progress.

**Step A — Validate & Score.** Run `node scripts/validate.js <skill-folder>`,
then `node scripts/score.js <skill-folder>`. Every fail must be resolved or
explicitly accepted by the operator before routing. Interpret check-ids via
`references/spec-checklist.md`.

The scorer produces 0–100 per metric (deterministic, weights sum to 100):

| Metric | Weight | What it measures |
|---|---|---|
| `spec-compliance` | 40 | Frontmatter + structural spec rules (each fail impairs proportionally) |
| `file-integrity` | 25 | Relative file refs + phantom skill refs resolve |
| `eval-readiness` | 20 | `evals/evals.json` exists, parses, has cases with prompts |
| `size-discipline` | 10 | Body lines vs progressive-disclosure budget (≤250 full marks → 0 at 600) |
| `self-containment` | 5 | Auxiliary folders (`scripts/`, `references/`, …) present |

Report the scorecard **inside the מצב הסקיל section** (below), and let the
scores drive routing in Step C: `eval-readiness` < 100 → eval gap;
`spec-compliance`/`file-integrity` < 100 → fix-first; overall ≥ 90 with full
evals → deploy check. Overall ≥ 90 = excellent, ≥ 75 good, ≥ 50 needs-work,
else poor.

**Step B — Audit.** Follow `references/audit-policy.md`:
- Confident, grounded findings only — never invented (אין להמציא).
- Proactive proposals that serve the skill's main objective or a collateral
  metric (speed, output format, research usage, trigger fidelity) — presented
  for adopt/defer/drop, never folded in silently.
- Output a compact loop record.

**Step C — Lifecycle routing** (with the helper-integrity gate, below). State
where the skill sits and hand off — never duplicate the helper's work:

| Situation | Route to |
|---|---|
| Missing / broken / create from scratch | `skill-creator` |
| Exists but never eval-tested | `skill-creator` (evals) or `skill-refinement-loop` Phase 1 |
| Known failure mode / iteratively refine | `skill-refinement-loop` |
| Mechanically clean, no eval gap | Deploy check (Step D) |

**Helper-integrity gate:** before every hand-off, run
`node scripts/validate.js <helper-folder>` on the helper itself. If the helper
fails validation, report it and offer the standing audit/alignment flow
(`references/audit-policy.md` §3) on it first. This keeps every route
trustworthy — the gate applies to any helper, not just the two above.

**Step D — Deploy check.** Verify harness links exist with the correct link
type per `skills/README.md` (Junction vs SymbolicLink). Check only; print the
exact commands. Run them only on explicit operator approval. Step D is a hard
gate: no «סיכום סופי» before Step D is done (links verified) or explicitly
deferred by the operator, and the summary must state the deploy state.

### 3. Validate-only

Run the validator, report findings, stop. No audit, no routing, no deploy.

## Conventions

- **The worked-on skill is the star.** Title opens with a Hebrew word:
  `סקיל: <name>`, plus group tag when it belongs to one (numbered Pipeline
  stations `i`–`vii`, the system skills `pipeline-triage` / `create-issue`, or
  `ecc-*` → ECC). Line below opens with
  `נתיב:` + full path; if Junction show `→` target and always work on the
  original. Workbench machinery gets one compact line each.
  Never enumerate steps or check-ids in the headline of the reply.
- **Dashboard** (when an HTML report is produced): save inside the worked-on
  skill's own folder — `skills/<name>/docs/workbench-report-<date>.html` — as a
  durable doc. Verify in the Preview tab (snapshot/screenshot/logs) before
  delivery. Never `.freebuff/` or temp.
- This skill must itself pass its own validator: run
  `node scripts/validate.js <agents-root>/skills/skill-workbench` after any edit.

## Hebrew Chat Output Contract (חובת דיווח בעברית)

Bidi rule (חובה — תיקון כיווניות): כל שורה מתחילה במילה עברית — זה מה
שקובע כיוון מימין לשמאל. שמות לטיניים / נתיבים / פקודות / check-id
נכתבים בגרש בודד עם מבודדי כיווניות מסביב — ⁦`...`⁩ (U+2066 LRI לפני
הגרש הפותח, U+2069 PDI אחרי הגרש הסוגר). אמוג'י תמיד אחרי המילים,
אף פעם לא בתחילת שורה.

```markdown
# סקיל: ⁦`<skill-name>`⁩ [(קבוצה — Pipeline / ECC, רק אם שייך)]

נתיב: ⁦`<full path>`⁩ [→ ⁦`<target>`⁩ אם Junction — לעבוד תמיד על המקור]

## תקציר הסקיל 📋
[תמונה מסוכמת של הסקיל וההוראות שלו — מבוסס רק על מה שנקרא בפועל ב־⁦`SKILL.md`⁩ + ⁦`references/`⁩]

מטרת הסקיל: [משפט אחד — מה הסקיל אמור לתת בסוף]

הוראות:
1. [מה הסקיל מורה לסוכן לעשות — פועל + מושא]
2. [מה לקרוא — קובץ / רפרנס, בגרש מבודד ⁦`...`⁩]
3. [באיזה רפרנס להשתמש כדי ליישם מה]
4. [מה נוצר — קובץ / פלט / דוח]
5. [גישה לסקיל אחר — שם בגרש מבודד + למה]
6. [הפעלת תת־סוכן — איזה סוג + לאיזו משימה]
[להמשיך לפי הצורך — צעד אחד ממוספר לכל הוראה, לפי סדר הקריאה ב־⁦`SKILL.md`⁩. אין להמציא צעדים]

## מצב הסקיל 📊
[שורה־שתיים בלבד: כמה הפרות + שמותיהן. בדיקות שעברו מסוכמות במילה אחת, לא מפורטות]

### ציון מספרי (חובה — פלט של `scripts/score.js`)

**ציון כללי: <overall>/100 (<verdict>)** — אחר כך שורה לכל מדד, בפורמט:
`<score>/100` ⁦`<metric-id>`⁩ (משקל <w>). סדר קבוע:
`spec-compliance` (40) · `file-integrity` (25) · `eval-readiness` (20) ·
`size-discipline` (10) · `self-containment` (5). מדד מתחת ל־100 זוכה לשורת
הסבר אחת — מה הפיל אותו (שמות ה-check-id מהטבלה ב-Step A). ציון מלא לא
מפורט. אין להמציא ציונים — רק פלט הסקורר.

## ממצאי ביקורת 🔍
[פורמט CodeRabbit — ראה "פורמט ממצאים (חובה)" למטה. ממצאים נכתבים אחד־אחד
בכרטיסים ממוספרים (ממצא 1, ממצא 2...), כל ממצא מגובה בקוד או בתקן,
אין להמציא. שאלות פתוחות לא נכתבות כאן — רק בסעיף שאלות פתוחות]

## שאלות פתוחות ❓
[רק אם יש — כל שאלה במספר משלה, שורה ריקה בין שאלה לשאלה. פורמט לכל שאלה:]
[שאלה 1: טקסט השאלה — מה צריך החלטת מפעיל]
[ניחוש: התשובה הסבירה ביותר לפי ההיגיון — נחשב נכון אם לא עונים או לא דוחים]
[אין שאלות = לכתוב: אין שאלות פתוחות. אין להמציא]

## הצעות שיפור 💡
[כל הצעה במספר משלה, שורה אחת, שורה ריקה בין הצעה להצעה. להחלטתך: לאמץ / לדחות / להשמיט]

## ניתוב 🧭
[שורה אחת תמציתית: מה הולך לקרות ומי עושה את זה. אם חסום — מה האישור הנדרש.
אין פירוט, אין שלוש שורות. אמוג'י רק בסוף כותרות, אף פעם לא בסוף שורות —
אין הוראה כזאת בחוזה, ואין להמציא אותה כתירוץ לצפיפות]

## הבא 👉
[שלושה צעדים קבועים, ממוספרים, כל צעד בשורה אחת:]
[1. לטפל בכל הממצאים אחד־אחד בתוך הסקיל — כולל השאלות הפתוחות והניחושים — לפי «טיפול בממצאים אחד־אחד» למטה]
[2. לבחור פרטים ספציפיים (לאמץ / לדחות / להשמיט לכל ממצא, שאלה והצעה)]
[3. לבדוק את הפלט של הסקיל בסימולציה בצ'אט — לראות את הפלט ולערוך לפיו]
```

במצב Discovery: שורת סיכום בעברית + 3 כותרות בסדר קבוע (בדיקות חסרות →
אזהרות → לטפל קודם), כל אחת עד 3 פריטים + ⁦`ועוד X נוספים...`⁩, נקיים
לא מוצגים. אז המלצה אחת + איך לגשת, אז בחירה לפי מספר, ועצור לבחירת
המפעיל. כל שורה מתחילה במילה עברית. אין לבחור בשקט.

## פורמט ממצאים (חובה) — בסגנון CodeRabbit

ממצאי ביקורת מוצגים בטבלה מקובצת לפי קטגוריה, ואחריה כרטיס פרטים לכל ממצא —
בדיוק כמו סקירת CodeRabbit ב-GitHub. מבנה כרטיס ממצא (שלוש שורות, שורה ריקה
בין כרטיס לכרטיס):

```markdown
## ממצאי ביקורת 🔍

| קטגוריה | ממצאים | חומרה |
|---|---|---|
| 📐 איכות ותחזוקה | 2 | 🟡 |
| 🗄️ שלמות נתונים ותשתית | 1 | 🔴 |

### ממצא 1

🗄️ שלמות נתונים ותשתית | 🟡 מינורי | ⚡ ניצן מהיר

**כותרת קצרה בפועל לתיקון.**

תיאור בן שתיים־שלוש שורות: מה לא עקבי, איפה בדיוק (קובץ + שורות,
בגרש מבודד), ומה נדרש כדי שהרשומה תהיה חד־משמעית. מגובה בקוד או בתקן,
אין להמציא. שאלות פתוחות הולכות לסעיף שאלות פתוחות בלבד — לא כממצאים.
```

קטגוריות קבועות (ממצא נופל לקטגוריה הקרובה ביותר): 📐 איכות ותחזוקה,
🗄️ שלמות נתונים ותשתית, ⚡ ביצועים ויעילות, 🧪 בדיקות וכיסוי, 📝 תיעוד
ותקינות, 🔒 אבטחה ואמינות.

חומרה: 🔴 קריטי / 🟠 מייג'ור / 🟡 מינורי. מאמץ: ⚡ ניצן מהיר / 🔧 בינוני /
🏗️ מבני. חובה: תגית הקטגוריה מופיעה ראשונה בשורת התגים, אחריה חומרה ואז
מאמץ, מופרדות בפס עם רווחים מסביב. הכותרת הקצרה היא משפט פעולה בבולד,
ובתיאור אין פסקאות.

## טיפול בממצאים אחד־אחד (אופציה 1 של «הבא 👉»)

כשהמפעיל בוחר באופציה 1 — לטפל בכל הממצאים אחד־אחד, כולל השאלות הפתוחות
והניחושים — הדיווח על פי [חוזה הדיווח](references/reporting-contract.md)
(הגדרה קנונית משותפת עם ⁦`skill-refinement-loop`⁩ — שם ההכללה, כאן היישום):

- ממצא אחד בכל פעם: תיקון בתוך הסקיל, ואז ולידציה —
  ⁦`node scripts/validate.js <skill-folder>`⁩ חייבת לצאת נקייה לפני מעבר
  לממצא הבא.
- אחרי כל ממצא — דיווח התקדמות בן שורה־שתיים בעברית: מה תוקן, וכמה נשאר
  (⁦`נותרו X ממצאים ו-Y שאלות פתוחות`⁩). לא דוח, לא סיכום — המפעיל חייב
  לראות שהעבודה עוד לא הסתיימה.
- אין «סיכום סופי» חלקי. רק אחרי שכל הממצאים טופלו וכל השאלות הפתוחות נענו
  (בתשובה או בניחוש) ובדיקת הפריסה (Step D) בוצעה או נדחתה מפורשות על ידי
  המפעיל: להריץ מחדש ⁦`scripts/score.js`⁩ + ולידציה סופית נקייה,
  ואז להציג את «סיכום סופי» כולל «דוגמה לשימוש» — וזה סוגר את הוורקבנץ' לסקיל
  הזה.
- שאלות ללא מענה נפתרות בניחוש ומסומנות ככאלה; הצעות שיפור נכנסות לתור רק
  באימוץ מפורש; ממצא שדורש החלטת מפעיל (למשל ויתור מפורש על כלל) עוצר ושואל
  — לא סיכום לפני ההחלטה.

## סיכום סופי (רק אחרי שכל הממצאים והשאלות הפתוחות טופלו — סוגר את הוורקבנץ')

שפה פשוטה, בלי מושגי קוד וטכני. לטינית רק בגרש מבודד ⁦`...`⁩.

```markdown
# סיכום עבודה 🏁: ⁦`<skill-name>`⁩

## מה נעשה ✅
[מה שונה בפועל, בשפה פשוטה]

## למה זה נעשה 💡
[למה זה עוזר למי שמשתמש בסקיל, בשפה פשוטה]

## מה עובד עכשיו 🟢
[מה אפשר לעשות עם הסקיל אחרי התיקון]

## צעדים הבאים 👉
[המלצה אחת מה לעשות מכאן]

## דוגמה לשימוש 💬
[משפט אחד: מתי להפעיל את הסקיל הזה]
```
