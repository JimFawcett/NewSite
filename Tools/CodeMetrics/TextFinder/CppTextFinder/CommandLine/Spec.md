# Spec.md — CommandLine

*Specifies the command-line parsing library.*

---

## Responsibility

CommandLine accepts the raw `argc`/`argv` pair from the OS, recognises
`/Key [Value]` tokens, stores them in an internal map, and exposes typed
accessors to callers.

It has no knowledge of the file system, regular expressions, or output
formatting.

---

## Source File

```
CommandLine/src/
└── CmdLine.ixx      ← export module cmd_line;
```

---

## Supported Options

| Token | Meaning                                    | Default     |
|-------|--------------------------------------------|-------------|
| `/P`  | Root search path                           | `"."`       |
| `/p`  | Comma-separated file extensions            | *(empty)*   |
| `/s`  | Recurse into subdirectories                | `"true"`    |
| `/H`  | Hide directories with no matches           | `"true"`    |
| `/r`  | Regular expression for content matching    | `"."`       |
| `/v`  | Verbose output before search               | *(absent)*  |
| `/h`  | Display help and exit                      | *(absent)*  |

Both `'/'` (Windows style) and `'-'` (Unix style) are accepted as the flag
prefix, e.g. `/P .` and `-P .` are equivalent.

Boolean flags (`/s`, `/H`, `/v`, `/h`) receive the implicit value `"true"` when
present with no following token, or when the following token also begins with
`/` or `-`.

---

## Class `CmdLine`

### Constructor

```cpp
CmdLine(int argc, const char* argv[]);
```

Parses `argv[1..argc-1]`.  Applies defaults after parsing so that missing keys
always return a valid value.

### Accessors

```cpp
std::string path() const;                   // value of /P
std::string regex() const;                  // value of /r
std::vector<std::string> patterns() const;  // split value of /p on ','
bool recurse() const;                       // /s == "true"
bool hide() const;                          // /H == "true"
bool verbose() const;                       // /v present
bool help() const;                          // /h present
static std::string help_text();             // formatted help string
```

`path()` returns a raw `std::string`.  `patterns()` returns the raw split
tokens without stripping leading dots; DirNav's `add_pattern()` strips them.

### Internal map

Options are stored as `std::unordered_map<std::string, std::string>` keyed by
the option letter (e.g. `"P"`, `"r"`).

---

## Parsing Algorithm

1. Iterate `argv[1]` through `argv[argc-1]`.
2. A token is a flag if and only if it is exactly two characters: `'/'` or
   `'-'` followed by a single ASCII letter (`std::isalpha`).  This excludes
   Unix paths such as `/tmp/search` that happen to start with `/`.
3. If the current token is a flag, extract the key (the letter).
4. If the *next* token exists and is not a flag, consume it as the value;
   otherwise the value is `"true"`.
5. Store key → value in the map.
6. After the loop, insert any missing default keys.

---

## `help_text()` Content

The static method returns a formatted string listing all supported options,
their defaults, and a one-line description of the program:

```
CppTextFinder — search a directory tree for files whose content matches a regex
```

---

## Invariants

- Every key returned by an accessor always has a value (defaults ensure this).
- Keys are case-sensitive (`"P"` ≠ `"p"`).
- An unrecognised token (does not begin with `/` or `-`, or not consumed as a
  value) is silently ignored.

---

*End of CommandLine/Spec.md*
