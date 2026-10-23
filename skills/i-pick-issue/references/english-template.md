# English Chat Output Contract — `i-pick-issue`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

### In Discovery Mode (no argument):

```markdown
# 🗺️ Next Tasks to Pick:

## 📋 Open Issues:
- [#<id> - <title>](<url-issue>) — [one line: what problem it solves or feature it adds]
- [#<id> - <title>](<url-issue>) — [one line: what problem it solves or feature it adds]

## 🎯 Recommended Next Step:
- **Recommended Issue:** [#<id> - <title>](<url-issue>)
- **Why this one:** [Short explanation in plain words: why this makes the most sense next]

---

## ➡️ Next Step:
- Run **`/ii-plan-issue <id>`** to begin planning the recommended issue, or specify a different issue number.
```

### In Orchestration Mode (End-to-End Orchestration):

```markdown
# ✅ [Station Name] Completed

## 🎯 What Was Achieved:
[One sentence: what was completed, in plain words]

---

## 🧭 Current Status:
[1-2 clear lines: where the task stands right now]

👉 **Next Step:** Run **`[Next Station Command]`**

### Station V Post-Merge — Retro Option:
After Station V merges the PR, offer the operator:

> PR merged. Would you like to run **`/retro`**? It analyzes the session and
> proposes environment improvements (navigation pointers, lint rules, coding
> standards) — never code changes. Runs periodically (every 3–5 PRs).
> Reply **yes** to analyze, or **no/skip** to go straight to `/vi-close-pipeline`.
```
