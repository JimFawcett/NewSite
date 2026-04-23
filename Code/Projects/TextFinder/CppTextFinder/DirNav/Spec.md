# Spec.md — DirNav

*Specifies the directory navigation library.*

---

## Responsibility

DirNav walks a directory tree depth-first and fires an event for each directory
entered and each qualifying file found.  It has no knowledge of regex, output
formatting, or command-line syntax.

---

## Source Files

```
DirNav/src/
├── DirNav.ixx      ← export module dir_nav;
└── test.cpp
```

---

## Callbacks

DirNav fires two caller-supplied `std::function` callbacks; it has no knowledge
of who registers them or what they do.  The caller (EntryPoint) owns both the
functions and the objects they close over.

```cpp
using DirCallback  = std::function<void(const std::string& dir_path)>;
using FileCallback = std::function<void(const std::string& file_name)>;
```

DirNav does **not** define any abstract base class or interface.  Libraries that
want to receive events (e.g. Output) expose plain methods; EntryPoint wires them
via lambdas.

---

## Class `DirNav`

### Constructor

```cpp
explicit DirNav(bool recurse = true);
```

### Default Skip List

The following directory names are always skipped, regardless of any
`add_skip()` calls:

| Language / tool | Skipped names |
|-----------------|---------------|
| C# / .NET       | `bin`, `obj` |
| Rust            | `target` |
| C++             | `build`, `out` |
| Python          | `__pycache__`, `.venv`, `venv`, `dist` |
| VCS / IDE       | `.git`, `.vs`, `.idea` |
| Archives        | `archive` |

These are initialised in the constructor and cannot be removed.

### Configuration Methods

```cpp
void set_dir_handler(DirCallback cb);
void set_file_handler(FileCallback cb);
void add_pattern(const std::string& ext);   // e.g. "cpp", "h"
void add_skip(const std::string& name);     // add one name to skip list
```

`add_skip()` appends to the skip list; it may be called any number of times.
Each call adds exactly one name.  Names are matched against the bare directory
name (not a full path), case-sensitively.

Recurse is set once at construction and cannot be changed afterwards.

The internal skip list is a `std::unordered_set<std::string>` so duplicate
entries are silently ignored.

### Walk Method

```cpp
bool visit(const std::filesystem::path& root);
```

Returns `true` on success, `false` if the root path does not exist or is not a
directory.  Counters are reset at the start of each `visit()` call.

```cpp
std::size_t file_count() const;
std::size_t dir_count() const;
```

`file_count()` counts only files that passed the extension filter and were
dispatched to `file_callback_`; it does **not** count files that were skipped
due to a pattern mismatch.

### Walk Algorithm

`visit(root)`:
1. Check `root` exists and is a directory; return `false` otherwise.
2. Reset `file_count_` and `dir_count_` to zero.
3. Call the private `visit_impl(root)`.

`visit_impl(dir)`:
1. Increment `dir_count_`.
2. Invoke `dir_callback_` with `dir.generic_string()` (forward-slash separators).
3. Open a `std::filesystem::directory_iterator` on `dir`; return on error.
4. Iterate entries in a single loop, collecting subdirectories for deferred
   recursion:
   - If the entry is a regular file and its extension matches any pattern (or
     the pattern list is empty), increment `file_count_` and invoke
     `file_callback_` with `entry.path().filename().generic_string()`.
   - If the entry is a directory and its bare name is **not** in the skip list
     and `recurse_` is `true`, append `entry.path()` to a local
     `std::vector<std::filesystem::path> subdirs`.
5. After the loop, recurse into each path in `subdirs` by calling
   `visit_impl()`. All files in the current directory are dispatched before any
   subdirectory is entered.

---

## Patterns

- Extensions are stored without a leading dot and lowercased on Windows:
  `"cpp"`, `"h"`, `"txt"`.
- `add_pattern()` strips the leading dot (if present) and lowercases on Windows
  before inserting into the internal `std::unordered_set<std::string>`.
- Matching compares the normalised extension of each file against the set in
  O(1) time.

---

## Invariants

- `visit()` never throws; filesystem errors on individual entries are caught and
  the entry is skipped.
- If `add_pattern()` is never called, all files are passed to `file_callback_`.
- The default skip list (see table above) is always active; callers may extend
  it with `add_skip()` but may not shrink it.
- `add_skip()` is idempotent: adding the same name twice has no effect.

---

*End of DirNav/Spec.md*
