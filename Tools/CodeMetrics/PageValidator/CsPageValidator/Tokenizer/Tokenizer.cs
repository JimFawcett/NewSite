namespace PageValidator;

// ---------------------------------------------------------------------------
// Token discriminated union — one subtype per lexical unit.
// ---------------------------------------------------------------------------

public abstract record Token;

public sealed record TagOpen(string Name)    : Token;
public sealed record TagClose(string Name)   : Token;
public sealed record AttrName(string Name)   : Token;
public sealed record AttrValue(string Value) : Token;      // quoted
public sealed record AttrUnquoted(string Value) : Token;   // unquoted
public sealed record SelfClose               : Token;
public sealed record TagEnd                  : Token;
public sealed record Text(string Content)    : Token;
public sealed record Comment(string Content) : Token;
public sealed record Doctype(string Content) : Token;
public sealed record Eof                     : Token;

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

public sealed class Tokenizer
{
    private readonly string _src;
    private int _pos;
    private int _line;
    private int _col;
    private bool _inTag;
    private (Token Tok, (int Line, int Col) Pos)? _pending;
    private (int Line, int Col) _lastStart;

    public Tokenizer(string src)
    {
        _src       = src;
        _pos       = 0;
        _line      = 1;
        _col       = 1;
        _inTag     = false;
        _lastStart = (1, 1);
    }

    public (int Line, int Col) TokenStart => _lastStart;

    public Token NextToken()
    {
        if (_pending.HasValue)
        {
            var (tok, pos) = _pending.Value;
            _pending = null;
            _lastStart = pos;
            return tok;
        }
        _lastStart = (_line, _col);
        if (_inTag) return ScanInTag();
        if (_pos >= _src.Length) return new Eof();

        if (_src[_pos] == '<')
        {
            Advance();
            if (_pos < _src.Length && _src[_pos] == '!')
            {
                Advance();
                if (_pos + 1 < _src.Length && _src[_pos] == '-' && _src[_pos + 1] == '-')
                {
                    Advance(); Advance();
                    return new Comment(CollectUntil("-->"));
                }
                return new Doctype(CollectUntil(">"));
            }
            if (_pos < _src.Length && _src[_pos] == '/')
            {
                Advance();
                var name = CollectName();
                SkipWs();
                if (_pos < _src.Length && _src[_pos] == '>') Advance();
                return new TagClose(name);
            }
            var tagName = CollectName();
            _inTag = true;
            return new TagOpen(tagName);
        }

        var sb = new System.Text.StringBuilder();
        while (_pos < _src.Length && _src[_pos] != '<')
            sb.Append(Advance());
        return new Text(sb.ToString());
    }

    // -----------------------------------------------------------------------

    private char Peek(int off = 0)
    {
        int i = _pos + off;
        return i < _src.Length ? _src[i] : '\0';
    }

    private char Advance()
    {
        if (_pos >= _src.Length) return '\0';
        char c = _src[_pos++];
        if (c == '\n') { _line++; _col = 1; }
        else            { _col++; }
        return c;
    }

    private void SkipWs()
    {
        while (_pos < _src.Length && char.IsWhiteSpace(_src[_pos]))
            Advance();
    }

    private string CollectName()
    {
        var sb = new System.Text.StringBuilder();
        while (_pos < _src.Length)
        {
            char c = _src[_pos];
            if (char.IsLetterOrDigit(c) || c == '-' || c == '_' || c == ':' || c == '.')
                sb.Append(Advance());
            else
                break;
        }
        return sb.ToString();
    }

    private string CollectUntil(string stop)
    {
        var sb = new System.Text.StringBuilder();
        while (_pos < _src.Length)
        {
            if (_pos + stop.Length <= _src.Length &&
                _src.AsSpan(_pos, stop.Length).SequenceEqual(stop.AsSpan()))
            {
                for (int i = 0; i < stop.Length; i++) Advance();
                break;
            }
            sb.Append(Advance());
        }
        return sb.ToString();
    }

    private Token ScanInTag()
    {
        SkipWs();
        if (_pos >= _src.Length || _src[_pos] == '>')
        {
            if (_pos < _src.Length) Advance();
            _inTag = false;
            return new TagEnd();
        }
        if (_src[_pos] == '/' && Peek(1) == '>')
        {
            Advance(); Advance();
            _inTag = false;
            return new SelfClose();
        }
        var name = CollectName();
        if (name.Length == 0)
        {
            Advance();
            return ScanInTag();
        }
        SkipWs();
        if (Peek() != '=')
            return new AttrName(name);
        Advance(); // '='
        SkipWs();
        var valPos = (_line, _col);
        char q = Peek();
        if (q == '"' || q == '\'')
        {
            Advance(); // opening quote
            var val = new System.Text.StringBuilder();
            while (_pos < _src.Length && _src[_pos] != q)
                val.Append(Advance());
            if (_pos < _src.Length) Advance(); // closing quote
            _pending = (new AttrValue(val.ToString()), valPos);
        }
        else
        {
            var val = new System.Text.StringBuilder();
            while (_pos < _src.Length)
            {
                char c = _src[_pos];
                if (char.IsWhiteSpace(c) || c == '>' || c == '/') break;
                val.Append(Advance());
            }
            _pending = (new AttrUnquoted(val.ToString()), valPos);
        }
        return new AttrName(name);
    }
}
