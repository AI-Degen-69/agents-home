---
name: ps1-theme-audit
description: Audit and fix a PowerShell script's terminal output against the Profile Color System (PCS) Standard Output Contract — colors, status lines, separators, padding, and structure. Use after creating or editing any .ps1 in the PowerShell profile repo, or when asked to make a script conform.
version: 1.0.0
triggers:
  - ps1 theme audit
  - theme audit this script
  - make this script conform
  - audit ps1 colors
  - check script output style
---

# PS1 Theme Audit

Verify that a PowerShell script's terminal output follows the repo's **Profile
Color System (PCS)** and its **Standard Output Contract**, fix violations with
the sanctioned replacements, and re-verify green. The mechanical check is the
same one the git pre-commit hook runs — this skill runs it before the commit
does, plus a judgment pass for everything the regex cannot see.

## Read first (in order)

1. `7/scripts/Theme/docs/reference.md` — §8 rules table (a)–(i), §2 role table
   (`UseFor` column), §10 New Script Checklist. This is the single source of
   truth; this skill only operationalizes it.
2. `AGENTS.md` at the repo root — the 7 non-negotiables summary.
3. `7/scripts/Shared/Shared-AuditCommentGuide.ps1` — WHY-not-what comment
   heuristic, for any comment blocks you add while fixing.

## Step 1 — Mechanical audit (exit codes are the contract)

```powershell
# Whole tree:
pwsh -NoProfile -File 7\scripts\Profile\Profile-ColorsAdoptionHook.ps1
# Faster, scoped to the edited script's folder:
pwsh -NoProfile -File 7\scripts\Profile\Profile-ColorsAdoptionHook.ps1 -Path 7\scripts\<Domain>
```

- Exit `0` = pass. `1` = violations (report lists file + line + text).
  `2` = audit machine broken — fix THAT first, never ignore it.
- The audit bans raw ConsoleColor literals (`-ForegroundColor Red`, splat
  forms, `$PSDefaultParameterValues`) **including inside strings and
  comments** — that is intentional. It ignores variable-bearing forms
  (`-ForegroundColor $col`) and role names (`Info`, `Warning`).
- `Black` and `DarkBlue` have no PCS role and are out of the audit's scope;
  leave them if you see them, note them to the user.

## Step 2 — Judgment pass (what the regex cannot check)

Read the script and check:

- [ ] Status lines use `Write-ProfileSuccess/-Warning/-Error/-Info/-Neutral`
      — not `Write-Host` with a hand-drawn symbol (rule d).
- [ ] Sections and separators use `Write-ProfileSection` / `Write-ProfileSeparator`
      / `Write-ProfileRule*` — never drawn by hand (rules b, c, f).
- [ ] Padding comes from `-KeyWidth` / `-Indent` / `Write-ProfileTableRow`,
      not hand-spaced strings.
- [ ] Every color is chosen by the role's **meaning** (§2 `UseFor`), not by
      what it looks like. Common traps: a path printed `Green` should be the
      `Path` role; a command echo in `Cyan` should be `Command`.
- [ ] Paren-wrapped cast forms (`-ForegroundColor ([ConsoleColor]::X)`,
      `$splat.X = ([ConsoleColor]::Y)`) are caught by the audit regex since
      the `\(?` widening. If working in an older checkout whose audit
      predates that fix, grep the script manually for `\[ConsoleColor\]`.
- [ ] The bootstrap guard prints **uncolored** if it runs before PCS is
      guaranteed (standalone scripts, elevated `-NoProfile` shells). A guard
      that calls `Get-ProfileColor` there crashes on the very failure it
      reports — this bit a real script (`Profile-InstallNerdFont.ps1`).
      Plain `Write-Host "[X] ..."`, no color parameter, ever.
- [ ] Existing source dividers and output conventions are preserved (rule h).
- [ ] Any custom output helper has a ≥5-line doc block: what it draws AND why
      the PCS family doesn't fit (rule g).

## Step 3 — Fix with the sanctioned replacements

