add_library(Cpp_TextFinder_Dirnav)

target_sources(Cpp_TextFinder_Dirnav
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Dirnav.ixx
)

target_link_libraries(Cpp_TextFinder_Dirnav PUBLIC Cpp_TextFinder_Cmdline)
target_compile_features(Cpp_TextFinder_Dirnav PUBLIC cxx_std_23)

add_library(Cpp_TextFinder_Dirnav_UnitTest)

target_sources(Cpp_TextFinder_Dirnav_UnitTest
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Dirnav_UnitTest.ixx
)

target_link_libraries(Cpp_TextFinder_Dirnav_UnitTest PUBLIC Cpp_TextFinder_Dirnav)
target_compile_features(Cpp_TextFinder_Dirnav_UnitTest PUBLIC cxx_std_23)

add_executable(Cpp_TextFinder_Dirnav_TestDriver src/Cpp_TextFinder_Dirnav_TestDriver.cpp)
target_link_libraries(Cpp_TextFinder_Dirnav_TestDriver PRIVATE Cpp_TextFinder_Dirnav_UnitTest)

add_test(NAME Dirnav_UnitTest COMMAND Cpp_TextFinder_Dirnav_TestDriver)
