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

## Verify, then deliver

Verify the built file before finishing: valid HTML with no broken references, no console errors, no clipping or blank output, and no weak explanatory gaps; fix anything broken. Then deliver it: when preview tools (`register_preview`, `preview_snapshot`, `preview_screenshot`, `preview_logs`) are available, call `register_preview` with the absolute `htmlPath` and `replace: true` and verify via snapshot, screenshot, and logs. When they are not available, open the file in the browser instead — run it from the terminal (on Windows, `.\name.html` from its folder opens the default browser) — and give the user a clickable absolute file path in chat. Briefly tell the user that the visual explanation is ready and name the source file.
