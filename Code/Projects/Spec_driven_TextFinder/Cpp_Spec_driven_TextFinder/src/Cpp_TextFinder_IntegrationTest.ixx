// Cpp_TextFinder_IntegrationTest.ixx - drives the built executable end to end, covering Cpp_TextFinder_Entry

export module Cpp_TextFinder_IntegrationTest;

import std;

export int runIntegrationTests(std::ostream& log, const std::filesystem::path& executable);

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

struct Run {
    int exitCode{0};
    std::string out;
    std::string err;
};

std::string readBytes(const std::filesystem::path& path) {
    std::ifstream file{path, std::ios::binary};
    return std::string{std::istreambuf_iterator<char>{file}, std::istreambuf_iterator<char>{}};
}

// Spec_TextFinder.md §3.4 fixes LF as the terminator for records and announcements, and
// Cpp_TextFinder_Output enforces it on stdout. Nothing fixes the terminator for the help
// text of §5.1 or the usage diagnostics of §5.2, both of which bypass that sink, so on
// Windows they arrive CRLF-translated. Comparisons of those two normalize first.
std::string normalized(const std::string& text) {
    std::string folded;
    for (std::size_t i = 0; i < text.size(); ++i) {
        if (text[i] == '\r' && i + 1 < text.size() && text[i + 1] == '\n') continue;
        folded += text[i];
    }
    return folded;
}

// Sorts lines so assertions do not depend on the filesystem's entry order (Spec_TextFinder.md §3.2).
std::string sortedLines(const std::string& text) {
    std::vector<std::string> lines;
    std::istringstream stream{text};
    for (std::string line; std::getline(stream, line);) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        lines.push_back(line);
    }
    std::ranges::sort(lines);

    std::string joined;
    for (const std::string& line : lines) joined += line + "\n";
    return joined;
}

Run invoke(const std::filesystem::path& executable, const std::string& arguments,
           const std::filesystem::path& workingDirectory) {
    const std::filesystem::path outPath = workingDirectory / "stdout.capture";
    const std::filesystem::path errPath = workingDirectory / "stderr.capture";

    const std::filesystem::path previous = std::filesystem::current_path();
    std::filesystem::current_path(workingDirectory);

    std::string command = "\"" + executable.string() + "\" " + arguments +
                          " > \"" + outPath.string() + "\" 2> \"" + errPath.string() + "\"";
#ifdef _WIN32
    command = "\"" + command + "\"";   // cmd /c strips the outermost pair
#endif

    const int status = std::system(command.c_str());
    std::filesystem::current_path(previous);

    Run result;
#ifdef _WIN32
    result.exitCode = status;
#else
    result.exitCode = (status & 0xFF00) >> 8;
#endif
    result.out = readBytes(outPath);
    result.err = readBytes(errPath);
    std::filesystem::remove(outPath);
    std::filesystem::remove(errPath);
    return result;
}

void writeFile(const std::filesystem::path& path, std::string_view bytes) {
    std::filesystem::create_directories(path.parent_path());
    std::ofstream file{path, std::ios::binary};
    file.write(bytes.data(), static_cast<std::streamsize>(bytes.size()));
}

std::filesystem::path buildTree() {
    const std::filesystem::path root =
        std::filesystem::temp_directory_path() / "Cpp_TextFinder_IntegrationTest";
    std::filesystem::remove_all(root);
    std::filesystem::create_directories(root);

    writeFile(root / "src" / "a.cpp", "int main() {\nreturn 0;\n}");
    writeFile(root / "src" / "notes.txt", "int main is here");
    writeFile(root / "src" / "sub" / "b.cpp", "int main(int argc) { }");
    writeFile(root / "build" / "skipme.cpp", "int main() {}");
    writeFile(root / "src" / "binary.cpp", std::string_view{"int\0main", 8});
    return root;
}

const std::string usage =
    R"(usage: Cpp_TextFinder [/P path] [/p "ext, ext"] [/r regex] [/s bool] [/h bool] [/v bool] [/H bool] [/n bool] [/L bool])"
    "\n";

