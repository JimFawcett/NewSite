# Spec.md — PyTextFinder/DirNav

*Specifies the directory navigation library.*

---

## Responsibility

DirNav walks a directory tree depth-first and fires an event for each directory
entered and each qualifying file found.  It has no knowledge of regex, output
formatting, or command-line syntax.

---

## Source File

```
DirNav/
└── dir_nav.py
```

---

## Callables

DirNav fires two caller-supplied callables; it has no knowledge of who registers
them or what they do.  The caller (EntryPoint) owns both the callables and the
objects they close over.

```python
dir_handler:  Optional[Callable[[str], None]] = None
file_handler: Optional[Callable[[str], None]] = None
```

DirNav does **not** define any abstract base class.  Libraries that want to
receive events (e.g. Output) expose plain methods; EntryPoint wires them via
lambda expressions or direct method references.

---

## Class `DirNav`

### Constructor

```python
def __init__(self, recurse: bool = True) -> None
```

### Default Skip List

The following directory names are always skipped, stored in `_DEFAULT_SKIPS`
as a `frozenset[str]`:

| Language / tool | Skipped names |
|-----------------|---------------|
| C# / .NET       | `bin`, `obj` |
| Rust            | `target` |
| C++             | `build`, `out` |
| Python          | `__pycache__`, `.venv`, `venv`, `dist` |
| VCS / IDE       | `.git`, `.vs`, `.idea` |

These are copied into a mutable `set[str]` in the constructor and cannot be
removed.

### Configuration

```python
dir_handler:  Optional[Callable[[str], None]]  # set directly
file_handler: Optional[Callable[[str], None]]  # set directly
def add_pattern(self, ext: str) -> None        # e.g. "py", "txt"
def add_skip(self, name: str) -> None          # add one name to skip list
def set_recurse(self, r: bool) -> None
```

`add_skip()` appends to the skip list; it may be called any number of times.
Names are matched against the bare directory name (not a full path).

The internal skip list is a `set[str]` so duplicate entries are silently
ignored.

### Walk Method

```python
def visit(self, root: str) -> bool
```

Returns `True` on success, `False` if the root path does not exist or is not a
directory.  Counters are reset at the start of each `visit()` call.

```python
@property
def file_count(self) -> int
@property
def dir_count(self) -> int
```

### Walk Algorithm

1. Check `root` exists and is a directory; return `False` otherwise.
2. Reset `_file_count` and `_dir_count` to zero.
3. Call `_visit_impl(root)`.

#### `_visit_impl(dir_path)`

1. Increment `_dir_count`.
2. Invoke `dir_handler` with the normalised `dir_path` (backslashes → `/`).
3. Call `os.scandir(dir_path)` (catches `OSError`; returns on error).
4. For each entry:
   - If it is a file and its extension matches any pattern (or the pattern
     list is empty), increment `_file_count` and invoke `file_handler` with
     `entry.name` (bare filename only).
   - If it is a directory, check its bare name against the skip list.
     If **not** in the skip list and `_recurse` is `True`, recurse.

---

## Patterns

- Extensions are stored without a leading dot and in lowercase: `"py"`, `"txt"`.
- Matching strips the leading dot from `os.path.splitext` before comparing.
- Matching is case-insensitive (patterns stored lowercased; extension
  lowercased before comparison).

---

## Invariants

- `visit()` never throws; filesystem errors on individual entries are caught and
  the entry is skipped.
- If `add_pattern()` is never called, all files are passed to `file_handler`.
- The default skip list is always active; callers may extend it with
  `add_skip()` but may not shrink it.
- `add_skip()` is idempotent: adding the same name twice has no effect.

---

*End of Spec.md*
