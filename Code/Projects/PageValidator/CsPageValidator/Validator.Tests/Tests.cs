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

static bool HasRule(Report r, string rule) =>
    r.Errors.Any(e => e.Rule == rule);

const string Valid =
    "<!DOCTYPE html>" +
    "<html><head><title>T</title></head>" +
    "<body><p>Hello</p></body></html>";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

static bool TestValidDocument() =>
    Validator.Validate(Valid, "t.html").IsValid;

static bool TestMissingDoctype()
{
    const string html = "<html><head><title>T</title></head><body></body></html>";
    return HasRule(Validator.Validate(html, "t.html"), "doctype");
}

static bool TestTagNestingMismatch()
{
    const string html =
        "<!DOCTYPE html><html><head><title>T</title></head>" +
        "<body><div><p></div></p></body></html>";
    return HasRule(Validator.Validate(html, "t.html"), "tag-nesting");
}

static bool TestUnclosedTag()
{
    const string html =
        "<!DOCTYPE html><html><head><title>T</title></head>" +
        "<body><div></body></html>";
    return HasRule(Validator.Validate(html, "t.html"), "tag-nesting");
}

static bool TestVoidElementCloseTag()
{
    const string html =
        "<!DOCTYPE html><html><head><title>T</title></head>" +
        "<body><br></br></body></html>";
    return HasRule(Validator.Validate(html, "t.html"), "void-elements");
}

static bool TestDuplicateId()
{
    const string html =
        """<!DOCTYPE html><html><head><title>T</title></head>""" +
        """<body><div id="a"></div><div id="a"></div></body></html>""";
    return HasRule(Validator.Validate(html, "t.html"), "duplicate-id");
}

static bool TestUnquotedAttr()
{
    const string html =
        "<!DOCTYPE html><html><head><title>T</title></head>" +
        "<body><div class=foo></div></body></html>";
    return HasRule(Validator.Validate(html, "t.html"), "attr-quotes");
}

static bool TestMissingHead()
{
    const string html = "<!DOCTYPE html><html><body></body></html>";
    return HasRule(Validator.Validate(html, "t.html"), "head-required");
}

static bool TestMissingTitle()
{
    const string html = "<!DOCTYPE html><html><head></head><body></body></html>";
    return HasRule(Validator.Validate(html, "t.html"), "head-required");
}

static bool TestMissingBody()
{
    const string html = "<!DOCTYPE html><html><head><title>T</title></head></html>";
    return HasRule(Validator.Validate(html, "t.html"), "body-required");
}

static bool TestMultipleHtmlElements()
{
    const string html =
        "<!DOCTYPE html><html><head><title>T</title></head><body></body></html>" +
        "<html></html>";
    return HasRule(Validator.Validate(html, "t.html"), "root-element");
}

static bool TestVoidSelfCloseOk()
{
    const string html =
        "<!DOCTYPE html><html><head><title>T</title></head>" +
        "<body><br /></body></html>";
    return Validator.Validate(html, "t.html").IsValid;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

int failures = 0;
failures += Run("valid_document",         TestValidDocument);
failures += Run("missing_doctype",        TestMissingDoctype);
failures += Run("tag_nesting_mismatch",   TestTagNestingMismatch);
failures += Run("unclosed_tag",           TestUnclosedTag);
failures += Run("void_element_close_tag", TestVoidElementCloseTag);
failures += Run("duplicate_id",           TestDuplicateId);
failures += Run("unquoted_attr",          TestUnquotedAttr);
failures += Run("missing_head",           TestMissingHead);
failures += Run("missing_title",          TestMissingTitle);
failures += Run("missing_body",           TestMissingBody);
failures += Run("multiple_html_elements", TestMultipleHtmlElements);
failures += Run("void_self_close_ok",     TestVoidSelfCloseOk);

return failures > 0 ? 1 : 0;
