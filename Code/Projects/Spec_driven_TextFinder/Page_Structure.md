# Page_Structure

The structure of content pages on this site. [PageExample.html](../../PageExample.html) is the reference implementation.

A content page is not standalone. It loads inside the right panel of a track explorer, and when opened directly it redirects itself into that explorer. Its `<head>` pulls a fixed set of stylesheets and scripts in a fixed order. Its `<body>` carries an about block, a title header, a content block, and a bottom menu. Its final scripts build the page and section menus the explorer expects.

[Text_Tone.md](Text_Tone.md) governs the prose that goes into a page. This document governs everything around the prose.

Each section below creates one page of a linked set. Every page shares the structure described above and differs only in its content.

Every page also displays the conversations that produced the specifications it discusses. The page carries one HTML `<details>` block per `Prompts_*.md` file: the summary line names the file, and the body holds that file's entire contents. The blocks sit at the end of the page and are collapsed by default, so the page reads without them and opens to them on demand.

A page displays every `Prompts_*.md` file at the directory level it covers. The introduction page carries the five at the top of the project, and each part page carries the pair in its own component folder. Each section lists the files its page displays.

## 1. Project Introduction

Page: `Code/Spec_Driven_Design_Introduction.html`. Title: Spec-Driven Design: Introduction.

The entry page of the set. It introduces the project as a whole, then focuses on the project-level specification, [Spec_TextFinder.md](Spec_TextFinder.md). Its content covers what a `README.md` for the project would cover, told in a more narrative style: the reader arrives knowing nothing about the project and leaves knowing what the specification fixes and why.

The page covers:

- What spec-driven design means here. The specifications are the source the code derives from, not a description written after the fact.
- The document kinds the project carries: `Constitution.md`, `Spec_TextFinder.md`, one `*Structure.md` per language, one `Spec_*.md` per component, and the `Prompts_*.md` records that feed nothing back into the code.
- The two rules of [Constitution.md](Constitution.md), and what each one bounds.
- The seven sections of `Spec_TextFinder.md`: what each fixes, and what it leaves to the implementations.
- The order the documents come in, and the citation chain that runs from a component spec back to the project spec.

Sources: [Constitution.md](Constitution.md), [Spec_TextFinder.md](Spec_TextFinder.md), [Project_Tree.md](Project_Tree.md).

Prompts, every file at the top of the project:

- [Prompts_Constitution.md](Prompts_Constitution.md)
- [Prompts_Fix_Constitution.md](Prompts_Fix_Constitution.md)
- [Prompts_Spec_TextFinder.md](Prompts_Spec_TextFinder.md)
- [Prompts_Fix_Spec_TextFinder.md](Prompts_Fix_Spec_TextFinder.md)
- [Prompts_Text_Tone.md](Prompts_Text_Tone.md)

## 2. Entry Binary

Page: `Code/Spec_Driven_Design_Cpp_Entry.html`. Title: Spec-Driven Design: Entry Binary.

The first implementation page. It gives the C++ project its shape, then specifies the binary that wires the shape together. `Cpp_TextFinder_Entry` produces the executable `Cpp_TextFinder` and contains no matching, no file I/O, and no formatting.

The page covers:

- The structure the C++ implementation takes: three libraries and one binary, with the import chain running `Cmdline` to `Dirnav` to `Output`, and nothing importing `Output` but the binary.
- The eight steps of the startup sequence, in order, from parsing `argc`/`argv` to returning exit code 0.
- Skip-list ownership. The binary holds the 11 defaults of Spec_TextFinder.md §3.2 and implements `addSkipDirectory` as a compile-time extension point, not a runtime switch.
- Lifetime. The binary owns the commands, the skip list, and the output instance, and `Cpp_TextFinder_Dirnav` holds references to all three rather than copies.
- The three failure modes that produce exit code 1, and why a root path that cannot be searched is not one of them.
- Source last: `Cpp_Spec_driven_TextFinder_Entry/src/main.cpp`.

Sources: [Cpp_TextFinder_Structure.md](Cpp_Spec_driven_TextFinder/Cpp_TextFinder_Structure.md), [Spec_Cpp_TextFinder_Entry.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_TextFinder_Entry/Spec_Cpp_TextFinder_Entry.md).

Prompts, the pair in `Cpp_Spec_driven_TextFinder_Entry/` plus the four that belong to the C++ project as a whole, which this page introduces:

