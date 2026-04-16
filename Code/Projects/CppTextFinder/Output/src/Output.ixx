export module output;

import std;

export class Output
{
public:
    explicit Output(bool hide = true)
        : hide_(hide)
        , dir_printed_(false)
        , match_count_(0)
        , regex_pattern_(".")
    {}

    void set_regex(const std::string& pattern)
    {
        regex_pattern_ = pattern;
    }

    void set_hide(bool h)
    {
        hide_ = h;
    }

    void on_dir(const std::string& dir_path)
    {
        current_dir_  = dir_path;
        dir_printed_  = false;

        if (!hide_)
        {
            std::cout << "\n  " << current_dir_ << std::endl;
            dir_printed_ = true;
        }
    }

    void on_file(const std::string& file_name)
    {
        std::string full_path = current_dir_ + "/" + file_name;

        if (!find(full_path))
            return;

        if (hide_ && !dir_printed_)
        {
            std::cout << "\n  " << current_dir_ << std::endl;
            dir_printed_ = true;
        }

        std::cout << "      " << file_name << std::endl;

        ++match_count_;
    }

    std::size_t match_count() const
    {
        return match_count_;
    }

private:
    bool        hide_;
    bool        dir_printed_;
    std::size_t match_count_;
    std::string regex_pattern_;
    std::string current_dir_;

    bool find(const std::string& file_path)
    {
        try
        {
            std::string contents;

            // Attempt text read first
            {
                std::ifstream ifs(file_path);
                if (ifs)
                {
                    std::ostringstream oss;
                    oss << ifs.rdbuf();
                    if (ifs || ifs.eof())
                        contents = oss.str();
                }
            }

            // If text read failed or produced empty result, attempt binary read
            if (contents.empty())
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

            std::regex re;
            try
            {
                re = std::regex(regex_pattern_);
            }
            catch (const std::regex_error&)
            {
                return false;
            }

            return std::regex_search(contents, re);
        }
        catch (...)
        {
            return false;
        }
    }
};