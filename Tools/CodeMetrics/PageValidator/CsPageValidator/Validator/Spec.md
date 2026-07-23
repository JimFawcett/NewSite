# Spec.md — Validator

*Specifies the HTML structural validator library.*

---

## Responsibility

Validator drives the `Lexer` and applies structural rules to verify that an
HTML document is correctly formed.  It collects all errors before returning;
it never short-circuits on the first failure.

---

## Source File

```
Validator/
└── Validator.cs
```

---

## Exported Types

### `ValidationError`

```csharp
public sealed record ValidationError(string Rule, string Message, int Line, int Col);
```

`Rule` is a short identifier string (e.g. `"tag-nesting"`).  `Line` and `Col`
are 1-based.

### `Report`

```csharp
public sealed class Report
{
    public string File { get; }
    public IReadOnlyList<ValidationError> Errors { get; }
    public bool IsValid => Errors.Count == 0;
}
```

---

## Class `Validator`

All state lives in local variables within `Validate()`.

```csharp
public static class Validator
{
    public static Report Validate(string src, string file);
}
```

---

## Validation Algorithm

1. Construct a `Lexer` over `src`.
2. Initialise state: `stack` (`List<(string Name, (int Line, int Col) Pos)>`),
   `ids` (`HashSet<string>`), and flags
   (`seenDoctype`, `htmlCount`, `seenHead`, `seenTitle`, `seenBody`, `inHead`).
3. Loop over `lexer.NextLexeme()`:
   - `DoctypeDecl` → set `seenDoctype = true`.
   - `OpenTag ot`:
     - Call `CheckAttrs(ot.Attrs, ot.Pos, errors, ids)`.
     - Update flags: `htmlCount` for `"html"`, `seenHead`/`inHead` for `"head"`,
       `seenTitle` (only when `inHead`) for `"title"`, `seenBody` for `"body"`.
     - If `ot.Name` is not a void element, push `(ot.Name, ot.Pos)` onto `stack`.
   - `SelfClosingTag st` → call `CheckAttrs`.
   - `CloseTag ct`:
     - If `ct.Name` is a void element: emit `void-elements` error; break.
     - If `ct.Name == "head"`: clear `inHead`.
     - If `stack[^1].Name == ct.Name`: `stack.RemoveAt(stack.Count - 1)`.
     - Else if stack non-empty: emit `tag-nesting` mismatch error.
     - Else: emit `tag-nesting` no-open-tag error.
   - `TextNode`, `CommentNode` → no action.
4. Post-loop checks:
   - `!seenDoctype` → `doctype` error at (1, 1).
   - `htmlCount != 1` → `root-element` error at (1, 1).
   - `!seenHead` → `head-required` error at (1, 1); else if `!seenTitle` →
     `head-required` error at (1, 1).
   - `!seenBody` → `body-required` error at (1, 1).
   - Each remaining entry in `stack` → `tag-nesting` unclosed-tag error at the
     entry's recorded position.
5. Return `new Report(file, errors)`.

`CheckAttrs(attrs, pos, errors, ids)`:
- For each attr where `!attr.Quoted && attr.Value.Length > 0`: emit
  `attr-quotes` error.
- For each attr where `attr.Key == "id" && attr.Value.Length > 0`: attempt
  `ids.Add(attr.Value)`; on failure emit `duplicate-id` error.

---

## Void Elements

```
area  base  br  col  embed  hr  img  input  link  meta  param  source  track  wbr
```

Stored as a `HashSet<string>` with `StringComparer.OrdinalIgnoreCase`.

---

## Invariants

- `Validate()` never throws; all pattern-match dispatch is exhaustive.
- All errors for a document are collected before `Report` is returned.
- A `SelfClosingTag` for a void element is not an error.
- A `CloseTag` for a void element is always an error.

---

*End of Spec.md*
