# Spec.md — PyTextFinder/EntryPoint

*Specifies only the wiring and execution flow of `main.py`.  Details of each
package are in their own Spec.md files.*

---

## Responsibility

EntryPoint is the application entry point.  It:

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

`EntryPoint/main.py` — `main()` function called under `if __name__ == "__main__"`.

---

## Flow

```
args from sys.argv[1:]
│
├─ if "-T" or "/T" in args
│     run unittest discovery across all test_*.py files
│     sys.exit(0 or 1)
│
├─ cl = CmdLine(args)       ← parses and applies defaults
│
├─ if args is empty or cl.help
│     print help_text (from CmdLine)
│     return
│
├─ if cl.verbose
│     print verbose option summary
│
├─ output = Output(cl.hide)    ← standalone; no DirNav knowledge
│     output.set_regex(cl.regex)
│
├─ dn = DirNav(cl.recurse)  ← standalone; no Output knowledge
│     dn.dir_handler  = output.on_dir    ← EntryPoint owns the wiring
│     dn.file_handler = output.on_file
│
├─ for each pattern in cl.patterns:
│     dn.add_pattern(pattern)
│
├─ dn.visit(cl.path)            ← runs the walk
│
└─ print summary: N file(s) visited, M file(s) matched
```

---

## Error Handling

| Condition | Behaviour |
|-----------|-----------|
| Root path does not exist | Print error message to stderr; `sys.exit(1)` |
| Root path is not a directory | Print error message to stderr; `sys.exit(1)` |
| Unreadable file during walk | Skip silently (handled inside DirNav/Output) |

---

## Invariants

- `bin`, `obj`, and `.git` are always skipped by DirNav; EntryPoint does not
  need to register them explicitly.
- When no arguments are supplied, help is displayed and the process exits cleanly.
- EntryPoint never calls regex or filesystem APIs directly.
- `sys.path` is extended at module load time so sibling packages are importable
  without installation.

---

*End of Spec.md*
