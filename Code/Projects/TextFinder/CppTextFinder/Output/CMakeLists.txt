add_library(output STATIC)

target_sources(output
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/Output.ixx
)

target_compile_features(output PUBLIC cxx_std_23)

if(MSVC)
    target_compile_options(output PRIVATE /W4 /WX)
else()
    target_compile_options(output PRIVATE -Wall -Wextra -Werror)
endif()

# Unit test executable
add_executable(test_output src/test.cpp)
target_link_libraries(test_output PRIVATE output)
target_compile_features(test_output PRIVATE cxx_std_23)
add_test(NAME output_tests COMMAND test_output)