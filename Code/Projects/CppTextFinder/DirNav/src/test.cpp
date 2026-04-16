import dir_nav;

import std;

// ---------------------------------------------------------------------------
// Helpers — create/remove a temporary directory tree for tests that need real
// filesystem access.
// ---------------------------------------------------------------------------

namespace {

// Portable temp-directory root
std::filesystem::path make_temp_root(const std::string& suffix) {
    auto base = std::filesystem::temp_directory_path() / ("dirnav_test_" + suffix);
    std::filesystem::remove_all(base);
    std::filesystem::create_directories(base);
    return base;
}

void touch(const std::filesystem::path& p) {
    std::filesystem::create_directories(p.parent_path());
    std::ofstream ofs(p);  // create / truncate
}

} // anonymous namespace

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// 1. visit() returns false for a non-existent path
bool test_visit_nonexistent_returns_false() {
    DirNav nav;
    return !nav.visit("/this/path/should/never/exist_xyz_abc_123");
}

// 2. visit() returns false for a regular file (not a directory)
bool test_visit_file_returns_false() {
    auto root = make_temp_root("visit_file");
    auto file = root / "afile.txt";
    touch(file);

    DirNav nav;
    bool result = !nav.visit(file);

    std::filesystem::remove_all(root);
    return result;
}

// 3. visit() returns true for a valid directory
bool test_visit_valid_dir_returns_true() {
    auto root = make_temp_root("valid_dir");

    DirNav nav;
    bool result = nav.visit(root);

    std::filesystem::remove_all(root);
    return result;
}

