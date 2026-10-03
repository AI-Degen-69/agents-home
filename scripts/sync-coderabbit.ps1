#Requires -Version 5.1
<#
.SYNOPSIS
  Sync the canonical .coderabbit.yaml into repository roots.

.DESCRIPTION
  The canonical file lives at ~/.agents/.coderabbit.yaml, the repository root of
  agents-home (part of the global agents family, like skills/ and docs/).
  It sits at that root deliberately: CodeRabbit reads YAML only from a repo's
  git root, so a file anywhere else never governs anything.

  DANGER - merge, never blind-copy: some repos already carry a full
  .coderabbit.yaml (path filters, profile, etc.). This script only writes
  the canonical file into a repo whose .coderabbit.yaml is MISSING, or
  whose content is byte-identical to the canonical file (a previous sync).
  Any other existing file is skipped and reported - merge the
  auto_title_instructions block in by hand.

  Usage:
    sync-coderabbit.ps1                    # sync all known repos
    sync-coderabbit.ps1 <repo-path> ...    # sync specific repos

  After syncing, commit the file in each repo (CodeRabbit reads it from
  the remote, not from your disk). Until committed, the previous settings
  apply.
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
    [string[]]$Repos
)

$ErrorActionPreference = 'Stop'

$canonical = Join-Path $env:USERPROFILE '.agents\.coderabbit.yaml'
if (-not (Test-Path $canonical)) {
    Write-Error "Canonical file not found: $canonical"
    exit 2
}

# Known repos — extend this list as projects come and go.
$knownRepos = @(
    "$env:USERPROFILE\Agents\Projects\spread-hunter-live",
    "$env:USERPROFILE\Agents\Projects\AI Trading\crypto-spread"
)

$targets = if ($Repos) { $Repos } else { $knownRepos }

$synced = 0
$canonicalBytes = [System.IO.File]::ReadAllBytes($canonical)
foreach ($repo in $targets) {
    if (-not (Test-Path (Join-Path $repo '.git'))) {
        Write-Warning "Skip (not a git repo): $repo"
        continue
    }
    $dest = Join-Path $repo '.coderabbit.yaml'
    # agents-home IS the canonical home since #24, so targeting it here would
    # make source and destination the same file and Copy-Item would fail.
    if ([System.IO.Path]::GetFullPath($dest) -eq [System.IO.Path]::GetFullPath($canonical)) {
        Write-Host "Skip (this is the canonical home repo): $repo"
        continue
    }
    if (Test-Path $dest) {
        $existing = [System.IO.File]::ReadAllBytes($dest)
        $identical = $existing.Length -eq $canonicalBytes.Length
        if ($identical) {
            for ($i = 0; $i -lt $existing.Length; $i++) {
                if ($existing[$i] -ne $canonicalBytes[$i]) { $identical = $false; break }
            }
        }
        if (-not $identical) {
            Write-Warning "Skip (existing custom config differs from canonical - merge auto_title_instructions in by hand): $dest"
            continue
        }
    }
    Copy-Item -Path $canonical -Destination $dest -Force
    $synced++
    Write-Host "Synced: $dest"
    # Show git state so the operator knows a commit is pending.
    Push-Location $repo
    git status --short -- .coderabbit.yaml
    Pop-Location
}

Write-Host ""
Write-Host "Done: $synced repo(s) synced. Commit each .coderabbit.yaml to activate."
