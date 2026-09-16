# Spec_CSharp_TextFinder_Output — Output Library Specification

Specification for the `CSharp_TextFinder_Output` library of the C# TextFinder implementation. It is the output component that [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.4 routes block lines and announcements through, and it implements the `IOutput` interface defined in [Spec_CSharp_TextFinder_Dirnav.md](../CSharp_Spec_driven_Dirnav/Spec_CSharp_TextFinder_Dirnav.md) §4. It inherits structural decisions from [CSharp_TextFinder_Structure.md](../CSharp_TextFinder_Structure.md) and is constructed by [Spec_CSharp_TextFinder_Entry.md](../CSharp_Spec_driven_TextFinder_Entry/Spec_CSharp_TextFinder_Entry.md).

## 1. Purpose

`CSharp_TextFinder_Output` is the sink. It receives fully formed strings from `CSharp_TextFinder_Dirnav`, writes each as one line to stdout, and absorbs any write failure so that neither the traversal nor the binary has to reason about it.

## 2. Scope

This spec covers only the library. What is emitted, in what form, and under what gating is fixed by Spec_TextFinder.md §3.4 and produced by `CSharp_TextFinder_Dirnav`; this library chooses none of it.

## 3. Responsibilities

The library:

- Is a .NET class library targeting `net8.0`, written in idiomatic C# with nullable reference types enabled.
- Implements `IOutput` and its one method.
- Owns the process's only writer over standard output, and accepts the binary's own already-terminated text as well as the traversal's lines, so that one object controls the order everything reaches the stream in.
- Buffers stdout and flushes it when disposed.

## 4. Public Interface

Namespace `CSharp_TextFinder_Output` exports the following:

```csharp
public sealed class StdoutSink : IOutput, IDisposable
{
    public StdoutSink();

    public void Output(string text);
    public void WriteText(string text);
    public void Flush();
    public void Dispose();
}
```

The class is `sealed`. Nothing in this project derives from it, and a sink whose `Output` a subclass could override would put the emission order §3.4 fixes in the hands of a type this specification does not describe.

The constructor takes no arguments and throws in two cases. It throws `InvalidOperationException` when a `StdoutSink` already exists, so that the process holds one sink and one only; §7 records why a second would corrupt the output. And it lets an `IOException` from `Console.OpenStandardOutput` propagate, which is the failure of a process started with no usable standard output handle. `CSharp_TextFinder_Entry` catches both and exits 2, the code Spec_TextFinder.md §3.4 fixes for a failure that is not about the command line, and the failure that section names as its example.

The one-sink rule is held by a private static `bool`, cleared by `Dispose`, so a sink disposed before another is created releases the right to make one. A static mutable field is a smell in general and is the right mechanism here: the thing being guarded is a process-wide resource, one process holds one standard output handle, and the field is read and written on one thread before any other could exist. No lock is taken. The Rust implementation reaches the same conclusion through a `thread_local!` `Cell`, which it needs because a plain `static` there must be `Sync`; C# places no such bound on a static field and so needs no cell.

`Flush` writes the buffer through to stdout. `CSharp_TextFinder_Entry` calls it at §4 step 6, where a diagnostic on stderr must follow text already written to stdout; nothing else needs it, since §7 flushes on `Dispose`.

The type takes no configuration. `CSharp_TextFinder_Dirnav` formats every line in full before emitting it — a block's path line, a block's indented detail lines, and every announcement alike — so there is nothing left here to parameterize.

Two methods write, and they differ only in what they add:

- `Output`, the interface method, writes the string it is given followed by the single LF Spec_TextFinder.md §3.4 fixes. It is the method `CSharp_TextFinder_Dirnav` reaches, and the interface is the only thing that library knows about this one.
- `WriteText` writes the string verbatim, adding nothing. It exists for the help text of Spec_TextFinder.md §5.1 and the option listing of §5.3, which `CSharp_TextFinder_Cmdline` returns already terminated. It is declared on the class and not on `IOutput`, so `CSharp_TextFinder_Dirnav` cannot reach it and cannot emit unterminated text.

Once constructed, neither method throws and neither reports failure to a caller.

## 5. Destination and Line Termination

Output goes to stdout, the destination Spec_TextFinder.md §3.4 names.

Spec_TextFinder.md §3.4 obliges an implementation to prevent its runtime translating the LF terminator to CRLF. C# is the language that obligation was written for: `Console.WriteLine` terminates with `Environment.NewLine`, which is CRLF on Windows, so the framework's most obvious way to write a line is the one this specification forbids. The cross-document review that promoted the rule from the C++ Output specification to the parent named this case as its argument, before any C# code existed.

The sink therefore owns a `StreamWriter` over `Console.OpenStandardOutput()` with three properties fixed here:

- `NewLine` is set to `"\n"`, so `WriteLine` emits one LF on every platform.
- `AutoFlush` is `false`, per §7.
- The encoding is a `UTF8Encoding` constructed `encoderShouldEmitUTF8Identifier: false`, so no byte-order mark precedes the first line. `Encoding.UTF8` is rejected by name: that property's encoding emits a BOM when a `StreamWriter` opens a stream with it, which would put three bytes on stdout that §3.4 does not fix and that a fixture comparing bytes would see.

