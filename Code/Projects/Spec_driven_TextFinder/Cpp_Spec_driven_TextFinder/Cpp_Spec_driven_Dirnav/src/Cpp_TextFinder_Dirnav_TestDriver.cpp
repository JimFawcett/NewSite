// Cpp_TextFinder_Dirnav_TestDriver.cpp - runs the Cpp_TextFinder_Dirnav unit tests

import std;
import Cpp_TextFinder_Dirnav_UnitTest;

int main() {
    const int failures = runDirnavUnitTests(std::cout);
    std::cout << (failures == 0 ? "PASS\n" : "FAIL\n");
    return failures == 0 ? 0 : 1;
}
