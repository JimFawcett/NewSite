# Spec_driven_TextFinder

TextFinder is a command-line utility that walks a directory tree, evaluates a regular expression against the lines of each file it selects, and writes every match to stdout.

This project builds TextFinder from its specifications. Every line of code derives from a `Spec*.md` or `*Structure.md` document in this tree, and a change to the code starts as a change to one of those documents. The specifications are not a description written after the fact - they are the input the code is built from.

The C++ implementation is complete. Rust, C#, and Python follow, each refining [Spec_TextFinder.md](Spec_TextFinder.md) without redefining it.

## Documents

The project carries five kinds of document, and the order matters: each one narrows what the next may decide.

| Document | What it fixes |
|----------|---------------|
| [Constitution.md](Constitution.md) | The two rules that bind the whole tree |
| [Spec_TextFinder.md](Spec_TextFinder.md) | Behavior common to every implementation, in no particular language |
| `<Lang>_TextFinder_Structure.md` | Components, dependencies, and build, per language |
| `Spec_*.md` | One per component: the interface in the target language |
| `Prompts_*.md` | Records of the conversations that produced the others |

`Prompts_*.md` files document the design process. They are records, not inputs to code, and nothing in them reaches an implementation. [Project_Tree.md](Project_Tree.md) lists every file with a legend line.

Two further documents govern the generated prose rather than the code: [Text_Tone.md](Text_Tone.md) fixes the voice, and [Page_Structure.md](Page_Structure.md) fixes the structure of the web pages that discuss the project.

### The Constitution

1. **Spec-driven code.** All code creation and modification derives from the `Spec*.md` and `*Structure.md` files in this directory or any subdirectory. Example code, sample implementations, and other projects are excluded as sources. General language knowledge - idioms, standard libraries, toolchains - stays available.
2. **Stay inside.** Nothing outside `Spec_driven_TextFinder/` is modified without an explicit request naming the file, and no `archive` directory is read, wherever it sits.

### The Project Specification

[Spec_TextFinder.md](Spec_TextFinder.md) runs seven sections: purpose, scope, functional requirements, command-line syntax, defined switches, non-functional requirements, and non-goals. Three of its properties do the most work.

- **Fixed text is quoted, not described.** §5.1 reproduces the help text and §5.2 the seven usage-diagnostic reason lines, so two implementations cannot drift apart in wording.
- **Quantities appear as numbers.** 10,485,760 bytes as the size limit, 11 skip-list names, nine switches, three line terminators. Each is a test case.
- **Accepted costs are stated.** §3.3's no-content case and §6's ordering limit both name what the design gives up.

## Switches

Every switch is a single case-sensitive letter introduced by `/` or `-`, the two being equivalent, and every switch takes exactly one argument. There are no bare flags. Omitting a switch supplies its default.

| Switch | Argument (default) | Meaning |
|--------|--------------------|---------|
| `/P` | path (`.`) | Root path. Repeat to add more, traversed in the order given |
| `/p` | `"ext, ext"` (`""`) | Extensions to search; empty searches every file |
| `/r` | regex (`.`) | Regular expression evaluated against each line; Spec_TextFinder.md §6.1 names the engine per language and the portable pattern subset |
| `/s` | bool (`true`) | Recurse into subdirectories |
| `/h` | bool (`true`) | Suppress file announcements; error announcements still appear |
| `/v` | bool (`false`) | List the resolved option set before traversal |
| `/H` | bool (`false`) | Print help and exit |
| `/n` | bool (`false`) | Include the line-number field in each match line |
| `/L` | bool (`false`) | Include the matched-line field in each match line |

A record joins its fields with ` - ` (space, hyphen, space):

```
<path> - <lineNumber> - <matchedLine>
```

With `/n` and `/L` both at their defaults a record carries the path alone, so one record is emitted per matching file and evaluation of that file stops at its first match.

## The C++ Implementation

