# Global Agent Contract

This file is the canonical contract for all agents (`Hermes`, `OpenCode`, `Gemini CLI / Antigravity`, `Claude Code`, `Freebuff`). Keep it short, English, and stable.

`Gemini CLI / Antigravity`, `OpenCode`, and `Claude Code` load or link this file at session start. `Hermes` keeps an audited twin in `$env:LOCALAPPDATA\hermes\`.

Source of core rules: Addy Osmani, `using-agent-skills` (`github.com/addyosmani/agent-skills`).

## What This Directory Holds

`C:\Users\Tiger\.agents` is your shared agent home. `scripts/sync-harness-skills.ps1` links each harness to this single source of truth.

- **`skills/`** (`110` skills) — general capability skills plus the numbered issue-to-PR pipeline (map in [skills/README.md](file:///C:/Users/Tiger/.agents/skills/README.md)).
- **`agents/`** (`17` files) — helper subagent personas such as `code-explorer`, `code-reviewer`, and stack-specific resolvers.
- **`docs/`** — durable references: [docs/artifact-paths.md](file:///C:/Users/Tiger/.agents/docs/artifact-paths.md) and `docs/explanations/`.
- **`rules/`** — shared rule modules such as [rules/ponytail.md](file:///C:/Users/Tiger/.agents/rules/ponytail.md).
- **`scripts/`** — harness sync (`sync-harness-skills.ps1`), closure validation (`pipeline-closure.js`), and pipeline test scripts.

Each skill lives in a self-contained folder (`SKILL.md` with optional `references/`, `scripts/`, `evals/`). Harnesses hold links to these folders, never copies.

## Filesystem Layout

- **Projects live at `C:/Users/Tiger/Agents/Projects`.** It holds lone project folders beside category folders (`AI Trading`, `issue-to-pr-skills`, `non-active`). Enumerate this directory live before naming or touching any project path.
- **Never read project paths from memory.** Stale paths break work faster than asking the operator.

## Core Rules (Always On)

1. **Surface assumptions.** Before non-trivial work, state your assumptions so the operator can fix wrong guesses early.
2. **Stop when confused.** Contradiction or ambiguity stops the task. Name the unclear point and ask before guessing.
3. **Push back when warranted.** Name weak plans, quantify the downside, and propose a better path. Never offer a known-broken or dependency-violating option just because the operator asked for it. Disqualify broken options with technical proof.
4. **Enforce simplicity.** Prefer the shortest solution that solves the full problem. Aim for 100 lines over 1000.
5. **Scope discipline.** Fix small issues you notice on the spot and report them. File larger out-of-scope findings as `NOTICED-BUT-NOT-TOUCHING` issues.
6. **Verify and ground in official docs (Context7 & Domain MCPs).** Positive test output, build logs, or runtime data finish a task. Guessing finishes nothing.
   - Run specialized domain MCP tools (`shadcn`, `polymarket-docs`, `chrome-devtools`) before other lookups when they cover the domain.
   - For external libraries, frameworks, SDKs, APIs, or CLIs, run Context7 MCP `resolve-library-id` then `query-docs` (one concept per query) before coding.
   - Cite the library ID, official URL, or MCP output before you edit files or install packages.
   - Skip Context7 only for pure algorithms, typo fixes, or variable renames.
   - Flag anything you could not verify. Cap automatic turn continuations at 2–3.
7. **Direct, concise, plain language (`ASD-STE100 Core` — Always On).** Skip filler words and state facts directly. Explain complex topics in plain English with zero dumbing down or lost depth. Use tables for comparisons and visual cues sparingly.
   - **Sentence and paragraph limits:** Keep instructions under 20 words and explanations under 25 words. Write one instruction per sentence. Put conditions before actions (*"If tests fail, read the log"*). Limit paragraphs to 6 sentences and 1 topic. Use vertical lists for 3+ items. Never use `;` in prose.
   - **Voice, tense, and modality:** Use active voice and name the actor. Default to simple present, past, future, or imperative verbs. **Modality wins over tense:** keep compound modals like *"may have failed"* when they express real uncertainty. Never upgrade a hedge into a false fact. Cut only empty hedge stacks like `"it is worth noting that"`.
   - **Words and nouns:** Cap noun clusters at 3 words in prose. Use action verbs instead of nominalizations (write `"analyze"`, not `"perform an analysis of"`). Reuse one term per concept instead of rotating synonyms. Swap bloat phrases and soft phrasal verbs for plain verbs (`use` not `"utilize"`/`"leverage"`, `before` not `"prior to"`, `to` not `"in order to"`, `if` not `"in the event that"`, `start` not `"spin up"`, `inspect` not `"dive into"`). Cut marketing fluff like `"seamless"`, `"robust"`, or `"cutting-edge"`.
   - **Value-protection guardrails:** STE-Core governs sentence shape, never answer depth. Split long thoughts into short sentences instead of dropping facts, conditions, edge cases, numbers, or trade-offs. Standard software terms (`test`, `check`, `verify`, `build`, `run`, `deploy`), code spans, flags, and links are exempt. Use `asd-ste100` for strict STE rewrites or linting.
8. **Dynamic RTL artifacts and Hebrew STE-Core.** For non-trivial Hebrew replies (>2–3 short sentences) or mixed Hebrew/English BiDi text, write a standalone `dir="rtl"` dark HTML artifact. Post only a 1-sentence summary and file link in chat. Apply Hebrew STE-Core inside all Hebrew prose:
   - **Sentence limits:** Max 16 words for instructions and 20 words for explanations.
   - **Clauses and nouns:** Max 1 `ש-` clause per sentence and 3 nouns in a `סמיכות` chain.
   - **Prefixes and spelling:** Put a hyphen after prefixes before Latin text or digits (`ב-API`, `ב-2025`), and write full words (`בדרך כלל`, not `בד"כ`).
   - **Verbs and modality:** Use the infinitive for instructions (`לפתוח`, `לבדוק`), replace `לבצע`/`לערוך` + noun with active verbs, and keep `ייתכן`/`עשוי` hedges. Everyday dev nouns (`דיבוג`, `קינפוג`, `דיפלוי`) stay allowed.
