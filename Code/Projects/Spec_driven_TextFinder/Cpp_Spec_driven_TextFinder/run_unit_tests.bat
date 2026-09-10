@echo off
rem run_unit_tests.bat - runs every Cpp_TextFinder unit test suite and reports each status

setlocal enabledelayedexpansion

set "BUILD=%~dp0build"
set "FAILED=0"

echo Cpp_TextFinder unit tests
echo Build directory: %BUILD%

call :run "Cmdline" "%BUILD%\Cpp_Spec_driven_Cmdline\Cpp_TextFinder_Cmdline_TestDriver.exe"
call :run "Dirnav"  "%BUILD%\Cpp_Spec_driven_Dirnav\Cpp_TextFinder_Dirnav_TestDriver.exe"
call :run "Output"  "%BUILD%\Cpp_Spec_driven_Output\Cpp_TextFinder_Output_TestDriver.exe"
pause
echo.
if %FAILED%==0 (
  echo ALL UNIT TEST SUITES PASSED
) else (
  echo %FAILED% UNIT TEST SUITE^(S^) FAILED
)
exit /b %FAILED%

:run
echo.
echo === %~1 unit tests ===
if not exist "%~2" (
  echo   not built: %~2
  echo --- %~1: NOT RUN ---
  set /a FAILED+=1
  exit /b 1
)
"%~2"
set "STATUS=!ERRORLEVEL!"
if "!STATUS!"=="0" (
  echo --- %~1: exit status !STATUS! ^(PASS^) ---
) else (
  echo --- %~1: exit status !STATUS! ^(FAIL^) ---
  set /a FAILED+=1
)
exit /b !STATUS!
