import cmd_line;
import dir_nav;
import output;
import std;

int main(int argc, const char* argv[])
{
    // Show help when no arguments are supplied
    if (argc == 1)
    {
        CmdLine cl_help(argc, argv);
        std::cout << cl_help.help_text();
        return 0;
    }

    CmdLine cl(argc, argv);

    // Show help when /h is present
    if (cl.help())
    {
        std::cout << cl.help_text();
        return 0;
    }

    // Verbose: echo all options before searching
    if (cl.verbose())
    {
        std::cout << "Options:\n"
                  << "  /P  " << cl.path()    << "\n"
                  << "  /r  " << cl.regex()   << "\n"
                  << "  /s  " << (cl.recurse() ? "true" : "false") << "\n"
                  << "  /H  " << (cl.hide()    ? "true" : "false") << "\n";

        auto patterns = cl.patterns();
        if (patterns.empty())
        {
            std::cout << "  /p  (all files)\n";
        }
        else
        {
            std::cout << "  /p  ";
            for (std::size_t i = 0; i < patterns.size(); ++i)
            {
                if (i > 0) std::cout << ",";
                std::cout << patterns[i];
            }
            std::cout << "\n";
        }
        std::cout << std::endl;
    }

    // Validate the root path before starting the walk
    {
        std::error_code ec;
        std::filesystem::path root(cl.path());

        bool exists = std::filesystem::exists(root, ec);
        if (ec || !exists)
        {
            std::cerr << "error: path does not exist: " << cl.path() << "\n";
            return 1;
        }

        bool is_dir = std::filesystem::is_directory(root, ec);
        if (ec || !is_dir)
        {
            std::cerr << "error: path is not a directory: " << cl.path() << "\n";
            return 1;
        }
    }

    // Configure Output
    Output out(cl.hide());
    out.set_regex(cl.regex());

    // Configure DirNav
    DirNav dn(cl.recurse());

    dn.set_dir_handler(
        [&out](const std::string& dir_path)
        {
            out.on_dir(dir_path);
        });

    dn.set_file_handler(
        [&out](const std::string& file_name)
        {
            out.on_file(file_name);
        });

    for (const auto& pattern : cl.patterns())
    {
        dn.add_pattern(pattern);
    }

    // Run the walk
    bool ok = dn.visit(std::filesystem::path(cl.path()));
    if (!ok)
    {
        std::cerr << "error: could not traverse path: " << cl.path() << "\n";
        return 1;
    }

    // Summary
    std::cout << "\n"
              << dn.file_count() << " file(s) visited, "
              << out.match_count() << " file(s) matched\n";

    return 0;
}