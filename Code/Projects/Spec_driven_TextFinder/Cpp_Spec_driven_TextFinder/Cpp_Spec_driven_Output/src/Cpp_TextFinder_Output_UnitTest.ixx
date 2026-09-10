// Cpp_TextFinder_Output_UnitTest.ixx - unit tests for Spec_Cpp_TextFinder_Output.md

export module Cpp_TextFinder_Output_UnitTest;

import std;
import Cpp_TextFinder_Dirnav;
import Cpp_TextFinder_Output;

export int runOutputUnitTests(std::ostream& log);

namespace {

struct Checker {
    std::ostream& log;
    int failures{0};
    int total{0};

    void expect(bool ok, std::string_view name) { record(ok, name); }

    void equal(const std::string& actual, const std::string& expected, std::string_view name) {
        const bool ok = actual == expected;
        record(ok, name);
        if (ok) return;
        log << "          expected: [" << expected << "]\n";
        log << "          actual:   [" << actual << "]\n";
    }

    void record(bool ok, std::string_view name) {
        ++total;
        if (!ok) ++failures;
        log << (ok ? "  PASS  " : "  FAIL  ") << name << "\n";
    }
};

std::string visible(const std::string& raw) {
    std::string text;
    for (char c : raw) {
        if (c == '\n') text += "\\n";
        else if (c == '\r') text += "\\r";
        else text += c;
    }
    return text;
}

// Redirects std::cout so the bytes the sink writes can be inspected.
std::string captured(const std::function<void(Cpp_TextFinder_Output&)>& body) {
    std::ostringstream buffer;
    std::streambuf* saved = std::cout.rdbuf(buffer.rdbuf());

    Cpp_TextFinder_Output out;
    body(out);
    std::cout.flush();

    std::cout.rdbuf(saved);
    return buffer.str();
}

void testTermination(Checker& check) {
    const std::string one = captured([](Cpp_TextFinder_Output& out) { out.output("record"); });
    check.equal(visible(one), "record\\n", "one call writes the text and a single LF");

    const std::string many = captured([](Cpp_TextFinder_Output& out) {
        out.output("first");
        out.output("second");
    });
    check.equal(visible(many), "first\\nsecond\\n", "each call is one line");

    check.expect(many.find('\r') == std::string::npos, "no CR reaches the stream");
}

void testPassThrough(Checker& check) {
    const std::string spaced = captured([](Cpp_TextFinder_Output& out) {
        out.output("src/a.cpp - 12 -   indented  text  ");
    });
    check.equal(visible(spaced), "src/a.cpp - 12 -   indented  text  \\n",
                "the string is written unchanged, with nothing added but the terminator");

    const std::string empty = captured([](Cpp_TextFinder_Output& out) { out.output(""); });
    check.equal(visible(empty), "\\n", "an empty string still terminates a line");

    const std::string utf8 = captured([](Cpp_TextFinder_Output& out) { out.output("caf\xC3\xA9"); });
    check.equal(utf8, "caf\xC3\xA9\n", "UTF-8 bytes pass through untouched");
}

void testInterface(Checker& check) {
    check.expect(std::derived_from<Cpp_TextFinder_Output, Output>,
                 "Cpp_TextFinder_Output implements the Output interface");

    const std::string throughBase = captured([](Cpp_TextFinder_Output& out) {
        Output& base = out;
        base.output("via base");
    });
    check.equal(visible(throughBase), "via base\\n", "the override is reached through Output&");
}

} // namespace

int runOutputUnitTests(std::ostream& log) {
    log << "Cpp_TextFinder_Output unit tests\n";

    Checker check{log};
    testTermination(check);
    testPassThrough(check);
    testInterface(check);

    log << "  " << (check.total - check.failures) << " of " << check.total << " passed\n";
    return check.failures;
}
