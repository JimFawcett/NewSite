use clap::Parser;
use std::path::{Path, PathBuf};
use validator::{Report, Validator};

#[derive(Parser)]
#[command(
    name = "rs_page_validator",
    about = "Validate HTML files for structural correctness"
)]
struct Args {
    /// HTML files or directories to validate
    #[arg(required = true)]
    paths: Vec<PathBuf>,

    /// Descend into subdirectories
    #[arg(short, long)]
    recursive: bool,

    /// Print only files with errors
    #[arg(short, long)]
    quiet: bool,

    /// Print a pass/fail count after all files
    #[arg(short, long)]
    summary: bool,
}

const SKIP_DIRS: &[&str] = &[
    "target", "bin", "obj", "build", "out",
    "__pycache__", ".venv", "venv", "dist",
    ".git", ".vs", ".idea", "archive",
];

fn should_skip(path: &Path) -> bool {
    path.file_name()
        .and_then(|n| n.to_str())
        .map(|n| SKIP_DIRS.contains(&n))
        .unwrap_or(false)
}

fn is_html(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|e| e.to_str()),
        Some("html") | Some("htm")
    )
}

fn collect_html_files(path: &Path, recursive: bool, out: &mut Vec<PathBuf>) {
    if path.is_file() {
        if is_html(path) {
            out.push(path.to_path_buf());
        }
        return;
    }
    if !path.is_dir() {
        return;
    }
    let entries = match std::fs::read_dir(path) {
        Ok(e) => e,
        Err(err) => {
            eprintln!("ERROR cannot read directory {}: {}", path.display(), err);
            return;
        }
    };
    for entry in entries.flatten() {
        let p = entry.path();
        if p.is_file() {
            if is_html(&p) {
                out.push(p);
            }
        } else if recursive && p.is_dir() && !should_skip(&p) {
            collect_html_files(&p, recursive, out);
        }
    }
}

fn print_report(report: &Report, quiet: bool) {
    if report.is_valid() {
        if !quiet {
            println!("PASS  {}", report.file.display());
        }
    } else {
        println!("FAIL  {}", report.file.display());
        for e in &report.errors {
            println!(
                "      [{}] {}:{} — {}",
                e.rule, e.line, e.col, e.message
            );
        }
    }
}

fn main() {
    let args = Args::parse();

    let mut files: Vec<PathBuf> = Vec::new();
    for path in &args.paths {
        collect_html_files(path, args.recursive, &mut files);
    }

    if files.is_empty() {
        eprintln!("no HTML files found");
        std::process::exit(1);
    }

    let mut pass: usize = 0;
    let mut fail: usize = 0;
    let mut read_errors: usize = 0;

    for file in &files {
        let bytes = match std::fs::read(file) {
            Ok(b) => b,
            Err(e) => {
                eprintln!("ERROR {} — {}", file.display(), e);
                read_errors += 1;
                continue;
            }
        };
        let src = String::from_utf8_lossy(&bytes).into_owned();
        let report = Validator::validate(&src, file);
        if report.is_valid() {
            pass += 1;
        } else {
            fail += 1;
        }
        print_report(&report, args.quiet);
    }

    if args.summary {
        println!("\n{} passed, {} failed", pass, fail);
    }

    if read_errors > 0 {
        std::process::exit(1);
    }
}
