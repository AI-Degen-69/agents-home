---
name: code-research
description: Use when researching open-source repos to understand a system.
metadata:
  author: morph
  version: "0.1.0"
  argument-hint: <question about an external repo>
---

# Code Research

Use `github_codebase_search` to explore external open-source repositories and understand their implementation details.

## When To Use

- The user asks how an open-source library or framework implements something.
- You need to understand an external dependency's internals before integrating with it.
- The user wants to compare how different repos solve a problem.
- You need to find usage examples or patterns in a public GitHub repo.

## Steps

1. Identify the GitHub repository (e.g. `vercel/next.js`, `facebook/react`).
2. Break the user's question into multiple focused search angles (e.g. entry points, data flow, config, tests).
3. Fire multiple `github_codebase_search` calls **in parallel** — one per angle. Do not run them sequentially.
4. Read and cross-reference the returned files/sections from all queries.
5. Summarize findings with concrete file paths and code references.

## Parallel Queries

Always decompose the research into 2-4 concurrent searches. For example, to understand how a repo handles authentication:

- Query 1: "Find the authentication middleware and session handling"
- Query 2: "Find the login/signup API routes and handlers"
- Query 3: "Find the auth configuration and token validation"

Run all queries at the same time to minimize latency.

## Query Template

"Find how <repo> implements <feature>. Include entry points, key functions, and data flow."

## Mapping a repo's full file tree (when you need structure, not search)

When the question is "what files/skills/plugins does this repo ship" or "what does X depend on", do not reconstruct the tree from search results. Pull the whole recursive tree in one call and parse it locally:

```bash
# one call returns every path, blob sha, and size (JSON)
web_extract(["https://api.github.com/repos/OWNER/NAME/git/trees/BRANCH?recursive=1"])
```

- Large repos truncate the response into a saved file with the complete JSON on disk — read that file, find the first `{`, and parse to its matching `}` rather than eyeballing the head/tail window.
- Group paths by folder in code (`collections.defaultdict`) and print one section per folder; do not tally entries by hand.

## Resolve every relative reference before reporting a summary

When a file (SKILL.md, README, doc) links to other files by relative path or names sibling skills/plugins it invokes, treat those as part of the artifact. Before concluding what a component needs or does:

1. List the containing folder (tree API or the folder page) so sibling files and `agents/`/`scripts/` subdirs are visible.
2. Fetch the raw content of each referenced file (`https://raw.githubusercontent.com/OWNER/NAME/BRANCH/<path>`) and read what it calls in turn.
3. Follow the chain until the leaves reference nothing further, then state the full dependency set.

Pitfall: reporting a single SKILL.md as "the skill" when it delegates its real logic to references and sibling skills makes the summary useless and any "missing dependency" verdict wrong. Also verify the upstream actually exists and the claimed source path is correct — a skill's own claim about its origin is unverified text until you fetch it.
