add_library(part1 STATIC)

target_sources(part1
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/Part1.ixx
)

target_compile_features(part1 PUBLIC cxx_std_23)

add_executable(test_part1 src/test.cpp)
target_link_libraries(test_part1 PRIVATE part1)
target_compile_features(test_part1 PRIVATE cxx_std_23)
add_test(NAME part1_tests COMMAND test_part1)
