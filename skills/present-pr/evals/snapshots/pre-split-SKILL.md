---
name: vii-present-pr
description: "Station VII (Present PR & Visual Showcase) — Builds a dynamic, customer-simple HTML page that explains what was done. Picks the best visual for the job (flow, timeline, before/after, map, numbers, demo) based on session context. No fixed template. Plain words, no dev jargon. Also handles explain-mode for any question or design."
---

# Station VII: Present PR (`vii-present-pr`)

This skill turns finished work into one clear HTML page a normal person can understand.
It works in any project, and also serves as the pipeline's Station VII closer when run inside the pipeline.

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

## Pipeline Position
- **Station:** Station VII of VII
- **Previous Station:** `vi-prune-artifacts` (or `v-babysit-pr-and-merge`)
- **Pipeline Closeout:** Final Station

---

## 1. Invocation

```bash
/vii-present-pr <issue-number>   # Visual page for a specific ticket
/vii-present-pr                  # Auto-find the latest ticket from the project's plan notes or tracker
/vii-present-pr explain          # Explain-mode: current change/question with no ticket
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

| Story shape | Best centerpiece to use | When to use it | Borrow from |
| --- | --- | --- | --- |
| **Steps / process** | Flow chart (2-5 boxes with arrows, swimlanes if 2 actors) | Work was a sequence: first X, then Y, then Z. | archify Workflow |
| **Call chain over time** | Sequence lifelines (vertical lifelines + arrows + return dashes) | API calls, cache fallback, auth, retries. Show who calls whom, in what order. | archify Sequence |
| **Data moves + transforms** | Dataflow pipeline (Canvas animated dots along pipe, stepped) | Pipeline, ETL, cache -> DB, PII boundary. | archify Dataflow + explain-this continuous |
| **States + retries** | Lifecycle rail (phase columns 0-4, waits vs terminal split) | Status machine, retry loop, cancel path. | archify Lifecycle |
| **Broken then fixed** | Before / After split | Clear pain before, clear gain after. | classic |
| **Parts that connect** | Simple map (boxes + lines, one primary path highlighted) | System has parts that talk to each other. | archify Architecture |
| **Over time** | Timeline (left to right) + scrubber slider | Work happened in phases, or thing changes with time. Let reader drag time. | archify + param-explore |
| **Numbers / result** | Big numbers + small labels | Faster, cheaper, fewer clicks, saved time. Show the number huge. | classic |
| **Choice made** | Tabbed compare (3 tabs max, click to switch Canvas) | We picked A over B. Show why in plain words. Reader clicks tabs. | explain-this tabbed |
| **Can be touched** | Tiny live demo: slider / toggle / stepper (Step+Play+Reset bar) | Best option when possible. Let reader click to feel the change. | explain-this stepped / param |
| **How it works** | Guided story (scroll steps, sticky nav, 1 Canvas per step) | Needs 3-4 scroll steps, each with one picture + one line. | explain-this distill |

Figure interaction picker (pick ONE control set, not all):
- `step-play`: Step + Play + Reset buttons + `Step: N` readout — for discrete behaviors (retry, rollout, cache miss).
- `slider`: 1-2 range sliders + live value label — for "what if X changes?" (timeout, threshold, count).
- `tabs`: 2-3 tab buttons, `.active` on selected — for option compare or variants.
- `scrub`: single timeline slider — for phases over time.
- `flow`: auto-animated dots via `requestAnimationFrame`, Pause only — for data moving.
- `static`: no controls — for before/after, map, numbers. Do not add fake buttons.

Skeleton picker (change this too, not just the figure):
- `hero-demo`: title + huge centerpiece + 1 support. Use for demo-able / numbers.
- `split`: title + before/after or option-compare side by side. Use for broken-fixed / choice.
- `article`: distill-style — sticky left TOC + 720px column + figures inline + callout. Use for how-it-works / sequence / dataflow that needs prose.
- `rail`: full-width rail diagram on top, 2 small cards below. Use for lifecycle / map / flow.

Palette picker (must rotate — never reuse last page's accent):
- bugfix: `--accent: #f17c78` on dark, or light paper `#FAF8F4` + `#C2410C`
- speed win: `--accent: #55d6c2` / `#059669`
- new feature: `--accent: #82AAFF` / `#2563EB`
- choice / compare: `--accent: #f4b860` / `#B45309`
- system map: `--accent: #C792EA` / `#6D28D9`
Light paper skeleton (`article`) uses `--bg: #FAF8F4, --ink: rgba(0,0,0,.8)` + serif. Dark skeletons use `--bg: #0b1117, --ink: #eaf1f6`.

