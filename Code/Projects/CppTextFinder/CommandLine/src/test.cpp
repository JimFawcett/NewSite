import cmd_line;
import std;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Build a argv-style array from a vector of string literals and construct a
// CmdLine from it.  argv[0] is always a fake program name.
static CmdLine make(std::vector<const char*> args) {
    // Prepend a dummy program name
    std::vector<const char*> full;
    full.reserve(args.size() + 1);
    full.push_back("text_finder");
    for (auto a : args) full.push_back(a);
    return CmdLine(static_cast<int>(full.size()), full.data());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// Default values when no arguments are supplied
bool test_defaults() {
    CmdLine cl = make({});
    if (cl.path()    != ".")    return false;
    if (cl.regex()   != ".")    return false;
    if (cl.recurse() != true)   return false;
    if (cl.hide()    != true)   return false;
    if (cl.verbose() != false)  return false;
    if (cl.help()    != false)  return false;
    if (!cl.patterns().empty()) return false;
    return true;
}

// /P sets path()
bool test_path() {
    CmdLine cl = make({"/P", "/tmp/search"});
    return cl.path() == "/tmp/search";
}

// /r sets regex()
bool test_regex() {
    CmdLine cl = make({"/r", "foo.*bar"});
    return cl.regex() == "foo.*bar";
}

// /s false disables recurse()
bool test_recurse_false() {
    CmdLine cl = make({"/s", "false"});
    return cl.recurse() == false;
}

// /s true (explicit) enables recurse()
bool test_recurse_true_explicit() {
    CmdLine cl = make({"/s", "true"});
    return cl.recurse() == true;
}

// /s present with no value → implicit "true"
bool test_recurse_implicit_true() {
    CmdLine cl = make({"/s"});
    return cl.recurse() == true;
}

// /H false disables hide()
bool test_hide_false() {
    CmdLine cl = make({"/H", "false"});
    return cl.hide() == false;
}

// /H true (explicit) keeps hide()
bool test_hide_true_explicit() {
    CmdLine cl = make({"/H", "true"});
    return cl.hide() == true;
}

// /H present with no value → implicit "true"
bool test_hide_implicit_true() {
    CmdLine cl = make({"/H"});
    return cl.hide() == true;
}

// /v present → verbose() == true
bool test_verbose_present() {
    CmdLine cl = make({"/v"});
    return cl.verbose() == true;
}

// /v absent → verbose() == false
bool test_verbose_absent() {
    CmdLine cl = make({});
    return cl.verbose() == false;
}

// /h present → help() == true
bool test_help_present() {
    CmdLine cl = make({"/h"});
    return cl.help() == true;
}

// /h absent → help() == false
bool test_help_absent() {
    CmdLine cl = make({});
    return cl.help() == false;
}

// /p with a single extension
bool test_patterns_single() {
    CmdLine cl = make({"/p", ".cpp"});
    auto p = cl.patterns();
    if (p.size() != 1) return false;
    return p[0] == ".cpp";
}

// /p with multiple comma-separated extensions
bool test_patterns_multiple() {
    CmdLine cl = make({"/p", ".cpp,.h,.ixx"});
    auto p = cl.patterns();
    if (p.size() != 3) return false;
    return p[0] == ".cpp" && p[1] == ".h" && p[2] == ".ixx";
}

// /p absent → patterns() returns empty vector
bool test_patterns_absent() {
    CmdLine cl = make({});
    return cl.patterns().empty();
}

// /p with a single extension, no leading dot
bool test_patterns_no_dot() {
    CmdLine cl = make({"/p", "cpp,h"});
    auto p = cl.patterns();
    if (p.size() != 2) return false;
    return p[0] == "cpp" && p[1] == "h";
}

// Keys are case-sensitive: /P and /p are different options
bool test_case_sensitivity() {
    CmdLine cl = make({"/P", "/home/user", "/p", ".txt"});
    if (cl.path() != "/home/user") return false;
    auto pats = cl.patterns();
    if (pats.size() != 1) return false;
    return pats[0] == ".txt";
}

// Boolean flag followed immediately by another flag gets implicit "true"
bool test_flag_followed_by_flag() {
    CmdLine cl = make({"/v", "/h"});
    return cl.verbose() == true && cl.help() == true;
}

// Multiple options together
bool test_multiple_options() {
    CmdLine cl = make({"/P", "src", "/r", "TODO", "/s", "false", "/H", "false", "/v"});
    if (cl.path()    != "src")   return false;
    if (cl.regex()   != "TODO")  return false;
    if (cl.recurse() != false)   return false;
    if (cl.hide()    != false)   return false;
    if (cl.verbose() != true)    return false;
    if (cl.help()    != false)   return false;
    return true;
}

// Unrecognised bare token is silently ignored; defaults still apply
bool test_unrecognised_token_ignored() {
    CmdLine cl = make({"baretoken"});
    // defaults intact
    if (cl.path()    != ".")    return false;
    if (cl.regex()   != ".")    return false;
    if (cl.recurse() != true)   return false;
    if (cl.hide()    != true)   return false;
    return true;
}

// help_text() is non-empty and contains key option names
bool test_help_text_nonempty() {
    CmdLine cl = make({});
    std::string ht = cl.help_text();
    if (ht.empty()) return false;
    // Must mention each documented option
    if (ht.find("/P") == std::string::npos) return false;
    if (ht.find("/p") == std::string::npos) return false;
    if (ht.find("/s") == std::string::npos) return false;
    if (ht.find("/H") == std::string::npos) return false;
    if (ht.find("/r") == std::string::npos) return false;
    if (ht.find("/v") == std::string::npos) return false;
    if (ht.find("/h") == std::string::npos) return false;
    return true;
}

// /P with no following value → path() == "true" (implicit boolean behaviour)
bool test_path_implicit_true_when_last() {
    CmdLine cl = make({"/P"});
    // The spec says implicit "true" when the flag is last
    return cl.path() == "true";
}

// /r with no following value → regex() == "true"
bool test_regex_implicit_true_when_last() {
    CmdLine cl = make({"/r"});
    return cl.regex() == "true";
}

// Repeated key: last write wins (map semantics)
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
        { "verbose_absent",                test_verbose_absent                },
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