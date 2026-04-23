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

static bool TestSimpleOpenTag()
{
    var t = new Tokenizer("<div>");
    if (t.NextToken() is not TagOpen { Name: "div" }) return false;
    if (t.NextToken() is not TagEnd)                  return false;
    return t.NextToken() is Eof;
}

static bool TestCloseTag()
{
    var t = new Tokenizer("</div>");
    if (t.NextToken() is not TagClose { Name: "div" }) return false;
    return t.NextToken() is Eof;
}

static bool TestSelfClosing()
{
    var t = new Tokenizer("<br />");
    if (t.NextToken() is not TagOpen { Name: "br" }) return false;
    if (t.NextToken() is not SelfClose)              return false;
    return t.NextToken() is Eof;
}

static bool TestAttributeQuoted()
{
    var t = new Tokenizer("""<a href="url">""");
    if (t.NextToken() is not TagOpen)                    return false;
    if (t.NextToken() is not AttrName { Name: "href" })  return false;
    if (t.NextToken() is not AttrValue { Value: "url" }) return false;
    return t.NextToken() is TagEnd;
}

static bool TestAttributeUnquoted()
{
    var t = new Tokenizer("<div class=foo>");
    t.NextToken(); // TagOpen
    if (t.NextToken() is not AttrName { Name: "class" }) return false;
    return t.NextToken() is AttrUnquoted { Value: "foo" };
}

static bool TestBooleanAttr()
{
    var t = new Tokenizer("<input disabled>");
    t.NextToken(); // TagOpen("input")
    if (t.NextToken() is not AttrName { Name: "disabled" }) return false;
    return t.NextToken() is TagEnd;
}

static bool TestDoctype()
{
    var t = new Tokenizer("<!DOCTYPE html>");
    if (t.NextToken() is not Doctype) return false;
    return t.NextToken() is Eof;
}

static bool TestComment()
{
    var t = new Tokenizer("<!-- hello -->");
    if (t.NextToken() is not Comment { Content: " hello " }) return false;
    return t.NextToken() is Eof;
}

static bool TestTextNode()
{
    var t = new Tokenizer("hello world");
    return t.NextToken() is Text { Content: "hello world" };
}

static bool TestPositionTracking()
{
    var t = new Tokenizer("<div>\n<p>");
    t.NextToken(); // TagOpen("div")
    t.NextToken(); // TagEnd
    t.NextToken(); // Text("\n")
    t.NextToken(); // TagOpen("p")
    return t.TokenStart.Line == 2;
}

static bool TestSingleQuotedAttr()
{
    var t = new Tokenizer("<a href='url'>");
    t.NextToken(); // TagOpen
    t.NextToken(); // AttrName
    return t.NextToken() is AttrValue { Value: "url" };
}

static bool TestMultipleAttrs()
{
    var t = new Tokenizer("""<a href="url" class="foo">""");
    t.NextToken(); // TagOpen
    if (t.NextToken() is not AttrName { Name: "href" }) return false;
    t.NextToken(); // AttrValue("url")
    return t.NextToken() is AttrName { Name: "class" };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

int failures = 0;
failures += Run("simple_open_tag",    TestSimpleOpenTag);
failures += Run("close_tag",          TestCloseTag);
failures += Run("self_closing",       TestSelfClosing);
failures += Run("attribute_quoted",   TestAttributeQuoted);
failures += Run("attribute_unquoted", TestAttributeUnquoted);
failures += Run("boolean_attr",       TestBooleanAttr);
failures += Run("doctype",            TestDoctype);
failures += Run("comment",            TestComment);
failures += Run("text_node",          TestTextNode);
failures += Run("position_tracking",  TestPositionTracking);
failures += Run("single_quoted_attr", TestSingleQuotedAttr);
failures += Run("multiple_attrs",     TestMultipleAttrs);

return failures > 0 ? 1 : 0;
