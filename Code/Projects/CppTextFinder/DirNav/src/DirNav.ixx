export module dir_nav;

import std;

export {

using DirCallback  = std::function<void(const std::string& dir_path)>;
using FileCallback = std::function<void(const std::string& file_name)>;

class DirNav {
public:
    explicit DirNav(bool recurse = true)
        : recurse_(recurse)
        , skip_list_({
              // C#/.NET
              "bin", "obj",
              // Rust
              "target",
              // C++
              "build", "out",
              // Python
              "__pycache__", ".venv", "venv", "dist",
              // VCS / IDE
              ".git", ".vs", ".idea"
          })
        , file_count_(0)
        , dir_count_(0)
    {}

    void set_dir_handler(DirCallback cb) {
        dir_callback_ = std::move(cb);
    }

    void set_file_handler(FileCallback cb) {
        file_callback_ = std::move(cb);
    }

    void add_pattern(const std::string& ext) {
        patterns_.insert(normalise_ext(ext));   // normalise once at insert
    }

    void add_skip(const std::string& name) {
        skip_list_.insert(name);
    }

    bool visit(const std::filesystem::path& root) {
        std::error_code ec;
        bool exists = std::filesystem::exists(root, ec);
        if (ec || !exists) return false;
        bool is_dir = std::filesystem::is_directory(root, ec);
        if (ec || !is_dir) return false;

        file_count_ = 0;
        dir_count_  = 0;

        visit_impl(root);
        return true;
    }

    std::size_t file_count() const { return file_count_; }
    std::size_t dir_count()  const { return dir_count_;  }

private:
    bool                            recurse_;
    std::unordered_set<std::string> skip_list_;
    std::unordered_set<std::string> patterns_;
    DirCallback                     dir_callback_;
    FileCallback                    file_callback_;
    std::size_t                     file_count_;
    std::size_t                     dir_count_;

    // Strip leading dot and lowercase on Windows so lookups are O(1) and allocation-free.
    static std::string normalise_ext(std::string s) {
        if (!s.empty() && s.front() == '.') s.erase(s.begin());
#if defined(_WIN32)
        std::transform(s.begin(), s.end(), s.begin(),
                       [](unsigned char c){ return static_cast<char>(std::tolower(c)); });
#endif
        return s;
    }

    bool extension_matches(const std::filesystem::path& file_path) const {
        if (patterns_.empty()) return true;
        return patterns_.contains(normalise_ext(file_path.extension().string()));
    }

    void visit_impl(const std::filesystem::path& dir) {
        ++dir_count_;

        if (dir_callback_)
            dir_callback_(dir.generic_string());

        std::error_code ec;
        std::filesystem::directory_iterator it(dir, ec);
        if (ec) return;

        for (const auto& entry : it) {
            std::error_code entry_ec;

            bool is_regular = entry.is_regular_file(entry_ec);
            if (!entry_ec && is_regular) {
                if (extension_matches(entry.path())) {
                    ++file_count_;
                    if (file_callback_)
                        file_callback_(entry.path().filename().generic_string());
                }
                continue;
            }

            bool is_directory = entry.is_directory(entry_ec);
            if (!entry_ec && is_directory) {
                std::string bare_name = entry.path().filename().string();
                if (skip_list_.contains(bare_name)) continue;
                if (recurse_)
                    visit_impl(entry.path());
            }
        }
    }
};

} // export