| ❌ Before | ✅ After |
|---|---|
| `Write-Host $msg -ForegroundColor Green` | `Write-ProfileSuccess -Message $msg` |
| `Write-Host $msg -ForegroundColor Red` | `Write-ProfileError -Message $msg` |
| `Write-Host $msg -ForegroundColor Cyan` | `Write-Host $msg -ForegroundColor (Get-ProfileColor -Name Info)` |
| `Write-Host $msg -ForegroundColor Yellow` | `Write-Host $msg -ForegroundColor (Get-ProfileColor -Name Highlight)` |
| `Write-Host "---"` divider line | `Write-ProfileSeparator -Style Neutral` |
| `-ForegroundColor $(if ($x) { 'Red' } else { 'Green' })` | cache roles: `$colError = Get-ProfileColor -Name Error` … then branch on the **variables** |

Full before/after table: reference.md §9 "Fixing violations".

Role cache pattern for scripts with many lines (also audit-exempt):

```powershell
$colInfo    = Get-ProfileColor -Name Info
$colSuccess = Get-ProfileColor -Name Success
$colWarning = Get-ProfileColor -Name Warning
$colError   = Get-ProfileColor -Name Error
$colNeutral = Get-ProfileColor -Name Neutral
```

NEVER write `$col = 'Green'` — a hidden literal the regex cannot see (the
variable-indirection gap, reference.md §9). The variable must hold the result
of `Get-ProfileColor`.

If the script has no PCS bootstrap, add the copy-paste block from
reference.md §10 Step 1 (guarded dot-source, uncolored guard). If it runs
only inside sessions that already load PCS (e.g. a bridge invoked by another
script), use the silent bootstrap: `if (Test-Path $colorSystemPath) { . $colorSystemPath }`.

## Regression lock (run after any audit change)

`7\tests\Theme-AdoptionAuditRegex.Tests.ps1` pins the regex behavior matrix
(6 must-catch forms, 5 must-not-catch forms) against the LIVE patterns via
temp fixtures. If you touch `Theme-ColorSystem.ps1`'s audit patterns, run:

```powershell
pwsh -NoProfile -Command "Import-Module Pester; Invoke-Pester -Path 7\tests\Theme-AdoptionAuditRegex.Tests.ps1 -EnableExit"
```

The suite must stay 9/9 green. It lives outside the audit's scan scope on
purpose: its must-catch fixtures contain raw literals by design.

## Step 4 — Verify green, then stop

1. Parse-check every file you touched:

```powershell
$t=$null;$e=$null
[System.Management.Automation.Language.Parser]::ParseFile((Resolve-Path <file>),[ref]$t,[ref]$e) | Out-Null
if ($e.Count) { $e[0].Message } else { 'PARSE OK' }
```

2. Re-run Step 1 — must be exit `0`, `non-conforming 0`.
3. If a changed code path is safe to run (a `-Help` branch, a usage path, a
   guard), smoke-run it once. This catches runtime breaks parsing cannot —
   e.g. a guard calling `Get-ProfileColor` before PCS exists parses fine and
   crashes at runtime.
4. Report: files changed, hits fixed, final audit verdict, any out-of-scope
   notes (`Black`/`DarkBlue` literals left in place).

## Hard rules

- **Never weaken the audit, the hook, or the regex to make a change pass.**
  Fix the script, not the checker.
- Never commit with `--no-verify` to bypass a failing audit.
- Do not edit `Theme-ColorSystem.ps1` itself as part of a fix — it is exempt
  from the audit because it IS the system. Role additions are a separate,
  deliberate change (they change every consumer's palette).
- Preserve file encodings (several scripts carry a UTF-8 BOM) and CRLF/LF as
  the file already uses.

## Status reporting

End with one of: `DONE` (audit exit 0, evidence: scanned/conforming counts),
`DONE_WITH_CONCERNS` (green, but out-of-scope literals or judgment-pass items
you chose not to touch — list them), or `BLOCKED` (audit exit 2 / PCS missing
— state what is broken and what you tried).
