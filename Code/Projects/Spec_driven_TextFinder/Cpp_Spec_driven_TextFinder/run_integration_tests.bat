@echo off
rem run_integration_tests.bat - runs the Cpp_TextFinder integration suite and reports its status
rem
rem An argument overrides the executable under test; without one the driver uses the path
rem CMake compiled into it.
rem
rem Spec_TextFinder.md §6.2: the runner builds what it is about to run, announces the
rem suite and the status it returned, exits with the number of suites that failed, and
rem holds the console after its summary.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set "BUILD=%~dp0build"
set "FAILED=0"

echo Cpp_TextFinder integration tests
echo Build directory: %BUILD%

call :build
if not "!BUILD_FAILED!"=="0" (
  echo.
  echo   build failed; the integration test suite counts as failed
  set "FAILED=1"
  goto :summary
)

call :run "Integration" "%BUILD%\Cpp_TextFinder_IntegrationTest_Driver.exe" %1

:summary
echo.
if !FAILED!==0 (
  echo ALL INTEGRATION TEST SUITES PASSED
) else (
  echo !FAILED! INTEGRATION TEST SUITE^(S^) FAILED
)
call :hold
exit /b !FAILED!

rem --- §6.2: configure when there is no cache, then build. ---
:build
set "BUILD_FAILED=0"
call :compiler
if not exist "%BUILD%\CMakeCache.txt" (
  echo.
  echo === configuring ===
  cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
  if errorlevel 1 (
    set "BUILD_FAILED=1"
    exit /b 0
  )
)
echo.
echo === building ===
cmake --build build
if errorlevel 1 set "BUILD_FAILED=1"
exit /b 0

rem --- The Output module's global fragment includes <io.h>, so the build needs the MSVC
rem     environment. A Developer Command Prompt already carries it; otherwise vswhere
rem     locates one and vcvars64.bat establishes it for this script alone. ---
:compiler
where cl >nul 2>&1 && exit /b 0
set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
if not exist "!VSWHERE!" (
  echo   no cl and no vswhere; run from a Developer Command Prompt
  exit /b 0
)
set "VSPATH="
for /f "usebackq tokens=*" %%i in (`"!VSWHERE!" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do set "VSPATH=%%i"
if not defined VSPATH (
  echo   vswhere found no C++ toolset; run from a Developer Command Prompt
  exit /b 0
)
if not exist "!VSPATH!\VC\Auxiliary\Build\vcvars64.bat" (
  echo   no vcvars64.bat under !VSPATH!; run from a Developer Command Prompt
  exit /b 0
)
echo   MSVC environment from !VSPATH!
call "!VSPATH!\VC\Auxiliary\Build\vcvars64.bat" >nul
exit /b 0

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
set "STATUS=!ERRORLEVEL!"
if "!STATUS!"=="0" (
  echo --- %~1: exit status !STATUS! ^(PASS^) ---
) else (
  echo --- %~1: exit status !STATUS! ^(FAIL^) ---
  set /a FAILED+=1
)
exit /b !STATUS!

rem --- §6.2: hold the console unless a capture suppressed it. ---
:hold
if not "%TEXTFINDER_NO_PAUSE%"=="" exit /b 0
echo.
pause
exit /b 0
