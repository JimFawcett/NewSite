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

### Internal Method

#### `Find(string filePath) → bool`

1. Attempt `File.ReadAllText` to read the file into a string.
2. If that throws (e.g. encoding error), attempt `File.ReadAllBytes` and convert
   with `Encoding.Latin1.GetString` (lossless for binary content).
3. If both reads fail, return `false`.
4. Compile the regex pattern with `new Regex(pattern)`; return `false` on
   `ArgumentException`.
5. Return `Regex.IsMatch(contents)`.

The compiled `Regex` object is cached after `SetRegex` is called; it is not
recompiled on every `OnFile` invocation.

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
- If `SetRegex()` is never called, the default pattern `"."` matches every
  non-empty file.

---

*End of Spec.md*
