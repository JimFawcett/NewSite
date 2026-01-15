# Rust Crate Analyzer - PowerShell Wrapper
# Convenient wrapper for Windows 11 users

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$CratePath,
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host ""
    Write-Host "Rust Crate Analyzer - PowerShell Wrapper" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Analyzes a Rust crate and generates documentation + example code" -ForegroundColor White
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\analyze_crate.ps1 <path_to_crate>" -ForegroundColor Gray
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\analyze_crate.ps1 C:\projects\my_crate" -ForegroundColor Gray
    Write-Host "  .\analyze_crate.ps1 .\local_crate" -ForegroundColor Gray
    Write-Host "  .\analyze_crate.ps1 ..\sibling_crate" -ForegroundColor Gray
    Write-Host ""
    Write-Host "OUTPUT:" -ForegroundColor Yellow
    Write-Host "  - <crate_name>_interface.md  (in crate root)" -ForegroundColor Gray
    Write-Host "  - examples/demo.rs           (in examples directory)" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

if ($Help) {
    Show-Help
}

# Display banner
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Rust Crate Analyzer for Windows 11       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: Python not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python 3.7+ from:" -ForegroundColor Yellow
    Write-Host "  https://www.python.org/downloads/" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Resolve the crate path
$resolvedPath = Resolve-Path -Path $CratePath -ErrorAction SilentlyContinue

if (-not $resolvedPath) {
    Write-Host "✗ Error: Crate path not found: $CratePath" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "✓ Crate path: $resolvedPath" -ForegroundColor Green
Write-Host ""

# Find the analyzer script
$analyzerScript = Join-Path $PSScriptRoot "rust_crate_analyzer.py"

if (-not (Test-Path $analyzerScript)) {
    Write-Host "✗ Error: rust_crate_analyzer.py not found" -ForegroundColor Red
    Write-Host "  Expected location: $analyzerScript" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Run the analyzer
Write-Host "Running analyzer..." -ForegroundColor Yellow
Write-Host ""

try {
    python $analyzerScript $resolvedPath
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "        Analysis completed successfully!        " -ForegroundColor Green
        Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        
        # List generated files
        $mdFile = Get-ChildItem -Path $resolvedPath -Filter "*_interface.md" | Select-Object -First 1
        $exampleFile = Join-Path $resolvedPath "examples\demo.rs"
        
        Write-Host "Generated files:" -ForegroundColor Cyan
        if ($mdFile) {
            Write-Host "  📄 $($mdFile.FullName)" -ForegroundColor White
        }
        if (Test-Path $exampleFile) {
            Write-Host "  🦀 $exampleFile" -ForegroundColor White
        }
        Write-Host ""
        
        # Offer to open files
        Write-Host "Would you like to open the markdown file? (Y/N): " -ForegroundColor Yellow -NoNewline
        $response = Read-Host
        
        if ($response -eq "Y" -or $response -eq "y") {
            if ($mdFile) {
                Start-Process $mdFile.FullName
            }
        }
    } else {
        Write-Host ""
        Write-Host "✗ Analysis failed (exit code: $exitCode)" -ForegroundColor Red
        Write-Host ""
        exit $exitCode
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error running analyzer: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}
