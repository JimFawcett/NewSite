///////////////////////////////////////////////////////////
// TextFinder.h - text search engine for TextFinder      //
//                                                       //
// Jim Fawcett, https://JimFawcett.github.io             //
// C++17 port of Rust struct TextFinder + struct TfAppl  //
///////////////////////////////////////////////////////////
/*
  TextFinder  - reads a file and tests content against a regex
  TfAppl      - DirEvent implementation; owns a TextFinder
*/
#pragma once
#include <string>
#include <regex>
#include <fstream>
#include <iostream>
#include "DirNav.h"

///////////////////////////////////////////////////////////
// TextFinder - file content search engine
//
// Mirrors Rust TextFinder struct.
// find() never throws; all error paths return false.

class TextFinder {
public:
    TextFinder() = default;

    //---------------------------------------------------
    // Regex string setter / getter
    void        regex    (const std::string& s) { re_str_  = s; }
    const std::string& get_regex  () const      { return re_str_;  }

    //---------------------------------------------------
    // Last matched directory (used by TfAppl for hide logic)
    void        last_path    (const std::string& p) { last_dir_ = p; }
    const std::string& get_last_path() const        { return last_dir_; }

    //---------------------------------------------------
    // Read file at file_path and return true if re_str_ matches.
    // Opens in binary mode so non-UTF-8 content doesn't cause
    // exceptions — equivalent to Rust's lossy UTF-8 fallback.
    bool find(const std::string& file_path) const {
        std::ifstream file(file_path, std::ios::binary);
        if (!file.is_open()) return false;

        std::string contents(
            (std::istreambuf_iterator<char>(file)),
             std::istreambuf_iterator<char>()
        );
        file.close();

        try {
            std::regex re(re_str_);
            return std::regex_search(contents, re);
        } catch (...) {
            return false;
        }
    }

private:
    std::string re_str_;
    std::string last_dir_;
};

///////////////////////////////////////////////////////////
// TfAppl - application proxy; implements DirEvent
//
// Mirrors Rust TfAppl struct + DirEvent impl.

class TfAppl : public DirEvent {
public:
    TfAppl() = default;

    //---------------------------------------------------
    // DirEvent interface
    void do_dir(const std::string& d) override {
        curr_dir_ = d;
        if (!hide_) {
            std::cout << "\n--" << d;
        }
    }

    void do_file(const std::string& f) override {
        std::string fqf = curr_dir_ + "/" + f;
        if (!tf_.find(fqf)) return;

        // If hiding dirs, print directory name on first match there
        bool first_match_in_dir =
            tf_.get_last_path() != curr_dir_ && hide_;
        if (first_match_in_dir) {
            std::cout << "\n\n  " << curr_dir_;
            tf_.last_path(curr_dir_);
        }
        std::cout << "\n      \"" << f << "\"";
    }

    //---------------------------------------------------
    // Configuration
    void recurse(bool p) { recurse_ = p; }
    bool get_recurse() const { return recurse_; }

    void hide(bool p) { hide_ = p; }
    bool get_hide() const { return hide_; }

    void regex(const std::string& s) { tf_.regex(s); }
    const std::string& get_regex() const { return tf_.get_regex(); }

private:
    TextFinder  tf_;
    std::string curr_dir_;
    bool        hide_    = true;
    bool        recurse_ = true;
};
