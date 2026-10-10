# present-pr — Ad-hoc Visual Showcase (not a station)

> Full station map: [`docs/issue-to-pr-skill-workflow.md`](../../docs/issue-to-pr-skill-workflow.md).

Turns finished work into one clear HTML page a normal person can
understand. Customer-simple, one centerpiece visual, never the same
page twice. Optional — never mandatory, never on the pipeline path.

> Agent contract: [`SKILL.md`](./SKILL.md) (source of truth).
> Component kit: [`references/component-kit.md`](./references/component-kit.md) ·
> Visual pickers: [`references/visual-pickers.md`](./references/visual-pickers.md).

## Pipeline position

- **Position:** Ad-hoc skill — no station number, outside the pipeline.
- **Suggested by:** Station VI (`vi-close-pipeline`) after closeout — or
  invoked directly at any time (even on old PRs, even with no ticket).
- **Next:** none — it ends with a saved page + a short report.

## When to use / when not

| Use when | Don't use when |
|---|---|
| Explaining merged work to a customer in plain words | Proving code works before review — that's Station IV's browser gate |
| A visual walkthrough of what changed and what to try | A status report with dev jargon — this skill bans it |
| Explain-mode: a question or design with no ticket | Pipeline closeout duties (prune, issue close, exit gate) → `vi-close-pipeline` |

## How it works (short)

1. Reads the context (merged PR, diff, conversation) — the issue's
   plan/notes are a nice-to-have, never a requirement.
2. Picks the visual AFTER understanding: exactly one centerpiece
   (flow / timeline / before-after / map / numbers / demo) + up to 2
   supports; last-2-pages rule forces variety.
3. Writes customer-simple copy (word swaps: PR→update, issue→problem,
   pipeline→steps — no code words, no file paths, no test commands).
4. Saves the page in the project (`<id>-presentation-<title>.html`),
   `git add`s it immediately, verifies statically, reveals
   fire-and-forget in the operator's browser.

## Files in this folder

| Path | What it is |
|---|---|
| `SKILL.md` | Agent contract (visual rules, build + verify, output contract). |
| `references/component-kit.md` | Copy-paste kit: base shells, `initCanvas()`, six snippets. |
| `references/visual-pickers.md` | Centerpiece-family pickers. |
| `evals/` | Eval set + pre-split snapshot. |

## Quality bar

A 12-year-old can follow it: one big visual carries the story, short
lines, something to press in the real app — never "test inside the
presentation file".

## Example

```bash
/present-pr 42
# → builds the page for #42, saves <id>-presentation-<title>.html,
# opens it in the browser, reports value + try-it-yourself 
```
