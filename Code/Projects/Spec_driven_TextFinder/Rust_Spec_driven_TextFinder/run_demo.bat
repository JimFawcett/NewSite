@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set FAILURES=0

echo building the workspace
cargo build --workspace --quiet
if errorlevel 1 (
  echo   build failed; the demonstration counts as failed
  exit /b 1
)

for /f %%d in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set TEXTFINDER_DEMO_DATE=%%d

echo.
echo === starting demonstration: demonstration
echo === captured %TEXTFINDER_DEMO_DATE%
cargo test -p rust_textfinder_entry --test demonstration -- --nocapture
set STATUS=!errorlevel!
echo === demonstration returned !STATUS!
if not "!STATUS!"=="0" set /a FAILURES+=1

echo.
echo %FAILURES% demonstration^(s^) failed
exit /b %FAILURES%
