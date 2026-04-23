import tokenizer;
import std;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

bool test_simple_open_tag() {
    Tokenizer t("<div>");
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::TagOpen>(tok)) return false;
    if (std::get<tok::TagOpen>(tok).name != "div") return false;
    tok = t.next_token();
    if (!std::holds_alternative<tok::TagEnd>(tok)) return false;
    tok = t.next_token();
    return std::holds_alternative<tok::Eof>(tok);
}

bool test_close_tag() {
    Tokenizer t("</div>");
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::TagClose>(tok)) return false;
    if (std::get<tok::TagClose>(tok).name != "div") return false;
    tok = t.next_token();
    return std::holds_alternative<tok::Eof>(tok);
}

bool test_self_closing() {
    Tokenizer t("<br />");
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::TagOpen>(tok)) return false;
    if (std::get<tok::TagOpen>(tok).name != "br") return false;
    tok = t.next_token();
    if (!std::holds_alternative<tok::SelfClose>(tok)) return false;
    tok = t.next_token();
    return std::holds_alternative<tok::Eof>(tok);
}

bool test_attribute_quoted() {
    Tokenizer t(R"(<a href="url">)");
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::TagOpen>(tok)) return false;
    tok = t.next_token();
    if (!std::holds_alternative<tok::AttrName>(tok)) return false;
    if (std::get<tok::AttrName>(tok).name != "href") return false;
    tok = t.next_token();
    if (!std::holds_alternative<tok::AttrValue>(tok)) return false;
    if (std::get<tok::AttrValue>(tok).value != "url") return false;
    tok = t.next_token();
    return std::holds_alternative<tok::TagEnd>(tok);
}

bool test_attribute_unquoted() {
    Tokenizer t("<div class=foo>");
    t.next_token(); // TagOpen
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::AttrName>(tok)) return false;
    if (std::get<tok::AttrName>(tok).name != "class") return false;
    tok = t.next_token();
    if (!std::holds_alternative<tok::AttrUnquoted>(tok)) return false;
    return std::get<tok::AttrUnquoted>(tok).value == "foo";
}

bool test_boolean_attr() {
    Tokenizer t("<input disabled>");
    t.next_token(); // TagOpen("input")
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::AttrName>(tok)) return false;
    if (std::get<tok::AttrName>(tok).name != "disabled") return false;
    tok = t.next_token();
    return std::holds_alternative<tok::TagEnd>(tok);
}

bool test_doctype() {
    Tokenizer t("<!DOCTYPE html>");
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::Doctype>(tok)) return false;
    tok = t.next_token();
    return std::holds_alternative<tok::Eof>(tok);
}

bool test_comment() {
    Tokenizer t("<!-- hello -->");
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::Comment>(tok)) return false;
    if (std::get<tok::Comment>(tok).text != " hello ") return false;
    tok = t.next_token();
    return std::holds_alternative<tok::Eof>(tok);
}

bool test_text_node() {
    Tokenizer t("hello world");
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::Text>(tok)) return false;
    return std::get<tok::Text>(tok).text == "hello world";
}

bool test_position_tracking() {
    Tokenizer t("<div>\n<p>");
    t.next_token(); // TagOpen("div")
    t.next_token(); // TagEnd
    t.next_token(); // Text("\n")
    t.next_token(); // TagOpen("p")
    auto [line, col] = t.token_start();
    return line == 2;
}

bool test_single_quoted_attr() {
    Tokenizer t("<a href='url'>");
    t.next_token(); // TagOpen
    t.next_token(); // AttrName
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::AttrValue>(tok)) return false;
    return std::get<tok::AttrValue>(tok).value == "url";
}

bool test_multiple_attrs() {
    Tokenizer t(R"(<a href="url" class="foo">)");
    t.next_token(); // TagOpen("a")
    auto tok = t.next_token();
    if (!std::holds_alternative<tok::AttrName>(tok)) return false;
    if (std::get<tok::AttrName>(tok).name != "href") return false;
    t.next_token(); // AttrValue("url")
    tok = t.next_token();
    if (!std::holds_alternative<tok::AttrName>(tok)) return false;
    return std::get<tok::AttrName>(tok).name == "class";
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

int main() {
    struct Test { const char* name; bool (*fn)(); };
    const Test tests[] = {
        { "simple_open_tag",       test_simple_open_tag       },
        { "close_tag",             test_close_tag             },
        { "self_closing",          test_self_closing          },
        { "attribute_quoted",      test_attribute_quoted      },
        { "attribute_unquoted",    test_attribute_unquoted    },
        { "boolean_attr",          test_boolean_attr          },
        { "doctype",               test_doctype               },
        { "comment",               test_comment               },
        { "text_node",             test_text_node             },
        { "position_tracking",     test_position_tracking     },
        { "single_quoted_attr",    test_single_quoted_attr    },
        { "multiple_attrs",        test_multiple_attrs        },
    };

    bool all_passed = true;
    for (const auto& t : tests) {
        bool ok = t.fn();
        std::cout << (ok ? "PASS" : "FAIL") << "  " << t.name << "\n";
        if (!ok) all_passed = false;
    }
    return all_passed ? 0 : 1;
}
