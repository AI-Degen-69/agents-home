# English Chat Output Contract — `iii-build-plan`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

```markdown
# 🔨 Built: [#<id> - <title>](<url-issue>)

## 🎯 What Is Now Ready:
[1-2 clear sentences: what capability is now live and working, and what was solved for the user]

## 🌟 What Changed on the Surface:
- ➕ [Location + what is new]
- ✏️ [Location + what was updated or improved]
- 🩹 [Location + what was fixed and now works properly]

## 👁️ Try It Yourself — Step by Step:
1. **Open:** [Screen name / tab / direct link] → [Sub-screen / button]
2. **Do:** [One simple action in plain words]
3. **See:** [What should appear — exact visual readout to look for]
[Additional steps as needed — as many as necessary, each step: Where → Action → Expected result]
*(If backend-only with no UI: describe what works now and how it was proven automatically)*

---

## ➡️ Next Step:
- Everything looks good? Run **`/iv-review-build-and-pr`** to review and ship.
- Notice something off or want adjustments? Run **`/iiib-iterate-after-build <what to adjust>`**.
```
