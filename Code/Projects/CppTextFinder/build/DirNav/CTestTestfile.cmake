# CMake generated Testfile for 
# Source directory: C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav
# Build directory: C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/DirNav
# 
# This file includes the relevant testing commands required for 
# testing this directory and lists subdirectories to be tested as well.
if(CTEST_CONFIGURATION_TYPE MATCHES "^([Dd][Ee][Bb][Uu][Gg])$")
  add_test([=[dir_nav_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/DirNav/Debug/test_dir_nav.exe")
  set_tests_properties([=[dir_nav_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav/CMakeLists.txt;21;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ee][Aa][Ss][Ee])$")
  add_test([=[dir_nav_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/DirNav/Release/test_dir_nav.exe")
  set_tests_properties([=[dir_nav_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav/CMakeLists.txt;21;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Mm][Ii][Nn][Ss][Ii][Zz][Ee][Rr][Ee][Ll])$")
  add_test([=[dir_nav_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/DirNav/MinSizeRel/test_dir_nav.exe")
  set_tests_properties([=[dir_nav_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav/CMakeLists.txt;21;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav/CMakeLists.txt;0;")
elseif(CTEST_CONFIGURATION_TYPE MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
  add_test([=[dir_nav_tests]=] "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/build/DirNav/RelWithDebInfo/test_dir_nav.exe")
  set_tests_properties([=[dir_nav_tests]=] PROPERTIES  _BACKTRACE_TRIPLES "C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav/CMakeLists.txt;21;add_test;C:/github/JimFawcett/NewSite/Code/Projects/CppTextFinder/DirNav/CMakeLists.txt;0;")
else()
  add_test([=[dir_nav_tests]=] NOT_AVAILABLE)
endif()
