// Cpp_TextFinder_IntegrationTest_Driver.cpp - runs the Cpp_TextFinder integration tests
//
// CMake supplies TEXTFINDER_EXE; an argument overrides it, so the suite can be pointed
// at an executable built elsewhere.

import std;
import Cpp_TextFinder_IntegrationTest;

int main(int argc, char* argv[]) {
    const std::filesystem::path executable = (argc > 1) ? std::filesystem::path{argv[1]}
                                                        : std::filesystem::path{TEXTFINDER_EXE};

    const int failures = runIntegrationTests(std::cout, executable);
    std::cout << (failures == 0 ? "PASS\n" : "FAIL\n");
    return failures == 0 ? 0 : 1;
}
