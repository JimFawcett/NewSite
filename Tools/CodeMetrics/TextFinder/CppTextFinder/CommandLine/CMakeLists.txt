add_library(cmd_line STATIC)

target_sources(cmd_line
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/CmdLine.ixx
)

target_compile_features(cmd_line PUBLIC cxx_std_23)

if(MSVC)
    target_compile_options(cmd_line PRIVATE /W4 /WX)
else()
    target_compile_options(cmd_line PRIVATE -Wall -Wextra -Werror)
endif()

add_executable(test_cmd_line src/test.cpp)
target_link_libraries(test_cmd_line PRIVATE cmd_line)
target_compile_features(test_cmd_line PRIVATE cxx_std_23)
add_test(NAME cmd_line_tests COMMAND test_cmd_line)