`Console.Out` is not used at all, and neither is `Console.Write`. The writer this library constructs wraps the standard output stream directly, so nothing the framework configures on `Console.Out` — its encoding, its newline, its autoflush — reaches this program's output.

`Output` adds the terminator and nothing else — no prefix, no separator, no trailing content — because the string arrives fully formatted.

## 6. Error Handling

A write that fails — a closed pipe, a full disk — sets an internal failed state. On the first such failure the library flushes stdout and then writes the single line `output failed` to stderr. The flush comes first so that every line already buffered reaches the stream ahead of the notice explaining why the lines stop; it is best-effort, since whatever broke the write may break it too. Thereafter the library discards every string it is given and writes nothing more, to stdout or stderr.

The failed state is permanent and one notice is written, not one per discarded line, so a broken pipe does not turn a long search into a long stderr transcript.

Every write is wrapped against `IOException` and `ObjectDisposedException`, the two the framework's stream writes document. A broader `catch` is not taken: an `OutOfMemoryException` or a `NullReferenceException` from this library is a defect in it rather than a stream failure, and swallowing one would hide that defect behind a notice about output.

The flush performed on `Dispose` (§7) obeys the same rule. A failure there sets the failed state and writes the one notice, if no earlier failure has already written it, because the final flush is the write most likely to be the first one that fails: it is the only one that must reach the stream, and on a short search it is the only one that reaches it at all. Nothing follows it, so nothing is left to discard.

The library never lets a failure reach `CSharp_TextFinder_Dirnav`, which goes on traversing, and never returns a status.

A failed write does not affect the exit code, which Spec_CSharp_TextFinder_Entry.md §6 reserves for command-line and startup failures. A run whose output went nowhere still exits 0: the exit code answers whether TextFinder could do what it was asked, not whether the reader received it.

The `output failed` notice is written with `Console.Error.Write` and an explicit `\n`, so stderr carries LF here as it does everywhere else in this implementation.

## 7. Buffering and Disposal

`AutoFlush` is `false`, so the `StreamWriter` defers a write until its buffer fills. With `AutoFlush` set the writer would flush on every call, and a search emitting many lines would pay one system call per line for nothing.

No flush is performed per line. The stream is flushed when the sink is disposed, and `CSharp_TextFinder_Entry` reaches that disposal on every path out of `Main` by holding the sink in a `using` statement. `Flush` (§4) performs the same write on demand, for the one case that needs the buffer drained before the process ends.

Disposal is the whole of the mechanism, and C# leaves no alternative. The language has no destructor that runs at scope exit, so the C++ implementation's reliance on one and the Rust implementation's on `Drop` have no counterpart: a sink that flushed from a finalizer would flush at a time the runtime chooses, and the runtime is free to run no finalizer at all before the process exits. `IDisposable` plus a `using` statement in the caller is what makes the flush deterministic, and it is the caller's `using` that carries the guarantee rather than anything this type can enforce alone. This library therefore states the requirement and Spec_CSharp_TextFinder_Entry.md §4 discharges it.

`Dispose` is written to be safe to call twice, since a `using` statement on a sink already disposed by other means would otherwise fault. A second call flushes nothing and clears nothing.

The deferral is why the process holds one sink and one only (§4). Two would wrap the same standard output stream with two independent buffers, and their contents would reach the stream in the order the buffers happened to fill rather than the order the lines were written — which would break the emission order Spec_TextFinder.md §3.4 fixes, silently and only under load.

One rule keeps the deferral from reordering the output: **stdout is flushed before any write to stderr.** This library applies the rule to its own `output failed` notice (§6), and `CSharp_TextFinder_Entry` applies it to the diagnostic that follows the option listing on an invalid `/r` (Spec_CSharp_TextFinder_Entry.md §4 step 6).

Because this object owns the only writer over standard output in the process, the binary's help text and option listing pass through `WriteText` rather than through a writer of their own. They therefore share this buffer and reach the stream in the order written, and the ordering rule above is the only coordination needed.

## 8. Build

Per [CSharp_TextFinder_Structure.md](../CSharp_TextFinder_Structure.md):

- .NET class library project `CSharp_TextFinder_Output`, targeting `net8.0`.
- References `CSharp_TextFinder_Dirnav` for the `IOutput` interface. Nothing references this project except `CSharp_TextFinder_Entry`, which supplies it as the generic argument to `Dirnav`.
- Its unit-test project sits under `test/` and is excluded from this project's compile items.

## 9. Non-Goals

- The library does not format block lines or announcements, does not know one from the other, does not indent a detail line, and does not apply `/h`, `/n`, or `/L`; all of that is settled before a string reaches it.
- The library does not read files, paths, or the command line.
- The library does not write usage diagnostics; those go to stderr from `CSharp_TextFinder_Entry`.
