# RustDirNav_Spec.md - Directory navigator

**Crate:** `rust_dir_nav` v1.1.0
**Library name:** `dir_nav_lib`
**Source:** `src/dir_nav_lib.rs`
**Author:** Jim Fawcett

---

## Purpose

`dir_nav_lib` walks a directory tree and dispatches file and directory names to a
caller-supplied application type. The application type implements the `DirEvent`
trait to define what to do with each discovered file and directory. The navigator
supports pattern filtering by file extension, a skip list of directory names to
exclude from traversal, optional recursion, and optional hiding of directories
that contain no matching files.

---

## Private Type Alias

```rust
type SearchPatterns = Vec<std::ffi::OsString>;
```

Used internally to store file-extension search patterns. Not part of the public API.

---

## Trait `DirEvent`

```rust
pub trait DirEvent {
    fn do_dir(&mut self, d: &str);
    fn do_file(&mut self, f: &str);
}
```

Must be implemented by the `App` type passed to `DirNav<App>`.

| Method | Called when |
|--------|-------------|
| `do_dir(&mut self, d: &str)` | A directory is selected for display (see `hide` behaviour below) |
| `do_file(&mut self, f: &str)` | A file whose extension matches a search pattern is found (or when no patterns are set) |

---

## Struct `DirNav<App>`

```rust
#[derive(Debug, Default)]
pub struct DirNav<App: DirEvent> {
    pats:      SearchPatterns,
    skip_dirs: SearchPatterns,
    app:       App,
    num_file:  usize,
    num_dir:   usize,
    recurse:   bool,
    hide:      bool,
}
```

### Fields (private)

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `pats` | `SearchPatterns` | empty | File extensions to match |
| `skip_dirs` | `SearchPatterns` | see below | Directory names to exclude from traversal |
| `app` | `App` | `App::default()` | Caller-supplied event handler |
| `num_file` | `usize` | `0` | Running count of all files encountered |
| `num_dir` | `usize` | `0` | Running count of all directories entered |
| `recurse` | `bool` | `true` | Whether to descend into subdirectories |
| `hide` | `bool` | `true` | Whether to suppress directories with no matching files |

`App` must implement both `DirEvent` and `Default`.

---

### Construction

#### `new() -> Self`

Creates a new `DirNav<App>` with:
- empty patterns vector,
- `skip_dirs` pre-populated with the default skip list (see table below),
- `app` initialised via `App::default()`,
- `num_file` and `num_dir` set to `0`,
- `recurse` set to `true`,
- `hide` set to `true`.

**Default skip list** — these directory names are always excluded from traversal;
callers may extend the list with `add_skip()` but may not remove entries:

| Language / tool | Skipped names |
|-----------------|---------------|
| C# / .NET       | `bin`, `obj` |
| Rust            | `target` |
| C++             | `build`, `out` |
| Python          | `__pycache__`, `.venv`, `venv`, `dist` |
| VCS / IDE       | `.git`, `.vs`, `.idea` |
| Archives        | `archive` |

---

### Configuration Methods

#### `recurse(&mut self, p: bool)`

Sets whether `visit()` descends into subdirectories.
- `true` (default): full depth-first traversal.
- `false`: only the directory passed to `visit()` is examined.

#### `hide(&mut self, p: bool)`

Controls whether directories with no matching files are passed to `app.do_dir()`.
- `true` (default): `do_dir` is called only for directories that contain at least one matching file.
- `false`: `do_dir` is called for every directory entered.

---

### Skip Methods

#### `add_skip<S: Into<String>>(&mut self, s: S) -> &mut DirNav<App>`

Appends directory name `s` to the skip list. Accepts any type that converts into
`String` (`&str`, `String`, or `&String`). Duplicates are not filtered.
Returns `&mut Self` to allow method chaining.

During `visit()`, any subdirectory whose **last path component** matches an entry
in `skip_dirs` is silently excluded — it is never entered and its files are
neither counted nor dispatched.

---

### Pattern Methods

#### `add_pat<S: Into<String>>(&mut self, p: S) -> &mut DirNav<App>`

Appends extension `p` to the patterns vector. Accepts any type that converts into
`String` (`&str`, `String`, or `&String`). Duplicates are not filtered.
Returns `&mut Self` to allow method chaining.

