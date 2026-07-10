// Formatting - std::format (C++20), ostream manipulators, printf comparison.

#include <iostream>
#include <format>
#include <iomanip>
#include <string>
#include <cstdio>

int main() {
    // --- std::format ---
    std::cout << "--- std::format ---\n";
    std::string s = std::format("Hello, {}!", "world");
    std::cout << s << "\n";

    double pi = 3.14159265358979;
    std::cout << std::format("pi = {:.4f}\n", pi);
    std::cout << std::format("{:>10} | {:<10} | {:^10}\n", "right", "left", "center");
    std::cout << std::format("{:08d}\n", 42);     // zero-padded
    std::cout << std::format("{:#x}\n", 255);     // 0xff

    // --- ostream manipulators ---
    std::cout << "\n--- manipulators ---\n";
    std::cout << std::setw(10) << std::right << "right" << "\n";
    std::cout << std::setw(10) << std::left  << "left"  << "\n";
    std::cout << std::setfill('0') << std::setw(6) << 42 << "\n";
    std::cout << std::setfill(' ');   // reset fill
    std::cout << std::fixed << std::setprecision(4) << pi << "\n";
    std::cout << std::hex << 255 << "\n";        // ff
    std::cout << std::dec;                       // reset to decimal

    // --- printf (older style) ---
    std::cout << "\n--- printf ---\n";
    std::printf("pi = %.4f\n", pi);
    std::printf("%10s | %-10s\n", "right", "left");

    return 0;
}
