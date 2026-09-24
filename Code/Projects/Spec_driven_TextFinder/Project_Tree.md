# Project Tree — Spec_driven_TextFinder

```
Spec_driven_TextFinder/
├── Constitution.md
├── Prompts_Constitution.md
├── Prompts_Fix_Constitution.md
├── Important_Notes.md
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
├── Fixture/
│   ├── Fixture.md
│   ├── cases.txt
│   ├── .gitattributes
│   ├── tree/
│   │   ├── alpha.txt
│   │   ├── crlf.txt
│   │   ├── cr.md
│   │   ├── empty.txt
│   │   ├── bom.txt
│   │   ├── binary.bin
│   │   ├── invalid.txt
│   │   ├── .gitignore
│   │   ├── noext
│   │   ├── sub/
│   │   │   └── deep.txt
│   │   └── build/
│   │       └── pruned.txt
│   └── expected/
│       └── <one .txt per case in cases.txt>
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
│   ├── Demo_9-24-2026.md
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
│   ├── Demo_9-24-2026.md
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
├── CSharp_Spec_driven_TextFinder/
│   ├── CSharp_TextFinder_Structure.md
│   ├── Prompts_Build_CSharp_TextFinder.md
│   ├── CSharp_TextFinder.sln
│   ├── run_unit_tests.bat
│   ├── run_integration_tests.bat
│   ├── run_demo.bat
│   ├── Demo_9-24-2026.md
│   ├── test/
│   │   ├── CSharp_TextFinder_IntegrationTest.csproj
│   │   └── IntegrationTests.cs
│   ├── demo/
│   │   ├── CSharp_TextFinder_Demo.csproj
│   │   └── Demo.cs
│   ├── CSharp_Spec_driven_TextFinder_Entry/
│   │   ├── Spec_CSharp_TextFinder_Entry.md
│   │   ├── CSharp_TextFinder_Entry.csproj
│   │   └── src/
│   │       └── Program.cs
│   ├── CSharp_Spec_driven_Cmdline/
│   │   ├── Spec_CSharp_TextFinder_Cmdline.md
│   │   ├── CSharp_TextFinder_Cmdline.csproj
│   │   ├── src/
│   │   │   ├── ProgramCommands.cs
│   │   │   └── CommandLine.cs
│   │   └── test/
│   │       ├── CSharp_TextFinder_Cmdline_UnitTest.csproj
│   │       └── UnitTests.cs
│   ├── CSharp_Spec_driven_Dirnav/
│   │   ├── Spec_CSharp_TextFinder_Dirnav.md
│   │   ├── CSharp_TextFinder_Dirnav.csproj
│   │   ├── src/
│   │   │   ├── IOutput.cs
│   │   │   └── Dirnav.cs
│   │   └── test/
│   │       ├── CSharp_TextFinder_Dirnav_UnitTest.csproj
│   │       └── UnitTests.cs
│   └── CSharp_Spec_driven_Output/
│       ├── Spec_CSharp_TextFinder_Output.md
│       ├── CSharp_TextFinder_Output.csproj
│       ├── src/
│       │   └── StdoutSink.cs
│       └── test/
│           ├── CSharp_TextFinder_Output_UnitTest.csproj
│           └── UnitTests.cs
└── Python_Spec_driven_TextFinder/
    ├── Python_TextFinder_Structure.md
    ├── Prompts_Build_Python_TextFinder.md
    ├── Python_TextFinder.bat
    ├── Python_TextFinder
    ├── run_unit_tests.bat
    ├── run_integration_tests.bat
    ├── run_demo.bat
    ├── Demo_9-24-2026.md
    ├── test/
    │   └── integration_tests.py
    ├── demo/
    │   └── demo.py
    ├── Python_Spec_driven_TextFinder_Entry/
    │   ├── Spec_Python_TextFinder_Entry.md
    │   └── src/
    │       └── python_textfinder_entry/
    │           ├── __init__.py
    │           ├── entry.py
    │           └── __main__.py
    ├── Python_Spec_driven_Cmdline/
    │   ├── Spec_Python_TextFinder_Cmdline.md
    │   ├── src/
    │   │   └── python_textfinder_cmdline/
    │   │       ├── __init__.py
    │   │       ├── program_commands.py
    │   │       └── command_line.py
    │   └── test/
    │       └── unit_tests.py
    ├── Python_Spec_driven_Dirnav/
    │   ├── Spec_Python_TextFinder_Dirnav.md
    │   ├── src/
    │   │   └── python_textfinder_dirnav/
    │   │       ├── __init__.py
    │   │       ├── output.py
    │   │       └── dirnav.py
    │   └── test/
    │       └── unit_tests.py
    └── Python_Spec_driven_Output/
        ├── Spec_Python_TextFinder_Output.md
        ├── src/
        │   └── python_textfinder_output/
        │       ├── __init__.py
        │       └── stdout_sink.py
        └── test/
            └── unit_tests.py
```

