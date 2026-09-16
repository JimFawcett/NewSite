# Rust_TextFinder — Project Structure

The Rust_TextFinder project comprises three libraries and one binary, arranged as a single Cargo workspace. The binary depends on all three. The libraries themselves form a chain: `rust_textfinder_dirnav` depends on `rust_textfinder_cmdline` for the program-command struct, and `rust_textfinder_output` depends on `rust_textfinder_dirnav` for the `Output` trait. Nothing depends on `rust_textfinder_output` but the binary.

## Libraries

- **rust_textfinder_cmdline** — parses the command line into a `struct` of program commands that control the behavior of `rust_textfinder_dirnav`. Specified in [Spec_Rust_TextFinder_Cmdline.md](Rust_Spec_driven_Cmdline/Spec_Rust_TextFinder_Cmdline.md).
- **rust_textfinder_dirnav** — directory navigation. Reads file contents, runs regex matching, and formats each matching file into the block Spec_TextFinder.md §3.4 fixes before emitting its lines. Compiles the regular expression once per run, not once per file. Defines the trait:
  ```rust
  pub trait Output {
      fn output(&mut self, text: &str);
  }
  ```
  `Dirnav` binds to a concrete `Output` through a generic type parameter, so the call is statically dispatched. Specified in [Spec_Rust_TextFinder_Dirnav.md](Rust_Spec_driven_Dirnav/Spec_Rust_TextFinder_Dirnav.md).
- **rust_textfinder_output** — implements `Output::output` according to its specification, [Spec_Rust_TextFinder_Output.md](Rust_Spec_driven_Output/Spec_Rust_TextFinder_Output.md). Handles output errors internally.

Each library's Cargo package name matches its component name above, and each is a library crate exporting the items its specification fixes.

## Binary

- **rust_textfinder_entry** — binary package name; produces the executable `rust_textfinder`. Depends on the three libraries above. Specified in [Spec_Rust_TextFinder_Entry.md](Rust_Spec_driven_TextFinder_Entry/Spec_Rust_TextFinder_Entry.md).
- Owns the skip list and passes it to `rust_textfinder_dirnav` for use during traversal.
- On execution, the binary command line is parsed into a program-command struct using `rust_textfinder_cmdline`.
- A value of the concrete output type is created and bound to a `Dirnav` value through its generic parameter.
- The `Dirnav` value is started at each of the specified (possibly default) root paths in turn and performs a DFS for regex matches on files in each directory tree.
- Owns the process's one output value, which in turn owns the only handle to stdout. Every write to stdout, the binary's own help text and option listing included, passes through that value, so nothing else can interleave with the search output or reorder it.

## Build

- Language: Rust, edition 2021. Build system: Cargo. These apply to every package below, and each component's `Spec_*.md` names only its own package.
- One workspace at the root of this folder with four members, one per component. Each library is a separate package rather than a module of one crate, so the dependency chain above is enforced by Cargo rather than by convention.
- Dependencies: the `regex` crate, which Spec_TextFinder.md §6.1 assigns to Rust, is the only third-party dependency, and only `rust_textfinder_dirnav` declares it. Everything else comes from the standard library. Spec_TextFinder.md §6 permits a package from the language's supported ecosystem for regex access.
- Toolchain minimum: rustc 1.70 with the matching Cargo. No nightly feature is used.

## Notes

- This forms a data pipeline architecture that emits an output immediately following evaluation of a regex match.
- Identifiers follow Rust convention, so this implementation spells in snake_case what the C++ implementation spells in camelCase: `usage_line` for `usageLine`, `line_numbers` for `lineNumbers`. The switch letters, the emitted text, and the exit codes are fixed by Spec_TextFinder.md and are identical in both.
- The `Output` trait with a generic parameter is the current design choice. A boxed trait object, `Box<dyn Output>`, is a viable alternative that trades static dispatch for a signature carrying no type parameter; it is not adopted here.
- Spec_TextFinder.md §3.4 obliges an implementation to stop its runtime translating the LF terminator. Rust's standard output performs no such translation on any platform, so this implementation meets that requirement without configuring the stream. [Spec_Rust_TextFinder_Output.md](Rust_Spec_driven_Output/Spec_Rust_TextFinder_Output.md) §5 records what follows from that.
