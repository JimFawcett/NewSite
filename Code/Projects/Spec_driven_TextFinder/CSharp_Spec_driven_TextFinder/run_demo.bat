@echo off
rem run_demo.bat - runs the CSharp_TextFinder demonstration and reports its status
rem
rem Spec_TextFinder.md §6.2: the runner builds what it is about to run, supplies the
rem capture date, announces the status the demonstration returned, and holds the console
rem after its summary.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set FAILURES=0

echo building the solution
dotnet build CSharp_TextFinder.sln --nologo --verbosity quiet
if errorlevel 1 (
  echo   build failed; the demonstration counts as failed
  set FAILURES=1
  goto :summary
)

for /f %%d in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set TEXTFINDER_DEMO_DATE=%%d

echo.
echo === starting demonstration: demonstration
echo === captured %TEXTFINDER_DEMO_DATE%
set DRIVER=%~dp0demo\bin\Debug\net8.0\CSharp_TextFinder_Demo.exe
if not exist "!DRIVER!" (
  echo not built: !DRIVER!
  echo === demonstration returned not built
  set /a FAILURES+=1
) else (
  "!DRIVER!"
  set STATUS=!errorlevel!
  echo === demonstration returned !STATUS!
  if not "!STATUS!"=="0" set /a FAILURES+=1
)

:summary
echo.
echo !FAILURES! demonstration^(s^) failed
call :hold
exit /b !FAILURES!

rem --- §6.2: hold the console unless a capture suppressed it. ---
:hold
if not "%TEXTFINDER_NO_PAUSE%"=="" exit /b 0
echo.
pause
exit /b 0
