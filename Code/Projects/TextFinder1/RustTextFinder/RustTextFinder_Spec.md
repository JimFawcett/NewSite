# RustTextFinder_Spec.md - Recursive text search tool

**Crate:** `rust_text_finder` v1.2.0
**Binary name:** `text_finder`
**Source:** `src/text_finder.rs`
**Author:** Jim Fawcett

---

## Purpose

`text_finder` searches a directory tree for files whose content matches a
regular expression. It builds on two library crates:

- `cmd_line_lib` (`rust_cmd_line`) — parses command line options and patterns
- `dir_nav_lib` (`rust_dir_nav`) — walks the directory tree, dispatching file
  and directory names to a caller-supplied `DirEvent` implementor

The binary is self-contained: all types are defined in `text_finder.rs` and
wired together in `main()`.

---

## Command Line Options

| Option | Meaning | Default |
|--------|---------|---------|
| `/P <path>` | Root path for search | `"."` (current directory) |
| `/p <exts>` | Comma-separated file extensions to search | *(all files)* |
| `/s` | Recurse into subdirectories | `"true"` |
| `/H` | Hide directories with no matching files | `"true"` |
| `/r <regex>` | Regular expression to match against file content | `"."` (matches all) |
| `/v` | Verbose: display all option values before searching | *(off)* |
| `/h` | Display help message and exit | *(off)* |

The `target` directory is always excluded from traversal regardless of command
line arguments.

---

## Dependencies (Cargo.toml)

```toml
dir_nav_lib = { package = "rust_dir_nav", path = "../RustDirNav" }
cmd_line_lib = { package = "rust_cmd_line", path = "../RustCmdLine" }
regex = "1.7.0"
```

---

## Struct `TextFinder`

```rust
#[derive(Debug, Default)]
pub struct TextFinder {
    re_str:   String,
    last_dir: String,
}
```

Searches the content of a single file for a regex match.

### Fields (private)

| Field | Type | Purpose |
|-------|------|---------|
| `re_str` | `String` | Current regular expression string |
| `last_dir` | `String` | Directory path of the last file that produced a match |

### Public Methods

#### `new() -> TextFinder`

Creates a new `TextFinder` with empty `re_str` and `last_dir`.

#### `regex(&mut self, s: &str)`

Sets `re_str` to `s`. Must be called before `find()`.

#### `get_regex(&self) -> &str`

Returns a reference to the current regex string.

#### `find(&self, file_path: &str) -> bool`

Attempts to read the file at `file_path` and tests whether its content matches
`re_str`.

**Algorithm:**
1. Try `std::fs::read_to_string(file_path)`.
2. On failure, fall back to `std::fs::read()` and convert bytes to a lossy
   UTF-8 string.
3. If both reads fail, return `false`.
4. Compile `re_str` with `regex::Regex::new()`. Return `false` if compilation
   fails.
5. Return `re.is_match(&contents)`.

### Private Methods

#### `last_path(&mut self, p: &str)`

Stores `p` as the last matched directory path. Called by `TfAppl::do_file()`
to track whether the current directory has already been printed.

#### `get_last_path(&self) -> &str`

Returns a reference to the last stored path.

---

## Struct `TfAppl`

```rust
#[derive(Debug, Default)]
pub struct TfAppl {
    tf:       TextFinder,
    curr_dir: String,
    hide:     bool,
    recurse:  bool,
}
```

Application-specific proxy for `TextFinder`. Implements `dir_nav_lib::DirEvent`
so it can be used as the generic parameter of `DirNav<TfAppl>`.

### Fields (private)

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `tf` | `TextFinder` | default | Performs file content matching |
| `curr_dir` | `String` | `""` | Path of the directory most recently received via `do_dir` |
| `hide` | `bool` | `false` | Whether to suppress directories until a match is found |
| `recurse` | `bool` | `false` | Stored for reference; actual recursion is controlled by `DirNav` |

### `DirEvent` Implementation

#### `do_dir(&mut self, d: &str)`

Saves `d` as `curr_dir`. If `hide` is `false`, prints the directory name
immediately.

#### `do_file(&mut self, f: &str)`

Builds the fully qualified file path by joining `curr_dir` and `f` with `'/'`.
Calls `tf.find()` on that path. On a match:
- If `hide` is `true` and `curr_dir` differs from `tf.get_last_path()`,
  prints the directory name and updates `tf.last_path`.
- Prints the matched filename.

### Public Methods

#### `new() -> Self`

Creates a new `TfAppl` with `hide` and `recurse` set to `true`.

#### `recurse(&mut self, p: bool)` / `get_recurse(&self) -> bool`

Setter and getter for `recurse`. Stored locally for reference; the actual
recursion decision is made by `DirNav`.

#### `hide(&mut self, p: bool)` / `get_hide(&self) -> bool`

Setter and getter for `hide`. Controls whether `do_dir` prints the directory
immediately or defers until the first match.

#### `regex(&mut self, s: &str)` / `get_regex(&self) -> &str`

Delegates to the embedded `TextFinder`.

---

## Private Free Functions

### `verbose(parser: &cmd_line_lib::CmdLineParse)`

Prints the application title and version. If option `/v` is present, prints all
options (path, patterns, regex, and every key-value pair in the options map).
Otherwise prints a brief one-line summary of path, patterns, and regex.

### `help() -> String`

Builds and returns a formatted help string listing all supported options with
their default values. Called when `/h` is present on the command line.

---

## `main()`

**Flow:**

1. Create `CmdLineParse`, call `default_options()` then `parse()`.
2. If `/h` is present, print the help string and return.
3. Create `DirNav::<TfAppl>::new()` and immediately call `add_skip("target")`
   to exclude Cargo build output directories.
4. If `/s` is present, set `DirNav::recurse` and `TfAppl::recurse` from its
   value (`"true"` → `true`). Otherwise set both to `false`.
5. If `/H` is present, set `DirNav::hide` and `TfAppl::hide` from its value.
   Otherwise set both to `true`.
6. Set `TfAppl` regex from `parser.get_regex()`.
7. For each pattern in `parser.patterns()`, call `dn.add_pat(patt)`.
8. Build a `PathBuf` from `parser.abs_path()`.
9. Call `verbose(&parser)` to display search parameters.
10. Call `dn.visit(&p)`, discarding any error return.
11. Print total file and directory counts.

---

## Behaviour Summary / Invariants

1. The `target` directory is always excluded regardless of command line input.
2. `TfAppl::hide` and `DirNav::hide` are set to the same value; `DirNav`
   controls which directories are passed to `do_dir`, and `TfAppl::hide`
   controls whether `do_dir` prints immediately or waits for a match.
3. `TextFinder::find()` never panics; all error paths return `false`.
4. If `/p` is absent, `pats` remains empty and `DirNav` passes every file to
   `do_file`.
5. If `/r` is absent, the default regex `"."` matches every non-empty file.
6. The regex is compiled on every `find()` call; there is no pre-compilation
   step.
