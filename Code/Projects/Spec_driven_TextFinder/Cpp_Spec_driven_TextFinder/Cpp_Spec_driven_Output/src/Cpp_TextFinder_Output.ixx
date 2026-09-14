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

// §5: puts stdout into the state Spec_TextFinder.md §3.4 requires. §7: stdio synchronization
// is disabled, so nothing outside this library drains the deferred buffer.
Cpp_TextFinder_Output::Cpp_TextFinder_Output() {
    std::ios::sync_with_stdio(false);
#ifdef _WIN32
    // File descriptor 1 is stdout. Binary mode keeps the LF that Spec_TextFinder.md §3.4
    // fixes as the terminator from being translated to CRLF.
    if (_setmode(1, _O_BINARY) == -1) throw std::runtime_error{"stdout cannot be set to binary mode"};
#endif
}

// §7: no flush per line - this is the one flush, and Cpp_TextFinder_Entry reaches it on
// every path out of the program because each of its exits is a return from main.
Cpp_TextFinder_Output::~Cpp_TextFinder_Output() { std::cout.flush(); }

// §5: the string unchanged, then the single LF, and nothing else.
void Cpp_TextFinder_Output::output(const std::string& text) {
    if (failed_) return;

    std::cout << text << '\n';
    if (!std::cout) {
        // §6: the failed state is permanent and reaches no caller. §7: stdout goes out
        // ahead of any stderr write, since std::cerr is unit-buffered and this is not.
        // Best-effort - whatever broke the write may break the flush too.
        failed_ = true;
        std::cout.flush();
        std::cerr << "output failed\n";
    }
}
