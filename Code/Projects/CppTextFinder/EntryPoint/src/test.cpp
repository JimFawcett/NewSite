import cmd_line;
import dir_nav;
import output;
import std;

// ---------------------------------------------------------------------------
// Tiny test harness helpers
// ---------------------------------------------------------------------------

static bool report(const char* name, bool passed)
{
    std::cout << (passed ? "PASS" : "FAIL") << "  " << name << "\n";
    return passed;
}

// ---------------------------------------------------------------------------
// Filesystem helpers — build a small temp tree for integration tests
// ---------------------------------------------------------------------------

// Returns a fresh temporary directory path unique to this process run.
static std::filesystem::path make_temp_root()
{
    namespace fs = std::filesystem;
    fs::path base = fs::temp_directory_path()
                  / ("tf_test_" + std::to_string(
                        std::chrono::steady_clock::now().time_since_epoch().count()));
    fs::create_directories(base);
    return base;
}

// Write text to a file, creating parent directories as needed.
static void write_file(const std::filesystem::path& p, const std::string& content)
{
    std::filesystem::create_directories(p.parent_path());
    std::ofstream f(p);
    f << content;
}

// ---------------------------------------------------------------------------
// Test 1 — dir handler callback is invoked for the root directory
// ---------------------------------------------------------------------------
static bool test_dir_callback_invoked()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "hello.txt", "hello world");

    DirNav dn(/*recurse=*/false);

    std::vector<std::string> dirs_seen;
    dn.set_dir_handler([&dirs_seen](const std::string& d)
    {
        dirs_seen.push_back(d);
    });
    dn.set_file_handler([](const std::string&){});

    dn.visit(root);
    fs::remove_all(root);

    return !dirs_seen.empty();
}

// ---------------------------------------------------------------------------
// Test 2 — file handler callback is invoked for each file in the directory
// ---------------------------------------------------------------------------
static bool test_file_callback_invoked()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "a.txt", "alpha");
    write_file(root / "b.txt", "beta");

    DirNav dn(/*recurse=*/false);

    std::vector<std::string> files_seen;
    dn.set_dir_handler([](const std::string&){});
    dn.set_file_handler([&files_seen](const std::string& f)
    {
        files_seen.push_back(f);
    });

    dn.visit(root);
    fs::remove_all(root);

    return files_seen.size() == 2u;
}

// ---------------------------------------------------------------------------
// Test 3 — file_count() reflects the number of files visited
// ---------------------------------------------------------------------------
static bool test_file_count_matches_visited()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "x.cpp", "int main(){}");
    write_file(root / "y.cpp", "void f(){}");
    write_file(root / "z.cpp", "void g(){}");

    DirNav dn(/*recurse=*/false);
    dn.set_dir_handler([](const std::string&){});
    dn.set_file_handler([](const std::string&){});

    dn.visit(root);
    fs::remove_all(root);

    return dn.file_count() == 3u;
}

// ---------------------------------------------------------------------------
// Test 4 — Output::match_count() reflects the number of matching files
// ---------------------------------------------------------------------------
static bool test_match_count_is_correct()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "match1.txt",   "needle in a haystack");
    write_file(root / "match2.txt",   "another needle here");
    write_file(root / "nomatch.txt",  "nothing relevant");

    // Route through the actual Output + DirNav wiring (mirrors main.cpp)
    Output out(/*hide=*/true);
    out.set_regex("needle");

    DirNav dn(/*recurse=*/false);
    dn.set_dir_handler([&out](const std::string& d){ out.on_dir(d); });
    dn.set_file_handler([&out](const std::string& f){ out.on_file(f); });

    dn.visit(root);
    fs::remove_all(root);

    return out.match_count() == 2u;
}

// ---------------------------------------------------------------------------
// Test 5 — Callbacks NOT invoked after visit() on a non-existent path
// ---------------------------------------------------------------------------
static bool test_visit_nonexistent_path_returns_false()
{
    DirNav dn(/*recurse=*/false);
    dn.set_dir_handler([](const std::string&){});
    dn.set_file_handler([](const std::string&){});

    bool ok = dn.visit(std::filesystem::path("/this/does/not/exist_9q3j"));
    return !ok;
}

// ---------------------------------------------------------------------------
// Test 6 — Recursion flag: subdirectory files are visited when recurse==true
// ---------------------------------------------------------------------------
static bool test_recursion_visits_subdirectory_files()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "top.txt",         "top level");
    write_file(root / "sub" / "deep.txt","deep level");

    DirNav dn(/*recurse=*/true);
    dn.set_dir_handler([](const std::string&){});

    std::vector<std::string> files;
    dn.set_file_handler([&files](const std::string& f){ files.push_back(f); });

    dn.visit(root);
    fs::remove_all(root);

    return files.size() == 2u;
}

