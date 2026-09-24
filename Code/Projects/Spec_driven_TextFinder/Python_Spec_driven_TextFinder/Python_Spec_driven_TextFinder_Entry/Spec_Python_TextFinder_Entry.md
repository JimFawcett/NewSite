# Spec_Python_TextFinder_Entry — Binary Entry Point Specification

Specification for the `python_textfinder_entry` binary of the Python TextFinder implementation. This document refines [Spec_TextFinder.md](../../Spec_TextFinder.md) and inherits structural decisions from [Python_TextFinder_Structure.md](../Python_TextFinder_Structure.md).

## 1. Purpose

`python_textfinder_entry` is the command-line entry point of the Python TextFinder. It parses the program's arguments, wires the three libraries together, and drives directory traversal. Matching and file I/O belong to `python_textfinder_dirnav` and `python_textfinder_output`; the binary performs neither.

The binary does write process-level text of its own — help, the resolved option listing, and startup diagnostics — but it composes none of it. Each is a string `python_textfinder_cmdline` hands it, and the binary decides only when to write it and to which stream. Block lines and announcements it neither composes nor writes.

## 2. Scope

This spec covers only the binary. Switch behavior is defined in the parent [Spec_TextFinder.md](../../Spec_TextFinder.md) §4–§5. Library behavior is specified in each library's own `Spec_*.md`.

## 3. Responsibilities

The binary:

- Imports `python_textfinder_cmdline`, `python_textfinder_dirnav`, and `python_textfinder_output`.
- Takes the program's arguments as the `list[str]` the interpreter builds in `sys.argv`. §8 states the one encoding consequence, which is that there is none of the kind the Rust implementation defines.
- Owns the skip list and implements the build-time extension point Spec_TextFinder.md §3.5 defines, not exposed at runtime.
- Passes the arguments to `python_textfinder_cmdline` to obtain a `ProgramCommands` in which every switch already carries its supplied value or its default — the `.` root included, so the option listing has a root path to name whether or not `/P` was typed.
- Obtains `usage_line()`, `help_text()`, and `options_text(commands)` from `python_textfinder_cmdline`, which owns all three and fixes their text against Spec_TextFinder.md §5.1, §5.2, and §5.3 respectively.
- Constructs the process's one `StdoutSink`, holds it in a `with` statement, and writes its own stdout text through it rather than through a writer of its own.
- Constructs a `Dirnav`, passing the sink, the finalized skip list, and the parsed commands.
- Drives traversal across every supplied root path using the single reused `Dirnav`, then asks it for the run summary of Spec_TextFinder.md §3.6 once the last root path is finished.
- Handles process-level concerns: the bare command line of Spec_TextFinder.md §3.1, `/H` help, the `/v` option listing, exit codes, and top-level diagnostics.

## 4. Startup Sequence

`main(argv: list[str]) -> int`, defined in `entry.py`, performs the following steps in order. `__main__.py` holds three lines — the import, the call, and `sys.exit(main(sys.argv))` — and nothing else, so that `main` is a function a suite can call with an argument list of its own.

1. Invoke `parse(argv)`. When it returns a `ParseFailure`, write that failure's `diagnostic` to stderr unaltered and return 1; otherwise it returned the `ProgramCommands` the steps below use. The test is `isinstance(result, ParseFailure)`, which is what narrows the union for a type checker — Spec_Python_TextFinder_Cmdline.md §4 fixes the return type and says why it is a union rather than a pair. A malformed `/r` is not detected here; step 6 reaches it.

   There is no argument-decoding step before this one. The interpreter decodes the command line and builds `sys.argv`, so the argument collection and decode that the Rust implementation performs, and the exit code it reserves for a failure there, have no counterpart. §8 records that as a stated property rather than an omission. The whole of `argv` is passed, element 0 included; Spec_Python_TextFinder_Cmdline.md §5 fixes that the parser skips it, so the offset is stated once and this binary does not slice the list.

2. Construct the `StdoutSink`. On `RuntimeError` or `OSError` (Spec_Python_TextFinder_Output.md §4), write `cannot initialize output` to stderr and return 2 — the code Spec_TextFinder.md §3.4 fixes for a failure that is not about the command line. Every later write to stdout passes through this object, so it is constructed before any of them.

   The construction sits in a `try` block and the sink is then held by a `with` statement covering the rest of `main`. Writing `with StdoutSink() as sink:` would put the construction inside the statement, where an `except` clause covering the body would also cover the body's own failures; splitting the two is what lets the construction failure be handled alone and the flush still be guaranteed. This is the Python counterpart of the `std::optional` the C++ implementation uses for the same reason, and of the C# implementation's split between a `try` and a `using` statement.

