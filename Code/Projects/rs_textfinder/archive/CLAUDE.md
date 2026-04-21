# CLAUDE.md — TextFinder1

Guidance for Claude Code when working in this directory.

## Project Overview

TextFinder1 is a Rust workspace composed of three related crates that together implement a recursive, regex-based file text search tool. The three crates are independent libraries/binaries that are path-linked via `Cargo.toml`.

## Crate Structure

```
TextFinder1/
├── RustCmdLine/        — library: command-line parser
├── RustDirNav/         — library: directory navigator (generic, event-driven)
└── RustTextFinder/     — binary: top-level application
```

### RustCmdLine (`rust_cmd_line` v1.1.0)
- Single source file: `src/lib.rs`
- Provides `CmdLineParse` struct to parse `/Key [Value]` style command-line arguments
- Supported options: `/P` path, `/p` patterns (comma-separated extensions), `/s` recurse, `/r` regex, `/H` hide, `/h` help, `/v` verbose
- Options with no value get `"true"` as their value
- `default_options()` sets: `P="."`, `s="true"`, `r="."`, `H="true"`

### RustDirNav (`rust_dir_nav` v1.1.0)
- Single source file: `src/lib.rs`
- Provides generic `DirNav<App: DirEvent>` struct for depth-first directory traversal
- `DirEvent` trait requires `do_dir(&mut self, d: &str)` and `do_file(&mut self, f: &str)`
- Callers implement `DirEvent` on an application-specific type and pass it as the generic parameter
- `visit(&path)` performs the traversal, dispatching events to the `App` instance
- Replaces Windows `\` separators with `/` throughout
- Tests require `--test-threads=1` (test setup must run before walk test)

### RustTextFinder (`rust_text_finder` v1.2.0)
- Single source file: `src/main.rs`
- Depends on both `rust_dir_nav` and `rust_cmd_line` via relative path, plus `regex = "1.7.0"`
- `TextFinder` struct: holds regex string, performs per-file search (tries UTF-8, falls back to lossy bytes)
- `TfAppl` struct: implements `DirEvent` using `TextFinder`; used as the `App` parameter for `DirNav`
- `main()`: parses args, configures `DirNav<TfAppl>`, calls `dn.visit(&path)`

## Build & Run

Each crate builds independently with `cargo build` from its own directory.
Run the application from `RustTextFinder/`:

```bash
cargo run -- /P "." /p "rs,txt" /r "abc" /s /H
```

Run tests (DirNav requires single-threaded):

```bash
cd RustDirNav
cargo test -- --test-threads=1 --show-output
```

## Key Conventions

- Command-line options use `/Key` (Windows style), not `--key`
- File patterns are extensions only (no `*.`), comma-separated: `rs,txt`
- Regex is passed directly to the `regex` crate — standard Rust regex syntax
- Path separators are normalized to `/` internally
- `hide=true` (default) suppresses directories that contain no matching files
