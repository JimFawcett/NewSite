//! rust_textfinder_entry - the TextFinder binary.
//! Implements Spec_Rust_TextFinder_Entry.md.

use rust_textfinder_cmdline::{help_text, options_text, parse, usage_line, ProgramCommands};
use rust_textfinder_dirnav::{Dirnav, SkipList};
use rust_textfinder_output::StdoutSink;
use std::cell::RefCell;
use std::path::Path;
use std::process::ExitCode;

thread_local! {
    static SKIP_LIST: RefCell<SkipList> = RefCell::new(default_skip_list());
}

fn default_skip_list() -> SkipList {
    [
        "archive",
        ".git",
        ".svn",
        ".hg",
        "build",
        "out",
        "target",
        "bin",
        "obj",
        "__pycache__",
        "node_modules",
    ]
    .iter()
    .map(|name| String::from(*name))
    .collect()
}

/// The build-time extension point of Spec_TextFinder.md section 3.5.
#[allow(dead_code)]
fn add_skip_directory(name: &str) {
    SKIP_LIST.with(|list| {
        let mut list = list.borrow_mut();
        if !list.iter().any(|held| held == name) {
            list.push(String::from(name));
        }
    });
}

/// Every call compiled in here runs before traversal begins. None is at present.
fn extend_skip_list() {}

fn main() -> ExitCode {
    let mut args: Vec<String> = Vec::new();
    for argument in std::env::args_os() {
        match argument.into_string() {
            Ok(text) => args.push(text),
            Err(raw) => {
                eprintln!("invalid argument encoding: {}", raw.to_string_lossy());
                return ExitCode::from(2);
            }
        }
    }

    let commands: ProgramCommands = match parse(&args) {
        Ok(commands) => commands,
        Err(diagnostic) => {
            eprint!("{diagnostic}");
            return ExitCode::from(1);
        }
    };

    let mut sink = match StdoutSink::new() {
        Some(sink) => sink,
        None => {
            eprintln!("cannot initialize output");
            return ExitCode::from(2);
        }
    };

    if commands.help {
        sink.write_text(&help_text());
        return ExitCode::SUCCESS;
    }

    if args.len() == 1 {
        sink.write_text(&options_text(&commands));
        return ExitCode::SUCCESS;
    }

    if commands.verbose {
        sink.write_text(&options_text(&commands));
    }

    extend_skip_list();
    let skips: SkipList = SKIP_LIST.with(|list| list.take());

    let compiled = match Dirnav::new(&mut sink, &skips, &commands) {
        Ok(mut navigator) => {
            for root in &commands.root_paths {
                navigator.search(Path::new(root));
            }
            navigator.emit_run_summary();   // only main knows the last root has returned
            true
        }
        Err(_) => false,
    };

    if !compiled {
        if !commands.verbose {
            sink.write_text(&options_text(&commands));
        }
        sink.flush();
        eprint!("invalid regex for switch: /r\n{}", usage_line());
        return ExitCode::from(1);
    }

    ExitCode::SUCCESS
}
