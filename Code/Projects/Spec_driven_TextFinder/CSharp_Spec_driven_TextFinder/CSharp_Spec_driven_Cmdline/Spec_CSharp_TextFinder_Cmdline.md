# Spec_CSharp_TextFinder_Cmdline — Command-Line Library Specification

Specification for the `CSharp_TextFinder_Cmdline` library of the C# TextFinder implementation. This document is the C# binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5, which remain the authority for switch syntax, meanings, and defaults; it inherits structural decisions from [CSharp_TextFinder_Structure.md](../CSharp_TextFinder_Structure.md). Its consumer is [Spec_CSharp_TextFinder_Entry.md](../CSharp_Spec_driven_TextFinder_Entry/Spec_CSharp_TextFinder_Entry.md).

## 1. Purpose

`CSharp_TextFinder_Cmdline` converts the program's arguments into a program-command object that controls the behavior of `CSharp_TextFinder_Dirnav`. It is the single place in the C# implementation where switch letters, argument syntax, and defaults are known. It performs no traversal, no matching, no file I/O, and no stream writing.

## 2. Scope

This spec covers only the library. Consumption of the parsed result, exit codes, and which stream receives a diagnostic are specified in Spec_CSharp_TextFinder_Entry.md.

## 3. Responsibilities

The library:

- Is a .NET class library targeting `net8.0`, written in idiomatic C# with nullable reference types enabled.
- Exports a `ProgramCommands` class and a parse entry that converts an argument array into it, applying the syntax rules, defaults, and multiple-occurrence rules of Spec_TextFinder.md §4–§5.
- Reports every command-line error through a returned diagnostic string rather than an exception; it opens no stream and does not terminate the process.
- Renders the help text of Spec_TextFinder.md §5.1, its usage line, and the resolved-option listing as strings, for `CSharp_TextFinder_Entry` to write — help and options to stdout, the usage line to stderr within a diagnostic.

## 4. Public Interface

Namespace `CSharp_TextFinder_Cmdline` exports the following:

```csharp
public sealed class ProgramCommands
{
    public List<string> RootPaths { get; set; } = new() { "." };  // /P
    public List<string> Extensions { get; set; } = new();         // /p
    public string RegexText { get; set; } = ".";                  // /r
    public bool Recurse { get; set; } = true;                     // /s
    public bool SuppressOnNoMatch { get; set; } = true;           // /h
    public bool Verbose { get; set; }                             // /v
    public bool Help { get; set; }                                // /H
    public bool LineNumbers { get; set; }                         // /n
    public bool MatchedLine { get; set; }                         // /L
}

public static class CommandLine
{
    public static bool TryParse(string[] args,
        [NotNullWhen(true)] out ProgramCommands? commands,
        [NotNullWhen(false)] out string? diagnostic);

    public static string UsageLine();
    public static string HelpText();
    public static string OptionsText(ProgramCommands commands);
}
```

The property comments are the switch-to-property mapping, and the property initializers are the sole authority in code for the defaults of Spec_TextFinder.md §5. A newly constructed `ProgramCommands` equals the result of parsing an empty argument array. Spec_TextFinder.md §5 remains the authority overall, and a disagreement between the two is a defect in this library. The four `bool` properties whose default is `false` carry no initializer, since `default(bool)` is already `false`; writing `= false` on them would suggest the value was chosen where the others' initializers show it was.

`ProgramCommands` has no invariants: every property combination the parser can produce is valid. It is a reference type, so `Dirnav` holds a reference to the object `CSharp_TextFinder_Entry` owns and the garbage collector keeps it alive. No lifetime rule is stated here, because there is none to state.

`CommandLine` is a static class because C# has no free functions. The four members are static methods of one type rather than four types with one method each, since all four render or read the same option set.

`TryParse` follows the `Try` pattern rather than returning a result object or throwing. A malformed command line is something the user typed, so it is an ordinary outcome of parsing rather than an exceptional one, and the `Try` pattern is how C# expresses that without a result type in the base class library. The two `out` parameters are nullable and carry `NotNullWhen` attributes, so a caller compiling with nullable reference types enabled may use `commands` after a `true` return and `diagnostic` after a `false` return without a null check and without a null-forgiving operator. Exactly one of the two is non-null on return.

`RegexText` is the `/r` argument verbatim — compilation happens at `Dirnav` construction, per Spec_CSharp_TextFinder_Entry.md §4 step 6.

## 5. Parsing Rules

