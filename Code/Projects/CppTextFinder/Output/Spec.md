# Spec.md — Output

*Specifies the output formatting library.*

---

## Responsibility

Output receives directory and file events from DirNav (via `std::function`
callbacks registered by EntryPoint) and decides what to print and when.  It
also performs the regex match against file content.

Output has no knowledge of command-line parsing or directory traversal
mechanics.

---

## Source Files

```
Output/src/
├── Output.ixx      ← export module output;
└── test.cpp
```

---

## Class `Output`

Output is a standalone class.  It does **not** inherit from any DirNav type.
EntryPoint registers its methods as callbacks on DirNav using lambdas.

### Constructor

```cpp
explicit Output(bool hide = true);
```

### Configuration Methods

```cpp
void set_regex(const std::string& pattern);
void set_hide(bool h);
```

### Public Event Methods

These are plain methods.  EntryPoint passes them to DirNav via lambdas:

```cpp
// in main.cpp:
dn.set_dir_handler( [&out](const std::string& d){ out.on_dir(d);  });
dn.set_file_handler([&out](const std::string& f){ out.on_file(f); });
```

#### `on_dir(const std::string& dir_path)`

Saves `dir_path` as the current directory and clears the "directory already
printed" flag.

- **`hide = false`**: prints the directory path immediately and flushes
  `std::cout`.  The user sees each directory as it is entered, providing
  real-time traversal progress even when no files match.
- **`hide = true`**: does not print yet; the directory header is deferred until
  the first matching file is found in that directory.

#### `on_file(const std::string& file_name)`

1. Builds the full file path: `current_dir + "/" + file_name`.
2. Calls the internal `find()` method.
3. On a match:
   - If `hide` is `true` and the directory header has not yet been printed,
     print the directory path now and set the "already printed" flag.
   - Print the matched filename (indented) and flush `std::cout`.
4. Increments internal match counter.

Every write to `std::cout` is followed by `std::flush` (or uses `std::endl`)
so output appears on the console immediately rather than waiting for the stream
buffer to fill.

### Internal Method

#### `find(const std::string& file_path) -> bool`

1. Attempt `std::ifstream` read of the entire file into a `std::string`.
2. If the file cannot be read as text, attempt a binary read and reinterpret
   as a string (lossy; non-UTF-8 bytes are kept as-is).
3. If both reads fail, return `false`.
4. Compile `regex_pattern` with `std::regex`; return `false` on compile error.
5. Return `std::regex_search(contents, re)`.

<!-- INPUT NEEDED: Decide whether the regex should be pre-compiled once (stored
     as std::regex member) or compiled on each do_file call.  Pre-compiling is
     more efficient but requires re-compiling whenever set_regex() is called. -->

### Counters

```cpp
size_t match_count() const;
```

Returns the number of files that matched the regex.

<!-- INPUT NEEDED: Decide whether Output or EntryPoint owns the responsibility
     for printing the final summary line (files visited, matches found). -->

---

## Output Format

```
  <directory_path>
      <matched_filename>
      <matched_filename>
  <directory_path>
      <matched_filename>
```

- Directory lines: no leading indent.
- File lines: indented by 4 spaces (or a tab).

<!-- INPUT NEEDED: Adjust indentation, separator lines, or colour/ANSI codes
     if desired. -->

---

## Invariants

- `find()` never throws; all exceptions from `std::ifstream` and `std::regex`
  are caught and treated as non-match.
- A directory header is printed at most once per `visit()` call.
- If `set_regex()` is never called, the default pattern `"."` matches every
  non-empty file.

---

*End of Output/Spec.md*
