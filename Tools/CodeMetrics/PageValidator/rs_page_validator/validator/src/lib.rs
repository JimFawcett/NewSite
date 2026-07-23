use std::collections::HashSet;
use std::path::{Path, PathBuf};
use lexer::{Attr, Lexeme, Lexer};

const VOID_ELEMENTS: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
];

fn is_void(name: &str) -> bool {
    VOID_ELEMENTS.contains(&name)
}

#[derive(Debug)]
pub struct ValidationError {
    pub rule: &'static str,
    pub message: String,
    pub line: usize,
    pub col: usize,
}

#[derive(Debug)]
pub struct Report {
    pub file: PathBuf,
    pub errors: Vec<ValidationError>,
}

impl Report {
    pub fn is_valid(&self) -> bool {
        self.errors.is_empty()
    }
}

fn err(rule: &'static str, msg: &str, line: usize, col: usize) -> ValidationError {
    ValidationError { rule, message: msg.to_string(), line, col }
}

fn check_attrs(
    attrs: &[Attr],
    pos: (usize, usize),
    errors: &mut Vec<ValidationError>,
    ids: &mut HashSet<String>,
) {
    for attr in attrs {
        if !attr.quoted && !attr.value.is_empty() {
            errors.push(err(
                "attr-quotes",
                &format!("attribute '{}' value '{}' is not quoted", attr.key, attr.value),
                pos.0,
                pos.1,
            ));
        }
        if attr.key == "id" && !attr.value.is_empty() {
            if !ids.insert(attr.value.clone()) {
                errors.push(err(
                    "duplicate-id",
                    &format!("duplicate id '{}'", attr.value),
                    pos.0,
                    pos.1,
                ));
            }
        }
    }
}

pub struct Validator;