// 4. dir_callback is invoked for the root directory
bool test_dir_callback_fires_for_root() {
    auto root = make_temp_root("dir_cb_root");

    std::vector<std::string> dirs_seen;
    DirNav nav;
    nav.set_dir_handler([&](const std::string& d){ dirs_seen.push_back(d); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    // Root should appear exactly once
    return dirs_seen.size() == 1;
}

// 5. file_callback fires for each file in root (no pattern filter)
bool test_file_callback_fires_for_all_files() {
    auto root = make_temp_root("file_cb_all");
    touch(root / "a.cpp");
    touch(root / "b.h");
    touch(root / "c.txt");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 3;
}

// 6. file_count() and dir_count() reflect visited entries
bool test_counts_are_correct() {
    auto root = make_temp_root("counts");
    touch(root / "f1.cpp");
    touch(root / "f2.cpp");
    // one subdirectory with one file
    touch(root / "sub" / "f3.cpp");

    DirNav nav;          // recurse = true by default
    nav.visit(root);

    std::filesystem::remove_all(root);
    // dirs: root + sub = 2; files: f1, f2, f3 = 3
    return nav.file_count() == 3 && nav.dir_count() == 2;
}

// 7. add_pattern() restricts files reported to matching extensions
bool test_pattern_filter() {
    auto root = make_temp_root("pattern");
    touch(root / "a.cpp");
    touch(root / "b.h");
    touch(root / "c.txt");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.add_pattern("cpp");
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 1 && files_seen[0] == "a.cpp";
}

// 8. Multiple patterns work together
bool test_multiple_patterns() {
    auto root = make_temp_root("multi_pattern");
    touch(root / "a.cpp");
    touch(root / "b.h");
    touch(root / "c.txt");
    touch(root / "d.md");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.add_pattern("cpp");
    nav.add_pattern("h");
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 2;
}

// 9. set_recurse(false) prevents descending into subdirectories
bool test_no_recurse() {
    auto root = make_temp_root("no_recurse");
    touch(root / "top.txt");
    touch(root / "sub" / "deep.txt");

    std::vector<std::string> files_seen;
    DirNav nav(false);   // no recursion
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 1 && files_seen[0] == "top.txt";
}

// 10. set_recurse(bool) via setter method
bool test_set_recurse_method() {
    auto root = make_temp_root("set_recurse");
    touch(root / "top.txt");
    touch(root / "sub" / "deep.txt");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.set_recurse(false);
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 1;
}

// 11. Default skip list skips "build" directory
bool test_default_skip_build() {
    auto root = make_temp_root("skip_build");
    touch(root / "build" / "artifact.o");
    touch(root / "src" / "main.cpp");

    std::vector<std::string> dirs_seen;
    DirNav nav;
    nav.set_dir_handler([&](const std::string& d){ dirs_seen.push_back(d); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    // "build" should not appear
    for (const auto& d : dirs_seen) {
        std::filesystem::path p(d);
        if (p.filename().string() == "build") return false;
    }
    return true;
}

// 12. Default skip list skips "target" directory
bool test_default_skip_target() {
    auto root = make_temp_root("skip_target");
    touch(root / "target" / "release" / "app");
    touch(root / "src" / "lib.cpp");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    // Only lib.cpp should be seen
    return files_seen.size() == 1 && files_seen[0] == "lib.cpp";
}

// 13. Default skip list skips ".git" directory
bool test_default_skip_git() {
    auto root = make_temp_root("skip_git");
    touch(root / ".git" / "HEAD");
    touch(root / "readme.md");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    return files_seen.size() == 1 && files_seen[0] == "readme.md";
}

// 14. add_skip() adds a user-defined skip name
bool test_add_skip_custom() {
    auto root = make_temp_root("add_skip");
    touch(root / "ignored_dir" / "secret.txt");
    touch(root / "included_dir" / "visible.txt");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.add_skip("ignored_dir");
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    return files_seen.size() == 1 && files_seen[0] == "visible.txt";
}

// 15. add_skip() is idempotent — adding the same name twice has no ill effect
bool test_add_skip_idempotent() {
    auto root = make_temp_root("skip_idem");
    touch(root / "skip_me" / "a.txt");
    touch(root / "keep_me" / "b.txt");

    DirNav nav;
    nav.add_skip("skip_me");
    nav.add_skip("skip_me");   // duplicate — must not cause double-count or crash

    std::vector<std::string> files_seen;
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    return files_seen.size() == 1 && files_seen[0] == "b.txt";
}

// 16. Default skip names cannot be cancelled by re-adding them (they stay in list)
bool test_default_skips_remain_after_custom_adds() {
    auto root = make_temp_root("skip_persist");
    touch(root / "build" / "out.o");
    touch(root / "main.cpp");

    DirNav nav;
    nav.add_skip("something_else");

    std::vector<std::string> files_seen;
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    return files_seen.size() == 1 && files_seen[0] == "main.cpp";
}

// 17. dir_callback receives the root path (path contains expected component)
bool test_dir_callback_path_content() {
    auto root = make_temp_root("dir_cb_path");

    std::vector<std::string> dirs_seen;
    DirNav nav;
    nav.set_dir_handler([&](const std::string& d){ dirs_seen.push_back(d); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    if (dirs_seen.empty()) return false;
    // The reported path should contain the temp-root directory name
    std::string expected_fragment = "dirnav_test_dir_cb_path";
    return dirs_seen[0].find(expected_fragment) != std::string::npos;
}

// 18. dir_callback fires for each subdirectory when recursing
bool test_dir_callback_fires_for_subdirs() {
    auto root = make_temp_root("dir_cb_subs");
    touch(root / "sub1" / "a.txt");
    touch(root / "sub2" / "b.txt");

    std::vector<std::string> dirs_seen;
    DirNav nav;
    nav.set_dir_handler([&](const std::string& d){ dirs_seen.push_back(d); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    // root + sub1 + sub2 = 3 directories
    return dirs_seen.size() == 3;
}

// 19. dir_callback NOT fired for skipped directories
bool test_dir_callback_not_fired_for_skipped() {
    auto root = make_temp_root("dir_cb_skip");
    touch(root / "build" / "out.o");
    touch(root / "src" / "main.cpp");

    std::vector<std::string> dirs_seen;
    DirNav nav;
    nav.set_dir_handler([&](const std::string& d){ dirs_seen.push_back(d); });
    nav.visit(root);

    std::filesystem::remove_all(root);

    for (const auto& d : dirs_seen) {
        std::filesystem::path p(d);
        if (p.filename().string() == "build") return false;
    }
    return true;
}

// 20. Counts reset between successive calls to visit()
bool test_counts_reset_between_visits() {
    auto root1 = make_temp_root("reset1");
    touch(root1 / "a.txt");
    touch(root1 / "b.txt");

    auto root2 = make_temp_root("reset2");
    touch(root2 / "x.txt");

    DirNav nav;
    nav.visit(root1);
    // After first visit: file_count==2, dir_count==1
    bool first_ok = (nav.file_count() == 2 && nav.dir_count() == 1);

    nav.visit(root2);
    // After second visit: file_count==1, dir_count==1
    bool second_ok = (nav.file_count() == 1 && nav.dir_count() == 1);

    std::filesystem::remove_all(root1);
    std::filesystem::remove_all(root2);

    return first_ok && second_ok;
}

// 21. Empty directory: dir_count==1, file_count==0
bool test_empty_directory() {
    auto root = make_temp_root("empty_dir");

    DirNav nav;
    bool ok = nav.visit(root);

    std::filesystem::remove_all(root);

    return ok && nav.dir_count() == 1 && nav.file_count() == 0;
}

// 22. File with no extension — only matched when pattern list is empty
bool test_file_no_extension_no_pattern() {
    auto root = make_temp_root("no_ext_no_pat");
    touch(root / "Makefile");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 1;
}

// 23. File with no extension is NOT reported when a pattern is active
bool test_file_no_extension_with_pattern() {
    auto root = make_temp_root("no_ext_with_pat");
    touch(root / "Makefile");
    touch(root / "main.cpp");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.add_pattern("cpp");
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 1 && files_seen[0] == "main.cpp";
}

// 24. No crash / no callback when callbacks are not set
bool test_no_crash_without_callbacks() {
    auto root = make_temp_root("no_cb");
    touch(root / "a.cpp");
    touch(root / "sub" / "b.cpp");

    DirNav nav;
    bool ok = false;
    try {
        ok = nav.visit(root);
    } catch (...) {
        ok = false;
    }

    std::filesystem::remove_all(root);
    return ok;
}

// 25. Deeply nested directories are traversed when recurse==true
bool test_deep_recursion() {
    auto root = make_temp_root("deep_recurse");
    // depth-3 nesting
    touch(root / "a" / "b" / "c" / "deep.txt");

    std::vector<std::string> files_seen;
    DirNav nav;
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 1 && files_seen[0] == "deep.txt";
}

// 26. set_recurse(false) prevents ALL subdirectory descent (not just one level)
bool test_no_recurse_blocks_all_levels() {
    auto root = make_temp_root("no_rec_deep");
    touch(root / "top.txt");
    touch(root / "sub" / "mid.txt");
    touch(root / "sub" / "inner" / "deep.txt");

    std::vector<std::string> files_seen;
    DirNav nav(false);
    nav.set_file_handler([&](const std::string& f){ files_seen.push_back(f); });
    nav.visit(root);

    std::filesystem::remove_all(root);
    return files_seen.size() == 1 && files_seen[0] == "top.txt";
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

int main() {
    struct Test {
        const char* name;
        bool (*fn)();
    };

    const Test tests[] = {
        { "visit_nonexistent_returns_false",            test_visit_nonexistent_returns_false },
        { "visit_file_returns_false",                   test_visit_file_returns_false },
        { "visit_valid_dir_returns_true",               test_visit_valid_dir_returns_true },
        { "dir_callback_fires_for_root",                test_dir_callback_fires_for_root },
        { "file_callback_fires_for_all_files",          test_file_callback_fires_for_all_files },
        { "counts_are_correct",                         test_counts_are_correct },
        { "pattern_filter",                             test_pattern_filter },
        { "multiple_patterns",                          test_multiple_patterns },
        { "no_recurse",                                 test_no_recurse },
        { "set_recurse_method",                         test_set_recurse_method },
        { "default_skip_build",                         test_default_skip_build },
        { "default_skip_target",                        test_default_skip_target },
        { "default_skip_git",                           test_default_skip_git },
        { "add_skip_custom",                            test_add_skip_custom },
        { "add_skip_idempotent",                        test_add_skip_idempotent },
        { "default_skips_remain_after_custom_adds",     test_default_skips_remain_after_custom_adds },
        { "dir_callback_path_content",                  test_dir_callback_path_content },
        { "dir_callback_fires_for_subdirs",             test_dir_callback_fires_for_subdirs },
        { "dir_callback_not_fired_for_skipped",         test_dir_callback_not_fired_for_skipped },
        { "counts_reset_between_visits",                test_counts_reset_between_visits },
        { "empty_directory",                            test_empty_directory },
        { "file_no_extension_no_pattern",               test_file_no_extension_no_pattern },
        { "file_no_extension_with_pattern",             test_file_no_extension_with_pattern },
        { "no_crash_without_callbacks",                 test_no_crash_without_callbacks },
        { "deep_recursion",                             test_deep_recursion },
        { "no_recurse_blocks_all_levels",               test_no_recurse_blocks_all_levels },
    };

    bool all_passed = true;
    for (const auto& t : tests) {
        bool passed = false;
        try {
            passed = t.fn();
        } catch (const std::exception& ex) {
            std::cerr << "  EXCEPTION in " << t.name << ": " << ex.what() << '\n';
            passed = false;
        } catch (...) {
            std::cerr << "  UNKNOWN EXCEPTION in " << t.name << '\n';
            passed = false;
        }
        std::println("{}: {}", passed ? "PASS" : "FAIL", t.name);
        if (!passed) all_passed = false;
    }

    return all_passed ? 0 : 1;
}