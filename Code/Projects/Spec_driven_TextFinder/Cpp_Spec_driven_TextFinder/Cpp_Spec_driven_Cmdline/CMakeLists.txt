add_library(Cpp_TextFinder_Cmdline)

target_sources(Cpp_TextFinder_Cmdline
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Cmdline.ixx
)

target_compile_features(Cpp_TextFinder_Cmdline PUBLIC cxx_std_23)

add_library(Cpp_TextFinder_Cmdline_UnitTest)

target_sources(Cpp_TextFinder_Cmdline_UnitTest
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Cmdline_UnitTest.ixx
)

target_link_libraries(Cpp_TextFinder_Cmdline_UnitTest PUBLIC Cpp_TextFinder_Cmdline)
target_compile_features(Cpp_TextFinder_Cmdline_UnitTest PUBLIC cxx_std_23)

add_executable(Cpp_TextFinder_Cmdline_TestDriver src/Cpp_TextFinder_Cmdline_TestDriver.cpp)
target_link_libraries(Cpp_TextFinder_Cmdline_TestDriver PRIVATE Cpp_TextFinder_Cmdline_UnitTest)

add_test(NAME Cmdline_UnitTest COMMAND Cpp_TextFinder_Cmdline_TestDriver)
