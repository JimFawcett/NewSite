# Spec.md — PyTextFinder/CommandLine

*Specifies the command-line parsing library.*

---

## Responsibility

CommandLine accepts the raw `list[str]` args from `sys.argv[1:]`, recognises
`/Key [Value]` (or `-Key [Value]`) tokens, stores them in an internal
dictionary, and exposes typed properties to callers.

It has no knowledge of the file system, regular expressions, or output
formatting.

---

## Source File

```
CommandLine/
└── cmd_line.py
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

Boolean flags (`/s`, `/H`, `/v`, `/h`) receive the implicit value `"true"` when
present with no following token, or when the following token also begins with
`/` or `-`.

---

## Class `CmdLine`

### Constructor

```python
def __init__(self, args: list[str]) -> None
```

Parses `args`.  Applies defaults after parsing so that missing keys always
return a valid value.

### Properties

```python
@property
def path(self) -> str          # value of /P
def regex(self) -> str         # value of /r
def patterns(self) -> list[str]  # split value of /p on ','
def recurse(self) -> bool      # /s == "true"
def hide(self) -> bool         # /H == "true"
def verbose(self) -> bool      # /v present
def help(self) -> bool         # /h present
def help_text(self) -> str     # formatted help string
```

### Internal dictionary

Options are stored as `dict[str, str]` keyed by the option letter
(e.g. `"P"`, `"r"`).

---

## Parsing Algorithm

1. Iterate `args[0]` through `args[-1]`.
2. A token is a flag if and only if it is exactly two characters: `'/'` or
   `'-'` followed by a single ASCII letter (`str.isalpha`).  This excludes
   Unix absolute paths such as `/tmp/search` that happen to start with `/`.
3. If the current token is a flag, extract the key (the letter).
4. If the *next* token is not a flag, consume it as the value;
   otherwise the value is `"true"`.
5. Store key → value in the dictionary.
6. After the loop, insert any missing default keys.

---

## `help_text` Content

The help string lists all supported options, their defaults, and a brief
one-line description of the program.

---

## Invariants

- Every property always returns a value (defaults ensure this).
- Keys are case-sensitive (`"P"` ≠ `"p"`).
- An unrecognised token (does not begin with `/` or `-`, not consumed as a
  value) is silently ignored.

---

*End of Spec.md*
