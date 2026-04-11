///////////////////////////////////////////////////////////
// CmdLine.h - command-line parser for TextFinder        //
//                                                       //
// Jim Fawcett, https://JimFawcett.github.io             //
// C++17 port of Rust cmd_line_lib::CmdLineParse         //
///////////////////////////////////////////////////////////
/*
  Parses argv into:
    opt_map  : map<char, string>  for options like /P, /r, /s, /H, /v, /h
    patterns : vector<string>     file extensions from /p "rs,cpp,h"

  Options format:
    /X value   -> opt_map['X'] = "value"
    /X         -> opt_map['X'] = "true"   (flag, no following value)
*/
#pragma once
#include <string>
#include <map>
#include <vector>
#include <sstream>
#include <algorithm>
#include <filesystem>

class CmdLineParse {
public:
    using Options  = std::map<char, std::string>;
    using Patterns = std::vector<std::string>;

    //---------------------------------------------------
    // Construction
    CmdLineParse(int argc, char* argv[])
        : argc_(argc), argv_(argv), help_str_(build_help()) {}

    //---------------------------------------------------
    // Set sensible defaults before calling parse()
    void default_options() {
        opt_map_['P'] = ".";       // root is current directory
        opt_map_['s'] = "true";    // recurse
        opt_map_['r'] = ".";       // regex "." matches everything
        opt_map_['H'] = "true";    // hide directories with no matches
    }

    //---------------------------------------------------
    // Parse argc/argv into opt_map_ and patterns_
    void parse() {
        for (int i = 1; i < argc_; ++i) {
            std::string arg = argv_[i];
            if (!is_opt(arg)) continue;
            if (arg.size() < 2) continue;

            char key = arg[1];
            // does the next token exist and is it a value (not an option)?
            if (i + 1 < argc_ && !is_opt(argv_[i + 1])) {
                opt_map_[key] = argv_[i + 1];
                ++i;  // consume the value
            } else {
                opt_map_[key] = "true";  // bare flag
            }
        }
        /*-- split /p "rs,cpp,h" into individual extension strings --*/
        if (contains_option('p')) {
            std::string pat_str = value('p');
            std::istringstream ss(pat_str);
            std::string token;
            while (std::getline(ss, token, ',')) {
                // trim whitespace
                token.erase(0, token.find_first_not_of(" \t"));
                token.erase(token.find_last_not_of(" \t") + 1);
                if (!token.empty()) add_pattern(token);
            }
        }
    }

    //---------------------------------------------------
    // Option queries
    bool contains_option(char opt) const {
        return opt_map_.count(opt) > 0;
    }

    void add_option(char o, const std::string& v) {
        opt_map_[o] = v;
    }

    const std::string& value(char opt) const {
        return opt_map_.at(opt);
    }

    const Options& options() const { return opt_map_; }

    //---------------------------------------------------
    // Path helpers
    std::string path() const {
        if (contains_option('P')) return opt_map_.at('P');
        return ".";
    }

    // Absolute, canonical path with forward-slash separators
    std::string abs_path() const {
        std::error_code ec;
        auto abs = std::filesystem::canonical(
            std::filesystem::path(path()), ec);
        std::string s = ec ? path() : abs.string();
        std::replace(s.begin(), s.end(), '\\', '/');
        return s;
    }

    void set_path(const std::string& p) { opt_map_['P'] = p; }

    //---------------------------------------------------
    // Regex helpers
    void set_regex(const std::string& re) { opt_map_['r'] = re; }

    std::string get_regex() const {
        if (contains_option('r')) return opt_map_.at('r');
        return ".";
    }

    //---------------------------------------------------
    // Pattern (file extension) helpers
    void add_pattern(const std::string& p) {
        if (std::find(patterns_.begin(), patterns_.end(), p) == patterns_.end())
            patterns_.push_back(p);
    }

    const Patterns& patterns() const { return patterns_; }

    //---------------------------------------------------
    // Help string
    const std::string& help() const { return help_str_; }

    void replace_help(const std::string& s) { help_str_ = s; }

    //---------------------------------------------------
    // Number of raw command-line arguments (including argv[0])
    int arg_count() const { return argc_; }

private:
    int    argc_;
    char** argv_;
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
