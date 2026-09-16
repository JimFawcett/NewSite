//! rust_textfinder_dirnav - directory navigation, matching, and block formatting.
//! Implements Spec_Rust_TextFinder_Dirnav.md, the Rust binding of Spec_TextFinder.md sections 3.2-3.4.

use regex::Regex;
use rust_textfinder_cmdline::ProgramCommands;
use std::fs::{self, Metadata};
use std::path::Path;

#[cfg(test)]
mod unit_tests;

pub trait Output {
    fn output(&mut self, text: &str);
}

pub type SkipList = Vec<String>;

pub struct Dirnav<'a, O: Output> {
    out: &'a mut O,
    skips: &'a SkipList,
    commands: &'a ProgramCommands,
    expression: Regex,
    path_line_only: bool,
}

const SIZE_LIMIT: u64 = 10_485_760;

impl<'a, O: Output> Dirnav<'a, O> {
    pub fn new(
        out: &'a mut O,
        skips: &'a SkipList,
        commands: &'a ProgramCommands,
    ) -> Result<Self, regex::Error> {
        let expression = Regex::new(&commands.regex_text)?;
        let path_line_only =
            commands.regex_text == "." && !commands.line_numbers && !commands.matched_line;
        Ok(Dirnav { out, skips, commands, expression, path_line_only })
    }

    pub fn search(&mut self, root: &Path) {
        let display = normalize(&root.to_string_lossy());
        let info = match fs::symlink_metadata(root) {
            Ok(info) => info,
            Err(_) => return self.announce("cannot open", &display),
        };
        let kind = info.file_type();
        if kind.is_symlink() || !(kind.is_file() || kind.is_dir()) {
            self.announce("cannot open", &display);
        } else if kind.is_file() {
            if self.selected(basename(&display)) {
                self.examine(root, &display, &info);
            }
        } else {
            self.walk(root, &display);
        }
    }

    fn walk(&mut self, dir: &Path, display: &str) {
        let prefix = if display == "." { "" } else { display };
        let entries = match fs::read_dir(dir) {
            Ok(entries) => entries,
            Err(_) => return self.announce("cannot open", display),
        };
        for entry in entries {
            let entry = match entry {
                Ok(entry) => entry,
                Err(_) => return self.announce("cannot open", display),
            };
            let raw = entry.file_name();
            let kind = match entry.file_type() {
                Ok(kind) => kind,
                Err(_) => {
                    let child = join(prefix, &raw.to_string_lossy());
                    self.announce("cannot open", &child);
                    continue;
                }
            };
            if kind.is_symlink() {
                continue;
            }
            let name = match raw.to_str() {
                Some(name) => name,
                None => {
                    let child = join(prefix, &raw.to_string_lossy());
                    self.announce("cannot open", &child);
                    continue;
                }
            };
            let child = join(prefix, name);
            if kind.is_dir() {
                if self.commands.recurse && !self.skips.iter().any(|skip| same_name(skip, name)) {
                    self.walk(&entry.path(), &child);
                }
            } else if kind.is_file() {
                if self.selected(name) {
                    match entry.metadata() {
                        Ok(info) => self.examine(&entry.path(), &child, &info),
                        Err(_) => self.announce("cannot open", &child),
                    }
                }
            } else {
                self.announce("cannot open", &child);
            }
        }
    }

    fn examine(&mut self, path: &Path, display: &str, info: &Metadata) {
        if info.len() > SIZE_LIMIT {
            return self.announce("too large", display);
        }
        if self.path_line_only {
            if info.len() > 0 {
                self.out.output(display);
            }
            return;
        }
        let bytes = match fs::read(path) {
            Ok(bytes) => bytes,
            Err(_) => return self.announce("cannot open", display),
        };
        if bytes.contains(&0) {
            return self.file_announcement("skipped", display);
        }
        let text = match std::str::from_utf8(&bytes) {
            Ok(text) => text,
            Err(_) => return self.file_announcement("skipped", display),
        };
        let text = text.strip_prefix('\u{FEFF}').unwrap_or(text);

        let details = self.commands.line_numbers || self.commands.matched_line;
        let mut path_written = false;
        for (number, line) in Lines::over(text).enumerate() {
            if !self.expression.is_match(line) {
                continue;
            }
            if !path_written {
                self.out.output(display);
                path_written = true;
            }
            if !details {
                return;
            }
            let detail = self.detail(number + 1, line);
            self.out.output(&detail);
        }
        if !path_written {
            self.file_announcement("searched", display);
        }
    }

    fn detail(&self, number: usize, line: &str) -> String {
        let mut text = String::from("  ");
        if self.commands.line_numbers {
            text.push_str(&number.to_string());
            if self.commands.matched_line {
                text.push_str(" - ");
            }
        }
        if self.commands.matched_line {
            text.push_str(line);
        }
        text
    }

    fn selected(&self, name: &str) -> bool {
        if self.commands.extensions.is_empty() {
            return true;
        }
        match name.rfind('.') {
            None => false,
            Some(dot) => {
                let extension = &name[dot + 1..];
                self.commands.extensions.iter().any(|candidate| same_name(candidate, extension))
            }
        }
    }

    fn announce(&mut self, kind: &str, path: &str) {
        self.out.output(&format!("{kind} {path}"));
    }

    fn file_announcement(&mut self, kind: &str, path: &str) {
        if !self.commands.suppress_on_no_match {
            self.announce(kind, path);
        }
    }
}

/// Spec_TextFinder.md section 3.4: every path is rendered with `/` on every platform.
fn normalize(text: &str) -> String {
    text.replace('\\', "/")
}

fn join(prefix: &str, name: &str) -> String {
    if prefix.is_empty() {
        String::from(name)
    } else if prefix.ends_with('/') {
        format!("{prefix}{name}")
    } else {
        format!("{prefix}/{name}")
    }
}

fn basename(display: &str) -> &str {
    display.rsplit('/').next().unwrap_or(display)
}

#[cfg(windows)]
fn same_name(left: &str, right: &str) -> bool {
    left.eq_ignore_ascii_case(right)
}

#[cfg(not(windows))]
fn same_name(left: &str, right: &str) -> bool {
    left == right
}

/// Line splitting per Spec_TextFinder.md section 3.3: LF, CRLF, and bare CR terminate
/// a line, and a final unterminated run is a line. `str::lines` does neither.
struct Lines<'t> {
    rest: Option<&'t str>,
}

impl<'t> Lines<'t> {
    fn over(text: &'t str) -> Self {
        Lines { rest: if text.is_empty() { None } else { Some(text) } }
    }
}

impl<'t> Iterator for Lines<'t> {
    type Item = &'t str;

    fn next(&mut self) -> Option<&'t str> {
        let rest = self.rest?;
        match rest.find(|c| c == '\r' || c == '\n') {
            None => {
                self.rest = None;
                Some(rest)
            }
            Some(at) => {
                let (line, tail) = rest.split_at(at);
                let consumed = if tail.starts_with("\r\n") { 2 } else { 1 };
                let remainder = &tail[consumed..];
                self.rest = if remainder.is_empty() { None } else { Some(remainder) };
                Some(line)
            }
        }
    }
}
