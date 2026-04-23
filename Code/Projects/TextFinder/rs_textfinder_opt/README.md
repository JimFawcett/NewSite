# rs_textfinder_opt

A recursive, regex-based file-content search tool written in Rust.  Given a
root directory, a set of file extensions, and a regular expression, it walks
the directory tree and prints every file whose content contains a match.

---

## Crates

The project is composed of four independent crates linked by relative paths.

| Crate | Kind | Role |
|-------|------|------|
| `RustCmdLine` | library | Parses `/Key [Value]` or `-Key [Value]` command-line arguments |
| `RustDirNav` | library | Generic, event-driven depth-first directory walker |
| `RustTextFinder` | binary (`text_finder`) | Application — wires the libraries and drives the search |
| `RustTfVerify` | binary (`tf_verify`) | Integration verifier — runs `text_finder` as a subprocess and checks its output against requirement assertions |

---

## Quick Start

```bash
# 1. Build the search tool
cd RustTextFinder
cargo build

# 2. Search the parent directory for Rust files containing "struct"
cargo run -- /P ".." /p "rs" /r "struct"

# bash / Unix users — the - prefix works equally well
cargo run -- -P ".." -p "rs" -r "struct"
```

---

## Command-Line Options

Options accept either a `/` prefix (Windows / PowerShell) or a `-` prefix
(bash / Unix); both are equivalent.

| Option | Argument | Default | Meaning |
|--------|----------|---------|---------|
| `/P` | path | `.` | Root directory for the search |
| `/p` | extensions | *(all files)* | Comma-separated extensions, e.g. `rs,txt` |
| `/r` | regex | `.` *(any)* | Regular expression matched against file content |
| `/s` | `true`/`false` | `true` | Recurse into subdirectories |
| `/H` | `true`/`false` | `true` | Hide directories that contain no matching files |
| `/v` | *(flag)* | off | Print all resolved options before searching |
| `/h` | *(flag)* | off | Print help and exit |

### Examples

```bash
# Find all Rust files containing "impl" under the current directory
cargo run -- /P "." /p "rs" /r "impl"

# Search text and markdown files for a TODO comment, show all directories
cargo run -- /P "." /p "txt,md" /r "TODO" /H false

# Verbose output — shows resolved path, patterns, and regex before searching
cargo run -- /P ".." /p "rs" /r "fn main" /v
```

---

## Output

Matching files are grouped under their containing directory:

```
  TextFinder ver 1.2.0
 =======================
  searching path: "../"
  patterns: ["rs"]
  matching files with regex: "struct"

  ../RustTextFinder/src
      "text_finder.rs"

  ../RustDirNav/src
      "dir_nav_lib.rs"

  processed 42 files in 18 dirs

  That's all Folks!
```

Directories that contain no matching files are hidden by default (`/H true`).
Set `/H false` to print every directory as it is entered.

---

## Design

### `RustCmdLine` — `CmdLineParse`

Parses raw `args()` tokens into a `HashMap<char, String>` of options and a
`Vec<String>` of file-extension patterns.  A token starting with `/` or `-`
is treated as a key; the next token (if it does not itself start with `/` or
`-`) becomes its value, otherwise the value is set to `"true"`.

### `RustDirNav` — `DirNav<App: DirEvent>`

Generic depth-first walker.  Callers implement the `DirEvent` trait:

```rust
pub trait DirEvent {
    fn do_dir(&mut self, d: &str);
    fn do_file(&mut self, f: &str);
}
```

`DirNav` calls `do_dir` when entering a directory and `do_file` for each
file whose extension matches the registered patterns.  Build-output and
VCS directories (`target`, `bin`, `obj`, `.git`, etc.) are skipped
automatically.

### `RustTextFinder` — `TextFinder` + `TfAppl`

`TextFinder` holds a regex string and exposes `find(&self, file_path) -> bool`.
It reads file content as UTF-8 text, falling back to lossy byte decoding for
binary files, then tests the content against the regex.  File bytes are read
via `read_file::read`, which reuses a thread-local staging buffer to avoid
repeated heap allocations across sequential reads.

`TfAppl` implements `DirEvent` using `TextFinder` and handles the hide/show
directory logic.  `main` wires `DirNav<TfAppl>` together from the parsed
command-line options.

#### `read_file` — buffer reuse optimization

`std::fs::read` allocates a fresh `Vec<u8>` on every call.  When searching
thousands of files sequentially that means thousands of heap allocations and
deallocations — one per file — even though only one buffer is needed at a
time.

`read_file::read` replaces that pattern with a thread-local staging buffer.
On the first call the buffer is allocated once.  On every subsequent call:

- If the file fits within the buffer's existing capacity the bytes are read
  directly into the same allocation — **no heap operation at all** for the
  staging step.
- If the file is larger than anything seen before, the buffer is grown to
  `max(current_capacity × 2, file_size)` — the doubling strategy amortizes
  growth so the total number of reallocations stays logarithmic in the size
  of the largest file encountered.

One `clone()` is still required at the end to produce the owned `Vec<u8>`
that callers expect (matching the `std::fs::read` signature), but that is a
single allocation sized exactly to the file — the same cost `std::fs::read`
pays.  The net saving is all the intermediate reallocations that
`read_to_end` would otherwise perform as the internal buffer grows to
accommodate an unexpectedly large file, and the full per-file alloc/free
cycle is eliminated for every file that fits within the established
high-water-mark capacity.

### `RustTfVerify` — integration verifier

Spawns the compiled `text_finder` binary with controlled arguments and
verifies its stdout against each requirement in `RustTextFinder/Req_TextFinder.md`.
Results are reported as `PASS`, `FAIL`, or `SKIP`.

---

## Building All Crates

Each crate is built independently:

```bash
cd RustCmdLine   && cargo build
cd ../RustDirNav && cargo build
cd ../RustTextFinder && cargo build
cd ../RustTfVerify   && cargo build
```

---

## Testing

```bash
# RustCmdLine unit tests
cd RustCmdLine
cargo test -- --show-output

# RustDirNav unit tests (must run single-threaded)
cd RustDirNav
cargo test -- --test-threads=1 --show-output

# RustTextFinder unit tests
cd RustTextFinder
cargo test -- --show-output

# Integration verification (requires text_finder binary to be built first)
cd RustTextFinder && cargo build
cd ../RustTfVerify && cargo run
```

---

## External Dependencies

| Package | Version | Used by | Purpose |
|---------|---------|---------|---------|
| `regex` | 1.7.0 | `RustTextFinder` | Compile and match regular expressions |

All other functionality uses the Rust standard library only.
