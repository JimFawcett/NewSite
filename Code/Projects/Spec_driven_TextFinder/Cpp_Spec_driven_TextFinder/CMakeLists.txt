cmake_minimum_required(VERSION 3.28)

# Opt in to CMake's `import std` support, which is still experimental.
set(CMAKE_EXPERIMENTAL_CXX_IMPORT_STD "a9e1cf81-9932-4810-974b-6eccaf14e457")

project(Cpp_TextFinder LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_CXX_MODULE_STD ON)

add_subdirectory(Cpp_Spec_driven_Cmdline)
add_subdirectory(Cpp_Spec_driven_Dirnav)
add_subdirectory(Cpp_Spec_driven_Output)
add_subdirectory(Cpp_Spec_driven_TextFinder_Entry)
