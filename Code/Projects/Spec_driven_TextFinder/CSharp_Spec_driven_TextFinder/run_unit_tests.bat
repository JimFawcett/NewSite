@echo off
rem run_unit_tests.bat - runs every CSharp_TextFinder unit suite and reports each status
rem
rem Spec_TextFinder.md §6.2: the runner builds what it is about to run, announces each
rem suite and the status it returned, exits with the number of suites that failed, and
rem holds the console after its summary.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set FAILURES=0

echo building the solution
dotnet build CSharp_TextFinder.sln --nologo --verbosity quiet
if errorlevel 1 (
  echo   build failed; all 3 unit suites count as failed
  set FAILURES=3
  goto :summary
)

call :suite CSharp_TextFinder_Cmdline_UnitTest CSharp_Spec_driven_Cmdline\test
call :suite CSharp_TextFinder_Dirnav_UnitTest  CSharp_Spec_driven_Dirnav\test
call :suite CSharp_TextFinder_Output_UnitTest  CSharp_Spec_driven_Output\test

:summary
echo.
echo !FAILURES! unit suite^(s^) failed
call :hold
exit /b !FAILURES!

:suite
echo.
echo === starting unit suite: %1
set DRIVER=%~dp0%2\bin\Debug\net8.0\%1.exe
if not exist "!DRIVER!" (
  echo not built: !DRIVER!
  echo === unit suite %1 returned not built
  set /a FAILURES+=1
  exit /b 0
)
"!DRIVER!"
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
