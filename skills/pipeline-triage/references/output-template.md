# Hebrew Chat Output Contract (חובת דיווח בעברית) — `pipeline-triage`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

```markdown
# 📊 Pipeline Triage — מצב העבודה

## 📁 מצב התיקייה:
ענף: `name` | נקי/מלוכלך | מסונכרן/לא מסונכרן | PR: אין / פתוח [#<n> - <כותרת>](<url-pr>) | נשמר בצד: אין / יש X

**קבצים שהשתנו:**
- `path` — שייך ל-[#<id> - <כותרת>](<url-issue>), [עבודה לא גמורה / זמני]

## ✅ בדיקות ו-GitHub:
- GitHub: [אין עדכון / תגובה נכתבה ב-[#<n>](<url-pr>)]
- בדיקות: [לא רלוונטי כאן / עבר]

## ❓ על מה מדובר:
[שורה אחת פשוטה: מה ביקשת — להמשיך עבודה, להתחיל חדש, או לא ברור]

## 🔍 מה מצאתי:
[2 שורות פשוטות: איפה העבודה עומדת, בלי מילות קוד]

---

## ➡️ מה עכשיו:
- מצב המשימה: [ממשיכים באותה עבודה / מוכן להתחיל חדש]
- הרץ: **`ii-plan-issue` / `iii-build-plan` / `iv-review-build-and-pr` / `v-babysit-pr-and-merge` / `vi-close-pipeline` / `i-pick-issue` — לפי ההחלטה**
```
