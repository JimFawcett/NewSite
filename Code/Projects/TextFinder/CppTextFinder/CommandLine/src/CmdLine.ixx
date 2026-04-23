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
        if (raw.empty())
            return {};
        std::vector<std::string> result;
        for (auto part : raw | std::views::split(',')) {
            std::string s(part.begin(), part.end());
            if (!s.empty())
                result.push_back(std::move(s));
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
        return present("v");
    }

    bool help() const {
        return present("h");
    }

    static std::string help_text() {
        return
            "CppTextFinder — search a directory tree for files whose content matches a regex\n"
            "\n"
            "Usage:\n"
            "  text_finder [/P <path>] [/p <exts>] [/s <bool>] [/H <bool>]\n"
            "              [/r <regex>] [/v] [/h]\n"
            "\n"
            "  Flag prefix: both '/' (Windows style) and '-' (Unix style) are accepted,\n"
            "  e.g. \"/P .\" and \"-P .\" are equivalent.\n"
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
    std::unordered_map<std::string, std::string> options_;

    void parse(int argc, const char* argv[]) {
        auto is_flag = [](const std::string& t) {
            return t.size() == 2 && (t[0] == '/' || t[0] == '-') && std::isalpha(static_cast<unsigned char>(t[1]));
        };
        int i = 1;
        while (i < argc) {
            std::string token = argv[i];
            if (is_flag(token)) {
                std::string key(1, token[1]);
                if (i + 1 < argc) {
                    std::string next = argv[i + 1];
                    if (is_flag(next)) {
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

    bool present(const std::string& key) const {
        return options_.contains(key);
    }

    std::string get(const std::string& key) const {
        auto it = options_.find(key);
        if (it != options_.end()) {
            return it->second;
        }
        return {};
    }
};