3. If the parsed commands indicate `/H true`, write `help_text()` through the sink with `write_text`, return 0, and do not proceed.

4. If `argv` holds one element, write `options_text(commands)` through the sink, return 0, and do not proceed. This is the bare command line of Spec_TextFinder.md §3.1, and it succeeds: nothing was asked for and nothing failed. `commands` here is a newly constructed `ProgramCommands`, so the listing names every default and its `/v` line reads `false`, per Spec_TextFinder.md §5.3.

   The test is `len(argv) == 1` and not `len(argv) == 0`. `sys.argv` carries the program name in element 0 — the path of `__main__.py` under `python -m` — so a one-element list is the bare command line, as it is in C++ and Rust and is not in C#, whose `string[] args` holds the arguments alone. The binary reads the list's length for this test and nothing else; it inspects no element of it.

5. If `/v true`, write `options_text(commands)` through the sink, in the form Spec_TextFinder.md §5.3 fixes, before traversal begins. Steps 4 and 5 are mutually exclusive: a command line bearing `/v` holds more than one element.

6. Finalize the skip list: the defaults listed in §5 of this document with the extension calls compiled into the module applied. Then construct the `Dirnav`, passing the sink, that list as a `tuple`, and the parsed commands. Expression compilation occurs here, and the constructor raises `re.error` when the `/r` expression will not compile. On that exception:
   1. If step 5 did not already write it, write `options_text(commands)` through the sink now, so that the user sees the `/r` line carrying the expression that failed. Spec_TextFinder.md §5.2 requires this listing whatever `/v` says, and §5.3 requires it not be repeated when `/v` already produced it.
   2. Call `flush` on the sink, so that the listing reaches the stream ahead of the diagnostic that explains it. The sink buffers stdout without per-line flushing (Spec_Python_TextFinder_Output.md §7), so without this the two arrive out of order.
   3. Compose the usage diagnostic in the shape Spec_TextFinder.md §5.2 binds — the reason line `invalid regex for switch: /r`, a newline, then `usage_line()` — and write it to stderr. §6 fixes that reason line for this implementation. The binary composes it; neither `python_textfinder_cmdline` nor `python_textfinder_dirnav` does, the former supplying only `usage_line()` and the latter only the failure that triggers it. The message `re.error` carries is not written, for a reason that outlives §5.2's wording: that text is the interpreter's, so an interpreter upgrade would change this program's output without any document in this tree recording the change.
   4. Return 1, having traversed nothing.

   `re.error` is caught by its own type rather than as `Exception` or as `ValueError`, which it derives from. A broader `except` would also swallow an argument defect in this binary's own call and report it as a malformed user pattern.

7. For each root path in the parsed commands, in the order `/P` gave them, invoke `search` on the same `Dirnav`, then continue with the next root path. A root path that cannot be searched — unopenable, a symbolic link, neither a regular file nor a directory, or carrying a name that will not render — is announced by `python_textfinder_dirnav` itself, per Spec_TextFinder.md §3.4; the binary neither formats nor inspects that notice, and no root-path outcome affects the exit code.

8. Call `emit_run_summary` on that same `Dirnav`, once, after the last root path returns. This writes the run summary Spec_TextFinder.md §3.6 requires. The binary supplies no count and composes no text — the counts are the library's, per Spec_Python_TextFinder_Dirnav.md §8.1 — and its whole part is knowing that step 7 is finished, which nothing inside the library can know. Every return above precedes step 7, so no run that skipped traversal reaches this step: `/H`, the bare command line, a parse failure, and a malformed `/r` each leave at their own step, which is what §3.6 requires of a summary.

9. Return 0.

Every exit above is a `return` from `main`. `sys.exit` is not called inside `main` and `os._exit` is not called anywhere: the first would express a return value as an exception, which a suite calling `main` would then have to catch, and the second terminates the process immediately, with the sink's buffer unwritten. Only a return leaves the `with` statement and releases the sink, which flushes its stdout buffer (Spec_Python_TextFinder_Output.md §7). Steps 3, 4, and 6 each write to stdout and then leave. `sys.exit` appears once in this component, in `__main__.py`, where it converts `main`'s returned value into the process's exit code after the `with` statement has already ended.

