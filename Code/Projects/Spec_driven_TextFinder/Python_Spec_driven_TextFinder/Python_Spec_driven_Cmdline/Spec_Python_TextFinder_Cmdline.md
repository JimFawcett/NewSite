# Spec_Python_TextFinder_Cmdline — Command-Line Library Specification

Specification for the `python_textfinder_cmdline` library of the Python TextFinder implementation. This document is the Python binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5, which remain the authority for switch syntax, meanings, and defaults; it inherits structural decisions from [Python_TextFinder_Structure.md](../Python_TextFinder_Structure.md). Its consumer is [Spec_Python_TextFinder_Entry.md](../Python_Spec_driven_TextFinder_Entry/Spec_Python_TextFinder_Entry.md).

## 1. Purpose

`python_textfinder_cmdline` converts the program's arguments into a program-command object that controls the behavior of `python_textfinder_dirnav`. It is the single place in the Python implementation where switch letters, argument syntax, and defaults are known. It performs no traversal, no matching, no file I/O, and no stream writing.

## 2. Scope

This spec covers only the library. Consumption of the parsed result, exit codes, and which stream receives a diagnostic are specified in Spec_Python_TextFinder_Entry.md.

## 3. Responsibilities

The library:

- Is a package importable as `python_textfinder_cmdline`, written in idiomatic Python for CPython 3.10 or later, with annotations throughout.
- Exports a `ProgramCommands` dataclass and a parse entry that converts an argument list into it, applying the syntax rules, defaults, and multiple-occurrence rules of Spec_TextFinder.md §4–§5.
- Reports every command-line error through a returned diagnostic string rather than an exception; it opens no stream and does not terminate the process.
- Renders the help text of Spec_TextFinder.md §5.1, its usage line, and the resolved-option listing as strings, for `python_textfinder_entry` to write — help and options to stdout, the usage line to stderr within a diagnostic.

## 4. Public Interface

The package exports the following, defined in `program_commands.py` and `command_line.py` and re-exported from `__init__.py`:

```python
@dataclass
class ProgramCommands:
    root_paths: list[str] = field(default_factory=lambda: ["."])  # /P
    extensions: list[str] = field(default_factory=list)           # /p
    regex_text: str = "."                                         # /r
    recurse: bool = True                                          # /s
    suppress_on_no_match: bool = True                             # /h
    verbose: bool = False                                         # /v
    help: bool = False                                            # /H
    line_numbers: bool = False                                    # /n
    matched_line: bool = False                                    # /L


@dataclass(frozen=True)
class ParseFailure:
    diagnostic: str


def parse(argv: list[str]) -> ProgramCommands | ParseFailure: ...

def usage_line() -> str: ...
def help_text() -> str: ...
def options_text(commands: ProgramCommands) -> str: ...
```

The field comments are the switch-to-attribute mapping, and the field defaults are the sole authority in code for the defaults of Spec_TextFinder.md §5. A newly constructed `ProgramCommands` equals the result of parsing a bare argument list. Spec_TextFinder.md §5 remains the authority overall, and a disagreement between the two is a defect in this library. The four `bool` fields whose default is `False` carry that default explicitly, where the C# implementation omits it: a dataclass field with no default is a required constructor argument, so omitting it would change the type rather than restate a language default.

The two `list` fields use `default_factory`, never a bare default value. A mutable default on a dataclass field is a `ValueError` at class-definition time, which is the language refusing the one bug this pattern would otherwise plant — every `ProgramCommands` sharing one list.

`ProgramCommands` has no invariants: every attribute combination the parser can produce is valid. It is an ordinary mutable object, so `Dirnav` holds a reference to the object `python_textfinder_entry` owns and the interpreter keeps it alive. No lifetime rule is stated here, because there is none to state. The dataclass is not frozen: the parser builds one instance and fills it as it scans, which a frozen type would turn into nine keyword arguments assembled from nine locals.

The four functions are module-level functions rather than methods of a class. Python has free functions, so a class whose members were all static would add a name without adding a meaning; the module is already the namespace that groups the four. This is the one place where the C# implementation's structure does not carry over, and the reason is that the C# structure exists to work around the absence of free functions.

