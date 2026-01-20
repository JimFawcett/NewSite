@echo off
REM Software Development Agent - Windows Setup and Launcher
REM This batch file helps Windows users set up and run the dev agent

echo.
echo ========================================
echo   Software Development Agent Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Check if API key is set
if not defined ANTHROPIC_API_KEY (
    echo [WARNING] ANTHROPIC_API_KEY environment variable is not set
    echo.
    echo You can set it permanently by running:
    echo   setx ANTHROPIC_API_KEY your-api-key-here
    echo.
    echo Or set it for this session:
    set /p TEMP_KEY="Enter your Anthropic API key (or press Enter to skip): "
    if not "!TEMP_KEY!"=="" (
        set ANTHROPIC_API_KEY=!TEMP_KEY!
        echo API key set for this session only
    )
    echo.
)

REM Check if dependencies are installed
echo Checking dependencies...
pip show anthropic >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing required dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Run the agent
echo Starting Software Development Agent...
echo.

if "%1"=="" (
    python dev_agent.py .
) else (
    python dev_agent.py %*
)

if errorlevel 1 (
    echo.
    echo [ERROR] Agent exited with an error
    pause
)
