# Spec.md — CsTextFinder/Output

*Specifies the output formatting library.*

---

## Responsibility

Output receives directory and file events from DirNav (via `Action<string>`
delegates registered by EntryPoint) and decides what to print and when.  It
also performs the regex match against file content.

Output has no knowledge of command-line parsing or directory traversal
mechanics.

---

## Source File

```
Output/
└── Output.cs
```

---

## Class `Output`

Output is a standalone class.  It does **not** implement any DirNav interface.
EntryPoint registers its methods as DirNav delegates using lambda expressions.

### Constructor

```csharp
public Output(bool hide = true);
```

### Configuration

```csharp
public void SetRegex(string pattern);
public void SetHide(bool hide);
```

### Public Event Methods

These are plain methods.  EntryPoint passes them to DirNav via lambdas:

```csharp
// in Program.cs:
dn.DirHandler  = dir  => out.OnDir(dir);
dn.FileHandler = file => out.OnFile(file);
```

#### `OnDir(string dirPath)`

Saves `dirPath` as the current directory and clears the "directory already
printed" flag.

- **`hide = false`**: prints the directory path immediately and flushes
  `Console.Out`.  The user sees each directory as it is entered, providing
  real-time traversal progress even when no files match.
- **`hide = true`**: does not print yet; the directory header is deferred until
  the first matching file is found in that directory.

#### `OnFile(string fileName)`

1. Builds the full file path: `currentDir + "/" + fileName`.
2. Calls the internal `Find()` method.
3. On a match:
   - If `hide` is `true` and the directory header has not yet been printed,
     print the directory path now and set the "already printed" flag.
   - Print the matched filename (indented) and flush `Console.Out`.
4. Increments the internal match counter.

Every write to `Console.Out` is followed by `Console.Out.Flush()` so output
appears on the console immediately.

### Internal Methods

#### `ReadFile(string filePath) → string?`  *(private static)*

1. Try `File.ReadAllText(filePath)` and return the result on success.
2. On `UnauthorizedAccessException`, return `null` immediately (retrying
   will not help).
3. On `IOException` (e.g. encoding error), try
   `Encoding.Latin1.GetString(File.ReadAllBytes(filePath))` and return the
   result (lossless for binary content).
4. On any other exception in the fallback, return `null`.

#### `Find(string filePath) → bool`  *(private)*

1. If `_matchAll` is `true`, return `true` immediately — the match-all fast
   path; no file is opened or read.
2. Call `ReadFile(filePath)`. If it returns `null`, return `false`.
3. Return `_regex.IsMatch(contents)`.

The `Regex` object is compiled once in `SetRegex()` and stored in `_regex`;
it is not recompiled on every `OnFile` invocation. `_matchAll` is set to
`true` whenever the pattern is `"."` (including the constructor default and
any failed compilation fallback).

### Counter

```csharp
public int MatchCount { get; }
```

Returns the number of files that matched the regex.

---

## Output Format

```
  <directory_path>
      <matched_filename>
      <matched_filename>
  <directory_path>
      <matched_filename>
```

- Directory lines: 2-space leading indent.
- File lines: 6-space leading indent.

---

## Invariants

- `Find()` never throws; all exceptions from file I/O and `Regex` construction
  are caught and treated as non-match.
- A directory header is printed at most once per `Visit()` call.
- If `SetRegex()` is never called, the default pattern `"."` triggers the
  match-all fast path in `Find()` — no file is read at all.

---

*End of Spec.md*
