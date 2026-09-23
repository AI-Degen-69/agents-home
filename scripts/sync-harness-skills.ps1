#Requires -Version 5.1
<#
.SYNOPSIS
  Re-point the harness skill roots at the canonical ~/.agents/skills folders.

.DESCRIPTION
  Every harness reads ~/.agents/skills from its own root:

    Hermes                   -> $env:LOCALAPPDATA\hermes\skills          (Junction)
    Gemini CLI / Antigravity -> $env:USERPROFILE\.gemini\config\skills   (SymbolicLink)
    OpenCode / Desktop       -> $env:USERPROFILE\.config\opencode\skills (Junction)

  Junction vs SymbolicLink matters: Gemini/Antigravity cannot see a Junction, so its
  entries must be SymbolicLinks. Creating one requires SeCreateSymbolicLinkPrivilege,
  which an admin shell has and a plain user shell does not. On a machine without it
  the script falls back to a real-directory copy - which does NOT track later edits
  to the canonical skill. Re-run this script after editing a skill to refresh those.

  OpenCode Desktop reads ~/.config/opencode/skills. Junctions work there and need no
  privilege. An existing entry that is ANY link kind pointing at canonical counts as ok
  (that root already holds a few SymbolicLinks); a stale real-directory copy is
  replaced with a Junction.

.PARAMETER Name
  Skill folder name(s) under ~/.agents/skills, e.g. -Name i-pick-issue,create-issue.

.PARAMETER All
  Process every skill under the canonical root. Required when -Name is omitted, so a
  bare run never mass-deploys skills to a harness by accident.

.PARAMETER Check
  Report only; change nothing.

.PARAMETER Harness
  Which harness roots to touch: hermes, gemini, opencode, both (= hermes+gemini, the
  default), or all (= every root). Use a narrow value when a root is being handled
  elsewhere (e.g. an elevated shell converting Gemini copies to SymbolicLinks) - a
  parallel run against the same entries would race.

.EXAMPLE
  .\sync-harness-skills.ps1 -All -Check
  .\sync-harness-skills.ps1 -Name i-pick-issue,create-issue
  .\sync-harness-skills.ps1 -All -Harness hermes
  .\sync-harness-skills.ps1 -Name i-pick-issue -Harness opencode

Exit codes: 0 = every entry is a link, 1 = at least one entry is a copy, 2 = usage error.
#>
[CmdletBinding()]
param(
    [string[]]$Name,
    [switch]$All,
    [switch]$Check,
    [ValidateSet('hermes', 'gemini', 'opencode', 'both', 'all')]
    [string]$Harness = 'both'
)

$ErrorActionPreference = 'Stop'

$canonicalRoot = Join-Path $env:USERPROFILE '.agents\skills'
$hermesRoot    = Join-Path $env:LOCALAPPDATA 'hermes\skills'
$geminiRoot    = Join-Path $env:USERPROFILE '.gemini\config\skills'
$opencodeRoot  = Join-Path $env:USERPROFILE '.config\opencode\skills'

$doHermes   = $Harness -in @('hermes', 'both', 'all')
$doGemini   = $Harness -in @('gemini', 'both', 'all')
$doOpencode = $Harness -in @('opencode', 'all')

if (-not (Test-Path $canonicalRoot)) { Write-Error "No canonical skills root at $canonicalRoot"; exit 2 }
if (-not $Name -and -not $All) {
    Write-Host 'Usage: sync-harness-skills.ps1 -Name <skill>[,<skill>] | -All [-Check] [-Harness hermes|gemini|opencode|both|all]'
    exit 2
}

if ($Name) {
    foreach ($n in $Name) {
        if (-not (Test-Path (Join-Path $canonicalRoot "$n\SKILL.md"))) { Write-Error "Not a skill folder: $n"; exit 2 }
    }
    $skills = $Name
} else {
    $skills = Get-ChildItem $canonicalRoot -Directory |
        Where-Object { Test-Path (Join-Path $_.FullName 'SKILL.md') } |
        Select-Object -ExpandProperty Name
}

# A Junction/SymbolicLink is removed as a link (never through it); a real folder with its contents.
function Remove-Entry([string]$Path) {
    $item = Get-Item $Path -Force -ErrorAction SilentlyContinue
    if (-not $item) { return }
    if ($item.LinkType -in @('Junction', 'SymbolicLink')) { cmd /c rmdir "$Path" | Out-Null }
    else { Remove-Item $Path -Recurse -Force }
}

