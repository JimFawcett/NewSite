//! Integration suite for the TextFinder binary, per Spec_TextFinder.md section 6.2.
//! It drives the built executable end to end: startup sequence, exit codes, and stream routing,
//! which no unit suite reaches. Expected stdout is compared byte for byte.

use rust_textfinder_cmdline::{help_text, usage_line};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicUsize, Ordering};

const EXECUTABLE: &str = env!("CARGO_BIN_EXE_rust_textfinder");

struct Run {
    stdout: String,
    stderr: String,
    code: i32,
}

impl Run {
    fn lines(&self) -> Vec<&str> {
        if self.stdout.is_empty() {
            Vec::new()
        } else {
            self.stdout.trim_end_matches('\n').split('\n').collect()
        }
    }

    fn sorted(&self) -> Vec<String> {
        let mut lines: Vec<String> = self.lines().iter().map(|line| String::from(*line)).collect();
        lines.sort();
        lines
    }
}

fn run_in(directory: &Path, args: &[&str]) -> Run {
    let output = Command::new(EXECUTABLE)
        .args(args)
        .current_dir(directory)
        .output()
        .expect("the built executable must be runnable");
    Run {
        stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
        stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
        code: output.status.code().unwrap_or(-1),
    }
}

fn run(args: &[&str]) -> Run {
    run_in(&std::env::temp_dir(), args)
}

struct TempTree {
    root: PathBuf,
}

impl TempTree {
    fn new(tag: &str) -> TempTree {
        static COUNTER: AtomicUsize = AtomicUsize::new(0);
        let unique = COUNTER.fetch_add(1, Ordering::SeqCst);
        let root = std::env::temp_dir()
            .join(format!("rust_textfinder_integration_{tag}_{}_{unique}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).expect("temp tree must be creatable");
        TempTree { root }
    }

    fn file(&self, relative: &str, bytes: &[u8]) -> PathBuf {
        let path = self.root.join(relative);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).expect("parent must be creatable");
        }
        fs::write(&path, bytes).expect("file must be writable");
        path
    }
}

impl Drop for TempTree {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.root);
    }
}

const DEFAULT_LISTING: &str = "/P .\n/p\n/r .\n/s true\n/h true\n/v false\n/H false\n/n false\n/L false\n";

// --- startup sequence, section 4 ---

#[test]
fn a_bare_command_line_lists_the_resolved_options_and_exits_zero() {
    let tree = TempTree::new("bare");
    tree.file("ignored.txt", b"nothing is searched\n");
    let result = run_in(&tree.root, &[]);
    assert_eq!(result.stdout, DEFAULT_LISTING);
    assert!(result.stderr.is_empty());
    assert_eq!(result.code, 0);
}

#[test]
fn help_prints_the_specified_text_to_stdout_and_exits_zero() {
    let result = run(&["/H", "true"]);
    assert_eq!(result.stdout, help_text());
    assert!(result.stdout.starts_with("usage: rust_textfinder ["));
    assert!(result.stdout.ends_with("searching.\n"));
    assert!(result.stderr.is_empty());
    assert_eq!(result.code, 0);
}

#[test]
fn help_is_taken_before_any_traversal() {
    let tree = TempTree::new("helpfirst");
    tree.file("a.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/H", "true", "/P", "."]);
    assert_eq!(result.stdout, help_text());
    assert_eq!(result.code, 0);
}

#[test]
fn verbose_lists_the_options_ahead_of_the_search_output() {
    let tree = TempTree::new("verbose");
    tree.file("a.txt", b"alpha\n");
    let result = run_in(&tree.root, &["-v", "true"]);
    assert!(result.stdout.starts_with(
        "/P .\n/p\n/r .\n/s true\n/h true\n/v true\n/H false\n/n false\n/L false\n"
    ));
    assert_eq!(result.lines().last(), Some(&"a.txt"));
    assert_eq!(result.code, 0);
}

