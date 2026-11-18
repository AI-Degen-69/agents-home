---
name: asd-ste100
description: "Use when English text must be clear, direct, and unambiguous. Covers tool descriptions, error messages, inter-agent instructions, prompts, READMEs, and technical docs. Also verifies text against the local ASD-STE100 Issue 9 dictionary and linter. Triggers: disambiguate, STE100 rewrite, apply Simplified Technical English, plain-language rewrite, ste-lint, lookup STE word. Not for creative or persuasive copy."
metadata:
  version: 1.0.0
  source: "ASD-STE100 Issue 9 (2025-01-15) + danyuchn/asd-ste100-skill patterns"
---

# Simplified Technical English (ASD-STE100 Issue 9)

ASD-STE100 is the aerospace controlled-language standard built by ASD to stop readers from misreading technical English. It removes the two main sources of misreading: words with more than one meaning, and sentences with more than one possible structure.

Always-on responses follow **STE-Core** in [AGENTS.md](file:///C:/Users/Tiger/.agents/AGENTS.md) (Rule 7). Use this skill when you need an explicit rewrite, a before/after rule breakdown, structural linting (`ste-lint.py`), or strict verification against the local **Issue 9 dictionary** (`references/issue9-dictionary.json`).

## Two Modes

Pick a mode before rewriting. Keep the choice internal unless the user asks for the rule table.

### 1. STE-Core (Software & Agent Mode — Default)

Use for everyday technical prose, READMEs, PR descriptions, prompts, error messages, and agent-to-agent instructions. It enforces every Part 1 structural rule, anti-bloat word swap, nominalization fix, and synonym consistency. Standard software terms (`check`, `test`, `verify`, `build`, `run`, `deploy`, code spans, paths) stay allowed so depth never suffers.

### 2. Strict Issue 9 Mode

Use when the user asks for strict STE compliance, aerospace/hardware procedures, or word-by-word dictionary verification. Enforces the 20-word procedural cap, active-voice instructions, one-word-one-meaning, and verifies vocabulary against `references/issue9-dictionary.json` via `ste-lint.py --strict-dict` and `--lookup`.

## Value-Protection Guardrails (Never Reduce Response Value)

1. **Modality wins over tense.** Hedges (`may`, `might`, `could`, `may have`) carry real confidence levels. Never upgrade a suspected cause (`"The request may have failed."`) into a false fact (`"The request failed."`).
2. **Never add unstated facts.** Never invent a cause, frequency, or mechanism to make a rewrite flow better.
3. **Never delete technical facts to hit a word cap.** Split a 40-word sentence into two or three short sentences instead of cutting edge cases, conditions, or numbers.
4. **Code & identifiers are exempt.** Never paraphrase inline code, CLI flags, API symbols, error codes, or file paths.
5. **Flag precision trade-offs explicitly.** If simplifying a phrase would drop a legal/safety condition or scope qualifier, keep the longer phrase and note it after the output (`Kept as-is: ...`).

## Core Rewrite Rules

### Structural rules (Always enforced)

| Rule | Do | Don't |
|---|---|---|
| Active voice (Rule 3.6) | "The agent deletes the file." | "The file is deleted (by the agent)." (allowed only if actor is unknown) |
| Condition first (Rule 5.4) | "If the build fails, read the log." | "Read the log if the build fails." |
| One instruction per sentence (Rule 5.2) | "Open the file. Read line 3." | "Open the file and read line 3, then parse it." |
| Sentence length (Rules 5.1, 6.3) | <=20 words (instructions), <=25 words (descriptions) | Long multi-clause sentences |
| No semicolons (Rule 8.1) | Split into separate sentences | Use `;` anywhere in prose |
| Multi-word nouns (Rule 2.1) | <=3 words stacked as a noun phrase | 4+ word noun stacks |
| No ellipsis / dropped words (Rule 4.2) | Keep subject, verb, and articles explicit | Drop articles/verbs to save characters |
| Paragraph limits (Rules 6.4-6.6) | 1 topic per paragraph, <=6 sentences | Multi-topic walls of text |
| Vertical lists (Rule 4.3) | Numbered or bulleted list for 3+ steps/conditions | Prose burying 4 sequential steps |

### Lexical & Anti-Slop Rules

| Rule | Do | Don't |
|---|---|---|
| Verb, not nominalization (Rule 3.7) | "Analyze the log." / "Inspect the valve." | "Perform an analysis of..." / "Carry out an inspection of..." |
| No phrasal verbs (Rule 9.3) | "Remove the panel." / "Start the job." | "Take off the panel." / "Spin up the job." |
| One word per concept | Pick one term for one thing and reuse it | Rotate "check" / "verify" / "confirm" for the same action |
| Plain words over bloat | `use`, `to`, `before`, `if`, `now`, `can`, `many` | `utilize`, `leverage`, `in order to`, `prior to`, `in the event that`, `at this point in time`, `has the ability to`, `a large number of` |
| Zero marketing adjectives | State the concrete metric or delete | `seamless`, `robust`, `cutting-edge`, `effortless`, `blazing-fast` |

### Verb Forms & Tense Exception (Rule 3.2 + Modality Rule)

Permitted STE forms are infinitive, imperative, simple present, simple past, simple future, and past participle used as an adjective. Exclude present perfect (`"We have received"`) in favor of simple past (`"We received"`), **unless** current relevance or a modal hedge (`"may have failed"`) carries essential meaning. When tense and modality conflict, **modality wins**.

## Local Linter & Issue 9 Dictionary (`scripts/ste-lint.py`)

This skill includes a deterministic structural linter. It also provides a local JSON index of **ASD-STE100 Issue 9** extracted from your local PDF (`scripts/build_dictionary.py`). The index holds 875 approved entries, 1,314 unapproved entries, 170 approved verbs, and 39 recurring errors.

Run these commands in PowerShell (`pwsh`):

```powershell
# Lint a Markdown or text file for structural STE rules
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint.py" path\to\file.md

# Lint procedural text with strict 20-word sentence cap
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint.py" --max-words 20 path\to\proc.md

# Lint piped stdin text as JSON
"Your text here." | python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint.py" --json

# Lint with local Issue 9 dictionary warnings (software terms exempt)
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint.py" --strict-dict path\to\file.md

# Strict aerospace/full dictionary check (no software whitelist)
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint.py" --strict-dict --aerospace path\to\file.md

# Look up approved meanings, alternatives, and PDF examples for words
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint.py" --lookup utilize perform check activate

# Rebuild references/issue9-dictionary.json from the local PDF if needed
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\build_dictionary.py"

# Run built-in self-tests
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint.py" --selftest

# Lint a Hebrew file or piped Hebrew text
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint-he.py" path\to\hebrew.md
"טקסט לבדיקה." | python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint-he.py" --json
rtk python "C:\Users\Tiger\.agents\skills\asd-ste100\scripts\ste-lint-he.py" --selftest
```

Useful CLI flags: `--baseline N` fails only when hard violations exceed `N`, and `--disable rule1,rule2` silences named rules (repeatable). Known rule IDs: `semicolon`, `long-sentence`, `phrasal-verb`, `marketing-adjective`, `nominalization`, `bloat-phrase`, `synonym-rotation`, `dangling-conjunction`, `passive-voice` (advisory), `present-perfect` (advisory), `unapproved-word` (advisory with `--strict-dict`).

## Hebrew STE-Core Rules (Adapted from `g4lb/asd-ste100-hebrew-skill`)

ASD-STE100 defines English only, so these Hebrew rules adapt the structure rules without banning everyday dev nouns (`דיבוג`, `קינפוג`, `דיפלוי`):

| Rule | Hebrew Standard | Avoid |
|---|---|---|
| Sentence length | `<=16` words (instructions), `<=20` words (explanations) | Stacked clauses over 20 words |
| Clause & `סמיכות` cap | Max 1 `ש-` clause per sentence and `<=3` nouns in `סמיכות` | Chained `אשר`/`ש-` or 4-noun chains |
| Hyphen before Latin/digits | `ב-API`, `ה-JSON`, `ב-2025` (or maqaf `־`) | `בAPI`, `הJSON`, `ב2025` |
| One instruction form | Infinitive every time (`לפתוח את הקובץ. לבדוק את הלוג.`) | Mixing `פתח`, `תפתח`, `יש לפתוח` |
| Verb, not nominalization | `לבדוק`, `להשוות`, `להחליט`, `לענות` | `לבצע בדיקה`, `לערוך השוואה`, `לקבל החלטה`, `מתן מענה` |
| Modality & spelling | Keep `ייתכן`/`עשוי`/`אולי` hedges and write full words | Deleting hedges or using `בד"כ`/`עפ"י`/`וכו'` |

Non-trivial Hebrew responses follow Rule 8 of [AGENTS.md](file:///C:/Users/Tiger/.agents/AGENTS.md) and render inside a `dir="rtl"` HTML artifact. Use [writing-rules-he.md](references/writing-rules-he.md) and `ste-lint-he.py` for full Hebrew checks.

## Rewrite Process

1. Pick the mode (**STE-Core** default vs. **Strict Issue 9**).
2. Read the entire input for meaning, conditions, and confidence qualifiers (`may`, `could`, `might`).
3. If reviewing a file or long block, run `ste-lint.py` (with `--strict-dict` in Strict mode, and `--lookup` for questionable words).
4. Rewrite flagged sentences without dropping any fact, scope qualifier, or hedge.
5. Check the output format rules below before printing. If the input already complies, say so cleanly.

## Output Format

- **Default:** Return the rewritten text alone with no preamble, no mode label, and no summary. Add a single `Kept as-is:` line at the bottom **only** when you deliberately kept a longer phrase or compound tense to preserve precision or modality.
- **On request** ("show the diff", "which rules did it break", "before/after"): output a before/after markdown table naming each violated rule (`Rule violated | Original | Simplified`). Follow the table with the violation count and any `Kept as-is:` note.

## References & Examples

- [`references/writing-rules.md`](references/writing-rules.md) — Summary of all 53 rules across 9 sections, GR-1..GR-8, and Issue 9 updates.
- [`references/writing-rules-he.md`](references/writing-rules-he.md) — Hebrew STE adaptation rules and `ste-lint-he.py` mapping.
- [`examples/before-after.md`](examples/before-after.md) — Worked examples across STE rules and agent text.
- [`references/issue9-dictionary.json`](references/issue9-dictionary.json) — Local Issue 9 dictionary index (do not redistribute outside your machine).
- [`references/ASD-STE100 (Issue 9).pdf`](references/ASD-STE100%20(Issue%209).pdf) — Local copy of the official Issue 9 standard PDF.
