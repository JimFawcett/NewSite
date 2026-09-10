add_library(Cpp_TextFinder_Output)

target_sources(Cpp_TextFinder_Output
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Output.ixx
)

target_link_libraries(Cpp_TextFinder_Output PUBLIC Cpp_TextFinder_Dirnav)
target_compile_features(Cpp_TextFinder_Output PUBLIC cxx_std_23)

add_library(Cpp_TextFinder_Output_UnitTest)

target_sources(Cpp_TextFinder_Output_UnitTest
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Output_UnitTest.ixx
)

target_link_libraries(Cpp_TextFinder_Output_UnitTest PUBLIC Cpp_TextFinder_Output)
target_compile_features(Cpp_TextFinder_Output_UnitTest PUBLIC cxx_std_23)

add_executable(Cpp_TextFinder_Output_TestDriver src/Cpp_TextFinder_Output_TestDriver.cpp)
target_link_libraries(Cpp_TextFinder_Output_TestDriver PRIVATE Cpp_TextFinder_Output_UnitTest)

add_test(NAME Output_UnitTest COMMAND Cpp_TextFinder_Output_TestDriver)
