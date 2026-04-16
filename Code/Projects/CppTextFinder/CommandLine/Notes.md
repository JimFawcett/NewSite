# Notes.md — CommandLine

*Record of prompts submitted and responses received while designing and
implementing the CommandLine component.*

---

## How to use this file

Add an entry for each significant prompt/response exchange.  Include enough
context so that the conversation can be reconstructed or handed off.

---

## Entry template

```
### YYYY-MM-DD — <short topic>

**Prompt**
<paste the prompt you sent>

**Response summary**
<paste or summarise the response>

**Decisions / follow-up**
<note any decisions made or items deferred>
```

---

### 2026-04-16 — Type erasure / caller-defined interfaces

**Prompt**
Change the dependencies to use type erasure, e.g., each caller defines an
interface that the called must implement.

**Response summary**
CommandLine is a value-object library: it accepts `argc`/`argv` and returns
typed accessors.  It has no callbacks and no knowledge of DirNav or Output, so
no structural change was required.  The principle is already satisfied — callers
call into `CmdLine` directly and `CmdLine` never calls back.  The dependency
graph in Structure.md was updated to show CommandLine as a leaf with no
inter-library edges.

**Decisions / follow-up**
- No interface segregation needed here; `CmdLine` is a concrete class that
  callers construct and query.
- If future callers need to mock command-line input for testing, an `ICmdLine`
  abstract interface could be introduced, owned by EntryPoint or a test harness.
  Not needed for the current scope.

---

*End of CommandLine/Notes.md*

### 2026-04-16 — Generated source files via generate_part.py

**Generate CmdLine.ixx**

*Prompt:* Implement `CommandLine/src/CmdLine.ixx` as a C++23 named module (`export module cmd_line;`). Follow the Spec.md, Structure.md, and Constitution.md provided above exactly. Output only the complete content of `CmdLine.ixx`.

*Response preview:* `export module cmd_line;  import std;  export class CmdLine { public:     CmdLine(int argc, const char* argv[]) {         parse(argc, argv);         apply_defaults();     }      std::string path() const {         return get("P");     }      std::string regex() const {         return get("r");     } ...`

**Generate test.cpp**

*Prompt:* Implement `CommandLine/src/test.cpp` — unit tests that exercise every public method described in the Spec.

Testing conventions from Structure.md:
  - Each test is a bool-returning free function.
  - main() calls every test in sequence, prints "PASS" or "FAIL" plus the test name, exits 0 on all-pass or 1 on any failure.
  - No external test framework; file is self-contained.
  - Begin with `import cmd_line;`

=== CommandLine/src/CmdLine.ixx ===
export module cmd_line;

import std;

export class CmdLine {
public:
    CmdLine(int argc, const char* argv[]) {
        parse(argc, argv);
        apply_defaults();
    }

    std::string path() const {
        return get("P");
    }

    std::string regex() const {
        return get("r");
    }

    std::vector<std::string> patterns() const {
        std::string raw = get("p");
        std::vector<std::string> result;
        if (raw.empty()) {
            return result;
        }
        std::istringstream ss(raw);
        std::string token;
        while (std::getline(ss, token, ',')) {
            if (!token.empty()) {
                result.push_back(std::move(token));
            }
        }
        return result;
    }

    bool recurse() const {
        return get("s") == "true";
    }

    bool hide() const {
        return get("H") == "true";
    }

    bool verbose() const {
        return options_.contains("v");
    }

    bool help() const {
        return options_.contains("h");
    }

    std::string help_text() const {
        return
            "CppTextFinder — search a directory tree for files whose content matches a regex\n"
            "\n"
            "Usage:\n"
            "  text_finder [/P <path>] [/p <exts>] [/s <bool>] [/H <bool>]\n"
            "              [/r <regex>] [/v] [/h]\n"
            "\n"
            "Options:\n"
            "  /P <path>    Root path for the search              (default: \".\")\n"
            "  /p <exts>    Comma-separated file extensions to\n"
            "               include, e.g. \".cpp,.h\"              (default: all files)\n"
            "  /s <bool>    Recurse into subdirectories           (default: true)\n"
            "  /H <bool>    true  = print directory only when it\n"
            "               contains a match (clean output).\n"
            "               false = print every directory entered  (default: true)\n"
            "  /r <regex>   Regular expression matched against\n"
            "               file content                          (default: \".\")\n"
            "  /v           Verbose: echo all options before\n"
            "               searching\n"
            "  /h           Print this help text and exit\n";
    }

private:
    std::map<std::string, std::string> options_;

    void parse(int argc, const char* argv[]) {
        int i = 1;
        while (i < argc) {
            std::string token = argv[i];
            if (token.size() >= 2 && token[0] == '/') {
                std::string key = token.substr(1);
                if (i + 1 < argc) {
                    std::string next = argv[i + 1];
                    if (next.size() >= 1 && next[0] == '/') {
                        // Next token is another flag — value is implicit "true"
                        options_[key] = "true";
                    } else {
                        // Consume next token as value
                        options_[key] = next;
                        ++i;
                    }
                } else {
                    // Last token on the command line — implicit "true"
                    options_[key] = "true";
                }
            }
            // Tokens that do not begin with '/' and were not consumed as a
            // value are silently ignored (they arrive here only when i was not
            // advanced after a previous key, which cannot happen under this
            // algorithm; guard is here for clarity).
            ++i;
        }
    }

    void apply_defaults() {
        if (!options_.contains("P")) { options_["P"] = "."; }
        if (!options_.contains("r")) { options_["r"] = "."; }
        if (!options_.contains("s")) { options_["s"] = "true"; }
        if (!options_.contains("H")) { options_["H"] = "true"; }
        // /p has no meaningful default value; leave absent so patterns() returns empty
        // /v and /h are boolean presence flags; leave absent when not supplied
    }

    std::string get(const std::string& key) const {
        auto it = options_.find(key);
        if (it != options_.end()) {
            return it->second;
        }
        return {};
    }
};

Output only the complete content of `test.cpp`.

*Response preview:* `import cmd_line; import std;  // --------------------------------------------------------------------------- // Helpers // ---------------------------------------------------------------------------  // Build a argv-style array from a vector of string literals and construct a // CmdLine from it.  ar ...`

**Generate CMakeLists.txt**

*Prompt:* Implement `CommandLine/CMakeLists.txt`.

Library target: `cmd_line` (STATIC). Module interface file: `src/CmdLine.ixx`. Test executable: `test_cmd_line` built from `src/test.cpp`. CTest registration name: `cmd_line_tests`. No target_include_directories — consumers use import, not headers.

Follow the CMakeLists.txt sketches in Structure.md exactly. Output only the complete content of `CMakeLists.txt`.

*Response preview:* `add_library(cmd_line STATIC)  target_sources(cmd_line     PUBLIC     FILE_SET CXX_MODULES FILES         src/CmdLine.ixx )  target_compile_features(cmd_line PUBLIC cxx_std_23)  if(MSVC)     target_compile_options(cmd_line PRIVATE /W4 /WX) else()     target_compile_options(cmd_line PRIVATE -Wall -Wext ...`

---
