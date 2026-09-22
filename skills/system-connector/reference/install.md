# Phase 6 — Install in the active host

The artifact built in Phase 4 is only a build output until it is installed where the host's skill discovery can find it. The preferred route (see `SKILL.md` Phase 6) is to **delegate to the host's skill-creator skill** — brief it with the artifact path, the slug, what's inside, and the credential convention from `credentials.md`. This document covers the details that apply either way, plus the **direct-copy fallback** for hosts without a skill-creator.

The install rule is simple:

Install the new connector under the same host root that already contains this `system-connector` skill.

Do not scan the machine for every possible host root and pick one. Do not choose between `~/.claude`, `~/.desktop-commander`, and `~/.codex` by guessing. The active host is the one running the current session, and the install target is derived from that host alone.

## Step 1 — Resolve the active host root

Derive `<active-host-root>` from the current skill's own path:

- If this skill is at `<active-host-root>/skills/system-connector/SKILL.md`, the active host root is the directory above `skills`.
- If the host exposes absolute paths for installed skills in the session metadata, use those paths.
- If you can inspect another installed skill path from the same host, it should point at the same `<active-host-root>/skills/...` tree.

Examples:

- `/Users/me/.desktop-commander/skills/system-connector/SKILL.md` → `/Users/me/.desktop-commander`
- `/Users/me/.codex/skills/system-connector/SKILL.md` → `/Users/me/.codex`

If you genuinely cannot resolve the active host root from the current session, ask one concise question. Do not guess.

## Step 2 — Install the artifact into the active host

Destination:

`<active-host-root>/skills/<system>/`

When a skill-creator skill is available, invoke it and make sure it honors these rules; when none is available, do the copy directly. Either way:

- Preserve the artifact directory structure.
- Keep `.env.example` inside the installed bundle; `setup` mirrors it later.
- Do not copy `node_modules/`, `.DS_Store`, or similar junk (a connector helper should not have `node_modules` in the first place — it is stdlib-only).
- Never overwrite an existing `<active-host-root>/skills/<system>/` without asking the user first.

There is no cross-host fallback path. If the active host root is Desktop Commander, install into Desktop Commander. If it is Codex, install into Codex.

## Step 3 — Smoke-test the installed copy

Run the smoke test from the installed location, not from the build directory:

1. `node <installed-path>/<helper>.js where`
2. Confirm the reported path is `<active-host-root>/connectors/<system>/.env`
3. Confirm `<installed-path>/SKILL.md` is present and readable

If the host caches skill discovery, mention that a restart or rescan may be needed after the copy.

Do not proceed to credential hand-off until `where` points at the active host's connector path.

## Step 4 — Hand off

Once the installed copy passes the smoke test:

- Run `node <installed-path>/<helper>.js setup`
- Follow `reference/credentials.md` for the link, inline acquisition guidance, privacy guarantee, and confirmation cue
- Refer to the installed path, not the build directory

## When to ask the user

Only ask when one of these is true:

1. You cannot resolve the active host root from the current session.
2. The destination skill directory already exists and overwriting would destroy or replace user work.

Do not ask the user to choose between host roots when the active one is already knowable from the current session.

## Anti-patterns

- **Scanning the whole machine for host roots and choosing among them.** The active host root comes from the current session, not from whatever happens to exist on disk.
- **Installing into a different host's skills directory.** A Desktop Commander session should not install into Claude's directory just because it exists.
- **Keeping the build directory as the live copy.** The live copy is the installed one under `<active-host-root>/skills/<system>/`.
- **Overwriting an existing installed skill silently.**
- **Skipping the smoke test.** `where` is the quickest way to catch wrong-host installs.
- **Reimplementing install logic the host's skill-creator already handles.** Direct copy is the fallback, not the default.
