export module lexer;

import tokenizer;
import std;

export {

// ---------------------------------------------------------------------------
// Attr — a single attribute key/value pair with quoting status.
// ---------------------------------------------------------------------------

struct Attr {
    std::string key;
    std::string value;
    bool        quoted;  // false when the source had no surrounding quotes
};

// ---------------------------------------------------------------------------
// Lexeme variant — structured items produced by the Lexer.
// ---------------------------------------------------------------------------

namespace lex {
    struct OpenTag {
        std::string name;
        std::vector<Attr> attrs;
        std::pair<std::size_t, std::size_t> pos;
    };

    struct SelfClosingTag {
        std::string name;
        std::vector<Attr> attrs;
        std::pair<std::size_t, std::size_t> pos;
    };

    struct CloseTag {
        std::string name;
        std::pair<std::size_t, std::size_t> pos;
    };

    struct TextNode    { std::string text; };
    struct CommentNode { std::string text; };
    struct DoctypeDecl { std::string text; };
}

using Lexeme = std::variant<
    lex::OpenTag, lex::SelfClosingTag, lex::CloseTag,
    lex::TextNode, lex::CommentNode, lex::DoctypeDecl>;

// ---------------------------------------------------------------------------
// Lexer
// ---------------------------------------------------------------------------

class Lexer {
public:
    explicit Lexer(std::string src)
        : tok_(std::move(src))
    {}

    // Returns the next Lexeme, or std::nullopt at end of input.
    std::optional<Lexeme> next_lexeme() {
        for (;;) {
            auto [t, pos] = next_tok();

            if (std::holds_alternative<tok::Eof>(t))
                return std::nullopt;

            if (auto* p = std::get_if<tok::TagOpen>(&t)) {
                auto [attrs, self_close] = collect_attrs();
                std::string name = to_lower(std::move(p->name));
                if (self_close)
                    return lex::SelfClosingTag{std::move(name), std::move(attrs), pos};
                return lex::OpenTag{std::move(name), std::move(attrs), pos};
            }

            if (auto* p = std::get_if<tok::TagClose>(&t))
                return lex::CloseTag{to_lower(std::move(p->name)), pos};

            if (auto* p = std::get_if<tok::Text>(&t)) {
                bool non_ws = false;
                for (char c : p->text)
                    if (!std::isspace(static_cast<unsigned char>(c))) { non_ws = true; break; }
                if (non_ws) return lex::TextNode{std::move(p->text)};
                continue;
            }

            if (auto* p = std::get_if<tok::Comment>(&t))
                return lex::CommentNode{std::move(p->text)};

            if (auto* p = std::get_if<tok::Doctype>(&t))
                return lex::DoctypeDecl{std::move(p->text)};
        }
    }

private:
    using Pos = std::pair<std::size_t, std::size_t>;

    Tokenizer                              tok_;
    std::optional<std::pair<Token, Pos>>   buffered_;

    std::pair<Token, Pos> next_tok() {
        if (buffered_) {
            auto p = std::move(*buffered_);
            buffered_.reset();
            return p;
        }
        Token t   = tok_.next_token();
        Pos   pos = tok_.token_start();
        return {std::move(t), pos};
    }

    void push_back(Token t, Pos pos) {
        buffered_ = {std::move(t), pos};
    }

    std::pair<std::vector<Attr>, bool> collect_attrs() {
        std::vector<Attr> attrs;
        for (;;) {
            auto [t, pos] = next_tok();
            if (std::holds_alternative<tok::TagEnd>(t))    return {std::move(attrs), false};
            if (std::holds_alternative<tok::SelfClose>(t)) return {std::move(attrs), true};
            if (std::holds_alternative<tok::Eof>(t))       return {std::move(attrs), false};

            if (auto* kp = std::get_if<tok::AttrName>(&t)) {
                auto [nt, npos] = next_tok();
                if (auto* vp = std::get_if<tok::AttrValue>(&nt)) {
                    attrs.push_back({std::move(kp->name), std::move(vp->value), true});
                } else if (auto* uvp = std::get_if<tok::AttrUnquoted>(&nt)) {
                    attrs.push_back({std::move(kp->name), std::move(uvp->value), false});
                } else {
                    attrs.push_back({std::move(kp->name), {}, true}); // boolean attr
                    push_back(std::move(nt), npos);
                }
            }
        }
    }

    static std::string to_lower(std::string s) {
        for (char& c : s)
            c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
        return s;
    }
};

} // export
