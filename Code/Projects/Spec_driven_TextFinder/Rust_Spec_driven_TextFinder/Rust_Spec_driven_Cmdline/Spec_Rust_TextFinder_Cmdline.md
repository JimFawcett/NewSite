# Spec_Rust_TextFinder_Cmdline — Command-Line Library Specification

Specification for the `rust_textfinder_cmdline` library of the Rust TextFinder implementation. This document is the Rust binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5, which remain the authority for switch syntax, meanings, and defaults; it inherits structural decisions from [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md). Its consumer is [Spec_Rust_TextFinder_Entry.md](../Rust_Spec_driven_TextFinder_Entry/Spec_Rust_TextFinder_Entry.md).

## 1. Purpose

`rust_textfinder_cmdline` converts the program's arguments into a program-command `struct` that controls the behavior of `rust_textfinder_dirnav` and `rust_textfinder_output`. It is the single place in the Rust implementation where switch letters, argument syntax, and defaults are known. It performs no traversal, no matching, no file I/O, and no stream writing.

## 2. Scope

This spec covers only the library. Collection of the arguments, consumption of the parsed result, exit codes, and which stream receives a diagnostic are specified in Spec_Rust_TextFinder_Entry.md.

## 3. Responsibilities

The library:

- Is implemented as a Rust library crate targeting edition 2021, using idiomatic Rust constructs.
- Exports a `ProgramCommands` struct and a parse entry that converts a slice of argument strings into it, applying the syntax rules, defaults, and multiple-occurrence rules of Spec_TextFinder.md §4–§5.
- Reports every command-line error by returning a diagnostic string in the `Err` variant; it opens no stream, panics on no input, and does not terminate the process. `unwrap` and `expect` appear nowhere in it.
- Renders the help text of Spec_TextFinder.md §5.1, its usage line, and the resolved-option listing as strings, for `rust_textfinder_entry` to write — help and options to stdout, the usage line to stderr within a diagnostic.

## 4. Public Interface

The crate root `lib.rs` declares package `rust_textfinder_cmdline` and exports the following:

```rust
pub struct ProgramCommands {
    pub root_paths: Vec<String>,    // /P
    pub extensions: Vec<String>,    // /p
    pub regex_text: String,         // /r
    pub recurse: bool,              // /s
    pub suppress_on_no_match: bool, // /h
    pub verbose: bool,              // /v
    pub help: bool,                 // /H
    pub line_numbers: bool,         // /n
    pub matched_line: bool,         // /L
}

impl Default for ProgramCommands {
    fn default() -> Self {
        ProgramCommands {
            root_paths: vec![String::from(".")],
            extensions: Vec::new(),
            regex_text: String::from("."),
            recurse: true,
            suppress_on_no_match: true,
            verbose: false,
            help: false,
            line_numbers: false,
            matched_line: false,
        }
    }
}

pub fn parse(args: &[String]) -> Result<ProgramCommands, String>;
pub fn usage_line() -> String;
pub fn help_text() -> String;
pub fn options_text(commands: &ProgramCommands) -> String;
```

The field comments are the switch-to-field mapping, and the `Default` implementation is the sole authority in code for the defaults of Spec_TextFinder.md §5; `ProgramCommands::default()` equals the result of parsing an empty command line. Spec_TextFinder.md §5 remains the authority overall, and a disagreement between the two is a defect in this crate.

`ProgramCommands` derives `Clone` and `Debug` and has no invariants: every field combination the parser can produce is valid. `Dirnav` borrows the value `rust_textfinder_entry` owns rather than cloning it, so that value must outlive the `Dirnav` it was passed to, which the borrow checker enforces rather than leaving to convention.

`parse` returns the resolved commands on success and a usage diagnostic (§6) on failure; it writes nothing. `regex_text` is the `/r` argument verbatim — compilation happens at `Dirnav` construction, per Spec_Rust_TextFinder_Entry.md §4 step 8.

## 5. Parsing Rules

`parse` scans `args[1..]` left to right, alternating switch token and argument token; `args[0]` is the program name and is not inspected. It stops at the first violation and returns that diagnostic; no partial result is produced. It touches no filesystem: root paths are not tested for existence, and extensions are not compared against any file.

The binary collects the arguments and hands them over as already-decoded `String` values, per Spec_Rust_TextFinder_Entry.md §4 step 1. This library therefore never sees an undecodable argument and defines no behavior for one.

1. **Switch tokens.** A token in switch position is valid only when it is exactly two characters, the first `/` or `-`, the second one of the nine letters in Spec_TextFinder.md §5. A token with no introducer is *not a switch*; any other introducer-led token, including a bare `/` or `-`, is an *unrecognized switch*.
2. **Arguments.** Each switch consumes the following token verbatim, including when that token begins with `/` or `-`, since there are no bare flags. A switch with no following token is *missing its argument*.
3. **Conversion.** Boolean switches (`/s`, `/h`, `/v`, `/H`, `/n`, `/L`) accept only `true` or `false`, compared with `eq_ignore_ascii_case`. `/r` and `/P` take the token verbatim, and each rejects an empty argument — *an empty root path* for `/P`, *an empty expression* for `/r`. `/p` is normalized per §7.
4. **Accumulation.** `/P` clears the default `vec![String::from(".")]` on its first occurrence and appends thereafter, preserving argument order. Every other switch overwrites any earlier value, silently discarding it. The first occurrence is tracked by a local flag rather than inferred from the vector's contents, since `-P .` is indistinguishable by value from the default.

