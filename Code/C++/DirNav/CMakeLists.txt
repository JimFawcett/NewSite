cmake_minimum_required(VERSION 3.10)

# Define the project name
project(WinDirTraversalDemo CXX)

# Set the C++ standard to C++17 (or newer)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Define the source files for the executable
set(SOURCE_FILES
    main.cpp
)

# 1. ADD THE EXECUTABLE TARGET
add_executable(${PROJECT_NAME} ${SOURCE_FILES})

# 2. Add NOMINMAX (still needed for the standard library compatibility with windows.h)
target_compile_definitions(${PROJECT_NAME} PRIVATE NOMINMAX) 

# Ensure the executable is linked as a CONSOLE application (Good practice)
target_link_options(${PROJECT_NAME} PRIVATE 
    $<$<OR:$<CONFIG:Debug>,$<CONFIG:Release>>:/SUBSYSTEM:CONSOLE>
)

# Link necessary Windows libraries 
target_link_libraries(${PROJECT_NAME}
    PRIVATE
        kernel32.lib
)

# Removed: UNICODE and _UNICODE definitions