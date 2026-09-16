# Spec_CSharp_TextFinder_Entry — Binary Entry Point Specification

Specification for the `CSharp_TextFinder_Entry` binary of the C# TextFinder implementation. This document refines [Spec_TextFinder.md](../../Spec_TextFinder.md) and inherits structural decisions from [CSharp_TextFinder_Structure.md](../CSharp_TextFinder_Structure.md).

## 1. Purpose

`CSharp_TextFinder_Entry` is the command-line entry point of the C# TextFinder. It parses the program's arguments, wires the three libraries together, and drives directory traversal. Matching and file I/O belong to `CSharp_TextFinder_Dirnav` and `CSharp_TextFinder_Output`; the binary performs neither.

The binary does write process-level text of its own — help, the resolved option listing, and startup diagnostics — but it composes none of it. Each is a string `CSharp_TextFinder_Cmdline` hands it, and the binary decides only when to write it and to which stream. Block lines and announcements it neither composes nor writes.

## 2. Scope

This spec covers only the binary. Switch behavior is defined in the parent [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5. Library behavior is specified in each library's own `Spec_*.md`.

## 3. Responsibilities

The binary:

- References `CSharp_TextFinder_Cmdline`, `CSharp_TextFinder_Dirnav`, and `CSharp_TextFinder_Output`.
- Takes the program's arguments as the `string[]` the runtime hands `Main`. §8 states the one encoding consequence, which is that there is none.
- Owns the skip list and implements the build-time extension point Spec_TextFinder.md §3.5 defines, not exposed at runtime.
- Passes the arguments to `CSharp_TextFinder_Cmdline` to obtain a `ProgramCommands` in which every switch already carries its supplied value or its default — the `.` root included, so the option listing has a root path to name whether or not `/P` was typed.
- Obtains `HelpText()`, `UsageLine()`, and `OptionsText(commands)` from `CSharp_TextFinder_Cmdline`, which owns all three and fixes their text against Spec_TextFinder.md §5.1, §5.2, and §5.3 respectively.
- Constructs the process's one `StdoutSink`, holds it in a `using` statement, and writes its own stdout text through it rather than through a writer of its own.
- Constructs a `Dirnav<StdoutSink>`, passing the sink, the finalized skip list, and the parsed commands.
- Drives traversal across every supplied root path using the single reused `Dirnav`, then asks it for the run summary of Spec_TextFinder.md §3.6 once the last root path is finished.
- Handles process-level concerns: the bare command line of Spec_TextFinder.md §3.1, `/H` help, the `/v` option listing, exit codes, and top-level diagnostics.

## 4. Startup Sequence

`static int Main(string[] args)` performs the following steps in order.

1. Invoke `CommandLine.TryParse(args, out commands, out diagnostic)`. On `false`, write the returned diagnostic to stderr unaltered with `Console.Error.Write` and return 1. A malformed `/r` is not detected here; step 6 reaches it.

   There is no argument-decoding step before this one. The runtime decodes the command line and hands `Main` a `string[]`, so the argument collection and decode that the Rust implementation performs, and the exit code it reserves for a failure there, have no counterpart. §8 records that as a stated property rather than an omission.

2. Construct the `StdoutSink`. On `InvalidOperationException` or `IOException` (Spec_CSharp_TextFinder_Output.md §4), write `cannot initialize output` to stderr and return 2 — the code Spec_TextFinder.md §3.4 fixes for a failure that is not about the command line. Every later write to stdout passes through this object, so it is constructed before any of them.

   The construction sits in a `try` block and the sink is then held by a `using` statement covering the rest of `Main`. A `using` declaration on the constructor call would put the construction inside the block it introduces, where a `catch` cannot reach it; splitting the two is what lets the failure be handled and the disposal still be guaranteed. This is the C# counterpart of the `std::optional` the C++ implementation uses for the same reason.

3. If the parsed commands indicate `/H true`, write `HelpText()` through the sink with `WriteText`, return 0, and do not proceed.

4. If `args` is empty, write `OptionsText(commands)` through the sink, return 0, and do not proceed. This is the bare command line of Spec_TextFinder.md §3.1, and it succeeds: nothing was asked for and nothing failed. `commands` here is a newly constructed `ProgramCommands`, so the listing names every default and its `/v` line reads `false`, per Spec_TextFinder.md §5.3.

   The test is `args.Length == 0` and not `args.Length == 1`. `Main`'s array holds the arguments alone, so an empty array is the bare command line; the C++ implementation tests `argc == 1` and the Rust implementation tests a length of 1 because their vectors carry the executable name. The binary reads the array's length for this test and nothing else; it inspects no element of it.

5. If `/v true`, write `OptionsText(commands)` through the sink, in the form Spec_TextFinder.md §5.3 fixes, before traversal begins. Steps 4 and 5 are mutually exclusive: a command line bearing `/v` is not empty.

6. Finalize the skip list: the defaults listed in §5 of this document with the extension calls compiled into the binary applied. Then construct the `Dirnav<StdoutSink>`, passing the sink, that list, and the parsed commands. Expression construction occurs here, and the constructor throws `RegexParseException` when the `/r` expression will not compile. On that exception:
   1. If step 5 did not already write it, write `OptionsText(commands)` through the sink now, so that the user sees the `/r` line carrying the expression that failed. Spec_TextFinder.md §5.2 requires this listing whatever `/v` says, and §5.3 requires it not be repeated when `/v` already produced it.
   2. Call `Flush` on the sink, so that the listing reaches the stream ahead of the diagnostic that explains it. The sink buffers stdout without per-line flushing (Spec_CSharp_TextFinder_Output.md §7), so without this the two arrive out of order.
   3. Compose the usage diagnostic in the shape Spec_TextFinder.md §5.2 binds — the reason line `invalid regex for switch: /r`, a newline, then `UsageLine()` — and write it to stderr. §6 fixes that reason line for this implementation. The binary composes it; neither `CSharp_TextFinder_Cmdline` nor `CSharp_TextFinder_Dirnav` does, the former supplying only `UsageLine()` and the latter only the failure that triggers it. The message the framework puts in `RegexParseException` is not written, for a reason that outlives §5.2's wording: that text is the framework's, so a runtime upgrade would change this program's output without any document in this tree recording the change.
   4. Return 1, having traversed nothing.

   `RegexParseException` is caught by its own type rather than as `ArgumentException`, which it derives from. A broader `catch` would also swallow an argument defect in this binary's own call and report it as a malformed user pattern.

7. For each root path in the parsed commands, in the order `/P` gave them, invoke `Search` on the same `Dirnav`, then continue with the next root path. A root path that cannot be searched — unopenable, a symbolic link, or neither a regular file nor a directory — is announced by `CSharp_TextFinder_Dirnav` itself, per Spec_TextFinder.md §3.4; the binary neither formats nor inspects that notice, and no root-path outcome affects the exit code.

8. Call `EmitRunSummary` on that same `Dirnav`, once, after the last root path returns. This writes the run summary Spec_TextFinder.md §3.6 requires. The binary supplies no count and composes no text — the counts are the library's, per Spec_CSharp_TextFinder_Dirnav.md §8.1 — and its whole part is knowing that step 7 is finished, which nothing inside the library can know. Every return above precedes step 7, so no run that skipped traversal reaches this step: `/H`, the bare command line, a parse failure, and a malformed `/r` each leave at their own step, which is what §3.6 requires of a summary.
9. Return 0.

Every exit above returns from `Main`, never calling `Environment.Exit`. The sink is held by a `using` statement, and only a return leaves that statement and disposes the sink, which flushes its stdout buffer (Spec_CSharp_TextFinder_Output.md §7). Steps 3, 4, and 6 each write to stdout and then leave, and `Environment.Exit` would terminate the process with the buffer unwritten.

Nothing writes to stderr before stdout has been flushed. Step 1 predates the sink and so has no buffer to flush; step 2 fails before one exists; step 6 flushes explicitly. `CSharp_TextFinder_Output` applies the same rule to its own runtime notice, per Spec_CSharp_TextFinder_Output.md §6.

Every stderr write in this binary uses `Console.Error.Write` with an explicit `\n` rather than `Console.Error.WriteLine`. `WriteLine` appends `Environment.NewLine`, which is CRLF on Windows. Spec_TextFinder.md §3.4 leaves the stderr terminator to the platform and would permit CRLF here; writing LF costs one method choice and makes this implementation's stderr identical on both platforms, so it is fixed here.

## 5. Skip List

`CSharp_TextFinder_Entry` owns the process-wide skip list. It is initialized with the defaults specified in Spec_TextFinder.md §3.2:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The binary holds the list in a private static field and implements the extension point of Spec_TextFinder.md §3.5:

```csharp
private static readonly List<string> SkipList = new() { /* the eleven defaults */ };

private static void AddSkipDirectory(string name);
```

`AddSkipDirectory` takes the name alone, as §3.5 writes it, and returns `void`. §3.5 fixes the shape and leaves the spelling to each language, so the name is PascalCase here where §3.5 writes `addSkipDirectory`. A `List<string>` needs no interior-mutability type and no synchronization primitive to be extended from a static method, so the `RefCell` and `thread_local!` pair the Rust implementation requires has no counterpart: the list is built before traversal begins and traversal runs on one thread.

Neither member is `public`, and both are declared in the binary's own class, so no library and no test can call them; the calls that extend the list are written into the binary's source and compiled with it. `AddSkipDirectory` ignores a name the list already holds, comparing with the same platform rule `CSharp_TextFinder_Dirnav` applies to a skip-list entry, so a build that adds `Build` on Windows does not lengthen a list that already holds `build`.

The list is handed to the `Dirnav` at step 6 as an `IReadOnlyList<string>`, which that library consults but cannot modify through. Nothing extends the list once traversal has begun, and the binary reads no configuration file.

## 6. Exit Codes and Diagnostics

The three codes Spec_TextFinder.md §3.4 fixes map onto this binary's failure modes as follows. No other value is returned from `Main`.

- Exit code 0: all startup steps and traversal completed; or `/H true` printed help; or the command line was bare and step 4 printed the option listing. Match count and unopenable root paths do not affect the exit code.
- Exit code 1: `CSharp_TextFinder_Cmdline` parsing failed, or `/r` was a malformed expression. Both are usage diagnostics, in the shape Spec_TextFinder.md §5.2 binds. Spec_CSharp_TextFinder_Cmdline.md §6 fixes the six reason lines `TryParse` produces; this document fixes the seventh, `invalid regex for switch: /r`, since the binary is what writes it.
- Exit code 2: constructing the `StdoutSink` failed, either because one already exists or because standard output could not be opened. Neither writes a usage line, since neither is a usage diagnostic. The text is `cannot initialize output`, fixed here, as Spec_TextFinder.md §2 and §5.2 leave every stderr wording to the implementation.
- Block lines, file announcements, and error announcements are all emitted through the `StdoutSink` by `CSharp_TextFinder_Dirnav`, in the forms and under the gating Spec_TextFinder.md §3.4 fixes. The binary formats none of them, including the error announcements about root paths it supplied. A test therefore compares that text against these documents rather than against the parent, and not against another implementation, which is free to word it differently.
- Only one exit-code-1 path writes to stdout: the malformed expression, whose option listing step 6 requires. A parse failure leaves stdout empty, as does the code-2 failure, which occurs before the sink exists or because it does not.

Exit code 2 is reachable in this implementation, and the one-sink rule of Spec_CSharp_TextFinder_Output.md §4 is what makes it so. This binary constructs exactly one sink, so its own code cannot provoke that exception; it handles the case because a constructor with a failure mode callers ignore is a constructor whose failure mode will eventually be reached.

## 7. Build

Per [CSharp_TextFinder_Structure.md](../CSharp_TextFinder_Structure.md):

- .NET console project `CSharp_TextFinder_Entry`, targeting `net8.0`, with `AssemblyName` set to `CSharp_TextFinder` so that the executable carries that name.
- References the three libraries. It references no NuGet package.
- `InvariantGlobalization` is enabled. No comparison in this implementation is culture-sensitive, so loading globalization data would buy nothing, and enabling the switch makes a culture-sensitive comparison added later fail visibly rather than behave differently on two machines.

## 8. Non-Goals

- The binary does not maintain per-file state.
- The binary places no encoding limit on its arguments. A `string` is UTF-16 and the runtime decodes the command line before `Main` runs, so every command line the shell can express reaches the parser. Spec_TextFinder.md §4 leaves the argument type and its encoding to this document, and this is the fact that follows for C#: the undecodable-argument case the Rust implementation defines cannot arise here, and this implementation accepts root paths and expressions the C++ implementation cannot carry through its narrow `argv`.
- The binary does not read a configuration file, and offers no runtime means of extending the skip list (§5).
