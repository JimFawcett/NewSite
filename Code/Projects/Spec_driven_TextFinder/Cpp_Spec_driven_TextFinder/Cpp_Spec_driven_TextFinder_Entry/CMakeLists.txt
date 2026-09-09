add_executable(Cpp_TextFinder src/main.cpp)

target_link_libraries(Cpp_TextFinder
  PRIVATE
    Cpp_TextFinder_Cmdline
    Cpp_TextFinder_Dirnav
    Cpp_TextFinder_Output
)

target_compile_features(Cpp_TextFinder PRIVATE cxx_std_23)
