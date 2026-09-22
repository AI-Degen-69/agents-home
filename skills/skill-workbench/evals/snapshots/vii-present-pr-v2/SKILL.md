---
name: vii-present-pr
description: "Station VII (Present PR & Visual Showcase) — Builds a dynamic, customer-simple HTML page that explains what was done. Picks the best visual for the job (flow, timeline, before/after, map, numbers, demo) based on session context. No fixed template. Plain words, no dev jargon. Also handles explain-mode for any question or design."
---

# Station VII: Present PR (`vii-present-pr`)

This skill closes the pipeline with one clear HTML page a normal person can understand.
It also runs outside the pipeline whenever the user asks to explain something visually.

Two jobs, one page:

1. **Close the pipeline** — explain what was worked on, what changed, and what the result is now.
2. **Explain for real** — make the clearest visual for this specific case, not a status report.

## Who is reading?

A customer. Not a developer.

- No code words. No file paths. No commit numbers. No test commands.
- Say what it does for the person, not how it was built.
- If you must use a dev word, translate it right away.

Word swaps to use:
- "PR / merge / diff" -> "update / change put live"
- "issue / task" -> "problem / request"
- "workflow / pipeline" -> "steps"
- "validate / verify" -> "check it works"
- "refactor / architecture" -> "tidy up inside / how parts connect"
- "endpoint / API / CLI" -> "connection / screen / button you press"

## Pipeline Position
- **Station:** Station VII of VII
- **Previous Station:** `vi-prune-artifacts` (or `v-babysit-pr-and-merge`)
- **Pipeline Closeout:** Final Station

---

## 1. Invocation

```bash
/vii-present-pr <issue-number>   # Visual page for a specific issue
/vii-present-pr                  # Auto-find latest issue from tasks/plan.md or PR
/vii-present-pr explain          # Explain-mode: current change/question, no pipeline issue
```

Also fires when user says "explain this visually", "show me what was done", "walk me through it".

---

## 2. Core Rules (must follow)

1. **Pick the visual AFTER you understand, never before.** Do not start from a fixed layout. First read the context, then choose.
2. **One main idea, one centerpiece.** Every page has exactly 1 big visual that carries the story. Everything else supports it.
3. **Never the same page twice.** If your last 2 pages used before/after + 3 flow cards, you MUST choose a different mix this time unless the content truly demands it. Max 4 blocks total. Drop the rest.
4. **Customer-simple.** Short lines. Big pictures. If a 12-year-old cannot follow it, rewrite it.
5. **Show, don't tell.** A small click / toggle / picture beats a paragraph.
6. **No filler.** If a block repeats what the centerpiece already says, delete it. No empty boxes.
7. **Standalone file.** One HTML file, inline CSS + vanilla JS, no outside files, works on phone and desktop, respects reduced-motion.

Anti-slop check (from html-explainer):
- No emoji as icons for every header.
- No decorative gradients and generic card grids that say nothing.
- No lorem-style generic copy. Every word must be about this job.
- One real visual risk per page: a metaphor, a drawing, a demo that fits THIS topic.

---

## 3. Step 1 — Gather context (5 min max)

Read what applies:
1. The conversation: what was asked, what was decided, what is still unsure.
2. The real change: `git diff`, key files — but only to understand, never to paste.
3. The Issue: `gh issue view <id> --comments` — problem + what was wanted.
4. The PR: `gh pr view <n> --comments` — what was done + merged state.
5. The plan: `tasks/plan.md` — tasks finished.

Write down in plain words (for yourself, not the page):
- What was the problem for the person?
- What did we do?
- What can the person do now that they could not do before?

---

## 4. Step 2 — Classify the story, then pick the visual

Ask: what kind of story is this? Pick ONE centerpiece. This is the dynamic part.

| Story shape | Best centerpiece to use | When to use it |
| --- | --- | --- |
| **Steps / process** | Flow chart (2-5 boxes with arrows) | Work was a sequence: first X, then Y, then Z. Inspired by archify Workflow. |
| **Broken then fixed** | Before / After split | Clear pain before, clear gain after. |
| **Parts that connect** | Simple map (boxes + lines) | System has parts that talk to each other. Inspired by archify Architecture. |
| **Over time** | Timeline (left to right) | Work happened in phases, or thing changes with time. |
| **Numbers / result** | Big numbers + small labels | Faster, cheaper, fewer clicks, saved time. Show the number huge. |
| **Choice made** | Option compare (2 columns) | We picked A over B. Show why in plain words. |
| **Can be touched** | Tiny live demo (button, toggle, slider) | Best option when possible. Let reader click to feel the change. Inspired by html-explainer micro-demos + explain-this Canvas figures. |
| **How it works** | Guided story (scroll steps) | Needs 3-4 scroll steps, each with one picture + one line. Inspired by explain-this distill style. |

Support blocks (pick max 2-3, only if they add new info):
- One-line plain summary (always, 1-2 lines max)
- Second small visual from the table above (only if centerpiece alone is not enough)
- "Try it yourself" — 1 human step: where to click, what you will see. Never test commands.
- Links: Issue + PR, one line, with merged mark. No SHA, no build tables.

FORBIDDEN by default (only add if user explicitly asks):
- Files table, code blocks, commit list, CI matrix, architecture jargon.

