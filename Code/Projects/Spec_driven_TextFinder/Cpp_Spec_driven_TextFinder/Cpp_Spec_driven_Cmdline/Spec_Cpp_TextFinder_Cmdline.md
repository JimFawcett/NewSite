# Spec_Cpp_TextFinder_Cmdline — Command-Line Library Specification

Specification for the `Cpp_TextFinder_Cmdline` library of the C++ TextFinder implementation. This document is the C++ binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5, which remain the authority for switch syntax, meanings, and defaults; it inherits structural decisions from [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md). Its consumer is [Spec_Cpp_TextFinder_Entry.md](../Cpp_Spec_driven_TextFinder_Entry/Spec_Cpp_TextFinder_Entry.md).

## 1. Purpose

`Cpp_TextFinder_Cmdline` converts `argc`/`argv` into a program-command `struct` that controls the behavior of `Cpp_TextFinder_Dirnav` and `Cpp_TextFinder_Output`. It is the single place in the C++ implementation where switch letters, argument syntax, and defaults are known. It performs no traversal, no matching, no file I/O, and no stream writing.

## 2. Scope

This spec covers only the library. Consumption of the parsed result — instantiation order, exit codes, which stream receives a diagnostic — is specified in Spec_Cpp_TextFinder_Entry.md.

## 3. Responsibilities

The library:

- Is implemented as a C++ module targeting C++23, using modern idiomatic C++ constructs.
- Exports a `ProgramCommands` struct and a parse entry that converts `argc`/`argv` into it, applying the syntax rules, defaults, and multiple-occurrence rules of Spec_TextFinder.md §4–§5.
- Reports every command-line error by returning a diagnostic string; it opens no stream and does not terminate the process.
- Renders the help text of Spec_TextFinder.md §5.1, its usage line, and the resolved-option listing as strings, for `Cpp_TextFinder_Entry` to write — help and options to stdout, the usage line to stderr within a diagnostic.

## 4. Public Interface

The module interface unit `Cpp_TextFinder_Cmdline.ixx` declares module `Cpp_TextFinder_Cmdline` and exports the following at global scope, matching the unqualified type usage in Spec_Cpp_TextFinder_Entry.md:

```cpp
export module Cpp_TextFinder_Cmdline;

import std;

export struct ProgramCommands {
    std::vector<std::string> rootPaths{"."};          // /P
    std::vector<std::string> extensions{};            // /p
    std::string              regexText{"."};          // /r
    bool                     recurse{true};           // /s
    bool                     suppressOnNoMatch{true}; // /h
    bool                     verbose{false};          // /v
    bool                     help{false};             // /H
    bool                     lineNumbers{false};      // /n
    bool                     matchedLine{false};      // /L
};

export std::expected<ProgramCommands, std::string> parse(int argc, char* argv[]);
export std::string usageLine();
export std::string helpText();
export std::string optionsText(const ProgramCommands& commands);
```

The field comments are the switch-to-field mapping, and the initializers are the sole authority in code for the defaults of Spec_TextFinder.md §5; a default-constructed `ProgramCommands` equals the result of parsing an empty command line.

`ProgramCommands` is a copyable value type with no invariants: every field combination the parser can produce is valid. `Cpp_TextFinder_Dirnav` holds a reference to the instance owned by `Cpp_TextFinder_Entry` rather than a copy, so that instance must outlive the `Cpp_TextFinder_Dirnav` it was passed to.

`parse` returns the resolved commands on success and a usage diagnostic (§6) on failure; it writes nothing. `regexText` is the `/r` argument verbatim — compilation happens at `Cpp_TextFinder_Dirnav` construction, per Spec_Cpp_TextFinder_Entry.md §4 step 7.

## 5. Parsing Rules

`parse` scans `argv[1]` through `argv[argc-1]` left to right, alternating switch token and argument token. It stops at the first violation and returns that diagnostic; no partial result is produced. It touches no filesystem: root paths are not tested for existence, and extensions are not compared against any file.

1. **Switch tokens.** A token in switch position is valid only when it is exactly two characters, the first `/` or `-`, the second one of the nine letters in Spec_TextFinder.md §5. A token with no introducer is *not a switch*; any other introducer-led token, including a bare `/` or `-`, is an *unrecognized switch*.
2. **Arguments.** Each switch consumes the following token verbatim, including when that token begins with `/` or `-`, since there are no bare flags. A switch with no following token is *missing its argument*.
3. **Conversion.** Boolean switches (`/s`, `/h`, `/v`, `/H`, `/n`, `/L`) accept only `true` or `false` under ASCII case folding. `/r` and `/P` take the token verbatim, and each rejects an empty argument — *an empty root path* for `/P`, *an empty expression* for `/r`. `/p` is normalized per §7.
4. **Accumulation.** `/P` clears the default `{"."}` on its first occurrence and appends thereafter, preserving argv order. Every other switch overwrites any earlier value, silently discarding it.

## 6. Error Conditions

