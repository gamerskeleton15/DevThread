$dest = Join-Path $HOME ".claude"
New-Item -ItemType Directory -Force -Path $dest, "$dest\agents", "$dest\commands" | Out-Null
$src = $PSScriptRoot

if (Test-Path "$dest\CLAUDE.md") {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item "$dest\CLAUDE.md" "$dest\CLAUDE.backup-$stamp.md"
    Write-Host "Existing CLAUDE.md backed up as CLAUDE.backup-$stamp.md"
}
Copy-Item "$src\CLAUDE.md" "$dest\CLAUDE.md" -Force
Copy-Item "$src\agents\*" "$dest\agents" -Force
Copy-Item "$src\commands\*" "$dest\commands" -Force
Write-Host "Done. Installed to $dest. Restart Claude Code."
