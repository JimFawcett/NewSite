# Spec_CSharp_TextFinder_Dirnav — Directory Navigation Library Specification

Specification for the `CSharp_TextFinder_Dirnav` library of the C# TextFinder implementation. This document is the C# binding of [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.2–§3.4, which remain the authority for traversal, matching, and output behavior; it inherits structural decisions from [CSharp_TextFinder_Structure.md](../CSharp_TextFinder_Structure.md). Its consumer is [Spec_CSharp_TextFinder_Entry.md](../CSharp_Spec_driven_TextFinder_Entry/Spec_CSharp_TextFinder_Entry.md); it takes its commands from [Spec_CSharp_TextFinder_Cmdline.md](../CSharp_Spec_driven_Cmdline/Spec_CSharp_TextFinder_Cmdline.md).

## 1. Purpose

`CSharp_TextFinder_Dirnav` walks a directory tree, reads each selected file, evaluates the regular expression against each line, and formats every matching file into the block Spec_TextFinder.md §3.4 fixes, emitting each of its lines as it is produced. It is the only component that touches file contents, and it writes to no stream.

## 2. Scope

This spec covers only the library. Command-line parsing is specified in Spec_CSharp_TextFinder_Cmdline.md, skip-list ownership and process-level concerns in Spec_CSharp_TextFinder_Entry.md, and the destination of emitted strings in Spec_CSharp_TextFinder_Output.md.

## 3. Responsibilities

The library:

- Is a .NET class library targeting `net8.0`, written in idiomatic C# with nullable reference types enabled.
- Defines the `IOutput` interface and binds to a concrete implementation of it through a generic type parameter.
- Constructs the `/r` expression once and reuses it for every line of every file across every root path.
- Implements the traversal, file-admission, matching, and announcement behavior of Spec_TextFinder.md §3.2–§3.4, emitting every block line and announcement through `IOutput`.

## 4. Public Interface

Namespace `CSharp_TextFinder_Dirnav` exports the following:

```csharp
public interface IOutput
{
    void Output(string text);
}

public sealed class Dirnav<TOutput> where TOutput : IOutput
{
    public Dirnav(TOutput output, IReadOnlyList<string> skips, ProgramCommands commands);

    public void Search(string root);

    public void EmitRunSummary();
}
```

The constructor builds a `System.Text.RegularExpressions.Regex` from `commands.RegexText` — the engine Spec_TextFinder.md §6.1 assigns to C# — and lets the framework's `RegexParseException` propagate when the pattern will not compile. `CSharp_TextFinder_Entry` catches that type and maps it to the malformed-regex usage diagnostic of Spec_TextFinder.md §5.2. A constructor that throws on an argument it cannot accept is the C# expression of a failed construction; there is no result type in the base class library to return instead, and a `TryCreate` factory would put the type's only failure mode behind a second entry point for no gain. `CSharp_TextFinder_Cmdline` guarantees the text is non-empty, so the constructor never sees an empty expression.

`RegexOptions.None` is passed. `RegexOptions.Compiled` would trade startup time for match speed and is not used: the run is short-lived and a JIT pass over the pattern costs more than it returns on a tree of this size. `RegexOptions.NonBacktracking` is not used either, because it rejects constructs Spec_TextFinder.md §6.1 admits into the portable subset and would make this implementation refuse patterns the other three accept.

The three constructor arguments are references the caller owns and the garbage collector keeps alive. `skips` is an `IReadOnlyList<string>` rather than a `List<string>`, so this library cannot modify the list it is given — the nearest C# has to the shared borrow the Rust implementation gets from its type system, and weaker: a caller holding the underlying `List<string>` may still change it. Nothing in this library does, and Spec_CSharp_TextFinder_Entry.md §5 fixes that the entry stops extending the list before traversal begins.

`Search` returns nothing: every failure it meets is announced through `IOutput` per §5, so the caller has nothing to report on its behalf. A single instance is reused across every root path, so the expression is built once per run. `Search` carries no state from one call to the next but for the two run counts of §8.1, which accumulate across calls by design.

