---
name: system-connector
description: Build a deterministic connector to ANY third-party system, app, or API — popular SaaS, niche or regional software, internal company tools, or anything in between. Use when the user wants to "connect to", "set up", "integrate with", "link", "hook up", "give the assistant access to", or "use" an external service and there is no existing tool already wired up. The skill conducts a short interview, checks whether an existing MCP/connector already covers it, researches the API (or other integration surface) if not, and produces the lightest *deterministic* artifact that gets the user connected — usually a SKILL.md plus a Node.js (stdlib-only) helper script and self-tests, sometimes an MCP config snippet, occasionally a full MCP server, and sometimes an honest "this isn't feasible without X."
---

# System Connector

This skill helps a non-technical user build a connector to a third-party system. It works for **any** system the user names — well-known SaaS, regional/niche software, internal company tools, or legacy desktop apps. The connector this skill produces is host-neutral: a **Node.js helper script** (Node ≥ 18, built-in modules only, no `npm install`) plus markdown documentation, runnable from any host environment that supports skills (Cowork, Claude Code, Codex, Desktop Commander, etc.). It is a multi-phase workflow — never skip phases, never produce an artifact on the first turn.

## Operating principles

1. **Cheapest path wins by default.** A working setup using something that already exists beats a custom build every time. Only build new when nothing existing fits. When discovery surfaces **2-3 genuinely easy paths** with meaningfully different trade-offs, present those options briefly with one-line trade-offs, recommend one, and let the user choose before building.
2. **Non-technical user, just-do-it-for-me, always.** Treat every user as if they picked "Just do it for me" — walk them through every step, do the technical bits yourself. Never ask about OAuth scopes, REST verbs, or rate limits unless the answer affects what *they* need to do. Translate jargon. Don't ask "are you a developer?" — assume not.
3. **Minimum-friction interview.** Ask the user the smallest possible set of questions that actually changes what gets built. In practice this is one question at most: which specific product do they mean, when the name is ambiguous. Don't ask about use cases, account status, or comfort level — defaults handle all three (see Phase 1).
4. **Default scope: all non-destructive operations.** When you build an artifact, cover every read / list / query / search / introspection endpoint the API exposes — without asking. Writes (create / update / delete / anything that changes state on the vendor's side) are produced **only when the user explicitly asks for a specific write operation** during the conversation that follows the artifact hand-off. Reads are safe-by-default; writes are opt-in.
5. **`AskUserQuestion` is for logic only, never for connection values.** Logic = "which product?", "include the experimental write commands?". Connection values = base URL, API token, region, environment — those go in `.env`. See "Credentials handling" below.
6. **Show, then ask permission.** After research, summarise what you found and propose the output type before generating files. If there are several low-friction implementation paths, show the short option set first and ask which path the user wants.
7. **No guessing — the artifact must be deterministic.** Every endpoint, payload schema, filter syntax, and auth flow that ends up in the artifact must be grounded in something concrete: official docs you actually read, a real API response you observed, or a vendor-published sample you verified. Phrases like "the exact parameter names appear in the resource's self-description" or "the assistant figures it out at runtime" are smell. If you don't have the ground truth, get it (Phase 3) before producing files; if you can't get it, say so honestly and stop. The non-technical user has no way to recover from an underbaked artifact, so the burden of being right is on the skill, not on the assistant at runtime.

## The six phases

Run these in order. Use the TodoList tool to surface progress. The phases are not optional.

### Phase 1 — Interview

Goal: confirm which specific product the user means, if and only if the name is ambiguous. Otherwise, skip the interview entirely and proceed.

**Default assumptions — don't ask about any of these:**

- *Use cases.* Default scope of the artifact is **every read / list / query / search / introspection endpoint the API exposes**. Don't ask "what do you want the assistant to do?" — covering all reads is the default. Writes are opt-in later (the user asks "add a create-customer command" once they've used the read tools and want more).
- *Account status.* Assume the user may or may not have an account/installation set up. The hand-off walks them through both cases (here's how to verify if you have one; here's how to obtain one if you don't). Don't ask "do you already have a login?".
- *Technical comfort level.* Always treat the user as if they picked "Just do it for me." Walk them through every step. Don't ask "are you a developer?".

**The one question worth asking — disambiguation.** When the system name is ambiguous, use a single `AskUserQuestion` call with one question: *"Which <name> do you mean?"*, listing the plausible products plus their distinguishing details. Patterns that justify asking (described abstractly so this guidance applies to anything the user names):

- *Family-name shadowing.* The name refers to multiple distinct products from different vendors with different APIs.
- *Edition divergence.* One vendor ships several editions or SKUs with materially different APIs — legacy vs. modern, on-prem vs. cloud, free vs. enterprise, regional editions.
- *Same name, different category.* The name belongs to a popular product in one category and an unrelated tool in another.

Patterns that **don't** justify asking (proceed straight to Phase 2):

- The name maps to one canonical product with one canonical API.
- The user pasted a specific URL — that fully resolves the ambiguity.
- The user named an internal or custom system precisely (their own naming, no public collision).

**Never ask, via any channel, about:** auth method, API scope, region, environment, workspace ID, base URL, token, password, comfort level, or anything that ends up in `.env`. Connection values live in `.env`. Auth method is inferred during research.

### Phase 2 — Discovery

Before researching anything new, check whether the work is already done. Read [`reference/discovery.md`](reference/discovery.md) for the full procedure. Decision tree:

- **A connected MCP exists in the user's Cowork registry** → call `search_mcp_registry`, and if a suitable connector is found, call `suggest_connectors`, stop. We're done.
- **A vendor-published MCP server exists for this service** (a package like `@<vendor>/<system>-mcp-server`) **and you can read its source** → produce an **MCP config snippet** (Phase 4 output type B).
- **An existing skill on skills.sh covers it** → call `suggest_plugin_install` if the skill is in a plugin, otherwise point the user at it.
- **Nothing exists** → continue to Phase 3.

When discovery finds something, *tell the user what you found and why it's the right fit* before suggesting it. Don't just dump a name. **Don't recommend a third-party MCP whose source you can't read** — if the install page is blocked or the repo is private, treat it as not-found and continue to research.

If vendor docs are JS-rendered SPAs that return empty HTML to WebFetch, don't give up: try direct content URLs (`/sitemap.xml`, docs-as-markdown endpoints, raw GitHub content), web archives, vendor-published source samples, and OpenAPI probes (`/openapi.json`, `/swagger.json`, `/api-docs`). The full ordered list of escape hatches is in `reference/discovery.md` §4.

### Phase 3 — Research

Only enter this phase if Phase 2 found nothing usable. Read [`reference/research.md`](reference/research.md) and follow it — including the research-note template and the per-variable credential-acquisition deliverable. Goal: produce a concrete, citable specification covering:

- Official docs URL(s) you actually read content from
- The exact auth flow with one verbatim request example (header values, payload shape)
- The endpoints that map to the integration surface — with their actual paths, parameters, and example responses
- Any gotchas (rate limits, pagination quirks, beta status, regional caveats, VPN-only access)

If after exhausting the workarounds listed in Phase 2 you still don't have ground truth, surface that honestly and ask the user how to proceed (e.g. they may be able to share a curl example from their own usage).

### Phase 4 — Pick output type and build

If one output type is clearly the best fit, propose that path and proceed after the user confirms. If there are **multiple easy implementation paths** (for example, an official MCP config snippet versus a lightweight helper skill, or two equally viable non-API approaches), do **not** silently pick one. Give the user a short choice set with the 2-3 easiest paths only, one-line trade-offs for each, a clear recommendation for the default path, and a direct question asking which path they want. Keep this brief — the goal is to let the user choose among the realistic low-friction options, not to dump every theoretical architecture.

| Situation | Output | Why |
|---|---|---|
| Connected MCP in user's registry | **suggest_connectors** | Already done. |
| Public MCP server + readable source | **MCP config snippet** (`reference/output_mcp_config.md`) | Fastest, official, kept up to date by the vendor. Credentials still follow "Credentials handling" below. |
| Public REST/HTTP API, ≤10 endpoints needed | **SKILL.md + Node.js helper script + tests** (`reference/output_skill_md.md`) | The default for nearly all integrations. The helper script makes calls deterministic; the tests prove the parsing logic; the SKILL.md is a tight cookbook on top. Start from `templates/api_helper.js` and `templates/test_helper.js`. |
| OAuth + many stateful endpoints, or vendor expects a long-running server | **Full MCP server** (`reference/output_mcp_server.md`, delegates to the official `mcp-builder` skill if available) | The integration needs real code and lifecycle management. Credentials still follow "Credentials handling" — the MCP server reads from `<host-root>/connectors/<system>/.env`, same as a helper script. |
| **No public API at all** (niche ERP, on-prem desktop app, regional software) | **SKILL.md + helper, non-API integration** | File watching, CSV/Excel import-export, local DB read, or Desktop Commander to drive the app's UI. See `reference/output_skill_md.md` "Non-API integrations". |
| Service has no usable integration surface | **Honest stop** | Don't ship a snippet that won't work. Tell the user what's missing. Let them pick. |

A bare markdown SKILL.md with curl one-liners is **not** an acceptable output for any non-trivial integration. If the system has a real API, you owe the user a helper script with tests.

**Helper implementation rules (Node.js).**

- Target **Node ≥ 18**. Use only built-in modules: global `fetch` for HTTP, `node:fs`, `node:path`, `node:os`, `node:process`, `node:crypto`, `node:url`. **No `package.json`, no `npm install`, no third-party dependencies.** One self-contained `.js` file (plus the test file).
- Tests use the built-in **`node:test`** runner and `node:assert` — run with `node --test`, zero network access, fixtures drawn from real documented responses.
- The helper is a CLI with subcommands (`setup`, `where`, `test`, plus the API commands) and a `--help` that lists everything. Start from `templates/api_helper.js`.
- Exit non-zero on failure; print actionable error messages (missing credential → print the `.env` path and which variable is empty, not a stack trace).

**Bundle contents and the required command surface** are specified in [`reference/output_skill_md.md`](reference/output_skill_md.md) — including `catalog.json`, the mandatory generic read commands (`services`, `discover`, `catalog`, `schema`, `entity get/list/query`, `raw`), and the required test coverage. Follow it when producing the artifact.

**Default-scope rule when building the helper.** The helper must cover every non-destructive endpoint the API exposes — list, query, get, search, schema, discover, introspection. No asking which subset; cover them all. For systems where the API has dozens of resource classes, this means exposing generic class-parameterised commands (e.g. `helper entity list <Class>`, `helper entity get <Class> <id>`, `helper raw <method> <path>`) so any class on the user's deployment is reachable without the helper having to enumerate every one. **Writes (create / update / delete) are NOT included by default.** The user adds them later by asking ("now I want to be able to create customers from this") — at which point the assistant adds the specific write verb and tests, with explicit confirmation before the first real call.

### Phase 5 — Verify

Before installing or handing off:

1. Run the helper's self-tests (`node --test test_*.js`, or `node <helper>.js test`). They must pass on fixture data drawn from real docs/responses, with zero network access. If they don't pass, the artifact isn't done — fix and re-run before continuing to Phase 6.
2. Skim the produced `SKILL.md` end-to-end, the helper's `--help` output, and any catalog/metadata files for sanity. The artifact should be self-contained: nothing should reference the assistant's chat context, no TODOs, no hand-wavy comments.

### Phase 6 — Install and hand off

The artifact you built in Phase 4 sits in your build directory (the host-specific scratch location where the assistant produces files — Cowork uses a session-scoped `outputs/` folder, Claude Code uses the working directory, other hosts use their equivalents). It isn't installed yet — the host environment's skill discovery doesn't know about it. **The principle: don't reimplement install logic; delegate to whatever skill-creator skill the host environment provides.** Read [`reference/install.md`](reference/install.md) for the full procedure, the direct-copy fallback rules, and the install anti-patterns.

1. **Find the host's skill-creator** by scanning the available-skills list for skill-installation-shaped names — `skill-creator`, `create-*-plugin`, `*-plugin-creator`, `plugin-customizer`, `skill-installer`, etc. Known examples: `anthropic-skills:skill-creator` (generic, works in most hosts), `cowork-plugin-management:create-cowork-plugin` (Cowork-specific, for packaged distribution).
2. **Invoke the host's skill-creator** via the Skill tool, briefing it on (a) the absolute path to the artifact build directory you produced in Phase 4, (b) the slug, (c) what's inside, and (d) the credential convention below (the helper resolves credentials to `<host-root>/connectors/<system>/.env` automatically based on its install location — the skill-creator must install the bundle into the standard `<host-root>/skills/<system>/` layout, must not relocate `.env.example` away from the artifact directory, and must not override the helper's path resolution). Default to personal install; only package as a distributable when the user has asked to share.
3. **Fall back to direct copy** only when no skill-creator-shaped skill is available in the host. Resolve the active host root from this skill's own installed path (the directory above `skills/` — see `reference/install.md`) and install into `<active-host-root>/skills/<system>/`. Never scan the machine for host roots and choose among them, and never overwrite an existing skill of the same name without asking.
4. **Smoke-test from the installed path**: run `node <installed_path>/<helper>.js where`. If it doesn't print the canonical credential path, the install didn't take — don't proceed to credentials until it works.
5. **Hand off credentials per "Credentials handling" below.** Lead with a status line that makes clear the integration is *built but not yet usable*, then immediately show the local credentials file path and the exact minimum fields the user must fill in. The critical next-step list must contain only those minimum fields. For each field, include an inline acquisition block (four pieces per variable: what it is / where to get it / format / if-you-already-have-it). Deliver the verbatim privacy guarantee and end with a "say done when ready" confirmation cue. Do not claim the integration is "ready" or "working" before `test` passes.

## Credentials handling

Credentials live at `<host-root>/connectors/<system>/.env`, where `<host-root>` is the host environment's user-scope config root — `~/.claude/` for Claude Code or Cowork, `~/.desktop-commander/` for Desktop Commander, `~/.codex/` for Codex, and so on. The helper resolves this path automatically from its own installed location (it walks up to the directory containing `skills/`); no host detection logic, no hardcoded path.

The essentials: the assistant scaffolds the empty placeholder via the helper's `setup` command (idempotent — it never replaces user-filled values), emits a normal absolute-path markdown file link to the `.env` file, and never asks for, reads, echoes, or logs credential values — connection values never go through chat, not even via `AskUserQuestion`. Ship only `.env.example` inside the artifact. Deliver this privacy guarantee verbatim during hand-off: *"The values you put in that file stay on your computer. I never see them — the helper script reads them locally when it makes API calls, and nothing in the file is ever sent through our chat."*

**The full ruleset — the seven rules, the setup and re-run flows, the inline-handoff template, the final-response template, edge cases — lives in [`reference/credentials.md`](reference/credentials.md). Read it before producing any artifact. Link to it from any new output-type document; don't restate the rules elsewhere — drift between two copies is the failure mode that file exists to prevent.**

### Minimum editable fields

The credentials file and hand-off must expose the **absolute minimum set of values the user must edit for the default working connection**. This is a hard requirement.

Derive that set from the specific connector's chosen default auth path. Include only the exact documented fields required for the default connection. Do not assume a username/password shape unless the researched default auth path actually requires it.

Do not list optional auth modes, output formats, SSL flags, tenant IDs, scopes, app identifiers, feature flags, or advanced settings just because the helper supports them. Hardcode safe defaults in the helper or infer them from docs; accept extra variables only when the specific default connection cannot work without them.

If a connector supports advanced alternatives, document them in a reference file or an "advanced" helper note, but do not put them in `.env.example`, the generated `.env`, or the critical next-step list unless this specific integration cannot work without them. In the hand-off, advanced settings should be invisible until the user asks for them.

For every editable variable that remains, the hand-off must include:

- **what it is**
- **exactly where the user finds or creates it in the vendor system**
- **expected format**
- **what to do if they already have it**

Lead with the path to the local credentials file, then the acquisition instructions. The credential source is not optional: if the user needs a URL, username, password, token, tenant, or key, say where it comes from in plain language. For systems where credentials are created by an admin UI, name the UI path from the official docs or researched source. If the docs only say an administrator provides it, say that plainly and name the role or screen involved. If the value is normally supplied by the user's ERP/SaaS administrator, say that instead of implying the user should already know it.

The `.env.example`, generated `.env`, and final hand-off must agree exactly on the editable fields. If the file contains three fields, the hand-off lists three fields. If the default connection requires two fields, the file must not also contain auth method, format, SSL, alternate auth, or optional app fields.

## File layout reference

```
system-connector/
├── SKILL.md                         ← you are here
├── reference/
│   ├── credentials.md               ← canonical credentials doc — link, don't duplicate
│   ├── discovery.md                 ← Phase 2 procedure (hardened)
│   ├── research.md                  ← Phase 3 procedure + research-note template
│   ├── install.md                   ← Phase 6 install details + direct-copy fallback
│   ├── output_skill_md.md           ← default output: bundle contents, command surface, test coverage
│   ├── output_mcp_config.md         ← config snippet output: pre-flight checks, verification
│   └── output_mcp_server.md         ← full server output (delegates)
└── templates/
    ├── api_helper.js                ← Node ≥18 stdlib-only helper skeleton; resolves .env to user scope
    ├── test_helper.js               ← node:test scaffold (no network required)
    ├── .env.example                 ← canonical credential template (privacy header + placeholders)
    └── .gitignore                   ← canonical artifact .gitignore
```

## Anti-patterns to avoid

- **Building before discovering.** Always run Phase 2 before Phase 3.
- **Recommending a third-party MCP server you couldn't read the source of.** Credential-handling third-party code is not "cheapest path wins" — it's a security risk you didn't audit.
- **Producing markdown + curl as the entire artifact for a REST API.** That offloads endpoint discovery, payload templating, error handling, and pagination onto the assistant at runtime, which means the artifact behaves differently every session. Add the helper script.
- **Adding npm dependencies to the helper.** A `package.json` plus `node_modules` breaks the "copy one folder, it works" install story and adds supply-chain risk. Node ≥18 built-ins (global `fetch`, `node:test`) cover everything a connector needs. If a system genuinely cannot be integrated without a third-party library, that's a signal to use the full-MCP-server output type instead.
- **Asking for any credential or connection value in chat.** Never via free-form prompt, never via `AskUserQuestion` (even via "Other"), never "just to verify." Full ruleset in "Credentials handling" above.
- **Putting `.env` in the artifact directory.** Skills are shared, credentials are not. The helper resolves to `<host-root>/connectors/<system>/.env` (host-root depends on which environment installed the skill — Claude Code/Cowork = `~/.claude/`, Desktop Commander = `~/.desktop-commander/`, etc.), not `<artifact>/.env`.
- **Overwriting an existing `.env`.** `setup` is idempotent — if the file is there, it's a no-op. Never replace user-filled values via setup, regenerate, or "fresh start" the file.
- **Telling the user to `mkdir` and `cp` themselves.** That's what `setup` is for. The assistant runs it; the user clicks the link.
- **Leaving the artifact in the build directory after Phase 5.** That's the scratchpad, not the install location. Phase 6 routes the artifact to where the host environment expects to find skills; skipping it means the user can't invoke the skill from a fresh session.
- **Picking an install path without detecting the active host.** Installing into another host's `skills/` tree leaves the connector invisible to the current environment. Always derive the active host root from the current session first (Phase 6).
- **Scanning the machine for multiple host roots and choosing among them.** The active host is determined from the current session, not from whatever other skill directories happen to exist on disk.
- **Reimplementing install logic the host's own skill-creator already handles.** When a `skill-creator`-shaped skill is in the available-skills list, invoke it instead of manually copying files. Direct copy is the fallback for hosts without a creator skill, not the default.
- **Asking the user questions you don't actually need answers to.** The interview is one question (disambiguation) at most, and only when the name is genuinely ambiguous.
- **Building only the use cases the user mentioned.** Default scope is every non-destructive endpoint the API exposes. Writes are the exception that requires explicit ask.
- **Stopping at "the docs are a JS SPA, can't read them."** That's the moment to try direct content URLs, web archives, vendor-published source samples, and `/openapi.json` probes (see Phase 2).
- **Leaving the user with a half-built artifact.** If the integration genuinely cannot be completed (e.g. the service requires manual approval, or the API is gated behind enterprise sales), say so explicitly and stop, rather than handing them a snippet that won't work.
- **Duplicating the credential rules into a new doc.** When a new output type is added, link to `reference/credentials.md` rather than copy-pasting the rules. Drift between two copies is the failure mode that file exists to prevent.
- **Link-only credential hand-offs.** A file link plus variable names is not enough. The chat response itself must tell the user exactly where each value comes from, mirroring the detailed `.env.example` comments in plain language.
- **Silently choosing between multiple equally easy paths.** If discovery finds several low-friction options with real trade-offs, surface the short choice set and let the user pick.
