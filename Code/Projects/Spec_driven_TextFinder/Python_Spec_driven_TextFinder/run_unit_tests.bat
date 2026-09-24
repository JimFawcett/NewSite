@echo off
rem run_unit_tests.bat - compiles the four packages, then runs one unit suite per library

setlocal enabledelayedexpansion
set "HERE=%~dp0"
set "PYTHONPATH=%HERE%Python_Spec_driven_Cmdline\src;%HERE%Python_Spec_driven_Dirnav\src;%HERE%Python_Spec_driven_Output\src;%HERE%Python_Spec_driven_TextFinder_Entry\src"
set /a FAILED=0

echo compiling the four packages
python -m compileall -q "%HERE%Python_Spec_driven_Cmdline\src" "%HERE%Python_Spec_driven_Dirnav\src" "%HERE%Python_Spec_driven_Output\src" "%HERE%Python_Spec_driven_TextFinder_Entry\src"
if errorlevel 1 (
  echo compile failed - counting every suite as failed
  set /a FAILED=3
  goto :summary
)

call :suite cmdline "%HERE%Python_Spec_driven_Cmdline\test\unit_tests.py"
call :suite dirnav "%HERE%Python_Spec_driven_Dirnav\test\unit_tests.py"
call :suite output "%HERE%Python_Spec_driven_Output\test\unit_tests.py"

:summary
echo.
echo !FAILED! suite(s) failed
if "%TEXTFINDER_NO_PAUSE%"=="" pause
exit /b !FAILED!

:suite
echo.
echo === %~1 unit suite ===
if not exist "%~2" (
  echo %~1 - suite not present
  set /a FAILED+=1
  goto :eof
)
python "%~2"
set "STATUS=!ERRORLEVEL!"
echo %~1 - exit status !STATUS!
if not "!STATUS!"=="0" set /a FAILED+=1
goto :eof
