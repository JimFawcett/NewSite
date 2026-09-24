# Prompts and Replies — Building Python_TextFinder

This file records the turns that produced the Python TextFinder, from the creation of this folder through the specifications, the code, the suites, the demonstration, the ignore rules, the review that followed, and the documentation pages. The seven turns ran on 2026-09-24, beginning with turn 1 and holding no earlier work. Turns 1 through 4 produced the implementation, turns 5 and 6 reviewed it, and turn 7 documented it.

The siblings split this record in two — a `Prompts_Spec_*.md` per component and a `Prompts_Build_*.md` for the code. This thread produced its specifications and its code in one session, and turn 4 asked for one file, so both are here. [Page_Structure.md](../Page_Structure.md) §8 assigns a record to a thread by the directory level it was produced at, and every turn below was produced inside this folder or about it.

**Which route this thread took matters and is recorded rather than assumed.** [Constitution.md](../Constitution.md) rule 1 makes the specifications the only lawful source for code by default, and permits a sibling implementation to serve as an example when a user prompt asks for one. The two turns took different routes on purpose. Turn 1's prompt asked for the C# implementation as an example, so the five Python documents were written with the four C# specifications and the C# structure document in view. Turn 2's prompt restricted the work to "Project and Python specifications," so the code was written from those alone. Turn 2 carries the disclosure that follows from the two routes meeting in one session.

User prompts are quoted verbatim. Assistant replies are summarized from the actual responses; tool calls are noted as effects rather than transcribed.

---

## Turn 1

### User

> read project level Constitution, Spec_TextFinder. create Python_Spec_Driven_TextFinder directory and create Python TextFinder specification usinging CSharp TextFinder as an example.  Do not create code but do create the spec.

### Assistant

Read [Constitution.md](../Constitution.md) and [Spec_TextFinder.md](../Spec_TextFinder.md), then the C# structure document and all four C# component specifications — which rule 1 permits, this prompt being the request that permission is gated on. No C# source was read, then or later.

Spelled the folder `Python_Spec_driven_TextFinder` with a lower-case `driven` where the prompt wrote `Driven`, matching the three siblings, and said so rather than silently correcting it.

Created five documents:

- [Python_TextFinder_Structure.md](Python_TextFinder_Structure.md) — the same three-libraries-and-one-binary shape and the same dependency chain: `python_textfinder_dirnav` imports `python_textfinder_cmdline`, `python_textfinder_output` imports `python_textfinder_dirnav`, nothing imports Output but the binary.
- [Spec_Python_TextFinder_Cmdline.md](Python_Spec_driven_Cmdline/Spec_Python_TextFinder_Cmdline.md)
- [Spec_Python_TextFinder_Dirnav.md](Python_Spec_driven_Dirnav/Spec_Python_TextFinder_Dirnav.md)
- [Spec_Python_TextFinder_Output.md](Python_Spec_driven_Output/Spec_Python_TextFinder_Output.md)
- [Spec_Python_TextFinder_Entry.md](Python_Spec_driven_TextFinder_Entry/Spec_Python_TextFinder_Entry.md)

The structure document records the route this thread took, per the Constitution's note that a thread written with a sibling in view says so.

**Where Python forced a different answer rather than a renamed one**, each written into the document that owns it:

