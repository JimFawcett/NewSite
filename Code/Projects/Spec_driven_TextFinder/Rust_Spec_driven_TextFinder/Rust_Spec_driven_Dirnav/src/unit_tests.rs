//! Unit suite for rust_textfinder_dirnav, exercising Spec_Rust_TextFinder_Dirnav.md.

use super::*;
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering};

struct Recorder {
    lines: Vec<String>,
}

impl Output for Recorder {
    fn output(&mut self, text: &str) {
        self.lines.push(String::from(text));
    }
}

struct TempTree {
    root: PathBuf,
}

impl TempTree {
    fn new(tag: &str) -> TempTree {
        static COUNTER: AtomicUsize = AtomicUsize::new(0);
        let unique = COUNTER.fetch_add(1, Ordering::SeqCst);
        let root = std::env::temp_dir()
            .join(format!("rust_textfinder_dirnav_{tag}_{}_{unique}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(&root).expect("temp tree must be creatable");
        TempTree { root }
    }

    fn dir(&self, relative: &str) -> PathBuf {
        let path = self.root.join(relative);
        fs::create_dir_all(&path).expect("directory must be creatable");
        path
    }

    fn file(&self, relative: &str, bytes: &[u8]) -> PathBuf {
        let path = self.root.join(relative);
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).expect("parent must be creatable");
        }
        fs::write(&path, bytes).expect("file must be writable");
        path
    }

    fn display(&self) -> String {
        normalize(&self.root.to_string_lossy())
    }
}

impl Drop for TempTree {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.root);
    }
}

fn no_skips() -> SkipList {
    SkipList::new()
}

fn run(root: &Path, commands: &ProgramCommands, skips: &SkipList) -> Vec<String> {
    let mut recorder = Recorder { lines: Vec::new() };
    {
        let mut navigator =
            Dirnav::new(&mut recorder, skips, commands).expect("expression must compile");
        navigator.search(root);
    }
    recorder.lines
}

/// Section 8.1: the summary line alone, from a run over the given roots. One navigator
/// serves them all, as rust_textfinder_entry uses it, so the counts accumulate.
fn summary_of(roots: &[PathBuf], commands: &ProgramCommands, skips: &SkipList) -> String {
    let mut recorder = Recorder { lines: Vec::new() };
    {
        let mut navigator =
            Dirnav::new(&mut recorder, skips, commands).expect("expression must compile");
        for root in roots {
            navigator.search(root);
        }
        navigator.emit_run_summary();
    }
    recorder.lines.pop().expect("the summary is always written")
}

fn sorted(mut lines: Vec<String>) -> Vec<String> {
    lines.sort();
    lines
}

fn relative(tree: &TempTree, lines: Vec<String>) -> Vec<String> {
    let prefix = format!("{}/", tree.display());
    lines.into_iter().map(|line| line.replace(&prefix, "")).collect()
}

// --- construction, section 4 ---

#[test]
fn a_malformed_expression_is_returned_rather_than_panicking() {
    let mut recorder = Recorder { lines: Vec::new() };
    let skips = no_skips();
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("a(b");
    assert!(Dirnav::new(&mut recorder, &skips, &commands).is_err());
}

#[test]
fn one_navigator_serves_every_root_path() {
    let tree = TempTree::new("multiroot");
    tree.file("one/alpha.txt", b"alpha\n");
    tree.file("two/beta.txt", b"beta\n");
    let commands = ProgramCommands::default();
    let skips = no_skips();
    let mut recorder = Recorder { lines: Vec::new() };
    {
        let mut navigator = Dirnav::new(&mut recorder, &skips, &commands).expect("compiles");
        navigator.search(&tree.root.join("one"));
        navigator.search(&tree.root.join("two"));
    }
    assert_eq!(
        relative(&tree, recorder.lines),
        vec!["one/alpha.txt", "two/beta.txt"]
    );
}

// --- the no-content case, section 7 ---

#[test]
fn default_command_line_reports_every_nonempty_file_without_opening_it() {
    let tree = TempTree::new("nocontent");
    tree.file("text.txt", b"anything\n");
    tree.file("binary.bin", &[0u8, 1, 2, 3]);
    tree.file("empty.txt", b"");
    let mut commands = ProgramCommands::default();
    commands.suppress_on_no_match = false;
    let lines = sorted(relative(&tree, run(&tree.root, &commands, &no_skips())));
    assert_eq!(lines, vec!["binary.bin", "text.txt"]);
}

// --- admission tests, section 7 ---