void testSearch(Checker& check, const std::filesystem::path& exe, const std::filesystem::path& tree) {
    const Run plain = invoke(exe, R"(-P src -r "int main" -n false -L false)", tree);
    check.expect(plain.exitCode == 0, "a normal search exits 0");
    check.equal(sortedLines(plain.out), "src/a.cpp\nsrc/notes.txt\nsrc/sub/b.cpp\n",
                "records name every matching file, the NUL file excluded");
    check.expect(plain.err.empty(), "a normal search writes nothing to stderr");

    const Run whole = invoke(exe, R"(-P . -r "int main" -n false -L false)", tree);
    check.equal(sortedLines(whole.out), "src/a.cpp\nsrc/notes.txt\nsrc/sub/b.cpp\n",
                "build/ is pruned by the default skip list");

    const Run full = invoke(exe, R"(-P src/a.cpp -r "return" -n true -L true)", tree);
    check.equal(full.out, "src/a.cpp - 2 - return 0;\n", "/n and /L true carry all three fields");

    const Run once = invoke(exe, R"(-P src/a.cpp -r "\{|\}")", tree);
    check.equal(once.out, "src/a.cpp\n", "a path-only record is emitted once per matching file");

    const Run bare = invoke(exe, "-P src", tree);
    check.equal(sortedLines(bare.out),
                "src/a.cpp\nsrc/binary.cpp\nsrc/notes.txt\nsrc/sub/b.cpp\n",
                "a bare command line lists every selected file without reading it");

    const Run filtered = invoke(exe, R"(-P src -r "int main" -p cpp -n false -L false)", tree);
    check.equal(sortedLines(filtered.out), "src/a.cpp\nsrc/sub/b.cpp\n", "/p filters by extension");

    const Run shallow = invoke(exe, R"(-P src -r "int main" -s false -n false -L false)", tree);
    check.equal(sortedLines(shallow.out), "src/a.cpp\nsrc/notes.txt\n",
                "/s false enters no subdirectory");

    const Run twoRoots = invoke(exe, R"(-P src/sub -P src/a.cpp -r "int main" -n false -L false)", tree);
    check.equal(twoRoots.out, "src/sub/b.cpp\nsrc/a.cpp\n", "roots are traversed in the order given");
}

void testAnnouncements(Checker& check, const std::filesystem::path& exe, const std::filesystem::path& tree) {
    const Run loud = invoke(exe, R"(-P src -r "int main" -h false -n false -L false)", tree);
    check.expect(loud.out.find("searched src/a.cpp\n") != std::string::npos,
                 "/h false announces a searched file");
    check.expect(loud.out.find("skipped src/binary.cpp\n") != std::string::npos,
                 "/h false announces a file rejected by the NUL test");

    const Run quiet = invoke(exe, R"(-P src -r "int main" -n false -L false)", tree);
    check.expect(quiet.out.find("searched") == std::string::npos,
                 "/h true suppresses file announcements");

    const Run missing = invoke(exe, R"(-P nosuchpath -r ".")", tree);
    check.equal(missing.out, "cannot open nosuchpath\n",
                "an unopenable root announces through the output component");
    check.expect(missing.exitCode == 0, "an unopenable root does not affect the exit code");
}

void testProcessConcerns(Checker& check, const std::filesystem::path& exe, const std::filesystem::path& tree) {
    const Run help = invoke(exe, "-H true", tree);
    check.expect(help.exitCode == 0, "/H exits 0");
    check.expect(normalized(help.out).starts_with(usage), "/H prints the help text");
    check.expect(help.out.find("suppress file announcements") != std::string::npos,
                 "help describes /h in its current terms");

    const Run verbose = invoke(exe, R"(-v true -P src/a.cpp -r "return" -n false -L false)", tree);
    check.expect(verbose.out.starts_with("/P src/a.cpp\n/p \n/r return\n"),
                 "/v lists the resolved options before the records");
    check.expect(verbose.out.ends_with("src/a.cpp\n"), "records follow the /v listing");

    const Run terminators = invoke(exe, R"(-P src -r "int main" -n false -L false)", tree);
    check.expect(terminators.out.find('\r') == std::string::npos,
                 "output carries LF only, on every platform");
}

// Reason lines are fixed by Spec_TextFinder.md §5.2.
void testDiagnostics(Checker& check, const std::filesystem::path& exe, const std::filesystem::path& tree) {
    struct Case {
        std::string arguments;
        std::string reason;
        std::string name;
    };

    const std::vector<Case> cases{
        {"foo", "not a switch: foo", "not a switch"},
        {"-z x", "unrecognized switch: -z", "unrecognized switch"},
        {"-r", "missing argument for switch: -r", "missing argument"},
        {"-s yes", "invalid boolean for -s: yes", "invalid boolean"},
        {R"(-P "")", "empty root path for switch: -P", "empty root path"},
        {R"(-r "")", "empty expression for switch: -r", "empty expression"},
        {R"(-r "int(")", "invalid regex for switch: /r", "invalid regex"},
    };

    for (const Case& item : cases) {
        const Run run = invoke(exe, item.arguments, tree);
        check.equal(normalized(run.err), item.reason + "\n" + usage, item.name + " diagnostic");
        check.expect(run.exitCode == 1, item.name + " exits 1");
        check.expect(run.out.empty(), item.name + " writes nothing to stdout");
    }
}

} // namespace

int runIntegrationTests(std::ostream& log, const std::filesystem::path& executable) {
    log << "Cpp_TextFinder integration tests\n";

    if (!std::filesystem::exists(executable)) {
        log << "  FAIL executable not found at " << executable.string() << "\n";
        return 1;
    }

    Checker check{log};
    const std::filesystem::path tree = buildTree();

    testSearch(check, executable, tree);
    testAnnouncements(check, executable, tree);
    testProcessConcerns(check, executable, tree);
    testDiagnostics(check, executable, tree);

    std::filesystem::remove_all(tree);

    log << "  " << (check.total - check.failures) << " of " << check.total << " passed\n";
    return check.failures;
}
