import validator;
import std;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

static bool has_rule(const Report& r, const char* rule) {
    for (const auto& e : r.errors)
        if (std::string_view(e.rule) == rule) return true;
    return false;
}

static constexpr const char* VALID =
    "<!DOCTYPE html>"
    "<html><head><title>T</title></head>"
    "<body><p>Hello</p></body></html>";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

bool test_valid_document() {
    auto r = Validator::validate(VALID, "t.html");
    return r.is_valid();
}

bool test_missing_doctype() {
    const char* html = "<html><head><title>T</title></head><body></body></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "doctype");
}

bool test_tag_nesting_mismatch() {
    const char* html =
        "<!DOCTYPE html><html><head><title>T</title></head>"
        "<body><div><p></div></p></body></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "tag-nesting");
}

bool test_unclosed_tag() {
    const char* html =
        "<!DOCTYPE html><html><head><title>T</title></head>"
        "<body><div></body></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "tag-nesting");
}

bool test_void_element_close_tag() {
    const char* html =
        "<!DOCTYPE html><html><head><title>T</title></head>"
        "<body><br></br></body></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "void-elements");
}

bool test_duplicate_id() {
    const char* html =
        R"(<!DOCTYPE html><html><head><title>T</title></head>)"
        R"(<body><div id="a"></div><div id="a"></div></body></html>)";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "duplicate-id");
}

bool test_unquoted_attr() {
    const char* html =
        "<!DOCTYPE html><html><head><title>T</title></head>"
        "<body><div class=foo></div></body></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "attr-quotes");
}

bool test_missing_head() {
    const char* html = "<!DOCTYPE html><html><body></body></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "head-required");
}

bool test_missing_title() {
    const char* html = "<!DOCTYPE html><html><head></head><body></body></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "head-required");
}

bool test_missing_body() {
    const char* html = "<!DOCTYPE html><html><head><title>T</title></head></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "body-required");
}

bool test_multiple_html_elements() {
    const char* html =
        "<!DOCTYPE html><html><head><title>T</title></head><body></body></html>"
        "<html></html>";
    auto r = Validator::validate(html, "t.html");
    return has_rule(r, "root-element");
}

bool test_void_self_close_ok() {
    // <br /> is a SelfClosingTag — not pushed onto stack, no close-tag error
    const char* html =
        "<!DOCTYPE html><html><head><title>T</title></head>"
        "<body><br /></body></html>";
    auto r = Validator::validate(html, "t.html");
    return r.is_valid();
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

int main() {
    struct Test { const char* name; bool (*fn)(); };
    const Test tests[] = {
        { "valid_document",          test_valid_document          },
        { "missing_doctype",         test_missing_doctype         },
        { "tag_nesting_mismatch",    test_tag_nesting_mismatch    },
        { "unclosed_tag",            test_unclosed_tag            },
        { "void_element_close_tag",  test_void_element_close_tag  },
        { "duplicate_id",            test_duplicate_id            },
        { "unquoted_attr",           test_unquoted_attr           },
        { "missing_head",            test_missing_head            },
        { "missing_title",           test_missing_title           },
        { "missing_body",            test_missing_body            },
        { "multiple_html_elements",  test_multiple_html_elements  },
        { "void_self_close_ok",      test_void_self_close_ok      },
    };

    bool all_passed = true;
    for (const auto& t : tests) {
        bool ok = t.fn();
        std::cout << (ok ? "PASS" : "FAIL") << "  " << t.name << "\n";
        if (!ok) all_passed = false;
    }
    return all_passed ? 0 : 1;
}
