---
name: explain
description: "Build a rich visual HTML explanation and show it in Preview — full-depth for a question, change or design, or dead-simple ELI5 for someone who knows nothing about the topic. Use for /explain, /eli5, 'explain like I'm 5', 'make a picture explainer', or any request to understand how something works."
---

# Explain Visually

Create the clearest, most complete visual explanation of the current question, change, or design. Reconstruct what needs explaining from the conversation, the current diff, and relevant surrounding code or documentation. Favor accurate insight over a generic overview, and make uncertainty explicit.

**Output path — fixed.** A complete, self-contained HTML document at **`docs/explanations/<topic-slug>.html`**. Kebab-case slug naming the question, no ticket id, no date (`skew-and-taker-cross.html`). Never `docs/presentations/`, never a sibling folder, never the repo root, never a scratch directory. If the explanation is really a visual summary of a pull request or run, that is `present-pr`'s job — it writes `docs/pr-presentations/<pr>-<slug>.html`; hand off instead of duplicating it. The path index for every skill is `~/.agents/docs/artifact-paths.md`.

## Depth

Pick one before building. When the operator is new to the topic — `/eli5`, "like I'm 5", "dead simple", "no jargon" — use **ELI5**. Otherwise use **full**.

**ELI5** (few words, one idea per screen)
- Explain with real-world analogies a complete beginner already knows; the analogy carries the structure, the code carries the accuracy.
- Big visuals: large SVG illustrations, visual cards, flow arrows, one clean palette, emoji only as landmarks.
- Text is minimal and bite-sized — a sentence or two per block, never a wall. If a technical term is unavoidable, define it on the spot with a one-line analogy.

**Full** (the default for a question, design, or change)
- Annotated diagrams, flows, architecture maps, timelines, tables, charts, comparisons, state transitions, callouts, concrete examples, useful animation.
- A coherent narrative and clear visual hierarchy rather than a collection of widgets.

Both: polished, responsive, accessible. Prefer inline CSS, JavaScript, SVG, and canvas so the file works without a build step or external dependency; respect reduced-motion preferences. Never change product code just to build the explanation. Recommended visual patterns live in `references/visual-patterns.md`.

## Operator Voice, Language & Tone Contract

Match the operator's exact communication style, phrasing, and visual presentation standards:

1. **Language & Direction**:
   - **Hebrew by default** (`<html lang="he" dir="rtl">`), styled with clean RTL layout and typography (unless the operator explicitly requests English).
   - **Strict BiDi Isolation**: English technical terms, code, numbers, paths, formulas, and labels must be cleanly isolated in LTR so punctuation and numbers never reverse:
     ```css
     code, .num, .math { direction: ltr; unicode-bidi: isolate; display: inline-block; font-family: Consolas, monospace; }
     ```

2. **Tone & Phrasing (Direct, Pragmatic, High-Signal)**:
   - **Zero AI Fluff / No Chatbot Preamble**: Never use generic filler like "במסמך זה נציג...", "יש לקחת בחשבון ש...", or "טכנולוגיה מתקדמת זו...".
   - **"הרעיון במשפט אחד" First**: Open the narrative with a single, razor-sharp sentence defining the core mechanism and why it exists.
   - **Bottom-Line Framing**: Frame mechanics in terms of concrete outcomes:
     - *"מאיפה הכסף בא ולאן הלך"* (where the edge comes from vs where money leaks).
     - *"מה עובד ומה הורג אותנו"* (what preserves edge vs toxic adverse selection / fees).
     - *"רווח נעול מול זנב לא מגודר"* (locked synthetic arbitrage vs unhedged orphan risk).
   - **Punchy, Quant-Accurate Language**: Use short, crisp sentences with concrete figures: *"חלונות של 5 דקות"*, *"קנייה בלבד של שני הצדדים"*, *"1¢ רצפת מחיר — לא ממלאים מתחת"*, *"עמלות: זניח"*.

3. **Visual Architecture Standards**:
   - **Dark Theme Surface**: `--bg: #0b0e14`, `--panel: #12161f`, `--panel2: #171c28`, `--line: #232a3a`, `--txt: #e8ecf4`, `--mut: #9aa4b8`.
   - **Semantic Color Coding**:
     - **Emerald / Green** (`#34d399` / `#22c55e`): עובד, רווח נעול, צד מנצח, יציב.
     - **Rose / Red** (`#f87171` / `#ef4444`): הורג, הפסד שיורי, זנב לא מגודר, סיכון רעיל.
     - **Gold / Amber** (`#fbbf24` / `#f59e0b`): רצפה, סף מינימום, התרעה, שיווי משקל.
     - **Blue / Cyan / Violet** (`#60a5fa` / `#7c9aff`): מדדים, מתמטיקה, ציר זמן, מבנה.
   - **Top Stat Strip**: Immediately under the title, provide a summary grid of key metrics/chips with large bold numbers (`<b class="up">+$55</b>`) and clear sub-labels.
   - **Numbered Section Badges**: `<span class="n">1</span>` circular accent badges on major headings.
   - **Interactive Tactile Playground**: Whenever a formula, sizing rule, or decision threshold is explained, include interactive sliders with live numerical readouts so the operator can test parameters immediately.
   - **Timeline / Process Flow**: Clean horizontal sequence or timeline showing execution states and lifecycle phases.

## Verify, then deliver

Verify the built file before finishing: valid HTML with no broken references, no console errors, no clipping or blank output, and no weak explanatory gaps; fix anything broken.

**Mandatory Inline Preview Delivery**:
Always deliver the visual explainer with an immediate inline interactive preview in chat:
1. Write the permanent file to `docs/explanations/<topic-slug>.html`.
2. Stage/write a copy into the active conversation's Artifact Directory (`<appDataDir>/brain/<conversation-id>/<topic-slug>.html`) using the native file creation tool with `ArtifactMetadata` (`UserFacing: true`, `RequestFeedback: false`).
3. Embed it inline directly in the chat reply using:
   ```html
   <agent-embed src="file:///<artifact_path>/<topic-slug>.html"></agent-embed>
   ```
4. Provide the clickable markdown link to the permanent workspace file (`file:///.../docs/explanations/<topic-slug>.html`). When preview tools (`register_preview`, etc.) are available, call `register_preview`. Otherwise, launch or open in the default browser on the host (`Start-Process` / `.\name.html`). Never wait for the operator to ask to see or preview it.
