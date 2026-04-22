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

Initialises `match_all_` to `true` and pre-compiles `regex_` with the default
pattern `"."`.

### Configuration Methods

```cpp
void set_regex(const std::string& pattern);
void set_hide(bool h);
```

`set_regex()` sets `match_all_ = (pattern == ".")`, then attempts
`regex_.emplace(pattern)`.  On `std::regex_error` the stored regex is reset and
`match_all_` is forced back to `true` so the match-all fast path remains active.

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

1. Builds the full file path from `current_dir_` and `file_name` using
   `std::filesystem::path::operator/`.
2. Calls the internal `find()` method.
3. On a match:
   - If `hide_` is `true` and the directory header has not yet been printed,
     print the directory path now and set `dir_printed_ = true`.
   - Print the matched filename (indented) and flush `std::cout`.
4. Increments `match_count_`.

Every write to `std::cout` is followed by `std::flush` or `std::endl` so output
appears on the console immediately.

### Internal Method

#### `find(const std::filesystem::path& file_path) → bool`  *(private const)*

1. If `match_all_` is `true`, return `true` immediately — the match-all fast
   path; no file is opened or read.
2. If `regex_` is empty (`std::nullopt`), return `false`.
3. Attempt a text read via `std::ifstream` into a `std::string` using
   `oss << ifs.rdbuf()`.
4. If the text read fails, retry with `std::ios::binary` mode (keeps non-UTF-8
   bytes as-is).
5. If both reads fail, return `false`.
6. Return `std::regex_search(contents, *regex_)`.  The `std::regex` object is
   compiled once in `set_regex()` and stored in `regex_`; it is not recompiled
   on every `on_file()` invocation.
7. Any exception from file I/O or `std::regex_search` is caught by a top-level
   `try/catch (...)` that returns `false`.

### Counters

```cpp
std::size_t match_count() const;
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

- `find()` never throws; all exceptions from `std::ifstream` and
  `std::regex_search` are caught and treated as non-match.
- A directory header is printed at most once per `visit()` call.
- If `set_regex()` is never called, the default pattern `"."` sets
  `match_all_ = true`, triggering the match-all fast path — no file is read
  at all.

---

*End of Output/Spec.md*
