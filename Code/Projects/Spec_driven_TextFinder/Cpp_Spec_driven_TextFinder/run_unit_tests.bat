@echo off
rem run_unit_tests.bat - runs every Cpp_TextFinder unit test suite and reports each status
rem
rem Spec_TextFinder.md §6.2: the runner builds what it is about to run, announces each
rem suite and the status it returned, exits with the number of suites that failed, and
rem holds the console after its summary.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set "BUILD=%~dp0build"
set "FAILED=0"

echo Cpp_TextFinder unit tests
echo Build directory: %BUILD%

call :build
if not "!BUILD_FAILED!"=="0" (
  echo.
  echo   build failed; all 3 unit test suites count as failed
  set "FAILED=3"
  goto :summary
)

call :run "Cmdline" "%BUILD%\Cpp_Spec_driven_Cmdline\Cpp_TextFinder_Cmdline_TestDriver.exe"
call :run "Dirnav"  "%BUILD%\Cpp_Spec_driven_Dirnav\Cpp_TextFinder_Dirnav_TestDriver.exe"
call :run "Output"  "%BUILD%\Cpp_Spec_driven_Output\Cpp_TextFinder_Output_TestDriver.exe"

:summary
echo.
if !FAILED!==0 (
  echo ALL UNIT TEST SUITES PASSED
) else (
  echo !FAILED! UNIT TEST SUITE^(S^) FAILED
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

rem --- §6.2: hold the console unless a capture suppressed it. ---
:hold
if not "%TEXTFINDER_NO_PAUSE%"=="" exit /b 0
echo.
pause
exit /b 0
