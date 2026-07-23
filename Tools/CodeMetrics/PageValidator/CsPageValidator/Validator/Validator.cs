namespace PageValidator;

// ---------------------------------------------------------------------------
// ValidationError — one rule violation found in an HTML file.
// ---------------------------------------------------------------------------

public sealed record ValidationError(string Rule, string Message, int Line, int Col);

// ---------------------------------------------------------------------------
// Report — the complete result for a single file.
// ---------------------------------------------------------------------------

public sealed class Report
{
    public string File { get; }
    public IReadOnlyList<ValidationError> Errors { get; }
    public bool IsValid => Errors.Count == 0;

    public Report(string file, IReadOnlyList<ValidationError> errors)
    {
        File   = file;
        Errors = errors;
    }
}

// ---------------------------------------------------------------------------
// Validator — stateless; all state lives in Validate()'s locals.
// ---------------------------------------------------------------------------

public static class Validator
{
    private static readonly HashSet<string> VoidElements =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr",
        };

    public static Report Validate(string src, string file)
    {
        var lexer  = new Lexer(src);
        var errors = new List<ValidationError>();
        // List used as stack so remaining items iterate in opening order.
        var stack  = new List<(string Name, (int Line, int Col) Pos)>();
        var ids    = new HashSet<string>(StringComparer.Ordinal);

        bool seenDoctype = false;
        int  htmlCount   = 0;
        bool seenHead    = false;
        bool seenTitle   = false;
        bool seenBody    = false;
        bool inHead      = false;

        Lexeme? lexeme;
        while ((lexeme = lexer.NextLexeme()) is not null)
        {
            switch (lexeme)
            {
                case DoctypeDecl:
                    seenDoctype = true;
                    break;

                case OpenTag ot:
                    CheckAttrs(ot.Attrs, ot.Pos, errors, ids);
                    switch (ot.Name)
                    {
                        case "html":  htmlCount++; break;
                        case "head":  seenHead = true; inHead = true; break;
                        case "title" when inHead: seenTitle = true; break;
                        case "body":  seenBody = true; break;
                    }
                    if (!VoidElements.Contains(ot.Name))
                        stack.Add((ot.Name, ot.Pos));
                    break;

                case SelfClosingTag st:
                    CheckAttrs(st.Attrs, st.Pos, errors, ids);
                    break;

                case CloseTag ct:
                    if (VoidElements.Contains(ct.Name))
                    {
                        errors.Add(new ValidationError("void-elements",
                            $"void element <{ct.Name}> must not have a close tag",
                            ct.Pos.Line, ct.Pos.Col));
                        break;
                    }
                    if (ct.Name == "head") inHead = false;
                    if (stack.Count > 0 && stack[^1].Name == ct.Name)
                        stack.RemoveAt(stack.Count - 1);
                    else if (stack.Count > 0)
                        errors.Add(new ValidationError("tag-nesting",
                            $"</{ct.Name}> does not match open <{stack[^1].Name}>",
                            ct.Pos.Line, ct.Pos.Col));
                    else
                        errors.Add(new ValidationError("tag-nesting",
                            $"</{ct.Name}> has no matching open tag",
                            ct.Pos.Line, ct.Pos.Col));
                    break;
            }
        }

        // Post-loop structural checks
        if (!seenDoctype)
            errors.Add(new ValidationError("doctype",
                "document is missing <!DOCTYPE html>", 1, 1));

        if (htmlCount != 1)
            errors.Add(new ValidationError("root-element",
                $"expected exactly 1 <html> element, found {htmlCount}", 1, 1));

        if (!seenHead)
            errors.Add(new ValidationError("head-required",
                "document is missing a <head> element", 1, 1));
        else if (!seenTitle)
            errors.Add(new ValidationError("head-required",
                "<head> is missing a <title> element", 1, 1));

        if (!seenBody)
            errors.Add(new ValidationError("body-required",
                "document is missing a <body> element", 1, 1));

        foreach (var (name, pos) in stack)
            errors.Add(new ValidationError("tag-nesting",
                $"<{name}> was opened but never closed", pos.Line, pos.Col));

        return new Report(file, errors);
    }

    private static void CheckAttrs(
        IReadOnlyList<Attr> attrs,
        (int Line, int Col) pos,
        List<ValidationError> errors,
        HashSet<string> ids)
    {
        foreach (var attr in attrs)
        {
            if (!attr.Quoted && attr.Value.Length > 0)
                errors.Add(new ValidationError("attr-quotes",
                    $"attribute '{attr.Key}' value '{attr.Value}' is not quoted",
                    pos.Line, pos.Col));

            if (attr.Key == "id" && attr.Value.Length > 0)
            {
                if (!ids.Add(attr.Value))
                    errors.Add(new ValidationError("duplicate-id",
                        $"duplicate id '{attr.Value}'", pos.Line, pos.Col));
            }
        }
    }
}
