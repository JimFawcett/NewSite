# Project Tree — Spec_driven_TextFinder

```
Spec_driven_TextFinder/
├── Constitution.md
├── Prompts_Constitution.md
├── Prompts_Fix_Constitution.md
├── Spec_TextFinder.md
├── Prompts_Spec_TextFinder.md
├── Prompts_Fix_Spec_TextFinder.md
├── Project_Tree.md
├── Cpp_Spec_driven_TextFinder/
│   ├── Cpp_TextFinder_Structure.md
│   ├── Prompts_Cpp_TextFinder_Structure.md
│   ├── Prompts_Fix_Cpp_TextFinder_Structure.md
│   ├── Prompts_Fix_Spec_Cpp_TextFinder.md
│   ├── Prompts_Build_Cpp_TextFinder.md
│   ├── Prompts_Cpp_Spec_driven_TextFinder_Tests.md
│   ├── Prompts_Final_Tweaks_TextFinder.md
│   ├── CMakeLists.txt
│   ├── run_unit_tests.bat
│   ├── run_integration_tests.bat
│   ├── run_demo.bat
│   ├── Demo_9-14-2026.md
│   ├── src/
│   │   ├── Cpp_TextFinder_IntegrationTest.ixx
│   │   ├── Cpp_TextFinder_IntegrationTest_Driver.cpp
│   │   ├── Cpp_TextFinder_Demo.ixx
│   │   └── Cpp_TextFinder_Demo_Driver.cpp
│   ├── Cpp_Spec_driven_TextFinder_Entry/
│   │   ├── Spec_Cpp_TextFinder_Entry.md
│   │   ├── Prompts_Spec_Cpp_TextFinder_Entry.md
│   │   ├── Prompts_Fix_Spec_Cpp_TextFinder_Entry.md
│   │   ├── CMakeLists.txt
│   │   └── src/
│   │       └── main.cpp
│   ├── Cpp_Spec_driven_Cmdline/
│   │   ├── Spec_Cpp_TextFinder_Cmdline.md
│   │   ├── Prompts_Spec_Cpp_TextFinder_Cmdline.md
│   │   ├── Prompts_Fix_Spec_Cpp_TextFinder_Cmdline.md
│   │   ├── CMakeLists.txt
│   │   └── src/
│   │       ├── Cpp_TextFinder_Cmdline.ixx
│   │       ├── Cpp_TextFinder_Cmdline_UnitTest.ixx
│   │       └── Cpp_TextFinder_Cmdline_TestDriver.cpp
│   ├── Cpp_Spec_driven_Dirnav/
│   │   ├── Spec_Cpp_TextFinder_Dirnav.md
│   │   ├── Prompts_Spec_Cpp_TextFinder_Dirnav.md
│   │   ├── Prompts_Fix_Spec_Cpp_TextFinder_Dirnav.md
│   │   ├── CMakeLists.txt
│   │   └── src/
│   │       ├── Cpp_TextFinder_Dirnav.ixx
│   │       ├── Cpp_TextFinder_Dirnav_UnitTest.ixx
│   │       └── Cpp_TextFinder_Dirnav_TestDriver.cpp
│   └── Cpp_Spec_driven_Output/
│       ├── Spec_Cpp_TextFinder_Output.md
│       ├── Prompts_Spec_Cpp_TextFinder_Output.md
│       ├── Prompts_Fix_Spec_Cpp_TextFinder_Output.md
│       ├── CMakeLists.txt
│       └── src/
│           ├── Cpp_TextFinder_Output.ixx
│           ├── Cpp_TextFinder_Output_UnitTest.ixx
│           └── Cpp_TextFinder_Output_TestDriver.cpp
└── Rust_Spec_driven_TextFinder/
    ├── Rust_TextFinder_Structure.md
    ├── Cargo.toml
    ├── Cargo.lock
    ├── run_unit_tests.bat
    ├── run_integration_tests.bat
    ├── run_demo.bat
    ├── Demo_9-15-2026.md
    ├── Rust_Spec_driven_TextFinder_Entry/
    │   ├── Spec_Rust_TextFinder_Entry.md
    │   ├── Cargo.toml
    │   ├── src/
    │   │   └── main.rs
    │   └── tests/
    │       ├── integration.rs
    │       └── demonstration.rs
    ├── Rust_Spec_driven_Cmdline/
    │   ├── Spec_Rust_TextFinder_Cmdline.md
    │   ├── Cargo.toml
    │   └── src/
    │       ├── lib.rs
    │       └── unit_tests.rs
    ├── Rust_Spec_driven_Dirnav/
    │   ├── Spec_Rust_TextFinder_Dirnav.md
    │   ├── Cargo.toml
    │   └── src/
    │       ├── lib.rs
    │       └── unit_tests.rs
    └── Rust_Spec_driven_Output/
        ├── Spec_Rust_TextFinder_Output.md
        ├── Cargo.toml
        └── src/
            ├── lib.rs
            └── unit_tests.rs
```

## Legend

- `Constitution.md` — governing rules for this project (`Spec_driven_TextFinder/` and its children)
- `Spec_*.md` — behavioral specifications; authoritative source for code
- `*Structure.md` — project/component structure; authoritative source for code
- `Prompts_*.md` — records of the spec-driven design conversations; not inputs to code
- `Prompts_Fix_*.md` — records of subsequent refinement conversations for the same artifact
- `Prompts_Fix_Spec_Cpp_TextFinder.md` — refinements reaching across every C++ component and the project spec
- `Prompts_Build_Cpp_TextFinder.md` — record of turning the C++ specifications into working code
- `Prompts_Cpp_Spec_driven_TextFinder_Tests.md` — record of building and running the test suites
- `Prompts_Final_Tweaks_TextFinder.md` — record of the switch-default, first-match, and demonstration changes
- `src/` — implementation of the sibling `Spec_*.md`, one per component
- `*_UnitTest.ixx` — tests for that component, exporting one entry point; `*_TestDriver.cpp` runs it
- `Cpp_TextFinder_IntegrationTest.ixx` — drives the built executable end to end, covering the Entry binary
- `Cpp_TextFinder_Demo.ixx` — runs the executable against this project's own tree and shows the output
- `run_unit_tests.bat`, `run_integration_tests.bat` — run the suites, announcing each and its exit status
- `run_demo.bat` — runs the demonstration
- `Demo_<date>.md` — a capture of the demonstration's output, stating the date it was taken
- `CMakeLists.txt` — build definition; the top-level one configures the whole project
- `lib.rs`, `main.rs` — implementation of the sibling `Spec_Rust_*.md`, one package per component
- `unit_tests.rs` — the unit suite for the library it sits beside, compiled under `#[cfg(test)]`
- `tests/integration.rs` — drives the built executable end to end, covering the Entry binary
- `tests/demonstration.rs` — runs the executable against this project's own tree and shows the output
- `Cargo.toml` — package definition; the top-level one is the workspace holding the four members
- `Rust_Spec_driven_TextFinder/` — the Rust implementation: four Cargo packages, their unit suites, one integration suite, and one demonstration; no prompt records yet