[Cpp_Spec_driven_TextFinder/](Cpp_Spec_driven_TextFinder/) holds three libraries and one binary, specified by [Cpp_TextFinder_Structure.md](Cpp_Spec_driven_TextFinder/Cpp_TextFinder_Structure.md).

| Component | Responsibility |
|-----------|----------------|
| `Cpp_TextFinder_Cmdline` | Parses `argc`/`argv` into `ProgramCommands`. Opens no stream |
| `Cpp_TextFinder_Dirnav` | Walks, reads, matches, formats. The only component that touches file contents |
| `Cpp_TextFinder_Output` | Writes each string to stdout as one line. Absorbs every write failure |
| `Cpp_TextFinder_Entry` | Produces the executable `Cpp_TextFinder`. Wires the three together |

The libraries form a chain rather than a star. `Cpp_TextFinder_Dirnav` imports `Cpp_TextFinder_Cmdline` for `ProgramCommands`, and `Cpp_TextFinder_Output` imports `Cpp_TextFinder_Dirnav` for the `Output` base class it derives from. Nothing imports `Cpp_TextFinder_Output` but the binary, which supplies it as the template argument that binds `Cpp_TextFinder_Dirnav` to a concrete sink.

The three libraries are C++ modules. `Cpp_TextFinder_Entry` remains a conventional translation unit.

### Requirements

- C++23 with module support and `import std;`: GCC 14+, Clang 17+, or MSVC 19.36+ (Visual Studio 2022 17.6+)
- CMake 3.28+

The checked-in build was produced with MSVC and the Ninja generator.

### Build

```
cd Cpp_Spec_driven_TextFinder
cmake -S . -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

CMake opts in to its experimental `import std` support, so a version that withdraws the opt-in token in `CMakeLists.txt` will need that line updated.

The executable lands at `build/Cpp_Spec_driven_TextFinder_Entry/Cpp_TextFinder.exe`.

### Run

```
Cpp_TextFinder -P . -p "md, ixx, cpp" -r "^export module" -n true -L true
```

### Test

Three unit suites cover the libraries, one integration suite covers the binary by driving the built executable end to end.

```
run_unit_tests.bat           80 assertions across Cmdline, Dirnav, and Output
run_integration_tests.bat    42 assertions against the executable
```

Each suite lives beside the code it tests as a `*_UnitTest.ixx` exporting one entry point, with a `*_TestDriver.cpp` that runs it and maps the failure count to an exit status. Both runners take the build directory from their own location, so either runs from any working directory, and a suite that was never built counts as a failure rather than passing by absence.

`run_integration_tests.bat` takes an optional argument that overrides the executable under test.

### Demonstrate

```
run_demo.bat
```

`Cpp_TextFinder_Demo.ixx` runs the built executable against this project's own tree with `-p "md, ixx, cpp"` fixed, and shows six invocations: the bare expression, module declarations with line numbers and text, which documents cite the parent specification, the same search with `-s false`, announcements alongside the resolved option set, and a malformed expression refused before traversal.

Two optional arguments override the executable and the search root.

## Web Pages

Pages under `NewSite/Code/` discuss the project, built to [Page_Structure.md](Page_Structure.md). Each carries the full text of the `Prompts_*.md` files that document the artifacts it covers, in collapsed blocks at the end. Seven pages exist today; the structure they are moving to defines more.

1. `Spec_Driven_Design_Introduction.html` - the project and its specification
2. `Spec_Driven_Design_Cpp_Entry.html` - the C++ structure and the binary
3. `Spec_Driven_Design_Cpp_Cmdline.html` - command-line parsing
4. `Spec_Driven_Design_Cpp_Dirnav.html` - traversal, matching, and emission
5. `Spec_Driven_Design_Cpp_Output.html` - the stdout sink
6. `Spec_Driven_Design_Cpp_Testing.html` - the four suites and their output
7. `Spec_Driven_Design_Cpp_Demonstration.html` - the executable run against its own project
