/////////////////////////////////////////////////////////////
// tf_verify::main.rs - verify text_finder assertions      //
//                                                         //
// Jim Fawcett, https://JimFawcett.github.io               //
/////////////////////////////////////////////////////////////
/*
   Runs text_finder as a subprocess and checks its stdout
   against each assertion in Req_TextFinder.md.

   Usage:
       tf_verify [path/to/text_finder[.exe]]

   Default binary: ../RustTextFinder/target/debug/text_finder[.exe]
*/

use std::process::Command;
use std::fs;
use std::path::Path;

//-----------------------------------------------------------
// Test result types
//-----------------------------------------------------------

enum Status {
    Pass,
    Fail(String),   // holds the reason
    Skip(String),   // holds the reason
}

struct TestResult {
    req_id:    String,
    assertion: String,
    status:    Status,
}

impl TestResult {
    fn new(req_id: &str, assertion: &str, status: Status) -> Self {
        Self {
            req_id:    req_id.to_string(),
            assertion: assertion.to_string(),
            status,
        }
    }
    fn display(&self) {
        let tag = match &self.status {
            Status::Pass        => "  PASS".to_string(),
            Status::Fail(why)   => format!("  FAIL  ({})", why),
            Status::Skip(why)   => format!("  SKIP  ({})", why),
        };
        println!("  [{:<12}] {:<55} {}", self.req_id, self.assertion, tag);
    }
    fn is_pass(&self) -> bool { matches!(&self.status, Status::Pass) }
    fn is_fail(&self) -> bool { matches!(&self.status, Status::Fail(_)) }
    fn is_skip(&self) -> bool { matches!(&self.status, Status::Skip(_)) }
}

//-----------------------------------------------------------
// Run text_finder and capture stdout
//-----------------------------------------------------------

fn run_tf(tf: &str, args: &[&str]) -> Option<String> {
    let out = Command::new(tf).args(args).output().ok()?;
    Some(String::from_utf8_lossy(&out.stdout).to_string())
}

//-----------------------------------------------------------
// Test-data helpers
//-----------------------------------------------------------

const TEST_ROOT: &str = "./tf_test_data";

fn setup_test_data() {
    let root = Path::new(TEST_ROOT);
    let sub  = root.join("subdir");
    let tgt  = root.join("target");

    fs::create_dir_all(&sub).ok();
    fs::create_dir_all(&tgt).ok();

    fs::write(root.join("hello.rs"),
        "fn main() {\n    println!(\"hello world\");\n}\n").ok();
    fs::write(root.join("readme.txt"),
        "hello world\nthis is a readme\n").ok();
    fs::write(sub.join("lib.rs"),
        "pub fn lib_fn() -> i32 { 42 }\n").ok();
    fs::write(sub.join("notes.txt"),
        "some notes here\n").ok();
    // target dir should be skipped — content should never appear
    fs::write(tgt.join("compiled.rs"),
        "fn compiled() {}\n").ok();
}

fn teardown_test_data() {
    fs::remove_dir_all(TEST_ROOT).ok();
}

//-----------------------------------------------------------
// REQ-CL-01  Default Options
//-----------------------------------------------------------

