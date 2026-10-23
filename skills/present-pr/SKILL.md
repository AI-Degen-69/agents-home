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

### The 4-Part Surface Story (Zero Behind-the-Scenes Clutter)
When presenting a PR or completed work, never explain internal plumbing, reviewer comments, CI tests, or mechanical diffs. Tell a clean 4-part surface-level story:
1. **The Issue:** What was broken or missing from a human/user perspective.
2. **The Surface Change:** What changed across this whole run at the surface/product level (no dev plumbing).
3. **The New Reality:** What we have now after the change and what the user should expect to see.
4. **Dual Verification Runway:**
   - **Instant Mockup:** An interactive visual mockup right on the generated HTML page for a 3-second gut-check without spinning up dev servers.
   - **Real App Runway:** Step-by-step guidance to touch and verify the change in the live product itself.

## Who is reading?

A customer or operator. Not a compiler.

- **Language & Direction:** Write the generated HTML presentation page in **Hebrew by default** (`<html lang="he" dir="rtl">`), styled with clean RTL layout and typography (unless the user explicitly requests English). English technical names, code identifiers, and verbatim labels remain in English with `<span dir="ltr">` where needed to avoid BiDi artifacts.
- **Dry facts with clickable links:** Include clickable links to the merged PR and Issue right in the header/meta bar for instant navigation.
- **On-page manual verification runway:** Include the step-by-step "how to check it yourself in the real app" guide directly on the page in Hebrew so anyone opening the presentation knows how to verify live.
- No code plumbing words. No internal file paths or commit hashes.
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
- **Ad-hoc skill — no station number, never mandatory.** The operator may invoke it directly at any time. Station VI (`vi-close-pipeline`) suggests it after closeout — but only a **clean** one; when Station VI ends blocked or incomplete, it does not offer this skill until the folder is cleared.
- **If Station VI has not run yet:** this skill is invoked after the merge but before closeout — run `/vi-close-pipeline` first, or state in the report that the pipeline is not closed yet.
- **If Station VI already ran:** building the page writes a file, so re-verify the clean exit afterwards — `git status --porcelain` empty, on base branch, and push anything staged. If the page cannot be committed cleanly (foreign dirt present), report the staged path and leave the commit to the operator rather than bundling strangers.
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
6. **Screen first in the actual application / project (Dual Verification).** Verification and "try it yourself" in the real world start from what the person can see and press in the real running project/app (UI screen, page, dashboard tab, button). Never direct the user to test inside the generated HTML presentation file itself. A terminal command is only a fallback when the change has nothing to see or press in the project. Never test runners. The HTML page itself provides an instant interactive mockup to touch and feel the behavior in 3 seconds without spinning up a dev server or dependencies.
7. **No filler.** If a block repeats what the centerpiece already says, delete it. No empty boxes.
8. **Standalone file.** One HTML file, inline CSS + vanilla JS, no outside files, no CDN, no npm. Works on phone and desktop, respects reduced-motion. Canvas via shared `initCanvas()` helper (DPR-aware). SVG hand-built inline.
9. **Verbatim UI Quotation & Domain Label Grounding (Zero Guessing / Synonyms).** Every term, parameter name, tab label, button text, or status chip presented on the page or in verification steps MUST be quoted verbatim from the actual codebase/UI template files (field names, button text, HTML labels). NEVER invent poetic synonyms, high-level abstractions, or loose conceptual terms (e.g. if the UI displays `Pricing Band Lower Bound`, write exactly that — never "sweet spot", "lower margin", or "price range"). Before writing any label or verification step, grep/read the UI code to extract the literal string the user sees on screen. Decode its direction and meaning against the source code, and state what it does in plain words next to the exact on-screen label.
10. **When a label or direction is corrected, fix every surface that repeats it.** A page shows the same comparison in several places — the live figure (row/sort order, highlight, readout), the table or list, and the caption. Patch all of them in one edit, or the page ends up self-contradicting (chart ordered one way, table the other) and the operator has to point at the second half themselves. Re-run the static checks and re-`git add` after the fix.

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

For every name, preset, mode or threshold the page will mention, open the file that defines it and write down the plain-word meaning and the direction it acts in. A demo or table built from copied preset values without this read will be wrong in a way the reader spots immediately — a domain name read backwards is the one error a customer-simple page cannot survive, because the page's whole claim is that it is the clear version.

Write down in plain words (for yourself, not the page):
- What was the problem for the person? (The Issue)
- What changed across the whole run at a surface level? (The Surface Change — no dev plumbing, CI test passes, or reviewer comments)
- What is the new reality now? (What the user should expect to see)
- How will the user verify? (Instant mockup in the HTML page + real app walkthrough)

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

