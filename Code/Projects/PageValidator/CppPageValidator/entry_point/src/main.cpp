import validator;
import std;

// ---------------------------------------------------------------------------
// Directory skip list (matches rs_page_validator and CppTextFinder)
// ---------------------------------------------------------------------------

static constexpr std::string_view SKIP_DIRS[] = {
    "target", "bin", "obj", "build", "out",
    "__pycache__", ".venv", "venv", "dist",
    ".git", ".vs", ".idea", "archive",
};

static bool should_skip(const std::filesystem::path& path) {
    auto name = path.filename().string();
    for (auto s : SKIP_DIRS)
        if (name == s) return true;
    return false;
}

static bool is_html(const std::filesystem::path& path) {
    std::string ext = path.extension().string();
    for (char& c : ext)
        c = static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    return ext == ".html" || ext == ".htm";
}

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------

static void collect_html_files(const std::filesystem::path& path, bool recursive,
                                std::vector<std::filesystem::path>& out) {
    std::error_code ec;
    if (std::filesystem::is_regular_file(path, ec)) {
        if (is_html(path)) out.push_back(path);
        return;
    }
    if (!std::filesystem::is_directory(path, ec)) return;

    std::filesystem::directory_iterator it(path, ec);
    if (ec) {
        std::cerr << "ERROR cannot read directory: " << path.generic_string() << "\n";
        return;
    }

    std::vector<std::filesystem::path> subdirs;
    for (const auto& entry : it) {
        if (entry.is_regular_file()) {
            if (is_html(entry.path())) out.push_back(entry.path());
        } else if (recursive && entry.is_directory() && !should_skip(entry.path())) {
            subdirs.push_back(entry.path());
        }
    }
    for (const auto& subdir : subdirs)
        collect_html_files(subdir, recursive, out);
}

// ---------------------------------------------------------------------------
// Report printing
// ---------------------------------------------------------------------------

static void print_report(const Report& report, bool quiet) {
    if (report.is_valid()) {
        if (!quiet)
            std::cout << "PASS  " << report.file.generic_string() << "\n";
    } else {
        std::cout << "FAIL  " << report.file.generic_string() << "\n";
        for (const auto& e : report.errors) {
            std::cout << "      [" << e.rule << "] "
                      << e.line << ":" << e.col << " \xe2\x80\x94 " << e.message << "\n";
        }
    }
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

static constexpr const char* HELP =
    "page_validator \xe2\x80\x94 validate HTML files for structural correctness\n"
    "\n"
    "Usage:\n"
    "  page_validator [options] <path>...\n"
    "\n"
    "Arguments:\n"
    "  <path>...    HTML files or directories to validate\n"
    "\n"
    "Options:\n"
    "  -r, --recursive    Descend into subdirectories\n"
    "  -q, --quiet        Print only files with errors\n"
    "  -s, --summary      Print a pass/fail count after all files\n"
    "  -h, --help         Print this help and exit\n"
    "\n"
    "Rules checked:\n"
    "  doctype       document begins with <!DOCTYPE html>\n"
    "  root-element  exactly one <html> element\n"
    "  head-required <head> present and contains <title>\n"
    "  body-required <body> present\n"
    "  tag-nesting   every open tag has a matching close tag\n"
    "  void-elements void elements carry no close tag\n"
    "  attr-quotes   all attribute values are quoted\n"
    "  duplicate-id  id values are unique within the document\n"
    "\n"
    "Exit status: 0 = all files pass, 1 = one or more files fail.\n";

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

int main(int argc, const char* argv[]) {
    bool recursive = false;
    bool quiet     = false;
    bool summary   = false;
    std::vector<std::filesystem::path> input_paths;

    for (int i = 1; i < argc; ++i) {
        std::string_view arg = argv[i];
        if      (arg == "-r" || arg == "--recursive") recursive = true;
        else if (arg == "-q" || arg == "--quiet")     quiet     = true;
        else if (arg == "-s" || arg == "--summary")   summary   = true;
        else if (arg == "-h" || arg == "--help")      { std::cout << HELP; return 0; }
        else                                           input_paths.emplace_back(argv[i]);
    }

    if (input_paths.empty()) {
        std::cout << HELP;
        return 0;
    }

    std::vector<std::filesystem::path> files;
    for (const auto& p : input_paths)
        collect_html_files(p, recursive, files);

    if (files.empty()) {
        std::cerr << "no HTML files found\n";
        return 1;
    }

    std::size_t pass = 0, fail = 0, read_errors = 0;

    for (const auto& file : files) {
        std::ifstream ifs(file);
        if (!ifs) {
            std::cerr << "ERROR " << file.generic_string() << " \xe2\x80\x94 cannot open\n";
            ++read_errors;
            continue;
        }
        std::ostringstream oss;
        oss << ifs.rdbuf();

        Report report = Validator::validate(oss.str(), file);
        if (report.is_valid()) ++pass; else ++fail;
        print_report(report, quiet);
    }

    if (summary)
        std::cout << "\n" << pass << " passed, " << fail << " failed\n";

    return (fail > 0 || read_errors > 0) ? 1 : 0;
}
