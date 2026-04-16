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

## Source Files

```
CommandLine/src/
├── CmdLine.h
└── CmdLine.cpp
```

<!-- INPUT NEEDED: Rename files if a different convention is preferred,
     e.g. cmd_line.h / cmd_line.cpp (snake_case). -->

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

Boolean flags (`/s`, `/H`, `/v`, `/h`) receive the implicit value `"true"` when
present with no following token, or when the following token also begins with
`/`.

<!-- INPUT NEEDED: Add any additional options needed for the C++ version. -->

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
std::string path() const;         // value of /P
std::string regex() const;        // value of /r
std::vector<std::string> patterns() const;  // split value of /p on ','
bool recurse() const;             // /s == "true"
bool hide() const;                // /H == "true"
bool verbose() const;             // /v present
bool help() const;                // /h present
std::string help_text() const;    // formatted help string
```

<!-- INPUT NEEDED: Decide whether path() should return a raw string or a
     std::filesystem::path.  Also confirm whether patterns() strips leading
     dots, e.g. ".rs" → "rs". -->

### Internal map

Options are stored as `std::map<std::string, std::string>` keyed by the option
letter (e.g. `"P"`, `"r"`).

---

## Parsing Algorithm

1. Iterate `argv[1]` through `argv[argc-1]`.
2. A token is a flag if and only if it is exactly two characters: `'/'` followed
   by a single ASCII letter (`std::isalpha`).  This excludes Unix paths such as
   `/tmp/search` that happen to start with `/`.
3. If the current token is a flag, extract the key (the letter).
4. If the *next* token is not a flag, consume it as the value;
   otherwise the value is `"true"`.
4. Store key → value in the map.
5. After the loop, insert any missing default keys.

---

## `help_text()` Content

The help string lists all supported options, their defaults, and a brief
one-line description of the program.

<!-- INPUT NEEDED: Provide the exact program name / description line to embed
     in the help output. -->

---

## Invariants

- Every key returned by an accessor always has a value (defaults ensure this).
- Keys are case-sensitive (`"P"` ≠ `"p"`).
- An unrecognised token (does not begin with `/`, not consumed as a value) is
  silently ignored.

<!-- INPUT NEEDED: Decide whether unrecognised tokens should instead print a
     warning or cause a non-zero exit. -->

---

*End of CommandLine/Spec.md*
