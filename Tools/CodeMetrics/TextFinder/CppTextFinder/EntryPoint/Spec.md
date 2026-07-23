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

## Source Files

```
EntryPoint/src/
├── main.cpp
└── test.cpp
```

---

## Flow

```
main(argc, argv)
│
├─ if argc == 1 or /h present
│     print help string (from CmdLine::help_text())
│     return 0
│
├─ CmdLine cl(argc, argv)      ← parses and applies defaults
│
├─ if /v present
│     print verbose option summary to std::cout
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
│     dn.add_pattern(pattern)
│
├─ dn.visit(std::filesystem::path(cl.path()))
│
└─ print summary: N file(s) visited, M file(s) matched
```

---

## Error Handling

| Condition | Behaviour |
|-----------|-----------|
| Root path does not exist or is not a directory | Print error to `std::cerr`; return 1 |
| Unreadable file during walk | Skip silently (handled inside DirNav/Output) |

Error detection is return-value based: `dn.visit()` returns `false` when the
root path is invalid.

---

## Invariants

- `bin`, `obj`, `target`, `build`, `out`, `__pycache__`, `.venv`, `venv`,
  `dist`, `.git`, `.vs`, `.idea`, and `archive` are always skipped by DirNav;
  EntryPoint does not need to register them explicitly.
- When no arguments are supplied, help is displayed and the process exits 0.
- EntryPoint never calls regex or filesystem functions directly.

---

*End of EntryPoint/Spec.md*
