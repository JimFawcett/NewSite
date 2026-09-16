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

// Emitted lines in emission order, joined with '|'. A block's path line and its detail
// lines are ordered by Spec_TextFinder.md §3.4, so block tests compare this directly.
std::string search(const std::filesystem::path& root, const ProgramCommands& commands,
                   const SkipList& skips = defaultSkips) {
    Recorder recorder;
    Cpp_TextFinder_Dirnav<Recorder> navigator{recorder, skips, commands};
    navigator.search(root);
    return recorder.joined();
}

// Sorts those lines, for tree-wide tests that must not depend on the filesystem's
// entry order (Spec_TextFinder.md §3.2). Only used where every file yields one line.
std::string sorted(const std::string& joined) {
    if (joined.empty()) return joined;

    std::vector<std::string> lines;
    for (std::size_t pos = 0; pos <= joined.size();) {
        const std::size_t bar = joined.find('|', pos);
        lines.push_back(joined.substr(pos, bar == std::string::npos ? std::string::npos : bar - pos));
        if (bar == std::string::npos) break;
        pos = bar + 1;
    }
    std::ranges::sort(lines);

    std::string text;
    for (std::size_t i = 0; i < lines.size(); ++i) {
        if (i != 0) text += "|";
        text += lines[i];
    }
    return text;
}

// §8.1: the summary line alone, from a run over the given roots. One navigator serves
// them all, as Cpp_TextFinder_Entry uses it, so the counts accumulate across them.
std::string summaryOf(const std::vector<std::filesystem::path>& roots,
                      const ProgramCommands& commands, const SkipList& skips = defaultSkips) {
    Recorder recorder;
    Cpp_TextFinder_Dirnav<Recorder> navigator{recorder, skips, commands};
    for (const std::filesystem::path& root : roots) navigator.search(root);
    navigator.emitRunSummary();

    const std::string joined = recorder.joined();
    const std::size_t bar = joined.rfind('|');
    return bar == std::string::npos ? joined : joined.substr(bar + 1);
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

    check.equal(relative(sorted(search(root, commands)), root), ".gitignore|a.cpp|notes.txt|sub/b.cpp",
                "skip list prunes build/, and the NUL file is not searched");

    ProgramCommands byExtension = commands;
    byExtension.extensions = {"cpp"};
    check.equal(relative(sorted(search(root, byExtension)), root), "a.cpp|sub/b.cpp",
                "/p selects by extension");

    ProgramCommands dotFile = commands;
    dotFile.extensions = {"gitignore"};
    check.equal(relative(sorted(search(root, dotFile)), root), ".gitignore",
                "a dot-file's extension is its last dot-suffix");

    ProgramCommands shallow = commands;
    shallow.recurse = false;
    check.equal(relative(sorted(search(root, shallow)), root), ".gitignore|a.cpp|notes.txt",
                "/s false searches the root's own files only");

    ProgramCommands unpruned = commands;
    check.equal(relative(sorted(search(root, unpruned, SkipList{})), root),
                ".gitignore|a.cpp|build/skipme.cpp|notes.txt|sub/b.cpp",
                "an empty skip list prunes nothing");
}

// Spec_TextFinder.md §3.2: the skip list governs directories met during traversal,
// never a root path the user named.
void testSkipListRootExemption(Checker& check, const std::filesystem::path& root) {
    ProgramCommands commands;
    commands.regexText = "int main";

    check.equal(relative(sorted(search(root / "build", commands)), root), "build/skipme.cpp",
                "a root whose name is in the skip list is traversed, not pruned");

    check.equal(relative(sorted(search(root, commands)), root), ".gitignore|a.cpp|notes.txt|sub/b.cpp",
                "the same directory reached during traversal is still pruned");
}

void testBlockForms(Checker& check, const std::filesystem::path& root) {
    ProgramCommands commands;
    commands.regexText = "return";
    commands.extensions = {"cpp"};

    ProgramCommands both = commands;
    both.lineNumbers = true;
    both.matchedLine = true;
    check.equal(relative(search(root / "a.cpp", both), root), "a.cpp|  2 - return 0;",
                "/n and /L true give a path line and an indented number-and-text detail line");

    ProgramCommands textOnly = commands;
    textOnly.matchedLine = true;
    check.equal(relative(search(root / "a.cpp", textOnly), root), "a.cpp|  return 0;",
                "/n false leaves the detail line carrying the text alone");

    ProgramCommands numberOnly = commands;
    numberOnly.lineNumbers = true;
    check.equal(relative(search(root / "a.cpp", numberOnly), root), "a.cpp|  2",
                "/L false leaves the detail line carrying the number alone");

    check.equal(relative(search(root / "a.cpp", commands), root), "a.cpp",
                "with neither /n nor /L a block is its path line alone");

    // Spec_TextFinder.md §3.4: the path is written once per block, whatever the match count.
    const std::filesystem::path repeated =
        std::filesystem::temp_directory_path() / "Cpp_TextFinder_Dirnav_UnitTest_Repeat";
    std::filesystem::remove_all(repeated);
    writeFile(repeated / "many.txt", "hit one\nmiss\nhit two\nhit three");

    ProgramCommands pathOnly;
    pathOnly.regexText = "hit";
    check.equal(relative(search(repeated / "many.txt", pathOnly), repeated), "many.txt",
                "a block with no detail lines stops at the first match");

    ProgramCommands numbered = pathOnly;
    numbered.lineNumbers = true;
    check.equal(relative(search(repeated / "many.txt", numbered), repeated), "many.txt|  1|  3|  4",
                "three matching lines yield three detail lines under one path line");

    std::filesystem::remove_all(repeated);
}

