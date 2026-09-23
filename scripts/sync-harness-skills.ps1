#Requires -Version 5.1
<#
.SYNOPSIS
  Re-point the harness skill roots at the canonical ~/.agents/skills folders.

.DESCRIPTION
  Every harness reads ~/.agents/skills from its own root:

    Hermes                   -> $env:LOCALAPPDATA\hermes\skills        (Junction)
    Gemini CLI / Antigravity -> $env:USERPROFILE\.gemini\config\skills (SymbolicLink)

  Junction vs SymbolicLink matters: Gemini/Antigravity cannot see a Junction, so its
  entries must be SymbolicLinks. Creating one requires SeCreateSymbolicLinkPrivilege,
  which an admin shell has and a plain user shell does not. On a machine without it
  the script falls back to a real-directory copy - which does NOT track later edits
  to the canonical skill. Re-run this script after editing a skill to refresh those.

  OpenCode keeps real folders of its own (~/.config/opencode/skills) and is not touched.

.PARAMETER Name
  Skill folder name(s) under ~/.agents/skills, e.g. -Name i-pick-issue,create-issue.

.PARAMETER All
  Process every skill under the canonical root. Required when -Name is omitted, so a
  bare run never mass-deploys skills to a harness by accident.

.PARAMETER Check
  Report only; change nothing.

.PARAMETER Harness
  Which harness roots to touch: hermes, gemini, or both (default). Use -Harness hermes
  when the Gemini root is being handled elsewhere (e.g. an elevated shell converting
  copies to SymbolicLinks) - a parallel run against the same entries would race.

.EXAMPLE
  .\sync-harness-skills.ps1 -All -Check
  .\sync-harness-skills.ps1 -Name i-pick-issue,create-issue
  .\sync-harness-skills.ps1 -All -Harness hermes

Exit codes: 0 = every entry is a link, 1 = at least one entry is a copy, 2 = usage error.
#>
[CmdletBinding()]
param(
    [string[]]$Name,
    [switch]$All,
    [switch]$Check,
    [ValidateSet('hermes', 'gemini', 'both')]
    [string]$Harness = 'both'
)

$ErrorActionPreference = 'Stop'

$canonicalRoot = Join-Path $env:USERPROFILE '.agents\skills'
$hermesRoot    = Join-Path $env:LOCALAPPDATA 'hermes\skills'
$geminiRoot    = Join-Path $env:USERPROFILE '.gemini\config\skills'

$doHermes = $Harness -in @('hermes', 'both')
$doGemini = $Harness -in @('gemini', 'both')

if (-not (Test-Path $canonicalRoot)) { Write-Error "No canonical skills root at $canonicalRoot"; exit 2 }
if (-not $Name -and -not $All) {
    Write-Host 'Usage: sync-harness-skills.ps1 -Name <skill>[,<skill>] | -All [-Check] [-Harness hermes|gemini|both]'
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

    if (-not $doGemini) { continue }

    # ---- Gemini CLI / Antigravity: SymbolicLink, else copy ----------------
    $gPath = Join-Path $geminiRoot $skill
    if (Test-Linked $gPath 'SymbolicLink' $target) {
        $report += [PSCustomObject]@{ Skill = $skill; Harness = 'gemini'; LinkType = 'SymbolicLink'; State = 'ok' }
        continue
    }
    $gItem = Get-Item $gPath -Force -ErrorAction SilentlyContinue
    if ($Check) {
        if ($gItem) { $copies++ }
        $report += [PSCustomObject]@{ Skill = $skill; Harness = 'gemini'; LinkType = $(if ($gItem) { $gItem.LinkType } else { 'missing' }); State = 'needs symlink' }
        continue
    }
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

$report | Format-Table -AutoSize

if ($copies) {
    Write-Host ("{0} Gemini entr(y/ies) are real-directory copies and do not track canonical edits." -f $copies) -ForegroundColor Yellow
    Write-Host 'Re-run this script after editing those skills.' -ForegroundColor Yellow
    exit 1
}
Write-Host 'Every harness entry is a link to the canonical skills root.' -ForegroundColor Green
exit 0
