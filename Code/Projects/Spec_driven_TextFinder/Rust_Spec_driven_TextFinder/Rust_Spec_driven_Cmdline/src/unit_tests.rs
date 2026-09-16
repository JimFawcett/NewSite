//! Unit suite for rust_textfinder_cmdline, exercising Spec_Rust_TextFinder_Cmdline.md.

use super::*;

fn args(items: &[&str]) -> Vec<String> {
    let mut all = vec![String::from("rust_textfinder")];
    all.extend(items.iter().map(|s| String::from(*s)));
    all
}

fn parsed(items: &[&str]) -> ProgramCommands {
    match parse(&args(items)) {
        Ok(commands) => commands,
        Err(diag) => panic!("expected success, got diagnostic:\n{diag}"),
    }
}

fn reason(items: &[&str]) -> String {
    match parse(&args(items)) {
        Ok(_) => panic!("expected a diagnostic, parse succeeded"),
        Err(diag) => diag.lines().next().unwrap_or("").to_string(),
    }
}

// --- defaults, section 4 ---

#[test]
fn empty_command_line_yields_the_defaults() {
    let commands = parsed(&[]);
    let defaults = ProgramCommands::default();
    assert_eq!(commands.root_paths, defaults.root_paths);
    assert_eq!(commands.root_paths, vec![String::from(".")]);
    assert!(commands.extensions.is_empty());
    assert_eq!(commands.regex_text, ".");
    assert!(commands.recurse);
    assert!(commands.suppress_on_no_match);
    assert!(!commands.verbose);
    assert!(!commands.help);
    assert!(!commands.line_numbers);
    assert!(!commands.matched_line);
}

// --- switch syntax, section 5 rules 1-3 ---

#[test]
fn both_introducers_are_equivalent() {
    assert!(!parsed(&["/s", "false"]).recurse);
    assert!(!parsed(&["-s", "false"]).recurse);
}

#[test]
fn booleans_are_matched_case_insensitively() {
    assert!(parsed(&["/n", "TRUE"]).line_numbers);
    assert!(parsed(&["/n", "True"]).line_numbers);
    assert!(!parsed(&["/h", "FALSE"]).suppress_on_no_match);
}

#[test]
fn switch_letters_are_case_sensitive() {
    assert!(parsed(&["/H", "true"]).help);
    assert!(parsed(&["/H", "true"]).suppress_on_no_match);
    assert!(!parsed(&["/h", "false"]).help);
    assert!(!parsed(&["/h", "false"]).suppress_on_no_match);
}

#[test]
fn an_argument_is_consumed_verbatim_even_when_it_looks_like_a_switch() {
    let commands = parsed(&["/r", "-P"]);
    assert_eq!(commands.regex_text, "-P");
}

#[test]
fn program_name_is_not_inspected() {
    let mut given = vec![String::from("/s")];
    given.push(String::from("/n"));
    given.push(String::from("true"));
    let commands = parse(&given).expect("args[0] must be skipped");
    assert!(commands.line_numbers);
}

// --- accumulation, section 5 rule 4 ---

#[test]
fn repeated_root_paths_accumulate_in_order() {
    let commands = parsed(&["/P", "src", "/P", "docs", "/P", "."]);
    assert_eq!(commands.root_paths, vec!["src", "docs", "."]);
}

#[test]
fn first_root_path_replaces_the_default_even_when_equal_to_it() {
    let commands = parsed(&["/P", ".", "/P", "src"]);
    assert_eq!(commands.root_paths, vec![".", "src"]);
}

#[test]
fn last_occurrence_wins_for_every_other_switch() {
    let commands = parsed(&["/r", "first", "/r", "second", "/s", "true", "/s", "false"]);
    assert_eq!(commands.regex_text, "second");
    assert!(!commands.recurse);
}

// --- diagnostics, section 6 ---

#[test]
fn a_token_without_an_introducer_is_not_a_switch() {
    assert_eq!(reason(&["P", "src"]), "not a switch: P");
    assert_eq!(reason(&[""]), "not a switch: ");
}

#[test]
fn an_undefined_introducer_led_token_is_unrecognized() {
    assert_eq!(reason(&["/x", "1"]), "unrecognized switch: /x");
    assert_eq!(reason(&["/"]), "unrecognized switch: /");
    assert_eq!(reason(&["-"]), "unrecognized switch: -");
    assert_eq!(reason(&["/PP", "src"]), "unrecognized switch: /PP");
}

#[test]
fn a_trailing_switch_is_missing_its_argument() {
    assert_eq!(reason(&["/P"]), "missing argument for switch: /P");
    assert_eq!(reason(&["/s", "true", "-n"]), "missing argument for switch: -n");
}

