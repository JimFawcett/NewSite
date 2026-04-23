use tokenizer::{Token, Tokenizer};

#[derive(Debug, Clone)]
pub struct Attr {
    pub key: String,
    pub value: String,
    pub quoted: bool,
}

#[derive(Debug, Clone)]
pub enum Lexeme {
    OpenTag {
        name: String,
        attrs: Vec<Attr>,
        pos: (usize, usize),
    },
    SelfClosingTag {
        name: String,
        attrs: Vec<Attr>,
        pos: (usize, usize),
    },
    CloseTag {
        name: String,
        pos: (usize, usize),
    },
    TextNode(String),
    CommentNode(String),
    DoctypeDecl(String),
}

pub struct Lexer {
    tok: Tokenizer,
    buffered: Option<(Token, (usize, usize))>,
}

impl Lexer {
    pub fn new(src: &str) -> Self {
        Lexer { tok: Tokenizer::new(src), buffered: None }
    }

    fn next_tok(&mut self) -> (Token, (usize, usize)) {
        if let Some(pair) = self.buffered.take() {
            return pair;
        }
        let t = self.tok.next_token();
        let pos = self.tok.token_start();
        (t, pos)
    }

    fn push_back(&mut self, tok: Token, pos: (usize, usize)) {
        self.buffered = Some((tok, pos));
    }

    fn collect_attrs(&mut self) -> (Vec<Attr>, bool) {
        let mut attrs = Vec::new();
        loop {
            let (tok, _pos) = self.next_tok();
            match tok {
                Token::TagEnd => return (attrs, false),
                Token::SelfClose => return (attrs, true),
                Token::Eof => return (attrs, false),
                Token::AttrName(key) => {
                    let (next, npos) = self.next_tok(); // npos used for push_back
                    match next {
                        Token::AttrValue(val) => {
                            attrs.push(Attr { key, value: val, quoted: true });
                        }
                        Token::AttrValueUnquoted(val) => {
                            attrs.push(Attr { key, value: val, quoted: false });
                        }
                        other => {
                            // boolean attribute — no value
                            attrs.push(Attr { key, value: String::new(), quoted: true });
                            self.push_back(other, npos);
                        }
                    }
                }
                _ => {}
            }
        }
    }

    pub fn next_lexeme(&mut self) -> Option<Lexeme> {
        loop {
            let (tok, pos) = self.next_tok();
            match tok {
                Token::Eof => return None,
                Token::TagOpen(name) => {
                    let (attrs, self_closing) = self.collect_attrs();
                    let name = name.to_lowercase();
                    if self_closing {
                        return Some(Lexeme::SelfClosingTag { name, attrs, pos });
                    } else {
                        return Some(Lexeme::OpenTag { name, attrs, pos });
                    }
                }
                Token::TagClose(name) => {
                    return Some(Lexeme::CloseTag { name: name.to_lowercase(), pos });
                }
                Token::Text(s) => {
                    if !s.trim().is_empty() {
                        return Some(Lexeme::TextNode(s));
                    }
                }
                Token::Comment(s) => return Some(Lexeme::CommentNode(s)),
                Token::Doctype(s) => return Some(Lexeme::DoctypeDecl(s)),
                _ => {}
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_open_tag() {
        let mut l = Lexer::new("<div>");
        assert!(matches!(l.next_lexeme(), Some(Lexeme::OpenTag { name, .. }) if name == "div"));
    }

    #[test]
    fn test_self_closing_tag() {
        let mut l = Lexer::new("<br />");
        assert!(
            matches!(l.next_lexeme(), Some(Lexeme::SelfClosingTag { name, .. }) if name == "br")
        );
    }

    #[test]
    fn test_close_tag() {
        let mut l = Lexer::new("</div>");
        assert!(matches!(l.next_lexeme(), Some(Lexeme::CloseTag { name, .. }) if name == "div"));
    }

    #[test]
    fn test_attrs_quoted() {
        let mut l = Lexer::new(r#"<a href="url" class="foo">"#);
        if let Some(Lexeme::OpenTag { attrs, .. }) = l.next_lexeme() {
            assert_eq!(attrs.len(), 2);
            assert_eq!(attrs[0].key, "href");
            assert_eq!(attrs[0].value, "url");
            assert!(attrs[0].quoted);
            assert_eq!(attrs[1].key, "class");
        } else {
            panic!("expected OpenTag");
        }
    }

    #[test]
    fn test_attr_unquoted_flagged() {
        let mut l = Lexer::new("<div class=foo>");
        if let Some(Lexeme::OpenTag { attrs, .. }) = l.next_lexeme() {
            assert!(!attrs[0].quoted);
        } else {
            panic!("expected OpenTag");
        }
    }

    #[test]
    fn test_boolean_attr() {
        let mut l = Lexer::new("<input disabled>");
        if let Some(Lexeme::OpenTag { attrs, .. }) = l.next_lexeme() {
            assert_eq!(attrs[0].key, "disabled");
            assert_eq!(attrs[0].value, "");
        } else {
            panic!("expected OpenTag");
        }
    }

    #[test]
    fn test_doctype() {
        let mut l = Lexer::new("<!DOCTYPE html><html>");
        assert!(matches!(l.next_lexeme(), Some(Lexeme::DoctypeDecl(_))));
        assert!(matches!(l.next_lexeme(), Some(Lexeme::OpenTag { name, .. }) if name == "html"));
    }

    #[test]
    fn test_case_normalisation() {
        let mut l = Lexer::new("<DIV></DIV>");
        assert!(matches!(l.next_lexeme(), Some(Lexeme::OpenTag { name, .. }) if name == "div"));
        assert!(matches!(l.next_lexeme(), Some(Lexeme::CloseTag { name, .. }) if name == "div"));
    }
}
