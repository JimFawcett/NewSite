add_library(dir_nav STATIC)

target_sources(dir_nav
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/DirNav.ixx
)

target_compile_features(dir_nav PUBLIC cxx_std_23)

if(MSVC)
    target_compile_options(dir_nav PRIVATE /W4 /WX)
else()
    target_compile_options(dir_nav PRIVATE -Wall -Wextra -Werror)
endif()

# Unit test executable
add_executable(test_dir_nav src/test.cpp)
target_link_libraries(test_dir_nav PRIVATE dir_nav)
target_compile_features(test_dir_nav PRIVATE cxx_std_23)
add_test(NAME dir_nav_tests COMMAND test_dir_nav)