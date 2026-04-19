# CMake generated Testfile for 
# Source directory: C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint
# Build directory: C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/EntryPoint
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
if(CTEST_CONFIGURATION_TYPE MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
  add_test([=[entry_point_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/EntryPoint/Debug/test_entry_point.exe")
  set_tests_properties([=[entry_point_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint/CMakeLists.txt;14;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
  add_test([=[entry_point_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/EntryPoint/Release/test_entry_point.exe")
  set_tests_properties([=[entry_point_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint/CMakeLists.txt;14;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
  add_test([=[entry_point_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/EntryPoint/MinSizeRel/test_entry_point.exe")
  set_tests_properties([=[entry_point_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint/CMakeLists.txt;14;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
  add_test([=[entry_point_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/EntryPoint/RelWithDebInfo/test_entry_point.exe")
  set_tests_properties([=[entry_point_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint/CMakeLists.txt;14;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/EntryPoint/CMakeLists.txt;0;")
else()
  add_test([=[entry_point_tests]=] NOT_AVAILABLE)
endif()
