// Map - std::unordered_map and std::map usage.

#include <iostream>
#include <unordered_map>
#include <map>
#include <string>
#include <vector>

int main() {
    // --- unordered_map: O(1) average lookup, unordered ---
    std::cout << "--- unordered_map ---\n";
    std::unordered_map<std::string, int> scores;
    scores["Alice"] = 95;
    scores["Bob"]   = 87;
    scores.insert({"Carol", 92});

    // safe lookup with find
    auto it = scores.find("Alice");
    if (it != scores.end())
        std::cout << "Alice: " << it->second << "\n";

    // [] inserts default if key missing
    scores["Dave"];  // inserts Dave with value 0
    std::cout << "Dave: " << scores["Dave"] << "\n";

    // contains (C++20)
    std::cout << "has Bob: " << scores.count("Bob") << "\n";  // 0 or 1

    // iteration (unordered)
    std::cout << "\nall scores:\n";
    for (const auto& [name, score] : scores)
        std::cout << "  " << name << ": " << score << "\n";

    // erase
    scores.erase("Dave");
    std::cout << "size after erase: " << scores.size() << "\n";

    // --- map: O(log n) lookup, ordered by key ---
    std::cout << "\n--- map (ordered) ---\n";
    std::map<std::string, int> ordered;
    ordered["banana"] = 2;
    ordered["apple"]  = 1;
    ordered["cherry"] = 3;

    for (const auto& [k, v] : ordered)
        std::cout << k << ": " << v << "\n";  // alphabetical order

    return 0;
}
