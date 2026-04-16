# Spec.md — EntryPoint

*Specifies only the wiring and execution flow of `main.cpp`.  Details of each
library are in their own Spec.md files.*

---

## Responsibility

EntryPoint is the application binary.  It:

1. Acquires and validates command-line arguments via **CommandLine**.
2. Configures a **DirNav** instance with the root path, extension patterns, and
   recursion flag.
3. Registers an **Output** handler as the DirNav event receiver.
4. Runs the directory walk.
5. Prints a summary line (counts of files visited and matches found).

EntryPoint contains no searching logic, no output formatting, and no directory
traversal logic.

---

## Source File

`src/main.cpp`

<!-- INPUT NEEDED: Confirm this is the only source file in EntryPoint, or list
     additional files if needed (e.g. a TfAppl adapter class). -->

---

## Flow

```
main(argc, argv)
│
├─ if argc == 1 or /h present
│     print help string (from CommandLine)
│     exit 0
│
├─ CmdLine cl(argc, argv)      ← parses and applies defaults
│
├─ if /v present
│     print verbose option summary
│
├─ Output out(cl.hide())       ← standalone; no DirNav knowledge
│     out.set_regex(cl.regex())
│
├─ DirNav dn(cl.recurse())     ← standalone; no Output knowledge
│     dn.set_dir_handler(      ← EntryPoint owns the wiring
│         [&out](const std::string& d){ out.on_dir(d);  })
│     dn.set_file_handler(
│         [&out](const std::string& f){ out.on_file(f); })
│
├─ for each pattern in cl.patterns():
│     dn.add_pattern(patt)
│
├─ dn.visit(cl.path())         ← runs the walk
│
└─ print summary: N files visited, M files matched
```

<!-- INPUT NEEDED: Decide on the exact summary line format. -->

---

## Error Handling

| Condition | Behaviour |
|-----------|-----------|
| Root path does not exist | Print error message; exit with status 1 |
| Root path is not a directory | Print error message; exit with status 1 |
| Unreadable file during walk | Skip silently (handled inside DirNav/Output) |

<!-- INPUT NEEDED: Specify whether to use exceptions, error codes, or
     std::expected/std::optional for signalling path errors from DirNav. -->

---

## Invariants

- `target`, `build`, and `.git` are always skipped by DirNav; EntryPoint does
  not need to register them explicitly.
- When no arguments are supplied, help is displayed and the process exits 0.
- EntryPoint never calls regex or filesystem functions directly.

---

*End of EntryPoint/Spec.md*
