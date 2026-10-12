# Harness Link Repair

Recipe for when a skill that exists in the canonical root does not load in a
harness. Diagnose and repair the link, not the skill.

## Symptom

A skill under `~/.agents/skills/<name>` is missing from the harness's skill
list (slash commands, skill registry) or `skill_view(<name>)` returns "not
found", while the canonical `SKILL.md` is present and well-formed.

## Cause to check first: a duplicate-name entry shadows the skill

Each harness exposes its skills through a root directory of links:

| Harness | Root | Link type |
|---|---|---|
| Hermes | `%LOCALAPPDATA%\hermes\skills` | Junction |
| Gemini CLI / Antigravity | `~/.gemini/config/skills` | SymbolicLink |
| OpenCode / Desktop | `~/.config/opencode/skills` | Junction |

Two entries resolving to the same canonical folder collide on registration —
the harness resolves one folder under two names and refuses to load either.
The colliding orphan is usually a leftover from a manual recovery
(`<name>.rollback-broken`), because `sync-harness-skills.ps1` links only clean
canonical names and never removes orphans. A leftover therefore survives every
re-sync and keeps shadowing its clean twin — the skill is "installed" and
"broken" at the same time, with nothing wrong in the canonical folder.

## Cause to check second: the same skill name in two harness roots

A harness may read more than one skills root — the operator's canonical tree
plus a bundled pack (Hermes: `%LOCALAPPDATA%\hermes\skills` and
`%LOCALAPPDATA%\hermes\hermes-agent\skills`). The same name in both roots is
an unresolvable collision, and the harness fails safe by dropping the skill
entirely: it never loads, and the system prompt reports it in the "shares its
name and path with a different skill in the same tier" footnote rather than
erroring. The symptom is a skill that exists, is well-formed, and still cannot
be loaded — no `.rollback-broken` twin anywhere.

Decide which copy to remove by whether the operator customized it:

- **Byte-identical** (`diff` clean) → the operator-root copy is redundant
  duplication of the bundled pack. Remove the operator-root copy and keep the
  bundled one: the pack is upstream, refreshes on install, and the duplicate
  carries no local edits. The operator-root copy is a real directory, so a
  plain recursive remove is correct here (it is not a link).
- **Customized** → the operator's copy is authoritative. Keep it. Removing the
  bundled pack's folder is the risky direction — it is restored on the next
  harness update — so prefer renaming the skill in the operator's tree so the
  two names no longer collide, and flag the decision to the operator before
  touching the bundled root.

Whole category folders commonly collide across the two roots (`creative`,
`devops`, `productivity`, `research`, `software-development`, `web`,
`note-taking`). Individual skills inside them only collide when their own
names match, so check per skill name, not per category.

## Cause to check third: the harness's own activation toggle is off

Disk can be entirely healthy and the skill still will not resolve as a slash
command, because the harness keeps a **live activation switch per skill** that
is separate from every skill-registry file. Hermes: the toggle in the desktop
app's skills manager (Settings → Skills).

The registry files all describe *disk* state and will agree with each other
while the toggle is off — so they cannot rule this cause out:

| Evidence | What it actually proves |
|---|---|
| `skill_view(<name>)` → `readiness_status: available` | the file loads at the tool layer, nothing about invocation |
| `skills/.usage.json` → `"state": "active"`, `"archived_at": null` | disk bookkeeping only; the toggle is not stored here |
| `.skills_prompt_snapshot.json` → a clean entry with empty `conditions` | the prompt builder sees it, nothing about the command table |
| `config.yaml` → no `disabled_skills` key | the config layer has no such block; the toggle is not there either |

The signature of this cause is exactly that disagreement: **every registry
file reads healthy while the slash menu returns "No matches".** Once that
signature appears, stop the disk archaeology — the collision causes leave a
name-level trace (a twin, a second root), and none exists here.

