// Vector - std::vector creation, access, iteration, modification.

#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>

int main() {
    // --- creation ---
    std::cout << "--- creation ---\n";
    std::vector<int> v1 = {3, 1, 4, 1, 5, 9};
    std::vector<int> v2(5, 0);        // five zeros
    std::vector<int> v3;              // empty
    std::cout << "v1 size: " << v1.size() << "\n";

    // --- push_back and pop_back ---
    std::cout << "\n--- push/pop ---\n";
    v3.push_back(10);
    v3.push_back(20);
    v3.push_back(30);
    std::cout << "after pushes: ";
    for (int x : v3) std::cout << x << " ";
    std::cout << "\n";
    v3.pop_back();
    std::cout << "after pop: back=" << v3.back() << "\n";

    // --- element access ---
    std::cout << "\n--- access ---\n";
    std::cout << "v1[0]=" << v1[0] << "\n";           // unchecked
    std::cout << "v1.at(2)=" << v1.at(2) << "\n";     // bounds-checked

    // --- sort and search ---
    std::cout << "\n--- sort ---\n";
    std::sort(v1.begin(), v1.end());
    for (int x : v1) std::cout << x << " ";
    std::cout << "\n";

    // --- insert and erase ---
    std::cout << "\n--- insert/erase ---\n";
    v1.insert(v1.begin() + 2, 99);
    std::cout << "after insert at 2: ";
    for (int x : v1) std::cout << x << " ";
    std::cout << "\n";
    v1.erase(v1.begin() + 2);
    std::cout << "after erase at 2:  ";
    for (int x : v1) std::cout << x << " ";
    std::cout << "\n";

    // --- accumulate ---
    std::cout << "\n--- accumulate ---\n";
    int sum = std::accumulate(v1.begin(), v1.end(), 0);
    std::cout << "sum=" << sum << "\n";

    return 0;
}