`EmitRunSummary` writes the run summary Spec_TextFinder.md §3.6 requires and is called once, by `CSharp_TextFinder_Entry`, after the last `Search` returns. It takes no argument and returns nothing: the counts are this instance's own, and the sole reason the call sits with the caller is that only the caller knows which root was the last. No property exposes either count — the summary line is the whole of what they are for, and a test reads them by reading that line through its own `IOutput`.

`Search` takes a `string` rather than a path type. .NET has no path value type, and `System.IO.Path` is a static class of string operations, so the root is the text the user typed and §8's rendering works from that text directly.

## 5. Traversal Rules

1. **Root paths.** A root path that resolves to a regular file is searched as that single file; one that resolves to a directory is traversed. A root that is a symbolic link, is neither a regular file nor a directory, or cannot be opened, is announced per Spec_TextFinder.md §3.4 and traversal of it stops there. The root's kind comes from `File.GetAttributes`, which reports the attributes of the entry itself and does not follow a symbolic link. `Directory.Exists` and `File.Exists` are not used to classify it: both follow a link and would report the target's kind, hiding the very case §3.2 requires be announced, and both answer `false` for an entry that exists and cannot be opened, which would turn an error announcement into silence.
2. **Order and descent.** Traversal follows the depth-first visit order of Spec_TextFinder.md §3.2. The recursion is written explicitly: one method iterates a directory and calls itself on each subdirectory it decides to enter, so entries are handled as `Directory.EnumerateFileSystemEntries` yields them, without being collected or reordered. That method enumerates a single level, returns entries lazily, and interleaves files and directories as the platform presents them, which is the facility §3.2 requires an implementation to enumerate through. Three alternatives are rejected by name: `Directory.GetFileSystemEntries` materializes the level into an array, which changes no order but reads the whole directory before the first entry is handled; `Directory.GetFiles` followed by `Directory.GetDirectories` groups files ahead of directories, which §3.2 forbids; and `EnumerationOptions { RecurseSubdirectories = true }` owns the descent this library must own, since `/s` and the skip list both decide whether to enter a directory.
3. **Recursion.** Subdirectories are descended only when `/s` is `true`. When `/s` is `false`, only the entries of the root path itself are considered.
4. **Skip list.** A skip-list entry is compared against the directory's basename by the rule §6 states for an extension — the same rule, applied by the same method, since Spec_TextFinder.md §3.2 and §5 fix one comparison for both. A directory matching an entry is pruned silently; a pruned directory is not a failure and is not announced. The list is consulted for every directory met during traversal but never for a root path, which §3.2 exempts because the user named it explicitly: a root named `build` is traversed, and a `build` directory found beneath it is pruned. The list applies to directory names only, so a root path that is a regular file is searched whatever its name.
5. **Symbolic links.** A directory entry whose attributes carry `FileAttributes.ReparsePoint` is passed over silently, whatever its target, since no attempt is made to open it. .NET sets that attribute for a symbolic link on both Windows and POSIX, so one runtime test serves both platforms.
6. **Names the runtime cannot carry.** Spec_TextFinder.md §3.4 settles what happens to an entry whose name the implementation's string type cannot render, and the case resolves differently in C# than in either sibling. A `string` is a sequence of UTF-16 code units and may hold unpaired surrogates, so on Windows every name the filesystem admits renders and this case does not arise. On POSIX the runtime decodes a name that is not valid UTF-8 before this library sees it, substituting U+FFFD, and the substituted text no longer names the file on disk; the attributes query of rule 7 therefore fails and the entry draws `cannot open` carrying the already-substituted name. This implementation performs no substitution of its own and runs no name test of its own: §3.4's U+FFFD requirement is met by the runtime, and the announcement is reached through rule 7 rather than through a gate of its own. Two consequences are recorded rather than left to be discovered. The announcement's path is the substituted text, which §3.4 accepts as one of its two costs. And §3.4's rule that rendering a name may not end the run is satisfied without a `catch` around a conversion, because this library performs no conversion: the failure surfaces as an exception from a filesystem call, which rule 7 already contains.
7. **Failed opens.** Any file or directory that cannot be opened draws the error announcement `cannot open`; a directory so announced is pruned, a file so announced is not searched. Every filesystem call this library makes is wrapped so that `IOException`, `UnauthorizedAccessException`, and `ArgumentException` resolve to that announcement rather than propagating. The third covers a path string the platform will not accept, which the framework reports by argument validation rather than by a failed call. An error met while enumerating a directory is treated the same way, so a directory that becomes unreadable part way through is announced rather than silently truncated. Error announcements are not gated on `/h`, per Spec_TextFinder.md §3.4.