#[test]
fn a_file_above_the_size_limit_is_never_read() {
    let tree = TempTree::new("toolarge");
    let oversized = vec![b'x'; (SIZE_LIMIT + 1) as usize];
    tree.file("big.txt", &oversized);
    tree.file("small.txt", &vec![b'x'; 16]);
    let commands = ProgramCommands::default();
    let lines = sorted(relative(&tree, run(&tree.root, &commands, &no_skips())));
    assert_eq!(lines, vec!["small.txt", "too large big.txt"]);
}

#[test]
fn a_file_holding_a_nul_byte_or_invalid_utf8_is_skipped() {
    let tree = TempTree::new("content");
    tree.file("nul.txt", b"alpha\x00beta\n");
    tree.file("latin1.txt", &[0xC3, 0x28, b'\n']);
    tree.file("good.txt", b"alpha\n");
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("alpha");
    commands.suppress_on_no_match = false;
    let lines = sorted(relative(&tree, run(&tree.root, &commands, &no_skips())));
    assert_eq!(lines, vec!["good.txt", "skipped latin1.txt", "skipped nul.txt"]);
}

#[test]
fn a_skipped_file_is_silent_under_the_default_h() {
    let tree = TempTree::new("hidden");
    tree.file("nul.txt", b"alpha\x00beta\n");
    tree.file("plain.txt", b"gamma\n");
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("alpha");
    assert!(run(&tree.root, &commands, &no_skips()).is_empty());
}

#[test]
fn a_searched_file_that_matched_nothing_is_announced_only_under_h_false() {
    let tree = TempTree::new("searched");
    tree.file("plain.txt", b"gamma\n");
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("alpha");
    assert!(run(&tree.root, &commands, &no_skips()).is_empty());
    commands.suppress_on_no_match = false;
    assert_eq!(relative(&tree, run(&tree.root, &commands, &no_skips())), vec!["searched plain.txt"]);
}

#[test]
fn a_leading_bom_does_not_belong_to_the_first_line() {
    let tree = TempTree::new("bom");
    tree.file("bom.txt", "\u{FEFF}alpha\nbeta\n".as_bytes());
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("^alpha$");
    commands.matched_line = true;
    let lines = relative(&tree, run(&tree.root, &commands, &no_skips()));
    assert_eq!(lines, vec!["bom.txt", "  alpha"]);
}

// --- line splitting, section 7 ---

#[test]
fn lf_crlf_and_bare_cr_each_terminate_a_line() {
    let tree = TempTree::new("terminators");
    tree.file("mixed.txt", b"one\r\ntwo\rthree\nfour");
    let mut commands = ProgramCommands::default();
    commands.line_numbers = true;
    commands.matched_line = true;
    let lines = relative(&tree, run(&tree.root, &commands, &no_skips()));
    assert_eq!(
        lines,
        vec!["mixed.txt", "  1 - one", "  2 - two", "  3 - three", "  4 - four"]
    );
}

#[test]
fn line_numbers_count_lines_that_did_not_match() {
    let tree = TempTree::new("numbering");
    tree.file("counted.txt", b"no\nyes\nno\nyes\n");
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("yes");
    commands.line_numbers = true;
    let lines = relative(&tree, run(&tree.root, &commands, &no_skips()));
    assert_eq!(lines, vec!["counted.txt", "  2", "  4"]);
}

// --- block form, section 8 ---

#[test]
fn a_block_writes_its_path_once_however_many_lines_match() {
    let tree = TempTree::new("blockform");
    tree.file("many.txt", b"hit\nhit\nhit\n");
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("hit");
    commands.matched_line = true;
    let lines = relative(&tree, run(&tree.root, &commands, &no_skips()));
    assert_eq!(lines, vec!["many.txt", "  hit", "  hit", "  hit"]);
}

#[test]
fn evaluation_stops_at_the_first_match_when_neither_n_nor_l_is_set() {
    let tree = TempTree::new("firstmatch");
    tree.file("many.txt", b"hit\nhit\nhit\n");
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("hit");
    let lines = relative(&tree, run(&tree.root, &commands, &no_skips()));
    assert_eq!(lines, vec!["many.txt"]);
}

#[test]
fn a_detail_line_carries_only_the_fields_n_and_l_select() {
    let tree = TempTree::new("details");
    tree.file("one.txt", b"first\nalpha\n");
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("alpha");

    commands.line_numbers = true;
    commands.matched_line = false;
    assert_eq!(relative(&tree, run(&tree.root, &commands, &no_skips()))[1], "  2");

    commands.line_numbers = false;
    commands.matched_line = true;
    assert_eq!(relative(&tree, run(&tree.root, &commands, &no_skips()))[1], "  alpha");

    commands.line_numbers = true;
    commands.matched_line = true;
    assert_eq!(relative(&tree, run(&tree.root, &commands, &no_skips()))[1], "  2 - alpha");
}

