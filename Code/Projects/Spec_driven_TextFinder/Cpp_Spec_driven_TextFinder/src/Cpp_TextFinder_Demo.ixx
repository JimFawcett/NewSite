// Cpp_TextFinder_Demo.ixx - runs Cpp_TextFinder against this project and shows what it produces

export module Cpp_TextFinder_Demo;

import std;

export int runDemo(std::ostream& log, const std::filesystem::path& executable,
                   const std::filesystem::path& projectRoot);

namespace {

// Extensions this demonstration searches, per the /p rules of Spec_TextFinder.md §5.
const std::string extensions = R"("md, ixx, cpp")";

constexpr std::size_t shownLines = 14;

struct Run {
    int exitCode{0};
    std::string out;
    std::string err;
};

std::string readBytes(const std::filesystem::path& path) {
    std::ifstream file{path, std::ios::binary};
    return std::string{std::istreambuf_iterator<char>{file}, std::istreambuf_iterator<char>{}};
}

Run invoke(const std::filesystem::path& executable, const std::string& arguments,
           const std::filesystem::path& workingDirectory) {
    const std::filesystem::path outPath = workingDirectory / "demo.stdout";
    const std::filesystem::path errPath = workingDirectory / "demo.stderr";

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

std::string today() {
    const std::chrono::zoned_time local{std::chrono::current_zone(), std::chrono::system_clock::now()};
    const std::chrono::year_month_day date{std::chrono::floor<std::chrono::days>(local.get_local_time())};
    return std::format("{:%Y-%m-%d}", date);
}

std::vector<std::string> lines(const std::string& text) {
    std::vector<std::string> collected;
    std::istringstream stream{text};
    for (std::string line; std::getline(stream, line);) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        collected.push_back(line);
    }
    return collected;
}

void show(std::ostream& log, const std::filesystem::path& executable,
          const std::filesystem::path& projectRoot, std::string_view purpose,
          const std::string& arguments) {
    log << "\n" << purpose << "\n";
    log << "  $ Cpp_TextFinder" << (arguments.empty() ? "" : " ") << arguments << "\n\n";

    const Run run = invoke(executable, arguments, projectRoot);
    const std::vector<std::string> out = lines(run.out);

    for (std::size_t i = 0; i < out.size() && i < shownLines; ++i) log << "      " << out[i] << "\n";
    if (out.size() > shownLines) {
        log << "      ... " << (out.size() - shownLines) << " more\n";

        // Page_Structure.md §7.2 part 4: the run summary is the last line a traversing run
        // writes, so the excerpt above never reaches it. Show it rather than withhold it.
        if (out.back().starts_with("accessed ")) log << "      " << out.back() << "\n";
    }
    if (out.empty()) log << "      (no output)\n";

    for (const std::string& line : lines(run.err)) log << "      [stderr] " << line << "\n";

    log << "\n  " << out.size() << " line(s), exit " << run.exitCode << "\n";
}

} // namespace

int runDemo(std::ostream& log, const std::filesystem::path& executable,
            const std::filesystem::path& projectRoot) {
    log << "Cpp_TextFinder demonstration\n";
    log << "  date:       " << today() << "\n";
    log << "  executable: " << executable.string() << "\n";
    log << "  root:       " << projectRoot.string() << "\n";
    log << "  extensions: " << extensions << "\n";

    if (!std::filesystem::exists(executable)) {
        log << "\n  executable not found\n";
        return 1;
    }
    if (!std::filesystem::is_directory(projectRoot)) {
        log << "\n  project root not found\n";
        return 1;
    }

    const std::string root = "-P . -p " + extensions;

    show(log, executable, projectRoot,
         "1. No switch at all. The command line names no work, so Cpp_TextFinder lists the\n"
         "   options a real invocation would start from and exits 0 (Spec_TextFinder.md §3.1).",
         "");

    show(log, executable, projectRoot,
         "2. Default expression. The default /r of . with no /n or /L needs no file content,\n"
         "   so each selected file is reported by its path line alone (Spec_TextFinder.md §3.3).",
         root);

    show(log, executable, projectRoot,
         "3. The two-level block of §3.4: a path written once, then an indented detail line\n"
         "   per match carrying the line number and the line's text.",
         root + R"( -r "too large" -n true -L true)");

    show(log, executable, projectRoot,
         "4. The same search with /L false, leaving the line number alone on each detail line.",
         root + R"( -r "too large" -n true)");

    show(log, executable, projectRoot,
         "5. Which documents cite the parent specification. Neither /n nor /L, so every block\n"
         "   is its path line and no path is written twice.",
         root + R"( -r "Spec_TextFinder\.md")");

    show(log, executable, projectRoot,
         "6. The same search one level deep, /s false entering no subdirectory.",
         root + R"( -r "Spec_TextFinder\.md" -s false)");

    show(log, executable, projectRoot,
         "7. /h false adds a line for each file that matched nothing - the files case 5 left\n"
         "   silent - alongside the resolved option set from /v true.",
         root + R"( -r "Spec_TextFinder\.md" -h false -v true)");

    show(log, executable, projectRoot,
         "8. Two roots, traversed in the order /P gave them. Each path begins with the root\n"
         "   whose subtree holds it, and the skip list prunes build/ beneath both.",
         R"(-P Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Cmdline )"
         R"(-P Cpp_Spec_driven_TextFinder/Cpp_Spec_driven_Output )"
         R"(-p "ixx, cpp" -r "^export " -n true -L true)");

    show(log, executable, projectRoot,
         "9. A root path that cannot be opened is announced and the run still exits 0, while\n"
         "   an error announcement ignores /h true.",
         R"(-P no_such_directory )"
         R"(-P Cpp_Spec_driven_TextFinder/Cpp_TextFinder_Structure.md -r import)");

    show(log, executable, projectRoot,
         "10. A malformed expression. §5.2 puts the option listing on stdout first, so the /r\n"
         "    line shows what failed, then the diagnostic on stderr, and the exit code is 1.",
         root + R"( -r "export(")");

    show(log, executable, projectRoot,
         "11. The help text of §5.1, written to stdout under /H, traversing nothing.",
         "/H true");

    log << "\ndemonstration complete\n";
    return 0;
}
