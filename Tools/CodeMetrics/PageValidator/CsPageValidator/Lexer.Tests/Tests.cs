using PageValidator;

// ---------------------------------------------------------------------------
// Test runner helper
// ---------------------------------------------------------------------------

static int Run(string name, Func<bool> fn)
{
    bool ok;
    try { ok = fn(); }
    catch (Exception e) { Console.WriteLine($"FAIL  {name} (threw: {e.Message})"); return 1; }
    Console.WriteLine($"{(ok ? "PASS" : "FAIL")}  {name}");
    return ok ? 0 : 1;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

static bool TestOpenTag()
{
    var l = new Lexer("<div>");
    return l.NextLexeme() is OpenTag { Name: "div" };
}

static bool TestSelfClosingTag()
{
    var l = new Lexer("<br />");
    return l.NextLexeme() is SelfClosingTag { Name: "br" };
}

static bool TestCloseTag()
{
    var l = new Lexer("</div>");
    return l.NextLexeme() is CloseTag { Name: "div" };
}

static bool TestAttrsQuoted()
{
    var l = new Lexer("""<a href="url" class="foo">""");
    if (l.NextLexeme() is not OpenTag ot) return false;
    if (ot.Attrs.Count != 2)              return false;
    if (ot.Attrs[0].Key   != "href")      return false;
    if (ot.Attrs[0].Value != "url")       return false;
    if (!ot.Attrs[0].Quoted)              return false;
    return ot.Attrs[1].Key == "class";
}

static bool TestAttrUnquotedFlagged()
{
    var l = new Lexer("<div class=foo>");
    if (l.NextLexeme() is not OpenTag ot) return false;
    return ot.Attrs.Count > 0 && !ot.Attrs[0].Quoted;
}

static bool TestBooleanAttr()
{
    var l = new Lexer("<input disabled>");
    if (l.NextLexeme() is not OpenTag ot) return false;
    return ot.Attrs.Count > 0 && ot.Attrs[0].Key == "disabled" && ot.Attrs[0].Value == "";
}

static bool TestDoctype()
{
    var l = new Lexer("<!DOCTYPE html><html>");
    if (l.NextLexeme() is not DoctypeDecl) return false;
    return l.NextLexeme() is OpenTag { Name: "html" };
}

static bool TestCaseNormalisation()
{
    var l = new Lexer("<DIV></DIV>");
    if (l.NextLexeme() is not OpenTag  { Name: "div" }) return false;
    return l.NextLexeme() is CloseTag { Name: "div" };
}

static bool TestWhitespaceOnlyTextSkipped()
{
    var l = new Lexer("<p>  \n  </p>");
    if (l.NextLexeme() is not OpenTag { Name: "p" }) return false;
    return l.NextLexeme() is CloseTag { Name: "p" }; // whitespace-only text is skipped
}

static bool TestNonEmptyTextKept()
{
    var l = new Lexer("<p>hello</p>");
    if (l.NextLexeme() is not OpenTag { Name: "p" }) return false;
    return l.NextLexeme() is TextNode { Content: "hello" };
}

static bool TestCommentNode()
{
    var l = new Lexer("<!-- note --><div>");
    if (l.NextLexeme() is not CommentNode) return false;
    return l.NextLexeme() is OpenTag { Name: "div" };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

int failures = 0;
failures += Run("open_tag",                     TestOpenTag);
failures += Run("self_closing_tag",             TestSelfClosingTag);
failures += Run("close_tag",                    TestCloseTag);
failures += Run("attrs_quoted",                 TestAttrsQuoted);
failures += Run("attr_unquoted_flagged",        TestAttrUnquotedFlagged);
failures += Run("boolean_attr",                 TestBooleanAttr);
failures += Run("doctype",                      TestDoctype);
failures += Run("case_normalisation",           TestCaseNormalisation);
failures += Run("whitespace_only_text_skipped", TestWhitespaceOnlyTextSkipped);
failures += Run("nonempty_text_kept",           TestNonEmptyTextKept);
failures += Run("comment_node",                 TestCommentNode);

return failures > 0 ? 1 : 0;