A symbolic link is tested before rule 7 reaches the entry, so a link whose target is unreachable is passed over silently rather than announced: rule 5 turns on the entry's own attributes, which one query supplies, and §3.2 asks for silence there.

Nothing in traversal propagates an exception to the caller. The three exception types named in rule 7 are the ones the filesystem calls of this library document, and each is caught at the point of the call.

One limit of rule 1 is recorded rather than left to be found. Spec_TextFinder.md §3.2 has a root that resolves to neither a regular file nor a directory announced rather than searched, and `FileAttributes` carries no flag that distinguishes a regular file from a FIFO, a socket, or a device node. This implementation therefore treats every entry that is neither a directory nor a reparse point as a regular file. Such an entry is attempted, and a read that fails draws `cannot open` through rule 7 rather than through the kind test of rule 1. The announcement §3.2 asks for is emitted either way; what differs is that it reports the failed read rather than the kind, and an entry of that sort whose read succeeds is searched. No suite exercises this, since the fixtures create no such entry.

## 6. File Selection

Selection follows the `/p` rules of Spec_TextFinder.md §5, which fix the extension definition, the empty-list and no-extension cases, and the platform-dependent comparison. The list arrives from `CSharp_TextFinder_Cmdline` already normalized to bare extensions.

The extension is taken as the text after the last `.` in the file name, with no special case for a leading dot, and a name holding no `.` at all has no extension. `Path.GetExtension` is not used. It happens to agree with §5 on the dot-file case, returning `.gitignore` for `.gitignore` where the C++ implementation's `path::extension()` returns nothing, but §5 states the rule over the file name and implementing it with one `LastIndexOf('.')` puts the dot-file case in this library's own code rather than resting it on a framework detail that no document in this tree fixes.

The file name comes from the last `/` or `\` in the entry path, since this library builds paths from text and does not ask the framework to parse them.

Comparison is case-sensitive on POSIX and case-insensitive on Windows, per Spec_TextFinder.md §3.2 and §5. The platform test is `OperatingSystem.IsWindows()`, evaluated at run time. That is a constraint of the platform rather than a preference: a .NET assembly is compiled once and runs on both Windows and POSIX, so the C++ implementation's `#ifdef _WIN32` and the Rust implementation's `#[cfg(windows)]` have no counterpart here — a conditional-compilation test would fix the behavior of the machine that built the assembly rather than the machine that runs it.

The comparison itself is `StringComparison.OrdinalIgnoreCase` on Windows and `StringComparison.Ordinal` elsewhere. The culture-sensitive forms are not used: `CurrentCultureIgnoreCase` folds `I` and `i` differently under a Turkish culture, which would make the same tree and the same `/p` list select different files on two machines of the same platform.

Selection applies uniformly: a root path that is a regular file is filtered by `/p` like any other file.

## 7. Content Decoding and Line Splitting

A selected file is put to the three admission tests of Spec_TextFinder.md §3.3. The size test is applied to the length `FileInfo.Length` reports, so a file above the limit is never read into memory; the NUL and UTF-8 tests are applied to the bytes read. The limit is 10,485,760 bytes, the number §3.3 fixes.

The constructor records whether the run satisfies §3.3's no-content case — `RegexText` equal to `.` with `LineNumbers` and `MatchedLine` both `false`. When it does, a selected file that passes the size test and is not empty produces a block of its path line alone, and the file is never opened.

