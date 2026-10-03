# Hebrew Chat Output Contract (חובת דיווח בעברית) — `v-babysit-pr-and-merge`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

```markdown
# 🟢 Babysit and Merge — Station V: [#<n> - <כותרת>](<url-pr>)

## 📁 מצב התיקייה:
ענף: `main` | נקי | מסונכרן | PR: [#<n>](<url-pr>) מוזג

## ✅ בדיקות ו-GitHub:
- GitHub: [#<n>](<url-pr>) מוזג, [#<id>](<url-issue>) [נסגר / נשאר פתוח]
- CodeRabbit: [סיים + N הערות טופלו / לא סיים, מוזג על גיבוי + CI ירוק / לא סקר rate-limit]
- בדיקות: [CI ירוק]

## 🔍 טריאז׳ הערות:
- ACCEPT — [מקום + מה תוקן]
- REJECT — [מה נטען ולמה נדחה]

## 💡 מה תוקן מההערות:
- [מקום + בעיה ופתרון]

## 🧠 סיכום:
[מה ביקשת, מה נעשה, מה מוזג — 3 שורות]

---

## ➡️ מה עכשיו:
- הבנייה גמורה והעדכון באוויר. אפשר להראות אותו: **`/present-pr <id>`**
- PR: [#<n>](<url-pr>) | CodeRabbit: [סטטוס סופי]
- בחר לפי מצב התיקייה:
  - נקי → דלג על ניקיון, הרץ **`/i-pick-issue`**
  - מומלץ → הרץ **`/vi-close-pipeline`** — [סיבה]
  - חובה → הרץ **`/vi-close-pipeline`** — [סיבה]
```
