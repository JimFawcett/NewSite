# Project Tree — Spec_driven_TextFinder

```
Spec_driven_TextFinder/
├── Constitution.md
├── Prompts_Constitution.md
├── Prompts_Fix_Constitution.md
├── Spec_TextFinder.md
├── Prompts_Spec_TextFinder.md
├── Prompts_Fix_Spec_TextFinder.md
├── Page_Structure.md
├── Prompts_Page_Structure.md
├── Text_Tone.md
├── Prompts_Text_Tone.md
├── Prompts_Pages.md
├── Project_Tree.md
├── README.md
├── archive/
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
│   ├── Demo_9-16-2026.md
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
├── Rust_Spec_driven_TextFinder/
│   ├── Rust_TextFinder_Structure.md
│   ├── Prompts_Build_Rust_TextFinder.md
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── run_unit_tests.bat
│   ├── run_integration_tests.bat
│   ├── run_demo.bat
│   ├── Demo_9-16-2026.md
│   ├── Rust_Spec_driven_TextFinder_Entry/
│   │   ├── Spec_Rust_TextFinder_Entry.md
│   │   ├── Cargo.toml
│   │   ├── src/
│   │   │   └── main.rs
│   │   └── tests/
│   │       ├── integration.rs
│   │       └── demonstration.rs
│   ├── Rust_Spec_driven_Cmdline/
│   │   ├── Spec_Rust_TextFinder_Cmdline.md
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       └── unit_tests.rs
│   ├── Rust_Spec_driven_Dirnav/
│   │   ├── Spec_Rust_TextFinder_Dirnav.md
│   │   ├── Cargo.toml
│   │   └── src/
│   │       ├── lib.rs
│   │       └── unit_tests.rs
│   └── Rust_Spec_driven_Output/
│       ├── Spec_Rust_TextFinder_Output.md
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           └── unit_tests.rs
└── CSharp_Spec_driven_TextFinder/
    ├── CSharp_TextFinder_Structure.md
    ├── Prompts_Build_CSharp_TextFinder.md
    ├── CSharp_TextFinder.sln
    ├── run_unit_tests.bat
    ├── run_integration_tests.bat
    ├── run_demo.bat
    ├── Demo_9-16-2026.md
    ├── test/
    │   ├── CSharp_TextFinder_IntegrationTest.csproj
    │   └── IntegrationTests.cs
    ├── demo/
    │   ├── CSharp_TextFinder_Demo.csproj
    │   └── Demo.cs
    ├── CSharp_Spec_driven_TextFinder_Entry/
    │   ├── Spec_CSharp_TextFinder_Entry.md
    │   ├── CSharp_TextFinder_Entry.csproj
    │   └── src/
    │       └── Program.cs
    ├── CSharp_Spec_driven_Cmdline/
    │   ├── Spec_CSharp_TextFinder_Cmdline.md
    │   ├── CSharp_TextFinder_Cmdline.csproj
    │   ├── src/
    │   │   ├── ProgramCommands.cs
    │   │   └── CommandLine.cs
    │   └── test/
    │       ├── CSharp_TextFinder_Cmdline_UnitTest.csproj
    │       └── UnitTests.cs
    ├── CSharp_Spec_driven_Dirnav/
    │   ├── Spec_CSharp_TextFinder_Dirnav.md
    │   ├── CSharp_TextFinder_Dirnav.csproj
    │   ├── src/
    │   │   ├── IOutput.cs
    │   │   └── Dirnav.cs
    │   └── test/
    │       ├── CSharp_TextFinder_Dirnav_UnitTest.csproj
    │       └── UnitTests.cs
    └── CSharp_Spec_driven_Output/
        ├── Spec_CSharp_TextFinder_Output.md
        ├── CSharp_TextFinder_Output.csproj
        ├── src/
        │   └── StdoutSink.cs
        └── test/
            ├── CSharp_TextFinder_Output_UnitTest.csproj
            └── UnitTests.cs
```