`parse` returns either the commands or a `ParseFailure`, rather than raising. A malformed command line is something the user typed, so it is an ordinary outcome of parsing rather than an exceptional one, and the standard library has no result type to return instead.

The return is a union of two types rather than a pair of optionals, and the difference is the whole reason `ParseFailure` exists. A `tuple[ProgramCommands | None, str | None]` cannot be narrowed: testing one element for `None` tells a type checker nothing about the other, because tuple elements are not correlated in the type system, so a caller reading the diagnostic after testing the commands is reading a `str | None` where a `str` is wanted and must either assert or ignore the checker. C# gets this from `NotNullWhen`, and Python has no attribute that does the same for a tuple return. A union does narrow, under any checker and with no annotation beyond the return type:

```python
result = parse(argv)
if isinstance(result, ParseFailure):
    ...                    # result is ParseFailure; result.diagnostic is a str
    return 1
...                        # result is ProgramCommands
```

`ParseFailure` is frozen and carries one field, since a diagnostic is finished text by the time this library returns it and nothing downstream has a reason to change it. Only the failure is wrapped; success returns `ProgramCommands` unwrapped, so the common path costs the caller no unwrapping step and the type that already models the successful outcome is not given a second skin.

`argparse` is rejected by name, and the rejection is the sharpest in this document, because it is the module a Python reader expects to find here. It cannot express the grammar Spec_TextFinder.md §4 fixes and is not a near miss: it does not accept a `/` introducer at all, it distinguishes `-P` from `--P` where §4 does not define a long form, it abbreviates long options by prefix, it treats a token beginning with `-` as a switch rather than as the argument of the switch before it, and on a malformed line it writes usage text of its own composition to stderr and calls `sys.exit(2)` — which would override both the fixed help text of §5.1 and the exit codes of §3.4. `getopt` is rejected for the first three of those reasons. The parser is therefore written by hand, and the six-line scan §5 describes is what that costs.

`regex_text` is the `/r` argument verbatim — compilation happens at `Dirnav` construction, per Spec_Python_TextFinder_Entry.md §4 step 6.

## 5. Parsing Rules

`parse` scans `argv` from index 1 left to right, alternating switch token and argument token. It stops at the first violation and produces that diagnostic; no partial result is returned. It touches no filesystem: root paths are not tested for existence, and extensions are not compared against any file.

The scan begins at index 1 rather than index 0. `sys.argv[0]` holds the program name — the path of `__main__.py` under `python -m`, the launcher's path under a direct invocation — so there is a name to skip, as there is in C++ and Rust and is not in C#. Spec_TextFinder.md §4 leaves the form of the argument vector to this document, and this is the fact that follows for Python. `parse` takes the whole list including element 0 and skips it itself, rather than taking a pre-sliced list, so that the offset is stated in one place and the caller has no chance to get it wrong.

1. **Switch tokens.** A token in switch position is valid only when it is exactly two characters, the first `/` or `-`, the second one of the nine letters in Spec_TextFinder.md §5. A token with no introducer is *not a switch*; any other introducer-led token, including a bare `/` or `-`, is an *unrecognized switch*. Length is measured in Unicode scalar values, which is what `len` counts on a `str`; a two-character token holding an astral character measures 2 and passes the length test, unlike in C# where it measures 3 and fails it, and is then refused as unrecognized because its second character is not one of the nine letters. The two implementations reach the same outcome by different routes, and neither route is observable.
2. **Arguments.** Each switch consumes the following token verbatim, including when that token begins with `/` or `-`, since there are no bare flags. A switch with no following token is *missing its argument*.
3. **Conversion.** Boolean switches (`/s`, `/h`, `/v`, `/H`, `/n`, `/L`) accept only `true` or `false`, compared after `str.lower()` against those two literals. `bool(token)` is rejected by name: every non-empty string is truthy, so it would accept `/s maybe` as `true`. `distutils.util.strtobool` is rejected too: it accepts `y`, `n`, `1`, and `0`, which §4 does not define, and the module it lives in was removed from the standard library in 3.12. `/r` and `/P` take the token verbatim, and each rejects an empty argument — *an empty root path* for `/P`, *an empty expression* for `/r`. `/p` is normalized per §7.
4. **Accumulation.** `/P` clears the default `["."]` on its first occurrence and appends thereafter, preserving argument order. Every other switch overwrites any earlier value, silently discarding it. The first occurrence is tracked by a local flag rather than inferred from the list's contents, since `-P .` is indistinguishable by value from the default.

