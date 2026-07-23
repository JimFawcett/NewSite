add_library(tokenizer STATIC)

target_sources(tokenizer
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/Tokenizer.ixx
)

target_compile_features(tokenizer PUBLIC cxx_std_23)

if(MSVC)
    target_compile_options(tokenizer PRIVATE /W4 /WX)
else()
    target_compile_options(tokenizer PRIVATE -Wall -Wextra -Werror)
endif()

add_executable(test_tokenizer src/test.cpp)
target_link_libraries(test_tokenizer PRIVATE tokenizer)
target_compile_features(test_tokenizer PRIVATE cxx_std_23)
add_test(NAME tokenizer_tests COMMAND test_tokenizer)
