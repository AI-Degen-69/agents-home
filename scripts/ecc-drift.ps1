#Requires -Version 5.1
<#
.SYNOPSIS
  Drift protection for ~/.agents after ECC installs/updates.

.DESCRIPTION
  ecc-drift.ps1 snapshot : record the current state of ~/.agents into a baseline
  ecc-drift.ps1 check    : compare current state against the baseline and report
                           files that were silently added / modified / deleted
  ecc-drift.ps1 baseline : print the baseline's timestamp + file count (sanity)

  Usage pattern:
    1. Run `snapshot` (or let it auto-run) right before an ECC install/update.
    2. Run the install / update.
    3. Run `check`. Any file that differs from the baseline was overwritten
       by the install and is reported BEFORE the change cascades to every
       harness that reads ~/.agents.

  The baseline is a JSON manifest (path + SHA256 + size + mtime) stored at
  $env:USERPROFILE\.agents\.ecc-drift-baseline.json. Files are compared by
  hash, not mtime, so re-saves and permission touches don't false-positive.

  Exit codes: 0 = no drift (or benign), 1 = drift detected, 2 = usage/baseline error.
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('snapshot', 'check', 'baseline')]
    [string]$Command = 'check',

    # Only these file extensions are tracked (skills/docs/scripts).
    [string[]]$Include = @('*.md', '*.ps1', '*.js', '*.json', '*.yaml', '*.yml', '*.toml'),

    # Directories (relative to ~/.agents) that are expected to churn and are ignored.
    [string[]]$ExcludeDir = @('node_modules', '.git', 'scratchpad'),

    # Print the actual diff-style old/new hash lines on drift.
    [switch]$ShowHashes
)

$ErrorActionPreference = 'Stop'

$agentsRoot   = Join-Path $env:USERPROFILE '.agents'
$baselinePath = Join-Path $agentsRoot '.ecc-drift-baseline.json'

if (-not (Test-Path $agentsRoot)) {
    Write-Error "No ~/.agents directory found at $agentsRoot"
    exit 2
}

function Get-TrackedFiles {
    Get-ChildItem -Path $agentsRoot -Recurse -File -Include $Include |
        Where-Object { $_.FullName -ne $baselinePath } |
        Where-Object {
            $rel = $_.FullName.Substring($agentsRoot.Length).TrimStart('\','/')
            $parts = $rel -split '[\\/]'
            -not ($parts | Where-Object { $ExcludeDir -contains $_ })
        } |
        ForEach-Object {
            $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
            [PSCustomObject]@{
                path      = $_.FullName.Substring($agentsRoot.Length).TrimStart('\','/').Replace('\','/')
                hash      = $hash
                size      = $_.Length
                mtimeUtc  = $_.LastWriteTimeUtc.ToString('o')
            }
        }
}

function Save-Baseline {
    $files = @(Get-TrackedFiles)
    $manifest = [PSCustomObject]@{
        createdAtUtc = (Get-Date).ToUniversalTime().ToString('o')
        fileCount    = $files.Count
        files        = $files
    }
    $manifest | ConvertTo-Json -Depth 4 | Set-Content -Path $baselinePath -Encoding UTF8
    Write-Host ("Baseline saved: {0} file(s) at {1}" -f $files.Count, $manifest.createdAtUtc)
}

function Get-Baseline {
    if (-not (Test-Path $baselinePath)) {
        Write-Error "No baseline found at $baselinePath. Run 'ecc-drift.ps1 -Snapshot' first (e.g. right before an ECC install/update)."
        exit 2
    }
    $raw = Get-Content $baselinePath -Raw | ConvertFrom-Json
    @($raw.files)
}

# ---- Commands --------------------------------------------------------------

if ($Command -eq 'snapshot') {
    Save-Baseline
    exit 0
}

if ($Command -eq 'baseline') {
    if (-not (Test-Path $baselinePath)) {
        Write-Host "No baseline exists yet."
        exit 2
    }
    $m = Get-Content $baselinePath -Raw | ConvertFrom-Json
    Write-Host ("Baseline: {0} file(s), taken {1}" -f $m.fileCount, $m.createdAtUtc)
    exit 0
}

# Default: check
$baseline = Get-Baseline
$current  = @(Get-TrackedFiles)

$baseMap = @{}
foreach ($f in $baseline) { $baseMap[$f.path] = $f }
$currMap = @{}
foreach ($f in $current)  { $currMap[$f.path] = $f }

$modified = @()
foreach ($f in $current) {
    if ($baseMap.ContainsKey($f.path) -and $baseMap[$f.path].hash -ne $f.hash) { $modified += $f }
}
$added   = @($current  | Where-Object { -not $baseMap.ContainsKey($_.path) })
$deleted = @($baseline | Where-Object { -not $currMap.ContainsKey($_.path) })

if (-not $modified -and -not $added -and -not $deleted) {
    Write-Host ("OK: no drift in ~/.agents ({0} file(s) match baseline)." -f $current.Count)
    exit 0
}

Write-Host ""
Write-Host "DRIFT DETECTED in ~/.agents" -ForegroundColor Yellow
Write-Host ""

if ($modified.Count) {
    Write-Host ("Modified ({0}):" -f $modified.Count) -ForegroundColor Yellow
    foreach ($f in $modified) {
        Write-Host ("  ~ {0}" -f $f.path)
        if ($ShowHashes) {
            Write-Host ("      was {0}" -f $baseMap[$f.path].hash)   -ForegroundColor DarkGray
            Write-Host ("      now {0}" -f $f.hash)                  -ForegroundColor DarkGray
        }
    }
    Write-Host ""
}
if ($deleted.Count) {
    Write-Host ("Deleted ({0}):" -f $deleted.Count) -ForegroundColor Red
    foreach ($f in $deleted) { Write-Host ("  - {0}" -f $f.path) }
    Write-Host ""
}
if ($added.Count) {
    Write-Host ("Added ({0}):" -f $added.Count) -ForegroundColor Cyan
    foreach ($f in $added) { Write-Host ("  + {0}" -f $f.path) }
    Write-Host ""
}

Write-Host "Files listed above differ from the pre-install baseline."
Write-Host "If these were deliberate customizations, restore them from the baseline"
Write-Host "(baseline hash = pre-install content) before the change reaches other harnesses."
exit 1