Every violation in §5 is a usage error. `parse` returns a usage diagnostic in the shape Spec_TextFinder.md §5.2 binds — a reason line, a newline, then `usageLine()`. `Cpp_TextFinder_Entry` writes the returned string to stderr unaltered and exits with code `1` (Spec_Cpp_TextFinder_Entry.md §4 step 1).

Spec_TextFinder.md §2 leaves the wording of stderr text to each language, and §5.2 supplies reason lines without binding them. This implementation adopts §5.2's six parse-time reason lines unchanged, and this section is where they are fixed for C++:

| Condition                                                    | Reason line                             |
|--------------------------------------------------------------|-----------------------------------------|
| Token in switch position has no `/` or `-` introducer        | `not a switch: <token>`                 |
| Introducer-led token that is not a switch defined in §5      | `unrecognized switch: <token>`          |
| Switch is the last token, with no argument token following   | `missing argument for switch: <switch>` |
| Boolean switch given a value other than `true` or `false`    | `invalid boolean for <switch>: <token>` |
| `/P` given an empty argument                                 | `empty root path for switch: <switch>`  |
| `/r` given an empty argument                                 | `empty expression for switch: <switch>` |

`<token>` is the offending token and `<switch>` the switch, each reproduced exactly as typed, preserving the introducer. The integration suite compares its expectations against this table, not against the parent, which no longer fixes the wording for anyone.

The seventh condition of §5.2, a malformed `/r`, is detected later: `Cpp_TextFinder_Dirnav` compiles the expression and lets the failure propagate, and `Cpp_TextFinder_Entry` composes that diagnostic, drawing its usage line from `usageLine()` below (§8). Spec_Cpp_TextFinder_Entry.md §6 fixes its reason line, since the binary is what writes it. Neither this library nor `Cpp_TextFinder_Dirnav` composes it — the one supplies a string, the other raises the failure, and the binary joins them.

There is no error condition for a duplicated switch or an empty `/p` list: duplicates resolve by §5 rule 4, and an empty extension list means every file is searched.

## 7. Extension-List Normalization

The `/p` argument arrives as one token; the shell has already removed the quotes. Normalization implements the `/p` rules of Spec_TextFinder.md §5: split the token on commas, trim each item, strip one leading `.` if present, trim it a second time, discard empty items, and preserve the order of the survivors. Spec_TextFinder.md §5 fixes which characters are trimmed, naming six of them, so this document chooses none of them. `std::isspace` in the C locale reports exactly those six and is what the implementation calls, through a cast to `unsigned char` — passing a negative `char` to it is undefined, and a path holding a byte above 0x7F produces one.

The second trim is not redundant, and §5 requires it for a reason that shows only when the dot and the whitespace are separated. `". cpp"` survives the first trim unchanged, the dot being the first character, and the erase then exposes the space: one trim alone yields `" cpp"`, an extension no file can carry, and one that puts a second space into the §5.3 listing line, which §5.3 otherwise keeps free of stray whitespace. Both trims call the same `trim`, so the six characters have one definition here. An item reduced to nothing by either trim is discarded, so the empties test comes last.

Duplicates are retained — they are harmless to the membership test `Cpp_TextFinder_Dirnav` performs. Case folding is not applied here; the platform-dependent comparison fixed by Spec_TextFinder.md §5 is performed by `Cpp_TextFinder_Dirnav` when it matches a file name against the list.

## 8. Help Text and Option Listing

`helpText()` returns the text fixed by Spec_TextFinder.md §5.1 with `<executable>` replaced by `Cpp_TextFinder`. `usageLine()` returns its first line — the line that terminates every usage diagnostic (§6), exported so that `Cpp_TextFinder_Entry` can compose the malformed-regex diagnostic.

`optionsText(commands)` returns the resolved option set, in the form Spec_TextFinder.md §5.3 fixes: one key/value pair per line, in §5 table order, `<switch> <value>` with a single separating space, one `/P` line per root path, the `/p` list joined by `, ` and emitting `/p` alone when empty, `/r` verbatim, and booleans in lower case. §5.3 gives the nine lines a bare `-v true` produces, and this function reproduces them. It chooses none of that form and must not be read as the place the form is decided.

One function serves all three cases §5.3 calls for, since the text is the same in each and only the caller's next move differs: `/v true`, after which traversal follows; the bare command line of §3.1, after which the process exits 0; and the invalid-regex diagnostic of §5.2, where the listing precedes that diagnostic on stdout whatever `/v` says and the process then exits 1. The listing reflects whatever `commands` holds, so its `/v` line reads `false` in the latter two unless `/v` was itself typed.

All three functions end their returned string with a newline; none writes to a stream.

## 9. Build

Per [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md):

- CMake library target `Cpp_TextFinder_Cmdline`.
- Implemented as a C++ module; consumes the standard library via `import std;`. Depends on neither `Cpp_TextFinder_Dirnav` nor `Cpp_TextFinder_Output`.

## 10. Non-Goals

- The library does not compile the regular expression; it checks only that the argument is non-empty.
- The library does not access the filesystem or verify that a root path exists.
- The library does not support non-ASCII characters in argv (on Windows, system-codepage `argv` is not decoded to Unicode).