// ---------------------------------------------------------------------------
// Test 7 — Recursion flag: subdirectory files are NOT visited when recurse==false
// ---------------------------------------------------------------------------
static bool test_no_recursion_skips_subdirectory_files()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "top.txt",         "top level");
    write_file(root / "sub" / "deep.txt","deep level");

    DirNav dn(/*recurse=*/false);
    dn.set_dir_handler([](const std::string&){});

    std::vector<std::string> files;
    dn.set_file_handler([&files](const std::string& f){ files.push_back(f); });

    dn.visit(root);
    fs::remove_all(root);

    return files.size() == 1u;
}

// ---------------------------------------------------------------------------
// Test 8 — Extension pattern: only matching extensions are passed to the handler
// ---------------------------------------------------------------------------
static bool test_extension_filter_excludes_non_matching()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "a.cpp",  "cpp file");
    write_file(root / "b.txt",  "txt file");
    write_file(root / "c.cpp",  "another cpp");

    DirNav dn(/*recurse=*/false);
    dn.add_pattern("cpp");
    dn.set_dir_handler([](const std::string&){});

    std::vector<std::string> files;
    dn.set_file_handler([&files](const std::string& f){ files.push_back(f); });

    dn.visit(root);
    fs::remove_all(root);

    return files.size() == 2u;
}

// ---------------------------------------------------------------------------
// Test 9 — CmdLine: /h flag is detected correctly
// ---------------------------------------------------------------------------
static bool test_cmdline_help_flag_detected()
{
    const char* argv[] = { "text_finder", "/h" };
    int argc = 2;
    CmdLine cl(argc, argv);
    return cl.help() == true;
}

// ---------------------------------------------------------------------------
// Test 10 — CmdLine: default values are applied when no options are given
// ---------------------------------------------------------------------------
static bool test_cmdline_defaults()
{
    const char* argv[] = { "text_finder", "/P", "." };
    int argc = 3;
    CmdLine cl(argc, argv);

    return cl.path()    == "."
        && cl.recurse() == true
        && cl.hide()    == true
        && cl.regex()   == "."
        && cl.patterns().empty()
        && cl.verbose() == false
        && cl.help()    == false;
}

// ---------------------------------------------------------------------------
// Test 11 — CmdLine: /s false disables recursion
// ---------------------------------------------------------------------------
static bool test_cmdline_no_recurse()
{
    const char* argv[] = { "text_finder", "/s", "false" };
    int argc = 3;
    CmdLine cl(argc, argv);
    return cl.recurse() == false;
}

// ---------------------------------------------------------------------------
// Test 12 — CmdLine: /p populates patterns list
// ---------------------------------------------------------------------------
static bool test_cmdline_patterns_parsed()
{
    const char* argv[] = { "text_finder", "/p", "cpp,h,ixx" };
    int argc = 3;
    CmdLine cl(argc, argv);
    auto p = cl.patterns();
    return p.size() == 3u
        && p[0] == "cpp"
        && p[1] == "h"
        && p[2] == "ixx";
}

// ---------------------------------------------------------------------------
// Test 13 — CmdLine: /r stores the regex string
// ---------------------------------------------------------------------------
static bool test_cmdline_regex_stored()
{
    const char* argv[] = { "text_finder", "/r", "TODO" };
    int argc = 3;
    CmdLine cl(argc, argv);
    return cl.regex() == "TODO";
}

// ---------------------------------------------------------------------------
// Test 14 — CmdLine: /v sets verbose flag
// ---------------------------------------------------------------------------
static bool test_cmdline_verbose_flag()
{
    const char* argv[] = { "text_finder", "/v" };
    int argc = 2;
    CmdLine cl(argc, argv);
    return cl.verbose() == true;
}

// ---------------------------------------------------------------------------
// Test 15 — Output::match_count() is 0 when no files match
// ---------------------------------------------------------------------------
static bool test_match_count_zero_when_no_matches()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "a.txt", "apple");
    write_file(root / "b.txt", "banana");

    Output out(/*hide=*/true);
    out.set_regex("zzz_no_match_zzz");

    DirNav dn(/*recurse=*/false);
    dn.set_dir_handler([&out](const std::string& d){ out.on_dir(d); });
    dn.set_file_handler([&out](const std::string& f){ out.on_file(f); });

    dn.visit(root);
    fs::remove_all(root);

    return out.match_count() == 0u;
}

