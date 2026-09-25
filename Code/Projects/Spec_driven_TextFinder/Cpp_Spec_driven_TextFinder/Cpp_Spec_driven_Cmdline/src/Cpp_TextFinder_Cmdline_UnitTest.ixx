// Cpp_TextFinder_Cmdline_UnitTest.ixx - unit tests for Spec_Cpp_TextFinder_Cmdline.md

export module Cpp_TextFinder_Cmdline_UnitTest;

import std;
import Cpp_TextFinder_Cmdline;

export int runCmdlineUnitTests(std::ostream& log);

namespace {

struct Checker {
    std::ostream& log;
    int failures{0};
    int total{0};

    void expect(bool ok, std::string_view name) { record(ok, name); }

    void equal(const std::string& actual, const std::string& expected, std::string_view name) {
        const bool ok = actual == expected;
        record(ok, name);
        if (ok) return;
        log << "          expected: [" << expected << "]\n";
        log << "          actual:   [" << actual << "]\n";
    }

    void record(bool ok, std::string_view name) {
        ++total;
        if (!ok) ++failures;
        log << (ok ? "  PASS  " : "  FAIL  ") << name << "\n";
    }
};

std::expected<ProgramCommands, std::string> parseArgs(std::vector<std::string> args) {
    std::string program = "Cpp_TextFinder";
    std::vector<char*> argv;
    argv.push_back(program.data());
    for (std::string& argument : args) argv.push_back(argument.data());
    return parse(static_cast<int>(argv.size()), argv.data());
}

std::string joined(const std::vector<std::string>& items) {
    std::string text;
    for (std::size_t i = 0; i < items.size(); ++i) {
        if (i != 0) text += "|";
        text += items[i];
    }
    return text;
}

std::string diagnosticFor(std::vector<std::string> args) {
    const auto parsed = parseArgs(std::move(args));
    return parsed ? std::string{"<parsed>"} : parsed.error();
}

std::string withUsage(const std::string& reason) { return reason + "\n" + usageLine(); }

void testDefaults(Checker& check) {
    const auto parsed = parseArgs({});
    check.expect(parsed.has_value(), "empty command line parses");
    if (!parsed) return;

    check.equal(joined(parsed->rootPaths), ".", "default /P is .");
    check.equal(joined(parsed->extensions), "", "default /p is empty");
    check.equal(parsed->regexText, ".", "default /r is .");
    check.expect(parsed->recurse, "default /s is true");
    check.expect(parsed->suppressOnNoMatch, "default /h is true");
    check.expect(!parsed->verbose, "default /v is false");
    check.expect(!parsed->help, "default /H is false");
    check.expect(!parsed->lineNumbers, "default /n is false");
    check.expect(!parsed->matchedLine, "default /L is false");
}

void testSyntax(Checker& check) {
    const auto slash = parseArgs({"/s", "false"});
    const auto dash = parseArgs({"-s", "false"});
    check.expect(slash && dash && slash->recurse == dash->recurse, "introducers / and - are equivalent");

    const auto upper = parseArgs({"/s", "FALSE"});
    check.expect(upper && !upper->recurse, "boolean values fold case");

    const auto mixed = parseArgs({"/n", "True"});
    check.expect(mixed && mixed->lineNumbers, "True is accepted");

    const auto lastWins = parseArgs({"/r", "first", "/r", "second"});
    check.expect(lastWins && lastWins->regexText == "second", "last occurrence wins for /r");

    const auto caseSensitive = parseArgs({"/h", "false", "/H", "true"});
    check.expect(caseSensitive && !caseSensitive->suppressOnNoMatch && caseSensitive->help,
                 "/h and /H are distinct switches");

    const auto dashArgument = parseArgs({"/r", "-x"});
    check.expect(dashArgument && dashArgument->regexText == "-x",
                 "an argument beginning with an introducer is taken verbatim");
}

void testRootPaths(Checker& check) {
    const auto one = parseArgs({"/P", "src"});
    check.expect(one && joined(one->rootPaths) == "src", "first /P replaces the default");

    const auto many = parseArgs({"/P", "src", "/P", "doc", "/P", "test"});
    check.expect(many && joined(many->rootPaths) == "src|doc|test", "/P accumulates in argv order");
}

void testExtensions(Checker& check) {
    const auto trimmed = parseArgs({"/p", " cpp , rs "});
    check.expect(trimmed && joined(trimmed->extensions) == "cpp|rs", "items are trimmed");

    const auto dotted = parseArgs({"/p", ".cpp, .h"});
    check.expect(dotted && joined(dotted->extensions) == "cpp|h", "one leading dot is stripped");

    const auto spaced = parseArgs({"/p", ". cpp, .\th "});
    check.expect(spaced && joined(spaced->extensions) == "cpp|h",
                 "an item is trimmed again after its dot is stripped");
    check.expect(spaced && optionsText(*spaced).find("\n/p cpp, h\n") != std::string::npos,
                 "the second trim keeps stray whitespace out of the §5.3 listing line");

    const auto empties = parseArgs({"/p", "cpp,,rs"});
    check.expect(empties && joined(empties->extensions) == "cpp|rs", "empty items are discarded");

    const auto blank = parseArgs({"/p", "   "});
    check.expect(blank && blank->extensions.empty(), "an all-whitespace list is empty");

    const auto duplicates = parseArgs({"/p", "cpp, cpp"});
    check.expect(duplicates && joined(duplicates->extensions) == "cpp|cpp", "duplicates are retained");
}

// The reason lines are fixed by Spec_TextFinder.md §5.2.
void testDiagnostics(Checker& check) {
    check.equal(diagnosticFor({"foo"}), withUsage("not a switch: foo"), "not a switch");
    check.equal(diagnosticFor({"/z", "x"}), withUsage("unrecognized switch: /z"), "unrecognized switch");
    check.equal(diagnosticFor({"/ss", "x"}), withUsage("unrecognized switch: /ss"), "over-long switch token");
    check.equal(diagnosticFor({"/"}), withUsage("unrecognized switch: /"), "bare introducer");
    check.equal(diagnosticFor({"/r"}), withUsage("missing argument for switch: /r"), "missing argument");
    check.equal(diagnosticFor({"/s", "yes"}), withUsage("invalid boolean for /s: yes"), "invalid boolean");
    check.equal(diagnosticFor({"/P", ""}), withUsage("empty root path for switch: /P"), "empty root path");
    check.equal(diagnosticFor({"/r", ""}), withUsage("empty expression for switch: /r"), "empty expression");
    check.equal(diagnosticFor({"-s", "yes"}), withUsage("invalid boolean for -s: yes"),
                "the introducer is reproduced as typed");

    const auto stops = parseArgs({"/z", "x", "/r", "ok"});
    check.expect(!stops, "parsing stops at the first violation");
}

void testRenderedText(Checker& check) {
    const std::string help = helpText();
    const std::string usage = usageLine();

    check.expect(help.starts_with(usage), "helpText begins with usageLine");
    check.expect(usage.starts_with("usage: Cpp_TextFinder "), "usage names the executable");
    check.expect(usage.ends_with("\n"), "usageLine ends with a newline");
    check.expect(help.ends_with("\n"), "helpText ends with a newline");
    for (std::string_view letter : {"/P", "/p", "/r", "/s", "/h", "/v", "/H", "/n", "/L"})
        check.expect(help.find(std::string{"  "} + std::string{letter} + "  ") != std::string::npos,
                     std::string{"help lists "} + std::string{letter});

    check.expect(help.find("A path is never printed twice.") != std::string::npos,
                 "help describes the block layout of Spec_TextFinder.md §3.4");
    check.expect(help.find("Run with no switches at all") != std::string::npos,
                 "help describes the bare command line of Spec_TextFinder.md §3.1");
}

void testOptionsText(Checker& check) {
    ProgramCommands commands;
    commands.rootPaths = {"src", "doc"};
    commands.extensions = {"cpp", "h"};
    commands.regexText = "int main";
    commands.recurse = false;

    check.equal(optionsText(commands),
                "/P src\n/P doc\n/p cpp, h\n/r int main\n/s false\n/h true\n/v false\n/H false\n/n false\n/L false\n",
                "option listing follows §5 order");

    ProgramCommands defaults;
    check.equal(optionsText(defaults),
                "/P .\n/p\n/r .\n/s true\n/h true\n/v false\n/H false\n/n false\n/L false\n",
                "an empty /p list emits /p alone, ending no line in whitespace");
}

} // namespace

int runCmdlineUnitTests(std::ostream& log) {
    log << "Cpp_TextFinder_Cmdline unit tests\n";

    Checker check{log};
    testDefaults(check);
    testSyntax(check);
    testRootPaths(check);
    testExtensions(check);
    testDiagnostics(check);
    testRenderedText(check);
    testOptionsText(check);

    log << "  " << (check.total - check.failures) << " of " << check.total << " passed\n";
    return check.failures;
}
