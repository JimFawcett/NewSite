add_executable(page_validator src/main.cpp)

target_link_libraries(page_validator PRIVATE validator)
target_compile_features(page_validator PRIVATE cxx_std_23)

if(MSVC)
    target_compile_options(page_validator PRIVATE /W4 /WX)
else()
    target_compile_options(page_validator PRIVATE -Wall -Wextra -Werror)
endif()