Support blocks (pick max 2, only if they add new info):
- One-line plain summary (always, 1-2 lines max)
- Second small visual from the table above (only if centerpiece alone is not enough)
- "Try it yourself" — 1-2 human steps in the real application/project itself (which page/dashboard tab, what to press, what you will see in the live app). Never refer to the generated presentation HTML. A terminal command only as fallback when the change has no screen to touch in the project. Never test runners.
- Links: Issue + PR, one line, with merged mark. No SHA, no build tables.

FORBIDDEN by default (only add if user explicitly asks):
- Files table, code blocks, commit list, CI matrix, architecture jargon.

Decision rule:
- 1-line fix -> summary + tiny before/after line. No flow, no demo. Done. Skeleton `split`, static.
- Bug fix with retry/timeout/fallback -> sequence lifelines OR stepped sim with Step+Play. Skeleton `article` or `hero-demo`. Not plain before/after.
- New thing you can touch -> slider/tabs/stepper demo as centerpiece if you can build it, else flow or map. Skeleton `hero-demo`.
- Pipeline / data moves -> dataflow Canvas with flowing dots. Skeleton `rail`.
- States / retries / cancel -> lifecycle rail. Skeleton `rail`.
- New thing you cannot touch -> map or numbers. Skeleton `rail` or `hero-demo`.
- Idea / question with no PR -> story walk (`article` skeleton) or map. No PR links, no status badge.

State your pick in thinking: "Story = [shape], Centerpiece = [visual], Controls = [step-play/slider/tabs/scrub/flow/static], Skeleton = [hero-demo/split/article/rail], Palette = [name], because [one line]."

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
- Use the CSS library below as style only — borrow colors, panels, buttons. Do NOT copy its section order. Compose only the blocks you picked in Step 2.
- Do not change product code to build the page.

### Component kit (copy-paste, then fill with THIS job's words — vanilla only)

Base shells — pick ONE per page (do not mix dark + light):

```html
<!-- Dark shell (hero-demo / split / rail) -->
<style>
:root { --ink:#eaf1f6; --muted:#9aabb8; --bg:#0b1117; --panel:#121c25; --panel-2:#172530;
--line:#29404d; --accent:#55d6c2; --accent-ink:#06281f; --shadow:0 20px 55px rgba(0,0,0,.28); }
* { box-sizing:border-box } body { margin:0; color:var(--ink); background:var(--bg); font:16px/1.65 "Segoe UI",Tahoma,sans-serif }
main { max-width:1100px; margin:auto; padding:40px 20px 70px }
.panel { background:var(--panel); border:1px solid var(--line); border-radius:18px; padding:26px; margin-top:24px; box-shadow:var(--shadow) }
.figure { border:1px solid var(--line); border-radius:14px; overflow:hidden; background:var(--panel-2) }
.figure-label { font-size:.7rem; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); padding:.8rem 1rem 0 }
.figure-controls { display:flex; gap:.5rem; align-items:center; padding:.6rem 1rem; border-top:1px solid var(--line); flex-wrap:wrap }
.ctrl-btn { font-size:.75rem; padding:.4rem .9rem; border-radius:8px; border:1px solid var(--line); background:#fff; cursor:pointer }
.ctrl-btn.primary { background:var(--accent); border-color:var(--accent); color:var(--accent-ink); font-weight:700 }
.ctrl-btn.active { background:var(--ink); color:var(--bg) }
.figure-caption { font-size:.78rem; color:var(--muted); padding:.6rem 1rem .8rem; border-top:1px solid var(--line) }
.callout { border-left:3px solid var(--accent); background:rgba(255,255,255,.04); padding:1rem 1.2rem; border-radius:0 8px 8px 0; margin:1.2rem 0 }
</style>
<!-- Light article shell (distill-style, for how-it-works / sequence / dataflow with prose) -->
<style>
:root { --ink:rgba(0,0,0,.8); --muted:rgba(0,0,0,.54); --bg:#FAF8F4; --panel:#fff; --line:rgba(0,0,0,.08);
--accent:#2563EB; --accent-light:#EFF6FF; --accent-dark:#1E40AF; }
body { background:var(--bg); color:var(--ink); font:18px/1.75 Georgia,serif }
.page { max-width:960px; margin:auto; padding:0 24px; display:flex; gap:40px }
.sidebar { width:200px; position:sticky; top:24px; height:fit-content; font:12px sans-serif }
.content { flex:1; max-width:680px } .figure { background:#fff; border:1px solid var(--line); border-radius:8px; overflow:hidden; margin:2rem 0 }
@media(max-width:900px){ .sidebar{display:none} .page{display:block} }
</style>
```

Shared JS (put once per page):
```js
const dpr = window.devicePixelRatio||1;
function initCanvas(id){ const c=document.getElementById(id); const x=c.getContext('2d');
const w=c.width,h=c.height; c.width=w*dpr; c.height=h*dpr; c.style.width=w+'px'; c.style.height=h+'px';
x.scale(dpr,dpr); return {canvas:c,ctx:x,w,h}; }
```