Nothing writes to stderr before stdout has been flushed. Step 1 predates the sink and so has no buffer to flush; step 2 fails before one exists; step 6 flushes explicitly. `python_textfinder_output` applies the same rule to its own runtime notice, per Spec_Python_TextFinder_Output.md §6.

Every stderr write in this binary is wrapped against `OSError` and `ValueError` and its failure discarded, for the reason Spec_Python_TextFinder_Output.md §6 gives for the sink's own notice: a process whose stderr is broken must still return the code §6 of this document assigns, and an exception raised while reporting a usage error would replace that code with an interpreter traceback and a 1 that means something else. A run that cannot say why it failed still fails with the right number.

Every stderr write in this binary goes to `sys.stderr.buffer` as UTF-8 with an explicit `\n`, followed by a flush. `sys.stderr.write` is not used: it writes through a text layer opened with `newline=None`, which translates to CRLF on Windows. Spec_TextFinder.md §3.4 leaves the stderr terminator to the platform and would permit CRLF here; writing LF costs one writer choice and makes this implementation's stderr identical on both platforms, so it is fixed here. The encode uses `errors="replace"`, for the reason Spec_Python_TextFinder_Output.md §5 gives for the sink: a reason line may reproduce a token the interpreter decoded with `surrogateescape`, and a diagnostic that raised while reporting a bad command line would be worse than one that renders a byte as `?`.

Nothing in this implementation writes through `sys.stdout`, so the interpreter's own flush of that stream at shutdown has nothing to write and can fail at nothing. That is why a broken pipe produces the sink's one `output failed` notice and not, in addition, the interpreter's shutdown complaint about an unflushable stdout.

## 5. Skip List

`python_textfinder_entry` owns the process-wide skip list. It is initialized with the defaults specified in Spec_TextFinder.md §3.2:

    archive, .git, .svn, .hg, build, out, target, bin, obj, __pycache__, node_modules

The module holds the list at module level and implements the extension point of Spec_TextFinder.md §3.5:

```python
_SKIP_LIST: list[str] = [ ... the eleven defaults ... ]

def _add_skip_directory(name: str) -> None: ...
```

`_add_skip_directory` takes the name alone, as §3.5 writes it, and returns `None`. §3.5 fixes the shape and leaves the spelling to each language, so the name is snake_case here where §3.5 writes `addSkipDirectory`. A `list` needs no interior-mutability type and no synchronization primitive to be extended from a module-level function, so the `RefCell` and `thread_local!` pair the Rust implementation requires has no counterpart: the list is built at import time and traversal runs on one thread.

The calls that extend the list are written into this module, beneath the list's definition, and run when the module is imported — before `main` is called and therefore before traversal begins. Both names carry a leading underscore, which is the whole of Python's access control: nothing prevents another module from importing and calling `_add_skip_directory`, where the C# implementation's `private` and the C++ implementation's internal linkage prevent it outright. That is a stated weakness of this implementation rather than a difference in design, and the rule it rests on is that no library and no suite in this project calls either name.

`_add_skip_directory` ignores a name the list already holds, comparing with the same platform rule `python_textfinder_dirnav` applies to a skip-list entry, so a build that adds `Build` on Windows does not lengthen a list that already holds `build`.

The list is handed to the `Dirnav` at step 6 as a `tuple`, which that library can read and cannot modify — a stronger guarantee than the C# implementation's `IReadOnlyList<string>`, which a caller holding the underlying list can still change behind it. Nothing extends the list once traversal has begun, and the binary reads no configuration file.

## 6. Exit Codes and Diagnostics

The three codes Spec_TextFinder.md §3.4 fixes map onto this binary's failure modes as follows. No other value is returned from `main`.

