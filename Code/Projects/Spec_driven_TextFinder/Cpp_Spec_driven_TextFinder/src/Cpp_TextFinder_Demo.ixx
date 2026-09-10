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
    log << "  $ Cpp_TextFinder " << arguments << "\n\n";

    const Run run = invoke(executable, arguments, projectRoot);
    const std::vector<std::string> out = lines(run.out);

    for (std::size_t i = 0; i < out.size() && i < shownLines; ++i) log << "      " << out[i] << "\n";
    if (out.size() > shownLines) log << "      ... " << (out.size() - shownLines) << " more\n";
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
         "1. Bare expression. The default /r of . with no /n or /L needs no file content,\n"
         "   so every selected file is listed from its path alone (Spec_TextFinder.md §3.3).",
         root);

    show(log, executable, projectRoot,
         "2. Where each C++ module is declared, with line numbers and matched text.",
         root + R"( -r "^export module" -n true -L true)");

    show(log, executable, projectRoot,
         "3. Which documents cite the parent specification, paths only.",
         root + R"( -r "Spec_TextFinder\.md")");

    show(log, executable, projectRoot,
         "4. The same search one level deep, /s false entering no subdirectory.",
         root + R"( -r "Spec_TextFinder\.md" -s false)");

    show(log, executable, projectRoot,
         "5. Announcements turned on with /h false, alongside the resolved option set from /v true.",
         root + R"( -r "usageLine" -h false -v true -n true)");

    show(log, executable, projectRoot,
         "6. A malformed expression, refused before traversal with the diagnostic of §5.2.",
         root + R"( -r "export(")");

    log << "\ndemonstration complete\n";
    return 0;
}
