// Functions - definitions, overloading, default args, and pass by reference.

#include <iostream>
#include <string>
#include <cmath>

// basic function
int add(int a, int b) { return a + b; }

// default argument
double circle_area(double radius, double pi = 3.14159265) {
    return pi * radius * radius;
}

// overloading: same name, different parameter types
void print_value(int x)         { std::cout << "int: "    << x << "\n"; }
void print_value(double x)      { std::cout << "double: " << x << "\n"; }
void print_value(std::string s) { std::cout << "string: " << s << "\n"; }

// pass by const reference: no copy, no modification
double vector_length(double x, double y) {
    return std::sqrt(x * x + y * y);
}

// pass by reference: caller's variable is modified
void swap_values(int& a, int& b) {
    int tmp = a;
    a = b;
    b = tmp;
}

int main() {
    std::cout << "--- basic function ---\n";
    std::cout << "add(3, 4) = " << add(3, 4) << "\n";

    std::cout << "\n--- default argument ---\n";
    std::cout << "circle_area(5.0)             = " << circle_area(5.0)            << "\n";
    std::cout << "circle_area(5.0, 3.14159265) = " << circle_area(5.0, 3.14159265) << "\n";

    std::cout << "\n--- overloading ---\n";
    print_value(42);
    print_value(3.14);
    print_value(std::string("hello"));

    std::cout << "\n--- pass by reference ---\n";
    int x = 10, y = 20;
    std::cout << "before: x=" << x << " y=" << y << "\n";
    swap_values(x, y);
    std::cout << "after:  x=" << x << " y=" << y << "\n";

    std::cout << "\n--- vector length ---\n";
    std::cout << "length(3,4) = " << vector_length(3.0, 4.0) << "\n";

    return 0;
}
