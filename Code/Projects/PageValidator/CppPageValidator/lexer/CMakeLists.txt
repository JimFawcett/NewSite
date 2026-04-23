add_library(lexer STATIC)

target_sources(lexer
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/Lexer.ixx
)

target_link_libraries(lexer PUBLIC tokenizer)
target_compile_features(lexer PUBLIC cxx_std_23)

if(MSVC)
    target_compile_options(lexer PRIVATE /W4 /WX)
else()
    target_compile_options(lexer PRIVATE -Wall -Wextra -Werror)
endif()

add_executable(test_lexer src/test.cpp)
target_link_libraries(test_lexer PRIVATE lexer)
target_compile_features(test_lexer PRIVATE cxx_std_23)
add_test(NAME lexer_tests COMMAND test_lexer)
