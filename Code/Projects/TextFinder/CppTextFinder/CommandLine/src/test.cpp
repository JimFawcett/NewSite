import cmd_line;
import std;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

static CmdLine make(std::vector<const char*> args) {
    std::vector<const char*> full;
    full.reserve(args.size() + 1);
    full.push_back("text_finder");
    for (auto a : args) full.push_back(a);
    return CmdLine(static_cast<int>(full.size()), full.data());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

bool test_defaults() {
    CmdLine cl = make({});
    if (cl.path()    != ".")  return false;
    if (cl.regex()   != ".")  return false;
    if (!cl.recurse())        return false;
    if (!cl.hide())           return false;
    if (cl.verbose())         return false;
    if (cl.help())            return false;
    if (!cl.patterns().empty()) return false;
    return true;
}

bool test_path() {
    CmdLine cl = make({"/P", "/tmp/search"});
    return cl.path() == "/tmp/search";
}

bool test_regex() {
    CmdLine cl = make({"/r", "foo.*bar"});
    return cl.regex() == "foo.*bar";
}

bool test_recurse_false() {
    CmdLine cl = make({"/s", "false"});
    return !cl.recurse();
}

bool test_recurse_true_explicit() {
    CmdLine cl = make({"/s", "true"});
    return cl.recurse();
}

bool test_recurse_implicit_true() {
    CmdLine cl = make({"/s"});
    return cl.recurse();
}

bool test_hide_false() {
    CmdLine cl = make({"/H", "false"});
    return !cl.hide();
}

bool test_hide_true_explicit() {
    CmdLine cl = make({"/H", "true"});
    return cl.hide();
}

bool test_hide_implicit_true() {
    CmdLine cl = make({"/H"});
    return cl.hide();
}

bool test_verbose_present() {
    CmdLine cl = make({"/v"});
    return cl.verbose();
}

bool test_verbose_absent() {
    CmdLine cl = make({});
    return !cl.verbose();
}

bool test_help_present() {
    CmdLine cl = make({"/h"});
    return cl.help();
}

bool test_help_absent() {
    CmdLine cl = make({});
    return !cl.help();
}

bool test_patterns_single() {
    CmdLine cl = make({"/p", ".cpp"});
    auto p = cl.patterns();
    if (p.size() != 1) return false;
    return p[0] == ".cpp";
}

bool test_patterns_multiple() {
    CmdLine cl = make({"/p", ".cpp,.h,.ixx"});
    auto p = cl.patterns();
    if (p.size() != 3) return false;
    return p[0] == ".cpp" && p[1] == ".h" && p[2] == ".ixx";
}

bool test_patterns_absent() {
    CmdLine cl = make({});
    return cl.patterns().empty();
}

bool test_patterns_no_dot() {
    CmdLine cl = make({"/p", "cpp,h"});
    auto p = cl.patterns();
    if (p.size() != 2) return false;
    return p[0] == "cpp" && p[1] == "h";
}

bool test_case_sensitivity() {
    CmdLine cl = make({"/P", "/home/user", "/p", ".txt"});
    if (cl.path() != "/home/user") return false;
    auto pats = cl.patterns();
    if (pats.size() != 1) return false;
    return pats[0] == ".txt";
}

bool test_flag_followed_by_flag() {
    CmdLine cl = make({"/v", "/h"});
    return cl.verbose() && cl.help();
}

bool test_multiple_options() {
    CmdLine cl = make({"/P", "src", "/r", "TODO", "/s", "false", "/H", "false", "/v"});
    if (cl.path()    != "src")  return false;
    if (cl.regex()   != "TODO") return false;
    if (cl.recurse())           return false;
    if (cl.hide())              return false;
    if (!cl.verbose())          return false;
    if (cl.help())              return false;
    return true;
}

bool test_unrecognised_token_ignored() {
    CmdLine cl = make({"baretoken"});
    if (cl.path()  != ".") return false;
    if (cl.regex() != ".") return false;
    if (!cl.recurse())     return false;
    if (!cl.hide())        return false;
    return true;
}

bool test_help_text_nonempty() {
    std::string ht = CmdLine::help_text();
    if (ht.empty()) return false;
    if (ht.find("/P") == std::string::npos) return false;
    if (ht.find("/p") == std::string::npos) return false;
    if (ht.find("/s") == std::string::npos) return false;
    if (ht.find("/H") == std::string::npos) return false;
    if (ht.find("/r") == std::string::npos) return false;
    if (ht.find("/v") == std::string::npos) return false;
    if (ht.find("/h") == std::string::npos) return false;
    return true;
}

bool test_path_implicit_true_when_last() {
    CmdLine cl = make({"/P"});
    return cl.path() == "true";
}

bool test_regex_implicit_true_when_last() {
    CmdLine cl = make({"/r"});
    return cl.regex() == "true";
}

bool test_last_value_wins() {
    CmdLine cl = make({"/r", "first", "/r", "second"});
    return cl.regex() == "second";
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
        { "defaults",                      test_defaults                      },
        { "path",                          test_path                          },
        { "regex",                         test_regex                         },
        { "recurse_false",                 test_recurse_false                 },
        { "recurse_true_explicit",         test_recurse_true_explicit         },
        { "recurse_implicit_true",         test_recurse_implicit_true         },
        { "hide_false",                    test_hide_false                    },
        { "hide_true_explicit",            test_hide_true_explicit            },
        { "hide_implicit_true",            test_hide_implicit_true            },
        { "verbose_present",               test_verbose_present               },
        { "verbose_absent",               test_verbose_absent                 },
        { "help_present",                  test_help_present                  },
        { "help_absent",                   test_help_absent                   },
        { "patterns_single",               test_patterns_single               },
        { "patterns_multiple",             test_patterns_multiple             },
        { "patterns_absent",               test_patterns_absent               },
        { "patterns_no_dot",               test_patterns_no_dot               },
        { "case_sensitivity",              test_case_sensitivity              },
        { "flag_followed_by_flag",         test_flag_followed_by_flag         },
        { "multiple_options",              test_multiple_options              },
        { "unrecognised_token_ignored",    test_unrecognised_token_ignored    },
        { "help_text_nonempty",            test_help_text_nonempty            },
        { "path_implicit_true_when_last",  test_path_implicit_true_when_last  },
        { "regex_implicit_true_when_last", test_regex_implicit_true_when_last },
        { "last_value_wins",               test_last_value_wins               },
    };

    bool all_passed = true;
    for (const auto& t : tests) {
        bool passed = t.fn();
        std::cout << (passed ? "PASS" : "FAIL") << "  " << t.name << "\n";
        if (!passed) all_passed = false;
    }

    return all_passed ? 0 : 1;
}