`TryParse` scans `args` from index 0 left to right, alternating switch token and argument token. It stops at the first violation and produces that diagnostic; no partial result is returned. It touches no filesystem: root paths are not tested for existence, and extensions are not compared against any file.

The scan begins at index 0 rather than index 1. `Main`'s `string[] args` holds the arguments alone, where a C or C++ `argv[0]` holds the executable name, so there is no program name to skip. Spec_TextFinder.md §4 leaves the form of the argument vector to this document, and this is the fact that follows for C#.

1. **Switch tokens.** A token in switch position is valid only when it is exactly two characters, the first `/` or `-`, the second one of the nine letters in Spec_TextFinder.md §5. A token with no introducer is *not a switch*; any other introducer-led token, including a bare `/` or `-`, is an *unrecognized switch*. Length is measured in UTF-16 code units, which is what `string.Length` counts; a two-character token holding an astral character measures 3 or more and is refused as unrecognized, which is the same outcome the rule reaches by its own terms.
2. **Arguments.** Each switch consumes the following token verbatim, including when that token begins with `/` or `-`, since there are no bare flags. A switch with no following token is *missing its argument*.
3. **Conversion.** Boolean switches (`/s`, `/h`, `/v`, `/H`, `/n`, `/L`) accept only `true` or `false`, compared with `StringComparison.OrdinalIgnoreCase`. `bool.TryParse` is not used: it trims surrounding whitespace and accepts values this specification does not, so a token this implementation must refuse would be accepted. `/r` and `/P` take the token verbatim, and each rejects an empty argument — *an empty root path* for `/P`, *an empty expression* for `/r`. `/p` is normalized per §7.
4. **Accumulation.** `/P` clears the default `{ "." }` on its first occurrence and appends thereafter, preserving argument order. Every other switch overwrites any earlier value, silently discarding it. The first occurrence is tracked by a local flag rather than inferred from the list's contents, since `-P .` is indistinguishable by value from the default.

Switch letters compare with `StringComparison.Ordinal` throughout. A culture-sensitive comparison is not used anywhere in this library: under a Turkish culture an ordinal-insensitive fold of `I` and `i` differs from the invariant one, and `/h` and `/H` are distinct switches whose distinction must not depend on the machine's locale.

## 6. Error Conditions

Every violation in §5 is a usage error. `TryParse` returns `false` and produces a usage diagnostic in the shape Spec_TextFinder.md §5.2 binds — a reason line, a newline, then `UsageLine()`. `CSharp_TextFinder_Entry` writes that string to stderr unaltered and exits with code 1 (Spec_CSharp_TextFinder_Entry.md §4 step 2).

Spec_TextFinder.md §2 leaves the wording of stderr text to each language, and §5.2 supplies reason lines without binding them. This implementation adopts §5.2's six parse-time reason lines unchanged, and this section is where they are fixed for C#:

| Condition                                                    | Reason line                             |
|--------------------------------------------------------------|-----------------------------------------|
| Token in switch position has no `/` or `-` introducer        | `not a switch: <token>`                 |
| Introducer-led token that is not a switch defined in §5      | `unrecognized switch: <token>`          |
| Switch is the last token, with no argument token following   | `missing argument for switch: <switch>` |
| Boolean switch given a value other than `true` or `false`    | `invalid boolean for <switch>: <token>` |
| `/P` given an empty argument                                 | `empty root path for switch: <switch>`  |
| `/r` given an empty argument                                 | `empty expression for switch: <switch>` |

`<token>` is the offending token and `<switch>` the switch, each reproduced exactly as typed, preserving the introducer. Adopting §5.2's wording rather than rewriting it costs nothing and leaves this implementation's stderr comparable with the other implementations', which Spec_TextFinder.md §6 no longer requires but does not forbid.

The diagnostic's embedded terminators are LF, since they are written into the string rather than produced by a writer. `CSharp_TextFinder_Entry` writes the string with `Console.Error.Write`, which appends nothing, so this implementation's stderr carries LF on every platform. Spec_TextFinder.md §3.4 leaves the stderr terminator to the platform and asks for no such thing; getting it costs one method choice, so this implementation takes it.

The seventh condition of §5.2, a malformed `/r`, is detected later: the `Dirnav` constructor compiles the expression and lets the framework's parse failure propagate, and `CSharp_TextFinder_Entry` composes that diagnostic, drawing its usage line from `UsageLine()`. Spec_CSharp_TextFinder_Entry.md §6 fixes its reason line, since the binary is what writes it.

There is no error condition for a duplicated switch or an empty `/p` list: duplicates resolve by §5 rule 4, and an empty extension list means every file is searched.