- [Prompts_Spec_Cpp_TextFinder_Entry.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_TextFinder_Entry/Prompts_Spec_Cpp_TextFinder_Entry.md)
- [Prompts_Fix_Spec_Cpp_TextFinder_Entry.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_TextFinder_Entry/Prompts_Fix_Spec_Cpp_TextFinder_Entry.md)
- [Prompts_Cpp_TextFinder_Structure.md](Cpp_Spec_driven_TextFinder/Prompts_Cpp_TextFinder_Structure.md)
- [Prompts_Fix_Cpp_TextFinder_Structure.md](Cpp_Spec_driven_TextFinder/Prompts_Fix_Cpp_TextFinder_Structure.md)
- [Prompts_Fix_Spec_Cpp_TextFinder.md](Cpp_Spec_driven_TextFinder/Prompts_Fix_Spec_Cpp_TextFinder.md)
- [Prompts_Build_Cpp_TextFinder.md](Cpp_Spec_driven_TextFinder/Prompts_Build_Cpp_TextFinder.md)

## 3. Cmdline Library

Page: `Code/Spec_Driven_Design_Cpp_Cmdline.html`. Title: Spec-Driven Design: Cmdline.

`Cpp_TextFinder_Cmdline` is the single place in the C++ implementation where switch letters, argument syntax, and defaults are known. It opens no stream and terminates no process.

The page covers:

- `ProgramCommands`, whose member initializers are the sole authority in code for the defaults of Spec_TextFinder.md §5. A default-constructed instance equals the result of parsing an empty command line.
- `parse` returning `std::expected<ProgramCommands, std::string>`, so a command-line error travels back as a value and the binary decides what to do with it.
- The four parsing rules: switch-token form, verbatim argument consumption, boolean and path conversion, and the accumulation rule that makes `/P` append while every other switch overwrites.
- Where the seven usage diagnostics of §5.2 are detected. Six arise here; the seventh, a malformed `/r`, waits until `Cpp_TextFinder_Dirnav` compiles the expression.
- Extension-list normalization: split on commas, trim, strip one leading dot, discard empty items, preserve order, retain duplicates, and leave case folding to the component that performs the comparison.
- Source last: `Cpp_Spec_driven_Cmdline/src/Cpp_TextFinder_Cmdline.ixx`.

Sources: [Spec_Cpp_TextFinder_Cmdline.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Cmdline/Spec_Cpp_TextFinder_Cmdline.md), [Spec_TextFinder.md](Spec_TextFinder.md) §4 and §5.

Prompts, both files in `Cpp_Spec_driven_Cmdline/`:

- [Prompts_Spec_Cpp_TextFinder_Cmdline.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Cmdline/Prompts_Spec_Cpp_TextFinder_Cmdline.md)
- [Prompts_Fix_Spec_Cpp_TextFinder_Cmdline.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Cmdline/Prompts_Fix_Spec_Cpp_TextFinder_Cmdline.md)

## 4. Dirnav Library

Page: `Code/Spec_Driven_Design_Cpp_Dirnav.html`. Title: Spec-Driven Design: Dirnav.

`Cpp_TextFinder_Dirnav` walks the tree, reads each selected file, evaluates the expression, formats every match, and emits it. It is the only component that touches file contents, and it writes to no stream.

The page covers:

- The `Output` abstract base class, declared here rather than in the output library, and the template parameter constrained by `requires std::derived_from<Out, Output>` that binds a concrete implementation.
- Explicit recursion. One function iterates a directory and calls itself on each subdirectory it enters, so entries are handled as `std::filesystem::directory_iterator` yields them. `recursive_directory_iterator` is not used, because the library controls its own descent.
- The six traversal rules: root-path resolution, order and descent, recursion under `/s`, silent skip-list pruning, silent passage over symbolic links, and the `cannot open` announcement.
- Why `std::filesystem::path::extension()` cannot implement the `/p` rules. It returns an empty string for `.gitignore`, where §5 gives that file the extension `gitignore`.
- The three admission tests, and the no-content case the constructor records once per run so that a qualifying file is reported from its path alone and `std::ifstream` is never opened for it.
- Matching. The constructor compiles the expression once, `std::regex_search` gives the anywhere-in-the-line match §3.3 requires, and a path-only record ends the loop over a file at its first match.
- Source last: `Cpp_Spec_driven_Dirnav/src/Cpp_TextFinder_Dirnav.ixx`.

Sources: [Spec_Cpp_TextFinder_Dirnav.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Dirnav/Spec_Cpp_TextFinder_Dirnav.md), [Spec_TextFinder.md](Spec_TextFinder.md) §3.2 through §3.4.

Prompts, both files in `Cpp_Spec_driven_Dirnav/`:

- [Prompts_Spec_Cpp_TextFinder_Dirnav.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Dirnav/Prompts_Spec_Cpp_TextFinder_Dirnav.md)
- [Prompts_Fix_Spec_Cpp_TextFinder_Dirnav.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Dirnav/Prompts_Fix_Spec_Cpp_TextFinder_Dirnav.md)

## 5. Output Library

Page: `Code/Spec_Driven_Design_Cpp_Output.html`. Title: Spec-Driven Design: Output.