- Exit code 0: all startup steps and traversal completed; or `/H true` printed help; or the command line was bare and step 4 printed the option listing. Match count and unopenable root paths do not affect the exit code.
- Exit code 1: `python_textfinder_cmdline` parsing failed, or `/r` was a malformed expression. Both are usage diagnostics, in the shape Spec_TextFinder.md §5.2 binds. Spec_Python_TextFinder_Cmdline.md §6 fixes the six reason lines `parse` produces; this document fixes the seventh, `invalid regex for switch: /r`, since the binary is what writes it.
- Exit code 2: constructing the `StdoutSink` failed, either because one already exists or because standard output could not be opened. Neither writes a usage line, since neither is a usage diagnostic. The text is `cannot initialize output`, fixed here, as Spec_TextFinder.md §2 and §5.2 leave every stderr wording to the implementation.
- Block lines, file announcements, and error announcements are all emitted through the `StdoutSink` by `python_textfinder_dirnav`, in the forms and under the gating Spec_TextFinder.md §3.4 fixes. The binary formats none of them, including the error announcements about root paths it supplied. A test therefore compares that text against these documents rather than against the parent, and not against another implementation, which is free to word it differently.
- Only one exit-code-1 path writes to stdout: the malformed expression, whose option listing step 6 requires. A parse failure leaves stdout empty, as does the code-2 failure, which occurs before the sink exists or because it does not.

An uncaught exception escaping `main` is not one of the three codes: the interpreter would print a traceback to stderr and exit 1, which would be read as a usage failure and would carry no usage line. Nothing in this binary is written to allow that. `python_textfinder_dirnav` contains every `OSError` it meets (Spec_Python_TextFinder_Dirnav.md §5) and `python_textfinder_output` contains every write failure (Spec_Python_TextFinder_Output.md §6), so the two exception types that reach this module are the ones steps 2 and 6 name. The one uncontained case that document states — a tree deep enough to exhaust the recursion limit — is left uncontained deliberately, and would exit this way.

Exit code 2 is reachable in this implementation, and the one-sink rule of Spec_Python_TextFinder_Output.md §4 is what makes it so. This binary constructs exactly one sink, so its own code cannot provoke that exception; it handles the case because a constructor with a failure mode callers ignore is a constructor whose failure mode will eventually be reached.

## 7. Build

Per [Python_TextFinder_Structure.md](../Python_TextFinder_Structure.md):

- Package `python_textfinder_entry` under this folder's `src/`, holding `entry.py` and `__main__.py`, importable once that folder is on `PYTHONPATH`. It is run as `python -m python_textfinder_entry`, which the launchers `Python_TextFinder.bat` and `Python_TextFinder` wrap after setting `PYTHONPATH` to the four `src/` folders; each forwards its arguments and returns the interpreter's exit code unchanged. `Python_TextFinder` is the name Spec_TextFinder.md §5.1 substitutes for `<executable>`, and that substitution is fixed in `python_textfinder_cmdline` rather than read from `sys.argv[0]`, which under `python -m` holds a path.
- Imports the three libraries and `os`, `re`, and `sys` from the standard library. It requires no distributed package. `os` is imported for `os.name` alone, which §5 needs to compare a skip-list name by the platform rule Spec_Python_TextFinder_Dirnav.md §6 fixes; that rule is two lines and is written out here rather than reached for through another package's private name.
- No locale is read. This implementation calls `locale.setlocale` nowhere, opens no stream it did not configure, and performs no culture-sensitive comparison, so no locale data can change what it does. The `InvariantGlobalization` switch the C# implementation sets has nothing here to switch off.
- There is no build step and no project file. Spec_TextFinder.md §6.2's requirement that a runner build what it is about to run is discharged by `python -m compileall`, which the runners invoke over the four `src/` folders before the first suite; Python_TextFinder_Structure.md fixes that.

## 8. Non-Goals

- The binary does not maintain per-file state.
- The binary places no encoding limit on its arguments. The interpreter decodes the command line before `main` runs — on POSIX with the filesystem encoding and the `surrogateescape` error handler, on Windows from the wide API — so every command line the shell can express reaches the parser. Spec_TextFinder.md §4 leaves the argument type and its encoding to this document, and this is the fact that follows for Python: the undecodable-argument case the Rust implementation defines cannot arise here, and this implementation accepts root paths and expressions the C++ implementation cannot carry through its narrow `argv`. What follows instead is that an argument the interpreter could not decode carries lone surrogates into the option listing, and Spec_Python_TextFinder_Output.md §5 fixes what the sink writes for them; a root path carrying them draws `cannot open` per Spec_Python_TextFinder_Dirnav.md §5.
- The binary does not read a configuration file, and offers no runtime means of extending the skip list (§5).