void testAnnouncements(Checker& check, const std::filesystem::path& root) {
    ProgramCommands quiet;
    quiet.regexText = "nothing matches this";
    check.equal(relative(sorted(search(root, quiet)), root), "",
                "/h true emits nothing for a file that matched nothing");

    // Only a.cpp holds "return", so the other three are searched without matching.
    ProgramCommands loud;
    loud.regexText = "return";
    loud.suppressOnNoMatch = false;
    check.equal(relative(sorted(search(root, loud)), root),
                "a.cpp|searched .gitignore|searched notes.txt|searched sub/b.cpp|skipped binary.cpp",
                "/h false announces every file that produced no block, and only those");

    ProgramCommands hushed = loud;
    hushed.suppressOnNoMatch = true;
    check.equal(relative(sorted(search(root, hushed)), root), "a.cpp",
                "/h true leaves the matching file's block and nothing else");

    const std::string announced = relative(search(root, loud), root);
    check.expect(announced.find("searched a.cpp") == std::string::npos,
                 "a file that matched is never announced - its block already names it");
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

    check.equal(relative(search(root / "crlf.txt", commands), root), "crlf.txt|  2|  3",
                "CRLF terminates a line and is not part of it");
    check.equal(relative(search(root / "cr.txt", commands), root), "cr.txt|  2|  3",
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
    check.equal(relative(sorted(search(root, defaults)), root),
                ".gitignore|a.cpp|binary.cpp|notes.txt|sub/b.cpp",
                "the default options report every selected file, the NUL file among them");

    const std::filesystem::path empties =
        std::filesystem::temp_directory_path() / "Cpp_TextFinder_Dirnav_UnitTest_Empty";
    std::filesystem::remove_all(empties);
    writeFile(empties / "empty.txt", "");
    writeFile(empties / "content.txt", "x");

    check.equal(relative(sorted(search(empties, defaults)), empties), "content.txt",
                "an empty file is not reported, having no line to match");

    ProgramCommands withText = defaults;
    withText.matchedLine = true;
    check.equal(relative(search(empties / "content.txt", withText), empties), "content.txt|  x",
                "asking for the matched line reads the file again and adds a detail line");

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

// §8.1 and Spec_TextFinder.md §3.6. The shared tree holds four files and one subdirectory
// under the root, plus the pruned build/ and its one file.
void testRunSummary(Checker& check, const std::filesystem::path& root) {
    ProgramCommands commands;
    commands.regexText = "int main";

    check.equal(summaryOf({root}, commands), "accessed 5 files, 2 directories",
                "every examined file and every entered directory is counted");

    ProgramCommands byExtension = commands;
    byExtension.extensions = {"cpp"};
    check.equal(summaryOf({root}, byExtension), "accessed 3 files, 2 directories",
                "a file the /p list excluded is not counted");

    ProgramCommands unmatched = commands;
    unmatched.extensions = {"nosuchextension"};
    check.equal(summaryOf({root}, unmatched), "accessed 0 files, 2 directories",
                "a directory holding no selected file is still counted");

    ProgramCommands shallow = commands;
    shallow.recurse = false;
    check.equal(summaryOf({root}, shallow), "accessed 4 files, 1 directories",
                "under /s false no subdirectory is counted");

    check.equal(summaryOf({root}, commands, SkipList{}), "accessed 6 files, 3 directories",
                "a pruned directory and its files are counted once the list no longer prunes it");

    check.equal(summaryOf({root / "a.cpp"}, commands), "accessed 1 files, 0 directories",
                "a root that is a regular file counts as a file, and neither noun is inflected");

    check.equal(summaryOf({root / "nosuchpath"}, commands), "accessed 0 files, 0 directories",
                "a root that cannot be opened is counted as neither");

    check.equal(summaryOf({root / "sub", root / "a.cpp"}, commands), "accessed 2 files, 1 directories",
                "the counts are of the whole run, not of one root");

    check.equal(summaryOf({root / "sub", root / "sub"}, commands), "accessed 2 files, 2 directories",
                "an entry reached under two roots counts once for each");

    ProgramCommands loud = commands;
    loud.suppressOnNoMatch = false;
    check.equal(summaryOf({root}, loud), summaryOf({root}, commands),
                "the summary is not gated on /h");

    ProgramCommands noContent;   // the default . with neither /n nor /L
    check.equal(summaryOf({root}, noContent), "accessed 5 files, 2 directories",
                "the no-content case counts the files it never opens");
}

int runDirnavUnitTests(std::ostream& log) {
    log << "Cpp_TextFinder_Dirnav unit tests\n";

    Checker check{log};
    const std::filesystem::path root = buildTree();

    testSelectionAndPruning(check, root);
    testSkipListRootExemption(check, root);
    testBlockForms(check, root);
    testAnnouncements(check, root);
    testNoContentCase(check, root);
    testLineHandling(check);
    testSizeLimit(check);
    testRunSummary(check, root);

    std::filesystem::remove_all(root);

    log << "  " << (check.total - check.failures) << " of " << check.total << " passed\n";
    return check.failures;
}
