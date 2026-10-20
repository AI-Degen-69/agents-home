# English Chat Output Contract — `pipeline-triage`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

```markdown
# 📊 Pipeline Triage — Work in Progress

## 🧭 Where Things Stand:
[1-2 plain sentences summarizing current progress: e.g. "You have uncommitted changes for issue #42", or "All work is merged, workspace is ready for a new task"]

## 🔄 Active Work & Changes:
- **Connected Issue / PR:** [#<id> - <title>](<url-issue>) | PR: [#<n>](<url-pr>) (or `None`)
- **What's in progress:** [Plain English summary of what changes exist on disk and what they belong to]
- **Pending items:** [Uncommitted edits / unpushed commits / review comments / None]

## 🔍 Context & Findings:
[2 simple lines explaining why work paused or what was found upon inspecting the workspace]

---

## ➡️ Next Step — Choose Your Path:
- **If continuing this work:** Run **`[recommended station, e.g. /iii-build-plan or /iv-review-build-and-pr]`**
- **If abandoning/shelving to start fresh:** Run **`/i-pick-issue`**
```