Decision rule:
- 1-line fix -> summary + tiny before/after line. No flow, no demo. Done.
- Bug fix -> before/after OR demo. Add flow only if the bug was a sequence.
- New thing you can touch -> demo as centerpiece if you can build it in HTML, else flow or map.
- New thing you cannot touch -> map or numbers.
- Idea / question with no PR -> story walk or map. No PR links, no status badge.

State your pick in thinking: "Story = [shape], Centerpiece = [visual], because [one line]."

---

## 5. Step 3 — Write customer-simple words

- Title = what the person gets, not what we built. Bad: "Auth refactor #42". Good: "Log in now takes 1 click".
- First line = problem -> fix -> result in one breath.
- Use the word swaps above.
- Short lines. One idea per line.
- Say what is unsure if evidence is thin. Do not invent.

Example tone:
> Before: you had to wait and guess if it worked.
> Now: you press one button and see the answer right away.

---

## 6. Step 4 — Build & save the HTML

- Path: `docs/issues/<id>-presentation-<slug>.html`
- `<id>` = PR number if exists, else issue ID; explain-mode uses short title.
- `<slug>` = short kebab-case title.
- Use the CSS library below as style only — borrow colors, panels, buttons. Do NOT copy its section order. Compose only the blocks you picked in Step 2.
- Legacy names (`<id>-showcase-<slug>.html`, `<id>-explained.html`) still count — new files always use `-presentation-`.
- Do not change product code to build the page.

### Style library (borrow look, not layout)

```html
<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><What person gets></title>
  <style>
    :root {
      --ink: #eaf1f6; --muted: #9aabb8; --bg: #0b1117;
      --panel: #121c25; --panel-2: #172530; --line: #29404d;
      --cyan: #55d6c2; --amber: #f4b860; --red: #f17c78;
      --green: #79d99b; --shadow: 0 20px 55px rgba(0,0,0,.28);
    }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--bg);
      font: 16px/1.65 "Segoe UI", Tahoma, sans-serif; }
    main { max-width: 1100px; margin: auto; padding: 40px 20px 70px; }
    .panel { background: var(--panel); border: 1px solid var(--line);
      box-shadow: var(--shadow); border-radius: 18px; padding: 26px; margin-top: 24px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
    .flow-card { padding: 20px; background: var(--panel-2);
      border: 1px solid var(--line); border-radius: 14px; }
    .big-num { font-size: 3rem; font-weight: 800; color: var(--cyan); }
    .before { border-top: 4px solid var(--red); }
    .after { border-top: 4px solid var(--green); }
    svg { max-width: 100%; height: auto; }
    button { cursor: pointer; border-radius: 8px; padding: 8px 14px; }
    @media (max-width: 768px) { .grid-2, .grid-3 { grid-template-columns: 1fr; } }
    @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
  </style>
</head>
<body>
  <main>
    <!-- COMPOSE ONLY WHAT STEP 2 PICKED. Example order, not required:
      1. Title + 1-line result
      2. CENTERPIECE (one of: flow svg / map svg / timeline / big numbers / demo / story)
      3. 1 support block max
      4. Try-it-yourself (1 step, human only)
      5. Links line
    -->
  </main>
  <script>
    // Only for the demo/toggle you picked. Keep it tiny.
    // Example: document.querySelectorAll("[data-toggle]")...
  </script>
</body>
</html>
```

Ideas borrowed:
- html-explainer: process over template, one centerpiece, playable demo, quality look-and-check.
- archify: pick diagram type by content (flow vs map vs sequence vs timeline).
- explain-this: scroll story, hand-built SVG/Canvas figures, fact-check every claim to real diff/issue.

---

## 7. Step 5 — Launch preview, verify, reveal

- `register_preview` with absolute `htmlPath`, `replace: true`.
- `preview_snapshot` + `preview_screenshot` + `preview_logs` — fix blank, clipping, errors, hard words before finishing.
- Open browser + Explorer for operator:
  - `Start-Process (Resolve-Path "docs\issues\<id>-presentation-<slug>.html").Path`
  - `explorer.exe /select,(Resolve-Path "docs\issues\<id>-presentation-<slug>.html").Path`
- Headless env: skip open, still verify snapshot.

---

## Hebrew Chat Output Contract

**Strict Prohibition:** NEVER output `pytest`, `npm test`, `jest`, `vitest`, or any automated test runner. Tests already passed in Station IV. Manual check is human touch-and-see only.

```markdown
# 🎨 סיכום והצגת PR:

### 📊 Issue ו-PR:
* **Issue:** [#<id> - <title>](<url>)
* **PR:** [#<n> - <title>](<url>) 🟢 MERGED

---

### 🧠 What changed (2 lines, plain words):
[What person could not do before. What they can do now. No dev words.]

### 🖼️ How I chose to show it:
Story = [steps / broken-fixed / parts-map / timeline / numbers / choice / demo-able]
Centerpiece = [flow / before-after / map / timeline / big numbers / demo / story]
Why = [one line why this is clearest for this job]

---

### 🕹️ Try it yourself:
1. **Where to click / what to open:** [screen or button only, no tests]
2. **What you will see:** [exact visual proof]

---

* 👁️ Preview: ready and checked in Preview tab
* 🌐 Browser: opened auto (`ii docs/issues/<id>-presentation-<slug>.html`)
* 📁 Explorer: opened auto with file marked
* 📄 Path: `docs/issues/<id>-presentation-<slug>.html`

🎉 Done: Stations I to VII complete. Repo clean and checked.
```
