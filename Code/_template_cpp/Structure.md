# Structure.md — {{PROJECT_NAME}}

*C++23/CMake-specific layout document.*

---

## Language & Standard

- **Language:** C++
- **Standard:** C++23
- **Modules:** required — every library exposes its API through a named C++ module
  (`export module <name>;`); `#include` of library headers is not used.

---

## Build System

CMake 3.28 or later.  Each component folder has its own `CMakeLists.txt`.
The top-level `CMakeLists.txt` sets project-wide properties and pulls in
components via `add_subdirectory()`.

---

## Directory Layout

```
{{PROJECT_NAME}}/
├── Constitution.md
├── Structure.md
├── Notes.md
├── README.md
├── CMakeLists.txt
├── EntryPoint/
│   ├── CMakeLists.txt
│   ├── Spec.md
│   ├── Notes.md
│   └── src/
│       ├── main.cpp
│       └── test.cpp
└── Part1/
    ├── CMakeLists.txt
    ├── Spec.md
    ├── Notes.md
    └── src/
        ├── Part1.ixx          ← export module part1;
        └── test.cpp
```

<!-- INPUT NEEDED: Rename Part1 and add/remove component folders to match your project. -->

---

## Top-Level CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.28)
project({{PROJECT_NAME}} VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

enable_testing()

add_subdirectory(Part1)
add_subdirectory(EntryPoint)   # must come last; depends on all libraries
```

---

## Per-Library CMakeLists.txt (Part1 shown)

```cmake
add_library(part1 STATIC)

target_sources(part1
    PUBLIC
    FILE_SET CXX_MODULES FILES
        src/Part1.ixx
)

target_compile_features(part1 PUBLIC cxx_std_23)

add_executable(test_part1 src/test.cpp)
target_link_libraries(test_part1 PRIVATE part1)
target_compile_features(test_part1 PRIVATE cxx_std_23)
add_test(NAME part1_tests COMMAND test_part1)
```

---

## EntryPoint CMakeLists.txt

```cmake
add_executable({{project_name}} src/main.cpp)
target_link_libraries({{project_name}} PRIVATE part1)
target_compile_features({{project_name}} PRIVATE cxx_std_23)

add_executable(test_entry_point src/test.cpp)
target_link_libraries(test_entry_point PRIVATE part1)
target_compile_features(test_entry_point PRIVATE cxx_std_23)
add_test(NAME entry_point_tests COMMAND test_entry_point)
```

---

## Build Steps

```bash
# Windows (Visual Studio 2022)
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Release

# Linux / macOS (Ninja)
cmake -S . -B build -G Ninja
cmake --build build

ctest --test-dir build --output-on-failure
```

---

## Component Dependencies

```
Part1   ...
   \     /
  EntryPoint
```

Libraries are fully independent.  EntryPoint is the only translation unit that
imports all library modules.

---

## External Dependencies

| Dependency | Purpose | How obtained |
|------------|---------|--------------|
| C++23 stdlib | Language features | Compiler built-in |

<!-- INPUT NEEDED: Add third-party libraries here with vcpkg/FetchContent instructions. -->

---

## Testing

Each component provides `src/test.cpp`.  Tests are hand-written (no external
framework): each test is a `bool`-returning function; `main()` calls them in
sequence and exits `0` on all-pass or `1` on any failure.

---

*End of Structure.md*
