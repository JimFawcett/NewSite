# CMake generated Testfile for 
# Source directory: C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine
# Build directory: C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/CommandLine
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
if(CTEST_CONFIGURATION_TYPE MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
  add_test([=[cmd_line_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/CommandLine/Debug/test_cmd_line.exe")
  set_tests_properties([=[cmd_line_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine/CMakeLists.txt;20;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
  add_test([=[cmd_line_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/CommandLine/Release/test_cmd_line.exe")
  set_tests_properties([=[cmd_line_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine/CMakeLists.txt;20;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
  add_test([=[cmd_line_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/CommandLine/MinSizeRel/test_cmd_line.exe")
  set_tests_properties([=[cmd_line_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine/CMakeLists.txt;20;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
  add_test([=[cmd_line_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/CommandLine/RelWithDebInfo/test_cmd_line.exe")
  set_tests_properties([=[cmd_line_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine/CMakeLists.txt;20;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/CommandLine/CMakeLists.txt;0;")
else()
  add_test([=[cmd_line_tests]=] NOT_AVAILABLE)
endif()
