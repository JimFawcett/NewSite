@echo off
rem run_demo.bat - compiles the four packages, then runs the demonstration

setlocal enabledelayedexpansion
set "HERE=%~dp0"
set "PYTHONPATH=%HERE%Python_Spec_driven_Cmdline\src;%HERE%Python_Spec_driven_Dirnav\src;%HERE%Python_Spec_driven_Output\src;%HERE%Python_Spec_driven_TextFinder_Entry\src"
set /a FAILED=0

echo compiling the four packages
python -m compileall -q "%HERE%Python_Spec_driven_Cmdline\src" "%HERE%Python_Spec_driven_Dirnav\src" "%HERE%Python_Spec_driven_Output\src" "%HERE%Python_Spec_driven_TextFinder_Entry\src"
if errorlevel 1 (
  echo compile failed - the demonstration is not run
  set /a FAILED=1
  goto :summary
)

for /f %%d in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd"') do set TEXTFINDER_DEMO_DATE=%%d

echo.
echo === demonstration ===
echo === captured %TEXTFINDER_DEMO_DATE%
if not exist "%HERE%demo\demo.py" (
  echo demonstration - not present
  set /a FAILED=1
  goto :summary
)
python "%HERE%demo\demo.py"
set "STATUS=!ERRORLEVEL!"
echo.
echo demonstration - exit status !STATUS!
if not "!STATUS!"=="0" set /a FAILED=1

:summary
echo.
echo !FAILED! run(s) failed
if "%TEXTFINDER_NO_PAUSE%"=="" pause
exit /b !FAILED!
