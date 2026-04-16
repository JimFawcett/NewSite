import output;
import std;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Create a temporary file with the given content and return its path.
// Returns empty string on failure.
static std::string make_temp_file(const std::string& content)
{
    namespace fs = std::filesystem;

    // Use a unique name under the system temp directory
    static std::atomic<int> counter{ 0 };
    int id = counter.fetch_add(1, std::memory_order_relaxed);

    fs::path p = fs::temp_directory_path() /
                 ("output_test_" + std::to_string(id) + ".txt");

    std::ofstream ofs(p, std::ios::binary);
    if (!ofs)
        return {};

    ofs << content;
    ofs.close();
    return p.string();
}

// Remove a file; silently ignore errors.
static void remove_file(const std::string& path)
{
    std::error_code ec;
    std::filesystem::remove(path, ec);
}

// Capture everything written to std::cout during the execution of f().
static std::string capture(std::function<void()> f)
{
    std::ostringstream oss;
    std::streambuf* old = std::cout.rdbuf(oss.rdbuf());
    f();
    std::cout.rdbuf(old);
    return oss.str();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// 1. Default constructor: match_count starts at zero.
static bool test_default_match_count_is_zero()
{
    Output out;
    return out.match_count() == 0;
}

// 2. on_dir() with hide=false prints the directory immediately.
static bool test_on_dir_hide_false_prints_immediately()
{
    Output out(/*hide=*/false);
    std::string captured = capture([&]{ out.on_dir("/some/dir"); });
    // Should contain the directory path
    return captured.find("/some/dir") != std::string::npos;
}

// 3. on_dir() with hide=true does NOT print immediately.
static bool test_on_dir_hide_true_no_immediate_print()
{
    Output out(/*hide=*/true);
    std::string captured = capture([&]{ out.on_dir("/some/dir"); });
    return captured.find("/some/dir") == std::string::npos;
}

// 4. set_hide(false) after construction behaves like hide=false.
static bool test_set_hide_false_prints_on_dir()
{
    Output out(/*hide=*/true);
    out.set_hide(false);
    std::string captured = capture([&]{ out.on_dir("/dir"); });
    return captured.find("/dir") != std::string::npos;
}

// 5. set_hide(true) after construction behaves like hide=true.
static bool test_set_hide_true_no_print_on_dir()
{
    Output out(/*hide=*/false);
    out.set_hide(true);
    std::string captured = capture([&]{ out.on_dir("/dir"); });
    return captured.find("/dir") == std::string::npos;
}

// 6. on_file() with a matching file increments match_count.
static bool test_on_file_match_increments_count()
{
    std::string path = make_temp_file("hello world");
    if (path.empty()) return false;

    // Extract dir and filename
    std::filesystem::path p(path);
    std::string dir  = p.parent_path().string();
    std::string file = p.filename().string();

    Output out;
    out.set_regex("hello");
    out.on_dir(dir);
    capture([&]{ out.on_file(file); });

    remove_file(path);
    return out.match_count() == 1;
}

// 7. on_file() with a non-matching file does NOT increment match_count.
static bool test_on_file_no_match_no_count()
{
    std::string path = make_temp_file("hello world");
    if (path.empty()) return false;

    std::filesystem::path p(path);
    std::string dir  = p.parent_path().string();
    std::string file = p.filename().string();

    Output out;
    out.set_regex("ZZZNOMATCH999");
    out.on_dir(dir);
    capture([&]{ out.on_file(file); });

    remove_file(path);
    return out.match_count() == 0;
}

// 8. on_file() matching with hide=true prints the directory header lazily.
static bool test_on_file_match_hide_true_prints_dir_header()
{
    std::string path = make_temp_file("foo bar");
    if (path.empty()) return false;

    std::filesystem::path p(path);
    std::string dir  = p.parent_path().string();
    std::string file = p.filename().string();

    Output out(/*hide=*/true);
    out.set_regex("foo");

    std::string captured = capture([&]{
        out.on_dir(dir);
        out.on_file(file);
    });

    remove_file(path);
    return captured.find(dir) != std::string::npos &&
           captured.find(file) != std::string::npos;
}

// 9. hide=true: directory header printed only once even for multiple matches.
static bool test_on_file_dir_header_printed_once()
{
    std::string path1 = make_temp_file("needle");
    std::string path2 = make_temp_file("needle");
    if (path1.empty() || path2.empty())
    {
        remove_file(path1);
        remove_file(path2);
        return false;
    }

    std::filesystem::path p1(path1);
    std::filesystem::path p2(path2);
    std::string dir   = p1.parent_path().string();
    std::string file1 = p1.filename().string();
    std::string file2 = p2.filename().string();

    Output out(/*hide=*/true);
    out.set_regex("needle");

    std::string captured = capture([&]{
        out.on_dir(dir);
        out.on_file(file1);
        out.on_file(file2);
    });

    remove_file(path1);
    remove_file(path2);

    // Count occurrences of dir in output
    std::size_t count = 0;
    std::size_t pos   = 0;
    while ((pos = captured.find(dir, pos)) != std::string::npos)
    {
        ++count;
        pos += dir.size();
    }

    // Should appear exactly once
    return count == 1 && out.match_count() == 2;
}

// 10. hide=false: directory printed by on_dir, not again on match.
static bool test_on_file_hide_false_dir_not_duplicated()
{
    std::string path = make_temp_file("content");
    if (path.empty()) return false;

    std::filesystem::path p(path);
    std::string dir  = p.parent_path().string();
    std::string file = p.filename().string();

    Output out(/*hide=*/false);
    out.set_regex("content");

    std::string captured = capture([&]{
        out.on_dir(dir);
        out.on_file(file);
    });

    remove_file(path);

    // Count occurrences
    std::size_t count = 0;
    std::size_t pos   = 0;
    while ((pos = captured.find(dir, pos)) != std::string::npos)
    {
        ++count;
        pos += dir.size();
    }

    return count == 1 && out.match_count() == 1;
}

// 11. on_dir resets the "already printed" flag for the next directory.
static bool test_on_dir_resets_printed_flag()
{
    std::string path1 = make_temp_file("match");
    std::string path2 = make_temp_file("match");
    if (path1.empty() || path2.empty())
    {
        remove_file(path1);
        remove_file(path2);
        return false;
    }

    std::filesystem::path p1(path1);
    std::filesystem::path p2(path2);
    // Both files may live in the same OS temp dir; we simulate two separate
    // logical directories by using two different directory strings.
    std::string dir1  = p1.parent_path().string() + "/virtual_dir_A";
    std::string dir2  = p2.parent_path().string() + "/virtual_dir_B";
    std::string file1 = p1.filename().string();
    std::string file2 = p2.filename().string();

    // We need the files to be reachable via the constructed path.
    // Re-use the actual parent for both, only vary the reported dir string
    // by patching on_dir – but on_file builds path as dir+"/"+file.
    // For this test we use the real parent as dir1 and dir2:
    dir1 = p1.parent_path().string();
    dir2 = p2.parent_path().string(); // same physical dir, same string

    Output out(/*hide=*/true);
    out.set_regex("match");

    std::string captured = capture([&]{
        // Visit dir1 with file1
        out.on_dir(dir1);
        out.on_file(file1);
        // Visit dir2 (same path here) — flag must reset
        out.on_dir(dir2);
        out.on_file(file2);
    });

    remove_file(path1);
    remove_file(path2);

    // dir header should appear twice (once per on_dir/on_file pair)
    std::size_t count = 0;
    std::size_t pos   = 0;
    while ((pos = captured.find(dir1, pos)) != std::string::npos)
    {
        ++count;
        pos += dir1.size();
    }

    return count == 2 && out.match_count() == 2;
}

// 12. set_regex() changes the active pattern.
static bool test_set_regex_changes_pattern()
{
    std::string path = make_temp_file("apple banana");
    if (path.empty()) return false;

    std::filesystem::path p(path);
    std::string dir  = p.parent_path().string();
    std::string file = p.filename().string();

    Output out;
    out.set_regex("ZZZNOMATCH");
    out.on_dir(dir);
    capture([&]{ out.on_file(file); });
    std::size_t before = out.match_count();

    // Now change the regex to something that matches
    out.set_regex("banana");
    out.on_dir(dir);
    capture([&]{ out.on_file(file); });
    std::size_t after = out.match_count();

    remove_file(path);
    return before == 0 && after == 1;
}

// 13. Default regex "." matches any non-empty file.
static bool test_default_regex_matches_nonempty_file()
{
    std::string path = make_temp_file("x");
    if (path.empty()) return false;

    std::filesystem::path p(path);
    std::string dir  = p.parent_path().string();
    std::string file = p.filename().string();

    Output out; // default pattern "."
    out.on_dir(dir);
    capture([&]{ out.on_file(file); });

    remove_file(path);
    return out.match_count() == 1;
}

// 14. Non-existent file does not increment match_count and does not throw.
static bool test_nonexistent_file_no_match_no_throw()
{
    Output out;
    out.on_dir("/nonexistent_dir_xyz");
    bool threw = false;
    try
    {
        capture([&]{ out.on_file("ghost_file_xyz.txt"); });
    }
    catch (...)
    {
        threw = true;
    }
    return !threw && out.match_count() == 0;
}

// 15. Invalid regex pattern causes find() to return false (no match, no throw).
static bool test_invalid_regex_no_throw()
{
    std::string path = make_temp_file("some content");
    if (path.empty()) return false;

    std::filesystem::path p(path);
    std::string dir  = p.parent_path().string();
    std::string file = p.filename().string();

    Output out;
    out.set_regex("[invalid(regex");

    bool threw = false;
    try
    {
        out.on_dir(dir);
        capture([&]{ out.on_file(file); });
    }
    catch (...)
    {
        threw = true;
    }

    remove_file(path);
    return !threw && out.match_count() == 0;
}

// 16. on_file() prints the filename (indented) in the output when matched.
static bool test_on_file_prints_filename()
{
    std::string path = make_temp_file("target_content");
    if (path.empty()) return false;

    std::filesystem::path p(path);
    std::string dir  = p.parent_path().string();
    std::string file = p.filename().string();

    Output out(/*hide=*/true);
    out.set_regex("target_content");

    std::string captured = capture([&]{
        out.on_dir(dir);
        out.on_file(file);
    });

    remove_file(path);
    return captured.find(file) != std::string::npos;
}

// 17. Multiple calls to on_file() accumulate match_count correctly.
static bool test_multiple_files_accumulate_count()
{
    std::string p1 = make_temp_file("hello");
    std::string p2 = make_temp_file("hello");
    std::string p3 = make_temp_file("hello");
    if (p1.empty() || p2.empty() || p3.empty())
    {
        remove_file(p1); remove_file(p2); remove_file(p3);
        return false;
    }

    std::filesystem::path fp1(p1), fp2(p2), fp3(p3);
    std::string dir = fp1.parent_path().string();

    Output out;
    out.set_regex("hello");
    out.on_dir(dir);

    capture([&]{
        out.on_file(fp1.filename().string());
        out.on_file(fp2.filename().string());
        out.on_file(fp3.filename().string());
    });

    remove_file(p1); remove_file(p2); remove_file(p3);
    return out.match_count() == 3;
}

// 18. match_count() is const and callable on a const Output.
static bool test_match_count_is_const()
{
    const Output out;
    return out.match_count() == 0;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

int main()
{
    using TestFn = std::pair<const char*, bool(*)()>;

    const TestFn tests[] = {
        { "default_match_count_is_zero",         test_default_match_count_is_zero         },
        { "on_dir_hide_false_prints_immediately", test_on_dir_hide_false_prints_immediately},
        { "on_dir_hide_true_no_immediate_print",  test_on_dir_hide_true_no_immediate_print },
        { "set_hide_false_prints_on_dir",         test_set_hide_false_prints_on_dir        },
        { "set_hide_true_no_print_on_dir",        test_set_hide_true_no_print_on_dir       },
        { "on_file_match_increments_count",       test_on_file_match_increments_count      },
        { "on_file_no_match_no_count",            test_on_file_no_match_no_count           },
        { "on_file_match_hide_true_prints_dir",   test_on_file_match_hide_true_prints_dir_header},
        { "on_file_dir_header_printed_once",      test_on_file_dir_header_printed_once     },
        { "on_file_hide_false_dir_not_duplicated",test_on_file_hide_false_dir_not_duplicated},
        { "on_dir_resets_printed_flag",           test_on_dir_resets_printed_flag          },
        { "set_regex_changes_pattern",            test_set_regex_changes_pattern           },
        { "default_regex_matches_nonempty_file",  test_default_regex_matches_nonempty_file },
        { "nonexistent_file_no_match_no_throw",   test_nonexistent_file_no_match_no_throw  },
        { "invalid_regex_no_throw",               test_invalid_regex_no_throw              },
        { "on_file_prints_filename",              test_on_file_prints_filename             },
        { "multiple_files_accumulate_count",      test_multiple_files_accumulate_count     },
        { "match_count_is_const",                 test_match_count_is_const                },
    };

    bool all_passed = true;

    for (const auto& [name, fn] : tests)
    {
        bool result = fn();
        std::cout << (result ? "PASS" : "FAIL") << "  " << name << "\n";
        if (!result)
            all_passed = false;
    }

    return all_passed ? 0 : 1;
}