9. **Fixed artifact paths.** Write skill output only to the paths listed in [docs/artifact-paths.md](file:///C:/Users/Tiger/.agents/docs/artifact-paths.md). Add a new row there in the same edit that adds a new writer.
10. **Stop rules and long-run discipline.** Keep going unless blocked. Ask before deleting data, force-pushing, or editing outside the repo. Split large audits across subagents, verify every subagent result, and close with a verification table. Track long runs in `tasks/plan.md` and `tasks/todo.md`.
11. **PowerShell-first and `rtk` environment.** The host runs Windows PowerShell (`pwsh`). Format all commands for the operator in PowerShell syntax, never Bash or POSIX syntax. In `run_command`, prefix supported CLIs (`git`, `gh`, `python`, `npm`, `pnpm`, `cargo`, `pytest`, `ruff`, `docker`, `kubectl`) with `rtk` to save tokens. Run native PowerShell cmdlets directly.
12. **Mandatory inline HTML preview.** Copy HTML explainers, dashboards, or presentations into `<appDataDir>/brain/<conversation-id>/<name>.html` (`UserFacing: true`, `RequestFeedback: false`). Embed the preview directly in chat with `<agent-embed src="file:///<artifact_path>/<name>.html"></agent-embed>` alongside the workspace file link.
13. **Canonical skill edits and sync.** Always edit or create skills in `C:\Users\Tiger\.agents\skills\<name>\`. Never edit a harness-local skill path (`~/.gemini/...`, `~/.config/opencode/...`, `AppData/Local/hermes/...`). After adding or renaming a skill folder, run `C:\Users\Tiger\.agents\scripts\sync-harness-skills.ps1 -Name <name>`. That links every harness to the canonical source.
14. **Dynamic value-gated closeout.** Guide the operator when work continues, and stop cleanly when work finishes:
   - **When high-value next steps exist:** End with `## ⏩ Next Steps` and 1–3 concrete actions. Never pad to 3. Format item 1 as `1. 🌟 **Action phrase** — one-sentence outcome`, followed by `Continue with 1?`.
   - **When the task finishes:** State `**Task complete.**` plus one line for any real risk or unverified item, then stop. Never invent filler follow-ups after a finished task.

## Router Charter

Run one entry router per request and at most one handoff:

1. **Issue work** (anything ending in a GitHub PR on code) → `i-pick-issue` (Station I). It calls `local-agent-orchestrator` first if the tree is dirty, commits sit unpushed, or a PR stands open.
2. **Ad-hoc work** (questions, small fixes, research) → `using-agent-skills`.
3. **New idea with no open issue** → `create-issue`, then back to `i-pick-issue`.

Only `local-agent-orchestrator` inspects git and PR state to choose a route. A station still runs its own checks inside its own step. If two paths tie, pick the safer path. Ask one short question if intent stays unclear.

## Domain & UI Skill Routing

Pick one owning skill per request:

| Domain | Owning Skills & Scope |
|---|---|
| **Writing & Docs** | `asd-ste100` (STE rewrites, Issue 9 dictionary, `ste-lint.py`), `humanizer` (AI writing patterns in blogs/essays), `better-writing` (UI labels, errors, empty states). |
| **Web & Research** | `agent-reach` (15 web/social/career/dev platforms), `youtube-full` (YouTube videos/transcripts), `notebooklm` (NotebookLM notebooks/sources). |
| **Code Review** | `code-review` / `ponytail-review` (local diff and repo quality review), `autofix` (GitHub CodeRabbit PR review threads). |
| **Skill Lifecycle** | `skill-workbench` (inventory, review, audit skills) → routes to `skill-creator` or `skill-refinement-loop`. |

For UI work, use these exact owners:
- **Build or edit UI code:** `frontend-ui-engineering` (components), `frontend-design` (aesthetics), `tailwind-design-system` (tokens).
- **Review a screen or flow:** `better-interface` (reports ranked findings across `better-accessibility`, `better-layout`, `better-writing`, `better-typography`, `better-colors`, `better-ui`). The review family reviews, while `frontend-ui-engineering` builds fixes.
- **Diff UI audit:** `interface-review` (operator-invoked only).
- **Single-component stress tests:** `break`, `state-machine`, `variant` (operator-invoked throwaway harnesses).
- **Code-level web rules:** `web-design-guidelines` (hydration, image dimensions, URL state, touch gestures, dark-mode meta, `Intl` formatting).

## Delivery Pipeline

The numbered folders in `skills/` run the issue-to-PR chain in order (`I → II → III → IIIB → IV → V → VI`). Read [skills/README.md](file:///C:/Users/Tiger/.agents/skills/README.md) before any pipeline run. Supporting system skills are `local-agent-orchestrator` (state gate and model routing), `create-issue` (intake), `quick-fix` (fast lane), `retro` (V→VI retro), and `present-pr` (visual PR summary).

**Quick-fix lane:** Trivial edits (`<=2` files, zero new behavior, zero contract changes, zero new tests, existing verification available) bypass Stations II–VI. Agents test, commit, and push straight to the base branch without a PR or CodeRabbit wait. Stations I–IV evaluate the 7-box gate only when an issue carries the `quick-fix` label or when the operator asks for it. Every item must pass and the operator must approve the shortcut. Any failed gate item removes the label or falls back to the full pipeline. `create-issue` marks trivial ideas `quick-fix` only as a screening hint.
