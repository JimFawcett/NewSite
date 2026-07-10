// Variables - types, initialization, const, constexpr, and auto.

#include <iostream>
#include <string>

int main() {
    // --- fundamental types ---
    int    count  = 10;
    double ratio  = 3.14159;
    char   letter = 'A';
    bool   flag   = true;

    std::cout << "--- fundamental types ---\n";
    std::cout << "count:  " << count  << "\n";
    std::cout << "ratio:  " << ratio  << "\n";
    std::cout << "letter: " << letter << "\n";
    std::cout << "flag:   " << flag   << "\n";

    // --- initialization syntax ---
    int a = 5;        // copy initialization
    int b(5);         // direct initialization
    int c{5};         // uniform (brace) initialization - preferred in modern C++

    std::cout << "\n--- initialization ---\n";
    std::cout << "a=" << a << " b=" << b << " c=" << c << "\n";

    // --- const and constexpr ---
    const int MAX_SIZE = 100;          // runtime constant
    constexpr double PI = 3.14159265;  // compile-time constant

    std::cout << "\n--- const/constexpr ---\n";
    std::cout << "MAX_SIZE=" << MAX_SIZE << " PI=" << PI << "\n";

    // --- auto type deduction ---
    auto x    = 42;            // int
    auto y    = 3.14;          // double
    auto name = std::string("Alice");

    std::cout << "\n--- auto ---\n";
    std::cout << "x=" << x << " y=" << y << " name=" << name << "\n";

    // --- narrowing: brace init catches it ---
    // int bad{3.7};   // error: narrowing conversion
    double pi = 3.7;
    int truncated = static_cast<int>(pi);  // explicit cast required

    std::cout << "\n--- cast ---\n";
    std::cout << "truncated=" << truncated << "\n";

    return 0;
}
