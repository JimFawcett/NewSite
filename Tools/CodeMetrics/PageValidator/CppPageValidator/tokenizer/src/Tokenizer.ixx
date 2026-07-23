export module tokenizer;

import std;

export {

// ---------------------------------------------------------------------------
// Token variant — one alternative per lexical unit emitted by the tokenizer.
// ---------------------------------------------------------------------------

namespace tok {
    struct TagOpen     { std::string name;  };   // <div
    struct TagClose    { std::string name;  };   // </div>
    struct AttrName    { std::string name;  };   // href
    struct AttrValue   { std::string value; };   // "url"  (quoted)
    struct AttrUnquoted{ std::string value; };   // foo    (unquoted)
    struct SelfClose   {};                       // />
    struct TagEnd      {};                       // >  (closes a start or close tag)
    struct Text        { std::string text;  };   // raw text between tags
    struct Comment     { std::string text;  };   // <!-- ... -->
    struct Doctype     { std::string text;  };   // <!DOCTYPE html>
    struct Eof         {};
}

using Token = std::variant<
    tok::TagOpen, tok::TagClose, tok::AttrName,
    tok::AttrValue, tok::AttrUnquoted, tok::SelfClose,
    tok::TagEnd, tok::Text, tok::Comment, tok::Doctype, tok::Eof>;

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

class Tokenizer {
public:
    explicit Tokenizer(std::string src)
        : src_(std::move(src))
        , pos_(0), line_(1), col_(1)
        , in_tag_(false)
        , last_start_{1, 1}
    {}

    // Returns the (line, col) start position of the last token returned.
    std::pair<std::size_t, std::size_t> token_start() const { return last_start_; }

    Token next_token() {
        if (pending_) {
            auto [t, p] = std::move(*pending_);
            pending_.reset();
            last_start_ = p;
            return t;
        }
        last_start_ = {line_, col_};
        if (in_tag_) return scan_in_tag();
        if (pos_ >= src_.size()) return tok::Eof{};

        if (src_[pos_] == '<') {
            advance();
            if (pos_ < src_.size() && src_[pos_] == '!') {
                advance();
                if (pos_ + 1 < src_.size() && src_[pos_] == '-' && src_[pos_ + 1] == '-') {
                    advance(); advance();
                    return tok::Comment{collect_until("-->")};
                }
                return tok::Doctype{collect_until(">")};
            }
            if (pos_ < src_.size() && src_[pos_] == '/') {
                advance();
                auto name = collect_name();
                skip_ws();
                if (pos_ < src_.size() && src_[pos_] == '>') advance();
                return tok::TagClose{std::move(name)};
            }
            auto name = collect_name();
            in_tag_ = true;
            return tok::TagOpen{std::move(name)};
        }

        std::string text;
        while (pos_ < src_.size() && src_[pos_] != '<')
            text += advance();
        return tok::Text{std::move(text)};
    }

private:
    std::string src_;
    std::size_t pos_;
    std::size_t line_, col_;
    bool        in_tag_;
    std::pair<std::size_t, std::size_t>              last_start_;
    std::optional<std::pair<Token, std::pair<std::size_t, std::size_t>>> pending_;

    char peek(std::size_t off = 0) const {
        std::size_t i = pos_ + off;
        return i < src_.size() ? src_[i] : '\0';
    }

    char advance() {
        if (pos_ >= src_.size()) return '\0';
        char c = src_[pos_++];
        if (c == '\n') { ++line_; col_ = 1; }
        else            { ++col_; }
        return c;
    }

    void skip_ws() {
        while (pos_ < src_.size() &&
               std::isspace(static_cast<unsigned char>(src_[pos_])))
            advance();
    }

    std::string collect_name() {
        std::string s;
        while (pos_ < src_.size()) {
            char c = src_[pos_];
            if (std::isalnum(static_cast<unsigned char>(c))
                || c == '-' || c == '_' || c == ':' || c == '.') {
                s += advance();
            } else {
                break;
            }
        }
        return s;
    }

    std::string collect_until(std::string_view stop) {
        std::string s;
        const std::size_t slen = stop.size();
        while (pos_ < src_.size()) {
            if (pos_ + slen <= src_.size() &&
                src_.compare(pos_, slen, stop.data(), slen) == 0) {
                for (std::size_t i = 0; i < slen; ++i) advance();
                break;
            }
            s += advance();
        }
        return s;
    }

    Token scan_in_tag() {
        skip_ws();
        if (pos_ >= src_.size() || src_[pos_] == '>') {
            if (pos_ < src_.size()) advance();
            in_tag_ = false;
            return tok::TagEnd{};
        }
        if (src_[pos_] == '/' && peek(1) == '>') {
            advance(); advance();
            in_tag_ = false;
            return tok::SelfClose{};
        }
        auto name = collect_name();
        if (name.empty()) {
            advance();
            return scan_in_tag();
        }
        skip_ws();
        if (peek() != '=')
            return tok::AttrName{std::move(name)};
        advance(); // '='
        skip_ws();
        std::pair<std::size_t, std::size_t> val_pos = {line_, col_};
        char q = peek();
        if (q == '"' || q == '\'') {
            advance(); // opening quote
            std::string val;
            while (pos_ < src_.size() && src_[pos_] != q)
                val += advance();
            if (pos_ < src_.size()) advance(); // closing quote
            pending_ = {tok::AttrValue{std::move(val)}, val_pos};
        } else {
            std::string val;
            while (pos_ < src_.size()) {
                char c = src_[pos_];
                if (std::isspace(static_cast<unsigned char>(c)) || c == '>' || c == '/')
                    break;
                val += advance();
            }
            pending_ = {tok::AttrUnquoted{std::move(val)}, val_pos};
        }
        return tok::AttrName{std::move(name)};
    }
};

} // export