## 6. Error Conditions

Every violation in §5 is a usage error. `parse` returns a usage diagnostic in the shape Spec_TextFinder.md §5.2 binds — a reason line, a newline, then `usage_line()`. `rust_textfinder_entry` writes the returned string to stderr unaltered and exits with code `1` (Spec_Rust_TextFinder_Entry.md §4 step 2).

Spec_TextFinder.md §2 leaves the wording of stderr text to each language, and §5.2 supplies reason lines without binding them. This implementation adopts §5.2's six parse-time reason lines unchanged, and this section is where they are fixed for Rust:

| Condition                                                    | Reason line                             |
|--------------------------------------------------------------|-----------------------------------------|
| Token in switch position has no `/` or `-` introducer        | `not a switch: <token>`                 |
| Introducer-led token that is not a switch defined in §5      | `unrecognized switch: <token>`          |
| Switch is the last token, with no argument token following   | `missing argument for switch: <switch>` |
| Boolean switch given a value other than `true` or `false`    | `invalid boolean for <switch>: <token>` |
| `/P` given an empty argument                                 | `empty root path for switch: <switch>`  |
| `/r` given an empty argument                                 | `empty expression for switch: <switch>` |

`<token>` is the offending token and `<switch>` the switch, each reproduced exactly as typed, preserving the introducer. Adopting §5.2's wording rather than rewriting it costs nothing and leaves this implementation's stderr comparable with the C++ one, which Spec_TextFinder.md §6 no longer requires but does not forbid.

The seventh condition of §5.2, a malformed `/r`, is detected later: `Dirnav::new` compiles the expression and returns its failure, and `rust_textfinder_entry` composes that diagnostic, drawing its usage line from `usage_line()` below (§8). Spec_Rust_TextFinder_Entry.md §6 fixes its reason line, since the binary is what writes it. Neither this library nor `rust_textfinder_dirnav` composes it — the one supplies a string, the other reports the failure, and the binary joins them.

There is no error condition for a duplicated switch or an empty `/p` list: duplicates resolve by §5 rule 4, and an empty extension list means every file is searched.

## 7. Extension-List Normalization

The `/p` argument arrives as one token; the shell has already removed the quotes. Normalization implements the `/p` rules of Spec_TextFinder.md §5: split the token on commas, trim each item, strip one leading `.` if present, trim it a second time, discard empty items, and preserve the order of the survivors. `strip_prefix('.')` removes the dot, and one call removes at most one.

The second trim is not redundant, and §5 requires it for a reason that shows only when the dot and the whitespace are separated. `". cpp"` survives the first trim unchanged, the dot being the first character, and the strip then exposes the space: one trim alone yields `" cpp"`, an extension no file can carry, and one that puts a second space into the §5.3 listing line, which §5.3 otherwise keeps free of stray whitespace. Both trims test the same six characters. An item reduced to nothing by either trim is discarded, so the empties test comes last.

Spec_TextFinder.md §5 fixes which characters are trimmed, naming six of them, so this document chooses none of them and no two implementations can trim a different set.

`str::trim` does not implement that rule and is not used: it trims every character Unicode calls whitespace, a set that includes no-break space and the en and em spaces, and this implementation would then accept an extension list another rejects. `char::is_ascii_whitespace` does not implement it either — it omits vertical tab, which §5 names. The test is against the six characters §5 lists and nothing else.

Duplicates are retained — they are harmless to the membership test `rust_textfinder_dirnav` performs. Case folding is not applied here; the platform-dependent comparison fixed by Spec_TextFinder.md §5 is performed by `rust_textfinder_dirnav` when it matches a file name against the list.

## 8. Help Text and Option Listing

`help_text` returns the text fixed by Spec_TextFinder.md §5.1 with `<executable>` replaced by `rust_textfinder`. `usage_line` returns its first line — the line that terminates every usage diagnostic (§6), exported so that `rust_textfinder_entry` can compose the malformed-regex diagnostic. `help_text` is built from `usage_line`, so the synopsis has one definition.

`options_text` returns the resolved option set, in the form Spec_TextFinder.md §5.3 fixes: one key/value pair per line, in §5 table order, `<switch> <value>` with a single separating space, one `/P` line per root path, the `/p` list joined by `, ` and emitting `/p` alone when empty, `/r` verbatim, and booleans in lower case. §5.3 gives the nine lines a bare `-v true` produces, and this function reproduces them. It chooses none of that form and must not be read as the place the form is decided.

One function serves all three cases §5.3 calls for, since the text is the same in each and only the caller's next move differs: `/v true`, after which traversal follows; the bare command line of §3.1, after which the process exits 0; and the invalid-regex diagnostic of §5.2, where the listing precedes that diagnostic on stdout whatever `/v` says and the process then exits 1. The listing reflects whatever `commands` holds, so its `/v` line reads `false` in the latter two unless `/v` was itself typed.

All three functions end their returned string with a newline; none writes to a stream.

## 9. Build

Per [Rust_TextFinder_Structure.md](../Rust_TextFinder_Structure.md):

- Cargo library package `rust_textfinder_cmdline`.
- Depends on the standard library only. Declares neither `rust_textfinder_dirnav`, nor `rust_textfinder_output`, nor any third-party crate.

## 10. Non-Goals

- The library does not compile the regular expression; it checks only that the argument is non-empty.
- The library does not access the filesystem or verify that a root path exists.
- The library does not collect the program's arguments and does not decide what an undecodable argument means; the binary settles both before calling `parse`.
