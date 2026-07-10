// hello.cpp - first C++ program: print a greeting and read a name.

#include <iostream>
#include <string>

int main() {
    std::cout << "Hello, World!\n";

    std::cout << "Enter your name: ";
    std::string name;
    std::getline(std::cin, name);
    std::cout << "Hello, " << name << "!\n";

    return 0;
}
