cmake_minimum_required(VERSION 3.30)

project(TextFinder CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_executable(${PROJECT_NAME} main.cpp)

target_sources(${PROJECT_NAME}
    PUBLIC FILE_SET CXX_MODULES FILES
        CmdLine.ixx
        DirNav.ixx
        TextFinder.ixx
)

target_compile_definitions(${PROJECT_NAME} PRIVATE NOMINMAX)

target_link_options(${PROJECT_NAME} PRIVATE
    $<$<OR:$<CONFIG:Debug>,$<CONFIG:Release>>:/SUBSYSTEM:CONSOLE>
)
