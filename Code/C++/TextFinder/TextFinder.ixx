///////////////////////////////////////////////////////////
// TextFinder.ixx - C++23 module: search engine          //
//                                                       //
// Jim Fawcett, https://JimFawcett.github.io             //
///////////////////////////////////////////////////////////

export module TextFinder;
import std;
import DirNav;

///////////////////////////////////////////////////////////
// TextFinder - reads a file and tests content against a
// pre-compiled regex.
//
// Fix 1: regex is compiled once in regex(), not per find().
// Fix 3: last_dir_ moved to TfAppl; TextFinder owns only
//        search state (pattern + compiled regex).

export class TextFinder {
public:
    TextFinder() = default;

    // Compile the regex immediately; mark invalid on error.
    void regex(const std::string& s) {
        re_str_ = s;
        try {
            re_compiled_ = std::regex(s);
            re_valid_ = true;
        } catch (...) {
            re_valid_ = false;
        }
    }

    const std::string& get_regex() const { return re_str_; }

    // Returns true if file content at file_path matches the
    // compiled regex. Binary-mode read; never throws.
    bool find(const std::string& file_path) const {
        if (!re_valid_) return false;

        std::ifstream file(file_path, std::ios::binary);
        if (!file.is_open()) return false;

        std::string contents(
            (std::istreambuf_iterator<char>(file)),
             std::istreambuf_iterator<char>()
        );

        try {
            return std::regex_search(contents, re_compiled_);
        } catch (...) {
            return false;
        }
    }

private:
    std::string re_str_;
    std::regex  re_compiled_;
    bool        re_valid_ = false;
};

///////////////////////////////////////////////////////////
// TfAppl - DirEvent implementation; owns a TextFinder.
//
// Fix 2: recurse_ field removed — recursion is DirNav's job.
// Fix 3: last_dir_ moved here from TextFinder.

export class TfAppl : public DirEvent {
public:
    TfAppl() = default;

    void do_dir(const std::string& d) override {
        curr_dir_ = d;
        if (!hide_)
            std::cout << "\n--" << d;
    }

    void do_file(const std::string& f) override {
        std::string fqf = curr_dir_ + "/" + f;
        if (!tf_.find(fqf)) return;

        // Print directory header on first match in this directory.
        if (last_dir_ != curr_dir_ && hide_) {
            std::cout << "\n\n  " << curr_dir_;
            last_dir_ = curr_dir_;
        }
        std::cout << "\n      \"" << f << "\"";
    }

    void hide(bool p) override { hide_ = p; }

    void               regex    (const std::string& s) { tf_.regex(s); }
    const std::string& get_regex() const               { return tf_.get_regex(); }

private:
    TextFinder  tf_;
    std::string curr_dir_;
    std::string last_dir_;
    bool        hide_ = true;
};
