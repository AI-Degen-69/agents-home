# ASD-STE100 Issue 9 Writing Rules — Summary

Summary of Part 1 (Writing Rules) and Part 2 (Dictionary) from **ASD-STE100 Issue 9 (2025-01-15)**. For local lookup of approved words, unapproved alternatives, and official examples, run `ste-lint.py --lookup <word>`.

## Structure of the Standard

- **Part 1 — Writing Rules:** **53 rules** across **9 sections**, plus **8 General Recommendations** (`GR-1` to `GR-8`).
- **Part 2 — Dictionary:** **875 approved entries** (printed UPPERCASE, one meaning and one part of speech per entry) and **1,314 unapproved entries** (printed lowercase with approved replacements and contrasting STE vs. Non-STE examples), plus Recurring Errors (`Page 2-0-17` to `2-0-18`) and Approved Verbs (`Page 2-0-19`).

## General Recommendations (`GR-1` to `GR-8`)

| ID | Topic | Guidance |
|---|---|---|
| GR-1 | The conjunction "that" | Include "that" when omitting it creates a false parse or garden-path reading. |
| GR-2 | The preposition "with" | Use clear prepositions or explicit verbs when "with" makes attachment ambiguous. |
| GR-3 | How to use pronouns | Ensure every pronoun (`it`, `they`, `them`) has one clear antecedent noun. |
| GR-4 | The pronoun "this" | Pair "this" with its noun (`"this assembly"`, not bare `"this"`) so the referent stays explicit. |
| GR-5 | False friends | Avoid words whose meaning shifts across Romance/Germanic technical backgrounds. |
| GR-6 | Latin abbreviations | Avoid `e.g.`, `i.e.`, `etc.`, `viz.`; write plain equivalents (`"for example"`). |
| GR-7 | Inclusive language | Added in Issue 9: use neutral, inclusive nouns and pronouns (`"personnel"`, `"they"`, or direct `"you"`). |
| GR-8 | Possessive form | Added in Issue 9: prefer clear prepositional phrases (`"the surface of the wing"`) over ambiguous `'s` forms. |

## The 9 Sections of Part 1 (53 Rules)

1. **Section 1 — Words (Rules 1.1–1.14):** Use approved dictionary words in their exact approved part of speech and meaning (Rules 1.1–1.4). Extend vocabulary only with project-approved **Technical Nouns** (Categories 1–22, including Category 21 *Law and regulations* and Category 22 *Animals, plants, and other life forms* added in Issue 9) and **Technical Verbs** (Categories 1–4), without crossing parts of speech or inventing jargon (Rules 1.5–1.13). Default to American English spelling unless directed otherwise (Rule 1.14).
2. **Section 2 — Multi-word nouns (Rules 2.1–2.2):** Keep multi-word nouns at **<=3 words** (`"fuel pump valve"`). If a long technical noun exceeds 3 words, write the full approved name consistently rather than abbreviating unpredictably.
3. **Section 3 — Verbs (Rules 3.1–3.7):** Permit only infinitive, imperative, simple present, simple past, simple future, and past participle used as an adjective (Rules 3.1–3.3). Avoid complex auxiliary tenses (Rule 3.4). Restrict `-ing` forms to technical nouns/modifiers (Rule 3.5). Use active voice; allow passive voice only in descriptive text when the actor is unknown or irrelevant (Rule 3.6). Describe actions with an approved verb, never a nominalized noun (`"inspect"`, not `"perform an inspection"`) (Rule 3.7).
4. **Section 4 — Sentences (Rules 4.1–4.5):** Write short, clear sentences (Rule 4.1). Do not omit words or use contractions just to shorten text (Rule 4.2). Use vertical lists for complex items or sequences (Rule 4.3). Use connecting words for logical flow (Rule 4.4). Use explicit articles (`a`, `an`, `the`) and demonstratives (`this`, `these`) to avoid noun-stack ambiguity (Rule 4.5).
5. **Section 5 — Procedural writing (Rules 5.1–5.5):** Limit procedural sentences to **<=20 words** (Rule 5.1), **one instruction per sentence** unless simultaneous (Rule 5.2), in imperative command form (Rule 5.3). Place any condition before the command (Rule 5.4). Use notes for information only, never instructions (Rule 5.5).
6. **Section 6 — Descriptive writing (Rules 6.1–6.6):** Introduce facts gradually with logical keywords (Rules 6.1–6.2). Limit descriptive sentences to **<=25 words** (Rule 6.3). Group related facts into single-topic paragraphs of **<=6 sentences** (Rules 6.4–6.6).
7. **Section 7 — Safety instructions (Rules 7.1–7.3):** Identify severity (`WARNING` vs. `CAUTION`), open with a direct command or condition, and state the risk or consequence explicitly.
8. **Section 8 — Punctuation and word count (Rules 8.1–8.7):** Ban semicolons (`;`) entirely (Rule 8.1). Hyphenate closely linked modifiers (Rule 8.2), use parentheses sparingly as 1 counted word (Rules 8.3, 8.5), treat colons before vertical lists as sentence boundaries (Rule 8.4), and count hyphenated compounds and symbols/numbers consistently (Rules 8.6–8.7).
9. **Section 9 — Writing practices (Rules 9.1–9.4):** Restructure whole sentences instead of translating word-by-word (Rule 9.1), verify every word against context (Rule 9.2), ban phrasal verbs (`"take off"`, `"spin up"`) (Rule 9.3), and keep style consistent (Rule 9.4).

## Frequent Traps (From Part 2 Recurring Errors, pp. 2-0-17–18)

| Non-STE | Issue 9 STE Alternative | Notes for Agents |
|---|---|---|
| `perform (v)` | `DO (v)` or exact action verb | Always use the exact action verb (`measure`, `test`, `analyze`). |
| `utilize (v)` | `USE (v)` | Replace everywhere (including daily chat). |
| `ensure (v)` | `MAKE SURE (v)` | Plain everyday substitute. |
| `avoid (v)` | `PREVENT (v)` | Clearer causal framing. |
| `however (adv)` | `BUT (conj)` | Shorter transition. |
| `therefore (adv)` | `THUS (adv)`, `AS A RESULT` | Clearer causal link. |
| `prior to` | `BEFORE` | Remove 2-word filler. |
| `in order to` | `TO` | Remove 2-word filler. |
| `check (v)` / `test (v)` | `CHECK (n)` / `TEST (n)` (`DO A CHECK/TEST`) | Enforced in Strict Issue 9 / Aerospace mode; kept as verbs in STE-Core software mode. |
