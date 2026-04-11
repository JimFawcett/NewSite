///////////////////////////////////////////////////////////
// CmdLine.ixx - C++23 module: command-line parser       //
//                                                       //
// Jim Fawcett, https://JimFawcett.github.io             //
///////////////////////////////////////////////////////////

export module CmdLine;
import std;

export class CmdLineParse {
public:
    using Options  = std::map<char, std::string>;
    using Patterns = std::vector<std::string>;

    CmdLineParse(int argc, char* argv[])
        : argc_(argc), argv_(argv), help_str_(build_help()) {}

    void default_options() {
        opt_map_['P'] = ".";
        opt_map_['s'] = "true";
        opt_map_['r'] = ".";
        opt_map_['H'] = "true";
    }

    void parse() {
        for (int i = 1; i < argc_; ++i) {
            std::string arg = argv_[i];
            if (!is_opt(arg) || arg.size() < 2) continue;

            char key = arg[1];
            if (i + 1 < argc_ && !is_opt(argv_[i + 1])) {
                opt_map_[key] = argv_[i + 1];
                ++i;
            } else {
                opt_map_[key] = "true";
            }
        }
        if (contains_option('p')) {
            std::istringstream ss(opt_map_.at('p'));
            std::string token;
            while (std::getline(ss, token, ',')) {
                token.erase(0, token.find_first_not_of(" \t"));
                token.erase(token.find_last_not_of(" \t") + 1);
                if (!token.empty()) add_pattern(token);
            }
        }
    }

    bool contains_option(char opt) const { return opt_map_.count(opt) > 0; }

    void add_option(char o, const std::string& v) { opt_map_[o] = v; }

    // Returns nullopt if opt is not present — safe to call without contains_option().
    std::optional<std::string> value(char opt) const {
        auto it = opt_map_.find(opt);
        if (it == opt_map_.end()) return std::nullopt;
        return it->second;
    }

    // Returns true if opt is present and its value is "true".
    bool bool_value(char opt) const {
        return value(opt).value_or("false") == "true";
    }

    const Options& options() const { return opt_map_; }

    std::string path() const {
        return contains_option('P') ? opt_map_.at('P') : ".";
    }

    std::string abs_path() const {
        std::error_code ec;
        auto abs = std::filesystem::canonical(
            std::filesystem::path(path()), ec);
        std::string s = ec ? path() : abs.string();
        std::ranges::replace(s, '\\', '/');
        return s;
    }

    void set_path (const std::string& p)  { opt_map_['P'] = p;  }
    void set_regex(const std::string& re) { opt_map_['r'] = re; }

    std::string get_regex() const {
        return contains_option('r') ? opt_map_.at('r') : ".";
    }

    void add_pattern(const std::string& p) {
        if (std::ranges::find(patterns_, p) == patterns_.end())
            patterns_.push_back(p);
    }

    const Patterns& patterns() const { return patterns_; }

    const std::string& help() const { return help_str_; }

    void replace_help(const std::string& s) { help_str_ = s; }

    int arg_count() const { return argc_; }

private:
    int         argc_;
    char**      argv_;
    Options     opt_map_;
    Patterns    patterns_;
    std::string help_str_;

    static bool is_opt(const std::string& s) {
        return !s.empty() && s[0] == '/';
    }

    static std::string build_help() {
        return
            "\n  Help: [] => default values"
            "\n  /P - start path           [\".\"]"
            "\n  /p - patterns             \"rs,exe,rlib\""
            "\n  /s - recurse              [\"true\"]"
            "\n  /H - hide unused dirs     [\"true\"]"
            "\n  /r - regular expression   \"abc\""
            "\n  /v - display all options"
            "\n  /h - display this message";
    }
};
