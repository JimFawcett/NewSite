# TextFinder — Directory Structure

Top-level layout of the TextFinder project across four language implementations
(C++, C#, Python, Rust) plus an optimization variant of the Rust version.
Build artifacts (`bin/`, `obj/`, `target/`, `__pycache__/`) and archived copies
(`archive/`) are omitted for clarity.

## Language & Toolchain Versions

| Implementation | Language / Standard | Build System |
|----------------|---------------------|--------------|
| CppTextFinder  | C++23 (named modules) | CMake 3.28+ |
| CsTextFinder   | C# / .NET 10        | `dotnet` / `CsTextFinder.sln` |
| PyTextFinder   | Python 3.x          | none (interpreted) |
| rs_textfinder / rs_textfinder_opt | Rust, edition 2018 | Cargo |

## Cross-Language Part Mapping

All four implementations share the same four-part decomposition. Folder
names differ per language convention:

| Role                       | C++          | C#           | Python       | Rust                    |
|----------------------------|--------------|--------------|--------------|-------------------------|
| Argument parsing           | CommandLine/ | CommandLine/ | CommandLine/ | RustCmdLine/            |
| Directory traversal        | DirNav/      | DirNav/      | DirNav/      | RustDirNav/             |
| Result formatting          | Output/      | Output/      | Output/      | *(merged into EntryPoint)* |
| Executable / wiring        | EntryPoint/  | EntryPoint/  | EntryPoint/  | EntryPoint/             |
| Independent verifier       | *(planned)*  | *(planned)*  | *(planned)*  | RustTfVerify/           |

The Rust version merges output formatting into the top-level EntryPoint crate
rather than exposing it as a separate library. Verifiers for C++, C#, and
Python are planned as counterparts to `RustTfVerify`.

## Comparison Baseline

- **`rs_textfinder_opt`** is the canonical Rust implementation used when
  comparing designs and performance against C++, C#, and Python.
- **`rs_textfinder`** is the pre-optimization Rust baseline, retained so the
  Rust-internal optimization discussion can reference concrete before/after code.
- **`TextFinder_CodeMetrics.pdf`** captures size/complexity metrics used in the
  cross-language comparison writeups.

```
TextFinder/
├── Notes.md
├── README.md
├── structure.md
├── TextFinder_CodeMetrics.pdf
│
├── CppTextFinder/                    ← C++23 named-modules implementation
│   ├── CMakeLists.txt
│   ├── Constitution.md
│   ├── Notes.md
│   ├── README.md
│   ├── Structure.md
│   ├── generate_part.py
│   ├── CommandLine/
│   │   ├── CMakeLists.txt
│   │   ├── Notes.md
│   │   ├── Spec.md
│   │   └── src/
│   │       ├── CmdLine.ixx
│   │       └── test.cpp
│   ├── DirNav/
│   │   ├── CMakeLists.txt
│   │   ├── Notes.md
│   │   ├── Spec.md
│   │   └── src/
│   │       ├── DirNav.ixx
│   │       └── test.cpp
│   ├── EntryPoint/
│   │   ├── CMakeLists.txt
│   │   ├── Notes.md
│   │   ├── Spec.md
│   │   └── src/
│   │       ├── main.cpp
│   │       └── test.cpp
│   └── Output/
│       ├── CMakeLists.txt
│       ├── Notes.md
│       ├── Spec.md
│       └── src/
│           ├── Output.ixx
│           └── test.cpp
│
├── CsTextFinder/                     ← .NET 10 / C# implementation
│   ├── Constitution.md
│   ├── CsTextFinder.sln
│   ├── Notes.md
│   ├── README.md
│   ├── Structure.md
│   ├── generate_part.py
│   ├── CommandLine/
│   │   ├── CmdLine.cs
│   │   ├── CommandLine.csproj
│   │   ├── Notes.md
│   │   ├── Spec.md
│   │   └── Test.cs
│   ├── DirNav/
│   │   ├── DirNav.cs
│   │   ├── DirNav.csproj
│   │   ├── Notes.md
│   │   ├── Spec.md
│   │   └── Test.cs
│   ├── EntryPoint/
│   │   ├── EntryPoint.csproj
│   │   ├── Notes.md
│   │   ├── Program.cs
│   │   ├── Spec.md
│   │   └── Test.cs
│   └── Output/
│       ├── Notes.md
│       ├── Output.cs
│       ├── Output.csproj
│       ├── Spec.md
│       └── Test.cs
│
├── PyTextFinder/                     ← Python implementation
│   ├── Constitution.md
│   ├── Notes.md
│   ├── README.md
│   ├── Structure.md
│   ├── generate_part.py
│   ├── CommandLine/
│   │   ├── __init__.py
│   │   ├── cmd_line.py
│   │   ├── Notes.md
│   │   ├── Spec.md
│   │   └── test_cmd_line.py
│   ├── DirNav/
│   │   ├── __init__.py
│   │   ├── dir_nav.py
│   │   ├── Notes.md
│   │   ├── Spec.md
│   │   └── test_dir_nav.py
│   ├── EntryPoint/
│   │   ├── __init__.py
│   │   ├── Notes.md
│   │   ├── PyTextFinder.py
│   │   ├── Spec.md
│   │   └── test_main.py
│   └── Output/
│       ├── __init__.py
│       ├── Notes.md
│       ├── output.py
│       ├── Spec.md
│       └── test_output.py
│
├── rs_textfinder/                    ← Rust implementation (baseline)
│   ├── Constitution.md
│   ├── Notes.md
│   ├── Structure.md
│   ├── docs/
│   │   └── Project_Spec.md
│   ├── RustCmdLine/
│   │   ├── Cargo.lock
│   │   ├── Cargo.toml
│   │   ├── README.md
│   │   ├── RustCmdLine_Spec.md
│   │   ├── examples/
│   │   │   ├── Output.txt
│   │   │   ├── Output1.txt.html
│   │   │   ├── test1.rs
│   │   │   └── test11.rs.html
│   │   ├── Pictures/
│   │   │   ├── dummy.txt
│   │   │   └── RustCmdLineParserOutput.JPG
│   │   └── src/
│   │       ├── cmd_line_lib.rs
│   │       └── lib1.rs.html
│   ├── RustDirNav/
│   │   ├── Cargo.lock
│   │   ├── Cargo.toml
│   │   ├── New Text Document.txt
│   │   ├── Output.txt
│   │   ├── README.md
│   │   ├── RustDirNav.md
│   │   ├── RustDirNav.zip
│   │   ├── RustDirNav_Spec.md
│   │   ├── examples/
│   │   │   ├── test1.rs
│   │   │   └── test11.rs.html
│   │   ├── Pictures/
│   │   │   ├── RustDirNav.jpg
│   │   │   └── RustDirNavOutput.JPG
│   │   ├── src/
│   │   │   ├── dir_nav_lib.rs
│   │   │   └── lib1.rs.html
│   │   └── test_dir/
│   │       ├── test_file.rs
│   │       ├── test_sub1_dir/
│   │       │   ├── test_file1.rs
│   │       │   └── test_file2.exe
│   │       └── test_sub2_dir/
│   │           └── test_file3.txt
│   ├── EntryPoint/
│   │   ├── .gitignore
│   │   ├── Cargo.lock
│   │   ├── Cargo.toml
│   │   ├── CLAUDE.md
│   │   ├── README.md
│   │   ├── Req_TextFinder.md
│   │   ├── EntryPoint_Spec.md
│   │   ├── test1.txt
│   │   ├── test2.txt
│   │   ├── src/
│   │   │   └── text_finder.rs
│   │   └── test_dir/
│   │       ├── test_file.rs
│   │       ├── test_sub1_dir/
│   │       │   ├── test_file1.rs
│   │       │   └── test_file2.exe
│   │       └── test_sub2_dir/
│   │           └── test_file3.txt
│   └── RustTfVerify/
│       ├── Cargo.lock
│       ├── Cargo.toml
│       └── src/
│           └── main.rs
│
└── rs_textfinder_opt/                ← Rust implementation (optimized variant)
    ├── Constitution.md
    ├── Notes.md
    ├── README.md
    ├── Structure.md
    ├── docs/
    │   └── Project_Spec.md
    ├── RustCmdLine/
    │   ├── Cargo.lock
    │   ├── Cargo.toml
    │   ├── README.md
    │   ├── RustCmdLine_Spec.md
    │   ├── examples/
    │   │   ├── Output.txt
    │   │   ├── Output1.txt.html
    │   │   ├── test1.rs
    │   │   └── test11.rs.html
    │   ├── Pictures/
    │   │   ├── dummy.txt
    │   │   └── RustCmdLineParserOutput.JPG
    │   └── src/
    │       ├── cmd_line_lib.rs
    │       └── lib1.rs.html
    ├── RustDirNav/
    │   ├── Cargo.lock
    │   ├── Cargo.toml
    │   ├── New Text Document.txt
    │   ├── Output.txt
    │   ├── README.md
    │   ├── RustDirNav.md
    │   ├── RustDirNav.zip
    │   ├── RustDirNav_Spec.md
    │   ├── examples/
    │   │   ├── test1.rs
    │   │   └── test11.rs.html
    │   ├── Pictures/
    │   │   ├── RustDirNav.jpg
    │   │   └── RustDirNavOutput.JPG
    │   ├── src/
    │   │   ├── dir_nav_lib.rs
    │   │   └── lib1.rs.html
    │   └── test_dir/
    │       ├── test_file.rs
    │       ├── test_sub1_dir/
    │       │   ├── test_file1.rs
    │       │   └── test_file2.exe
    │       └── test_sub2_dir/
    │           └── test_file3.txt
    ├── EntryPoint/
    │   ├── .gitignore
    │   ├── Cargo.lock
    │   ├── Cargo.toml
    │   ├── CLAUDE.md
    │   ├── README.md
    │   ├── Req_TextFinder.md
    │   ├── EntryPoint_Spec.md
    │   ├── test1.txt
    │   ├── test2.txt
    │   ├── src/
    │   │   └── text_finder.rs
    │   └── test_dir/
    │       ├── test_file.rs
    │       ├── test_sub1_dir/
    │       │   ├── test_file1.rs
    │       │   └── test_file2.exe
    │       └── test_sub2_dir/
    │           └── test_file3.txt
    └── RustTfVerify/
        ├── Cargo.lock
        ├── Cargo.toml
        └── src/
            └── main.rs
```

## Per-Implementation Structure Documents

Each sub-project maintains its own `Structure.md` with language-specific
build details, module layout, and testing conventions:

- [CppTextFinder/Structure.md](CppTextFinder/Structure.md)
- [CsTextFinder/Structure.md](CsTextFinder/Structure.md)
- [PyTextFinder/Structure.md](PyTextFinder/Structure.md)
- [rs_textfinder/Structure.md](rs_textfinder/Structure.md)
- [rs_textfinder_opt/Structure.md](rs_textfinder_opt/Structure.md)
