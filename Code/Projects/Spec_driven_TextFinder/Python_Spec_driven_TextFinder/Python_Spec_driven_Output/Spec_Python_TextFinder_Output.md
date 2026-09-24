# Spec_Python_TextFinder_Output — Output Library Specification

Specification for the `python_textfinder_output` library of the Python TextFinder implementation. It is the output component that [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.4 routes block lines and announcements through, and it implements the `Output` protocol defined in [Spec_Python_TextFinder_Dirnav.md](../Python_Spec_driven_Dirnav/Spec_Python_TextFinder_Dirnav.md) §4. It inherits structural decisions from [Python_TextFinder_Structure.md](../Python_TextFinder_Structure.md) and is constructed by [Spec_Python_TextFinder_Entry.md](../Python_Spec_driven_TextFinder_Entry/Spec_Python_TextFinder_Entry.md).

## 1. Purpose

`python_textfinder_output` is the sink. It receives fully formed strings from `python_textfinder_dirnav`, writes each as one line to stdout, and absorbs any write failure so that neither the traversal nor the binary has to reason about it.

## 2. Scope

This spec covers only the library. What is emitted, in what form, and under what gating is fixed by Spec_TextFinder.md §3.4 and produced by `python_textfinder_dirnav`; this library chooses none of it.

## 3. Responsibilities

The library:

- Is a package importable as `python_textfinder_output`, written in idiomatic Python for CPython 3.10 or later, with annotations throughout.
- Implements `Output` and its one method.
- Owns the process's only writer over standard output, and accepts the binary's own already-terminated text as well as the traversal's lines, so that one object controls the order everything reaches the stream in.
- Buffers stdout and flushes it when the `with` statement holding it ends.

## 4. Public Interface

The package exports the following, defined in `stdout_sink.py` and re-exported from `__init__.py`:

```python
class StdoutSink(Output):
    def __init__(self) -> None: ...

    def output(self, text: str) -> None: ...
    def write_text(self, text: str) -> None: ...
    def flush(self) -> None: ...

    def __enter__(self) -> "StdoutSink": ...
    def __exit__(self, exc_type, exc_value, traceback) -> None: ...
```

The class names `Output` as a base. `Output` is a `typing.Protocol`, so this is not required for the sink to satisfy it, and it is written for two reasons: it makes the dependency edge Python_TextFinder_Structure.md draws a real import rather than a convention, and it lets a type checker verify the sink against the protocol where the sink is defined rather than at the one call that passes it. Nothing else in this project derives from `StdoutSink`, and subclassing it would put the emission order §3.4 fixes in the hands of a type this specification does not describe; Python offers no `sealed`, so that is a rule stated here rather than one the language holds.

The constructor takes no arguments and raises in two cases. It raises `RuntimeError` when a `StdoutSink` already exists, so that the process holds one sink and one only; §7 records why a second would corrupt the output. And it lets an `OSError` from the construction of its writer propagate, which is the failure of a process started with no usable standard output handle. `python_textfinder_entry` catches both and exits 2, the code Spec_TextFinder.md §3.4 fixes for a failure that is not about the command line, and the failure that section names as its example.

The one-sink rule is held by a module-level `bool`, cleared by `__exit__`, so a sink released before another is created releases the right to make one. Module-level mutable state is a smell in general and is the right mechanism here: the thing being guarded is a process-wide resource, one process holds one standard output handle, and the flag is read and written on one thread before any other could exist. No lock is taken. The Rust implementation reaches the same conclusion through a `thread_local!` `Cell`, which it needs because a plain `static` there must be `Sync`; Python places no such bound on a module attribute and so needs no cell.

`flush` writes the buffer through to stdout. `python_textfinder_entry` calls it at §4 step 6, where a diagnostic on stderr must follow text already written to stdout; nothing else needs it, since §7 flushes when the `with` statement ends.

The type takes no configuration. `python_textfinder_dirnav` formats every line in full before emitting it — a block's path line, a block's indented detail lines, and every announcement alike — so there is nothing left here to parameterize.

Two methods write, and they differ only in what they add:

- `output`, the protocol method, writes the string it is given followed by the single LF Spec_TextFinder.md §3.4 fixes. It is the method `python_textfinder_dirnav` reaches, and the protocol is the only thing that library knows about this one.
- `write_text` writes the string verbatim, adding nothing. It exists for the help text of Spec_TextFinder.md §5.1 and the option listing of §5.3, which `python_textfinder_cmdline` returns already terminated. It is not part of the `Output` protocol, so `python_textfinder_dirnav` cannot reach it through the annotation it holds and cannot emit unterminated text.

Once constructed, neither method raises and neither reports failure to a caller.

## 5. Destination and Line Termination

Output goes to stdout, the destination Spec_TextFinder.md §3.4 names.

Spec_TextFinder.md §3.4 obliges an implementation to prevent its runtime translating the LF terminator to CRLF. `sys.stdout` is a `TextIOWrapper` opened with `newline=None`, which translates every `\n` written through it to `\r\n` on Windows, and `print` writes through it — so the interpreter's most obvious way to write a line is the one this specification forbids. `print` is not called anywhere in this implementation, and neither is `sys.stdout.write`.

The sink therefore owns a `TextIOWrapper` it constructs over `sys.stdout.buffer`, with four properties fixed here:

- `newline="\n"`, so no translation is performed on any platform.
- `encoding="utf-8"`, so the bytes on stdout do not depend on the machine's locale. No byte-order mark is written: `TextIOWrapper` emits none, and the `utf-8-sig` codec, which would, is not named.
- `errors="replace"`, as a backstop described below.
- `line_buffering=False` and `write_through=False`, per §7.

Fixing the encoding on this library's own writer is what makes the output independent of the environment. `PYTHONIOENCODING` and `-X utf8` configure `sys.stdout`, and this program never writes through it, so neither can change what this program puts on stdout. On a Windows console, `sys.stdout.buffer` is a `_WindowsConsoleIO` that takes UTF-8 bytes and converts them to UTF-16 for the console, so writing UTF-8 through it is correct whatever the console code page.

The `errors="replace"` backstop is reached by one kind of text only: a `str` carrying a lone surrogate, which on POSIX is how the interpreter delivers a command-line argument it could not decode. Such text reaches this library through the option listing of §5.3, which echoes `/P` and `/r` verbatim. `errors="strict"` is rejected because it would raise on that text and turn a user's undecodable argument into a lost run; `errors="surrogateescape"` is rejected because it would put the original invalid bytes on stdout, so the output would no longer be valid UTF-8. `replace` substitutes `?` on encoding — not U+FFFD, which it substitutes only on decoding — and that is why the U+FFFD substitution Spec_TextFinder.md §3.4 requires for an unrenderable path is performed by `python_textfinder_dirnav` (Spec_Python_TextFinder_Dirnav.md §8) rather than left to this codec. No path reaches this library carrying a surrogate, so the backstop never applies to one.

`output` adds the terminator and nothing else — no prefix, no separator, no trailing content — because the string arrives fully formatted.

## 6. Error Handling

A write that fails — a closed pipe, a full disk — sets an internal failed state. On the first such failure the library flushes stdout and then writes the single line `output failed` to stderr. The flush comes first so that every line already buffered reaches the stream ahead of the notice explaining why the lines stop; it is best-effort, since whatever broke the write may break it too. Thereafter the library discards every string it is given and writes nothing more, to stdout or stderr.

The failed state is permanent and one notice is written, not one per discarded line, so a broken pipe does not turn a long search into a long stderr transcript.

Every write is wrapped against `OSError` and `ValueError`. The first covers the stream failures the interpreter raises, `BrokenPipeError` among them, and is caught as the base rather than as a list of its subclasses. The second is what a write to a stream already released raises. A bare `except:` is not taken, and neither is `except Exception:`: a `MemoryError` or an `AttributeError` from this library is a defect in it rather than a stream failure, and swallowing one would hide that defect behind a notice about output.

The flush performed when the `with` statement ends (§7) obeys the same rule. A failure there sets the failed state and writes the one notice, if no earlier failure has already written it, because the final flush is the write most likely to be the first one that fails: it is the only one that must reach the stream, and on a short search it is the only one that reaches it at all. Nothing follows it, so nothing is left to discard.

**The notice is written under the same guard as everything else.** Writing `output failed` to stderr is itself a write that can fail, and on a command line that closed both streams it does — a pipeline whose reader exits breaks stdout, and the same redirection can break stderr. Left unguarded, the `OSError` raised while reporting the first failure would leave this library from inside its own `except` block, pass through `python_textfinder_dirnav`, whose handlers wrap filesystem calls and not emission, leave `main`, and reach the interpreter, which would print a traceback and exit 1 — a code Spec_TextFinder.md §3.4 assigns to an invalid command line. A broken pipe would then be indistinguishable from a usage error.

The stderr write and its flush are therefore wrapped against the same two types, and a failure there is discarded. The failed state is already set by then, so the run continues in silence, which is the whole of what this section promises in the case where nothing can be said.

The library never lets a failure reach `python_textfinder_dirnav`, which goes on traversing, and never returns a status. That statement is unconditional, and the paragraph above is what makes it so: before it, the one write in this library that was not wrapped was the one that ran only when a write had already failed.

A failed write does not affect the exit code, which Spec_Python_TextFinder_Entry.md §6 reserves for command-line and startup failures. A run whose output went nowhere still exits 0: the exit code answers whether TextFinder could do what it was asked, not whether the reader received it.

The `output failed` notice is written to `sys.stderr.buffer` as UTF-8 with an explicit `\n`, followed by a flush, so stderr carries LF here as it does everywhere else in this implementation and no text-layer translation applies.

## 7. Buffering and Release

`line_buffering` is `False` and `write_through` is `False`, so the `TextIOWrapper` defers a write until its buffer fills, and the `BufferedWriter` beneath it defers again. With either set the writer would push every call through to the operating system, and a search emitting many lines would pay one system call per line for nothing.

No flush is performed per line. The stream is flushed when the sink is released, and `python_textfinder_entry` reaches that release on every path out of `main` by holding the sink in a `with` statement. `flush` (§4) performs the same write on demand, for the one case that needs the buffer drained before the process ends.

`__exit__` flushes the writer and then calls `detach` on it. `close` is not called, and this is the one hazard of wrapping a stream the interpreter also owns: closing a `TextIOWrapper` closes the object beneath it, so `close` here would close `sys.stdout.buffer` and leave the interpreter's own shutdown flush of `sys.stdout` writing to a closed stream. `detach` severs the wrapper from the buffer without closing it, and it also disarms the wrapper's own finalizer, which would otherwise close the buffer whenever the wrapper was collected. The sink holds a reference to the wrapper for as long as the run lasts, so that collection cannot happen early.

The `detach` call is wrapped against `OSError` and `ValueError` and its failure discarded, for a reason that is not obvious from its name: `detach` flushes the wrapper before severing it, so on a broken pipe it raises the failure the preceding flush already met. Without the guard that exception would leave `__exit__`, and an exception leaving a `with` statement's exit is an exception leaving `main` — the same outcome §6 describes for an unguarded notice, reached at the end of an otherwise successful run. The guard is what lets §6's rule that a failed write does not affect the exit code hold on the last write of the run as well as the first.

The context-manager protocol is the whole of the mechanism, and Python leaves no better alternative. The language has no destructor that runs deterministically at scope exit: CPython's reference counting usually collects at the last reference, which is an implementation detail rather than a language rule, and the interpreter is free to leave a `__del__` unrun at shutdown. So the C++ implementation's reliance on a destructor and the Rust implementation's on `Drop` have no counterpart, as they have none in C#. `__enter__` and `__exit__` plus a `with` statement in the caller are what make the flush deterministic, and it is the caller's `with` that carries the guarantee rather than anything this type can enforce alone. This library therefore states the requirement and Spec_Python_TextFinder_Entry.md §4 discharges it.

`__exit__` is written to be safe to call twice, since a `with` statement on a sink already released by other means would otherwise fault. A second call flushes nothing and clears nothing. It returns `None`, so an exception raised inside the `with` block propagates: this type suppresses output failures, not defects in its caller.

The deferral is why the process holds one sink and one only (§4). Two would wrap the same standard output stream with two independent buffers, and their contents would reach the stream in the order the buffers happened to fill rather than the order the lines were written — which would break the emission order Spec_TextFinder.md §3.4 fixes, silently and only under load. The same reasoning is why `print` is forbidden implementation-wide: it writes through `sys.stdout`, a third buffer over the same stream.

One rule keeps the deferral from reordering the output: **stdout is flushed before any write to stderr.** This library applies the rule to its own `output failed` notice (§6), and `python_textfinder_entry` applies it to the diagnostic that follows the option listing on an invalid `/r` (Spec_Python_TextFinder_Entry.md §4 step 6).

Because this object owns the only writer over standard output in the process, the binary's help text and option listing pass through `write_text` rather than through a writer of their own. They therefore share this buffer and reach the stream in the order written, and the ordering rule above is the only coordination needed.

## 8. Build

Per [Python_TextFinder_Structure.md](../Python_TextFinder_Structure.md):

- Package `python_textfinder_output` under this folder's `src/`, importable once that folder is on `PYTHONPATH`.
- Imports `python_textfinder_dirnav` for the `Output` protocol, and `io` and `sys` from the standard library. Nothing imports this package except `python_textfinder_entry`, which passes the sink to `Dirnav`.
- Its unit suite sits under `test/` and is not part of the package, so importing the package does not import the suite.

## 9. Non-Goals

- The library does not format block lines or announcements, does not know one from the other, does not indent a detail line, and does not apply `/h`, `/n`, or `/L`; all of that is settled before a string reaches it.
- The library does not read files, paths, or the command line.
- The library does not write usage diagnostics; those go to stderr from `python_textfinder_entry`.
