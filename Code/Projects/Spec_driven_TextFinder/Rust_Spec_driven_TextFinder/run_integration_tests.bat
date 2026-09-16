@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set FAILURES=0

echo building the workspace
cargo build --workspace --quiet
if errorlevel 1 (
  echo   build failed; the integration suite counts as failed
  exit /b 1
)

echo.
echo === starting integration suite: integration
cargo test -p rust_textfinder_entry --test integration
set STATUS=!errorlevel!
echo === integration suite integration returned !STATUS!
if not "!STATUS!"=="0" set /a FAILURES+=1

echo.
echo %FAILURES% integration suite^(s^) failed
exit /b %FAILURES%