#[test]
fn a_matching_line_yields_one_detail_line_however_many_occurrences_it_holds() {
    let tree = TempTree::new("occurrences");
    tree.file("one.txt", b"a a a a\n");
    let mut commands = ProgramCommands::default();
    commands.regex_text = String::from("a");
    commands.matched_line = true;
    let lines = relative(&tree, run(&tree.root, &commands, &no_skips()));
    assert_eq!(lines, vec!["one.txt", "  a a a a"]);
}

// --- path rendering, section 8 ---

#[test]
fn every_path_begins_with_the_root_and_uses_forward_separators() {
    let tree = TempTree::new("paths");
    tree.file("sub/deeper/leaf.txt", b"alpha\n");
    let commands = ProgramCommands::default();
    let lines = run(&tree.root, &commands, &no_skips());
    assert_eq!(lines.len(), 1);
    assert!(!lines[0].contains('\\'), "separator not normalized: {}", lines[0]);
    assert!(lines[0].starts_with(&tree.display()));
    assert!(lines[0].ends_with("/sub/deeper/leaf.txt"));
}

// --- selection, section 6 ---

#[test]
fn a_non_empty_extension_list_selects_by_last_dot_suffix() {
    let tree = TempTree::new("extensions");
    tree.file("a.rs", b"alpha\n");
    tree.file("b.txt", b"alpha\n");
    tree.file("c.tar.rs", b"alpha\n");
    tree.file("noext", b"alpha\n");
    tree.file(".gitignore", b"alpha\n");
    let mut commands = ProgramCommands::default();
    commands.extensions = vec![String::from("rs"), String::from("gitignore")];
    let lines = sorted(relative(&tree, run(&tree.root, &commands, &no_skips())));
    assert_eq!(lines, vec![".gitignore", "a.rs", "c.tar.rs"]);
}

#[test]
fn an_empty_extension_list_selects_every_file() {
    let tree = TempTree::new("allfiles");
    tree.file("a.rs", b"alpha\n");
    tree.file("noext", b"alpha\n");
    let commands = ProgramCommands::default();
    let lines = sorted(relative(&tree, run(&tree.root, &commands, &no_skips())));
    assert_eq!(lines, vec!["a.rs", "noext"]);
}

#[test]
fn a_root_path_that_is_a_regular_file_is_searched_and_filtered_like_any_other() {
    let tree = TempTree::new("rootfile");
    let file = tree.file("solo.txt", b"alpha\n");
    let mut commands = ProgramCommands::default();
    assert_eq!(run(&file, &commands, &no_skips()).len(), 1);
    commands.extensions = vec![String::from("rs")];
    assert!(run(&file, &commands, &no_skips()).is_empty());
}

// --- traversal, section 5 ---

#[test]
fn a_skip_list_directory_is_pruned_silently() {
    let tree = TempTree::new("skips");
    tree.file("keep.txt", b"alpha\n");
    tree.file("target/hidden.txt", b"alpha\n");
    tree.file("target/deeper/hidden.txt", b"alpha\n");
    let commands = ProgramCommands::default();
    let skips = vec![String::from("target")];
    let lines = relative(&tree, run(&tree.root, &commands, &skips));
    assert_eq!(lines, vec!["keep.txt"]);
}

#[test]
fn a_root_named_in_the_skip_list_is_traversed_and_pruning_resumes_below_it() {
    let tree = TempTree::new("skiproot");
    let root = tree.dir("build");
    tree.file("build/kept.txt", b"alpha\n");
    tree.file("build/build/pruned.txt", b"alpha\n");
    let commands = ProgramCommands::default();
    let skips = vec![String::from("build")];
    let lines = run(&root, &commands, &skips);
    assert_eq!(lines.len(), 1);
    assert!(lines[0].ends_with("build/kept.txt"));
}

#[test]
fn recursion_off_searches_the_root_directory_alone() {
    let tree = TempTree::new("norecurse");
    tree.file("top.txt", b"alpha\n");
    tree.file("sub/under.txt", b"alpha\n");
    let mut commands = ProgramCommands::default();
    commands.recurse = false;
    let lines = relative(&tree, run(&tree.root, &commands, &no_skips()));
    assert_eq!(lines, vec!["top.txt"]);
}

#[test]
fn a_root_path_that_cannot_be_opened_is_announced() {
    let tree = TempTree::new("missing");
    let absent = tree.root.join("no_such_directory");
    let commands = ProgramCommands::default();
    let lines = run(&absent, &commands, &no_skips());
    assert_eq!(lines.len(), 1);
    assert!(lines[0].starts_with("cannot open "));
    assert!(lines[0].ends_with("/no_such_directory"));
}

