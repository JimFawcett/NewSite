// FileIO - ofstream, ifstream, getline, fstream.

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>

int main() {
    const std::string filename = "demo.txt";

    // --- write ---
    std::cout << "--- write ---\n";
    {
        std::ofstream out(filename);
        if (!out) { std::cerr << "failed to open for writing\n"; return 1; }
        out << "line one\n";
        out << "line two\n";
        out << "line three\n";
    }   // file closed by RAII when out goes out of scope

    // --- read all at once ---
    std::cout << "--- read whole file ---\n";
    {
        std::ifstream in(filename);
        std::ostringstream buf;
        buf << in.rdbuf();
        std::cout << buf.str();
    }

    // --- read line by line ---
    std::cout << "--- line by line ---\n";
    {
        std::ifstream in(filename);
        std::string line;
        int n = 0;
        while (std::getline(in, line))
            std::cout << ++n << ": " << line << "\n";
    }

    // --- append ---
    std::cout << "--- append ---\n";
    {
        std::ofstream app(filename, std::ios::app);
        app << "line four\n";
    }

    // --- verify append ---
    {
        std::ifstream in(filename);
        std::string line;
        while (std::getline(in, line))
            std::cout << line << "\n";
    }

    return 0;
}
