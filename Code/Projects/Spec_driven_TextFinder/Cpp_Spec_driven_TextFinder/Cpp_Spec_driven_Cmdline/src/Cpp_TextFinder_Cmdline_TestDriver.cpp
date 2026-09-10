// Cpp_TextFinder_Cmdline_TestDriver.cpp - runs the Cpp_TextFinder_Cmdline unit tests

import std;
import Cpp_TextFinder_Cmdline_UnitTest;

int main() {
    const int failures = runCmdlineUnitTests(std::cout);
    std::cout << (failures == 0 ? "PASS\n" : "FAIL\n");
    return failures == 0 ? 0 : 1;
}