#[test]
fn a_boolean_switch_rejects_any_other_value() {
    assert_eq!(reason(&["/s", "yes"]), "invalid boolean for /s: yes");
    assert_eq!(reason(&["-L", "1"]), "invalid boolean for -L: 1");
}

#[test]
fn empty_arguments_are_rejected_for_root_path_and_expression() {
    assert_eq!(reason(&["/P", ""]), "empty root path for switch: /P");
    assert_eq!(reason(&["-r", ""]), "empty expression for switch: -r");
}

#[test]
fn every_diagnostic_ends_with_the_usage_line() {
    let diag = parse(&args(&["/x", "1"])).expect_err("must fail");
    assert_eq!(diag, format!("unrecognized switch: /x\n{}", usage_line()));
    assert!(diag.ends_with('\n'));
}

#[test]
fn parsing_stops_at_the_first_violation() {
    assert_eq!(reason(&["/s", "maybe", "/x", "1"]), "invalid boolean for /s: maybe");
}

// --- extension normalization, section 7 ---

#[test]
fn extensions_are_split_trimmed_and_stripped_of_one_dot() {
    let commands = parsed(&["/p", " cpp, .rs ,h"]);
    assert_eq!(commands.extensions, vec!["cpp", "rs", "h"]);
}

#[test]
fn empty_extension_items_are_discarded() {
    assert_eq!(parsed(&["/p", "cpp,,rs"]).extensions, parsed(&["/p", "cpp, rs"]).extensions);
    assert!(parsed(&["/p", ""]).extensions.is_empty());
    assert!(parsed(&["/p", " , . , "]).extensions.is_empty());
}

#[test]
fn only_one_leading_dot_is_stripped() {
    assert_eq!(parsed(&["/p", "..cpp"]).extensions, vec![".cpp"]);
}

#[test]
fn the_six_named_characters_are_trimmed_and_no_others() {
    let commands = parsed(&["/p", " \t\n\u{000B}\u{000C}\rcpp \t\r, \u{00A0}rs"]);
    assert_eq!(commands.extensions, vec!["cpp", "\u{00A0}rs"]);
}

#[test]
fn duplicate_extensions_are_retained_and_order_preserved() {
    assert_eq!(parsed(&["/p", "rs, cpp, rs"]).extensions, vec!["rs", "cpp", "rs"]);
}

#[test]
fn extension_case_is_not_folded_by_the_parser() {
    assert_eq!(parsed(&["/p", "CPP"]).extensions, vec!["CPP"]);
}

// --- help text and option listing, section 8 ---

#[test]
fn usage_line_is_the_first_line_of_the_help_text() {
    let help = help_text();
    assert!(help.starts_with(&usage_line()));
    assert_eq!(help.lines().next(), usage_line().lines().next());
    assert!(usage_line().starts_with("usage: rust_textfinder [/P path]"));
    assert!(usage_line().ends_with("[/n bool] [/L bool]\n"));
}

#[test]
fn help_text_carries_every_switch_and_ends_with_a_newline() {
    let help = help_text();
    for switch in ["/P", "/p", "/r", "/s", "/h", "/v", "/H", "/n", "/L"] {
        assert!(help.contains(&format!("\n  {switch}  ")), "help omits {switch}");
    }
    assert!(help.ends_with("searching.\n"));
}

#[test]
fn option_listing_of_a_bare_v_true_command_line() {
    let commands = parsed(&["-v", "true"]);
    assert_eq!(
        options_text(&commands),
        "/P .\n/p\n/r .\n/s true\n/h true\n/v true\n/H false\n/n false\n/L false\n"
    );
}

#[test]
fn option_listing_of_the_defaults_reads_v_false() {
    assert_eq!(
        options_text(&ProgramCommands::default()),
        "/P .\n/p\n/r .\n/s true\n/h true\n/v false\n/H false\n/n false\n/L false\n"
    );
}

#[test]
fn option_listing_emits_one_line_per_root_and_a_joined_extension_list() {
    let commands = parsed(&["/P", "src", "/P", "docs", "/p", ".rs, cpp", "/r", "int\\s+main"]);
    let text = options_text(&commands);
    assert!(text.starts_with("/P src\n/P docs\n/p rs, cpp\n/r int\\s+main\n"));
}

#[test]
fn no_line_of_the_option_listing_ends_in_whitespace() {
    let commands = parsed(&["/p", ""]);
    for line in options_text(&commands).lines() {
        assert!(!line.ends_with(' '), "trailing space on: {line:?}");
    }
    assert!(options_text(&commands).contains("\n/p\n"));
}

#[test]
fn every_returned_string_ends_with_a_newline() {
    assert!(usage_line().ends_with('\n'));
    assert!(help_text().ends_with('\n'));
    assert!(options_text(&ProgramCommands::default()).ends_with('\n'));
}
