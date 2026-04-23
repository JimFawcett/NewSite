export module validator;

import lexer;
import std;

// ---------------------------------------------------------------------------
// Module-private visitor helper
// ---------------------------------------------------------------------------

template<class... Ts>
struct overloaded : Ts... { using Ts::operator()...; };

template<class... Ts>
overloaded(Ts...) -> overloaded<Ts...>;

export {

// ---------------------------------------------------------------------------
// ValidationError — one rule violation found in an HTML file.
// ---------------------------------------------------------------------------

struct ValidationError {
    const char* rule;
    std::string message;
    std::size_t line;
    std::size_t col;
};

// ---------------------------------------------------------------------------
// Report — the complete result for a single file.
// ---------------------------------------------------------------------------

struct Report {
    std::filesystem::path        file;
    std::vector<ValidationError> errors;

    bool is_valid() const { return errors.empty(); }
};

// ---------------------------------------------------------------------------
// Validator — stateless; all state lives in validate()'s locals.
// ---------------------------------------------------------------------------

class Validator {
public:
    static Report validate(std::string_view src, const std::filesystem::path& file) {
        Lexer lexer{std::string(src)};

        std::vector<ValidationError>                              errors;
        std::vector<std::pair<std::string,
                              std::pair<std::size_t, std::size_t>>> stack;
        std::unordered_set<std::string> ids;

        bool        seen_doctype = false;
        std::size_t html_count   = 0;
        bool        seen_head    = false;
        bool        seen_title   = false;
        bool        seen_body    = false;
        bool        in_head      = false;

        while (auto opt = lexer.next_lexeme()) {
            std::visit(overloaded{

                [&](lex::DoctypeDecl&) {
                    seen_doctype = true;
                },

                [&](lex::OpenTag& l) {
                    check_attrs(l.attrs, l.pos, errors, ids);
                    if      (l.name == "html")              ++html_count;
                    else if (l.name == "head")              { seen_head = true; in_head = true; }
                    else if (l.name == "title" && in_head)  seen_title = true;
                    else if (l.name == "body")              seen_body = true;
                    if (!is_void(l.name))
                        stack.push_back({l.name, l.pos});
                },

                [&](lex::SelfClosingTag& l) {
                    check_attrs(l.attrs, l.pos, errors, ids);
                },

                [&](lex::CloseTag& l) {
                    if (is_void(l.name)) {
                        errors.push_back(make_err("void-elements",
                            "void element <" + l.name + "> must not have a close tag",
                            l.pos.first, l.pos.second));
                        return; // skip stack check (return exits lambda only)
                    }
                    if (l.name == "head") in_head = false;
                    if (!stack.empty() && stack.back().first == l.name) {
                        stack.pop_back();
                    } else if (!stack.empty()) {
                        errors.push_back(make_err("tag-nesting",
                            "</" + l.name + "> does not match open <" + stack.back().first + ">",
                            l.pos.first, l.pos.second));
                    } else {
                        errors.push_back(make_err("tag-nesting",
                            "</" + l.name + "> has no matching open tag",
                            l.pos.first, l.pos.second));
                    }
                },

                [](lex::TextNode&)    {},
                [](lex::CommentNode&) {},

            }, *opt);
        }

        // Post-loop structural checks
        if (!seen_doctype)
            errors.push_back(make_err("doctype",
                "document is missing <!DOCTYPE html>", 1, 1));

        if (html_count != 1)
            errors.push_back(make_err("root-element",
                "expected exactly 1 <html> element, found " + std::to_string(html_count),
                1, 1));

        if (!seen_head)
            errors.push_back(make_err("head-required",
                "document is missing a <head> element", 1, 1));
        else if (!seen_title)
            errors.push_back(make_err("head-required",
                "<head> is missing a <title> element", 1, 1));

        if (!seen_body)
            errors.push_back(make_err("body-required",
                "document is missing a <body> element", 1, 1));

        for (auto& [name, pos] : stack)
            errors.push_back(make_err("tag-nesting",
                "<" + name + "> was opened but never closed",
                pos.first, pos.second));

        return Report{file, std::move(errors)};
    }

private:
    using Pos = std::pair<std::size_t, std::size_t>;

    static constexpr std::string_view VOID_ELEMENTS[] = {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    };

    static bool is_void(const std::string& name) {
        for (auto v : VOID_ELEMENTS)
            if (name == v) return true;
        return false;
    }

    static ValidationError make_err(const char* rule, std::string msg,
                                    std::size_t line, std::size_t col) {
        return ValidationError{rule, std::move(msg), line, col};
    }

    static void check_attrs(const std::vector<Attr>& attrs, Pos pos,
                            std::vector<ValidationError>& errors,
                            std::unordered_set<std::string>& ids) {
        for (const auto& attr : attrs) {
            if (!attr.quoted && !attr.value.empty())
                errors.push_back(make_err("attr-quotes",
                    "attribute '" + attr.key + "' value '" + attr.value + "' is not quoted",
                    pos.first, pos.second));

            if (attr.key == "id" && !attr.value.empty()) {
                if (!ids.insert(attr.value).second)
                    errors.push_back(make_err("duplicate-id",
                        "duplicate id '" + attr.value + "'",
                        pos.first, pos.second));
            }
        }
    }
};

} // export