function Test-Linked([string]$Path, [string]$ExpectedLinkType, [string]$Target) {
    $item = Get-Item $Path -Force -ErrorAction SilentlyContinue
    if (-not $item) { return $false }
    if ($item.LinkType -ne $ExpectedLinkType) { return $false }
    return ($item.Target -contains $Target)
}

$copies = 0
$report = @()

foreach ($skill in $skills) {
    $target = Join-Path $canonicalRoot $skill

    # ---- Hermes: Junction -------------------------------------------------
    if ($doHermes) {
        $hPath = Join-Path $hermesRoot $skill
        if (Test-Linked $hPath 'Junction' $target) {
            $report += [PSCustomObject]@{ Skill = $skill; Harness = 'hermes'; LinkType = 'Junction'; State = 'ok' }
        } elseif ($Check) {
            $hItem = Get-Item $hPath -Force -ErrorAction SilentlyContinue
            $report += [PSCustomObject]@{ Skill = $skill; Harness = 'hermes'; LinkType = $(if ($hItem) { $hItem.LinkType } else { 'missing' }); State = 'needs link' }
        } else {
            Remove-Entry $hPath
            New-Item -ItemType Junction -Path $hPath -Target $target | Out-Null
            $report += [PSCustomObject]@{ Skill = $skill; Harness = 'hermes'; LinkType = 'Junction'; State = 'linked' }
        }
    }

    # ---- Gemini CLI / Antigravity: SymbolicLink, else copy ----------------
    if ($doGemini) {
        $gPath = Join-Path $geminiRoot $skill
        if (Test-Linked $gPath 'SymbolicLink' $target) {
            $report += [PSCustomObject]@{ Skill = $skill; Harness = 'gemini'; LinkType = 'SymbolicLink'; State = 'ok' }
        } else {
            $gItem = Get-Item $gPath -Force -ErrorAction SilentlyContinue
            if ($Check) {
                if ($gItem -and -not $gItem.LinkType) { $copies++ }
                $report += [PSCustomObject]@{ Skill = $skill; Harness = 'gemini'; LinkType = $(if ($gItem) { $gItem.LinkType } else { 'missing' }); State = 'needs symlink' }
            } else {
                Remove-Entry $gPath
                try {
                    New-Item -ItemType SymbolicLink -Path $gPath -Target $target -ErrorAction Stop | Out-Null
                    $report += [PSCustomObject]@{ Skill = $skill; Harness = 'gemini'; LinkType = 'SymbolicLink'; State = 'linked' }
                } catch {
                    Copy-Item -Path $target -Destination $gPath -Recurse -Force
                    $copies++
                    $report += [PSCustomObject]@{ Skill = $skill; Harness = 'gemini'; LinkType = 'Directory'; State = 'copied (no symlink privilege)' }
                }
            }
        }
    }

    # ---- OpenCode / Desktop: Junction (any correct link kind counts as ok) --
    if ($doOpencode) {
        $oPath = Join-Path $opencodeRoot $skill
        $oItem = Get-Item $oPath -Force -ErrorAction SilentlyContinue
        if ($oItem -and $oItem.LinkType -in @('Junction', 'SymbolicLink') -and ($oItem.Target -contains $target)) {
            $report += [PSCustomObject]@{ Skill = $skill; Harness = 'opencode'; LinkType = $oItem.LinkType; State = 'ok' }
        } elseif ($Check) {
            if ($oItem -and -not $oItem.LinkType) { $copies++ }
            $report += [PSCustomObject]@{ Skill = $skill; Harness = 'opencode'; LinkType = $(if ($oItem) { $oItem.LinkType } else { 'missing' }); State = 'needs link' }
        } else {
            Remove-Entry $oPath
            New-Item -ItemType Junction -Path $oPath -Target $target | Out-Null
            $report += [PSCustomObject]@{ Skill = $skill; Harness = 'opencode'; LinkType = 'Junction'; State = 'linked' }
        }
    }
}

$report | Format-Table -AutoSize

if ($copies) {
    Write-Host ("{0} Gemini entr(y/ies) are real-directory copies and do not track canonical edits." -f $copies) -ForegroundColor Yellow
    Write-Host 'Re-run this script after editing those skills.' -ForegroundColor Yellow
    exit 1
}
Write-Host 'Every harness entry is a link to the canonical skills root.' -ForegroundColor Green
exit 0
