export module output;

import std;

export class Output
{
public:
    explicit Output(bool hide = true)
        : hide_(hide)
        , dir_printed_(false)
        , match_count_(0)
        , regex_(std::regex("."))
    {}

    void set_regex(const std::string& pattern)
    {
        try   { regex_ = std::regex(pattern); }
        catch (const std::regex_error&) { regex_.reset(); }
    }

    void on_dir(const std::string& dir_path)
    {
        current_dir_ = dir_path;
        dir_printed_ = false;

        if (!hide_)
        {
            std::cout << "\n  " << current_dir_ << '\n' << std::flush;
            dir_printed_ = true;
        }
    }

    void on_file(const std::string& file_name)
    {
        std::filesystem::path full_path =
            std::filesystem::path(current_dir_) / file_name;

        if (!find(full_path))
            return;

        if (hide_ && !dir_printed_)
        {
            std::cout << "\n  " << current_dir_ << '\n';
            dir_printed_ = true;
        }

        std::cout << "      " << file_name << '\n' << std::flush;
        ++match_count_;
    }

    std::size_t match_count() const
    {
        return match_count_;
    }

private:
    bool                       hide_;
    bool                       dir_printed_;
    std::size_t                match_count_;
    std::optional<std::regex>  regex_;
    std::string                current_dir_;

    bool find(const std::filesystem::path& file_path) const
    {
        if (!regex_) return false;
        try
        {
            std::string contents;
            bool        read_ok = false;

            {
                std::ifstream ifs(file_path);
                if (ifs)
                {
                    std::ostringstream oss;
                    oss << ifs.rdbuf();
                    if (ifs || ifs.eof())
                    {
                        contents = oss.str();
                        read_ok  = true;
                    }
                }
            }

            if (!read_ok)
            {
                std::ifstream ifs(file_path, std::ios::binary);
                if (!ifs)
                    return false;

                std::ostringstream oss;
                oss << ifs.rdbuf();
                if (!ifs && !ifs.eof())
                    return false;

                contents = oss.str();
            }

            return std::regex_search(contents, *regex_);
        }
        catch (...)
        {
            return false;
        }
    }
};
