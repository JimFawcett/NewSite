// Cpp_TextFinder_Output_TestDriver.cpp - runs the Cpp_TextFinder_Output unit tests

import std;
import Cpp_TextFinder_Output_UnitTest;

int main() {
    const int failures = runOutputUnitTests(std::cout);
    std::cout << (failures == 0 ? "PASS\n" : "FAIL\n");
    return failures == 0 ? 0 : 1;
}
