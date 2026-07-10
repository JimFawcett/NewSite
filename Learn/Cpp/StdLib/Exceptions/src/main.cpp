// Exceptions - try/catch/throw, standard hierarchy, custom exceptions.

#include <iostream>
#include <stdexcept>
#include <string>

// custom exception
class ValidationError : public std::runtime_error {
public:
    explicit ValidationError(const std::string& msg)
        : std::runtime_error(msg) {}
};

int parse_positive(const std::string& s) {
    int n = std::stoi(s);   // throws std::invalid_argument on non-integer
    if (n <= 0)
        throw ValidationError("value must be positive, got " + s);
    return n;
}

double safe_divide(double a, double b) {
    if (b == 0.0) throw std::domain_error("division by zero");
    return a / b;
}

int main() {
    // --- basic try/catch ---
    std::cout << "--- parse_positive ---\n";
    for (const auto& input : {"42", "-5", "abc", "0"}) {
        try {
            int n = parse_positive(input);
            std::cout << input << " -> " << n << "\n";
        } catch (const ValidationError& e) {
            std::cout << "validation: " << e.what() << "\n";
        } catch (const std::exception& e) {
            std::cout << "error: " << e.what() << "\n";
        }
    }

    // --- catch all ---
    std::cout << "\n--- divide ---\n";
    try {
        std::cout << safe_divide(10.0, 2.0) << "\n";
        std::cout << safe_divide(10.0, 0.0) << "\n";  // throws
    } catch (const std::domain_error& e) {
        std::cout << "domain error: " << e.what() << "\n";
    }

    std::cout << "\ndone\n";
    return 0;
}
