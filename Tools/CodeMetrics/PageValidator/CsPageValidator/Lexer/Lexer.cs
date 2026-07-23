namespace PageValidator;

// ---------------------------------------------------------------------------
// Attr — a single attribute key/value pair with quoting status.
// ---------------------------------------------------------------------------

public sealed record Attr(string Key, string Value, bool Quoted);

// ---------------------------------------------------------------------------
// Lexeme discriminated union — structured items produced by the Lexer.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Lexer
// ---------------------------------------------------------------------------

public sealed class Lexer
{
    private readonly Tokenizer _tok;
    private (Token Tok, (int Line, int Col) Pos)? _buffered;

    public Lexer(string src) => _tok = new Tokenizer(src);

    public Lexeme? NextLexeme()
    {
        while (true)
        {
            var (t, pos) = NextTok();
            switch (t)
            {
                case Eof:
                    return null;

                case TagOpen to:
                {
                    var (attrs, selfClose) = CollectAttrs();
                    string name = to.Name.ToLowerInvariant();
                    return selfClose
                        ? new SelfClosingTag(name, attrs, pos)
                        : (Lexeme)new OpenTag(name, attrs, pos);
                }

                case TagClose tc:
                    return new CloseTag(tc.Name.ToLowerInvariant(), pos);

                case Text tx when tx.Content.Any(c => !char.IsWhiteSpace(c)):
                    return new TextNode(tx.Content);

                case Comment cm:
                    return new CommentNode(cm.Content);

                case Doctype dt:
                    return new DoctypeDecl(dt.Content);
            }
        }
    }

    // -----------------------------------------------------------------------

    private (Token Tok, (int Line, int Col) Pos) NextTok()
    {
        if (_buffered.HasValue)
        {
            var b = _buffered.Value;
            _buffered = null;
            return b;
        }
        var tok = _tok.NextToken();
        var pos = _tok.TokenStart;
        return (tok, pos);
    }

    private void PushBack(Token tok, (int Line, int Col) pos) =>
        _buffered = (tok, pos);

    private (IReadOnlyList<Attr> Attrs, bool SelfClose) CollectAttrs()
    {
        var attrs = new List<Attr>();
        while (true)
        {
            var (t, pos) = NextTok();
            switch (t)
            {
                case TagEnd:   return (attrs, false);
                case SelfClose: return (attrs, true);
                case Eof:      return (attrs, false);

                case AttrName an:
                {
                    var (next, npos) = NextTok();
                    switch (next)
                    {
                        case AttrValue av:
                            attrs.Add(new Attr(an.Name, av.Value, true));
                            break;
                        case AttrUnquoted au:
                            attrs.Add(new Attr(an.Name, au.Value, false));
                            break;
                        default:
                            attrs.Add(new Attr(an.Name, string.Empty, true)); // boolean attr
                            PushBack(next, npos);
                            break;
                    }
                    break;
                }
            }
        }
    }
}
