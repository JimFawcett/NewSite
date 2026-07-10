// Algorithms - sort, find, transform, accumulate, copy_if, for_each.

#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <string>

int main() {
    std::vector<int> v = {5, 3, 8, 1, 9, 2, 7, 4, 6};

    // --- sort ---
    std::cout << "--- sort ---\n";
    std::sort(v.begin(), v.end());
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";

    // reverse sort
    std::sort(v.begin(), v.end(), std::greater<int>());
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";

    // --- find ---
    std::cout << "\n--- find ---\n";
    auto it = std::find(v.begin(), v.end(), 7);
    if (it != v.end())
        std::cout << "found 7 at index " << std::distance(v.begin(), it) << "\n";

    auto it2 = std::find_if(v.begin(), v.end(), [](int x){ return x < 3; });
    if (it2 != v.end())
        std::cout << "first < 3: " << *it2 << "\n";

    // --- transform ---
    std::cout << "\n--- transform ---\n";
    std::vector<int> squares(v.size());
    std::transform(v.begin(), v.end(), squares.begin(), [](int x){ return x * x; });
    for (int x : squares) std::cout << x << " ";
    std::cout << "\n";

    // --- accumulate ---
    std::cout << "\n--- accumulate ---\n";
    std::sort(v.begin(), v.end());  // restore order
    int sum     = std::accumulate(v.begin(), v.end(), 0);
    int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<int>());
    std::cout << "sum=" << sum << " product=" << product << "\n";

    // --- copy_if ---
    std::cout << "\n--- copy_if ---\n";
    std::vector<int> evens;
    std::copy_if(v.begin(), v.end(), std::back_inserter(evens),
                 [](int x){ return x % 2 == 0; });
    for (int x : evens) std::cout << x << " ";
    std::cout << "\n";

    // --- for_each ---
    std::cout << "\n--- for_each ---\n";
    std::vector<std::string> words = {"hello", "world", "cpp"};
    std::for_each(words.begin(), words.end(), [](std::string& w){
        for (char& c : w) c = static_cast<char>(std::toupper(c));
    });
    for (const auto& w : words) std::cout << w << " ";
    std::cout << "\n";

    return 0;
}
