@echo off
rem run_unit_tests.bat - runs every rust_textfinder unit suite and reports each status
rem
rem Spec_TextFinder.md §6.2: the runner builds what it is about to run, announces each
rem suite and the status it returned, exits with the number of suites that failed, and
rem holds the console after its summary.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set FAILURES=0

echo building the workspace
cargo build --workspace --quiet
if errorlevel 1 (
  echo   build failed; all 3 unit suites count as failed
  set FAILURES=3
  goto :summary
)

call :suite rust_textfinder_cmdline
call :suite rust_textfinder_dirnav
call :suite rust_textfinder_output

:summary
echo.
echo !FAILURES! unit suite^(s^) failed
call :hold
exit /b !FAILURES!

:suite
echo.
echo === starting unit suite: %1
cargo test -p %1 --lib
set STATUS=!errorlevel!
echo === unit suite %1 returned !STATUS!
if not "!STATUS!"=="0" set /a FAILURES+=1
exit /b 0

rem --- §6.2: hold the console unless a capture suppressed it. ---
:hold
if not "%TEXTFINDER_NO_PAUSE%"=="" exit /b 0
echo.
pause
exit /b 0
