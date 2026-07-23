# RustCmdLine_Spec.md - Command line parser

**Crate:** `rust_cmd_line` v1.1.0
**Library name:** `cmd_line_lib`
**Source:** `src/cmd_line_lib.rs`
**Author:** Jim Fawcett

---

## Purpose

`cmd_line_lib` parses a program's console command line into an options map and a
patterns vector. It is designed to be constructed once, optionally pre-populated
with defaults, parsed from `std::env::args()`, and then passed (or borrowed) by
any code that needs option values.

---

## Command Line Format

```
/P "." /p "rs,txt" /s /r "abc" /H /h
```

- Every option begins with `/` or `-` followed by a single ASCII character key.
- If the token immediately after an option key does **not** start with `/` or `-`, that
  token is the option's value.
- If the next token **does** start with `/` or `-`, or the option key is the last token,
  the value is automatically set to `"true"`.
- The `/p` option is special: its value is a comma-separated list that is split
  into individual strings and stored in the patterns vector.

### Built-in option keys

| Key | Meaning | Default (via `default_options`) |
|-----|---------|--------------------------------|
| `P` | Root search path (relative or absolute) | `"."` |
| `p` | Comma-separated file-extension patterns | *(none)* |
| `s` | Recurse directory tree | `"true"` |
| `r` | Regular expression for content matching | `"."` (matches all) |
| `H` | Hide directories with no matching files | `"true"` |
| `h` | Display help message | *(no default)* |
| `v` | Verbose: print all option values before searching | *(no default)* |

Custom single-character option keys are supported for application-specific use.

---

## Public Type Aliases

```rust
pub type Options          = HashMap<char, String>;
pub type CmdLinePatterns  = Vec<String>;
```

---

## Free Function

### `show_cmd_line()`

```rust
pub fn show_cmd_line()
```

Prints every command line argument to stdout.
- Argument 0 (the program path) is printed as a quoted string on its own line.
- Arguments 1..n are printed quoted and space-separated on the same following line,
  with no trailing space after the last argument.
- No newline is appended after the last argument.

---

## Struct `CmdLineParse`

```rust
#[derive(Debug, Default)]
pub struct CmdLineParse {
    opt_map  : Options,
    patterns : CmdLinePatterns,
    help_str : String,
}
```

### Construction

#### `new() -> Self`

Creates a new `CmdLineParse` with:
- an empty `Options` map,
- an empty `CmdLinePatterns` vector,
- `help_str` initialised to the built-in help text (see `help()`).

The options map is **not** pre-populated; call `default_options()` afterward if
defaults are wanted before parsing.

---

### Parsing

#### `parse(&mut self)`

Reads `std::env::args()` and populates `opt_map` and `patterns`.

**Algorithm:**

1. Collect all arguments into a `Vec<String>`, skip index 0 (program name).
2. For each argument at index `i`:
   - If it starts with `/` or `-`:
     - Key = second byte cast to `char`.
     - If `i` is not the last argument **and** `args[i+1]` does not start with `/` or `-`:
       value = `args[i+1]`.
     - Otherwise: value = `"true"`.
     - Insert `(key, value)` into `opt_map`, overwriting any previous entry.
3. After the loop, if key `'p'` exists in `opt_map`:
   - Split its value on `','`.
   - Call `add_pattern()` for each piece.

**Notes:**
- Existing entries in `opt_map` (e.g. from `default_options()`) are overwritten
  by parsed values.
- `parse()` may be called more than once; each call re-reads `std::env::args()`
  and merges results into `opt_map`.

---

### Path Methods

#### `path(&self) -> String`

Returns the value stored under key `'P'` in `opt_map`, or `"."` if the key is
absent. The returned `String` is a clone.

#### `abs_path(&self) -> String`

Converts the relative path returned by `path()` to an absolute, canonical path.

- Calls `std::fs::canonicalize()`.
- On success, normalises the path string:
  - If the string contains `\\` (Windows UNC prefix `\\?\`), replaces all `\\`
    with `/` and strips the first 4 characters.
  - Returns the resulting `String`.
- On failure (path does not exist, permissions error, etc.), returns the
  `std::io::Error` description string.

#### `set_path(&mut self, p: &str)`

Inserts or overwrites key `'P'` in `opt_map` with `p`.

---

### Regex Methods

#### `set_regex(&mut self, re: &str)`

Inserts or overwrites key `'r'` in `opt_map` with `re`.

#### `get_regex(&self) -> &str`

Returns a reference to the value stored under `'r'`, or `"."` if absent.

---

### Option Map Methods

#### `default_options(&mut self)`

Populates `opt_map` with four baseline entries:

| Key | Value |
|-----|-------|
| `P` | `"."` |
| `s` | `"true"` |
| `r` | `"."` |
| `H` | `"true"` |

Existing keys are overwritten.

#### `contains_option(&self, opt: char) -> bool`

Returns `true` if `opt` is a key in `opt_map`, otherwise `false`.

#### `add_option(&mut self, o: char, v: &str)`

Inserts `(o, v)` into `opt_map`. If `o` already exists its value is replaced.

#### `value(&self, opt: char) -> &str`

Returns a reference to the value for key `opt`.
**Panics** if `opt` is not present in `opt_map`. Callers must guard with
`contains_option()` before calling.

#### `options(&self) -> &Options`

Returns an immutable reference to the entire options map.

---

### Pattern Methods

#### `add_pattern(&mut self, p: &str) -> &mut Self`

Appends `p` to the patterns vector only if it is not already present
(case-sensitive equality check). Returns `&mut Self` to allow method chaining.

#### `patterns(&self) -> &CmdLinePatterns`

Returns an immutable reference to the patterns vector.
Patterns are plain file-extension strings with no leading `"*."`.

---

### Help Methods

#### `help(&self) -> &str`

Returns a reference to the current help string. The built-in default is:

```
\n  Help:\n  Options: /P . /p "rs,txt" /s /r "abc" /H /h
```

#### `replace_help(&mut self, s: &str)`

Replaces `help_str` with `s`. Use this to provide an application-specific help
message before calling `help()` or displaying it to the user.

---

## Private Helpers (not part of the public API)

| Function | Behaviour |
|----------|-----------|
| `is_opt(&self, s: &str) -> bool` | Returns `true` if the first byte of `s` is `'/'` or `'-'`. Panics on empty string. |
| `help_txt() -> String` | Returns the built-in default help text string used by `new()`. |
| `replace_sep(path: &str) -> String` | If the path string contains a backslash character, replaces every `\` with `/` and removes the first 4 characters (strips the Windows `\\?\` UNC prefix produced by `canonicalize`). |

---

## Behaviour Summary / Invariants

1. `opt_map` may hold any single-char key; the library places no restriction
   beyond what the command line format enforces.
2. `patterns` contains unique strings; duplicates are silently dropped by
   `add_pattern()`.
3. `value()` is an unchecked accessor — always call `contains_option()` first.
4. `parse()` does not clear `opt_map` before running; pre-set defaults survive
   unless explicitly overridden by a command line argument.
5. `abs_path()` is only meaningful after `'P'` has been set (directly or via
   `parse()`); otherwise it canonicalises `"."`.
6. The library has no external crate dependencies; it uses only `std::env`,
   `std::collections::HashMap`, and `std::fs`.

---

## Test Module

A single `#[cfg(test)]` test `cl_args` verifies that, after calling `parse()`,
every `/X`-style argument actually present in `std::env::args()` has its key
registered in `opt_map`.
