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

DirNav does **not** define any abstract base class or interface.  There is no
`DirEvent` type.  Libraries that want to receive events (e.g. Output) expose
plain methods; EntryPoint wires them via lambdas.

---

## Class `DirNav`

### Constructor

```cpp
explicit DirNav(bool recurse = true);
```

### Default Skip List

The following directory names are always skipped, regardless of any
`add_skip()` calls:

```cpp
{"target", "build", ".git"}
```

These are initialised in the constructor and cannot be removed.

### Configuration Methods

```cpp
void set_dir_handler(DirCallback cb);
void set_file_handler(FileCallback cb);
void add_pattern(const std::string& ext);        // e.g. "cpp", "h"
void add_skip(const std::string& name);          // add one name to skip list
void set_recurse(bool r);
```

`add_skip()` appends to the skip list; it may be called any number of times.
Each call adds exactly one name.  Names are matched against the bare directory
name (not a full path), case-sensitively.

The internal skip list is a `std::set<std::string>` so duplicate entries are
silently ignored.

### Walk Method

```cpp
bool visit(const std::filesystem::path& root);
```

Returns `true` on success, `false` if the root path does not exist or is not a
directory.  Reports total files visited and directories entered via internal
counters accessible through:

```cpp
size_t file_count() const;
size_t dir_count() const;
```

### Walk Algorithm

1. Check `root` exists and is a directory; return `false` otherwise.
2. Invoke `dir_callback` with the normalised `root` path string.
3. Iterate entries in `root`:
   - If entry is a regular file and its extension matches any pattern (or the
     pattern list is empty), invoke `file_callback` with `entry.filename()`.
   - If entry is a directory, check its bare name against the skip list.  If
     the name is **not** in the skip list, and `recurse` is `true`, recurse.
4. Path separators are normalised to `'/'` before passing to callbacks.

<!-- INPUT NEEDED: Specify sort order of directory entries — alphabetical,
     filesystem order, or no guarantee. -->

---

## Patterns

- Extensions are stored without a leading dot: `"cpp"`, `"h"`, `"txt"`.
- Matching is case-insensitive on Windows, case-sensitive on Linux/macOS.

<!-- INPUT NEEDED: Confirm case sensitivity preference, or make it a runtime
     option. -->

---

## Invariants

- `visit()` never throws; filesystem errors on individual entries are caught and
  the entry is skipped.
- If `add_pattern()` is never called, all files are passed to `file_callback`.
- The default skip list (`target`, `build`, `.git`) is always active; callers
  may extend it with `add_skip()` but may not shrink it.
- `add_skip()` is idempotent: adding the same name twice has no effect.

---

*End of DirNav/Spec.md*
