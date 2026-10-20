# English Chat Output Contract — `quick-fix`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

```markdown
# ⚡ Quick Fix Deployed: [#<id> - <title>](<url-issue>)

## 🛠️ What Was Fixed:
[1-2 clear sentences: what was broken or missing, and how it behaves correctly now]

## 👁️ Surface Experience:
- **Before:** [What the user saw or experienced when it failed]
- **After:** [What the user sees or experiences now]

## 🧪 Verification & Proof:
- **Check passed:** [Plain explanation of the verification command run and the verified outcome]
- **Safety Gate:** All 7 quick-fix criteria met (≤2 files, no new behavior, no API changes, verified).

## 📌 Issue Status:
- Closed and documented in [#<id>](<url-issue>)

---

## ➡️ Next Step:
- Workspace is clean and ready. Run **`/i-pick-issue`** to select the next issue.
```

**Never in this template:** commit hashes, push output, "clean tree" prose, a CodeRabbit
status line (there is no CodeRabbit in this lane), or a claim that review happened.
