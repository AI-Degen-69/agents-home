# Visual Pickers (Step 2 companion)

Canonical source for the vii-present-pr Step 2 pickers. `SKILL.md` keeps the
story-shape table; this file holds the controls, skeletons, palettes, support
blocks, and the decision rule. Never the same page twice: rotate centerpiece +
palette + skeleton (Core Rule 3 in `SKILL.md`).

## Figure interaction picker (pick ONE control set, not all)

- `step-play`: Step + Play + Reset buttons + `Step: N` readout — for discrete behaviors (retry, rollout, cache miss).
- `slider`: 1-2 range sliders + live value label — for "what if X changes?" (timeout, threshold, count).
- `tabs`: 2-3 tab buttons, `.active` on selected — for option compare or variants.
- `scrub`: single timeline slider — for phases over time.
- `flow`: auto-animated dots via `requestAnimationFrame`, Pause only — for data moving.
- `static`: no controls — for before/after, map, numbers. Do not add fake buttons.

## Skeleton picker (change this too, not just the figure)

- `hero-demo`: title + huge centerpiece + 1 support. Use for demo-able / numbers.
- `split`: title + before/after or option-compare side by side. Use for broken-fixed / choice.
- `article`: distill-style — sticky left TOC + 720px column + figures inline + callout. Use for how-it-works / sequence / dataflow that needs prose.
- `rail`: full-width rail diagram on top, 2 small cards below. Use for lifecycle / map / flow.

## Palette picker (must rotate — never reuse last page's accent)

- bugfix: `--accent: #f17c78` on dark, or light paper `#FAF8F4` + `#C2410C`
- speed win: `--accent: #55d6c2` / `#059669`
- new feature: `--accent: #82AAFF` / `#2563EB`
- choice / compare: `--accent: #f4b860` / `#B45309`
- system map: `--accent: #C792EA` / `#6D28D9`

Light paper skeleton (`article`) uses `--bg: #FAF8F4, --ink: rgba(0,0,0,.8)` + serif.
Dark skeletons use `--bg: #0b1117, --ink: #eaf1f6`.

## Support blocks (pick max 2, only if they add new info)

- One-line plain summary (always, 1-2 lines max)
- Second small visual from the story table in `SKILL.md` (only if centerpiece alone is not enough)
- "Try it yourself" — 1-2 human steps in the real application/project itself (which page/dashboard tab, what to press, what you will see in the live app). Never refer to the generated presentation HTML. A terminal command only as fallback when the change has no screen to touch in the project. Never test runners.
- Links: Issue + PR, one line, with merged mark. No SHA, no build tables.

FORBIDDEN by default (only add if user explicitly asks):
- Files table, code blocks, commit list, CI matrix, architecture jargon.

## Decision rule

- 1-line fix -> summary + tiny before/after line. No flow, no demo. Done. Skeleton `split`, static.
- Bug fix with retry/timeout/fallback -> sequence lifelines OR stepped sim with Step+Play. Skeleton `article` or `hero-demo`. Not plain before/after.
- New thing you can touch -> slider/tabs/stepper demo as centerpiece if you can build it, else flow or map. Skeleton `hero-demo`.
- Pipeline / data moves -> dataflow Canvas with flowing dots. Skeleton `rail`.
- States / retries / cancel -> lifecycle rail. Skeleton `rail`.
- New thing you cannot touch -> map or numbers. Skeleton `rail` or `hero-demo`.
- Idea / question with no PR -> story walk (`article` skeleton) or map. No PR links, no status badge.

State your pick in thinking: "Story = [shape], Centerpiece = [visual],
Controls = [step-play/slider/tabs/scrub/flow/static], Skeleton =
[hero-demo/split/article/rail], Palette = [name], because [one line]."
