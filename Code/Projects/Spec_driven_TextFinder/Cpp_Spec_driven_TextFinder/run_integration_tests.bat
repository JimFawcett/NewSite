@echo off
rem run_integration_tests.bat - runs the Cpp_TextFinder integration suite and reports its status
rem
rem An argument overrides the executable under test; without one the driver uses the path
rem CMake compiled into it.

setlocal enabledelayedexpansion

set "BUILD=%~dp0build"
set "FAILED=0"

echo Cpp_TextFinder integration tests
echo Build directory: %BUILD%

call :run "Integration" "%BUILD%\Cpp_TextFinder_IntegrationTest_Driver.exe" %1

echo.
if %FAILED%==0 (
  echo ALL INTEGRATION TEST SUITES PASSED
) else (
  echo %FAILED% INTEGRATION TEST SUITE^(S^) FAILED
)
exit /b %FAILED%

:run
echo.
echo === %~1 tests ===
if not exist "%~2" (
  echo   not built: %~2
  echo --- %~1: NOT RUN ---
  set /a FAILED+=1
  exit /b 1
)
"%~2" %3
pause
set "STATUS=!ERRORLEVEL!"
if "!STATUS!"=="0" (
  echo --- %~1: exit status !STATUS! ^(PASS^) ---
) else (
  echo --- %~1: exit status !STATUS! ^(FAIL^) ---
  set /a FAILED+=1
)
exit /b !STATUS!