Ask the operator to read the toggle in the app and flip it on, or read it
visually from a screenshot: knob on the left with a muted track = off, knob on
the right with an accent-colored track = on. A skill can sit listed, used
dozens of times, and still be deactivated.

## Diagnose

List every harness skills root — not just the operator's — and flag every
entry whose name is not a canonical skill folder, plus every name that appears
in more than one root:

```powershell
Get-ChildItem "$env:LOCALAPPDATA\hermes\skills" -Force |
  Select-Object Name, LinkType, Target
# then the second root, and diff the name sets
Get-ChildItem "$env:LOCALAPPDATA\hermes\hermes-agent\skills" -Force |
  Select-Object Name, LinkType, Target
```

An entry with a `.rollback-broken` suffix, or any name absent from
`~/.agents/skills`, is an orphan. Confirm the collision: two entries whose
`Target` is the same canonical path. For the cross-root case, confirm the
collision by locating the name in both roots and diffing their `SKILL.md`
(`diff rootA/<name>/SKILL.md rootB/<name>/SKILL.md`) to pick which copy stays.

## Repair

**Same-root orphan (`<name>.rollback-broken`):** unlink it **as a link, never
through it** — following the link destroys the canonical folder's contents.
`cmd /c rmdir` removes the link only; it is the same command the repo's own
`sync-harness-skills.ps1` uses for links. Enumerate and remove in one
PowerShell call so no Windows path is quoted by hand:

```powershell
Get-ChildItem "$env:LOCALAPPDATA\hermes\skills" -Force -Directory |
  Where-Object { $_.Name -like '*.rollback-broken' } |
  ForEach-Object { cmd /c rmdir $_.FullName }
```

**Cross-root duplicate:** remove the losing copy in its own root. When the
operator-root copy is a real directory, a recursive remove is correct; when it
is a link, unlink it with `rmdir` as above.

Pitfalls:

- **Do not drive `rmdir` from a git-bash loop.** Quoting mangles the Windows
  path: `rmdir` reports "cannot find the file specified", the link stays, and
  a `grep` of the root still shows it. Run the enumeration in PowerShell.
- **Never a recursive delete on a link** — following the link removes the
  canonical folder's contents. Unlink with `rmdir`, then re-list the root.
- **Remove every orphan, not just the reported one.** Orphans come from the
  same recovery event; one shadowed skill means its siblings are shadowed too.
- **Check for the cross-root cause when no orphan exists.** A `.rollback-broken`
  sweep that fixes nothing means the shadow is not a twin in the same root —
  list every harness root and compare name sets before concluding the skill
  itself is broken.
- **When every registry file reads healthy and the slash still refuses, the
  remaining cause is the harness's own activation toggle** — see the third
  cause above. Do not keep auditing frontmatter, `config.yaml`, or
  `.usage.json` looking for a block that is not stored in any of them.
- **A disk-side repair does not reach a running session.** The harness builds
  its skill and command tables at startup and caches them; after removing an
  orphan or a cross-root duplicate, restart the app before judging the fix.
  Verify with the loader (`skill_view`) *and* by typing the slash command in
  the composer — the loader returning `available` proves the file is readable,
  not that the command is registered.

## Verify

1. The canonical source is intact: `ls ~/.agents/skills/<name>/SKILL.md`.
2. The skill now loads through the harness's own loader — `skill_view(<name>)`
   returns `readiness_status: available`.

Listing the root is not verification; only the loader's response proves the
skill is back.

## Diagnosing a batch of missing skills

When several skills are missing at once, group them by cause before fixing:
orphan-twin names report the same shape (`<name>` plus
`<name>.rollback-broken`), while cross-root names show a *second* root holding
the same folder. Fixing only the reported symptom (one orphan) leaves the
siblings shadowed — enumerate both roots, classify every missing name, then
repair each class. The recurring rule: a skill silently absent from the
harness's slash commands is a registration collision in a harness root, never
a defect in the canonical `SKILL.md`.