// --- usage diagnostics, sections 5.2 and 6 ---

fn expect_usage_failure(args: &[&str], reason: &str) {
    let result = run(args);
    assert_eq!(result.stdout, "", "stdout must stay empty for {args:?}");
    assert_eq!(result.stderr, format!("{reason}\n{}", usage_line()));
    assert_eq!(result.code, 1);
}

#[test]
fn every_parse_failure_reaches_stderr_with_exit_code_one() {
    expect_usage_failure(&["P", "."], "not a switch: P");
    expect_usage_failure(&["/x", "1"], "unrecognized switch: /x");
    expect_usage_failure(&["/P"], "missing argument for switch: /P");
    expect_usage_failure(&["-s", "yes"], "invalid boolean for -s: yes");
    expect_usage_failure(&["/P", ""], "empty root path for switch: /P");
    expect_usage_failure(&["/r", ""], "empty expression for switch: /r");
}

#[test]
fn a_malformed_expression_prints_the_listing_to_stdout_then_the_diagnostic() {
    let result = run(&["/r", "a(b"]);
    assert_eq!(result.stdout, "/P .\n/p\n/r a(b\n/s true\n/h true\n/v false\n/H false\n/n false\n/L false\n");
    assert_eq!(result.stderr, format!("invalid regex for switch: /r\n{}", usage_line()));
    assert_eq!(result.code, 1);
}

#[test]
fn a_malformed_expression_under_verbose_lists_the_options_once() {
    let result = run(&["/r", "a(b", "/v", "true"]);
    assert_eq!(result.stdout.matches("\n/r a(b\n").count(), 1);
    assert!(result.stdout.contains("/v true"));
    assert_eq!(result.code, 1);
}

// --- traversal and block form, sections 3.2 through 3.4 ---

#[test]
fn a_block_carries_its_path_once_and_its_detail_lines_beneath_it() {
    let tree = TempTree::new("block");
    tree.file("solo.txt", b"alpha\nbeta\nalpha again\n");
    let result = run_in(&tree.root, &["/P", ".", "/r", "alpha", "/n", "true", "/L", "true"]);
    assert_eq!(result.stdout, "solo.txt\n  1 - alpha\n  3 - alpha again\n");
    assert_eq!(result.code, 0);
}

#[test]
fn a_root_of_dot_contributes_no_leading_dot_slash() {
    let tree = TempTree::new("dotroot");
    tree.file("sub/leaf.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/P", "."]);
    assert_eq!(result.stdout, "sub/leaf.txt\n");
}

#[test]
fn a_named_root_is_part_of_every_path_and_separators_are_normalized() {
    let tree = TempTree::new("namedroot");
    tree.file("sub/deeper/leaf.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/P", "sub\\deeper"]);
    assert_eq!(result.stdout, "sub/deeper/leaf.txt\n");
}

#[test]
fn each_root_is_traversed_in_the_order_given() {
    let tree = TempTree::new("roots");
    tree.file("one/a.txt", b"alpha\n");
    tree.file("two/b.txt", b"alpha\n");
    let forward = run_in(&tree.root, &["/P", "one", "/P", "two"]);
    assert_eq!(forward.stdout, "one/a.txt\ntwo/b.txt\n");
    let reversed = run_in(&tree.root, &["/P", "two", "/P", "one"]);
    assert_eq!(reversed.stdout, "two/b.txt\none/a.txt\n");
}

#[test]
fn the_compiled_skip_list_prunes_a_matching_directory() {
    let tree = TempTree::new("skips");
    tree.file("kept.txt", b"alpha\n");
    tree.file("target/pruned.txt", b"alpha\n");
    tree.file("node_modules/pruned.txt", b"alpha\n");
    tree.file(".git/pruned.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/P", "."]);
    assert_eq!(result.stdout, "kept.txt\n");
}

