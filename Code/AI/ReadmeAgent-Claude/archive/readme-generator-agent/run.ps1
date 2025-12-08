# README Generator Agent - Windows PowerShell Start Script
# Run this script to start the README Generator Agent

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   README Generator Agent" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
$pythonCmd = $null
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCmd = "py"
} else {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8 or higher from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "Found Python: $pythonCmd" -ForegroundColor Green

# Check if Flask is installed
$flaskInstalled = & $pythonCmd -c "import flask" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & $pythonCmd -m pip install -r requirements.txt
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Error: Failed to install dependencies" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting README Generator Agent..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application at: " -NoNewline
Write-Host "http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Start the Flask application
& $pythonCmd readme_agent.py
