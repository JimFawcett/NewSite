// Control_Flow - if, switch, while, do-while, for, range-for, break, continue.

#include <iostream>
#include <vector>
#include <string>

int main() {
    // --- if / else if / else ---
    std::cout << "--- if/else ---\n";
    int score = 75;
    if (score >= 90)      std::cout << "A\n";
    else if (score >= 80) std::cout << "B\n";
    else if (score >= 70) std::cout << "C\n";
    else                  std::cout << "F\n";

    // --- switch ---
    std::cout << "\n--- switch ---\n";
    int day = 3;
    switch (day) {
        case 1: std::cout << "Monday\n";    break;
        case 2: std::cout << "Tuesday\n";   break;
        case 3: std::cout << "Wednesday\n"; break;
        default: std::cout << "other\n";
    }

    // --- while ---
    std::cout << "\n--- while ---\n";
    int i = 0;
    while (i < 5) {
        std::cout << i << " ";
        ++i;
    }
    std::cout << "\n";

    // --- do-while ---
    std::cout << "\n--- do-while ---\n";
    int n = 1;
    do {
        std::cout << n << " ";
        n *= 2;
    } while (n <= 16);
    std::cout << "\n";

    // --- for ---
    std::cout << "\n--- for ---\n";
    for (int j = 0; j < 5; ++j)
        std::cout << j * j << " ";
    std::cout << "\n";

    // --- range-for ---
    std::cout << "\n--- range-for ---\n";
    std::vector<std::string> words = {"alpha", "beta", "gamma"};
    for (const std::string& w : words)
        std::cout << w << " ";
    std::cout << "\n";

    // --- break and continue ---
    std::cout << "\n--- break / continue ---\n";
    for (int k = 0; k < 10; ++k) {
        if (k == 7) break;
        if (k % 2 == 0) continue;
        std::cout << k << " ";   // 1 3 5
    }
    std::cout << "\n";

    return 0;
}
