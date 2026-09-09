add_library(Cpp_TextFinder_Dirnav)

target_sources(Cpp_TextFinder_Dirnav
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Dirnav.ixx
)

target_link_libraries(Cpp_TextFinder_Dirnav PUBLIC Cpp_TextFinder_Cmdline)
target_compile_features(Cpp_TextFinder_Dirnav PUBLIC cxx_std_23)
