add_executable({{project_name}} src/main.cpp)
target_link_libraries({{project_name}} PRIVATE part1)
target_compile_features({{project_name}} PRIVATE cxx_std_23)

add_executable(test_entry_point src/test.cpp)
target_link_libraries(test_entry_point PRIVATE part1)
target_compile_features(test_entry_point PRIVATE cxx_std_23)
add_test(NAME entry_point_tests COMMAND test_entry_point)
