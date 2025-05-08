#---------------------------------------------------
# HelloCMake - Demonstrate building C++ with CMake
#   - Non-hierarchal version
#---------------------------------------------------

#---------------------------------------------------
cmake_minimum_required(VERSION 3.31)
project(HelloCMake)
#---------------------------------------------------
#   Hello dir
#   -- CMakeLists.txt (this file)
#   -- src dir
#      -- Hello.cpp
#   -- build directory
#      -- Debug directory 
#         -- Hello.exe 
#         -- ...
#      -- Hello.dir directory
#         -- Debug directory 
#            -- Hello.obj 

#---------------------------------------------------

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")

#---------------------------------------------------
# build HelloCMake.obj in folder build/Cpp_Hello.dir/debug
#---------------------------------------------------
add_executable(Hello src/Hello.cpp)

#---------------------------------------------------
# build HelloCMakeLib.lib in folder build/debug
#---------------------------------------------------
#add_library(HelloCMakeLib STATIC libs/hello_lib/hello_lib.cpp)

#---------------------------------------------------
# link HelloCMake.obj and HelloCMakeLib.lib to 
# create HelloCMake.exe in folder  build/debug
#---------------------------------------------------
#target_link_libraries(HelloCMake HelloCMakeLib)

#---------------------------------------------------
# Build process with CMake version 3.18.2
#---------------------------------------------------
#   1. add source files to project directories 
#   2. add CMakeLists.txt (this file)
#   3. mkdir build                 - this puts intermediate
#   4. cd build                      files in build directory
#   5. cmake ..                    - create cmake config files
#   6. cmake --build . [--config Debug | --config Release]
#   7. "./Debug/Hello.exe"    - runs executable 
#   8. Notes:
#      - you can change any of the source files then: 
#          cmake --build . --config Debug
#          "./Debug/HelloCmake.exe
#      - delete contents of build directory to clean
#          cmake will regenerate
#   9. Note: 
#      - you can substitute Release for Debug 
#        in contents of 8.
#---------------------------------------------------
