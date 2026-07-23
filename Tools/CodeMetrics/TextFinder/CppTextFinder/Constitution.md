# Constitution.md — CppTextFinder

*Language-agnostic governing document for the TextFinder project.*

---

## Purpose

TextFinder searches a directory tree for files whose content contains a match
for a user-supplied regular expression.  It reports each matching file grouped
under its containing directory, with options to control recursion, file-type
filtering, and whether empty directories are shown.

<!-- INPUT NEEDED: Add or remove any high-level capabilities that differ from the
     Rust version, e.g. encoding handling, binary-file behaviour, output format. -->

---

## Scope

The project is intentionally small.  Every component fits in a single source
file.  No component should grow beyond the responsibility described in its own
Spec.md.

---

## Components

| Component    | Responsibility |
|--------------|----------------|
| EntryPoint   | Parses the command line, wires the other components together, and drives execution. |
| CommandLine  | Accepts raw command-line tokens and exposes typed option values to callers. |
| DirNav       | Walks a directory tree depth-first and fires events for each directory and file encountered. |
| Output       | Formats and writes search results to the console (or another sink). |

Each component is specified in its own `Spec.md` and has a `Notes.md` that
records the conversation history used to build it.

<!-- INPUT NEEDED: If an additional component is needed (e.g. a Regex wrapper,
     a Verify/test harness), add a row here and create the matching folder. -->

---

## Design Principles

1. **Single responsibility** — each component does exactly one thing.
2. **Dependency direction** — EntryPoint depends on all libraries; libraries do
   not depend on each other or on EntryPoint.
3. **Caller-defined interfaces** — when one component needs a service from
   another, the *caller* expresses that need as a type-erased callback
   (`std::function`).  The *callee* stores and invokes the callback but has no
   knowledge of who supplies it.  Libraries never include each other's headers.
4. **No reproduction** — EntryPoint's Spec.md describes only the wiring and
   flow; it does not re-state the details already captured in library Specs.
5. **Spec-first** — implementation follows the Spec.  When the implementation
   must deviate, update the Spec first.
6. **Fail-safe reads** — a file that cannot be read or decoded is skipped
   silently; it never causes the search to abort.

<!-- INPUT NEEDED: Add, remove, or reword any principles that do not match your
     preferred style, e.g. error-reporting philosophy, logging policy. -->

---

## Command-Line Interface (abstract)

Options follow a `/Key [Value]` convention.  Boolean flags receive the implicit
value `"true"` when present with no argument.

| Option | Meaning                                      | Default       |
|--------|----------------------------------------------|---------------|
| `/P`   | Root path for the search                     | `.` (cwd)     |
| `/p`   | Comma-separated file extensions to include   | *(all files)* |
| `/s`   | Recurse into subdirectories                  | `true`        |
| `/H`   | `true`: print a directory only when it contains a match (clean output). `false`: print every directory as it is entered, giving real-time traversal progress. | `true` |
| `/r`   | Regular expression matched against content   | `.` (any)     |
| `/v`   | Verbose: echo all options before searching   | *(off)*       |
| `/h`   | Print help and exit                          | *(off)*       |

<!-- INPUT NEEDED: Add any new options or change defaults here; mirror the change
     in CommandLine/Spec.md. -->

---

## Invariants

1. Build output and tooling directories are always excluded from traversal:
   `bin`, `obj` (C#), `target` (Rust), `build`, `out` (C++),
   `__pycache__`, `.venv`, `venv`, `dist` (Python),
   `.git`, `.vs`, `.idea` (VCS/IDE).
2. Running with no arguments displays help and exits cleanly.
3. A missing or unreadable root path is reported and the program exits with a
   non-zero status.

---

## Versioning

<!-- INPUT NEEDED: Provide an initial version string, e.g. "1.0.0", and decide
     whether to embed the version in the binary (e.g. via a #define or cmake
     configure_file step). -->

---

*End of Constitution.md*