No file announcement accompanies that block. `searched` reports a file that was read and matched nothing and `skipped` reports one a content test rejected, and in this case neither happened — every selected file matches — so the library emits neither, whatever `/h` says. A selected file of zero size produces no block and draws no announcement either. The size test still runs on filesystem metadata, so a file above the limit still draws `too large`, and one whose metadata cannot be read still draws `cannot open`.

A file that needs reading is read in full with `File.ReadAllBytes`, so one failing a later test is skipped entirely rather than searched in part. The NUL test asks whether the bytes hold a zero.

The UTF-8 test decodes the bytes with a `UTF8Encoding` constructed `throwOnInvalidBytes: true`, and a `DecoderFallbackException` means the file is rejected. `Encoding.UTF8.GetString` is rejected by name and the rejection is the sharpest in this document: that property returns an encoding whose fallback substitutes U+FFFD for an invalid sequence and reports nothing, so every file would pass the UTF-8 test and a UTF-16 file of ASCII text — the case §3.3 names — would be searched with its NUL bytes already caught and its mojibake silently accepted. The framework's own default is the wrong tool here, and the constructed encoding is the right one.

A leading UTF-8 BOM is consumed and does not belong to the first line. The `UTF8Encoding` is constructed `encoderShouldEmitUTF8Identifier: false`, which governs writing and not reading, so the BOM survives decoding as U+FEFF and is stripped from the head of the decoded text. It is stripped after the admission tests, so its three bytes count toward the size limit and toward the NUL scan like any others.

Lines are then split per Spec_TextFinder.md §3.3: LF, CRLF, and bare CR each terminate a line, and a final unterminated run is a line. `TextReader.ReadLine`, over a `StringReader` on the decoded text, implements exactly that rule — its three terminators are §3.3's three, and it yields a final unterminated run as a line — so this library writes no splitter of its own. `string.Split('\n')` is rejected by name: it does not treat a bare CR as a terminator, it leaves a CR at the end of every line of a CRLF file, and it yields a trailing empty element for a file that ends in a terminator. Line numbers count every line, including those that do not match.

## 8. Matching and Emission

The expression is evaluated against each line with `Regex.IsMatch`, which gives the anywhere-in-the-line match Spec_TextFinder.md §3.3 requires and asks the engine for nothing more — no match position, no matched substring, no capture group. The instance method is used rather than the static `Regex.IsMatch(input, pattern)` overload, which consults a pattern cache and would defeat §3.3's requirement that the expression be compiled once per invocation.

The line is passed as a `string`, so `.`, a character class, and a class escape each match one UTF-16 code unit. Spec_TextFinder.md §6.1 records `std::regex` over `char` as the one engine of the four that matches a byte instead, so on a line holding a non-ASCII character below U+10000 this implementation agrees with the Rust and Python implementations and the C++ one is the outlier. Above U+10000 a `.` matches one code unit of a surrogate pair here where the Rust engine matches the whole scalar value; §6.1's portable subset is scoped to ASCII lines, so this difference falls outside what that section guarantees and is recorded rather than resolved.

A matching file is emitted as the block Spec_TextFinder.md §3.4 fixes. The library writes the path line through `IOutput` at the first match, ahead of the detail line for that same match, and tracks per file whether it has done so — a file that never matches must produce no line at all, and a file that matches many must produce its path line once. When `LineNumbers` and `MatchedLine` are both `false` the block has no detail lines, so the loop over a file's lines returns as soon as the path line is written. Otherwise the loop runs to the end of the file, writing one detail line — two spaces of indent, then the fields `/n` and `/L` select — as each matching line is evaluated. Nothing is accumulated for the file: `IOutput` receives each line as it is produced.

Block form, indent, field separator, emission timing, and path rendering are fixed by Spec_TextFinder.md §3.4. `<path>` begins with the root path `Search` was given, as §3.4 requires, and is built by joining that root's text with the entry names descended through. `Path.Combine` is rejected by name: it joins with `Path.DirectorySeparatorChar`, which on Windows is `\`, and would make the same tree produce different output on two platforms. `Path.GetFullPath` is rejected too, since §3.4 asks for the path by which the file was reached rather than its absolute form.

