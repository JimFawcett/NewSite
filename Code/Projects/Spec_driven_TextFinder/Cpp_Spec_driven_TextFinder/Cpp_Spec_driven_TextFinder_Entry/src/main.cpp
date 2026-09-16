// main.cpp - Cpp_TextFinder entry point, per Spec_Cpp_TextFinder_Entry.md

import std;
import Cpp_TextFinder_Cmdline;
import Cpp_TextFinder_Dirnav;
import Cpp_TextFinder_Output;

namespace {

// §5: the defaults of Spec_TextFinder.md §3.2, owned by the binary.
SkipList skipList{"archive", ".git", ".svn", ".hg",          "build", "out",
                  "target",  "bin",  "obj",  "__pycache__",  "node_modules"};

// §5: the build-time extension point of Spec_TextFinder.md §3.5. Defined here and exported
// from nothing, so no library and no test can call it; calls are compiled in alongside it.
[[maybe_unused]] void addSkipDirectory(const std::string& name) {
    if (std::ranges::find(skipList, name) == skipList.end()) skipList.push_back(name);
}

} // namespace

// §4: the startup sequence, in order. Every exit below is a return from main, never
// std::exit, so the Cpp_TextFinder_Output destructor flushes stdout on every path out.
int main(int argc, char* argv[]) {
    // Step 1. Nothing has reached stdout yet, so this diagnostic needs no flush before it.
    const auto parsed = parse(argc, argv);
    if (!parsed) {
        std::cerr << parsed.error();
        return 1;
    }
    const ProgramCommands& commands = *parsed;

    // Step 2. Before anything reaches stdout: constructing it puts the stream into the
    // mode Spec_TextFinder.md §3.4 requires, and the help text below depends on that too.
    std::optional<Cpp_TextFinder_Output> out;
    try {
        out.emplace();
    }
    catch (const std::exception&) {
        std::cerr << "cannot initialize output\n";
        return 2;
    }

    // Step 3.
    if (commands.help) {
        std::cout << helpText();
        return 0;
    }

    // Step 4. Spec_TextFinder.md §3.1: a command line bearing no switch at all names no
    // work. argc is read for this and nothing else; no element of argv is inspected.
    if (argc == 1) {
        std::cout << optionsText(commands);
        return 0;
    }

    // Step 5. Mutually exclusive with step 4: a command line bearing /v is not bare.
    if (commands.verbose) std::cout << optionsText(commands);

    // Step 6.
    const SkipList& skips = skipList;

    // Step 7. Regex compilation happens in the constructor.
    std::optional<Cpp_TextFinder_Dirnav<Cpp_TextFinder_Output>> dirnav;
    try {
        dirnav.emplace(*out, skips, commands);
    }
    catch (const std::regex_error&) {
        // Spec_TextFinder.md §5.2: the listing goes to stdout whatever /v says, so the /r
        // line shows the expression that failed, and is not repeated when /v produced it.
        if (!commands.verbose) std::cout << optionsText(commands);
        std::cout.flush();   // ahead of stderr, which is unit-buffered where stdout is not
        std::cerr << "invalid regex for switch: /r\n" << usageLine();
        return 1;
    }

    // Step 8. One reused instance, one root path at a time, in the order /P gave them.
    // Every root-path failure is announced by Cpp_TextFinder_Dirnav and affects nothing here.
    for (const std::string& root : commands.rootPaths) dirnav->search(std::filesystem::path{root});

    // Step 9. Only main knows the last root path has returned.
    dirnav->emitRunSummary();

    // Step 10.
    return 0;
}
