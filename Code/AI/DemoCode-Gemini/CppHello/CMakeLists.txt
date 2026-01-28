cmake_minimum_required(VERSION 3.10)

project(CppHello)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(CppHello main.cpp)

if(CMAKE_VERSION VERSION_GREATER_EQUAL "3.28")
    set_property(TARGET CppHello PROPERTY CXX_SCAN_FOR_MODULES ON)
endif()
