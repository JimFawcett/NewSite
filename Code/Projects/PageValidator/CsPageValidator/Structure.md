# Structure.md — CsPageValidator

*Language- and toolchain-specific layout document for the C# HTML page validator.*

---

## Language & Toolchain

- **Language:** C# 12 / .NET 10
- **Build:** `dotnet build` / `dotnet test`
- **Purpose:** Examine HTML files for valid structural composition

---

## Directory Layout

```
CsPageValidator/
├── Constitution.md
├── Structure.md
├── README.md
├── CsPageValidator.sln         ← solution: all projects
├── Tokenizer/
│   ├── Tokenizer.csproj        ← class library: PageValidator namespace
│   ├── Spec.md
│   └── Tokenizer.cs
├── Tokenizer.Tests/
│   ├── Tokenizer.Tests.csproj  ← xUnit test project; references Tokenizer
│   └── Tests.cs
├── Lexer/
│   ├── Lexer.csproj            ← class library; references Tokenizer
│   ├── Spec.md
│   └── Lexer.cs
├── Lexer.Tests/
│   ├── Lexer.Tests.csproj      ← xUnit test project; references Lexer
│   └── Tests.cs
├── Validator/
│   ├── Validator.csproj        ← class library; references Lexer
│   ├── Spec.md
│   └── Validator.cs
├── Validator.Tests/
│   ├── Validator.Tests.csproj  ← xUnit test project; references Validator
│   └── Tests.cs
└── EntryPoint/
    ├── EntryPoint.csproj       ← executable (page_validator); references Validator
    ├── Spec.md
    └── Program.cs
```

---

## Component Responsibilities

### Tokenizer

Reads raw HTML source text and splits it into a flat stream of `Token` values.
`Token` is an abstract record with sealed subtypes:

```csharp
public abstract record Token;

public sealed record TagOpen(string Name)       : Token;
public sealed record TagClose(string Name)      : Token;
public sealed record AttrName(string Name)      : Token;
public sealed record AttrValue(string Value)    : Token;   // quoted
public sealed record AttrUnquoted(string Value) : Token;   // unquoted
public sealed record SelfClose                  : Token;
public sealed record TagEnd                     : Token;
public sealed record Text(string Content)       : Token;
public sealed record Comment(string Content)    : Token;
public sealed record Doctype(string Content)    : Token;
public sealed record Eof                        : Token;
```

The tokenizer holds no HTML grammar knowledge — it only recognises `<`, `>`,
`=`, `"`, `'`, `!`, `/`, and `-` as structurally significant.

### Lexer

Consumes the `Token` stream and groups tokens into `Lexeme` values.  `Lexeme`
is an abstract record with sealed subtypes:

```csharp
public abstract record Lexeme;

public sealed record OpenTag(
    string Name, IReadOnlyList<Attr> Attrs, (int Line, int Col) Pos) : Lexeme;
public sealed record SelfClosingTag(
    string Name, IReadOnlyList<Attr> Attrs, (int Line, int Col) Pos) : Lexeme;
public sealed record CloseTag(string Name, (int Line, int Col) Pos)  : Lexeme;
public sealed record TextNode(string Content)    : Lexeme;
public sealed record CommentNode(string Content) : Lexeme;
public sealed record DoctypeDecl(string Content) : Lexeme;
```

`OpenTag` and `SelfClosingTag` carry an `IReadOnlyList<Attr>` with key, value,
and quoting status.  All tag names are lowercased.

### Validator

Drives the `Lexer` and applies HTML structural rules.  Uses a
`List<(string Name, (int Line, int Col) Pos)>` element stack (treated as a
stack via index-from-end access) to track open tags.  Returns a `Report`
containing all `ValidationError` items found.  Never short-circuits on the
first failure.

### EntryPoint

Uses C# top-level statements in `Program.cs`.  Parses command-line flags
manually (no external dependency), iterates over the specified HTML files with
optional recursive directory search, calls `Validator.Validate` for each file,
and prints a human-readable report.

---

## Component Dependencies

```
Tokenizer
    |
  Lexer
    |
Validator
    |
EntryPoint
```

Each library depends only on the library directly above it.  `EntryPoint`
references `Validator`; transitive project references propagate automatically
via the .NET SDK.

---

## Build Steps

```bash
# Build all projects
dotnet build CsPageValidator.sln

# Run all unit tests
dotnet test CsPageValidator.sln

# Run the executable
dotnet run --project EntryPoint -- -r -s .\some\site

# Or after publish
dotnet publish EntryPoint -c Release -o publish
publish\page_validator -r -s .\some\site
```

---

## External Dependencies

None beyond the .NET 10 base class library.  All projects target `net10.0`
with nullable reference types and implicit usings enabled.

---

## Testing

Each component has a `Tests.cs` in its corresponding `.Tests` project.
The `.Tests` projects are standalone console executables (`<OutputType>Exe</OutputType>`)
with no external test framework.  They use a local `Run(name, fn)` helper that
prints `PASS` / `FAIL` to stdout and returns an exit code — the same pattern as
the C++ and Rust ports.

```bash
dotnet run --project Tokenizer.Tests
dotnet run --project Lexer.Tests
dotnet run --project Validator.Tests
```

---

*End of Structure.md*
