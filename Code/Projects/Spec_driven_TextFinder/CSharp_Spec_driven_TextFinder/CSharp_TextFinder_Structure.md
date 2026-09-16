# CSharp_TextFinder — Project Structure

The CSharp_TextFinder project comprises three libraries and one binary, arranged as a single solution. The binary references all three. The libraries themselves form a chain: `CSharp_TextFinder_Dirnav` references `CSharp_TextFinder_Cmdline` for the program-command type, and `CSharp_TextFinder_Output` references `CSharp_TextFinder_Dirnav` for the `IOutput` interface. Nothing references `CSharp_TextFinder_Output` but the binary.

## Libraries

- **CSharp_TextFinder_Cmdline** — parses the command line into a `ProgramCommands` object whose properties control the behavior of `CSharp_TextFinder_Dirnav`. C# has no free functions, so the parse entry, the usage line, the help text, and the option listing are static methods of one static class, `CommandLine`. Specified in [Spec_CSharp_TextFinder_Cmdline.md](CSharp_Spec_driven_Cmdline/Spec_CSharp_TextFinder_Cmdline.md).
- **CSharp_TextFinder_Dirnav** — directory navigation. Reads file contents, runs regex matching, and formats each matching file into the block Spec_TextFinder.md §3.4 fixes before emitting its lines. Constructs the `Regex` once per run, not once per file. Defines the interface:
  ```csharp
  public interface IOutput
  {
      void Output(string text);
  }
  ```
  `Dirnav<TOutput>` binds to a concrete implementation through a generic type parameter constrained `where TOutput : IOutput`. Specified in [Spec_CSharp_TextFinder_Dirnav.md](CSharp_Spec_driven_Dirnav/Spec_CSharp_TextFinder_Dirnav.md).
- **CSharp_TextFinder_Output** — implements `IOutput.Output` according to its specification, [Spec_CSharp_TextFinder_Output.md](CSharp_Spec_driven_Output/Spec_CSharp_TextFinder_Output.md). Handles output errors internally.

Each library's project name, assembly name, and root namespace match its component name above. The types inside carry their own names rather than the component's: the sink is `StdoutSink` in namespace `CSharp_TextFinder_Output`, because a class sharing its namespace's name makes every `using` of that namespace ambiguous to read and forces the compiler to disambiguate in ways a reader must follow.

## Binary

- **CSharp_TextFinder_Entry** — binary project name; produces the executable `CSharp_TextFinder`. References the three libraries above. Specified in [Spec_CSharp_TextFinder_Entry.md](CSharp_Spec_driven_TextFinder_Entry/Spec_CSharp_TextFinder_Entry.md).
- Owns the skip list and passes it to `CSharp_TextFinder_Dirnav` for use during traversal.
- On execution, `static int Main(string[] args)` parses the command line into a `ProgramCommands` object using `CSharp_TextFinder_Cmdline`.
- A `StdoutSink` is created and bound to a `Dirnav<StdoutSink>` through its generic parameter.
- The `Dirnav` value is started at each of the specified (possibly default) root paths in turn and performs a DFS for regex matches on files in each directory tree.
- Owns the process's one output object, which in turn owns the only writer over standard output. Every write to standard output, the binary's own help text and option listing included, passes through that object, so nothing else can interleave with the search output or reorder it.
- Holds that object in a `using` declaration, so it is disposed on every path out of `Main`.

## Build