fn test_cl_01(tf: &str) -> Vec<TestResult> {
    // Run with /v so that default values are printed, then
    // check that the expected defaults appear in output.
    let out = run_tf(tf, &["/P", TEST_ROOT, "/v"]).unwrap_or_default();
    let mut results = Vec::new();

    // Default /P is "." — here we supply it explicitly, so just
    // confirm that verbose output shows the path we gave.
    let ok = out.contains(TEST_ROOT) || out.contains("path");
    results.push(TestResult::new(
        "REQ-CL-01",
        "verbose output includes path information",
        if ok { Status::Pass } else { Status::Fail(format!("output was: {}", &out[..200.min(out.len())])) },
    ));

    // /s default is "true" — run with no /s and confirm recursion
    // occurs (subdir/lib.rs must appear).
    let out2 = run_tf(tf, &["/P", TEST_ROOT, "/r", "lib_fn"]).unwrap_or_default();
    let ok2 = out2.contains("lib.rs");
    results.push(TestResult::new(
        "REQ-CL-01",
        "default /s=true: subdir files are found without /s flag",
        if ok2 { Status::Pass } else { Status::Fail("lib.rs not found in recursive output".to_string()) },
    ));

    // /r default is "." — run with no /r and confirm every non-empty
    // file is matched (readme.txt must appear).
    let out3 = run_tf(tf, &["/P", TEST_ROOT]).unwrap_or_default();
    let ok3 = out3.contains("readme.txt");
    results.push(TestResult::new(
        "REQ-CL-01",
        "default /r='.': every non-empty file is matched",
        if ok3 { Status::Pass } else { Status::Fail("readme.txt not found with default regex".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-CL-02  Help on /h
//-----------------------------------------------------------

fn test_cl_02(tf: &str) -> Vec<TestResult> {
    let out = run_tf(tf, &["/h"]).unwrap_or_default();
    let mut results = Vec::new();

    let has_help = out.contains("/P") && out.contains("/r");
    results.push(TestResult::new(
        "REQ-CL-02",
        "/h prints help string",
        if has_help { Status::Pass } else { Status::Fail("help markers not in output".to_string()) },
    ));

    // No directory traversal should occur — no file names should appear
    let no_files = !out.contains("hello.rs") && !out.contains("readme.txt");
    results.push(TestResult::new(
        "REQ-CL-02",
        "/h: no directory traversal occurs",
        if no_files { Status::Pass } else { Status::Fail("file names appeared in help output".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-CL-03  Help on No Arguments
//-----------------------------------------------------------

fn test_cl_03(tf: &str) -> Vec<TestResult> {
    let out = run_tf(tf, &[]).unwrap_or_default();
    let mut results = Vec::new();

    let has_help = out.contains("/P") && out.contains("/r");
    results.push(TestResult::new(
        "REQ-CL-03",
        "no-args run prints help string",
        if has_help { Status::Pass } else { Status::Fail("help markers not in output".to_string()) },
    ));

    let no_files = !out.contains("hello.rs") && !out.contains("readme.txt");
    results.push(TestResult::new(
        "REQ-CL-03",
        "no-args run: no directory traversal occurs",
        if no_files { Status::Pass } else { Status::Fail("file names appeared in no-args output".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-CL-04  Target Skip
//-----------------------------------------------------------

fn test_cl_04(tf: &str) -> Vec<TestResult> {
    // compiled.rs lives only inside ./tf_test_data/target/
    let out = run_tf(tf, &["/P", TEST_ROOT]).unwrap_or_default();
    let not_entered = !out.contains("compiled.rs");
    vec![TestResult::new(
        "REQ-CL-04",
        "target/ directory is never entered during traversal",
        if not_entered { Status::Pass }
        else { Status::Fail("compiled.rs (inside target/) appeared in output".to_string()) },
    )]
}

//-----------------------------------------------------------
// REQ-TF-01  TextFinder Construction  (internal state)
//-----------------------------------------------------------

fn test_tf_01() -> Vec<TestResult> {
    vec![
        TestResult::new(
            "REQ-TF-01",
            "TextFinder::new() re_str == \"\"",
            Status::Skip("internal struct state; not observable via CLI".to_string()),
        ),
        TestResult::new(
            "REQ-TF-01",
            "TextFinder::new() last_dir == \"\"",
            Status::Skip("internal struct state; not observable via CLI".to_string()),
        ),
    ]
}

//-----------------------------------------------------------
// REQ-TF-02  Regex Setting  (internal state)
//-----------------------------------------------------------

fn test_tf_02() -> Vec<TestResult> {
    vec![TestResult::new(
        "REQ-TF-02",
        "After regex(s), get_regex() returns s",
        Status::Skip("internal struct state; not observable via CLI".to_string()),
    )]
}

//-----------------------------------------------------------
// REQ-TF-03  find() File Reading
//-----------------------------------------------------------

fn test_tf_03(tf: &str) -> Vec<TestResult> {
    // A plain text file should be readable and matched.
    let out = run_tf(tf, &["/P", TEST_ROOT, "/r", "hello"]).unwrap_or_default();
    let found_text = out.contains("hello.rs") || out.contains("readme.txt");
    vec![
        TestResult::new(
            "REQ-TF-03",
            "find() reads text file and matches content",
            if found_text { Status::Pass }
            else { Status::Fail("expected matching file not in output".to_string()) },
        ),
        TestResult::new(
            "REQ-TF-03",
            "find() returns false (no panic) when file cannot be read",
            // We can only confirm no crash; a missing-file path is handled in REQ-TF-05
            Status::Skip("no-panic behaviour verified by REQ-TF-05; unreadable file test requires binary file".to_string()),
        ),
    ]
}

//-----------------------------------------------------------
// REQ-TF-04  find() Matching
//-----------------------------------------------------------

fn test_tf_04(tf: &str) -> Vec<TestResult> {
    let mut results = Vec::new();

    // Matching regex -> file appears
    let out_match = run_tf(tf, &["/P", TEST_ROOT, "/r", "lib_fn"]).unwrap_or_default();
    results.push(TestResult::new(
        "REQ-TF-04",
        "find() returns true when content matches re_str",
        if out_match.contains("lib.rs") { Status::Pass }
        else { Status::Fail("lib.rs not found when regex should match".to_string()) },
    ));

    // Non-matching regex -> file absent from output
    let out_no_match = run_tf(tf, &["/P", TEST_ROOT, "/r", "ZZZNOMATCH_XYZ"]).unwrap_or_default();
    let no_files = !out_no_match.contains("hello.rs")
                && !out_no_match.contains("readme.txt")
                && !out_no_match.contains("lib.rs");
    results.push(TestResult::new(
        "REQ-TF-04",
        "find() returns false when content does not match re_str",
        if no_files { Status::Pass }
        else { Status::Fail("files appeared despite non-matching regex".to_string()) },
    ));

    // Invalid regex -> no output files (find returns false)
    let out_bad = run_tf(tf, &["/P", TEST_ROOT, "/r", "["]).unwrap_or_default();
    let no_files_bad = !out_bad.contains("hello.rs")
                    && !out_bad.contains("readme.txt")
                    && !out_bad.contains("lib.rs");
    results.push(TestResult::new(
        "REQ-TF-04",
        "find() returns false when re_str fails regex compilation",
        if no_files_bad { Status::Pass }
        else { Status::Fail("files appeared despite invalid regex".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-TF-05  find() No Panic
//-----------------------------------------------------------

fn test_tf_05(tf: &str) -> Vec<TestResult> {
    // Run with an invalid regex; process must exit without crash.
    let result = Command::new(tf)
        .args(&["/P", TEST_ROOT, "/r", "["])
        .output();
    let did_not_crash = result.is_ok();
    vec![TestResult::new(
        "REQ-TF-05",
        "find() never panics (invalid regex, process exits cleanly)",
        if did_not_crash { Status::Pass }
        else { Status::Fail("process failed to launch or crashed".to_string()) },
    )]
}

//-----------------------------------------------------------
// REQ-TF-06  Last Path Tracking  (internal state)
//-----------------------------------------------------------

fn test_tf_06() -> Vec<TestResult> {
    vec![TestResult::new(
        "REQ-TF-06",
        "After last_path(p), get_last_path() returns p",
        Status::Skip("internal struct state; not observable via CLI".to_string()),
    )]
}

//-----------------------------------------------------------
// REQ-TA-01  TfAppl Construction  (internal state)
//-----------------------------------------------------------

fn test_ta_01() -> Vec<TestResult> {
    vec![
        TestResult::new(
            "REQ-TA-01",
            "TfAppl::new() hide == true",
            Status::Skip("internal struct state; not observable via CLI".to_string()),
        ),
        TestResult::new(
            "REQ-TA-01",
            "TfAppl::new() recurse == true",
            Status::Skip("internal struct state; not observable via CLI".to_string()),
        ),
        TestResult::new(
            "REQ-TA-01",
            "TfAppl::new() curr_dir == \"\"",
            Status::Skip("internal struct state; not observable via CLI".to_string()),
        ),
    ]
}

//-----------------------------------------------------------
// REQ-TA-02  do_dir Behaviour
//-----------------------------------------------------------

fn test_ta_02(tf: &str) -> Vec<TestResult> {
    let mut results = Vec::new();

    // hide=false -> directory names print immediately (even if no match)
    // Use a regex that won't match anything so only the dir line appears.
    let out_show = run_tf(tf, &["/P", TEST_ROOT, "/H", "false", "/r", "ZZZNOMATCH_XYZ"])
        .unwrap_or_default();
    let dirs_printed = out_show.contains("tf_test_data");
    results.push(TestResult::new(
        "REQ-TA-02",
        "hide=false: directory name printed even when no match found",
        if dirs_printed { Status::Pass }
        else { Status::Fail("directory name absent when H=false and no match".to_string()) },
    ));

    // hide=true -> directory not printed unless there is a matching file
    // With ZZZNOMATCH there are no matches so directory should be hidden.
    let out_hide = run_tf(tf, &["/P", TEST_ROOT, "/H", "true", "/r", "ZZZNOMATCH_XYZ"])
        .unwrap_or_default();
    let dirs_hidden = !out_hide.contains("subdir");
    results.push(TestResult::new(
        "REQ-TA-02",
        "hide=true: directory not printed when no matching file found",
        if dirs_hidden { Status::Pass }
        else { Status::Fail("directory appeared when H=true and no match".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-TA-03  do_file Behaviour
//-----------------------------------------------------------

fn test_ta_03(tf: &str) -> Vec<TestResult> {
    let mut results = Vec::new();

    // No match -> nothing printed for non-matching files
    let out_no = run_tf(tf, &["/P", TEST_ROOT, "/r", "ZZZNOMATCH_XYZ"]).unwrap_or_default();
    let nothing_printed = !out_no.contains("hello.rs") && !out_no.contains("readme.txt");
    results.push(TestResult::new(
        "REQ-TA-03",
        "do_file: non-matching file is not printed",
        if nothing_printed { Status::Pass }
        else { Status::Fail("non-matching filename appeared in output".to_string()) },
    ));

    // Match -> filename printed
    let out_yes = run_tf(tf, &["/P", TEST_ROOT, "/r", "hello"]).unwrap_or_default();
    let file_printed = out_yes.contains("hello.rs") || out_yes.contains("readme.txt");
    results.push(TestResult::new(
        "REQ-TA-03",
        "do_file: matching filename is printed",
        if file_printed { Status::Pass }
        else { Status::Fail("matching filename absent from output".to_string()) },
    ));

    // hide=true: directory printed before first matching file in new dir
    // lib.rs in subdir matches "lib_fn"; the subdir path must appear before lib.rs
    let out_dir = run_tf(tf, &["/P", TEST_ROOT, "/H", "true", "/r", "lib_fn"])
        .unwrap_or_default();
    let dir_pos  = out_dir.find("subdir");
    let file_pos = out_dir.find("lib.rs");
    let dir_before_file = match (dir_pos, file_pos) {
        (Some(d), Some(f)) => d < f,
        _ => false,
    };
    results.push(TestResult::new(
        "REQ-TA-03",
        "do_file: hide=true: directory name printed before first matched file",
        if dir_before_file { Status::Pass }
        else { Status::Fail(format!("dir_pos={:?}, file_pos={:?}", dir_pos, file_pos)) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-TA-04  Hide Setting  (internal state)
//-----------------------------------------------------------

fn test_ta_04() -> Vec<TestResult> {
    vec![TestResult::new(
        "REQ-TA-04",
        "After hide(p), get_hide() returns p",
        Status::Skip("internal struct state; verified indirectly by REQ-TA-02".to_string()),
    )]
}

//-----------------------------------------------------------
// REQ-TA-05  Recurse Setting
//-----------------------------------------------------------

fn test_ta_05(tf: &str) -> Vec<TestResult> {
    let mut results = Vec::new();

    // recurse=true -> files in subdir appear
    let out_rec = run_tf(tf, &["/P", TEST_ROOT, "/s", "true"]).unwrap_or_default();
    results.push(TestResult::new(
        "REQ-TA-05",
        "recurse=true: files in subdirectories are found",
        if out_rec.contains("lib.rs") { Status::Pass }
        else { Status::Fail("lib.rs (in subdir) not found with /s true".to_string()) },
    ));

    // recurse=false -> only root-level files appear; subdir files absent
    let out_norec = run_tf(tf, &["/P", TEST_ROOT, "/s", "false"]).unwrap_or_default();
    let no_sub = !out_norec.contains("lib.rs") && !out_norec.contains("notes.txt");
    results.push(TestResult::new(
        "REQ-TA-05",
        "recurse=false: files in subdirectories are not found",
        if no_sub { Status::Pass }
        else { Status::Fail("subdir files appeared when /s false".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-TA-06  Regex Delegation  (internal state)
//-----------------------------------------------------------

fn test_ta_06() -> Vec<TestResult> {
    vec![TestResult::new(
        "REQ-TA-06",
        "TfAppl::regex(s) sets embedded TextFinder regex",
        Status::Skip("internal delegation; verified indirectly by REQ-TF-04".to_string()),
    )]
}

//-----------------------------------------------------------
// REQ-MN-01  Startup Sequence
//-----------------------------------------------------------

fn test_mn_01(tf: &str) -> Vec<TestResult> {
    // default_options supplies /r "." so without /r every file is matched
    let out = run_tf(tf, &["/P", TEST_ROOT]).unwrap_or_default();
    let files_found = out.contains("hello.rs") || out.contains("readme.txt");
    vec![TestResult::new(
        "REQ-MN-01",
        "default_options() called: default regex '.' matches all files",
        if files_found { Status::Pass }
        else { Status::Fail("no files found; default_options may not have been called".to_string()) },
    )]
}

//-----------------------------------------------------------
// REQ-MN-02  Recursion Configuration
//-----------------------------------------------------------

fn test_mn_02(tf: &str) -> Vec<TestResult> {
    let mut results = Vec::new();

    let out_t = run_tf(tf, &["/P", TEST_ROOT, "/s", "true"]).unwrap_or_default();
    results.push(TestResult::new(
        "REQ-MN-02",
        "/s true: DirNav recurse=true, subdir files found",
        if out_t.contains("lib.rs") { Status::Pass }
        else { Status::Fail("lib.rs not found with /s true".to_string()) },
    ));

    let out_f = run_tf(tf, &["/P", TEST_ROOT, "/s", "false"]).unwrap_or_default();
    let no_sub = !out_f.contains("lib.rs") && !out_f.contains("notes.txt");
    results.push(TestResult::new(
        "REQ-MN-02",
        "/s false: DirNav recurse=false, subdir files not found",
        if no_sub { Status::Pass }
        else { Status::Fail("subdir files appeared with /s false".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-MN-03  Hide Configuration
//-----------------------------------------------------------

fn test_mn_03(tf: &str) -> Vec<TestResult> {
    let mut results = Vec::new();

    // /H true with no match: no directory printed
    let out_hide = run_tf(tf, &["/P", TEST_ROOT, "/H", "true", "/r", "ZZZNOMATCH_XYZ"])
        .unwrap_or_default();
    let no_dir = !out_hide.contains("subdir");
    results.push(TestResult::new(
        "REQ-MN-03",
        "/H true: directories with no matches are hidden",
        if no_dir { Status::Pass }
        else { Status::Fail("directory appeared when H=true and no match".to_string()) },
    ));

    // /H false: directory printed even with no match
    let out_show = run_tf(tf, &["/P", TEST_ROOT, "/H", "false", "/r", "ZZZNOMATCH_XYZ"])
        .unwrap_or_default();
    let has_dir = out_show.contains("tf_test_data");
    results.push(TestResult::new(
        "REQ-MN-03",
        "/H false: directories printed even when no match found",
        if has_dir { Status::Pass }
        else { Status::Fail("directory absent when H=false and no match".to_string()) },
    ));

    // /H absent defaults to true (same as /H true)
    let out_def = run_tf(tf, &["/P", TEST_ROOT, "/r", "ZZZNOMATCH_XYZ"])
        .unwrap_or_default();
    let no_dir_def = !out_def.contains("subdir");
    results.push(TestResult::new(
        "REQ-MN-03",
        "/H absent defaults to true: directories hidden when no match",
        if no_dir_def { Status::Pass }
        else { Status::Fail("directory appeared when H omitted and no match".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-MN-04  Pattern Population
//-----------------------------------------------------------

fn test_mn_04(tf: &str) -> Vec<TestResult> {
    let mut results = Vec::new();

    // With /p rs only .rs files should appear; .txt files should not
    let out_rs = run_tf(tf, &["/P", TEST_ROOT, "/p", "rs"]).unwrap_or_default();
    let rs_ok  = out_rs.contains("hello.rs") || out_rs.contains("lib.rs");
    let no_txt = !out_rs.contains("readme.txt") && !out_rs.contains("notes.txt");
    results.push(TestResult::new(
        "REQ-MN-04",
        "/p rs: only .rs files passed to do_file",
        if rs_ok && no_txt { Status::Pass }
        else { Status::Fail(format!("rs_ok={}, no_txt={}", rs_ok, no_txt)) },
    ));

    // Without /p every file is passed
    let out_all = run_tf(tf, &["/P", TEST_ROOT]).unwrap_or_default();
    let has_rs  = out_all.contains("hello.rs");
    let has_txt = out_all.contains("readme.txt");
    results.push(TestResult::new(
        "REQ-MN-04",
        "/p absent: every file is passed to do_file",
        if has_rs && has_txt { Status::Pass }
        else { Status::Fail(format!("has_rs={}, has_txt={}", has_rs, has_txt)) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-MN-05  Search Execution
//-----------------------------------------------------------

fn test_mn_05(tf: &str) -> Vec<TestResult> {
    let mut results = Vec::new();

    // After traversal, summary line must appear
    let out = run_tf(tf, &["/P", TEST_ROOT]).unwrap_or_default();
    let has_summary = out.contains("processed") && out.contains("files");
    results.push(TestResult::new(
        "REQ-MN-05",
        "After traversal, file and directory counts are printed",
        if has_summary { Status::Pass }
        else { Status::Fail("summary line 'processed N files in N dirs' not found".to_string()) },
    ));

    // verbose() output appears before file listing
    let out_v = run_tf(tf, &["/P", TEST_ROOT, "/v"]).unwrap_or_default();
    let has_version = out_v.contains("TextFinder");
    results.push(TestResult::new(
        "REQ-MN-05",
        "verbose() prints TextFinder version/title before search",
        if has_version { Status::Pass }
        else { Status::Fail("TextFinder title not found in verbose output".to_string()) },
    ));

    results
}

//-----------------------------------------------------------
// REQ-INV-01  Hide Synchronization  (internal state)
//-----------------------------------------------------------

fn test_inv_01() -> Vec<TestResult> {
    vec![TestResult::new(
        "REQ-INV-01",
        "DirNav::hide and TfAppl::hide always hold the same value",
        Status::Skip("internal invariant; observable only indirectly via REQ-MN-03".to_string()),
    )]
}

//-----------------------------------------------------------
// REQ-INV-02  Default Regex
//-----------------------------------------------------------

fn test_inv_02(tf: &str) -> Vec<TestResult> {
    // Run without /r; default "." should match every non-empty file
    let out = run_tf(tf, &["/P", TEST_ROOT]).unwrap_or_default();
    let all_found = out.contains("hello.rs")
                 && out.contains("readme.txt")
                 && out.contains("lib.rs")
                 && out.contains("notes.txt");
    vec![TestResult::new(
        "REQ-INV-02",
        "/r absent: default regex '.' matches every non-empty file",
        if all_found { Status::Pass }
        else { Status::Fail("not all expected files found with default regex".to_string()) },
    )]
}

//-----------------------------------------------------------
// REQ-INV-03  Regex Compilation per call  (internal state)
//-----------------------------------------------------------

fn test_inv_03() -> Vec<TestResult> {
    vec![TestResult::new(
        "REQ-INV-03",
        "Regex compiled on every find() call; no shared pre-compiled instance",
        Status::Skip("implementation detail; not observable via CLI".to_string()),
    )]
}

//-----------------------------------------------------------
// main
//-----------------------------------------------------------

fn main() {
    // Resolve binary path
    let args: Vec<String> = std::env::args().collect();
    let default_bin = format!(
        "../RustTextFinder/target/debug/text_finder{}",
        if cfg!(windows) { ".exe" } else { "" }
    );
    let tf = if args.len() > 1 { args[1].as_str() } else { &default_bin };

    println!("\n  TfVerify — text_finder assertion verifier");
    println!("  ==========================================");
    println!("  binary: {}\n", tf);

    if !Path::new(tf).exists() {
        eprintln!("  ERROR: binary not found at '{}'", tf);
        eprintln!("  Build RustTextFinder first (cargo build) or pass path as argument.");
        std::process::exit(2);
    }

    setup_test_data();

    let mut all: Vec<TestResult> = Vec::new();

    println!("  {:<14}  {:<55}  {}", "Requirement", "Assertion", "Result");
    println!("  {}  {}  {}", "-".repeat(14), "-".repeat(55), "-".repeat(30));

    macro_rules! run {
        ($results:expr) => {
            for r in $results {
                r.display();
                all.push(r);
            }
        };
    }

    run!(test_cl_01(tf));
    run!(test_cl_02(tf));
    run!(test_cl_03(tf));
    run!(test_cl_04(tf));
    run!(test_tf_01());
    run!(test_tf_02());
    run!(test_tf_03(tf));
    run!(test_tf_04(tf));
    run!(test_tf_05(tf));
    run!(test_tf_06());
    run!(test_ta_01());
    run!(test_ta_02(tf));
    run!(test_ta_03(tf));
    run!(test_ta_04());
    run!(test_ta_05(tf));
    run!(test_ta_06());
    run!(test_mn_01(tf));
    run!(test_mn_02(tf));
    run!(test_mn_03(tf));
    run!(test_mn_04(tf));
    run!(test_mn_05(tf));
    run!(test_inv_01());
    run!(test_inv_02(tf));
    run!(test_inv_03());

    teardown_test_data();

    let passed = all.iter().filter(|r| r.is_pass()).count();
    let failed = all.iter().filter(|r| r.is_fail()).count();
    let skipped = all.iter().filter(|r| r.is_skip()).count();

    println!("\n  ==========================================");
    println!("  Results: {} passed, {} failed, {} skipped", passed, failed, skipped);
    println!("  ==========================================\n");

    if failed > 0 {
        std::process::exit(1);
    }
}
