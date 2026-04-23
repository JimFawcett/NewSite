add_library(validator STATIC)

target_sources(validator
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/Validator.ixx
)

target_link_libraries(validator PUBLIC lexer)
target_compile_features(validator PUBLIC cxx_std_23)

if(MSVC)
    target_compile_options(validator PRIVATE /W4 /WX)
else()
    target_compile_options(validator PRIVATE -Wall -Wextra -Werror)
endif()

add_executable(test_validator src/test.cpp)
target_link_libraries(test_validator PRIVATE validator)
target_compile_features(test_validator PRIVATE cxx_std_23)
add_test(NAME validator_tests COMMAND test_validator)
