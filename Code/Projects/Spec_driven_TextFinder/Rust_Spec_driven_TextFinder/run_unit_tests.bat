@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

set FAILURES=0

echo building the workspace
cargo build --workspace --quiet
if errorlevel 1 (
  echo   build failed; every unit suite counts as failed
  exit /b 3
)

call :suite rust_textfinder_cmdline
call :suite rust_textfinder_dirnav
call :suite rust_textfinder_output

echo.
echo %FAILURES% unit suite^(s^) failed
exit /b %FAILURES%

:suite
echo.
echo === starting unit suite: %1
cargo test -p %1 --lib
set STATUS=!errorlevel!
echo === unit suite %1 returned !STATUS!
if not "!STATUS!"=="0" set /a FAILURES+=1
exit /b 0