## 7. Extension-List Normalization

The `/p` argument arrives as one token; the shell has already removed the quotes. Normalization implements the `/p` rules of Spec_TextFinder.md §5: split the token on commas, trim each item, strip one leading `.` if present, trim it a second time, discard empty items, and preserve the order of the survivors.

The second trim is not redundant, and §5 requires it for a reason that shows only when the dot and the whitespace are separated. `". cs"` survives the first trim unchanged, the dot being the first character, and the strip then exposes the space: one trim alone yields `" cs"`, an extension no file can carry, and one that puts a second space into the §5.3 listing line, which §5.3 otherwise keeps free of stray whitespace. An item reduced to nothing by either trim is discarded, so the empties test comes last.

Spec_TextFinder.md §5 fixes which characters are trimmed, naming six of them, so this document chooses none of them and no two implementations can trim a different set. The six are held as a `char[]` and passed to `string.Trim(params char[])`, which trims exactly the characters given and no others. Both trims are that same call against that same array, so the six have one definition here.

Two framework methods are rejected by name, each because it looks correct and implements a different rule:

- **`string.Trim()`** with no argument trims every character `char.IsWhiteSpace` reports, a set that includes no-break space and the en and em spaces, so this implementation would accept an extension list another rejects.
- **`string.TrimStart('.')`** removes every leading dot, where §5 removes one. `..cpp` must normalize to `.cpp` and not to `cpp`. The dot is therefore stripped with an explicit length-one test.

Duplicates are retained — they are harmless to the membership test `CSharp_TextFinder_Dirnav` performs. Case folding is not applied here; the platform-dependent comparison fixed by Spec_TextFinder.md §5 is performed by `CSharp_TextFinder_Dirnav` when it matches a file name against the list.

## 8. Help Text and Option Listing

`HelpText` returns the text fixed by Spec_TextFinder.md §5.1 with `<executable>` replaced by `CSharp_TextFinder`. `UsageLine` returns its first line — the line that terminates every usage diagnostic (§6), exposed so that `CSharp_TextFinder_Entry` can compose the malformed-regex diagnostic. `HelpText` is built from `UsageLine`, so the synopsis has one definition.

The help body is held as a `string[]`, one element per line, joined with `"\n"`. A raw string literal would read better in the source and is not used: it carries the line terminators of the file it is written in, so an editor or a `.gitattributes` rule that rewrote this source to CRLF would change what the program prints. Spec_TextFinder.md §5.1 fixes the text and §3.4 fixes the terminator, so neither may depend on how this file is stored. Joining an array of lines makes the terminator a decision of this library rather than a property of its encoding, and the array's length is the line count a fixture can assert.

`OptionsText` returns the resolved option set, in the form Spec_TextFinder.md §5.3 fixes: one key/value pair per line, in §5 table order, `<switch> <value>` with a single separating space, one `/P` line per root path, the `/p` list joined by `, ` and emitting `/p` alone when empty, `/r` verbatim, and booleans in lower case. §5.3 gives the nine lines a bare `-v true` produces, and this method reproduces them. It chooses none of that form and must not be read as the place the form is decided.

Booleans render through a conditional expression yielding the literals `"true"` and `"false"`. `bool.ToString()` is not used: it returns `"True"` and `"False"`, which §5.3 forbids, and `ToString(CultureInfo.InvariantCulture)` returns the same. The two literals appear once each in this library.

One method serves all three cases §5.3 calls for, since the text is the same in each and only the caller's next move differs: `/v true`, after which traversal follows; the bare command line of §3.1, after which the process exits 0; and the invalid-regex diagnostic of §5.2, where the listing precedes that diagnostic on stdout whatever `/v` says and the process then exits 1. The listing reflects whatever `commands` holds, so its `/v` line reads `false` in the latter two unless `/v` was itself typed.

All three methods end their returned string with LF; none writes to a stream.

## 9. Build

Per [CSharp_TextFinder_Structure.md](../CSharp_TextFinder_Structure.md):

- .NET class library project `CSharp_TextFinder_Cmdline`, targeting `net8.0`.
- Depends on the base class library only. It references neither `CSharp_TextFinder_Dirnav`, nor `CSharp_TextFinder_Output`, nor any NuGet package.
- Its unit-test project sits under `test/` and is excluded from this project's compile items.

## 10. Non-Goals

- The library does not compile the regular expression; it checks only that the argument is non-empty.
- The library does not access the filesystem or verify that a root path exists.
- The library does not read the program's arguments; `Main` receives them and passes the array in.
