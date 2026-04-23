#[derive(Debug, Clone, PartialEq)]
pub enum Token {
    TagOpen(String),
    TagClose(String),
    AttrName(String),
    AttrValue(String),
    AttrValueUnquoted(String),
    SelfClose,
    TagEnd,
    Text(String),
    Comment(String),
    Doctype(String),
    Eof,
}

pub struct Tokenizer {
    src: Vec<char>,
    pos: usize,
    line: usize,
    col: usize,
    in_tag: bool,
    pending: Option<(Token, (usize, usize))>,
    last_start: (usize, usize),
}

impl Tokenizer {
    pub fn new(src: &str) -> Self {
        Tokenizer {
            src: src.chars().collect(),
            pos: 0,
            line: 1,
            col: 1,
            in_tag: false,
            pending: None,
            last_start: (1, 1),
        }
    }

    pub fn token_start(&self) -> (usize, usize) {
        self.last_start
    }

    fn peek(&self) -> Option<char> {
        self.src.get(self.pos).copied()
    }

    fn peek_at(&self, offset: usize) -> Option<char> {
        self.src.get(self.pos + offset).copied()
    }

    fn advance(&mut self) -> Option<char> {
        let ch = self.src.get(self.pos).copied()?;
        self.pos += 1;
        if ch == '\n' {
            self.line += 1;
            self.col = 1;
        } else {
            self.col += 1;
        }
        Some(ch)
    }

    fn skip_whitespace(&mut self) {
        while matches!(self.peek(), Some(c) if c.is_whitespace()) {
            self.advance();
        }
    }

    fn collect_name(&mut self) -> String {
        let mut s = String::new();
        while let Some(c) = self.peek() {
            if c.is_alphanumeric() || matches!(c, '-' | '_' | ':' | '.') {
                s.push(c);
                self.advance();
            } else {
                break;
            }
        }
        s
    }

    fn collect_until_str(&mut self, stop: &str) -> String {
        let stop: Vec<char> = stop.chars().collect();
        let slen = stop.len();
        let mut s = String::new();
        loop {
            if self.pos + slen <= self.src.len()
                && (0..slen).all(|i| self.src[self.pos + i] == stop[i])
            {
                for _ in 0..slen {
                    self.advance();
                }
                break;
            }
            match self.advance() {
                Some(c) => s.push(c),
                None => break,
            }
        }
        s
    }

    pub fn next_token(&mut self) -> Token {
        if let Some((tok, pos)) = self.pending.take() {
            self.last_start = pos;
            return tok;
        }

        self.last_start = (self.line, self.col);

        if self.in_tag {
            return self.scan_in_tag();
        }

        match self.peek() {
            None => Token::Eof,
            Some('<') => {
                self.advance();
                match self.peek() {
                    Some('!') => {
                        self.advance();
                        if self.peek() == Some('-') && self.peek_at(1) == Some('-') {
                            self.advance();
                            self.advance();
                            Token::Comment(self.collect_until_str("-->"))
                        } else {
                            Token::Doctype(self.collect_until_str(">"))
                        }
                    }
                    Some('/') => {
                        self.advance();
                        let name = self.collect_name();
                        self.skip_whitespace();
                        if self.peek() == Some('>') {
                            self.advance();
                        }
                        Token::TagClose(name)
                    }
                    _ => {
                        let name = self.collect_name();
                        self.in_tag = true;
                        Token::TagOpen(name)
                    }
                }
            }
            Some(_) => {
                let mut text = String::new();
                while let Some(c) = self.peek() {
                    if c == '<' {
                        break;
                    }
                    text.push(c);
                    self.advance();
                }
                Token::Text(text)
            }
        }
    }