`Cpp_TextFinder_Output` is the sink. It receives fully formed strings, writes each as one line to stdout, and absorbs every write failure so that neither the traversal nor the binary has to reason about it.

The page covers:

- Why the class takes no configuration. `Cpp_TextFinder_Dirnav` formats every record and announcement in full before emitting it, so nothing is left here to parameterize, and the library cannot tell a record from an announcement.
- Line termination. The constructor puts stdout into binary mode on Windows so the LF that Spec_TextFinder.md §3.4 fixes reaches the stream as one byte, and throws `std::runtime_error` when it cannot.
- Failure absorption. The first failed write puts `output failed` on stderr; every string after that is discarded silently. The library never throws after construction, never returns a status, and never changes the exit code.
- Buffering. No flush happens per record, because flushing each line would dominate a search that emits many; the stream flushes when the instance is destroyed.
- Source last: `Cpp_Spec_driven_Output/src/Cpp_TextFinder_Output.ixx`.

Sources: [Spec_Cpp_TextFinder_Output.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Output/Spec_Cpp_TextFinder_Output.md), [Spec_TextFinder.md](Spec_TextFinder.md) §3.4.

Prompts, both files in `Cpp_Spec_driven_Output/`:

- [Prompts_Spec_Cpp_TextFinder_Output.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Output/Prompts_Spec_Cpp_TextFinder_Output.md)
- [Prompts_Fix_Spec_Cpp_TextFinder_Output.md](Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Output/Prompts_Fix_Spec_Cpp_TextFinder_Output.md)

## 6. Unit and Integration Testing

Page: `Code/Spec_Driven_Design_Cpp_Testing.html`. Title: Spec-Driven Design: Testing.

Where the specification earns its keep. A specification that fixes text byte for byte can be tested against; one that paraphrases cannot.

The page covers:

- The unit-test layout. Each library carries a `*_UnitTest.ixx` beside its source, exporting one entry point, and a `*_TestDriver.cpp` that runs it. Three suites exist, one each for `Cmdline`, `Dirnav`, and `Output`.
- Why the binary has no unit suite. `Cpp_TextFinder_Entry` is not a library, so `Cpp_TextFinder_IntegrationTest.ixx` covers it by driving the built executable end to end.
- What the suites assert against: the reason lines of Spec_TextFinder.md §5.2, the help text of §5.1, the record forms and announcement forms of §3.4, and the defaults of §5 through a default-constructed `ProgramCommands`.
- The two runners. `run_unit_tests.bat` runs the three suites and reports each exit status, then a pass or fail count; `run_integration_tests.bat` runs the one integration suite the same way. Both take the build directory from their own location.
- The output of both runners, shown verbatim.

Sources: [Project_Tree.md](Project_Tree.md), the `*_UnitTest.ixx` files, `run_unit_tests.bat`, `run_integration_tests.bat`.

Prompts: [Prompts_Cpp_Spec_driven_TextFinder_Tests.md](Cpp_Spec_driven_TextFinder/Prompts_Cpp_Spec_driven_TextFinder_Tests.md).

## 7. Demonstration

Page: `Code/Spec_Driven_Design_Cpp_Demonstration.html`. Title: Spec-Driven Design: Demonstration.

The last page of the set. `Cpp_TextFinder_Demo.ixx` runs the built executable against this project's own tree, with `-p "md, ixx, cpp"` fixed for every invocation, and prints what comes back.

The page covers:

- How the demonstration runs. Each invocation states its purpose, echoes the command line as `$ Cpp_TextFinder ...`, shows at most 14 output lines followed by a `... N more` line when there are more, then reports the line count and the exit code.
- The six invocations and what each one demonstrates:
  1. The bare expression. The default `/r` of `.` with no `/n` or `/L` needs no file content, so every selected file is listed from its path alone.
  2. `-r "^export module" -n true -L true` finds where each C++ module is declared, with line numbers and matched text.
  3. `-r "Spec_TextFinder\.md"` finds which documents cite the parent specification, paths only.
  4. The same search with `-s false`, entering no subdirectory.
  5. `-r "usageLine" -h false -v true -n true` turns announcements on and lists the resolved option set ahead of them.
  6. `-r "export("` is malformed, and the run is refused before traversal with the §5.2 diagnostic.
- The captured output of each invocation, shown verbatim in a `<pre>` block, with the exit-code and line-count line that follows it.
- The output of `run_demo.bat`, which reports the demonstration's exit status.

Sources: `Cpp_Spec_driven_TextFinder/src/Cpp_TextFinder_Demo.ixx`, `run_demo.bat`.

Prompts: [Prompts_Final_Tweaks_TextFinder.md](Cpp_Spec_driven_TextFinder/Prompts_Final_Tweaks_TextFinder.md).
