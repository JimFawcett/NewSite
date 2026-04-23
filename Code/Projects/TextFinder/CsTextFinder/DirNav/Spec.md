# Spec.md — CsTextFinder/DirNav

*Specifies the directory navigation library.*

---

## Responsibility

DirNav walks a directory tree depth-first and fires an event for each directory
entered and each qualifying file found.  It has no knowledge of regex, output
formatting, or command-line syntax.

---

## Source File

```
DirNav/
└── DirNav.cs
```

---

## Delegates

DirNav fires two caller-supplied `Action<string>` delegates; it has no knowledge
of who registers them or what they do.  The caller (EntryPoint) owns both the
actions and the objects they close over.

```csharp
public Action<string>? DirHandler  { get; set; }
public Action<string>? FileHandler { get; set; }
```

DirNav does **not** define any interface or abstract base class.  Libraries that
want to receive events (e.g. Output) expose plain methods; EntryPoint wires them
via lambda expressions.

---

## Class `DirNav`

### Constructor

```csharp
public DirNav(bool recurse = true);
```

### Default Skip List

The following directory names are always skipped, regardless of any
`AddSkip()` calls:

| Language / tool | Skipped names |
|-----------------|---------------|
| C# / .NET       | `bin`, `obj` |
| Rust            | `target` |
| C++             | `build`, `out` |
| Python          | `__pycache__`, `.venv`, `venv`, `dist` |
| VCS / IDE       | `.git`, `.vs`, `.idea` |
| Archives        | `archive` |

These are initialised in the constructor and cannot be removed.

### Configuration

```csharp
public Action<string>? DirHandler  { get; set; }
public Action<string>? FileHandler { get; set; }
public bool Recurse { get; set; }
public void AddPattern(string ext);    // e.g. "cs", "txt"
public void AddSkip(string name);      // add one name to skip list
```

`AddSkip()` appends to the skip list; it may be called any number of times.
Names are matched against the bare directory name (not a full path),
case-insensitively on Windows.

The internal skip list is a `HashSet<string>` (case-insensitive on Windows) so
duplicate entries are silently ignored.

### Walk Method

```csharp
public bool Visit(string root);
```

Returns `true` on success, `false` if the root path does not exist or is not a
directory.  Counters are reset at the start of each `Visit` call.

```csharp
public int FileCount { get; }
public int DirCount  { get; }
```

### Walk Algorithm

`Visit(root)`:
1. Check `root` exists via `Directory.Exists`; return `false` if not.
2. Reset `_fileCount` and `_dirCount` to zero.
3. Call the private `VisitImpl(root)`.

`VisitImpl(dir)`:
1. Increment `_dirCount`.
2. Invoke `DirHandler` with the normalised `dir` path (backslashes → `'/'`).
3. The following two loops are wrapped in a single `try/catch` that silently
   swallows `IOException` and `UnauthorizedAccessException` for the entire
   directory if access fails.
4. First loop — `Directory.EnumerateFiles(dir)`: for each file whose extension
   matches any pattern (or the pattern list is empty), increment `_fileCount`
   and invoke `FileHandler` with the bare filename (`Path.GetFileName`). All
   files in the current directory are processed before any subdirectory is
   entered.
5. Second loop — `Directory.EnumerateDirectories(dir)` (only when `Recurse`
   is `true`): for each subdirectory whose bare name is **not** in the skip
   list, call `VisitImpl` recursively.

---

## Patterns

- Extensions are stored without a leading dot: `"cs"`, `"txt"`.
- Matching strips the leading dot from `Path.GetExtension` before comparing.
- Matching is case-insensitive (using `StringComparison.OrdinalIgnoreCase`).

---

## Invariants

- `Visit()` never throws; filesystem errors on individual entries are caught and
  the entry is skipped.
- If `AddPattern()` is never called, all files are passed to `FileHandler`.
- The default skip list (see table above) is always active; callers may
  extend it with `AddSkip()` but may not shrink it.
- `AddSkip()` is idempotent: adding the same name twice has no effect.

---

*End of Spec.md*
