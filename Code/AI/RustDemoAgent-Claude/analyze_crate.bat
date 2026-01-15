@echo off
REM Rust Crate Analyzer - Windows Batch Wrapper
REM Double-click friendly launcher

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Rust Crate Analyzer for Windows
echo ========================================
echo.

REM Check if a path was provided
if "%~1"=="" (
    echo Usage: Drop a folder onto this batch file
    echo        OR run: analyze_crate.bat "C:\path\to\crate"
    echo.
    echo Alternatively, enter the crate path now:
    set /p CRATE_PATH="Crate path: "
) else (
    set CRATE_PATH=%~1
)

REM Check if path exists
if not exist "!CRATE_PATH!" (
    echo.
    echo ERROR: Path does not exist: !CRATE_PATH!
    echo.
    pause
    exit /b 1
)

echo.
echo Analyzing crate at: !CRATE_PATH!
echo.

REM Find the Python script in the same directory as this batch file
set SCRIPT_DIR=%~dp0
set ANALYZER_SCRIPT=%SCRIPT_DIR%rust_crate_analyzer.py

if not exist "!ANALYZER_SCRIPT!" (
    echo ERROR: rust_crate_analyzer.py not found
    echo Expected location: !ANALYZER_SCRIPT!
    echo.
    pause
    exit /b 1
)

REM Run the analyzer
python "!ANALYZER_SCRIPT!" "!CRATE_PATH!"

if !ERRORLEVEL! EQU 0 (
    echo.
    echo ========================================
    echo   Analysis completed successfully!
    echo ========================================
    echo.
    echo Generated files are in the crate directory.
    echo.
    
    REM Ask if user wants to open the markdown file
    set /p OPEN_FILE="Open the documentation? (Y/N): "
    if /i "!OPEN_FILE!"=="Y" (
        REM Find and open the markdown file
        for %%F in ("!CRATE_PATH!\*_interface.md") do (
            start "" "%%F"
        )
    )
) else (
    echo.
    echo ========================================
    echo   Analysis failed
    echo ========================================
    echo.
)

echo.
pause