1. **Unrenderable names resolve the opposite way from C#.** CPython decodes a filename with the filesystem encoding and the `surrogateescape` handler, so a POSIX name that is not valid UTF-8 arrives as a `str` carrying lone surrogates and *can* be opened, where the C# runtime substitutes U+FFFD and loses the ability to open it. §3.4 nonetheless requires such a file be announced rather than searched, so Dirnav §5 rule 6 runs an explicit surrogate test and performs the U+FFFD substitution itself. The specification wins over what the language makes easy, and the cost — a file this implementation could have searched and gives up — is recorded as the price of §6's match set.
2. **Free functions.** Cmdline's four entry points are module-level functions, not static methods of a class. The C# structure exists to work around the absence of free functions, so it does not carry over.
3. **`argparse` rejected by name**, at length, because it is the module a Python reader expects to find. It accepts no `/` introducer, distinguishes `-P` from `--P`, abbreviates long options by prefix, treats a switch's argument as a switch when it begins with `-`, and on a malformed line writes usage text of its own and calls `sys.exit(2)` — overriding both §5.1's fixed help text and §3.4's exit codes.
4. **No result type and no `out` parameters**, so `parse` returns a `(commands, diagnostic)` pair with exactly one element not `None`.
5. **The seam is a `typing.Protocol`**, and the document says plainly that it buys less than its counterparts: a C++ template instantiation and a Rust monomorphization devirtualize the call, a C# generic at least bounds the type at compile time, and a Python annotation bounds nothing at run time and changes no dispatch. `abc.ABC` was rejected because nominal inheritance would force a test recorder to import the Dirnav package to subclass it.
6. **`sys.argv[0]` holds the program name**, as C++'s `argv[0]` and Rust's first `args_os()` element do and C#'s `string[] args` does not, so the parser scans from index 1 and the bare command line is a one-element list.
7. **`print` and `sys.stdout` are forbidden implementation-wide.** `sys.stdout` is opened with `newline=None` and translates `\n` to `\r\n` on Windows, so the interpreter's most obvious way to write a line is the one §3.4 forbids. The sink owns a `TextIOWrapper` over `sys.stdout.buffer` with `newline="\n"` and a fixed `encoding="utf-8"`, which also puts the output beyond the reach of `PYTHONIOENCODING` and `-X utf8`.
8. **`close` is a hazard where C# has none.** Closing a `TextIOWrapper` closes the object beneath it, so the sink flushes and then calls `detach`, which severs the wrapper without closing `sys.stdout.buffer` and disarms the wrapper's own finalizer.
9. **`errors="replace"` substitutes `?` on encoding, not U+FFFD** — it substitutes U+FFFD only on decoding. That is why §3.4's U+FFFD requirement is discharged by Dirnav rather than left to the codec, with the sink's handler kept as a backstop for a command-line argument the interpreter could not decode.
10. **No build step, and no enforcement of the dependency chain.** Python compiles on import, so this implementation has no build definition; imports resolve through `PYTHONPATH`. The chain the other three have their build tools enforce is here a rule the specifications state and nothing holds, and the document says so rather than claiming a guarantee.
11. **The skip list is handed over as a `tuple`**, which cannot be modified at all — stronger than C#'s `IReadOnlyList<string>`, through which a caller holding the underlying list can still change what the library sees. Against that, `_SKIP_LIST` and `_add_skip_directory` carry a leading underscore, which is the whole of Python's access control where C# has `private`; the Entry document records that as a stated weakness.
12. **`unittest` is in the standard library**, so §6's no-third-party-framework rule admits it and this thread needs no hand-written runner inside each suite, where the C# thread had to write one because every .NET test adapter arrives as a NuGet package. `pytest` is rejected by name.

**One ambiguity raised rather than filled.** §3.6 excludes from the file count an entry whose name will not render, and counts a directory that drew `cannot open`. A *directory* whose name will not render meets both clauses. The case cannot arise in C#, where the runtime's substitution makes the name unopenable before the library sees it, so this thread is the first in the project to have to settle it. Dirnav §8.1 fixes it as **not counted**, on the ground that §3.6's primary rule counts a directory when TextFinder reads its entries or tries to, and this one is refused before the attempt — and flagged it in the reply as a reading the user may want to confirm. It remains unconfirmed.

Also flagged that [Project_Tree.md](../Project_Tree.md) had gone stale, listing three implementations.

---

## Turn 2

### User

> using only Project and Python specifications build the python code, including unit, integration, and demonstration tests.  Confirm that these all pass and run

### Assistant

Took "only Project and Python specifications" as withdrawing turn 1's sibling permission, and honored it: no C# source was opened in this session, so this turn took rule 1's default route.

**Two specification edits before any code**, since rule 1 puts the document ahead of the code and both were defects in what turn 1 had written:

