@echo off
rem Python_TextFinder.bat - launches the TextFinder module with the four src folders on PYTHONPATH

setlocal
set "HERE=%~dp0"
set "PYTHONPATH=%HERE%Python_Spec_driven_Cmdline\src;%HERE%Python_Spec_driven_Dirnav\src;%HERE%Python_Spec_driven_Output\src;%HERE%Python_Spec_driven_TextFinder_Entry\src"
python -m python_textfinder_entry %*
exit /b %ERRORLEVEL%
