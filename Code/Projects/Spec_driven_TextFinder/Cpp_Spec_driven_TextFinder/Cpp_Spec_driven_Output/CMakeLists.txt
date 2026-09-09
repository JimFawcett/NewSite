add_library(Cpp_TextFinder_Output)

target_sources(Cpp_TextFinder_Output
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Output.ixx
)

target_link_libraries(Cpp_TextFinder_Output PUBLIC Cpp_TextFinder_Dirnav)
target_compile_features(Cpp_TextFinder_Output PUBLIC cxx_std_23)
