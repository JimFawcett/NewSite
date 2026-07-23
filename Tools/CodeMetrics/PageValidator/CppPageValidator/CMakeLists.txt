cmake_minimum_required(VERSION 3.28)
project(CppPageValidator VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

enable_testing()

add_subdirectory(tokenizer)
add_subdirectory(lexer)
add_subdirectory(validator)
add_subdirectory(entry_point)
