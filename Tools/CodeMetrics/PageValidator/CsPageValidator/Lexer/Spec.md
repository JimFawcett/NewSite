# Spec.md — Lexer

*Specifies the HTML lexer library.*

---

## Responsibility

Lexer wraps a `Tokenizer` and groups its flat `Token` stream into structured
`Lexeme` values that carry tag names, attribute key/value pairs, and source
positions.  It has no validation logic.

---

## Source File

```
Lexer/
└── Lexer.cs
```

---

## Exported Types

### `Attr`

```csharp
public sealed record Attr(string Key, string Value, bool Quoted);
```

`Quoted` is `false` when the source had no surrounding quotes.

### `Lexeme` Hierarchy

```csharp
public abstract record Lexeme;

public sealed record OpenTag(
    string Name,
    IReadOnlyList<Attr> Attrs,
    (int Line, int Col) Pos) : Lexeme;

public sealed record SelfClosingTag(
    string Name,
    IReadOnlyList<Attr> Attrs,
    (int Line, int Col) Pos) : Lexeme;

public sealed record CloseTag(
    string Name,
    (int Line, int Col) Pos) : Lexeme;

public sealed record TextNode(string Content)    : Lexeme;
public sealed record CommentNode(string Content) : Lexeme;
public sealed record DoctypeDecl(string Content) : Lexeme;
```

All tag names are lowercased by the lexer.  All types live in the
`PageValidator` namespace.

---

## Class `Lexer`

### Constructor

```csharp
public Lexer(string src)
```

### Methods

```csharp
public Lexeme? NextLexeme();
```

Returns `null` at end of input.  Whitespace-only `Text` tokens are consumed
silently; they do not produce a `TextNode`.

---

## Algorithm

`NextLexeme()` loops until it returns a value or `null`:

1. Call `NextTok()` — returns `(Token, (int Line, int Col))`, checking
   `_buffered` first.
2. `Eof` → return `null`.
3. `TagOpen to`:
   - Call `CollectAttrs()` → `(attrs, selfClose)`.
   - Lowercase `to.Name`.
   - Return `new SelfClosingTag(...)` or `new OpenTag(...)`.
4. `TagClose tc` → lowercase `tc.Name` → return `new CloseTag(name, pos)`.
5. `Text tx` where `tx.Content` contains any non-whitespace → return
   `new TextNode(tx.Content)`; otherwise continue.
6. `Comment cm` → return `new CommentNode(cm.Content)`.
7. `Doctype dt` → return `new DoctypeDecl(dt.Content)`.

`CollectAttrs()` loops:
- `TagEnd` → return `(attrs, false)`.
- `SelfClose` → return `(attrs, true)`.
- `Eof` → return `(attrs, false)`.
- `AttrName an`: peek next token.
  - `AttrValue av` → `new Attr(an.Name, av.Value, true)`.
  - `AttrUnquoted au` → `new Attr(an.Name, au.Value, false)`.
  - Other (boolean attr) → `new Attr(an.Name, string.Empty, true)`; push other
    token back via `PushBack()`.

---

## Invariants

- `NextLexeme()` never throws.
- Whitespace-only text content is never returned to the caller.
- `_buffered` holds at most one token at a time.

---

*End of Spec.md*
