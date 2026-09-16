@echo off
rem run_integration_tests.bat - runs the rust_textfinder integration suite and reports its status
rem
rem Spec_TextFinder.md §6.2: the runner builds what it is about to run, announces the
rem suite and the status it returned, exits with the number of suites that failed, and
rem holds the console after its summary.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set FAILURES=0

echo building the workspace
cargo build --workspace --quiet
if errorlevel 1 (
  echo   build failed; the integration suite counts as failed
  set FAILURES=1
  goto :summary
)

echo.
echo === starting integration suite: integration
cargo test -p rust_textfinder_entry --test integration
set STATUS=!errorlevel!
echo === integration suite integration returned !STATUS!
if not "!STATUS!"=="0" set /a FAILURES+=1

:summary
echo.
echo !FAILURES! integration suite^(s^) failed
call :hold
exit /b !FAILURES!

rem --- §6.2: hold the console unless a capture suppressed it. ---
:hold
if not "%TEXTFINDER_NO_PAUSE%"=="" exit /b 0
echo.
pause
exit /b 0