Build output and editor settings are omitted: `build/`, `target/`, `bin/`, `obj/`, and `.vscode/`. The first four are names the default skip list of Spec_TextFinder.md §3.2 prunes, so a demonstration rooted here does not report them either.

## Legend

### Project level

- `Constitution.md` — governing rules for this project (`Spec_driven_TextFinder/` and its children)
- `Spec_*.md` — behavioral specifications; authoritative source for code
- `*Structure.md` — project/component structure; authoritative source for code
- `Page_Structure.md` — the set of `Code/Spec_Driven_Design_*.html` pages, what each covers, and how a reader moves among them
- `Text_Tone.md` — the rules governing the prose those pages carry
- `README.md` — what TextFinder is, for a reader arriving at the folder
- `Project_Tree.md` — this document
- `archive/` — superseded documents, kept for reference; not enumerated here, and pruned by the skip list

### Prompt records

- `Prompts_*.md` — records of the spec-driven design conversations; not inputs to code
- `Prompts_Fix_*.md` — records of subsequent refinement conversations for the same artifact
- `Prompts_Fix_Spec_Cpp_TextFinder.md` — refinements reaching across every C++ component and the project spec
- `Prompts_Build_<Lang>_TextFinder.md` — record of turning one language's specifications into working code
- `Prompts_Cpp_Spec_driven_TextFinder_Tests.md` — record of building and running the C++ test suites
- `Prompts_Final_Tweaks_TextFinder.md` — record of the switch-default, first-match, and demonstration changes
- `Prompts_Pages.md` — record of generating the web pages Page_Structure.md defines

Page_Structure.md §8 assigns each record to exactly one page: a record produced at the project level goes to the Process thread, one produced inside a language's folder to that language's thread.

### Shared by every implementation

- `Spec_<Lang>_TextFinder_<Component>.md` — one component specification per component folder, citing the project spec
- `run_unit_tests.bat`, `run_integration_tests.bat` — run the suites, announcing each and its exit status
- `run_demo.bat` — runs the demonstration
- `Demo_<date>.md` — a capture of the demonstration's output, stating the date it was taken; a stale capture is replaced by a fresh one rather than edited (Spec_TextFinder.md §6.2)

### C++

- `src/` — implementation of the sibling `Spec_*.md`, one per component
- `*_UnitTest.ixx` — tests for that component, exporting one entry point; `*_TestDriver.cpp` runs it
- `Cpp_TextFinder_IntegrationTest.ixx` — drives the built executable end to end, covering the Entry binary
- `Cpp_TextFinder_Demo.ixx` — runs the executable against this project's own tree and shows the output
- `CMakeLists.txt` — build definition; the top-level one configures the whole project

### Rust

- `lib.rs`, `main.rs` — implementation of the sibling `Spec_Rust_*.md`, one package per component
- `unit_tests.rs` — the unit suite for the library it sits beside, compiled under `#[cfg(test)]`
- `tests/integration.rs` — drives the built executable end to end, covering the Entry binary
- `tests/demonstration.rs` — runs the executable against this project's own tree and shows the output
- `Cargo.toml` — package definition; the top-level one is the workspace holding the four members

### C#

- `src/` — implementation of the sibling `Spec_CSharp_*.md`, one project per component
- `test/UnitTests.cs` — the unit suite for the component it sits under, its own console project
- `test/IntegrationTests.cs` — drives the built executable end to end, covering the Entry binary
- `demo/Demo.cs` — runs the executable against this project's own tree and shows the output
- `*.csproj` — project definition; `CSharp_TextFinder.sln` holds all nine

Each C# suite is a console project returning its failure count rather than a `dotnet test` target, because every test adapter arrives as a NuGet package and Spec_TextFinder.md §6 admits no third-party test framework. That is why the unit suites sit in a `test/` folder beside `src/` rather than inside it, and why a suite sees only its component's public surface.
