///////////////////////////////////////////////////////////
// DirNav.h - directory navigator for TextFinder         //
//                                                       //
// Jim Fawcett, https://JimFawcett.github.io             //
// C++17 port of Rust dir_nav_lib::{DirEvent, DirNav}   //
///////////////////////////////////////////////////////////
/*
  DirEvent  - pure-virtual interface (mirrors Rust DirEvent trait)
  DirNav<App> - template navigator; App must derive from DirEvent

  Behaviour:
  - Recursively walks a directory tree from a root path.
  - Calls app.do_dir(dir)  for each directory that has matched files
    (or every directory when hide == false).
  - Calls app.do_file(name) for each file whose extension is in pats_
    (or every file when pats_ is empty).
  - Skips directories listed in skip_dirs_.
  - Recurse / hide flags default to true, matching the Rust original.
*/
#pragma once
#include <string>
#include <vector>
#include <algorithm>
#include <filesystem>
#include <type_traits>

///////////////////////////////////////////////////////////
// DirEvent - interface that App must implement

class DirEvent {
public:
    virtual void do_dir (const std::string& d) = 0;
    virtual void do_file(const std::string& f) = 0;
    virtual ~DirEvent() = default;
};

///////////////////////////////////////////////////////////
// DirNav<App> - directory navigator

template<typename App>
class DirNav {
    static_assert(
        std::is_base_of<DirEvent, App>::value,
        "DirNav<App>: App must derive from DirEvent"
    );

public:
    DirNav() = default;

    //---------------------------------------------------
    // Configuration
    void recurse(bool p) { recurse_ = p; }
    void hide   (bool p) { hide_    = p; }

    // Add a directory name to skip during traversal
    DirNav& add_skip(const std::string& s) {
        skip_dirs_.push_back(s);
        return *this;
    }

    // Add a file extension (without leading dot) to search for
    DirNav& add_pat(const std::string& p) {
        pats_.push_back(p);
        return *this;
    }

    const std::vector<std::string>& get_patts() const { return pats_; }

    //---------------------------------------------------
    // Access
    App&   get_app ()  { return app_; }
    size_t get_dirs () const { return num_dir_;  }
    size_t get_files() const { return num_file_; }

    //---------------------------------------------------
    // Reset counters and app state
    void clear() {
        pats_.clear();
        num_dir_  = 0;
        num_file_ = 0;
        app_ = App{};
    }

    //---------------------------------------------------
    // Depth-first traversal from dir
    // Returns false if dir is not a directory.
    bool visit(const std::filesystem::path& dir) {
        std::error_code ec;
        if (!std::filesystem::is_directory(dir, ec)) return false;

        num_dir_++;

        // Normalise to forward-slash separators (matches Rust replace_sep)
        std::string dir_name = dir.string();
        std::replace(dir_name.begin(), dir_name.end(), '\\', '/');

        std::vector<std::string>              files;
        std::vector<std::filesystem::path>    sub_dirs;

        for (auto& entry : std::filesystem::directory_iterator(dir, ec)) {
            if (ec) break;

            if (entry.is_directory(ec)) {
                std::string dname = entry.path().filename().string();
                bool skipped = std::find(
                    skip_dirs_.begin(), skip_dirs_.end(), dname
                ) != skip_dirs_.end();
                if (!skipped) sub_dirs.push_back(entry.path());

            } else if (entry.is_regular_file(ec)) {
                num_file_++;
                if (in_patterns(entry.path())) {
                    files.push_back(entry.path().filename().string());
                }
            }
        }

        /*-- notify app about directory and its matched files --*/
        if (!files.empty() || !hide_) {
            app_.do_dir(dir_name);
        }
        for (auto& f : files) {
            app_.do_file(f);
        }

        /*-- recurse into subdirectories --*/
        if (recurse_) {
            for (auto& sub : sub_dirs) {
                visit(sub);
            }
        }
        return true;
    }

private:
    App                      app_;
    std::vector<std::string> pats_;
    std::vector<std::string> skip_dirs_;
    size_t                   num_file_ = 0;
    size_t                   num_dir_  = 0;
    bool                     recurse_  = true;
    bool                     hide_     = true;

    // Returns true if path's extension is in pats_, or pats_ is empty.
    bool in_patterns(const std::filesystem::path& p) const {
        if (pats_.empty()) return true;
        std::string ext = p.extension().string();
        if (!ext.empty() && ext[0] == '.') ext = ext.substr(1);
        return std::find(pats_.begin(), pats_.end(), ext) != pats_.end();
    }
};