Build output and editor settings are omitted: `build/`, `target/`, `bin/`, `obj/`, `__pycache__/`, and `.vscode/`. The first five are names the default skip list of Spec_TextFinder.md §3.2 prunes, so a demonstration rooted here does not report them either. Each is ignored by a path-scoped rule in the repository's root `.gitignore`, so no name common in the rest of the site is ignored on its account.

## Legend

### Project level

- `Constitution.md` — governing rules for this project (`Spec_driven_TextFinder/` and its children)
- `Spec_*.md` — behavioral specifications; authoritative source for code
- `*Structure.md` — project/component structure; authoritative source for code
- `Page_Structure.md` — the set of `Code/Spec_Driven_Design_*.html` pages, what each covers, and how a reader moves among them
- `Text_Tone.md` — the rules governing the prose those pages carry
- `Important_Notes.md` — open questions and deferred decisions: a case no document settles, a rule one implementation has outrun, or a change landed in `Spec_TextFinder.md` and not yet in every implementation. Not a specification, and nothing in it authorizes code
- `Fixture/` — the shared conformance artifact of Spec_TextFinder.md §6.2: one tree, one list of command lines, and the stdout and exit code each must produce. Captured output, not a source; Constitution.md rule 1 admits no code derived from it. `.gitattributes` sets `* -text` so git never normalizes the CRLF and bare-CR files
- `README.md` — what TextFinder is, for a reader arriving at the folder
- `Project_Tree.md` — this document
- `archive/` — superseded documents, kept for reference; not enumerated here, and pruned by the skip list

### Prompt records

- `Prompts_*.md` — records of the spec-driven design conversations; not inputs to code
- `Prompts_Fix_*.md` — records of subsequent refinement conversations for the same artifact
- `Prompts_Fix_Spec_Cpp_TextFinder.md` — refinements reaching across every C++ component and the project spec
- `Prompts_Build_<Lang>_TextFinder.md` — record of turning one language's specifications into working code; the Python one also records the writing of those specifications, the two having happened in one session, so that thread has no separate `Prompts_Spec_*.md`
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

### Python

- `src/<package>/` — implementation of the sibling `Spec_Python_*.md`, one package per component
- `test/unit_tests.py` — the unit suite for the component it sits under, run as a script
- `test/integration_tests.py` — drives the assembled program end to end, covering the Entry binary
- `demo/demo.py` — runs the program against this implementation's own tree and shows the output
- `Python_TextFinder.bat`, `Python_TextFinder` — launchers, one per platform, that set `PYTHONPATH` and invoke `python -m python_textfinder_entry`; `Python_TextFinder` is the name the help text of Spec_TextFinder.md §5.1 carries

There is no project file and no build definition, because Python compiles on import. Imports resolve through `PYTHONPATH`, carrying the four `src/` folders, which the launchers and the three runners set. Spec_TextFinder.md §6.2 has a runner build what it is about to run, so each runner invokes `python -m compileall` over those four folders first and counts every suite as failed if that reports an error.

Each Python suite runs its cases through `unittest` and exits with the number that failed. Unlike the C# implementation, which had to hand-write a runner because every .NET test adapter arrives as a NuGet package, this one uses a framework that ships with the interpreter and so satisfies the dependency rule of Spec_TextFinder.md §6 without writing one; `pytest` is third-party and is not used.
