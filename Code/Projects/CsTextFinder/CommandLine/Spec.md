# Spec.md — CsTextFinder/CommandLine

*Specifies the command-line parsing library.*

---

## Responsibility

CommandLine accepts the raw `string[] args` array from the runtime, recognises
`/Key [Value]` tokens, stores them in an internal dictionary, and exposes typed
properties to callers.

It has no knowledge of the file system, regular expressions, or output
formatting.

---

## Source File

```
CommandLine/
└── CmdLine.cs
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
`/`.

---

## Class `CmdLine`

### Constructor

```csharp
public CmdLine(string[] args);
```

Parses `args`.  Applies defaults after parsing so that missing keys always
return a valid value.

### Properties

```csharp
public string Path { get; }                    // value of /P
public string Regex { get; }                   // value of /r
public IReadOnlyList<string> Patterns { get; } // split value of /p on ','
public bool Recurse { get; }                   // /s == "true"
public bool Hide { get; }                      // /H == "true"
public bool Verbose { get; }                   // /v present
public bool Help { get; }                      // /h present
public string HelpText { get; }                // formatted help string
```

### Internal dictionary

Options are stored as `Dictionary<string, string>` keyed by the option letter
(e.g. `"P"`, `"r"`).

---

## Parsing Algorithm

1. Iterate `args[0]` through `args[^1]`.
2. A token is a flag if and only if it is exactly two characters: `'/'` followed
   by a single ASCII letter (`char.IsLetter`).  This excludes Unix absolute paths
   such as `/tmp/search` that happen to start with `/`.
3. If the current token is a flag, extract the key (the letter).
4. If the *next* token is not a flag, consume it as the value;
   otherwise the value is `"true"`.
5. Store key → value in the dictionary.
6. After the loop, insert any missing default keys.

---

## `HelpText` Content

The help string lists all supported options, their defaults, and a brief
one-line description of the program.

---

## Invariants

- Every property always returns a value (defaults ensure this).
- Keys are case-sensitive (`"P"` ≠ `"p"`).
- An unrecognised token (does not begin with `/`, not consumed as a value) is
  silently ignored.

---

*End of Spec.md*
