# Software Development Agent - PowerShell Launcher
# This script helps Windows users set up and run the dev agent

Write-Host "`n========================================"
Write-Host "  Software Development Agent Setup"
Write-Host "========================================`n"

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python installed: $pythonVersion"
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if API key is set
if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host "[WARNING] ANTHROPIC_API_KEY environment variable is not set" -ForegroundColor Yellow
    Write-Host "`nYou can set it permanently by running:"
    Write-Host "  [System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY','your-key','User')"
    Write-Host "`nOr set it for this session:"
    
    $tempKey = Read-Host "Enter your Anthropic API key (or press Enter to skip)"
    if ($tempKey) {
        $env:ANTHROPIC_API_KEY = $tempKey
        Write-Host "API key set for this session only" -ForegroundColor Green
    }
    Write-Host ""
}

# Check if dependencies are installed
Write-Host "Checking dependencies..."
$anthropicInstalled = pip show anthropic 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[INFO] Installing required dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host ""
}

# Run the agent
Write-Host "Starting Software Development Agent...`n"

if ($args.Count -eq 0) {
    python dev_agent.py .
} else {
    python dev_agent.py $args
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Agent exited with an error" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
