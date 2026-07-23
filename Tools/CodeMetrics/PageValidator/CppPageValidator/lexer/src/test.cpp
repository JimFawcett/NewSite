import lexer;
import std;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

static bool is_open(const std::optional<Lexeme>& opt, const char* name) {
    if (!opt) return false;
    auto* p = std::get_if<lex::OpenTag>(&*opt);
    return p && p->name == name;
}

static bool is_self_close(const std::optional<Lexeme>& opt, const char* name) {
    if (!opt) return false;
    auto* p = std::get_if<lex::SelfClosingTag>(&*opt);
    return p && p->name == name;
}

static bool is_close(const std::optional<Lexeme>& opt, const char* name) {
    if (!opt) return false;
    auto* p = std::get_if<lex::CloseTag>(&*opt);
    return p && p->name == name;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

bool test_open_tag() {
    Lexer l("<div>");
    return is_open(l.next_lexeme(), "div");
}

bool test_self_closing_tag() {
    Lexer l("<br />");
    return is_self_close(l.next_lexeme(), "br");
}

bool test_close_tag() {
    Lexer l("</div>");
    return is_close(l.next_lexeme(), "div");
}

bool test_attrs_quoted() {
    Lexer l(R"(<a href="url" class="foo">)");
    auto opt = l.next_lexeme();
    if (!opt) return false;
    auto* p = std::get_if<lex::OpenTag>(&*opt);
    if (!p) return false;
    if (p->attrs.size() != 2) return false;
    if (p->attrs[0].key != "href" || p->attrs[0].value != "url") return false;
    if (!p->attrs[0].quoted) return false;
    return p->attrs[1].key == "class";
}

bool test_attr_unquoted_flagged() {
    Lexer l("<div class=foo>");
    auto opt = l.next_lexeme();
    if (!opt) return false;
    auto* p = std::get_if<lex::OpenTag>(&*opt);
    if (!p || p->attrs.empty()) return false;
    return !p->attrs[0].quoted;
}

bool test_boolean_attr() {
    Lexer l("<input disabled>");
    auto opt = l.next_lexeme();
    if (!opt) return false;
    auto* p = std::get_if<lex::OpenTag>(&*opt);
    if (!p || p->attrs.empty()) return false;
    return p->attrs[0].key == "disabled" && p->attrs[0].value.empty();
}

bool test_doctype() {
    Lexer l("<!DOCTYPE html><html>");
    auto opt = l.next_lexeme();
    if (!opt || !std::holds_alternative<lex::DoctypeDecl>(*opt)) return false;
    return is_open(l.next_lexeme(), "html");
}

bool test_case_normalisation() {
    Lexer l("<DIV></DIV>");
    if (!is_open(l.next_lexeme(), "div")) return false;
    return is_close(l.next_lexeme(), "div");
}

bool test_whitespace_only_text_skipped() {
    Lexer l("<p>  \n  </p>");
    if (!is_open(l.next_lexeme(), "p")) return false;
    return is_close(l.next_lexeme(), "p"); // whitespace-only Text is skipped
}

bool test_nonempty_text_kept() {
    Lexer l("<p>hello</p>");
    if (!is_open(l.next_lexeme(), "p")) return false;
    auto opt = l.next_lexeme();
    if (!opt) return false;
    auto* tp = std::get_if<lex::TextNode>(&*opt);
    if (!tp) return false;
    return tp->text == "hello";
}

bool test_comment_node() {
    Lexer l("<!-- note --><div>");
    auto opt = l.next_lexeme();
    if (!opt || !std::holds_alternative<lex::CommentNode>(*opt)) return false;
    return is_open(l.next_lexeme(), "div");
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

int main() {
    struct Test { const char* name; bool (*fn)(); };
    const Test tests[] = {
        { "open_tag",                    test_open_tag                    },
        { "self_closing_tag",            test_self_closing_tag            },
        { "close_tag",                   test_close_tag                   },
        { "attrs_quoted",                test_attrs_quoted                },
        { "attr_unquoted_flagged",       test_attr_unquoted_flagged       },
        { "boolean_attr",                test_boolean_attr                },
        { "doctype",                     test_doctype                     },
        { "case_normalisation",          test_case_normalisation          },
        { "whitespace_only_text_skipped",test_whitespace_only_text_skipped},
        { "nonempty_text_kept",          test_nonempty_text_kept          },
        { "comment_node",                test_comment_node                },
    };

    bool all_passed = true;
    for (const auto& t : tests) {
        bool ok = t.fn();
        std::cout << (ok ? "PASS" : "FAIL") << "  " << t.name << "\n";
        if (!ok) all_passed = false;
    }
    return all_passed ? 0 : 1;
}
