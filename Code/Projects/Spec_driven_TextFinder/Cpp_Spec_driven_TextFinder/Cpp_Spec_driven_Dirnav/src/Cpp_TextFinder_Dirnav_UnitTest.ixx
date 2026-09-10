// Cpp_TextFinder_Dirnav_UnitTest.ixx - unit tests for Spec_Cpp_TextFinder_Dirnav.md

export module Cpp_TextFinder_Dirnav_UnitTest;

import std;
import Cpp_TextFinder_Cmdline;
import Cpp_TextFinder_Dirnav;

export int runDirnavUnitTests(std::ostream& log);

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

// Collects what Cpp_TextFinder_Dirnav emits, standing in for Cpp_TextFinder_Output.
class Recorder : public Output {
public:
    void output(const std::string& text) override { lines_.push_back(text); }

    std::string joined() const {
        std::string text;
        for (std::size_t i = 0; i < lines_.size(); ++i) {
            if (i != 0) text += "|";
            text += lines_[i];
        }
        return text;
    }

private:
    std::vector<std::string> lines_;
};

const SkipList defaultSkips{"archive", ".git", ".svn", ".hg",          "build", "out",
                            "target",  "bin",  "obj",  "__pycache__", "node_modules"};

void writeFile(const std::filesystem::path& path, std::string_view bytes) {
    std::filesystem::create_directories(path.parent_path());
    std::ofstream file{path, std::ios::binary};
    file.write(bytes.data(), static_cast<std::streamsize>(bytes.size()));
}

// A tree the traversal tests share. Entry order within a directory is the filesystem's,
// so assertions sort the emitted lines rather than assume an order.
std::filesystem::path buildTree() {
    const std::filesystem::path root =
        std::filesystem::temp_directory_path() / "Cpp_TextFinder_Dirnav_UnitTest";
    std::filesystem::remove_all(root);

    writeFile(root / "a.cpp", "int main() {\nreturn 0;\n}");
    writeFile(root / "notes.txt", "int main is here");
    writeFile(root / ".gitignore", "int main");
    writeFile(root / "sub" / "b.cpp", "int main(int argc) { }");
    writeFile(root / "build" / "skipme.cpp", "int main() {}");
    writeFile(root / "binary.cpp", std::string_view{"int\0main", 8});
    return root;
}

std::string search(const std::filesystem::path& root, const ProgramCommands& commands,
                   const SkipList& skips = defaultSkips) {
    Recorder recorder;
    Cpp_TextFinder_Dirnav<Recorder> navigator{recorder, skips, commands};
    navigator.search(root);

    std::vector<std::string> lines;
    std::string text = recorder.joined();
    for (std::size_t pos = 0; !text.empty() && pos <= text.size();) {
        const std::size_t bar = text.find('|', pos);
        lines.push_back(text.substr(pos, bar == std::string::npos ? std::string::npos : bar - pos));
        if (bar == std::string::npos) break;
        pos = bar + 1;
    }
    std::ranges::sort(lines);

    std::string sorted;
    for (std::size_t i = 0; i < lines.size(); ++i) {
        if (i != 0) sorted += "|";
        sorted += lines[i];
    }
    return sorted;
}

// Strips the temp-directory prefix so expectations stay readable.
std::string relative(const std::string& emitted, const std::filesystem::path& root) {
    std::string prefix = root.generic_string() + "/";
    std::string text = emitted;
    for (std::size_t at = text.find(prefix); at != std::string::npos; at = text.find(prefix))
        text.erase(at, prefix.size());
    return text;
}

void testSelectionAndPruning(Checker& check, const std::filesystem::path& root) {
    ProgramCommands commands;
    commands.regexText = "int main";
    commands.lineNumbers = false;
    commands.matchedLine = false;

    check.equal(relative(search(root, commands), root), ".gitignore|a.cpp|notes.txt|sub/b.cpp",
                "skip list prunes build/, and the NUL file is not searched");

    ProgramCommands byExtension = commands;
    byExtension.extensions = {"cpp"};
    check.equal(relative(search(root, byExtension), root), "a.cpp|sub/b.cpp",
                "/p selects by extension");

    ProgramCommands dotFile = commands;
    dotFile.extensions = {"gitignore"};
    check.equal(relative(search(root, dotFile), root), ".gitignore",
                "a dot-file's extension is its last dot-suffix");

    ProgramCommands shallow = commands;
    shallow.recurse = false;
    check.equal(relative(search(root, shallow), root), ".gitignore|a.cpp|notes.txt",
                "/s false searches the root's own files only");

    ProgramCommands unpruned = commands;
    check.equal(relative(search(root, unpruned, SkipList{}), root),
                ".gitignore|a.cpp|build/skipme.cpp|notes.txt|sub/b.cpp",
                "an empty skip list prunes nothing");
}