- Save the page into **`docs/pr-presentations/`** — the home for visual summaries of a pull request and the changes in it. Filename `<pr>-<slug>.html`, where `<pr>` is the pull-request number (the merge/change number once one exists). Never `docs/issues/`, `docs/presentations/`, the repo root, or a scratch folder: an unreserved folder dies unowned and invisible to every guard. A question or design explainer that is not about a PR belongs to the `explain` skill (`docs/explanations/`).
- Filename: `<id>-presentation-<short-title>.html`, kebab-case slug, `<id>` first (that is how the operator and the close-out station find it).
- `<id>` = merge/change number when one exists, otherwise the ticket id; in explain-mode use the topic's short title.
- **Default Language & Structure:** The HTML document must default to Hebrew: `<html lang="he" dir="rtl">` with readable modern fonts (e.g. `system-ui, -apple-system, "Segoe UI", Roboto, "Heebo", Arial, sans-serif`). English technical terms or code paths should be wrapped in `<span dir="ltr">` or `<code>` blocks to preserve visual flow without BiDi distortion.
- The copy-paste kit (base shells, shared `initCanvas()` JS, six snippets: lifelines, dataflow dots, lifecycle rail, tabs, stepper, slider) lives in [references/component-kit.md](references/component-kit.md). Borrow colors, panels, buttons — do NOT copy its section order. Compose only the blocks you picked in Step 2.
- Do not change product code to build the page.
- Hygiene rule: `git add` the page immediately — never leave it untracked. If the tree holds only this page, commit it with the issue's work; otherwise stage it and name the foreign dirt in the report instead of bundling strangers. Verify the branch (`git branch --show-current`) in the same command as the commit — a status check made ten tool calls earlier does not count: a concurrent session switched the worktree between the check and the commit in practice, and the page commit landed on their branch. A commit that lands on a foreign branch is backed out with `git reset --soft HEAD~1` (never `--hard`, which destroys the other stream's uncommitted work) and re-committed in your own worktree.

---

## 7. Step 5 — Verify the file, then reveal

- **Verify before reveal — statically, no browser:** run `node scripts/verify-html.js <file.html>` (or verify statically): the file parses as complete HTML (doctype, closing tags), all inline JS is syntactically valid, no external resources referenced. Static checks only — this station owns no browser-based verification (that is Station IV's exclusive domain).
- **Reveal — fire-and-forget:** launch the file with the OS's one-shot open command (`open <file.html>` on macOS; on Windows `cmd //c start "" "<ABSOLUTE native path>"`) so it loads in the operator's default browser — a relative path opens a terminal window instead of the file. The agent must NOT drive, navigate, or control the browser afterwards — the launch process ends the agent's involvement. Optionally also reveal the file in the OS file manager (`explorer /select,<path>` or equivalent).
- Headless env: skip the reveal, keep the static checks and state the path in the report.
- **A correction pass is expected, not a failure.** When the operator pushes back on a label, a direction, or an explanation, treat it as a content defect rather than a style argument: fix the page (every surface — figure, table, caption), rerun the static checks, re-`git add`, relaunch it. In the same reply, answer the question on its merits with the file-and-line evidence you actually read — explain why the domain name points where it does before restating the corrected wording, and name any real cost of the design the reader's intuition was reacting to (e.g. a wide setting that fills so slowly it can buy nothing — the reader's instinct often senses a genuine trade-off). Offering a documentation follow-up for the misread term belongs in that reply: the next reader will trip on it too. When the follow-up is approved, land the explanation in the project's own domain docs, not only in the presentation page.
- If the page has a live-behavior risk the operator must see working, note it in one line for the operator to check by eye — do not automate it here.

---

## Final verification walkthrough (mandatory input to the report)

The report delivers **dual verification**:
1. **Instant Mockup:** The generated HTML page provides an interactive centerpiece/mockup so the operator can inspect and touch the change in 3 seconds without spinning up dev servers or dependencies.
2. **Real App Runway:** Step-by-step guidance built from the live product, not from the presentation file:
   - **Start from the written record when there is one:** the PR body's `## How to verify`, then the issue body. Use its commands and expected values verbatim; if a step is stale or missing, fix it and say so in one line rather than publishing a second, different walkthrough.
   - Name the real screen / tab / button the operator opens in the running app.
   - Quote every on-screen label, section header, or parameter name **verbatim** from the codebase/template (e.g. `Pricing Band Lower Bound`) so the operator can search or identify it instantly without guessing.
   - Use as many short steps as it takes for clarity — no step cap. Every step is one quick action: where → what to do → what to see.
   - Use `→` arrows between screens and give a direct link when one exists. Plain words, no jargon.
   - Say exactly what to look at (text, state, count) so the operator knows it worked.
   - Prefer visual proof. Backend-only with nothing to see → say so in one line plus how it was checked automatically.

**Strict Prohibition:** NEVER output test-runner commands (`pytest`, `npm test`, `jest`, `vitest`, or equivalents). Tests already passed earlier. Manual check is human touch-and-see only.
**Strict Instruction on "Try it yourself":** Direct the user to try the change in the REAL APPLICATION / PROJECT itself (the running system, UI dashboard, app screen, or CLI), NEVER in the generated presentation/HTML showcase.
**No meta-showcase in chat:** Keep the chat report focused solely on the value, how to try it in the real application, and links/paths.

---

<!-- local-only:present-pr:output-template-begin -->
The chat output template for this station is `references/english-template.md` (default).
Read it before writing your first report.
If the operator explicitly requests Hebrew output, use the Hebrew template at `references/hebrew-template.md`.
<!-- local-only:present-pr:output-template-end -->
