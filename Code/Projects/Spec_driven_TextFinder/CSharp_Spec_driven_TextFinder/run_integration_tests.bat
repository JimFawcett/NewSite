@echo off
rem run_integration_tests.bat - runs the CSharp_TextFinder integration suite and reports its status
rem
rem An argument overrides the executable under test.
rem
rem Spec_TextFinder.md §6.2: the runner builds what it is about to run, announces the
rem suite and the status it returned, exits with the number of suites that failed, and
rem holds the console after its summary.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set FAILURES=0

echo building the solution
dotnet build CSharp_TextFinder.sln --nologo --verbosity quiet
if errorlevel 1 (
  echo   build failed; the integration suite counts as failed
  set FAILURES=1
  goto :summary
)

echo.
echo === starting integration suite: integration
set DRIVER=%~dp0test\bin\Debug\net8.0\CSharp_TextFinder_IntegrationTest.exe
if not exist "!DRIVER!" (
  echo not built: !DRIVER!
  echo === integration suite integration returned not built
  set /a FAILURES+=1
) else (
  "!DRIVER!" %1
  set STATUS=!errorlevel!
  echo === integration suite integration returned !STATUS!
  if not "!STATUS!"=="0" set /a FAILURES+=1
)

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
