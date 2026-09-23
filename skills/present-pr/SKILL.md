---
name: present-pr
description: "Present PR & Visual Showcase (ad-hoc skill, not a pipeline station) — Builds a dynamic, customer-simple HTML page that explains what was done. Picks the best visual for the job (flow, timeline, before/after, map, numbers, demo) based on session context. No fixed template. Plain words, no dev jargon. Also handles explain-mode for any question or design."
---

# Present PR (`present-pr`)

This skill turns finished work into one clear HTML page a normal person can understand.
It is an ad-hoc skill — not a numbered pipeline station — and works in any project, at any time (right after a merge, on an old PR, or in explain-mode with no ticket at all).

Two jobs, one page:

1. **Finish the work** — explain what was worked on, what changed, and what the result is now.
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

## Usage Context
- **Ad-hoc skill — no station number, never mandatory.** Station VI (`vi-close-pipeline`) suggests it after closeout; the operator may also invoke it directly at any time.
- **Sources:** the story is built from the merged PR, the diff, and the conversation — the issue's plan/notes are a nice-to-have, not a requirement, so this skill works even long after cleanup.

---

## 1. Invocation

```bash
/present-pr <issue-number>   # Visual page for a specific ticket
/present-pr                  # Auto-find the latest ticket from the project's plan notes or tracker
/present-pr explain          # Explain-mode: current change/question with no ticket
```

Also fires when user says "explain this visually", "show me what was done", "walk me through it".

---

## 2. Core Rules (must follow)

1. **Pick the visual AFTER you understand, never before.** Do not start from a fixed layout. First read the context, then choose.
2. **One main idea, one centerpiece.** Every page has exactly 1 big visual that carries the story. Everything else supports it.
3. **Never the same page twice — enforced.** If your last 2 pages used before/after + flow cards, you MUST choose a different centerpiece family AND a different accent palette AND a different page skeleton (see Step 2 + Step 4) unless the content truly demands it. Max 3 blocks total (1 centerpiece + up to 2 supports). Drop the rest. Log in thinking: "Last 2 were [X,Y], so this one is [Z] + palette [P] + skeleton [S]."
4. **Customer-simple.** Short lines. Big pictures. If a 12-year-old cannot follow it, rewrite it.
5. **Show, don't tell.** A small click / toggle / picture beats a paragraph. Prefer a Canvas figure you can Step/Play/Drag over a static SVG when the story is a behavior over time.
6. **Screen first in the actual application / project.** Verification and "try it yourself" start from what the person can see and press in the real running project/app (UI screen, page, dashboard tab, button). Never direct the user to test inside the generated HTML presentation file itself. A terminal command is only a fallback when the change has nothing to see or press in the project. Never test runners.
7. **No filler.** If a block repeats what the centerpiece already says, delete it. No empty boxes.
8. **Standalone file.** One HTML file, inline CSS + vanilla JS, no outside files, no CDN, no npm. Works on phone and desktop, respects reduced-motion. Canvas via shared `initCanvas()` helper (DPR-aware). SVG hand-built inline.

Anti-slop check (from html-explainer):
- No emoji as icons for every header.
- No decorative gradients and generic card grids that say nothing.
- No lorem-style generic copy. Every word must be about this job.
- One real visual risk per page: a metaphor, a drawing, a demo that fits THIS topic.

---

## 3. Step 1 — Gather context (5 min max)

Read what applies (use whatever tracker and tools the project uses):
1. The conversation: what was asked, what was decided, what is still unsure.
2. The real change: the code diff and surrounding files — but only to understand, never to paste.
3. The ticket: the problem statement, requirements, what was wanted.
4. The merged change: what was done and its final state.
5. The project plan: the plan notes or task list, if the project keeps one.

Write down in plain words (for yourself, not the page):
- What was the problem for the person?
- What did we do?
- What can the person do now that they could not do before?

---

## 4. Step 2 — Classify the story, then pick the visual

Ask: what kind of story is this? Pick ONE centerpiece family. This is the dynamic part.
Do not default to flow / before-after. Match the shape:

| Story shape | Best centerpiece to use | When to use it |
| --- | --- | --- |
| **Steps / process** | Flow chart (2-5 boxes with arrows, swimlanes if 2 actors) | Work was a sequence |
| **Call chain over time** | Sequence lifelines | API calls, cache fallback, auth, retries |
| **Data moves + transforms** | Dataflow pipeline (Canvas animated dots) | Pipeline, ETL, cache -> DB, PII boundary |
| **States + retries** | Lifecycle rail (phase columns 0-4) | Status machine, retry loop, cancel path |
| **Broken then fixed** | Before / After split | Clear pain before, clear gain after |
| **Parts that connect** | Simple map, one primary path highlighted | System has parts that talk to each other |
| **Over time** | Timeline + scrubber slider | Work happened in phases, or thing changes with time |
| **Numbers / result** | Big numbers + small labels | Faster, cheaper, fewer clicks, saved time |
| **Choice made** | Tabbed compare (3 tabs max) | We picked A over B. Reader clicks tabs |
| **Can be touched** | Tiny live demo: slider / toggle / stepper | Let reader click to feel the change |
| **How it works** | Guided story (scroll steps, 1 Canvas per step) | Needs 3-4 scroll steps, one picture + one line each |