impl Validator {
    pub fn validate(src: &str, file: &Path) -> Report {
        let mut lexer = Lexer::new(src);
        let mut errors: Vec<ValidationError> = Vec::new();
        let mut stack: Vec<(String, (usize, usize))> = Vec::new();
        let mut ids: HashSet<String> = HashSet::new();

        let mut seen_doctype = false;
        let mut html_count: usize = 0;
        let mut seen_head = false;
        let mut seen_title = false;
        let mut seen_body = false;
        let mut in_head = false;

        loop {
            let lexeme = match lexer.next_lexeme() {
                Some(l) => l,
                None => break,
            };

            match lexeme {
                Lexeme::DoctypeDecl(_) => {
                    seen_doctype = true;
                }
                Lexeme::OpenTag { name, attrs, pos } => {
                    check_attrs(&attrs, pos, &mut errors, &mut ids);
                    match name.as_str() {
                        "html" => html_count += 1,
                        "head" => {
                            seen_head = true;
                            in_head = true;
                        }
                        "title" if in_head => seen_title = true,
                        "body" => seen_body = true,
                        _ => {}
                    }
                    if !is_void(&name) {
                        stack.push((name, pos));
                    }
                }
                Lexeme::SelfClosingTag { attrs, pos, .. } => {
                    check_attrs(&attrs, pos, &mut errors, &mut ids);
                }
                Lexeme::CloseTag { name, pos } => {
                    if is_void(&name) {
                        errors.push(err(
                            "void-elements",
                            &format!("void element <{}> must not have a close tag", name),
                            pos.0,
                            pos.1,
                        ));
                        continue;
                    }
                    if name == "head" {
                        in_head = false;
                    }
                    let top_name = stack.last().map(|(s, _)| s.clone());
                    match top_name {
                        Some(top) if top == name => {
                            stack.pop();
                        }
                        Some(top) => {
                            errors.push(err(
                                "tag-nesting",
                                &format!("</{}> does not match open <{}>", name, top),
                                pos.0,
                                pos.1,
                            ));
                        }
                        None => {
                            errors.push(err(
                                "tag-nesting",
                                &format!("</{}> has no matching open tag", name),
                                pos.0,
                                pos.1,
                            ));
                        }
                    }
                }
                Lexeme::TextNode(_) | Lexeme::CommentNode(_) => {}
            }
        }

        if !seen_doctype {
            errors.push(err("doctype", "document is missing <!DOCTYPE html>", 1, 1));
        }
        if html_count != 1 {
            errors.push(err(
                "root-element",
                &format!("expected exactly 1 <html> element, found {}", html_count),
                1,
                1,
            ));
        }
        if !seen_head {
            errors.push(err("head-required", "document is missing a <head> element", 1, 1));
        } else if !seen_title {
            errors.push(err("head-required", "<head> is missing a <title> element", 1, 1));
        }
        if !seen_body {
            errors.push(err("body-required", "document is missing a <body> element", 1, 1));
        }
        for (name, (line, col)) in stack {
            errors.push(err(
                "tag-nesting",
                &format!("<{}> was opened but never closed", name),
                line,
                col,
            ));
        }

        Report { file: file.to_path_buf(), errors }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::Path;

    const VALID: &str = concat!(
        "<!DOCTYPE html>",
        "<html><head><title>T</title></head>",
        "<body><p>Hello</p></body></html>"
    );

    #[test]
    fn test_valid_document() {
        let r = Validator::validate(VALID, Path::new("t.html"));
        assert!(r.is_valid(), "{:?}", r.errors);
    }

    #[test]
    fn test_missing_doctype() {
        let html = "<html><head><title>T</title></head><body></body></html>";
        let r = Validator::validate(html, Path::new("t.html"));
        assert!(r.errors.iter().any(|e| e.rule == "doctype"));
    }

    #[test]
    fn test_tag_nesting_mismatch() {
        let html = concat!(
            "<!DOCTYPE html><html><head><title>T</title></head>",
            "<body><div><p></div></p></body></html>"
        );
        let r = Validator::validate(html, Path::new("t.html"));
        assert!(r.errors.iter().any(|e| e.rule == "tag-nesting"));
    }

    #[test]
    fn test_unclosed_tag() {
        let html = concat!(
            "<!DOCTYPE html><html><head><title>T</title></head>",
            "<body><div></body></html>"
        );
        let r = Validator::validate(html, Path::new("t.html"));
        assert!(r.errors.iter().any(|e| e.rule == "tag-nesting"));
    }

    #[test]
    fn test_void_element_close_tag() {
        let html = concat!(
            "<!DOCTYPE html><html><head><title>T</title></head>",
            "<body><br></br></body></html>"
        );
        let r = Validator::validate(html, Path::new("t.html"));
        assert!(r.errors.iter().any(|e| e.rule == "void-elements"));
    }

    #[test]
    fn test_duplicate_id() {
        let html = concat!(
            r#"<!DOCTYPE html><html><head><title>T</title></head>"#,
            r#"<body><div id="a"></div><div id="a"></div></body></html>"#
        );
        let r = Validator::validate(html, Path::new("t.html"));
        assert!(r.errors.iter().any(|e| e.rule == "duplicate-id"));
    }

    #[test]
    fn test_unquoted_attr() {
        let html = concat!(
            "<!DOCTYPE html><html><head><title>T</title></head>",
            "<body><div class=foo></div></body></html>"
        );
        let r = Validator::validate(html, Path::new("t.html"));
        assert!(r.errors.iter().any(|e| e.rule == "attr-quotes"));
    }

    #[test]
    fn test_missing_head() {
        let html = "<!DOCTYPE html><html><body></body></html>";
        let r = Validator::validate(html, Path::new("t.html"));
        assert!(r.errors.iter().any(|e| e.rule == "head-required"));
    }

    #[test]
    fn test_missing_title() {
        let html = "<!DOCTYPE html><html><head></head><body></body></html>";
        let r = Validator::validate(html, Path::new("t.html"));
        assert!(r.errors.iter().any(|e| e.rule == "head-required"));
    }
}