#[test]
fn recursion_off_searches_the_root_directory_alone() {
    let tree = TempTree::new("norecurse");
    tree.file("top.txt", b"alpha\n");
    tree.file("sub/under.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/P", ".", "/s", "false"]);
    assert_eq!(result.stdout, "top.txt\n");
}

#[test]
fn the_extension_filter_selects_by_last_dot_suffix() {
    let tree = TempTree::new("extensions");
    tree.file("a.rs", b"alpha\n");
    tree.file("b.txt", b"alpha\n");
    tree.file("noext", b"alpha\n");
    let result = run_in(&tree.root, &["/P", ".", "/p", " .rs , "]);
    assert_eq!(result.stdout, "a.rs\n");
}

#[test]
fn no_path_is_ever_printed_twice() {
    let tree = TempTree::new("unique");
    tree.file("a.txt", b"alpha\nalpha\nalpha\n");
    tree.file("sub/b.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/P", ".", "/r", "alpha", "/L", "true"]);
    let paths: Vec<&str> = result.lines().into_iter().filter(|l| !l.starts_with("  ")).collect();
    assert_eq!(paths.len(), 2);
    assert_ne!(paths[0], paths[1]);
}

// --- announcements, section 3.4 ---

#[test]
fn every_examined_file_appears_exactly_once_under_h_false() {
    let tree = TempTree::new("announce");
    tree.file("hit.txt", b"alpha\n");
    tree.file("miss.txt", b"gamma\n");
    tree.file("binary.dat", b"alpha\x00\n");
    let result = run_in(&tree.root, &["/P", ".", "/r", "alpha", "/h", "false"]);
    assert_eq!(result.sorted(), vec!["hit.txt", "searched miss.txt", "skipped binary.dat"]);
    assert_eq!(result.code, 0);
}

#[test]
fn the_default_h_hides_only_the_files_that_matched_nothing() {
    let tree = TempTree::new("hide");
    tree.file("hit.txt", b"alpha\n");
    tree.file("miss.txt", b"gamma\n");
    let result = run_in(&tree.root, &["/P", ".", "/r", "alpha"]);
    assert_eq!(result.stdout, "hit.txt\n");
}

#[test]
fn an_unopenable_root_is_announced_and_leaves_the_exit_code_zero() {
    let tree = TempTree::new("missingroot");
    tree.file("a.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/P", "no_such_directory", "/P", "."]);
    assert_eq!(result.stdout, "cannot open no_such_directory\na.txt\n");
    assert!(result.stderr.is_empty());
    assert_eq!(result.code, 0);
}

#[test]
fn the_no_content_case_reports_a_binary_file_and_omits_an_empty_one() {
    let tree = TempTree::new("nocontent");
    tree.file("binary.dat", &[0u8, 1, 2]);
    tree.file("empty.txt", b"");
    tree.file("text.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/P", ".", "/h", "false"]);
    assert_eq!(result.sorted(), vec!["binary.dat", "text.txt"]);
}

// --- stream discipline, sections 3.4 and 5 ---

#[test]
fn stdout_is_terminated_with_lf_on_every_platform() {
    let tree = TempTree::new("terminators");
    tree.file("a.txt", b"alpha\n");
    let result = run_in(&tree.root, &["/P", ".", "/r", "alpha", "/L", "true", "/v", "true"]);
    assert!(!result.stdout.contains('\r'), "stdout carries a CR: {:?}", result.stdout);
    assert!(result.stdout.ends_with('\n'));
    assert!(!run(&["/H", "true"]).stdout.contains('\r'));
}

#[test]
fn a_crlf_file_yields_lines_free_of_the_carriage_return() {
    let tree = TempTree::new("crlffile");
    tree.file("dos.txt", b"alpha\r\nbeta\r\n");
    let result = run_in(&tree.root, &["/P", ".", "/r", "alpha", "/L", "true"]);
    assert_eq!(result.stdout, "dos.txt\n  alpha\n");
}