Then pick, in this order — all four tables live in [references/visual-pickers.md](references/visual-pickers.md):
1. **Controls** — one interaction set (`step-play` / `slider` / `tabs` / `scrub` / `flow` / `static`).
2. **Skeleton** — page frame (`hero-demo` / `split` / `article` / `rail`).
3. **Palette** — accent that rotates; never reuse the last page's accent.
4. **Support blocks** — max 2, only if they add new info. FORBIDDEN by default: files table, code blocks, commit list, CI matrix.

The decision rule maps each concrete case to a full pick (e.g. "1-line fix -> summary + tiny before/after line, skeleton `split`, static. Done."). State your pick in thinking: "Story = [shape], Centerpiece = [visual], Controls = [C], Skeleton = [S], Palette = [P], because [one line]."

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

- Save the page inside the project (its docs folder or equivalent), with a clear filename carrying the ticket id and a short title, e.g. `<id>-presentation-<short-title>.html`.
- `<id>` = merge/change number when one exists, otherwise the ticket id; in explain-mode use the topic's short title.
- The copy-paste kit (base shells, shared `initCanvas()` JS, six snippets: lifelines, dataflow dots, lifecycle rail, tabs, stepper, slider) lives in [references/component-kit.md](references/component-kit.md). Borrow colors, panels, buttons — do NOT copy its section order. Compose only the blocks you picked in Step 2.
- Do not change product code to build the page.
- Hygiene rule: `git add` the page immediately — never leave it untracked. If the tree holds only this page, commit it with the issue's work; otherwise stage it and name the foreign dirt in the report instead of bundling strangers.

---

## 7. Step 5 — Verify the file, then reveal

- **Verify before reveal — statically, no browser:** the file parses as complete HTML (doctype, closing tags), all inline JS is syntactically valid, no external resources referenced. Static checks only — this station owns no browser-based verification (that is Station IV's exclusive domain).
- **Reveal — fire-and-forget:** launch the file with the OS's one-shot open command (e.g. `start <file.html>` on Windows / `open <file.html>` on macOS) so it loads in the operator's default browser. The agent must NOT drive, navigate, or control the browser afterwards — the launch process ends the agent's involvement. Optionally also reveal the file in the OS file manager (`explorer /select,<path>` or equivalent).
- **Headless env:** skip the reveal, keep the static checks and state the path in the report.
- If the page has a live-behavior risk the operator must see working, note it in one line for the operator to check by eye — do not automate it here.

---

## Hebrew Chat Output Contract

**Strict Prohibition:** NEVER output test-runner commands (`pytest`, `npm test`, `jest`, `vitest`, or equivalents). Tests already passed earlier. Manual check is human touch-and-see only.
**Strict Instruction on "Try it yourself":** Direct the user to try the change in the REAL APPLICATION / PROJECT itself (the running system, UI dashboard, app screen, or CLI), NEVER in the generated presentation/HTML showcase.
**No Meta-showcase in Chat:** Do NOT output the section "🖼️ איך בחרתי להציג את זה / How I chose to show it" in the chat report — keep the chat report focused solely on the value, how to try it in the real application, and links/paths.

```markdown
# 🎨 סיכום והצגת PR:

## 📊 Issue ו-PR:
* **Issue:** [#<id> - <title>](<url>)
* **PR:** [#<n> - <title>](<url>) 🟢 MERGED

---

## 🧠 מה השתנה (במילים פשוטות):
* [לפני העדכון: מה לא עבד או מה היה חסר]
* [עכשיו: מה השתפר ומה אפשר לעשות]

---

## 🕹️ נסה בעצמך (באפליקציה / בפרויקט עצמו):
1. **איפה ללחוץ / מה לפתוח:** [מסך האפליקציה / טאב / כפתור במערכת החיה עצמה; פקודת הרצה רק אם אין ממשק גרפי, לעולם לא פקודות בדיקה (tests) ולעולם לא הפניה למצגת שנוצרה]
2. **מה תראה בפועל:** [הוכחה חזותית אמיתית באפליקציה/במערכת]

---

* 👁️ Verify: static checks passed (parse + inline JS + no external refs)
* 🌐 Browser: opened fire-and-forget in the operator's default browser
* 📁 File manager: opened auto with the file marked
* 📄 Path: [full path of the saved page]

🎉 Done: work explained, page saved and checked.
```