Switch letters compare by equality of `str`, which is a comparison of scalar values and carries no locale. The Turkish-locale hazard the C# implementation guards against, where `/h` and `/H` could fold together under a culture-sensitive comparison, does not arise in Python: `str` comparison and `str.lower` are defined by the Unicode database rather than by the machine's locale, and nothing in this library reads a locale. That is a property of the language recorded here rather than a decision taken here.

## 6. Error Conditions

Every violation in §5 is a usage error. `parse` returns a `ParseFailure` whose `diagnostic` is in the shape Spec_TextFinder.md §5.2 binds — a reason line, a newline, then `usage_line()`. `python_textfinder_entry` writes that string to stderr unaltered and exits with code 1 (Spec_Python_TextFinder_Entry.md §4 step 1).

Spec_TextFinder.md §2 leaves the wording of stderr text to each language, and §5.2 supplies reason lines without binding them. This implementation adopts §5.2's six parse-time reason lines unchanged, and this section is where they are fixed for Python:

| Condition                                                    | Reason line                             |
|--------------------------------------------------------------|-----------------------------------------|
| Token in switch position has no `/` or `-` introducer        | `not a switch: <token>`                 |
| Introducer-led token that is not a switch defined in §5      | `unrecognized switch: <token>`          |
| Switch is the last token, with no argument token following   | `missing argument for switch: <switch>` |
| Boolean switch given a value other than `true` or `false`    | `invalid boolean for <switch>: <token>` |
| `/P` given an empty argument                                 | `empty root path for switch: <switch>`  |
| `/r` given an empty argument                                 | `empty expression for switch: <switch>` |

`<token>` is the offending token and `<switch>` the switch, each reproduced exactly as typed, preserving the introducer. Adopting §5.2's wording rather than rewriting it costs nothing and leaves this implementation's stderr comparable with the other implementations', which Spec_TextFinder.md §6 no longer requires but does not forbid.

The diagnostic's embedded terminators are LF, since they are written into the string rather than produced by a writer. `python_textfinder_entry` writes the string through `sys.stderr.buffer`, which translates nothing, so this implementation's stderr carries LF on every platform. Spec_TextFinder.md §3.4 leaves the stderr terminator to the platform and asks for no such thing; getting it costs one writer choice, so this implementation takes it.

A token reproduced in a reason line may carry lone surrogates, on a POSIX system where the interpreter decoded an undecodable argument with `surrogateescape`. This library performs no substitution on it: §5.2 requires the token be reproduced exactly as typed, and Spec_Python_TextFinder_Entry.md §4 fixes what the stderr writer does with a scalar value it cannot encode.

The seventh condition of §5.2, a malformed `/r`, is detected later: the `Dirnav` constructor compiles the expression and lets `re.error` propagate, and `python_textfinder_entry` composes that diagnostic, drawing its usage line from `usage_line()`. Spec_Python_TextFinder_Entry.md §6 fixes its reason line, since the binary is what writes it.

There is no error condition for a duplicated switch or an empty `/p` list: duplicates resolve by §5 rule 4, and an empty extension list means every file is searched.

## 7. Extension-List Normalization

The `/p` argument arrives as one token; the shell has already removed the quotes. Normalization implements the `/p` rules of Spec_TextFinder.md §5: split the token on commas, trim each item, strip one leading `.` if present, trim it again, discard empty items, and preserve the order of the survivors.

Spec_TextFinder.md §5 fixes which characters are trimmed, naming six of them, so this document chooses none of them and no two implementations can trim a different set. The six are held as one module-level `str` constant, `" \t\n\v\f\r"`, and passed to `str.strip`, which trims exactly the characters given and no others.

§5 fixes the second trim too, and the reason it gives is worth restating where the code is: without it `". cpp"` normalizes to `" cpp"`, which no file's extension can equal and which puts a second space into the §5.3 listing line. The two trims call the same function with the same constant, so there is one trim rule in this library and it is applied twice.