1) Sequence lifelines (SVG — use for call chain):
```html
<svg viewBox="0 0 640 220" role="img" style="width:100%;height:auto">
<!-- 3 lifelines + 3 arrows, dashed returns. Replace labels with THIS job's actors. -->
</svg>
```

2) Dataflow dots (Canvas flow — use for pipeline):
```js
(function(){ const {ctx,w,h}=initCanvas('canvas-flow'); let t=0;
// Canvas API does NOT parse CSS vars — read the real hex once, at page load:
const ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#55d6c2';
const pts=Array.from({length:18},(_,i)=>({o:i/18}));
function draw(){ ctx.clearRect(0,0,w,h); ctx.strokeStyle='rgba(255,255,255,.15)'; ctx.lineWidth=22;
ctx.beginPath(); ctx.moveTo(40,h/2); ctx.lineTo(w-40,h/2); ctx.stroke();
ctx.fillStyle=ACCENT; } // always a real hex — falls back to the speed-win accent if --accent is unset
function loop(){ t+=0.016; draw(); requestAnimationFrame(loop);} loop(); })();
```

3) Lifecycle rail (HTML — use for states):
```html
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
<div class="panel">Waiting</div><div class="panel">Trying</div>
<div class="panel">Retry wait</div><div class="panel" style="border-color:var(--accent)">Done ✓</div>
</div>
```

4) Tabbed compare (use for choice):
```html
<div class="figure-controls" id="tabs-x">
<button class="ctrl-btn active">Before</button><button class="ctrl-btn">After</button>
</div>
```

5) Stepper (use for retry/behavior):
```html
<div class="figure-controls"><button class="ctrl-btn primary" id="s-step">Step</button>
<button class="ctrl-btn" id="s-play">Play</button><button class="ctrl-btn" id="s-reset">Reset</button>
<span id="s-info">Step: 0</span></div>
```

6) Slider explorer (use for threshold/count):
```html
<div class="figure-controls"><span>Wait</span>
<input id="p-x" type="range" min="1" max="10" value="3"><span id="p-v">3s</span></div>
```

Ideas borrowed:
- archify: 5 typed diagrams (architecture/workflow/sequence/dataflow/lifecycle) + pick-by-content + one primary path.
- explain-this: distill article skeleton, hand-built Canvas IIFEs (stepped / flow / tabs / slider), DPR-aware `initCanvas`, captions that say what to watch, callouts for key insight.

---

## 7. Step 5 — Preview, verify, reveal

- Open the page with your environment's preview mechanism so it appears before the operator.
- Check the real render (snapshot / screenshot / logs or equivalent): fix blank output, clipping, errors, hard words before finishing. Iterate until clean.
- Additionally show it to the operator directly: open it in a browser and reveal it in the file manager, using whatever commands the OS offers.
- Headless env: skip opening, still verify the render.

---

## Hebrew Chat Output Contract

**Strict Prohibition:** NEVER output test-runner commands (`pytest`, `npm test`, `jest`, `vitest`, or equivalents). Tests already passed earlier. Manual check is human touch-and-see only.
**Strict Instruction on "Try it yourself":** Direct the user to try the change in the REAL APPLICATION / PROJECT itself (the running system, UI dashboard, app screen, or CLI), NEVER in the generated presentation/HTML showcase.
**No Meta-showcase in Chat:** Do NOT output the section "🖼️ איך בחרתי להציג את זה / How I chose to show it" in the chat report — keep the chat report focused solely on the value, how to try it in the real application, and links/paths.

```markdown
# 🎨 סיכום והצגת PR:

### 📊 Issue ו-PR:
* **Issue:** [#<id> - <title>](<url>)
* **PR:** [#<n> - <title>](<url>) 🟢 MERGED

---

### 🧠 מה השתנה (במילים פשוטות):
* [לפני העדכון: מה לא עבד או מה היה חסר]
* [עכשיו: מה השתפר ומה אפשר לעשות]

---

### 🕹️ נסה בעצמך (באפליקציה / בפרויקט עצמו):
1. **איפה ללחוץ / מה לפתוח:** [מסך האפליקציה / טאב / כפתור במערכת החיה עצמה; פקודת הרצה רק אם אין ממשק גרפי, לעולם לא פקודות בדיקה (tests) ולעולם לא הפניה למצגת שנוצרה]
2. **מה תראה בפועל:** [הוכחה חזותית אמיתית באפליקציה/במערכת]

---

* 👁️ Preview: ready and checked in the preview
* 🌐 Browser: opened auto for the operator
* 📁 File manager: opened auto with the file marked
* 📄 Path: [full path of the saved page]

🎉 Done: work explained, page saved and checked.
```
