# English Chat Output Contract — `iv-review-build-and-pr`

Local-only operator template. Never published — the sync strips the pointer block
in `SKILL.md` and never copies this file.

```markdown
# 🚢 Review & PR Created: [#<n> - <title>](<url-pr>)

## 🎯 What Was Shipped:
[1-2 clear sentences: what capability was built and verified for Issue [#<id>](<url-issue>)]

## 📊 Change Visual:
[First element of the PR body — Mermaid diagram, file-tree diff, or call tree showing the change at a glance]

## ⚠️ Merge Danger:
[Decision: one/two-way door · Blast radius: N files, Low/Moderate/High · Rollback: Easy/Moderate/Hard]

## 🔍 Quality & Review Findings:
- `code-review-and-quality`: [Finding] — [Fixed / No fix needed]
- `security-reviewer`: [Finding] — [Fixed]
*(Clean reviewers with no findings are omitted)*

## 🤖 CodeRabbit Review Status:
- **Status:** [Review running / Started / Awaiting queue / Rate-limited / Skipped + reason]
- **Direct PR Link:** [#<n> - <title>](<url-pr>)

---

## ➡️ Next Step:
- PR is open and undergoing review. Run **`/v-babysit-pr-and-merge`** to monitor feedback, resolve comments, and merge.
```