Two standard methods are rejected by name, each because it looks correct and implements a different rule:

- **`str.strip()`** with no argument trims every character `str.isspace` reports, a set that includes no-break space, the en and em spaces, and the line and paragraph separators, so this implementation would accept an extension list another rejects.
- **`str.lstrip(".")`** removes every leading dot, where §5 removes one. `..cpp` must normalize to `.cpp` and not to `cpp`. The dot is therefore stripped with `str.removeprefix(".")`, which removes one occurrence and is the reason this library needs 3.9 or later. Python_TextFinder_Structure.md fixes the floor one version higher, at 3.10, for a reason this library also relies on: PEP 604 made `X | Y` a type expression evaluated at run time, which is what `ProgramCommands | ParseFailure` in §4's return annotation is.

Duplicates are retained — they are harmless to the membership test `python_textfinder_dirnav` performs. Case folding is not applied here; the platform-dependent comparison fixed by Spec_TextFinder.md §5 is performed by `python_textfinder_dirnav` when it matches a file name against the list.

## 8. Help Text and Option Listing

`help_text` returns the text fixed by Spec_TextFinder.md §5.1 with `<executable>` replaced by `Python_TextFinder`, the launcher name Python_TextFinder_Structure.md fixes. It is not derived from `sys.argv[0]`, which under `python -m` holds the path of `__main__.py` and would put an interpreter path in the usage line; this library does not read `sys.argv` at all. `usage_line` returns the first line of that text — the line that terminates every usage diagnostic (§6), exposed so that `python_textfinder_entry` can compose the malformed-regex diagnostic. `help_text` is built from `usage_line`, so the synopsis has one definition.

The help body is held as a `list[str]`, one element per line, joined with `"\n"`. A triple-quoted string literal would read better in the source and is not used: it carries the line terminators of the file it is written in, so an editor or a `.gitattributes` rule that rewrote this source to CRLF would change what the program prints. Spec_TextFinder.md §5.1 fixes the text and §3.4 fixes the terminator, so neither may depend on how this file is stored. Joining a list of lines makes the terminator a decision of this library rather than a property of its encoding, and the list's length is the line count a fixture can assert. `textwrap.dedent` over a triple-quoted literal is rejected for the same reason: it fixes the indentation and leaves the terminators alone.

`options_text` returns the resolved option set, in the form Spec_TextFinder.md §5.3 fixes: one key/value pair per line, in §5 table order, `<switch> <value>` with a single separating space, one `/P` line per root path, the `/p` list joined by `", "` and emitting `/p` alone when empty, `/r` verbatim, and booleans in lower case. §5.3 gives the nine lines a bare `-v true` produces, and this function reproduces them. It chooses none of that form and must not be read as the place the form is decided.

Booleans render through a conditional expression yielding the literals `"true"` and `"false"`. `str(value)` is not used: it returns `"True"` and `"False"`, which §5.3 forbids. `format(value)` and an f-string interpolation of the `bool` return the same two strings and are rejected with it. The two literals appear once each in this library.

One function serves all three cases §5.3 calls for, since the text is the same in each and only the caller's next move differs: `/v true`, after which traversal follows; the bare command line of §3.1, after which the process exits 0; and the invalid-regex diagnostic of §5.2, where the listing precedes that diagnostic on stdout whatever `/v` says and the process then exits 1. The listing reflects whatever `commands` holds, so its `/v` line reads `false` in the latter two unless `/v` was itself typed.

All three functions end their returned string with LF; none writes to a stream.

## 9. Build

Per [Python_TextFinder_Structure.md](../Python_TextFinder_Structure.md):

- Package `python_textfinder_cmdline` under this folder's `src/`, importable once that folder is on `PYTHONPATH`.
- Depends on the standard library only. It imports neither `python_textfinder_dirnav`, nor `python_textfinder_output`, nor any distributed package. It does not import `re`: it checks that the `/r` argument is non-empty and never compiles it.
- Its unit suite sits under `test/` and is not part of the package, so importing the package does not import the suite.

## 10. Non-Goals

- The library does not compile the regular expression; it checks only that the argument is non-empty.
- The library does not access the filesystem or verify that a root path exists.
- The library does not read `sys.argv`; `main` receives it and passes the list in.
