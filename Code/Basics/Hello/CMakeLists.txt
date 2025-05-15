#---------------------------------------------------
# HelloWin - Demonstrate building C++ with CMake
#            using only Windows API
#---------------------------------------------------

#---------------------------------------------------
cmake_minimum_required(VERSION 3.31)
project(HelloWin)
#---------------------------------------------------
#   Basics/Hello
#   -- CMakeLists.txt (this file)
#   -- src dir
#      -- HelloWin.cpp
#   -- build directory
#      -- Release directory 
#         -- HelloWin.exe 
#         -- ...
#   In build dir use commands:
#     cmake ..
#     cmake --build . --config Release
#   Then run with:
#     Release/HelloWin.exe
#---------------------------------------------------

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")

#---------------------------------------------------
# build HelloWin.exe in folder build/Release
#---------------------------------------------------
add_executable(HelloWin src/HelloWin.cpp)
target_link_libraries(HelloWin PRIVATE kernel32)
target_compile_options(
  HelloWin PRIVATE
  /GS-   # disable buffer security check
# /RTC-  # disable runtime error checks
  /EHs-  # disable exception handling
  /GR-   # disable RTTI 
  /Oy    # enable frame pointer omission
)
set_target_properties(
  HelloWin PROPERTIES 
    LINK_FLAGS "/ENTRY:mainCRTStartup /SUBSYSTEM:CONSOLE /NODEFAULTLIB"
)

#---------------------------------------------------
# build HelloWin - must use Release mode
#---------------------------------------------------
