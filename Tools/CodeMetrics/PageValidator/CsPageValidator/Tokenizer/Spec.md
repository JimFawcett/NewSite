# Spec.md — Tokenizer

*Specifies the HTML tokenizer library.*

---

## Responsibility

Tokenizer reads raw HTML source text and emits a flat stream of coarse `Token`
values.  It recognises only the characters `<`, `>`, `=`, `"`, `'`, `!`, `/`,
and `-` as structurally significant.  It has no HTML grammar knowledge.

---

## Source File

```
Tokenizer/
└── Tokenizer.cs
```

---

## Token Hierarchy

```csharp
public abstract record Token;

public sealed record TagOpen(string Name)       : Token;  // <name
public sealed record TagClose(string Name)      : Token;  // </name>
public sealed record AttrName(string Name)      : Token;  // key
public sealed record AttrValue(string Value)    : Token;  // "value" or 'value' (quoted)
public sealed record AttrUnquoted(string Value) : Token;  // value (unquoted)
public sealed record SelfClose                  : Token;  // />
public sealed record TagEnd                     : Token;  // > (ends a start tag)
public sealed record Text(string Content)       : Token;  // raw text between tags
public sealed record Comment(string Content)    : Token;  // <!-- ... -->
public sealed record Doctype(string Content)    : Token;  // <!...>
public sealed record Eof                        : Token;
```

All types live in the `PageValidator` namespace.  `SelfClose`, `TagEnd`, and
`Eof` carry no data.

---

## Class `Tokenizer`

### Constructor

```csharp
public Tokenizer(string src)
```

### Members

```csharp
public (int Line, int Col) TokenStart { get; }  // position of last returned token
public Token NextToken();
```

`TokenStart` returns the `(line, col)` position where the last returned token
began.  Lines and columns are 1-based.

---

## Algorithm

`NextToken()`:
1. If `_pending` has a value, clear it and return it (restoring its recorded
   position into `_lastStart`).
2. Record `_lastStart = (_line, _col)`.
3. If `_inTag` is `true`, delegate to `ScanInTag()`.
4. If `_pos >= src.Length`, return `new Eof()`.
5. If current char is `'<'`:
   - Advance past `<`.
   - If next char is `'!'`:
     - Advance.  If the two chars that follow are `--`, advance twice and
       return `new Comment(CollectUntil("-->"))`.
     - Otherwise return `new Doctype(CollectUntil(">"))`.
   - If next char is `'/'`: advance, `CollectName()`, skip whitespace,
     consume `>`, return `new TagClose(name)`.
   - Otherwise: `CollectName()`, set `_inTag = true`, return `new TagOpen(name)`.
6. Otherwise: collect characters until `'<'` and return `new Text(text)`.

`ScanInTag()`:
1. Skip whitespace.
2. If EOF or `'>'`: advance if `'>'`, clear `_inTag`, return `new TagEnd()`.
3. If `'/'` followed by `'>'`: advance twice, clear `_inTag`, return `new SelfClose()`.
4. `CollectName()` — if empty, advance and recurse.
5. Skip whitespace.  If next char is not `'='`: return `new AttrName(name)`.
6. Advance past `'='`, skip whitespace, record `valPos = (_line, _col)`.
7. If next char is `'"'` or `'\''`:
   - Advance past opening quote, collect until matching closing quote, advance.
   - Store `new AttrValue(val)` in `_pending` at `valPos`.
8. Otherwise: collect until whitespace, `'>'`, or `'/'`.
   - Store `new AttrUnquoted(val)` in `_pending` at `valPos`.
9. Return `new AttrName(name)`.

The `_pending` field buffers one token.  `NextToken()` checks `_pending` before
any other work, allowing `ScanInTag()` to emit an `AttrName` and queue the
corresponding `AttrValue` or `AttrUnquoted` for the next call.

---

## Invariants

- `NextToken()` never throws.
- `TokenStart` always reflects the position of the most recently returned token.
- Unrecognised sequences are emitted as `Text` or consumed silently; parsing
  never aborts.

---

*End of Spec.md*