#### `get_patts(&self) -> &SearchPatterns`

Returns an immutable reference to the patterns vector.
Patterns are plain extension strings with no leading `"*."`,
stored as `OsString` values.

---

### Accessor Methods

#### `get_dirs(&self) -> usize`

Returns the total number of directories entered since construction or the last
`clear()` call. Every directory passed to `visit()` — including subdirectories
found during recursion — is counted, regardless of whether it contained matching
files.

#### `get_files(&self) -> usize`

Returns the total number of files encountered (across all extensions) since
construction or the last `clear()`. Files are counted whether or not their
extension matches a pattern.

#### `get_app(&mut self) -> &mut App`

Returns a mutable reference to the embedded `App` instance. Use this to retrieve
any results that `App` accumulated during traversal.

---

### Reset Method

#### `clear(&mut self)`

Resets the navigator to a clean state:
- clears the patterns vector,
- resets `num_dir` and `num_file` to `0`,
- replaces `app` with `App::default()`.

`recurse`, `hide`, and `skip_dirs` are **not** reset.

---

### Traversal Method

#### `visit(&mut self, dir: &Path) -> io::Result<()>`

Performs a depth-first search of the directory tree rooted at `dir`.

**Algorithm:**

1. Increment `num_dir`.
2. Convert `dir` to a path string with forward slashes via `replace_sep()`.
3. If `dir` is not a directory, return `Err(ErrorKind::Other, "not a directory")`.
4. Read all entries in `dir` using the cached file type from `DirEntry::file_type()`
   (no extra `stat` syscall per entry):
   - Sub-directories whose last name component appears in `skip_dirs` are
     silently ignored. All others are collected into a local vector.
   - For each regular file whose extension matches a pattern in `pats`, or when
     `pats` is empty: increment `num_file` and add the filename to a local files
     vector. Files that do not match are neither counted nor dispatched.
5. If the local files vector is non-empty **or** `hide` is `false`, call
   `app.do_dir()` with the directory path string.
6. Call `app.do_file()` for each file in the files vector.
7. If `recurse` is `true`, call `visit()` recursively for each sub-directory.
8. Return `Ok(())`.

**Notes:**
- Directory order within a level is determined by the OS (`fs::read_dir`).
- `visit()` may be called multiple times; counters and `app` accumulate across
  calls until `clear()` is invoked.

---

### Helper Methods (public but implementation-detail)

#### `replace_sep(&self, path: &Path) -> OsString`

Converts `path` to a string and replaces every `\` with `/`.
Returns the result as an `OsString`. Used internally to normalise Windows paths
before passing them to `app.do_dir()`.

#### `in_patterns(&self, d: &DirEntry) -> bool`

Returns `true` if the extension of `d`'s path is present in `pats`.
Returns `false` if the file has no extension or the extension is not in `pats`.

---

## Behaviour Summary / Invariants

1. `App` must implement both `DirEvent` and `Default`; `Default` is used by `new()`
   and `clear()`.
2. When `pats` is empty, every file triggers `app.do_file()`.
3. `num_file` counts only files that match a pattern (or all files when `pats` is
   empty); unmatched files are neither counted nor forwarded to `app.do_file()`.
4. `num_dir` counts every directory entered, including those suppressed by `hide`;
   skipped directories (in `skip_dirs`) are never entered and are not counted.
5. `clear()` resets patterns and counters but preserves `recurse`, `hide`, and
   `skip_dirs`.
6. `visit()` returns an error only if the top-level path is not a directory;
   errors reading individual entries propagate via the `?` operator.
7. The library has no external crate dependencies; it uses only `std::fs`,
   `std::io`, and `std::path`.

---

## Test Module

Three `#[cfg(test)]` tests:

| Test | Purpose |
|------|---------|
| `test_setup` | Creates `./test_dir` and a small sub-tree of test files |
| `test_walk` | Verifies that `visit()` finds the expected files by name in `rslt_store` |
| `test_patts` | Verifies `add_pat()` accumulates patterns and `clear()` removes them |

Run with `cargo test -- --test-threads=1` to ensure `test_setup` completes before
`test_walk`.