#[test]
fn an_error_announcement_is_not_gated_on_h() {
    let tree = TempTree::new("errorgate");
    let absent = tree.root.join("no_such_directory");
    let commands = ProgramCommands::default();
    assert!(commands.suppress_on_no_match);
    assert_eq!(run(&absent, &commands, &no_skips()).len(), 1);
}

// --- the run summary, section 8.1 ---

fn summary_tree() -> TempTree {
    let tree = TempTree::new("summary");
    tree.file("a.rs", b"alpha\n");
    tree.file("notes.txt", b"alpha\n");
    tree.file("sub/b.rs", b"alpha\n");
    tree.file("target/pruned.rs", b"alpha\n");
    tree
}

#[test]
fn every_examined_file_and_every_entered_directory_is_counted() {
    let tree = summary_tree();
    let commands = ProgramCommands::default();
    let skips: SkipList = vec![String::from("target")];
    assert_eq!(
        summary_of(&[tree.root.clone()], &commands, &skips),
        "accessed 3 files, 2 directories"
    );
}

#[test]
fn a_file_the_extension_list_excluded_is_not_counted() {
    let tree = summary_tree();
    let mut commands = ProgramCommands::default();
    commands.extensions = vec![String::from("rs")];
    let skips: SkipList = vec![String::from("target")];
    assert_eq!(
        summary_of(&[tree.root.clone()], &commands, &skips),
        "accessed 2 files, 2 directories"
    );
}

#[test]
fn a_pruned_directory_is_counted_as_neither() {
    let tree = summary_tree();
    let commands = ProgramCommands::default();
    assert_eq!(
        summary_of(&[tree.root.clone()], &commands, &no_skips()),
        "accessed 4 files, 3 directories"
    );
}

#[test]
fn under_recursion_off_no_subdirectory_is_counted() {
    let tree = summary_tree();
    let mut commands = ProgramCommands::default();
    commands.recurse = false;
    assert_eq!(
        summary_of(&[tree.root.clone()], &commands, &no_skips()),
        "accessed 2 files, 1 directories"
    );
}

#[test]
fn a_root_that_is_a_regular_file_counts_as_a_file_and_neither_noun_inflects() {
    let tree = summary_tree();
    let commands = ProgramCommands::default();
    assert_eq!(
        summary_of(&[tree.root.join("a.rs")], &commands, &no_skips()),
        "accessed 1 files, 0 directories"
    );
}

#[test]
fn a_root_that_cannot_be_opened_is_counted_as_neither() {
    let tree = summary_tree();
    let commands = ProgramCommands::default();
    assert_eq!(
        summary_of(&[tree.root.join("no_such_directory")], &commands, &no_skips()),
        "accessed 0 files, 0 directories"
    );
}

#[test]
fn the_counts_are_of_the_whole_run_and_an_entry_under_two_roots_counts_twice() {
    let tree = summary_tree();
    let commands = ProgramCommands::default();
    let sub = tree.root.join("sub");
    assert_eq!(
        summary_of(&[sub.clone(), tree.root.join("a.rs")], &commands, &no_skips()),
        "accessed 2 files, 1 directories"
    );
    assert_eq!(
        summary_of(&[sub.clone(), sub.clone()], &commands, &no_skips()),
        "accessed 2 files, 2 directories"
    );
}

#[test]
fn the_summary_is_not_gated_on_h() {
    let tree = summary_tree();
    let mut loud = ProgramCommands::default();
    loud.suppress_on_no_match = false;
    let quiet = ProgramCommands::default();
    assert_eq!(
        summary_of(&[tree.root.clone()], &loud, &no_skips()),
        summary_of(&[tree.root.clone()], &quiet, &no_skips())
    );
}

// --- helpers ---

#[test]
fn line_iteration_treats_a_final_unterminated_run_as_a_line() {
    assert_eq!(Lines::over("").collect::<Vec<_>>(), Vec::<&str>::new());
    assert_eq!(Lines::over("\n").collect::<Vec<_>>(), vec![""]);
    assert_eq!(Lines::over("a").collect::<Vec<_>>(), vec!["a"]);
    assert_eq!(Lines::over("a\n\nb").collect::<Vec<_>>(), vec!["a", "", "b"]);
    assert_eq!(Lines::over("a\r\n\rb\n").collect::<Vec<_>>(), vec!["a", "", "b"]);
}

#[test]
fn path_joining_never_doubles_a_separator() {
    assert_eq!(join("", "file.rs"), "file.rs");
    assert_eq!(join("src", "file.rs"), "src/file.rs");
    assert_eq!(join("src/", "file.rs"), "src/file.rs");
    assert_eq!(join("/", "file.rs"), "/file.rs");
    assert_eq!(normalize("src\\sub"), "src/sub");
    assert_eq!(basename("src/sub/file.rs"), "file.rs");
    assert_eq!(basename("file.rs"), "file.rs");
}
