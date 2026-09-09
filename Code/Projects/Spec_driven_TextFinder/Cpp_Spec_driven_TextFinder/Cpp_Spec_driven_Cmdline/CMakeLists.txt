add_library(Cpp_TextFinder_Cmdline)

target_sources(Cpp_TextFinder_Cmdline
  PUBLIC
    FILE_SET CXX_MODULES FILES
      src/Cpp_TextFinder_Cmdline.ixx
)

target_compile_features(Cpp_TextFinder_Cmdline PUBLIC cxx_std_23)
