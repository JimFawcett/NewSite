# Spec.md — PyTextFinder/Output

*Specifies the output formatting library.*

---

## Responsibility

Output receives directory and file events from DirNav (via callables registered
by EntryPoint) and decides what to print and when.  It also performs the regex
match against file content.

Output has no knowledge of command-line parsing or directory traversal
mechanics.

---

## Source File

```
Output/
└── output.py
```

---

## Class `Output`

Output is a standalone class.  It does **not** implement any DirNav interface.
EntryPoint registers its methods as DirNav callables using lambda expressions
or direct method references.

### Constructor

```python
def __init__(self, hide: bool = True) -> None
```

### Configuration

```python
def set_regex(self, pattern: str) -> None   # invalid regex falls back to "."
def set_hide(self, hide: bool) -> None
```

### Public Event Methods

These are plain methods.  EntryPoint passes them to DirNav:

```python
# in PyTextFinder.py:
dn.dir_handler  = out.on_dir
dn.file_handler = out.on_file
```

#### `on_dir(dir_path: str) -> None`

Saves `dir_path` as the current directory and clears the "directory already
printed" flag.

- **`hide = False`**: prints the directory path immediately and flushes
  `sys.stdout`.  The user sees each directory as it is entered, providing
  real-time traversal progress even when no files match.
- **`hide = True`**: does not print yet; the directory header is deferred until
  the first matching file is found in that directory.

#### `on_file(file_name: str) -> None`

1. Builds the full file path: `current_dir + "/" + file_name`.
2. Calls the internal `_find()` method.
3. On a match:
   - If `hide` is `True` and the directory header has not yet been printed,
     print the directory path now and set the "already printed" flag.
   - Print the matched filename (indented) and flush `sys.stdout`.
4. Increments the internal match counter.

Every write to `sys.stdout` is followed by `sys.stdout.flush()` so output
appears on the console immediately.

### Internal Methods

#### `_read_file(file_path: str) -> str | None`

Tries to open and read `file_path` as text, returning the full contents as a
`str` or `None` on failure.

1. Try `open(file_path, "r", encoding="utf-8")`.
2. On `UnicodeDecodeError`, try `open(file_path, "r", encoding="latin-1")`
   (lossless for arbitrary binary content).
3. On `OSError` (permissions, missing file), return `None` immediately without
   retrying.
4. If both encodings fail, return `None`.

#### `_find(file_path: str) -> bool`

1. If `self._regex.pattern == "."`, return `True` immediately — the match-all
   fast path; no file is opened or read.
2. Call `_read_file(file_path)`. If it returns `None`, return `False`.
3. Return `bool(self._regex.search(contents))`.

The compiled `re.Pattern` object is cached after `set_regex()` is called; it
is not recompiled on every `on_file()` invocation.

### Counter

```python
@property
def match_count(self) -> int
```

Returns the number of files that matched the regex.

---

## Output Format

```
  <directory_path>
      <matched_filename>
      <matched_filename>
  <directory_path>
      <matched_filename>
```

- Directory lines: 2-space leading indent.
- File lines: 6-space leading indent.

---

## Invariants

- `_find()` never throws; all exceptions from file I/O and `re` compilation
  are caught and treated as non-match.
- A directory header is printed at most once per `visit()` call.
- If `set_regex()` is never called, the default pattern `"."` triggers the
  match-all fast path in `_find()` — no file is read at all.

---

*End of Spec.md*
