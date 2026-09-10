@echo off
rem run_demo.bat - runs the Cpp_TextFinder demonstration and reports its status
rem
rem Two optional arguments override the executable and the demo root, both of which
rem CMake compiled into the driver.

setlocal enabledelayedexpansion

set "BUILD=%~dp0build"
set "DEMO=%BUILD%\Cpp_TextFinder_Demo_Driver.exe"

echo Build directory: %BUILD%
echo.

if not exist "%DEMO%" (
  echo   not built: %DEMO%
  echo --- Demo: NOT RUN ---
  pause
  exit /b 1
)

"%DEMO%" %1 %2
set "STATUS=!ERRORLEVEL!"

echo.
if "!STATUS!"=="0" (
  echo --- Demo: exit status !STATUS! ^(OK^) ---
) else (
  echo --- Demo: exit status !STATUS! ^(FAILED^) ---
)
pause
exit /b !STATUS!
