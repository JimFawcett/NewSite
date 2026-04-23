add_executable(text_finder
    src/main.cpp
)

target_link_libraries(text_finder PRIVATE cmd_line dir_nav output)
target_compile_features(text_finder PRIVATE cxx_std_23)

add_executable(test_entry_point
    src/test.cpp
)

target_link_libraries(test_entry_point PRIVATE cmd_line dir_nav output)
target_compile_features(test_entry_point PRIVATE cxx_std_23)
add_test(NAME entry_point_tests COMMAND test_entry_point)