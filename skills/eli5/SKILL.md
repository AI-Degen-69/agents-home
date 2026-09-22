---
name: eli5
description: Explain a topic like I'm 5 (ELI5). Creates an interactive, dead-simple visual HTML artifact with big pictures, intuitive diagrams, and few words for someone who knows nothing about the topic. Use when the user types /eli5 <topic> or asks for a dead-simple picture explainer of how something works.
---

# eli5

Explain like I'm someone who knows nothing about this topic, using a HTML artifact with big pictures and few words.

Topic: $ARGUMENTS

## Core Principles

1. **Dead-Simple Explanations**: Explain the concept using intuitive real-world analogies suitable for a 5-year-old or complete beginner. Avoid jargon; if a technical term is necessary, explain it immediately with a simple analogy.
2. **Big Pictures & Visuals**: Use large, beautiful visual components — SVG illustrations, diagrams, visual cards, flow arrows, clean color palettes, and emojis.
3. **Few Words**: Keep text minimal, punchy, and bite-sized. Break explanations into digestible steps.
4. **Interactive HTML Artifact**:
   - Provide a standalone, self-contained HTML artifact (CSS included inline, no external dependencies required unless using standard CDNs like Lucide/Tailwind/fonts).
   - Make it interactive (tabs, step-by-step slider, clickable visual cards, hover reveals, or animations) so the user can easily explore and understand how the system works.
   - Beautiful, modern UI (soft shadows, rounded corners, legible typography, responsive layout).
