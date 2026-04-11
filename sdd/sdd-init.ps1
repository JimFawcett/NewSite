# sdd-init.ps1
# Scaffolds Spec-Driven Development structure into a project folder.
# Usage: .\sdd-init.ps1 -ProjectPath "C:\path\to\project"

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath
)

$TemplatesRoot = Join-Path $PSScriptRoot "templates"
$CommandSource = Join-Path $PSScriptRoot "commands"

# Resolve project path
$ProjectPath = Resolve-Path $ProjectPath -ErrorAction Stop

Write-Host ""
Write-Host "SDD Bootstrap" -ForegroundColor Cyan
Write-Host "Project: $ProjectPath" -ForegroundColor Gray
Write-Host ""

# --- Create folder structure ---
$folders = @(
    ".sdd",
    (".sdd" + "\features"),
    ".claude",
    (".claude" + "\commands")
)

foreach ($folder in $folders) {
    $full = Join-Path $ProjectPath $folder
    if (-not (Test-Path $full)) {
        New-Item -ItemType Directory -Path $full | Out-Null
        Write-Host "  Created  $folder" -ForegroundColor Green
    } else {
        Write-Host "  Exists   $folder" -ForegroundColor DarkGray
    }
}

# --- Copy constitution template ---
$constitutionDest = Join-Path $ProjectPath (".sdd" + "\constitution.md")
if (-not (Test-Path $constitutionDest)) {
    Copy-Item (Join-Path $TemplatesRoot "constitution.template.md") $constitutionDest
    Write-Host "  Created  .sdd\constitution.md  (from template)" -ForegroundColor Green
} else {
    Write-Host "  Exists   .sdd\constitution.md  (skipped)" -ForegroundColor DarkGray
}

# --- Copy slash commands ---
$commands = @(
    "sdd_init.md",
    "sdd_feature.md",
    "sdd_plan.md",
    "sdd_implement.md"
)

foreach ($cmd in $commands) {
    $src  = Join-Path $CommandSource $cmd
    $dest = Join-Path $ProjectPath (".claude" + "\commands\" + $cmd)
    if (-not (Test-Path $dest)) {
        if (Test-Path $src) {
            Copy-Item $src $dest
            Write-Host "  Created  .claude\commands\$cmd" -ForegroundColor Green
        } else {
            Write-Host "  Missing  $src - copy manually" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  Exists   .claude\commands\$cmd  (skipped)" -ForegroundColor DarkGray
    }
}

# --- Summary ---
Write-Host ""
Write-Host "Done. Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open VS Code in $ProjectPath"
Write-Host "  2. Run /sdd_init in Claude Code to fill in constitution.md"
Write-Host "  3. Review and edit constitution.md before starting any feature work"
Write-Host "  4. Use /sdd_feature [name] to begin your first feature spec"
Write-Host ""
