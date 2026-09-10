// Cpp_TextFinder_Demo_Driver.cpp - runs the Cpp_TextFinder demonstration
//
// CMake supplies TEXTFINDER_EXE and DEMO_ROOT; arguments override them, so the demonstration
// can be pointed at another build or another tree.

import std;
import Cpp_TextFinder_Demo;

int main(int argc, char* argv[]) {
    const std::filesystem::path executable = (argc > 1) ? std::filesystem::path{argv[1]}
                                                        : std::filesystem::path{TEXTFINDER_EXE};
    const std::filesystem::path root = (argc > 2) ? std::filesystem::path{argv[2]}
                                                  : std::filesystem::path{DEMO_ROOT};

    return runDemo(std::cout, executable, root);
}
