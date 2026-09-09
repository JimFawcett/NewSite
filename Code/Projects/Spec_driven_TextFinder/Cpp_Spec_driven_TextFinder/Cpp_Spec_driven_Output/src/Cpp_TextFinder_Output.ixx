// Cpp_TextFinder_Output.ixx - the stdout sink, per Spec_Cpp_TextFinder_Output.md

module;

#ifdef _WIN32
#include <io.h>
#include <fcntl.h>
#endif

export module Cpp_TextFinder_Output;

import std;
import Cpp_TextFinder_Dirnav;

export class Cpp_TextFinder_Output : public Output {
public:
    Cpp_TextFinder_Output();
    ~Cpp_TextFinder_Output() override;
    void output(const std::string& text) override;

private:
    bool failed_{false};
};

Cpp_TextFinder_Output::Cpp_TextFinder_Output() {
    std::ios::sync_with_stdio(false);
#ifdef _WIN32
    // File descriptor 1 is stdout. Binary mode keeps the LF that Spec_TextFinder.md §3.4
    // fixes as the terminator from being translated to CRLF.
    if (_setmode(1, _O_BINARY) == -1) throw std::runtime_error{"stdout cannot be set to binary mode"};
#endif
}

Cpp_TextFinder_Output::~Cpp_TextFinder_Output() { std::cout.flush(); }

void Cpp_TextFinder_Output::output(const std::string& text) {
    if (failed_) return;

    std::cout << text << '\n';
    if (!std::cout) {
        failed_ = true;
        std::cerr << "output failed\n";
    }
}
