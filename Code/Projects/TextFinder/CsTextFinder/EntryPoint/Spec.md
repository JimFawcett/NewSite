# Spec.md — CsTextFinder/EntryPoint

*Specifies only the wiring and execution flow of `Program.cs`.  Details of each
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

`Program.cs` — top-level statements (no explicit `Main` method).

---

## Flow

```
args from runtime
│
├─ if args is empty or /h present
│     print help string (from CmdLine)
│     Environment.Exit(0)
│
├─ CmdLine cl = new(args)       ← parses and applies defaults
│
├─ if /v present
│     print verbose option summary
│
├─ Output out = new(cl.Hide)    ← standalone; no DirNav knowledge
│     out.SetRegex(cl.Regex)
│
├─ DirNav dn = new(cl.Recurse)  ← standalone; no Output knowledge
│     dn.DirHandler  = dir  => out.OnDir(dir)    ← EntryPoint owns the wiring
│     dn.FileHandler = file => out.OnFile(file)
│
├─ foreach pattern in cl.Patterns:
│     dn.AddPattern(pattern)
│
├─ dn.Visit(cl.Path)            ← runs the walk
│
└─ print summary: N files visited, M files matched
```

---

## Error Handling

| Condition | Behaviour |
|-----------|-----------|
| Root path does not exist | Print error message; `Environment.Exit(1)` |
| Root path is not a directory | Print error message; `Environment.Exit(1)` |
| Unreadable file during walk | Skip silently (handled inside DirNav/Output) |

---

## Invariants

- `bin`, `obj`, and `.git` are always skipped by DirNav; EntryPoint does not
  need to register them explicitly.
- When no arguments are supplied, help is displayed and the process exits 0.
- EntryPoint never calls regex or filesystem APIs directly.

---

*End of Spec.md*
