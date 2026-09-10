cmake_minimum_required(VERSION 3.28)

# Opt in to CMake's `import std` support, which is still experimental.
set(CMAKE_EXPERIMENTAL_CXX_IMPORT_STD "a9e1cf81-9932-4810-974b-6eccaf14e457")

project(Cpp_TextFinder LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_MODULE_STD ON)

enable_testing()

add_subdirectory(Cpp_Spec_driven_Cmdline)
add_subdirectory(Cpp_Spec_driven_Dirnav)
add_subdirectory(Cpp_Spec_driven_Output)
add_subdirectory(Cpp_Spec_driven_TextFinder_Entry)

# Integration tests drive the assembled executable, so they cover Cpp_TextFinder_Entry too.
add_library(Cpp_TextFinder_IntegrationTest)

target_sources(Cpp_TextFinder_IntegrationTest
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_IntegrationTest.ixx
)

target_compile_features(Cpp_TextFinder_IntegrationTest PUBLIC cxx_std_23)

add_executable(Cpp_TextFinder_IntegrationTest_Driver src/Cpp_TextFinder_IntegrationTest_Driver.cpp)
target_link_libraries(Cpp_TextFinder_IntegrationTest_Driver PRIVATE Cpp_TextFinder_IntegrationTest)
target_compile_definitions(Cpp_TextFinder_IntegrationTest_Driver
  PRIVATE TEXTFINDER_EXE="$<TARGET_FILE:Cpp_TextFinder>")
add_dependencies(Cpp_TextFinder_IntegrationTest_Driver Cpp_TextFinder)

add_test(NAME IntegrationTest COMMAND Cpp_TextFinder_IntegrationTest_Driver)

# The demonstration searches this project's own tree, rooted one level up at Spec_driven_TextFinder.
get_filename_component(DEMO_ROOT_PATH "${CMAKE_CURRENT_SOURCE_DIR}/.." ABSOLUTE)

add_library(Cpp_TextFinder_Demo)

target_sources(Cpp_TextFinder_Demo
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Demo.ixx
)

target_compile_features(Cpp_TextFinder_Demo PUBLIC cxx_std_23)

add_executable(Cpp_TextFinder_Demo_Driver src/Cpp_TextFinder_Demo_Driver.cpp)
target_link_libraries(Cpp_TextFinder_Demo_Driver PRIVATE Cpp_TextFinder_Demo)
target_compile_definitions(Cpp_TextFinder_Demo_Driver
  PRIVATE
    TEXTFINDER_EXE="$<TARGET_FILE:Cpp_TextFinder>"
    DEMO_ROOT="${DEMO_ROOT_PATH}")
add_dependencies(Cpp_TextFinder_Demo_Driver Cpp_TextFinder)