- [Spec_Python_TextFinder_Dirnav.md](Python_Spec_driven_Dirnav/Spec_Python_TextFinder_Dirnav.md) §8 held two sentences in tension. One put the `\`-to-`/` normalization inside the shared rendering function; the other put it on the root path's text alone. Rewriting a `\` inside an entry name would report a path the tree does not hold, a `\` being a name character on POSIX rather than a separator, so the rendering function now performs the U+FFFD substitution alone and the paragraph above it keeps the root normalization.
- [Spec_Python_TextFinder_Entry.md](Python_Spec_driven_TextFinder_Entry/Spec_Python_TextFinder_Entry.md) §7 listed `re` and `sys` as the binary's standard-library imports, but §5's skip-list comparison needs the platform rule and therefore `os.name`. `os` was added to the list, with a sentence saying why the two-line rule is written out in the binary rather than reached for through another package's private name.

**Four packages and eleven source files**, under the `src/` layout the structure document fixes: `python_textfinder_cmdline` (`program_commands.py`, `command_line.py`), `python_textfinder_dirnav` (`output.py`, `dirnav.py`), `python_textfinder_output` (`stdout_sink.py`), and `python_textfinder_entry` (`entry.py`, `__main__.py`). Two launchers, `Python_TextFinder.bat` and `Python_TextFinder`, one per platform, each setting `PYTHONPATH` and invoking `python -m python_textfinder_entry`; `Python_TextFinder` is the name §5.1 substitutes for `<executable>`, fixed in the Cmdline package rather than read from `sys.argv[0]`, which under `python -m` holds the path of `__main__.py`.

**Standard-library calls rejected by name in the code, each one a rule §3.3 or §5 fixes that the obvious call gets wrong:**

- `str.splitlines()` splits on eight terminators §3.3 does not recognize — vertical tab, form feed, the file, group, record, and unit separators, NEL, and the line and paragraph separators — so a line holding a form feed would become two lines here and stay one in every sibling. Splitting uses a compiled `\r\n|\n|\r` with the two-character form first in the alternation, and discards the trailing empty element a terminated file produces.
- `os.path.splitext` and `pathlib.Path.suffix` both return no extension for `.gitignore`, where §5 fixes its extension as `gitignore`. This is the reverse of the C# case, where `Path.GetExtension` happens to agree with §5 and was rejected on principle; here the standard call would change which files are searched.
- `data.decode("utf-8", errors="replace")` and `errors="surrogateescape"` each turn §3.3's UTF-8 test into no test at all, and `open(path, "r")` decodes with the locale's encoding and applies universal-newline translation before §3.3's line rule is reached.
- `os.walk` yields a directory's subdirectories and files as two lists, grouping them in exactly the way §3.2 forbids, and owns the descent `/s` and the skip list must decide.
- `DirEntry.is_dir()` and `is_file()` default to `follow_symlinks=True`, so the default is the behavior §3.2 forbids and the argument is written out at every call.
- `re.ASCII` would move this implementation to the C++ side of §6.1's one recorded engine difference, and the module-level `re.search` consults a pattern cache that would defeat §3.3's compile-once rule.
- `str(value)` returns `"True"`, which §5.3 forbids; `str.strip()` with no argument trims every character `str.isspace` reports, a wider set than the six §5 names; `str.lstrip(".")` removes every leading dot where §5 removes one.
- `str.casefold()` folds `ß` onto `ss`, so two names Windows treats as distinct would compare equal; the Windows comparison uses `str.lower()`. Python's `str.lower` is defined by the Unicode database rather than by a locale, so the Turkish-culture hazard the C# thread must guard against does not arise here, which the document records as a property of the language rather than a decision.

**Three unit suites, one integration suite, one demonstration, three runners.** §6.2 has a runner build what it is about to run; there is no build here, so each runner puts the four `src/` folders on `PYTHONPATH` and runs `python -m compileall -q` over them, counting every suite as failed if that reports an error.

**Results, all on the first run of each suite:**

| Runner | Suites | Checks | Exit |
|---|---|---|---|
| `run_unit_tests.bat` | cmdline 46, dirnav 51, output 21 | 118 | 0 |
| `run_integration_tests.bat` | integration 28 | 28 | 0 |
| `run_demo.bat` | demonstration, 8 invocations | — | 0 |

Nothing in the implementation had to be corrected against a failing check. The demonstration's capture was saved to [Demo_9-24-2026.md](Demo_9-24-2026.md), stating its date per §6.2.

**What the suites hold to**, beyond the obvious: LF-only stdout asserted at the byte level through a pipe on Windows, before any decoding; the eight terminators `str.splitlines()` would wrongly split on, one test each; `.gitignore` selected by `/p gitignore`; the no-content fast path reporting a binary file it never opened, which is §3.3's accepted cost made visible; a file at 10,485,760 bytes searched and one at 10,485,761 announced; the exact nine-line §5.3 listing; all six parse reason lines and the seventh the binary writes; and the run-summary counts under `/s false`, `/p`, pruning, and two roots.

**§6.2's never-built rule verified by test rather than by reading.** Renamed the Output suite away, ran the unit runner, and confirmed it reported `output - suite not present` and exited 1 rather than passing by absence; then restored it.

**One disclosure, and it is weaker than a clean-room derivation.** No C# source was read in this session. But the four C# specifications were read in turn 1 and were still in context while the Python code was written, and that cannot be undone. The Python code derives from the Python and project specifications, and those specifications were themselves written with the C# specifications in view. This thread is therefore evidence that a specification set is sufficient to produce an implementation, and not evidence that it was produced independently of the sibling.

Closed by flagging two things: `__pycache__` was ignored nowhere in the repository, and [Project_Tree.md](../Project_Tree.md) still documented three implementations.

---

## Turn 3

### User

> add git ignore rule and update the Project_Tree.md

### Assistant

Read the request as naming the repository root `.gitignore`, which was the subject of the sentence it answered, and said so rather than assuming it — rule 2 bars modifying a file outside `Spec_driven_TextFinder/` without an explicit request naming it. The C# thread's turn 5 had moved every implementation's rule into that one file, so the Python rule joined them there rather than starting a local file again:

    Code/Projects/Spec_driven_TextFinder/Python_Spec_driven_TextFinder/**/__pycache__/

Every entry in that block is a scoped path rather than a bare directory name, so no name common elsewhere in the site repository is ignored on its account. Verified with `git check-ignore`, then with `git status --untracked-files=all` over this folder, which reported 27 untracked files — all specifications, source, suites, launchers, and runners, with no `__pycache__` path among them.

**[Project_Tree.md](../Project_Tree.md)**, three changes:

- The Python subtree added to the tree block, checked line for line against the actual layout, and the C# block's connectors redrawn from `└──` to `├──` since it is no longer last.
- The omitted-output line gained `__pycache__/` and now reads that the first *five* names are ones the default skip list of §3.2 prunes, with a sentence recording that each is covered by a path-scoped rule in the root `.gitignore`.
- A **Python** legend section covering the package layout, the two launchers, the absence of a project file, `compileall` standing in for §6.2's build step, and why `unittest` serves here where the C# thread had to hand-write a runner.

Offered the alternative, which was not taken: a `.gitignore` holding `__pycache__/` inside this folder would do the same job without the edit outside the project boundary.

---

## Turn 4

### User

> create Prompts_Build_Python_TextFinder.md with all prompts and replies

### Assistant

Created this file, [Prompts_Build_Python_TextFinder.md](Prompts_Build_Python_TextFinder.md), covering the four turns from the creation of this folder through the specifications, the code, the suites, the demonstration, and the ignore rules. [Page_Structure.md](../Page_Structure.md) §8 decides a record's thread by the directory level it was produced at, so this one sits in the Python folder and belongs to the Python thread; its §8 table assigns a `Prompts_Build_[lang]_TextFinder.md` to that thread's Process page, which does not exist yet.

Read the C# record first to match its format, which is documentation rather than code and so is outside what rule 1 governs.

Two things this record carries that the Python thread's Process page will need and cannot reconstruct from the files: that turn 1 and turn 2 took different routes under rule 1, and turn 2's disclosure about what was in context when the code was written.

---

## Turn 5

### User

> think carefully about amiguities, inconsistencies, and things needing improvement in the Python specs including the project level spec

### Assistant

Reviewed all five Python documents against [Spec_TextFinder.md](../Spec_TextFinder.md) and against the running code, and probed the edges rather than reasoning only from the documents. Three findings were demonstrated rather than inferred: `/H true /r "("` exits 0 with help and an empty stderr; `-P src/` reaches a doubled-separator path under §3.4's literal rule; and a sink with both stdout and stderr broken lets an `OSError` escape, which a probe printed as `ESCAPED: OSError: broken pipe`.

Ten findings, ranked. Project level: the `/H`-versus-invalid-`/r` precedence was unspecified and observable; a root path with a trailing separator was unspecified; §3.6 did not settle a directory whose name will not render; §5's `/p` normalization could leave whitespace inside an extension; §5.1 did not fix the help text's line terminator. Python level: [Spec_Python_TextFinder_Output.md](Python_Spec_driven_Output/Spec_Python_TextFinder_Output.md) §6 asserted an invariant the design did not hold; [Spec_Python_TextFinder_Cmdline.md](Python_Spec_driven_Cmdline/Spec_Python_TextFinder_Cmdline.md) §4 overclaimed that a pair of optionals narrows for a type checker; three smaller documentation defects. And two places where the code outran its specification, both Constitution rule 1 matters: the trailing-separator guard in `_join`, and swallowing an exception from `detach`.

Also proposed the artifact the project most lacked — a committed fixture, on the ground that comparing four implementations with one another cannot catch a misreading two of them share, and gives no evidence about which side is wrong when they differ.

---

## Turn 6

### User

Answered each finding by number: settle 1 as the sibling does; leave 2, 3, and 9 and record them in a project-level `Important_Notes.md`; fix 4 and note it; fix 5; fix 6 if there is a way; use a small result class for 7; fix the first two parts of 8 and add a test for the third; use the guard and document it for 10; and add the fixture with the remaining suggestions.

### Assistant

**Checked the siblings before settling finding 1**, since "as done for sibling" is only safe if the siblings agree. All four answer `/H` before compiling the expression — C++ at steps 3 and 7, Rust at 4 and 8, C# at 3 and 6, Python at 3 and 6 — so the rule cost no implementation a change.

**[Spec_TextFinder.md](../Spec_TextFinder.md)** gained a new **§5.4 Order of Resolution** fixing five precedences, among them that /H is answered before the expression is compiled and before the /v listing; §5's `/p` row gained a second trim after the dot strip; §5.1 gained the LF terminator rule; and §6.2 gained the fixture, with the three parts of its comparison rule that are properties of the parent rather than of the fixture — stdout and exit code only, bytes rather than decoded text, and a set comparison for output spanning a directory whose order §3.2 leaves to the platform.

**[Important_Notes.md](../Important_Notes.md)** created, with five entries: N1 the trailing separator, N2 the §3.6 directory reading, N3 the Python `_join` branch that outruns §3.4, N4 the `/p` change landed in the parent and implemented in Python only, N5 the fixture wired into Python only. Its header states why three of them are deferred rather than fixed — four working implementations beat four that are each mid-edit — and each entry states the rule it would become, so a later pass has the decision made and only the code to write.

**[Fixture/](../Fixture/)** created: eleven files chosen so each admission and selection rule of §3.2, §3.3, and §5 is reached; `cases.txt` holding 31 cases in a pipe-separated format any of the four languages can parse with a split; `expected/` holding one file per case; and `.gitattributes` setting `* -text`, without which a Windows checkout would rewrite `crlf.txt` and `cr.md` and three cases would fail for a reason unrelated to the implementation. Every expected file was read against §3 through §5 case by case before being committed, and [Fixture/Fixture.md](../Fixture/Fixture.md) states plainly that they were captured from the Python implementation rather than derived independently, and what that is and is not worth.

**Python specifications and code.** The parse entry now returns `ProgramCommands | ParseFailure`, a union that narrows under `isinstance` where the old pair of optionals could not, with §4 rewritten to say why. The sink's `output failed` notice and the binary's stderr writes are guarded, closing the escape a probe had demonstrated; §6 and §7 record what the guards buy, `detach` included. The `/p` normalization trims a second time. Dirnav §5 gained an ordered summary of the walk ahead of its seven rules, §9's import list was corrected, and Cmdline §7 now names PEP 604 as the reason the floor is 3.10 rather than leaving it at "other reasons".

**Tests.** 146 checks before, 159 after — four for the result type, four for the second trim, three for a sink with both streams broken, and two for the interpreter floor, one of which parses every source file with `ast.parse(..., feature_version=(3, 10))` and so holds the floor claim for syntax rather than asserting it. The fixture case runner adds one check that drives all 31 cases as subtests.

**Two things verified rather than assumed.** Corrupting one expected file made the integration suite fail and name the case, so the fixture check bites rather than passing vacuously. And the demonstration capture was regenerated rather than edited, per §6.2, since the source line numbers it reports had moved.

---

## Turn 7

### User

> read Text_Tone.md, Constitution.md, Page_Structure.md then build documentation pages: Code/Spec_Driven_Design_Python_*.html using the Python_Spec_driven_TextFinder directory contents and Code/Spec_Driven_Design_CSharp_*.html as examples

### Assistant

Read the three governing documents, then the five Python documents, the eleven sources, the four suites, and the C# pages as the page-shell example. The C# pages are documentation rather than code, so reading them is outside what Constitution rule 1 governs; no C# source was read.

**One divergence found before any page was written, and raised rather than settled.** [Page_Structure.md](../Page_Structure.md) §7.1 fixes eleven invocations rooted at `Spec_driven_TextFinder/` with `-p "md, [ext]"`, and §7.2 fixes the six-part block format. `demo/demo.py` ran a set of eight of its own choosing, rooted at this implementation's own folder, in a format of its own. The C++, Rust, and C# drivers all run the eleven. The user chose to bring the driver to the document rather than document the divergence.

**[demo/demo.py](demo/demo.py) rewritten to §7.1 and §7.2.** Page_Structure.md matches the `*Structure.md` pattern of rule 1, so §7 is a lawful source for this change. The driver now:

- runs the eleven invocations of §7.1, with `[ext]` resolving to `md, ixx, cpp, rs, cs, py` — the cumulative list §0 fixes, Python being fourth in the order — `[ownext]` to `py`, `[decl]` to `^def `, `[docword]` to `import`, and `[badregex]` to `def (`;
- writes the four-field header §7.2 fixes: the capture date, the executable, the search root, and the extension list;
- gives each block the six parts of §7.2, including the 14-line excerpt with its `... N more` line and the run summary shown after it;
- invokes the launcher `Python_TextFinder.bat` rather than `python -m` directly, so the header and the echoed command line name the executable §5.1 substitutes for `<executable>`;
- reconfigures its own stdout to UTF-8, which is the driver's own stream and not the sink under test.

[run_demo.bat](run_demo.bat) now supplies `TEXTFINDER_DEMO_DATE` from `Get-Date`, as the Rust and C# runners do, and echoes it; the driver falls back to the UTC civil date when the variable is absent.

**[Demo_9-24-2026.md](Demo_9-24-2026.md) recaptured in full rather than edited**, per §6.2 and Page_Structure.md §7.5. The eleven blocks report `accessed 107 files, 58 directories` for invocation 2, against the C# capture of 2026-09-16 reporting 81 over five extensions; the difference is this implementation's own sources and documents, the `Fixture/` folder, `Important_Notes.md`, and one extension added to the search.

One consequence worth recording: invocation 6 is the one block §7.4 makes comparable across implementations, and this capture reports nine paths and `accessed 14 files, 1 directories` where the C# capture reports eight and 13. Both are right. `Important_Notes.md` joined the project root between the two captures, so the disagreement is §7.5's staleness rule rather than a defect in either implementation — and it is the first case in the project where the one comparable block does not agree.

**Eight pages created** under `Code/`, at indices 0 through 7 of §5, with `Code/js/SpecDrivenPythonPages.js` as the thread's page-list file. The `repoLinks` Python entry on all 34 existing pages was changed from disabled to a live link, per §2.4, crossing by part name where a counterpart exists and to this thread's first page where it does not.

Nothing in the implementation was changed but the demonstration driver and its runner. The suites were re-run after the change and report 53, 51, 24, and 34 checks passing.

**All four demonstrations were then re-run on one tree state**, at the user's direction, because the capture exposed a disagreement that looked like a defect and was not. [Page_Structure.md](../Page_Structure.md) §7.4 makes invocation 6 the one block of the seven a reader can compare across implementations, and this capture reported nine paths and `accessed 14 files, 1 directories` where the siblings' captures of 2026-09-16 reported eight and 13. `Important_Notes.md` had joined the project root in turn 6. §7.5 calls that stale rather than wrong, so the cheap settlement was to retake every capture rather than to argue the point in prose.

- The C++, Rust, and C# projects were built and their demonstrations run; each `Demo_9-16-2026.md` was replaced by a `Demo_9-24-2026.md`, per §7.5's rule that a stale capture is replaced rather than kept beside its successor. [Project_Tree.md](../Project_Tree.md) took the three new names.
- The three sibling Demonstration pages had their eleven capture blocks and their header replaced, and every count-bearing sentence around them corrected — invocation 2 went from 62 lines to 72 for C++, 71 to 81 for Rust, and 82 to 92 for C#, with invocations 3, 4, 5, and 7 moving with them. None of that is any implementation changing: the Python thread's own documents and the shared `Fixture/` account for the whole of it.
- Invocation 6 now agrees in all four: nine paths in the same order and `accessed 14 files, 1 directories`. That is a narrower claim than it looks and a sharper one, since the paths could agree while a count disagreed.

One drift is accepted rather than chased. A capture written into the tree is a file the next search finds, and these captures quote `too large`, so invocations 3 and 4 would report more lines on a further run. §7.5 already settles that a capture is dated rather than a fixed expected result, and iterating to a fixed point would buy nothing a date does not.

**Stale counts corrected across eleven other pages.** A dozen sentences on the Behavior, Process, C++, Rust, and C# pages read "all three implementations built so far" or "the other two", written when three existed. Each was checked in context and changed only where it described the present state of the project; a sentence describing a dated capture or a past turn was left as the record it is.