- Language: C# 12. Target framework: `net8.0`. Build system: the .NET SDK, driven by `dotnet build`. These apply to every project below, and each component's `Spec_*.md` names only its own project.
- One solution at the root of this folder with four projects, one per component. Each library is a separate project rather than a folder of one assembly, so the dependency chain above is enforced by the build rather than by convention.
- Each component has its own folder holding its `Spec_*.md`, its project file, its sources under `src/`, and — for the three libraries — its unit-test project under `test/`, which Spec_TextFinder.md §6.2 asks to live beside the code it tests. The integration suite and the demonstration drive the assembled executable, so both sit at the root of this folder rather than in a component folder, as do the three runners.
- The .NET SDK compiles every `.cs` file beneath a project's own directory, so a library project whose folder also holds a test project would compile that suite into the shipped assembly. Each library project therefore carries one `<Compile Remove="test/**" />` item. That line is the cost of putting a suite beside its component, and it is cheaper than the alternative of moving the suites away from the code they test.
- No third-party test framework, per §6.2 and the dependency rule of §6. `dotnet test` requires one, so each suite is a console project whose `Main` runs its checks and returns the number that failed, and the runners invoke those executables rather than `dotnet test`.
- Dependencies: none beyond the base class library. `System.Text.RegularExpressions.Regex`, which Spec_TextFinder.md §6.1 assigns to C#, ships with the framework, so this implementation declares no package reference at all.
- `Nullable` is enabled in every project. The specifications fix each failure as a returned value or a thrown exception the caller handles, never as a null result, and the compiler is what holds that.
- Toolchain minimum: .NET SDK 8.0.100 or later. No preview language feature is used.

## Notes

- This forms a data pipeline architecture that emits an output immediately following evaluation of a regex match.
- Identifiers follow C# convention, so this implementation spells in PascalCase what the C++ implementation spells in camelCase and the Rust implementation in snake_case: `UsageLine` for `usageLine` and `usage_line`, `LineNumbers` for `lineNumbers` and `line_numbers`. The switch letters, the emitted text, and the exit codes are fixed by Spec_TextFinder.md and are identical in all three.
- `ProgramCommands` is a class whose property initializers carry the defaults of Spec_TextFinder.md §5, so a newly constructed instance equals the result of parsing an empty command line.
- The `IOutput` interface with a generic parameter is the current design choice. Passing an `IOutput` reference directly is a viable alternative that trades the type parameter for a shorter signature; it is not adopted here. One difference from the siblings is worth recording rather than assuming: a C# generic instantiated over a reference type shares one compiled body, so the constrained call is not devirtualized the way a C++ template instantiation or a Rust monomorphization is. The parameter buys the compile-time bound and lets a test substitute its own recorder; it does not buy a direct call.
- Spec_TextFinder.md §3.4 obliges an implementation to stop its runtime translating the LF terminator to CRLF. `Console.WriteLine` terminates with `Environment.NewLine`, which is CRLF on Windows, so this implementation does not use it. `CSharp_TextFinder_Output` owns a `StreamWriter` over `Console.OpenStandardOutput()` with `NewLine` set to `"\n"`, and [Spec_CSharp_TextFinder_Output.md](CSharp_Spec_driven_Output/Spec_CSharp_TextFinder_Output.md) records what follows from that.
- C# has no destructor that runs at scope exit, so the sink implements `IDisposable` and the binary disposes it with a `using` declaration. A finalizer is not relied on for the flush: the runtime is free never to run one.
- `Main`'s `string[] args` holds the arguments alone, where C++'s `argv[0]` and Rust's first `args_os()` element hold the executable name. The bare command line of Spec_TextFinder.md §3.1 is therefore an empty array here rather than a one-element one, and the parser scans from index 0. Each component spec states its own offset rather than inheriting a sibling's.
- A `string` is UTF-16 and the runtime decodes the command line before `Main` sees it, so the undecodable-argument case the Rust implementation defines has no counterpart here and needs no exit code of its own.
- `Dirnav` holds references to the sink, the skip list, and the parsed commands, and the garbage collector keeps them alive as long as it does. The lifetime rule the C++ implementation states in prose and the Rust implementation enforces with a borrow checker therefore has nothing to enforce here.
- The skip list is a static field of the entry project, reachable without a lock and without an interior-mutability type. The `thread_local!` and `RefCell` pair the Rust implementation needs has no counterpart: the list is built before traversal begins and traversal runs on one thread.
