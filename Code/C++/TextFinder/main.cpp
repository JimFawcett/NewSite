///////////////////////////////////////////////////////////
// main.cpp - TextFinder entry point                     //
//                                                       //
// CMake build commands:                                 //
//   cmake -S . -B build                                 //
//   cmake --build build --config Release | Debug        //
// Run commands:                                         //
//   ./build/Debug/TextFinder.exe                        //
//   ./build/Release/TextFinder.exe                      //
//                                                       //
// Jim Fawcett, https://JimFawcett.github.io             //
// Uses C++23 named modules + import std                 //
///////////////////////////////////////////////////////////

import std;
import CmdLine;
import DirNav;
import TextFinder;

static const char* VERSION = "1.0.0";

static void verbose(const CmdLineParse& parser) {
    std::cout << "\n  TextFinder ver " << VERSION;
    std::cout << "\n =======================";

    if (parser.contains_option('v')) {
        std::cout << "\n  path = " << parser.abs_path();
        std::cout << "\n  patterns = ";
        for (auto& p : parser.patterns()) std::cout << "\"" << p << "\" ";
        std::cout << "\n  regex = \"" << parser.get_regex() << "\"";
        for (auto& [k, v] : parser.options())
            std::cout << "\n  option: " << k << " \"" << v << "\"";
    } else {
        std::cout << "\n  searching path: \"" << parser.abs_path() << "\"";
        std::cout << "\n  patterns: ";
        for (auto& p : parser.patterns()) std::cout << "\"" << p << "\" ";
        std::cout << "\n  matching files with regex: \"" << parser.get_regex() << "\"";
    }
}

static std::string help() {
    std::string s;
    s += "\n  TextFinder ver "; s += VERSION;
    s += "\n =======================";
    s += "\n  Help: [] => default values";
    s += "\n  /P - start path           [\".\"]";
    s += "\n  /p - patterns             \"rs,exe,rlib\"";
    s += "\n  /s - recurse              [\"true\"]";
    s += "\n  /H - hide unused dirs     [\"true\"]";
    s += "\n  /r - regular expression   \"abc\"";
    s += "\n  /v - display options";
    s += "\n  /h - display this message";
    return s;
}

int main(int argc, char* argv[]) {

    CmdLineParse parser(argc, argv);
    parser.default_options();
    parser.parse();

    if (argc == 1 || parser.contains_option('h')) {
        std::cout << "\n" << help() << "\n";
        return 0;
    }

    DirNav<TfAppl> dn;
    dn.add_skip("target");
    dn.add_skip("build");

    dn.recurse(parser.bool_value('s'));  // defaults false if /s absent
    dn.hide(parser.bool_value('H'));     // propagates to app via DirEvent::hide()

    dn.get_app().regex(parser.get_regex());

    for (auto& patt : parser.patterns())
        dn.add_pat(patt);

    std::filesystem::path root(parser.abs_path());
    verbose(parser);
    dn.visit(root);

    std::cout << "\n\n  processed "
              << dn.get_files() << " files in "
              << dn.get_dirs()  << " dirs";
    std::cout << "\n\n  That's all Folks!\n\n";

    return 0;
}
