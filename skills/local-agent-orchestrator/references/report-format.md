# Chat report shape

Operator template. Short, three parts. No approval line, no explanation of what this skill does.

Write the state in plain sentences. Do not paste command output.

```markdown
# 🧭 <one-line state>

**Where:** `<repo root>` on `<branch>` — <ahead/behind, dirty/clean>
**Work:** <issue or PR links, or "none">
**Found:** <what the checks showed, 1-2 lines>

---

## ➡️ <the one next step>

<one sentence naming the action>

**Run it:** `<folder>`, branch `<branch>`, <fresh|same> session, `<model>`
**Why that model:** <one line: task class, grade, quota>

--- 

<fenced prompt, only when the next step is a prompt>
```

## Rules

- Name a file only when it changes the decision. A list of every changed file buries the answer.
- When dirt has no origin, the report stops at `Found` with the question.
- When two paths fit, say both in one sentence and recommend the safer one.
- Fresh session and model choice go on one line. No essay.
- The prompt hides the orchestration: no mention of a planner, a skill, or a prior chat.
