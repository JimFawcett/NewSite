// Lambdas - syntax, capture modes, algorithms, std::function, returning lambdas.

#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>
#include <string>

int main() {
    // --- basic lambda ---
    std::cout << "--- basic ---\n";
    auto add = [](int a, int b) { return a + b; };
    std::cout << "add(3,4) = " << add(3, 4) << "\n";

    // --- capture by value ---
    std::cout << "\n--- capture by value ---\n";
    int offset = 10;
    auto add_offset = [offset](int x) { return x + offset; };
    offset = 99;   // changing offset does NOT affect add_offset (captured by value)
    std::cout << "add_offset(5) = " << add_offset(5) << "\n";  // 15

    // --- capture by reference ---
    std::cout << "\n--- capture by reference ---\n";
    int counter = 0;
    auto increment = [&counter]() { ++counter; };
    increment(); increment(); increment();
    std::cout << "counter = " << counter << "\n";  // 3

    // --- mutable lambda (modify captured value copy) ---
    std::cout << "\n--- mutable ---\n";
    int n = 5;
    auto inc_copy = [n]() mutable { return ++n; };
    std::cout << inc_copy() << " " << inc_copy() << "\n";  // 6 7
    std::cout << "n still = " << n << "\n";                // 5

    // --- std::function ---
    std::cout << "\n--- std::function ---\n";
    std::function<int(int, int)> op = add;
    std::cout << op(10, 20) << "\n";

    // --- with algorithms ---
    std::cout << "\n--- with algorithms ---\n";
    std::vector<int> v = {3, 1, 4, 1, 5, 9, 2, 6};
    std::sort(v.begin(), v.end(), [](int a, int b){ return a > b; });
    for (int x : v) std::cout << x << " ";
    std::cout << "\n";

    // --- returning a lambda ---
    std::cout << "\n--- returning lambda ---\n";
    auto make_multiplier = [](int factor) {
        return [factor](int x) { return x * factor; };
    };
    auto triple = make_multiplier(3);
    std::cout << "triple(7) = " << triple(7) << "\n";

    return 0;
}
