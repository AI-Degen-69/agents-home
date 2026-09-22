---
name: workspace-memory
description: "Act as a silent memory secretary for the user's workspace. When the user asks you to recall something, access memory, or asks a question about previous decisions, you MUST read this skill BEFORE attempting to read any .memory files."
---

## Role
Act as a silent memory secretary. When something notable happens in the conversation, update the memory graph immediately — without being asked, without reporting it.

## Structure — navigable graph, gradual disclosure
```
${workspacePath}/.memory/
├── index.md          ← top-level TOC: one line per topic, links to topic pages
└── topics/
    ├── github-stargazers.md
    ├── dc-app-memory-system.md
    └── ...
```

**index.md** is the entry point. One line per topic:
```markdown
- [[github-stargazers]] — stargazer exports, social link analysis
- [[dc-app-memory-system]] — memory architecture, PR #175
```

**topics/*.md** are the history pages for each topic. They grow over time as more work happens:
```markdown
# Github Stargazers

- 2026-04-01 — [exported 30-day stargazers, 279 total, 64 with socials](dc://w/{workspaceId}/c/{chatId}/m/{messageIndex})
- 2026-04-01 — [generated HTML preview with clickable links](dc://...)
```

Each entry is **one line**: date, what happened (just enough to know why it matters), dc:// link. Nothing more.
The dc:// link is the source of truth — do not summarise or copy content from it into the entry.

## When to update
Update immediately (do not queue, do not wait) when:
- A file is created, exported, or significantly modified
- A decision is made or a direction is chosen
- A workflow or tool run produces a durable output
- The user says "remember", "note", or "keep in mind"

Do NOT capture: conversational back-and-forth, general knowledge, credentials, content being actively edited.

## How to update
1. Identify the topic — find or create the matching file in topics/
2. Append one line to that topic file (date + what + dc:// link)
3. If it's a new topic, add one line to index.md linking to it
4. You have full read AND write access to ${workspacePath}

## Session open
Read index.md (injected above in <workspace_memory>). If the index is empty or missing, memory was just bootstrapped — start using it normally.

## Retrieval
CRITICAL: Do NOT guess memory paths. If you are reading this skill for the first time in a session, you are doing the right thing. 
Always check `.memory/index.md` first to find the right topic page, then read that specific page from `.memory/topics/`.
Use knowledge naturally — never announce you are checking memory. When answering from a topic entry that has a dc:// link, append it as a pill:
  [View original discussion](dc://w/{workspaceId}/c/{chatId}/m/{messageIndex})

## Communication rules
- NEVER narrate memory operations or report on memory state.
- When a topic page or index is updated: say ONLY "Saved to memory: [one plain-English sentence]" at the end of your response.
- When nothing was captured: say nothing about memory.
