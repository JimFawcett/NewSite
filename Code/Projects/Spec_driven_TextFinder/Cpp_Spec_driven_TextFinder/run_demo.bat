@echo off
rem run_demo.bat - runs the Cpp_TextFinder demonstration and reports its status
rem
rem Two optional arguments override the executable and the demo root, both of which
rem CMake compiled into the driver.
rem
rem Spec_TextFinder.md §6.2: the runner builds what it is about to run, announces the
rem status the demonstration returned, and holds the console after its summary.

setlocal enabledelayedexpansion
cd /d "%~dp0"

set "BUILD=%~dp0build"
set "DEMO=%BUILD%\Cpp_TextFinder_Demo_Driver.exe"

echo Build directory: %BUILD%

call :build
if not "!BUILD_FAILED!"=="0" (
  echo.
  echo   build failed; the demonstration counts as failed
  echo --- Demo: NOT RUN ---
  call :hold
  exit /b 1
)

if not exist "%DEMO%" (
  echo.
  echo   not built: %DEMO%
  echo --- Demo: NOT RUN ---
  call :hold
  exit /b 1
)

echo.
"%DEMO%" %1 %2
set "STATUS=!ERRORLEVEL!"

echo.
if "!STATUS!"=="0" (
  echo --- Demo: exit status !STATUS! ^(OK^) ---
) else (
  echo --- Demo: exit status !STATUS! ^(FAILED^) ---
)
call :hold
exit /b !STATUS!

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

rem --- §6.2: hold the console unless a capture suppressed it. ---
:hold
if not "%TEXTFINDER_NO_PAUSE%"=="" exit /b 0
echo.
pause
exit /b 0
