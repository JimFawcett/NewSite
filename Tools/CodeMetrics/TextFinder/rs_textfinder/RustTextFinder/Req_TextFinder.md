# Req_TextFinder.md - Requirements and Assertions

**Source:** `RustTextFinder_Spec.md`
**Binary:** `text_finder`

---

## Command Line Requirements

**REQ-CL-01: Default Options**
- Options map contains `P="."`, `s="true"`, `r="."`, `H="true"` after `default_options()`
- Parsed command line values overwrite defaults for matching keys

**REQ-CL-02: Help on /h**
- If `/h` is present in the options map, the help string is printed and `main()` returns immediately
- No directory traversal occurs

**REQ-CL-03: Help on No Arguments**
- If `std::env::args().len() == 1`, the help string is printed and `main()` returns immediately
- No directory traversal occurs

**REQ-CL-04: Target Skip**
- Directories named `target` are never entered during traversal
- This holds regardless of command line arguments

---

## Struct `TextFinder` Requirements

**REQ-TF-01: TextFinder Construction**
- `TextFinder::new()` produces an instance with `re_str == ""`
- `TextFinder::new()` produces an instance with `last_dir == ""`

**REQ-TF-02: Regex Setting**
- After `regex(s)`, `get_regex()` returns `s`

**REQ-TF-03: Find — File Reading**
- `find()` first attempts `read_to_string(file_path)`
- On text-read failure, `find()` falls back to `read()` with lossy UTF-8 conversion
- If both reads fail, `find()` returns `false`

**REQ-TF-04: Find — Matching**
- `find()` returns `true` if and only if file content matches `re_str`
- `find()` returns `false` if `re_str` fails to compile as a regex
- `find()` returns `false` if the file cannot be read

**REQ-TF-05: Find — No Panic**
- `find()` never panics for any combination of file path and regex string

**REQ-TF-06: Last Path Tracking**
- After `last_path(p)`, `get_last_path()` returns `p`

---

## Struct `TfAppl` Requirements

**REQ-TA-01: TfAppl Construction**
- `TfAppl::new()` produces an instance with `hide == true`
- `TfAppl::new()` produces an instance with `recurse == true`
- `TfAppl::new()` produces an instance with `curr_dir == ""`

**REQ-TA-02: do_dir Behaviour**
- `do_dir(d)` always sets `curr_dir` to `d`
- If `hide == false`, the directory name is printed immediately
- If `hide == true`, the directory name is not printed by `do_dir`

**REQ-TA-03: do_file Behaviour**
- The fully qualified path is constructed as `curr_dir + "/" + f`
- If `tf.find()` returns `false`, nothing is printed
- If `tf.find()` returns `true`, the filename is always printed
- If `tf.find()` returns `true` and `hide == true` and `curr_dir != tf.get_last_path()`,
  the directory name is printed before the filename and `tf.last_path` is updated

**REQ-TA-04: Hide Setting**
- After `hide(p)`, `get_hide()` returns `p`

**REQ-TA-05: Recurse Setting**
- After `recurse(p)`, `get_recurse()` returns `p`
- The stored value is for reference only; actual recursion is controlled by `DirNav`

**REQ-TA-06: Regex Delegation**
- `TfAppl::regex(s)` sets the embedded `TextFinder`'s regex to `s`
- `TfAppl::get_regex()` returns the embedded `TextFinder`'s current regex string

---

## `main()` Requirements

**REQ-MN-01: Startup Sequence**
- `default_options()` is called before `parse()`
- `add_skip("target")` is called before any other `DirNav` configuration

**REQ-MN-02: Recursion Configuration**
- If `/s "true"`, both `DirNav::recurse` and `TfAppl::recurse` are set to `true`
- If `/s "false"` or `/s` absent, both are set to `false`

**REQ-MN-03: Hide Configuration**
- If `/H "true"`, both `DirNav::hide` and `TfAppl::hide` are set to `true`
- If `/H "false"`, both are set to `false`
- If `/H` absent, both are set to `true`

**REQ-MN-04: Pattern Population**
- Each extension from `parser.patterns()` is added to `DirNav` via `add_pat()`
- If `/p` is absent, no patterns are added and `DirNav` passes every file to `do_file`

**REQ-MN-05: Search Execution**
- `verbose()` is called before `dn.visit()`
- `dn.visit()` receives the absolute path from `parser.abs_path()`
- After traversal, total file count and directory count are printed

---

## Invariant Requirements

**REQ-INV-01: Hide Synchronization**
- `DirNav::hide` and `TfAppl::hide` always hold the same value

**REQ-INV-02: Default Regex**
- When `/r` is absent, the default regex `"."` is used and matches every non-empty file

**REQ-INV-03: Regex Compilation**
- The regex is compiled on every call to `find()`; there is no shared pre-compiled instance
