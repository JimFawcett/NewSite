///////////////////////////////////////////////////////////
// DirNav.ixx - C++23 module: directory navigator        //
//                                                       //
// Jim Fawcett, https://JimFawcett.github.io             //
///////////////////////////////////////////////////////////

export module DirNav;
import std;

export class DirEvent {
public:
    virtual void do_dir (const std::string& d) = 0;
    virtual void do_file(const std::string& f) = 0;
    virtual void hide   (bool)                 {}  // optional hook: override to receive hide state
    virtual ~DirEvent() = default;
};

export template<typename App>
class DirNav {
    static_assert(
        std::is_base_of<DirEvent, App>::value,
        "DirNav<App>: App must derive from DirEvent"
    );

public:
    DirNav() = default;

    void recurse(bool p) { recurse_ = p; }
    void hide   (bool p) { hide_ = p; app_.hide(p); }  // propagate to app

    DirNav& add_skip(const std::string& s) {
        skip_dirs_.push_back(s);
        return *this;
    }

    DirNav& add_pat(const std::string& p) {
        pats_.push_back(p);
        return *this;
    }

    const std::vector<std::string>& get_patts() const { return pats_; }

    App&   get_app ()  { return app_; }
    size_t get_dirs () const { return num_dir_;  }
    size_t get_files() const { return num_file_; }

    void clear() {
        pats_.clear();
        num_dir_  = 0;
        num_file_ = 0;
        app_ = App{};
    }

    bool visit(const std::filesystem::path& dir) {
        std::error_code ec;
        if (!std::filesystem::is_directory(dir, ec)) return false;

        num_dir_++;

        std::string dir_name = dir.string();
        std::ranges::replace(dir_name, '\\', '/');

        std::vector<std::string>           files;
        std::vector<std::filesystem::path> sub_dirs;

        for (auto& entry : std::filesystem::directory_iterator(dir, ec)) {
            if (ec) break;
            if (entry.is_directory(ec)) {
                std::string dname = entry.path().filename().string();
                bool skipped = std::ranges::find(skip_dirs_, dname)
                               != skip_dirs_.end();
                if (!skipped) sub_dirs.push_back(entry.path());
            } else if (entry.is_regular_file(ec)) {
                num_file_++;
                if (in_patterns(entry.path()))
                    files.push_back(entry.path().filename().string());
            }
        }

        if (!files.empty() || !hide_)
            app_.do_dir(dir_name);

        for (auto& f : files)
            app_.do_file(f);

        if (recurse_)
            for (auto& sub : sub_dirs)
                visit(sub);

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

    bool in_patterns(const std::filesystem::path& p) const {
        if (pats_.empty()) return true;
        std::string ext = p.extension().string();
        if (!ext.empty() && ext[0] == '.') ext = ext.substr(1);
        return std::ranges::find(pats_, ext) != pats_.end();
    }
};