    fn scan_in_tag(&mut self) -> Token {
        self.skip_whitespace();
        match self.peek() {
            None => {
                self.in_tag = false;
                Token::TagEnd
            }
            Some('>') => {
                self.advance();
                self.in_tag = false;
                Token::TagEnd
            }
            Some('/') if self.peek_at(1) == Some('>') => {
                self.advance();
                self.advance();
                self.in_tag = false;
                Token::SelfClose
            }
            _ => {
                let name = self.collect_name();
                if name.is_empty() {
                    self.advance();
                    return self.scan_in_tag();
                }
                self.skip_whitespace();
                if self.peek() != Some('=') {
                    return Token::AttrName(name);
                }
                self.advance(); // '='
                self.skip_whitespace();
                let val_pos = (self.line, self.col);
                match self.peek() {
                    Some('"') | Some('\'') => {
                        let q = self.advance().unwrap();
                        let mut val = String::new();
                        loop {
                            match self.peek() {
                                None => break,
                                Some(c) if c == q => {
                                    self.advance();
                                    break;
                                }
                                Some(c) => {
                                    val.push(c);
                                    self.advance();
                                }
                            }
                        }
                        self.pending = Some((Token::AttrValue(val), val_pos));
                    }
                    _ => {
                        let mut val = String::new();
                        while let Some(c) = self.peek() {
                            if c.is_whitespace() || matches!(c, '>' | '/') {
                                break;
                            }
                            val.push(c);
                            self.advance();
                        }
                        self.pending = Some((Token::AttrValueUnquoted(val), val_pos));
                    }
                }
                Token::AttrName(name)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_open_tag() {
        let mut t = Tokenizer::new("<div>");
        assert_eq!(t.next_token(), Token::TagOpen("div".into()));
        assert_eq!(t.next_token(), Token::TagEnd);
        assert_eq!(t.next_token(), Token::Eof);
    }

    #[test]
    fn test_close_tag() {
        let mut t = Tokenizer::new("</div>");
        assert_eq!(t.next_token(), Token::TagClose("div".into()));
        assert_eq!(t.next_token(), Token::Eof);
    }

    #[test]
    fn test_self_closing() {
        let mut t = Tokenizer::new("<br />");
        assert_eq!(t.next_token(), Token::TagOpen("br".into()));
        assert_eq!(t.next_token(), Token::SelfClose);
        assert_eq!(t.next_token(), Token::Eof);
    }

    #[test]
    fn test_attribute_quoted() {
        let mut t = Tokenizer::new(r#"<a href="url">"#);
        assert_eq!(t.next_token(), Token::TagOpen("a".into()));
        assert_eq!(t.next_token(), Token::AttrName("href".into()));
        assert_eq!(t.next_token(), Token::AttrValue("url".into()));
        assert_eq!(t.next_token(), Token::TagEnd);
    }

    #[test]
    fn test_attribute_unquoted() {
        let mut t = Tokenizer::new("<div class=foo>");
        assert_eq!(t.next_token(), Token::TagOpen("div".into()));
        assert_eq!(t.next_token(), Token::AttrName("class".into()));
        assert_eq!(t.next_token(), Token::AttrValueUnquoted("foo".into()));
        assert_eq!(t.next_token(), Token::TagEnd);
    }

    #[test]
    fn test_boolean_attr() {
        let mut t = Tokenizer::new("<input disabled>");
        assert_eq!(t.next_token(), Token::TagOpen("input".into()));
        assert_eq!(t.next_token(), Token::AttrName("disabled".into()));
        assert_eq!(t.next_token(), Token::TagEnd);
    }

    #[test]
    fn test_doctype() {
        let mut t = Tokenizer::new("<!DOCTYPE html>");
        assert!(matches!(t.next_token(), Token::Doctype(_)));
        assert_eq!(t.next_token(), Token::Eof);
    }

    #[test]
    fn test_comment() {
        let mut t = Tokenizer::new("<!-- hello -->");
        assert_eq!(t.next_token(), Token::Comment(" hello ".into()));
        assert_eq!(t.next_token(), Token::Eof);
    }

    #[test]
    fn test_text_node() {
        let mut t = Tokenizer::new("hello world");
        assert_eq!(t.next_token(), Token::Text("hello world".into()));
        assert_eq!(t.next_token(), Token::Eof);
    }

    #[test]
    fn test_position_tracking() {
        let mut t = Tokenizer::new("<div>\n<p>");
        t.next_token(); // TagOpen("div")
        t.next_token(); // TagEnd
        t.next_token(); // Text("\n")
        t.next_token(); // TagOpen("p")
        let (line, _) = t.token_start();
        assert_eq!(line, 2);
    }
}