void testRecordForms(Checker& check, const std::filesystem::path& root) {
    ProgramCommands commands;
    commands.regexText = "return";
    commands.extensions = {"cpp"};

    ProgramCommands both = commands;
    both.lineNumbers = true;
    both.matchedLine = true;
    check.equal(relative(search(root / "a.cpp", both), root), "a.cpp - 2 - return 0;",
                "/n and /L true carry path, line number, and text");

    ProgramCommands textOnly = commands;
    textOnly.matchedLine = true;
    check.equal(relative(search(root / "a.cpp", textOnly), root), "a.cpp - return 0;",
                "/n false omits the line number and its separator");

    ProgramCommands numberOnly = commands;
    numberOnly.lineNumbers = true;
    check.equal(relative(search(root / "a.cpp", numberOnly), root), "a.cpp - 2",
                "/L false omits the matched line and its separator");

    check.equal(relative(search(root / "a.cpp", commands), root), "a.cpp",
                "the default record is the path alone");

    // Spec_TextFinder.md §3.4: a path-only record tells no two matches in a file apart.
    const std::filesystem::path repeated =
        std::filesystem::temp_directory_path() / "Cpp_TextFinder_Dirnav_UnitTest_Repeat";
    std::filesystem::remove_all(repeated);
    writeFile(repeated / "many.txt", "hit one\nmiss\nhit two\nhit three");

    ProgramCommands pathOnly;
    pathOnly.regexText = "hit";
    check.equal(relative(search(repeated / "many.txt", pathOnly), repeated), "many.txt",
                "three matching lines yield one path-only record");

    ProgramCommands numbered = pathOnly;
    numbered.lineNumbers = true;
    check.equal(relative(search(repeated / "many.txt", numbered), repeated),
                "many.txt - 1|many.txt - 3|many.txt - 4",
                "asking for the line number brings every matching line back");

    std::filesystem::remove_all(repeated);
}

void testAnnouncements(Checker& check, const std::filesystem::path& root) {
    ProgramCommands quiet;
    quiet.regexText = "nothing matches this";
    check.equal(relative(search(root, quiet), root), "",
                "/h true emits no file announcement");

    ProgramCommands loud = quiet;
    loud.suppressNoMatch = false;
    const std::string announced = relative(search(root, loud), root);
    check.expect(announced.find("searched a.cpp") != std::string::npos,
                 "/h false announces a searched file");
    check.expect(announced.find("skipped binary.cpp") != std::string::npos,
                 "/h false announces a file rejected by the NUL test");
    check.expect(announced.find("build/") == std::string::npos,
                 "a pruned directory is not announced");

    ProgramCommands missing;
    missing.regexText = ".";
    check.equal(relative(search(root / "nosuchpath", missing), root), "cannot open nosuchpath",
                "an unopenable root draws an error announcement under /h true");
}

void testLineHandling(Checker& check) {
    const std::filesystem::path root =
        std::filesystem::temp_directory_path() / "Cpp_TextFinder_Dirnav_UnitTest_Lines";
    std::filesystem::remove_all(root);

    writeFile(root / "crlf.txt", "one\r\ntwo\r\nthree");
    writeFile(root / "cr.txt", "one\rtwo\rthree");
    writeFile(root / "bom.txt", "\xEF\xBB\xBF" "first");

    ProgramCommands commands;
    commands.regexText = "^t";
    commands.lineNumbers = true;

    check.equal(relative(search(root / "crlf.txt", commands), root), "crlf.txt - 2|crlf.txt - 3",
                "CRLF terminates a line and is not part of it");
    check.equal(relative(search(root / "cr.txt", commands), root), "cr.txt - 2|cr.txt - 3",
                "a bare CR terminates a line");

    ProgramCommands anchored;
    anchored.regexText = "^first$";
    check.equal(relative(search(root / "bom.txt", anchored), root), "bom.txt",
                "a leading BOM is not part of the first line");

    std::filesystem::remove_all(root);
}

// Spec_TextFinder.md §3.3: the default expression with no line or text field needs no content.
void testNoContentCase(Checker& check, const std::filesystem::path& root) {
    ProgramCommands defaults;
    check.equal(relative(search(root, defaults), root),
                ".gitignore|a.cpp|binary.cpp|notes.txt|sub/b.cpp",
                "a bare command line reports every selected file, the NUL file among them");

    const std::filesystem::path empties =
        std::filesystem::temp_directory_path() / "Cpp_TextFinder_Dirnav_UnitTest_Empty";
    std::filesystem::remove_all(empties);
    writeFile(empties / "empty.txt", "");
    writeFile(empties / "content.txt", "x");

    check.equal(relative(search(empties, defaults), empties), "content.txt",
                "an empty file is not reported, having no line to match");

    ProgramCommands withText = defaults;
    withText.matchedLine = true;
    check.equal(relative(search(empties / "content.txt", withText), empties), "content.txt - x",
                "asking for the matched line reads the file again");

    std::filesystem::remove_all(empties);
}

void testSizeLimit(Checker& check) {
    const std::filesystem::path root =
        std::filesystem::temp_directory_path() / "Cpp_TextFinder_Dirnav_UnitTest_Size";
    std::filesystem::remove_all(root);

    writeFile(root / "big.txt", std::string(10u * 1024u * 1024u + 1u, 'x'));
    writeFile(root / "atlimit.txt", std::string(10u * 1024u * 1024u, 'x'));

    ProgramCommands commands;
    commands.regexText = "x";
    commands.lineNumbers = false;
    commands.matchedLine = false;

    check.equal(relative(search(root / "big.txt", commands), root), "too large big.txt",
                "a file above 10 MB draws an error announcement under /h true");
    check.equal(relative(search(root / "atlimit.txt", commands), root), "atlimit.txt",
                "a file exactly at the limit is searched");

    std::filesystem::remove_all(root);
}

} // namespace

int runDirnavUnitTests(std::ostream& log) {
    log << "Cpp_TextFinder_Dirnav unit tests\n";

    Checker check{log};
    const std::filesystem::path root = buildTree();

    testSelectionAndPruning(check, root);
    testRecordForms(check, root);
    testAnnouncements(check, root);
    testNoContentCase(check, root);
    testLineHandling(check);
    testSizeLimit(check);

    std::filesystem::remove_all(root);

    log << "  " << (check.total - check.failures) << " of " << check.total << " passed\n";
    return check.failures;
}
