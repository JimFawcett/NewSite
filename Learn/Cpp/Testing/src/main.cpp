// Testing - simple assert-based unit tests and a minimal test runner.

#include <iostream>
#include <cassert>
#include <string>
#include <vector>
#include <stdexcept>
#include <functional>

// --- library functions under test ---

int add(int a, int b) { return a + b; }

int clamp(int value, int lo, int hi) {
    if (value < lo) return lo;
    if (value > hi) return hi;
    return value;
}

std::string to_upper(std::string s) {
    for (char& c : s) c = static_cast<char>(std::toupper(c));
    return s;
}

// --- minimal test runner ---

struct TestResult { std::string name; bool passed; std::string message; };

std::vector<TestResult> results;

void run_test(const std::string& name, std::function<void()> fn) {
    try {
        fn();
        results.push_back({name, true, ""});
    } catch (const std::exception& e) {
        results.push_back({name, false, e.what()});
    } catch (...) {
        results.push_back({name, false, "unknown exception"});
    }
}

#define CHECK(expr) \
    if (!(expr)) throw std::runtime_error("CHECK failed: " #expr)

// --- tests ---

void test_add() {
    CHECK(add(2, 3) == 5);
    CHECK(add(0, 0) == 0);
    CHECK(add(-1, 1) == 0);
}

void test_clamp() {
    CHECK(clamp(10, 0, 20) == 10);
    CHECK(clamp(25, 0, 20) == 20);
    CHECK(clamp(-5, 0, 20) == 0);
}

void test_to_upper() {
    CHECK(to_upper("hello") == "HELLO");
    CHECK(to_upper("") == "");
    CHECK(to_upper("Hello World") == "HELLO WORLD");
}

int main() {
    run_test("add: basic",     test_add);
    run_test("clamp: in/hi/lo", test_clamp);
    run_test("to_upper",       test_to_upper);

    int passed = 0, failed = 0;
    for (const auto& r : results) {
        if (r.passed) {
            std::cout << "[PASS] " << r.name << "\n";
            ++passed;
        } else {
            std::cout << "[FAIL] " << r.name << ": " << r.message << "\n";
            ++failed;
        }
    }
    std::cout << "\n" << passed << " passed, " << failed << " failed\n";
    return failed > 0 ? 1 : 0;
}
