//! Demonstration, per Spec_TextFinder.md section 6.2. It runs the built executable against
//! this project's own tree and shows what it produces. It asserts nothing and fails nothing;
//! its output moves as the tree changes, so a capture states the date it was taken.
//!
//! Run through run_demo.bat.

use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

const EXECUTABLE: &str = env!("CARGO_BIN_EXE_rust_textfinder");
const EXTENSIONS: &str = "md, ixx, cpp, rs";
const SHOWN: usize = 14;

fn project_root() -> PathBuf {
    // <project>/Rust_Spec_driven_TextFinder/Rust_Spec_driven_TextFinder_Entry
    let manifest = Path::new(env!("CARGO_MANIFEST_DIR"));
    match manifest.parent().and_then(Path::parent) {
        Some(root) => root.to_path_buf(),
        None => manifest.to_path_buf(),
    }
}

fn forward(path: &Path) -> String {
    path.to_string_lossy().replace('\\', "/")
}

/// The local date when run_demo.bat supplies it, the UTC civil date otherwise,
/// so that a capture dates itself however the demonstration was started.
fn today() -> String {
    if let Ok(supplied) = std::env::var("TEXTFINDER_DEMO_DATE") {
        if !supplied.is_empty() {
            return supplied;
        }
    }
    let seconds = match SystemTime::now().duration_since(UNIX_EPOCH) {
        Ok(since) => since.as_secs() as i64,
        Err(_) => 0,
    };
    let days = seconds.div_euclid(86_400) + 719_468;
    let era = days.div_euclid(146_097);
    let day_of_era = days.rem_euclid(146_097);
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let shifted = (5 * day_of_year + 2) / 153;
    let day = day_of_year - (153 * shifted + 2) / 5 + 1;
    let month = if shifted < 10 { shifted + 3 } else { shifted - 9 };
    let year = year_of_era + era * 400 + if month <= 2 { 1 } else { 0 };
    format!("{year:04}-{month:02}-{day:02}")
}

/// Restores the quotes the shell removed, so the echoed command line can be retyped.
fn quoted(argument: &str) -> String {
    if argument.contains(' ') || argument.contains(',') {
        format!("\"{argument}\"")
    } else {
        String::from(argument)
    }
}

fn case(number: usize, note: &[&str], args: &[&str]) {
    let indent = " ".repeat(number.to_string().len() + 2);
    println!("{number}. {}", note.join(&format!("\n{indent}")));
    let command: Vec<String> = args.iter().map(|argument| quoted(argument)).collect();
    println!("{}", format!("  $ rust_textfinder {}", command.join(" ")).trim_end());
    println!();

    let outcome = Command::new(EXECUTABLE).args(args).current_dir(project_root()).output();
    let outcome = match outcome {
        Ok(outcome) => outcome,
        Err(error) => {
            println!("      [the executable could not be run: {error}]\n");
            return;
        }
    };

    let stdout = String::from_utf8_lossy(&outcome.stdout).into_owned();
    let mut lines: Vec<String> = stdout.lines().map(String::from).collect();
    let emitted = lines.len();
    for line in String::from_utf8_lossy(&outcome.stderr).lines() {
        lines.push(format!("[stderr] {line}"));
    }

    for line in lines.iter().take(SHOWN) {
        if line.is_empty() {
            println!();
        } else {
            println!("      {line}");
        }
    }
    if lines.len() > SHOWN {
        println!("      ... {} more", lines.len() - SHOWN);
    }
    println!();
    println!("  {emitted} line(s), exit {}", outcome.status.code().unwrap_or(-1));
    println!();
}

#[test]
fn demonstration() {
    println!();
    println!("Rust_TextFinder demonstration");
    println!("  date:       {}", today());
    println!("  executable: {}", forward(Path::new(EXECUTABLE)));
    println!("  root:       {}", forward(&project_root()));
    println!("  extensions: \"{EXTENSIONS}\"");
    println!();

    case(
        1,
        &[
            "No switch at all. The command line names no work, so rust_textfinder lists the",
            "options a real invocation would start from and exits 0 (Spec_TextFinder.md §3.1).",
        ],
        &[],
    );

    case(
        2,
        &[
            "Default expression. The default /r of . with no /n or /L needs no file content,",
            "so each selected file is reported by its path line alone (Spec_TextFinder.md §3.3).",
        ],
        &["-P", ".", "-p", EXTENSIONS],
    );

    case(
        3,
        &[
            "The two-level block of §3.4: a path written once, then an indented detail line",
            "per match carrying the line number and the line's text.",
        ],
        &["-P", ".", "-p", EXTENSIONS, "-r", "too large", "-n", "true", "-L", "true"],
    );

    case(
        4,
        &["The same search with /L false, leaving the line number alone on each detail line."],
        &["-P", ".", "-p", EXTENSIONS, "-r", "too large", "-n", "true"],
    );

    case(
        5,
        &[
            "Which documents cite the parent specification. Neither /n nor /L, so every block",
            "is its path line and no path is written twice.",
        ],
        &["-P", ".", "-p", EXTENSIONS, "-r", "Spec_TextFinder\\.md"],
    );

    case(
        6,
        &["The same search one level deep, /s false entering no subdirectory."],
        &["-P", ".", "-p", EXTENSIONS, "-r", "Spec_TextFinder\\.md", "-s", "false"],
    );

    case(
        7,
        &[
            "/h false adds a line for each file that matched nothing - the files case 5 left",
            "silent - alongside the resolved option set from /v true.",
        ],
        &["-P", ".", "-p", EXTENSIONS, "-r", "Spec_TextFinder\\.md", "-h", "false", "-v", "true"],
    );

    case(
        8,
        &[
            "Two roots, traversed in the order /P gave them. Each path begins with the root",
            "whose subtree holds it, and the skip list prunes target/ beneath both.",
        ],
        &[
            "-P",
            "Rust_Spec_driven_TextFinder/Rust_Spec_driven_Cmdline",
            "-P",
            "Rust_Spec_driven_TextFinder/Rust_Spec_driven_Output",
            "-p",
            "rs",
            "-r",
            "^pub ",
            "-n",
            "true",
            "-L",
            "true",
        ],
    );

    case(
        9,
        &[
            "A root path that cannot be opened is announced and the run still exits 0, while",
            "an error announcement ignores /h true.",
        ],
        &["-P", "no_such_directory", "-P", "Rust_Spec_driven_TextFinder/Rust_TextFinder_Structure.md", "-r", "Cargo"],
    );

    case(
        10,
        &[
            "A malformed expression. §5.2 puts the option listing on stdout first, so the /r",
            "line shows what failed, then the diagnostic on stderr, and the exit code is 1.",
        ],
        &["-P", ".", "-p", EXTENSIONS, "-r", "pub fn ("],
    );

    case(
        11,
        &["The help text of §5.1, written to stdout under /H, traversing nothing."],
        &["/H", "true"],
    );

    println!("demonstration complete");
}
