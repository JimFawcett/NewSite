# Cpp_TextFinder — Project Structure

The Cpp_TextFinder project comprises three libraries and one binary. The binary imports the three libraries.

## Libraries

- **Cpp_Cmdline** — parses the command line into a `struct` of program commands that control the behavior of `Cpp_Dirnav` and `Cpp_Output`.
- **Cpp_Dirnav** — directory navigation. Reads file contents, runs regex matching, and formats matches into a string with fields joined by ` - ` (space-hyphen-space, per Spec_TextFinder.md §3.4) before emitting them. Creates the regex state machine once per run, not once per file. Defines the abstract base class:
  ```cpp
  class Output {
  public:
      virtual ~Output() = default;
      virtual void output(const std::string& match_str) = 0;
  };
  ```
  `Cpp_Dirnav` binds to a concrete `Output` via a template parameter.
- **Cpp_Output** — implements `Output::output(...)` according to its specification, [Spec_Cpp_Output.md](Spec_Cpp_Output.md). Handles output errors internally.

## Binary

- **Cpp_TextFinder_Entry** — binary project name; produces the executable `Cpp_TextFinder`. Imports the three libraries above.
- Owns the skip list and passes it to `Cpp_Dirnav` for use during traversal.
- On execution, the binary command line is parsed into a program-command struct using `Cpp_Cmdline`.
- An instance of `Cpp_Output` is created and bound to a `Cpp_Dirnav` instance via a template parameter.
- The `Cpp_Dirnav` instance is started at the specified (possibly default) path and performs a DFS for regex matches on files in the directory tree.

## Build

- Language: C++23.
- Build system: CMake.
- C++ Modules used for `Cpp_Cmdline`, `Cpp_Dirnav`, and `Cpp_Output`, and for the standard library (`import std;`). `Cpp_TextFinder_Entry` remains a conventional translation unit.

## Notes

- This forms a data pipeline architecture that emits an output immediately following evaluation of a regex match.
- The abstract base class `Output` is the current design choice. A type-erased wrapper (a value-type holding a small polymorphic model) is a viable alternative that decouples callers from inheritance; it is not adopted here.