§3.4 requires `/` on every platform for the whole of `<path>`, the root's own text included, so a separator the user typed is normalized too: `-P src\sub` on Windows yields `src/sub/file.cs`, not `src\sub/file.cs`. Every `\` in a root path's text becomes `/` before the first entry name is appended. A root path of `.` contributes no leading `./`.

The path this library hands to the filesystem is not the path it emits. Filesystem calls take the platform form, built with the platform separator, and the emitted form is built alongside it with `/`. Two strings are therefore carried through the walk for each entry, and the alternative — emitting one and translating at the point of the call — would put a translation in every filesystem call rather than one join per entry.

Announcements are emitted through the same `IOutput` in the forms and under the gating of Spec_TextFinder.md §3.4, and are emitted as the library goes. Neither waits on the completion of the directory holding the entry it names, and neither is accumulated for emission at the end of the run. An error announcement is emitted at the point the failure is met and is not gated on `/h`.

A file announcement reports only a file that produced no block, so it never repeats a path the output already carries. `commands.SuppressOnNoMatch` — the `/h` property — decides whether one is emitted at all:

- `true`, the default: none is. A file searched without matching, and a file a content test rejected, each contribute nothing to the output.
- `false`: a file searched without matching draws `searched <path>` once its last line has been evaluated, which is the first moment the library knows it matched nothing; a file rejected by a content test draws `skipped <path>` at the point of rejection.

The no-content case of §7 produces a block for every selected non-empty file and so draws no file announcement under either setting.

### 8.1 Run Summary

Spec_TextFinder.md §3.6 puts the two run counts in this library, for every implementation alike, and fixes the line they produce. Two `long` fields hold them, both zero on construction, and neither is reset by `Search`, so they accumulate over every root the instance is given.

The file count is incremented at the head of `Examine`, which both call sites reach only after the `/p` test of §6 admits the file, and which is entered before `FileInfo.Length` is read. Everything §3.6 excludes is therefore excluded by construction rather than by a second test — an entry refused by `/p`, a reparse point, and an entry beneath a pruned directory never reach `Examine`, and an entry whose attributes cannot be read draws `cannot open` before selection is even attempted. A file admitted and then announced `too large` or `cannot open` is counted, the increment standing ahead of both.

The directory count is incremented at the head of `Walk`, before `Directory.EnumerateFileSystemEntries`, so a directory that cannot be enumerated is counted and announced alike. A root path that resolved to a directory reaches `Walk` and is counted; a pruned directory and, under `/s false`, every subdirectory never reach it and are not.

`EmitRunSummary` writes one line through `IOutput`, in the fixed form of Spec_TextFinder.md §3.6, formatted with `CultureInfo.InvariantCulture` as §8's detail lines are, so no locale puts a grouping separator in either count:

    accessed <files> files, <directories> directories

Neither noun is inflected. The line is not gated on `/h`, `/h` governing file announcements alone, and it names no path, so §8's rendering rules do not reach it. `CSharp_TextFinder_Entry` calls it only on a run that traversed, per §3.6 and Spec_CSharp_TextFinder_Entry.md §4.

## 9. Build

Per [CSharp_TextFinder_Structure.md](../CSharp_TextFinder_Structure.md):

- .NET class library project `CSharp_TextFinder_Dirnav`, targeting `net8.0`.
- References `CSharp_TextFinder_Cmdline` for `ProgramCommands`. `System.Text.RegularExpressions` ships with the framework, so no NuGet package is referenced. It does not reference `CSharp_TextFinder_Output`, which supplies the generic argument at the point of use.
- Its unit-test project sits under `test/` and is excluded from this project's compile items.

## 10. Non-Goals

- The library does not parse the command line and does not read the program's arguments.
- The library does not own or extend the skip list, and does not implement the skip-list extension point.
- The library does not modify files, follow symbolic links, or report an exit code.
