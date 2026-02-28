# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RustTextFinder is a CLI tool that recursively searches a directory tree for files whose contents match a regular expression. It uses two local path dependencies (`rust_dir_nav` and `rust_cmd_line`) that must exist as sibling directories alongside this repo.

## Build & Run Commands

```bash
# Build
cargo build

# Run with default options (searches current dir for "abc" in rs/exe/rlib files)
cargo run

# Run with arguments
cargo run -- /P ".." /p "rs,txt" /r "struct" /H true /s true

# Show help
cargo run -- /h

# Show verbose output (prints all parsed options)
cargo run -- /v true
```

There are no automated tests. The VSCode debug config in `.vscode/launch.json` runs with `/P ".." /p "rs" /r "struct" /v "true"` as a representative test invocation.

## Architecture

The program is entirely in `src/main.rs` and has two structs:

**`TextFinder`** — Core search engine. Holds a compiled `Regex` and a pattern string. The `find(&self, file_path: &str) -> bool` method reads a file (with lossy UTF-8 fallback for binary files) and returns whether the regex matches anywhere in the content.

**`TfAppl`** — Application proxy. Implements the `DirEvent` trait from `rust_dir_nav`, which provides two callbacks:
- `do_dir(&mut self, d: &str)` — called when entering a directory; tracks current dir and resets `hide` flag
- `do_file(&mut self, f: &str)` — called for each file matching the extension pattern; delegates to `TextFinder::find` and prints results

**`main`** wires everything together:
1. Parses CLI options using `rust_cmd_line::CmdLineParse`
2. Creates `DirNav<TfAppl>` from `rust_dir_nav`
3. Adds file extension patterns to the navigator
4. Calls `dn.visit(path)` to start traversal

## CLI Options

| Flag | Argument | Default | Meaning |
|------|----------|---------|---------|
| `/P` | path | `.` | Root directory for search |
| `/p` | extensions | `rs,exe,rlib` | Comma-separated file extensions to search |
| `/r` | regex | `abc` | Regular expression to match in file contents |
| `/s` | true/false | `true` | Recurse into subdirectories |
| `/H` | true/false | `true` | Hide directories with no matches |
| `/v` | flag | off | Print all parsed options |
| `/h` | flag | off | Print help message |

## Local Dependencies

`rust_dir_nav` and `rust_cmd_line` are referenced via relative path (`../RustDirNav`, `../RustCmdLine`). These sibling repositories must be present on the local filesystem for `cargo build` to succeed.
