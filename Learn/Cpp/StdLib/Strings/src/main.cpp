// Strings - std::string and std::string_view operations.

#include <iostream>
#include <string>
#include <string_view>

int main() {
    // --- construction ---
    std::cout << "--- construction ---\n";
    std::string s1 = "Hello, World!";
    std::string s2("Hello");
    std::string s3(5, '*');          // "*****"
    std::cout << s1 << "\n" << s2 << "\n" << s3 << "\n";

    // --- concatenation ---
    std::cout << "\n--- concatenation ---\n";
    std::string greeting = std::string("Hello") + ", " + "World!";
    greeting += " How are you?";
    std::cout << greeting << "\n";

    // --- query ---
    std::cout << "\n--- query ---\n";
    std::cout << "length:  " << s1.length() << "\n";
    std::cout << "empty:   " << s3.empty() << "\n";
    std::cout << "front:   " << s1.front() << "\n";
    std::cout << "back:    " << s1.back()  << "\n";

    // --- search and substr ---
    std::cout << "\n--- search ---\n";
    size_t pos = s1.find("World");
    std::cout << "find 'World': " << pos << "\n";       // 7
    std::cout << "substr(7,5):  " << s1.substr(7, 5) << "\n";  // "World"

    // --- modification ---
    std::cout << "\n--- modification ---\n";
    std::string t = "Hello, World!";
    t.replace(7, 5, "C++");
    std::cout << t << "\n";  // "Hello, C++!"

    // --- string_view: non-owning read-only view ---
    std::cout << "\n--- string_view ---\n";
    std::string_view sv = s1;          // no copy
    std::cout << sv.substr(0, 5) << "\n";  // "Hello"

    // --- conversion ---
    std::cout << "\n--- conversion ---\n";
    int n = std::stoi("42");
    double d = std::stod("3.14");
    std::string ns = std::to_string(123);
    std::cout << n << " " << d << " " << ns << "\n";

    return 0;
}
