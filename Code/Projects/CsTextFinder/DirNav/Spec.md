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

```csharp
{ "bin", "obj", ".git" }
```

These are initialised in the constructor and cannot be removed.

### Configuration

```csharp
public Action<string>? DirHandler  { get; set; }
public Action<string>? FileHandler { get; set; }
public void AddPattern(string ext);    // e.g. "cs", "txt"
public void AddSkip(string name);      // add one name to skip list
public void SetRecurse(bool recurse);
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

1. Check `root` exists and is a directory; return `false` otherwise.
2. Invoke `DirHandler` with the normalised `root` path string.
3. Enumerate entries in `root`:
   - If the entry is a file and its extension matches any pattern (or the
     pattern list is empty), invoke `FileHandler` with the file name only
     (`Path.GetFileName`).
   - If the entry is a directory, check its bare name against the skip list.
     If **not** in the skip list and `recurse` is `true`, recurse.
4. Path separators are normalised to `'/'` before passing to handlers.
5. Any `IOException` on an individual entry is caught and the entry is skipped.

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
- The default skip list (`bin`, `obj`, `.git`) is always active; callers may
  extend it with `AddSkip()` but may not shrink it.
- `AddSkip()` is idempotent: adding the same name twice has no effect.

---

*End of Spec.md*
