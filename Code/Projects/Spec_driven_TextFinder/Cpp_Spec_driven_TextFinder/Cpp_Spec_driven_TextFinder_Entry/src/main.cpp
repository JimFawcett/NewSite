// main.cpp - Cpp_TextFinder entry point, per Spec_Cpp_TextFinder_Entry.md

import std;
import Cpp_TextFinder_Cmdline;
import Cpp_TextFinder_Dirnav;
import Cpp_TextFinder_Output;

namespace {

// Defaults from Spec_TextFinder.md §3.2, owned by the binary.
SkipList skipList{"archive", ".git",         ".svn", ".hg", "build",        "out",
                  "target",  "bin",          "obj",  "__pycache__",         "node_modules"};

// Spec_TextFinder.md §3.5 - a code-level extension point, not exposed at runtime.
[[maybe_unused]] void addSkipDirectory(const std::string& name) {
    if (std::ranges::find(skipList, name) == skipList.end()) skipList.push_back(name);
}

} // namespace

int main(int argc, char* argv[]) {
    const auto parsed = parse(argc, argv);
    if (!parsed) {
        std::cerr << parsed.error();
        return 1;
    }
    const ProgramCommands& commands = *parsed;

    if (commands.help) {
        std::cout << helpText();
        return 0;
    }

    std::optional<Cpp_TextFinder_Output> out;
    try {
        out.emplace();
    }
    catch (const std::exception&) {
        std::cerr << "cannot initialize output\n";
        return 1;
    }

    if (commands.verbose) std::cout << optionsText(commands);

    std::optional<Cpp_TextFinder_Dirnav<Cpp_TextFinder_Output>> dirnav;
    try {
        dirnav.emplace(*out, skipList, commands);
    }
    catch (const std::regex_error&) {
        std::cerr << "invalid regex for switch: /r\n" << usageLine();
        return 1;
    }

    for (const std::string& root : commands.rootPaths) dirnav->search(std::filesystem::path{root});

    return 0;
}
