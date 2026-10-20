# Hebrew Chat Output Contract (חובת דיווח בעברית) — `i-pick-issue`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

### במצב Discovery (ללא ארגומנט):

```markdown
# 🗺️ משימות לבחירה:

## 📋 משימות פתוחות:
- [#<id> - <title>](<url-issue>) — [שורה אחת: איזה בעיה זה פותר או מה נוסף]
- [#<id> - <title>](<url-issue>) — [שורה אחת: איזה בעיה זה פותר או מה נוסף]

## 🎯 המלצה לשלב הבא:
- **משימה מומלצת:** [#<id> - <title>](<url-issue>)
- **למה דווקא זו:** [הסבר קצר במילים פשוטות: למה הכי הגיוני להתחיל בזו עכשיו]

---

## ➡️ השלב הבא:
- הריצו **`/ii-plan-issue <id>`** כדי להתחיל בתכנון המשימה המומלצת, או ציינו מספר משימה אחרת.
```

### במצב תזמור (End-to-End Orchestration):

```markdown
# ✅ [שם התחנה] הושלמה

## 🎯 מה הושג:
[משפט אחד: מה הושלם, במילים פשוטות]

---

## 🧭 סטטוס נוכחי:
[1-2 שורות ברורות: איפה המשימה עומדת כרגע]

👉 **השלב הבא:** הריצו **`[פקודת התחנה הבאה]`**
```
