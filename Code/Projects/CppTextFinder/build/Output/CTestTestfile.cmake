# CMake generated Testfile for 
# Source directory: C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output
# Build directory: C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/Output
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
if(CTEST_CONFIGURATION_TYPE MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
  add_test([=[output_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/Output/Debug/test_output.exe")
  set_tests_properties([=[output_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output/CMakeLists.txt;21;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
  add_test([=[output_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/Output/Release/test_output.exe")
  set_tests_properties([=[output_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output/CMakeLists.txt;21;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
  add_test([=[output_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/Output/MinSizeRel/test_output.exe")
  set_tests_properties([=[output_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output/CMakeLists.txt;21;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
  add_test([=[output_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/Output/RelWithDebInfo/test_output.exe")
  set_tests_properties([=[output_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output/CMakeLists.txt;21;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/Output/CMakeLists.txt;0;")
else()
  add_test([=[output_tests]=] NOT_AVAILABLE)
endif()
