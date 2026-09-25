//! rust_textfinder_cmdline - command-line parsing for TextFinder.
//! Implements Spec_Rust_TextFinder_Cmdline.md, the Rust binding of Spec_TextFinder.md sections 4-5.

#[cfg(test)]
mod unit_tests;

#[derive(Clone, Debug)]
pub struct ProgramCommands {
    pub root_paths: Vec<String>,    // /P
    pub extensions: Vec<String>,    // /p
    pub regex_text: String,         // /r
    pub recurse: bool,              // /s
    pub suppress_on_no_match: bool, // /h
    pub verbose: bool,              // /v
    pub help: bool,                 // /H
    pub line_numbers: bool,         // /n
    pub matched_line: bool,         // /L
}

impl Default for ProgramCommands {
    fn default() -> Self {
        ProgramCommands {
            root_paths: vec![String::from(".")],
            extensions: Vec::new(),
            regex_text: String::from("."),
            recurse: true,
            suppress_on_no_match: true,
            verbose: false,
            help: false,
            line_numbers: false,
            matched_line: false,
        }
    }
}

const EXECUTABLE: &str = "rust_textfinder";

const SWITCH_LETTERS: [char; 9] = ['P', 'p', 'r', 's', 'h', 'v', 'H', 'n', 'L'];

const HELP_BODY: &str = r#"
  /P  path (.)             root path for traversal; repeat to add more root paths
  /p  "ext, ext" ()        comma-separated bare extensions to search; empty searches every file
  /r  regex (.)            regular expression evaluated against each line
  /s  true|false (true)    recurse into subdirectories
  /h  true|false (true)    hide files that matched nothing; errors always appear
  /v  true|false (false)   list the resolved option set before traversal
  /H  true|false (false)   print this help and exit
  /n  true|false (false)   add a detail line per match, carrying the line number
  /L  true|false (false)   add a detail line per match, carrying the line text

A matching file prints its path on one line; /n and /L add indented detail
lines beneath it. A path is never printed twice. A search ends with a line
counting the files and directories it reached.

Switch introducers / and - are equivalent. Switch letters are case-sensitive,
so /h and /H differ. Every switch takes exactly one argument; there are no bare
flags. Arguments containing whitespace or commas must be quoted.

Run with no switches at all to list the resolved options and exit without
searching.
"#;

pub fn usage_line() -> String {
    format!(
        "usage: {EXECUTABLE} [/P path] [/p \"ext, ext\"] [/r regex] [/s bool] [/h bool] [/v bool] [/H bool] [/n bool] [/L bool]\n"
    )
}

pub fn help_text() -> String {
    format!("{}{}", usage_line(), HELP_BODY)
}

pub fn options_text(commands: &ProgramCommands) -> String {
    let mut text = String::new();
    for root in &commands.root_paths {
        text.push_str("/P ");
        text.push_str(root);
        text.push('\n');
    }
    if commands.extensions.is_empty() {
        text.push_str("/p\n");
    } else {
        text.push_str("/p ");
        text.push_str(&commands.extensions.join(", "));
        text.push('\n');
    }
    text.push_str("/r ");
    text.push_str(&commands.regex_text);
    text.push('\n');
    for (switch, value) in [
        ("/s", commands.recurse),
        ("/h", commands.suppress_on_no_match),
        ("/v", commands.verbose),
        ("/H", commands.help),
        ("/n", commands.line_numbers),
        ("/L", commands.matched_line),
    ] {
        text.push_str(switch);
        text.push(' ');
        text.push_str(if value { "true" } else { "false" });
        text.push('\n');
    }
    text
}

pub fn parse(args: &[String]) -> Result<ProgramCommands, String> {
    let mut commands = ProgramCommands::default();
    let mut roots_supplied = false;
    let mut index = 1;

    while index < args.len() {
        let token = args[index].as_str();
        let letter = switch_letter(token)?;
        let value = match args.get(index + 1) {
            Some(next) => next.as_str(),
            None => return Err(diagnostic(&format!("missing argument for switch: {token}"))),
        };

        match letter {
            'P' => {
                if value.is_empty() {
                    return Err(diagnostic(&format!("empty root path for switch: {token}")));
                }
                if !roots_supplied {
                    commands.root_paths.clear();
                    roots_supplied = true;
                }
                commands.root_paths.push(String::from(value));
            }
            'p' => commands.extensions = normalize_extensions(value),
            'r' => {
                if value.is_empty() {
                    return Err(diagnostic(&format!("empty expression for switch: {token}")));
                }
                commands.regex_text = String::from(value);
            }
            's' => commands.recurse = boolean(token, value)?,
            'h' => commands.suppress_on_no_match = boolean(token, value)?,
            'v' => commands.verbose = boolean(token, value)?,
            'H' => commands.help = boolean(token, value)?,
            'n' => commands.line_numbers = boolean(token, value)?,
            'L' => commands.matched_line = boolean(token, value)?,
            _ => return Err(diagnostic(&format!("unrecognized switch: {token}"))),
        }
        index += 2;
    }
    Ok(commands)
}

fn switch_letter(token: &str) -> Result<char, String> {
    let mut chars = token.chars();
    match chars.next() {
        Some('/') | Some('-') => {}
        _ => return Err(diagnostic(&format!("not a switch: {token}"))),
    }
    match (chars.next(), chars.next()) {
        (Some(letter), None) if SWITCH_LETTERS.contains(&letter) => Ok(letter),
        _ => Err(diagnostic(&format!("unrecognized switch: {token}"))),
    }
}

fn boolean(switch: &str, value: &str) -> Result<bool, String> {
    if value.eq_ignore_ascii_case("true") {
        Ok(true)
    } else if value.eq_ignore_ascii_case("false") {
        Ok(false)
    } else {
        Err(diagnostic(&format!("invalid boolean for {switch}: {value}")))
    }
}

fn diagnostic(reason: &str) -> String {
    format!("{reason}\n{}", usage_line())
}

/// The six characters Spec_TextFinder.md section 5 names, and no others.
fn is_trimmed(c: char) -> bool {
    matches!(c, ' ' | '\t' | '\n' | '\u{000B}' | '\u{000C}' | '\r')
}

fn normalize_extensions(argument: &str) -> Vec<String> {
    argument
        .split(',')
        .map(|item| item.trim_matches(is_trimmed))
        .map(|item| item.strip_prefix('.').unwrap_or(item))
        // section 5: the strip can expose whitespace the first trim could not reach, as in ". cpp"
        .map(|item| item.trim_matches(is_trimmed))
        .filter(|item| !item.is_empty())
        .map(String::from)
        .collect()
}
