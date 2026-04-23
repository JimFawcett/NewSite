import cmd_line;
import dir_nav;
import output;
import std;

int main(int argc, const char* argv[])
{
    CmdLine cl(argc, argv);

    // Show help when no arguments are supplied or /h is present
    if (argc == 1 || cl.help())
    {
        std::cout << CmdLine::help_text();
        return 0;
    }

    // Verbose: echo all options before searching
    if (cl.verbose())
    {
        std::cout << "Options:\n"
                  << "  /P  " << cl.path()                          << "\n"
                  << "  /r  " << cl.regex()                         << "\n"
                  << "  /s  " << (cl.recurse() ? "true" : "false")  << "\n"
                  << "  /H  " << (cl.hide()    ? "true" : "false")  << "\n";

        auto patterns = cl.patterns();
        if (patterns.empty())
        {
            std::cout << "  /p  (all files)\n";
        }
        else
        {
            std::cout << "  /p  ";
            for (char c : patterns | std::views::join_with(','))
                std::cout << c;
            std::cout << "\n";
        }
        std::cout << "\n";
    }

    // Configure Output
    Output out(cl.hide());
    out.set_regex(cl.regex());

    // Configure DirNav
    DirNav dn(cl.recurse());

    dn.set_dir_handler( [&out](const std::string& d){ out.on_dir(d);  });
    dn.set_file_handler([&out](const std::string& f){ out.on_file(f); });

    for (const auto& pattern : cl.patterns())
        dn.add_pattern(pattern);

    // Run the walk
    if (!dn.visit(std::filesystem::path(cl.path())))
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
