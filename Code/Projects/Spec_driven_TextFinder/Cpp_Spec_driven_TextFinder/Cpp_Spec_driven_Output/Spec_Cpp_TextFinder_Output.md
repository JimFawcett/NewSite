# Spec_Cpp_TextFinder_Output — Output Library Specification

Specification for the `Cpp_TextFinder_Output` library of the C++ TextFinder implementation. It is the output component that [Spec_TextFinder.md](../../Spec_TextFinder.md) §3.4 routes records and announcements through, and it implements the `Output` interface defined in [Spec_Cpp_TextFinder_Dirnav.md](../Cpp_Spec_driven_Dirnav/Spec_Cpp_TextFinder_Dirnav.md) §4. It inherits structural decisions from [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md) and is constructed by [Spec_Cpp_TextFinder_Entry.md](../Cpp_Spec_driven_TextFinder_Entry/Spec_Cpp_TextFinder_Entry.md).

## 1. Purpose

`Cpp_TextFinder_Output` is the sink. It receives fully formed strings from `Cpp_TextFinder_Dirnav`, writes each as one line to stdout, and absorbs any write failure so that neither the traversal nor the binary has to reason about it.

## 2. Scope

This spec covers only the library. What is emitted, in what form, and under what gating is fixed by Spec_TextFinder.md §3.4 and produced by `Cpp_TextFinder_Dirnav`; this library chooses none of it.

## 3. Responsibilities

The library:

- Is implemented as a C++ module targeting C++23, using modern idiomatic C++ constructs.
- Derives from `Output` and implements its one virtual function.
- Puts stdout into the state Spec_TextFinder.md §3.4 requires, where a written LF reaches the stream as a single byte, and reports failure to do so by throwing.

## 4. Public Interface

The module interface unit `Cpp_TextFinder_Output.ixx` declares module `Cpp_TextFinder_Output` and exports the following at global scope, matching the unqualified type usage in Spec_Cpp_TextFinder_Entry.md:

```cpp
export module Cpp_TextFinder_Output;

import std;
import Cpp_TextFinder_Dirnav;

export class Cpp_TextFinder_Output : public Output {
public:
    Cpp_TextFinder_Output();
    ~Cpp_TextFinder_Output() override;
    void output(const std::string& text) override;
};
```

The constructor prepares stdout per §5 and throws `std::runtime_error` if it cannot; `Cpp_TextFinder_Entry` catches that and exits with `cannot initialize output` (Spec_Cpp_TextFinder_Entry.md §4 step 3). Once constructed, the object never throws and never reports failure to a caller.

The class takes no configuration. `Cpp_TextFinder_Dirnav` formats every record and announcement in full before emitting it, so there is nothing left here to parameterize.

## 5. Destination and Line Termination

Output goes to stdout, the destination Spec_TextFinder.md §3.4 names.

Each call to `output` writes the string it is given, unchanged, followed by the single LF that Spec_TextFinder.md §3.4 fixes as the terminator. The library adds that and nothing else — no prefix, no separator, no trailing content — because the string arrives fully formatted.

Meeting §3.4's requirement that no runtime translate the terminator obliges the constructor to put stdout into binary mode on Windows, where the C runtime would otherwise turn each LF into CRLF. Failing to set that mode is the construction failure of §4.

## 6. Error Handling

A write that fails — a closed pipe, a full disk — sets an internal failed state. On the first such failure the library writes the single line `output failed` to stderr; thereafter it discards every string it is given and writes nothing more, to stdout or stderr. It never throws, never returns a status, and never lets the failure reach `Cpp_TextFinder_Dirnav`, which goes on traversing.

A failed write does not affect the exit code, which Spec_Cpp_TextFinder_Entry.md §6 reserves for command-line and startup failures.

## 7. Buffering and Flushing

No flush is performed per record; flushing each line would dominate the runtime of a search that emits many. The stream is flushed when the instance is destroyed, which `Cpp_TextFinder_Entry` reaches before returning from `main`.

Deferring the flush is safe here because every stderr write in this implementation — the three startup diagnostics of Spec_Cpp_TextFinder_Entry.md §4 — precedes traversal and is followed at once by process exit.

The constructor also disables synchronization between the C++ streams and C stdio.

## 8. Build

Per [Cpp_TextFinder_Structure.md](../Cpp_TextFinder_Structure.md):

- CMake library target `Cpp_TextFinder_Output`.
- Implemented as a C++ module; consumes the standard library via `import std;` and the `Output` base class via `import Cpp_TextFinder_Dirnav;`. Nothing depends on this library except `Cpp_TextFinder_Entry`, which supplies it as the template argument to `Cpp_TextFinder_Dirnav`.

## 9. Non-Goals

- The library does not format records or announcements, does not know one from the other, and does not apply `/h`, `/n`, or `/L`; all of that is settled before a string reaches it.
- The library does not read files, paths, or the command line.
- The library does not write usage diagnostics; those go to stderr from `Cpp_TextFinder_Entry`.
