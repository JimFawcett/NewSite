# Structure.md — CppTextFinder

*Language- and toolchain-specific layout document for the C++ implementation.*

---

## Language & Standard

- **Language:** C++
- **Standard:** C++23
- **Modules:** required — every library exposes its API through a named C++
  module; `#include` of library headers is not used.

---

## Build System

CMake is used to build all targets.  **Each part folder must contain its own
`CMakeLists.txt`.**  The top-level `CMakeLists.txt` is the only file that names
the parts; it pulls them in with `add_subdirectory()` and sets project-wide
properties.  No part's `CMakeLists.txt` may reference another part's source
directory directly.

<!-- INPUT NEEDED: Confirm CMake.  If you prefer a different generator
     (Ninja is recommended for module builds; Visual Studio 17 2022 also works),
     note it here. -->

### Minimum CMake version

C++23 named modules require CMake 3.28 or later (`FILE_SET CXX_MODULES`
support).

```cmake
cmake_minimum_required(VERSION 3.28)
```

---

## Directory Layout

```
CppTextFinder/
├── Constitution.md
├── Structure.md
├── CMakeLists.txt              ← top-level; sets standard, enables testing, adds subdirectories
├── EntryPoint/
│   ├── CMakeLists.txt          ← defines executable; imports modules
│   ├── Spec.md
│   ├── Notes.md
│   └── src/
│       ├── main.cpp            ← imports cmd_line, dir_nav, output modules
│       └── test.cpp            ← unit tests for EntryPoint wiring
├── CommandLine/
│   ├── CMakeLists.txt          ← defines STATIC library + test executable
│   ├── Spec.md
│   ├── Notes.md
│   └── src/
│       ├── CmdLine.ixx         ← export module cmd_line;
│       └── test.cpp            ← unit tests for CmdLine
├── DirNav/
│   ├── CMakeLists.txt          ← defines STATIC library + test executable
│   ├── Spec.md
│   ├── Notes.md
│   └── src/
│       ├── DirNav.ixx          ← export module dir_nav;
│       └── test.cpp            ← unit tests for DirNav
└── Output/
    ├── CMakeLists.txt          ← defines STATIC library + test executable
    ├── Spec.md
    ├── Notes.md
    └── src/
        ├── Output.ixx          ← export module output;
        └── test.cpp            ← unit tests for Output
```

Each library is a single module interface unit (`.ixx`).  If the implementation
grows large enough to warrant splitting, a module implementation unit (`.cpp`
with `module cmd_line;`) may be added alongside the `.ixx` file and listed in
the same `FILE_SET`.

Module interface files use the `.ixx` extension throughout this project.

---

## Top-Level CMakeLists.txt (sketch)

The top-level file owns all project-wide settings and is the only file that
lists the parts.

```cmake
cmake_minimum_required(VERSION 3.28)
project(CppTextFinder VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Required for named-module dependency scanning
set(CMAKE_EXPERIMENTAL_CXX_IMPORT_STD "0e5b6991-d74f-4b3d-a41c-cf096e0b2508")

enable_testing()               # must appear before add_subdirectory calls

add_subdirectory(CommandLine)
add_subdirectory(DirNav)
add_subdirectory(Output)
add_subdirectory(EntryPoint)   # must come last; depends on the three libraries
```

<!-- INPUT NEEDED: The `CMAKE_EXPERIMENTAL_CXX_IMPORT_STD` UUID is correct for
     CMake 3.30.  It may differ on 3.28/3.29; check your CMake release notes if
     you do not use `import std;` and remove it if standard-library modules are
     not needed. -->

---

## Per-Library CMakeLists.txt (sketch — CommandLine shown)

Each library's `CMakeLists.txt` declares the module interface file in a
`FILE_SET CXX_MODULES` block.  No `target_include_directories` call is needed
because consumers import the module, not a header.

```cmake
add_library(cmd_line STATIC)

target_sources(cmd_line
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/CmdLine.ixx
)

target_compile_features(cmd_line PUBLIC cxx_std_23)

# Unit test executable
add_executable(test_cmd_line src/test.cpp)
target_link_libraries(test_cmd_line PRIVATE cmd_line)
target_compile_features(test_cmd_line PRIVATE cxx_std_23)
add_test(NAME cmd_line_tests COMMAND test_cmd_line)
```

The same pattern applies to `dir_nav` (DirNav/CMakeLists.txt) and `output`
(Output/CMakeLists.txt), substituting the appropriate target name, `.ixx` file,
and test executable name (`test_dir_nav`, `test_output`).

---

## EntryPoint CMakeLists.txt (sketch)

```cmake
add_executable(text_finder
    src/main.cpp
)

target_link_libraries(text_finder PRIVATE cmd_line dir_nav output)
target_compile_features(text_finder PRIVATE cxx_std_23)
```

`main.cpp` uses `import cmd_line;`, `import dir_nav;`, and `import output;`.
CMake's module dependency scanner resolves build order automatically.

## Component Dependencies

```
CommandLine   DirNav   Output
     \           |       /
      \          |      /
       \         |     /
           EntryPoint
```

Libraries are fully independent.  EntryPoint is the only translation unit that
imports all three modules.  Cross-library communication flows through
`std::function` callbacks registered by EntryPoint at startup — no library
module imports another library module.

<!-- INPUT NEEDED: Choose the final binary name (currently "text_finder"). -->

---

## Build Steps

```bash
# from CppTextFinder/
cmake -S . -B build
cmake --build build
ctest --test-dir build --output-on-failure
```

<!-- INPUT NEEDED: Add any platform-specific generator flags, e.g.
     -G "Visual Studio 17 2022" -A x64 on Windows. -->

---

## External Dependencies

| Dependency | Purpose | How obtained |
|------------|---------|--------------|
| `std::filesystem` | Directory traversal | C++23 standard library (imported via module or `import std;`) |
| `std::regex` | Content matching | C++23 standard library |

<!-- INPUT NEEDED: If you prefer a third-party regex library (e.g. PCRE2, RE2,
     Boost.Regex) for richer syntax or better performance, add it here and note
     how it is fetched (vcpkg, FetchContent, system package, etc.). -->

---

## Testing

Each part provides a `src/test.cpp` file containing hand-written unit tests.
Tests are compiled into a standalone executable by the part's own
`CMakeLists.txt` and registered with CTest via `add_test()`.  No external test
framework is required.

### Conventions for `test.cpp`

- `test.cpp` imports the part's own module (e.g. `import cmd_line;`).
- Each test is a function returning `bool`; `main()` calls them in sequence,
  prints a pass/fail line for each, and exits with `0` on all-pass or `1` on
  any failure.
- No shared test-harness header; each `test.cpp` is self-contained.

### Running tests

```bash
# build everything first, then:
ctest --test-dir build --output-on-failure
```

To run one part's tests in isolation:

```bash
ctest --test-dir build -R cmd_line_tests --output-on-failure
```

---

## Compiler Warnings

```cmake
if(MSVC)
    target_compile_options(cmd_line PRIVATE /W4 /WX)
else()
    target_compile_options(cmd_line PRIVATE -Wall -Wextra -Werror)
endif()
```

<!-- INPUT NEEDED: Adjust warning flags to match your preferred strictness level.
     Apply the same pattern to dir_nav, output, and text_finder targets. -->

---

*End of Structure.md*