// ---------------------------------------------------------------------------
// Test 16 — file_count() is 0 after construction, before visit()
// ---------------------------------------------------------------------------
static bool test_file_count_zero_before_visit()
{
    DirNav dn(/*recurse=*/false);
    dn.set_dir_handler([](const std::string&){});
    dn.set_file_handler([](const std::string&){});
    return dn.file_count() == 0u;
}

// ---------------------------------------------------------------------------
// Test 17 — Wiring: file_count() and match_count() are consistent
// ---------------------------------------------------------------------------
static bool test_wiring_file_and_match_counts_consistent()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    // 5 files; 3 contain "hit"
    write_file(root / "f1.txt", "hit the target");
    write_file(root / "f2.txt", "nothing here");
    write_file(root / "f3.txt", "another hit");
    write_file(root / "f4.txt", "quiet");
    write_file(root / "f5.txt", "hit again");

    Output out(/*hide=*/true);
    out.set_regex("hit");

    DirNav dn(/*recurse=*/false);
    dn.set_dir_handler([&out](const std::string& d){ out.on_dir(d); });
    dn.set_file_handler([&out](const std::string& f){ out.on_file(f); });

    dn.visit(root);
    fs::remove_all(root);

    return dn.file_count() == 5u && out.match_count() == 3u;
}

// ---------------------------------------------------------------------------
// Test 18 — hide=false: dir handler is still called (non-hide mode)
// ---------------------------------------------------------------------------
static bool test_hide_false_dir_callback_still_fires()
{
    namespace fs = std::filesystem;
    auto root = make_temp_root();
    write_file(root / "any.txt", "content");

    Output out(/*hide=*/false);
    out.set_regex(".");

    std::vector<std::string> dirs;
    DirNav dn(/*recurse=*/false);
    dn.set_dir_handler([&out, &dirs](const std::string& d)
    {
        dirs.push_back(d);
        out.on_dir(d);
    });
    dn.set_file_handler([&out](const std::string& f){ out.on_file(f); });

    dn.visit(root);
    fs::remove_all(root);

    return !dirs.empty();
}

// ---------------------------------------------------------------------------
// Test 19 — CmdLine: help_text() returns a non-empty string
// ---------------------------------------------------------------------------
static bool test_cmdline_help_text_nonempty()
{
    return !CmdLine::help_text().empty();
}

// ---------------------------------------------------------------------------
// Test 20 — CmdLine: /H false sets hide to false
// ---------------------------------------------------------------------------
static bool test_cmdline_hide_false()
{
    const char* argv[] = { "text_finder", "/H", "false" };
    int argc = 3;
    CmdLine cl(argc, argv);
    return cl.hide() == false;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

int main()
{
    int n_pass = 0, n_fail = 0;
    auto run = [&](const char* name, bool ok)
    {
        report(name, ok) ? ++n_pass : ++n_fail;
    };

    run("dir_callback_invoked",                  test_dir_callback_invoked());
    run("file_callback_invoked",                 test_file_callback_invoked());
    run("file_count_matches_visited",            test_file_count_matches_visited());
    run("match_count_is_correct",                test_match_count_is_correct());
    run("visit_nonexistent_path_returns_false",  test_visit_nonexistent_path_returns_false());
    run("recursion_visits_subdirectory_files",   test_recursion_visits_subdirectory_files());
    run("no_recursion_skips_subdirectory_files", test_no_recursion_skips_subdirectory_files());
    run("extension_filter_excludes_non_matching",test_extension_filter_excludes_non_matching());
    run("cmdline_help_flag_detected",            test_cmdline_help_flag_detected());
    run("cmdline_defaults",                      test_cmdline_defaults());
    run("cmdline_no_recurse",                    test_cmdline_no_recurse());
    run("cmdline_patterns_parsed",               test_cmdline_patterns_parsed());
    run("cmdline_regex_stored",                  test_cmdline_regex_stored());
    run("cmdline_verbose_flag",                  test_cmdline_verbose_flag());
    run("match_count_zero_when_no_matches",      test_match_count_zero_when_no_matches());
    run("file_count_zero_before_visit",          test_file_count_zero_before_visit());
    run("wiring_file_and_match_counts_consistent",test_wiring_file_and_match_counts_consistent());
    run("hide_false_dir_callback_still_fires",   test_hide_false_dir_callback_still_fires());
    run("cmdline_help_text_nonempty",            test_cmdline_help_text_nonempty());
    run("cmdline_hide_false",                    test_cmdline_hide_false());

    std::cout << "\n" << n_pass << " passed, " << n_fail << " failed\n";

    return n_fail == 0 ? 0 : 1;
}