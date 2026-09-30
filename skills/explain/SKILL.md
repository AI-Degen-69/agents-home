---
name: explain
description: "Build a rich visual HTML explanation and show it in Preview"

---

# Explain Visually

Create the clearest, most complete visual explanation of the current question, change, or design. Reconstruct what needs explaining from the conversation, the current diff, and relevant surrounding code or documentation. Favor accurate insight over a generic overview, and make uncertainty explicit.

Write a complete, self-contained HTML document to a file in this thread's workspace (for example under `docs/explanations`). Do not change product code just to build the explanation. Make the document polished, responsive, accessible, and easy to scan. Use as many visual aids as genuinely improve understanding: annotated diagrams, flows, architecture maps, timelines, tables, charts, comparisons, state transitions, callouts, concrete examples, and useful animation or interaction. Prefer inline CSS, JavaScript, SVG, and canvas so the file works without a build step or external dependency; respect reduced-motion preferences. Give the page a coherent narrative and clear visual hierarchy rather than a collection of widgets. Recommended visual patterns live in `references/visual-patterns.md`.

Verify the built file before finishing: valid HTML with no broken references, no console errors, no clipping or blank output, and no weak explanatory gaps; fix anything broken. Then deliver it: when preview tools (`register_preview`, `preview_snapshot`, `preview_screenshot`, `preview_logs`) are available, call `register_preview` with the absolute `htmlPath` and `replace: true` and verify via snapshot, screenshot, and logs. When they are not available, open the file in the browser instead — run it from the terminal (on Windows, `.\name.html` from its folder opens the default browser) — and give the user a clickable absolute file path in chat. Briefly tell the user that the visual explanation is ready and name the source file.