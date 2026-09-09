// Cpp_TextFinder_Dirnav.ixx - traversal, file admission, matching, and emission per Spec_Cpp_TextFinder_Dirnav.md

export module Cpp_TextFinder_Dirnav;

import std;
import Cpp_TextFinder_Cmdline;

export class Output {
public:
    virtual ~Output() = default;
    virtual void output(const std::string& text) = 0;
};

export using SkipList = std::vector<std::string>;

// These helpers are not exported, so they have module linkage and stay invisible to importers.
// They are inline because the class template below is instantiated in the importing translation unit.

inline constexpr std::uintmax_t sizeLimit = 10u * 1024u * 1024u;   // Spec_TextFinder.md §3.3

inline std::string toUtf8(const std::u8string& text) {
    return std::string{reinterpret_cast<const char*>(text.data()), text.size()};
}

// Case-sensitive on POSIX, case-insensitive on Windows, per Spec_TextFinder.md §3.2 and §5.
inline bool sameName(std::string_view left, std::string_view right) {
#ifdef _WIN32
    if (left.size() != right.size()) return false;
    for (std::size_t i = 0; i < left.size(); ++i) {
        const auto l = std::tolower(static_cast<unsigned char>(left[i]));
        const auto r = std::tolower(static_cast<unsigned char>(right[i]));
        if (l != r) return false;
    }
    return true;
#else
    return left == right;
#endif
}

inline std::string baseName(const std::filesystem::path& path) {
    const std::filesystem::path base = path.has_filename() ? path : path.parent_path();
    return toUtf8(base.filename().u8string());
}

inline std::string displayPath(const std::filesystem::path& path) {
    std::string text = toUtf8(path.generic_u8string());
    if (text.starts_with("./")) text.erase(0, 2);
    return text;
}

inline bool validUtf8(std::string_view bytes) {
    for (std::size_t i = 0; i < bytes.size();) {
        const auto lead = static_cast<unsigned char>(bytes[i]);
        std::size_t trailing = 0;
        char32_t point = 0;

        if (lead < 0x80) { ++i; continue; }
        else if ((lead & 0xE0) == 0xC0) { trailing = 1; point = lead & 0x1Fu; }
        else if ((lead & 0xF0) == 0xE0) { trailing = 2; point = lead & 0x0Fu; }
        else if ((lead & 0xF8) == 0xF0) { trailing = 3; point = lead & 0x07u; }
        else return false;

        if (i + trailing >= bytes.size()) return false;
        for (std::size_t k = 1; k <= trailing; ++k) {
            const auto next = static_cast<unsigned char>(bytes[i + k]);
            if ((next & 0xC0) != 0x80) return false;
            point = (point << 6) | (next & 0x3Fu);
        }

        if (trailing == 1 && point < 0x80) return false;        // overlong
        if (trailing == 2 && point < 0x800) return false;       // overlong
        if (trailing == 3 && point < 0x10000) return false;     // overlong
        if (point > 0x10FFFF) return false;                     // beyond Unicode
        if (point >= 0xD800 && point <= 0xDFFF) return false;   // encoded surrogate

        i += trailing + 1;
    }
    return true;
}

// LF, CRLF, and bare CR terminate a line; a final unterminated run is still a line.
inline std::vector<std::string_view> splitLines(std::string_view text) {
    std::vector<std::string_view> lines;
    std::size_t start = 0;
    for (std::size_t i = 0; i < text.size();) {
        if (text[i] == '\n') {
            lines.push_back(text.substr(start, i - start));
            start = ++i;
        }
        else if (text[i] == '\r') {
            lines.push_back(text.substr(start, i - start));
            i += (i + 1 < text.size() && text[i + 1] == '\n') ? 2 : 1;
            start = i;
        }
        else ++i;
    }
    if (start < text.size()) lines.push_back(text.substr(start));
    return lines;
}

export template <typename Out>
    requires std::derived_from<Out, Output>
class Cpp_TextFinder_Dirnav {
public:
    Cpp_TextFinder_Dirnav(Out& out, const SkipList& skips, const ProgramCommands& commands)
        : out_{out}, skips_{skips}, commands_{commands},
          expression_{commands.regexText, std::regex_constants::ECMAScript} {}

    void search(const std::filesystem::path& root) {
        std::error_code error;

        const bool link = std::filesystem::is_symlink(root, error);
        if (error || link) { announceCannotOpen(root); return; }

        const std::filesystem::file_status status = std::filesystem::status(root, error);
        if (error) { announceCannotOpen(root); return; }

        if (std::filesystem::is_regular_file(status)) { examine(root); return; }
        if (!std::filesystem::is_directory(status)) { announceCannotOpen(root); return; }
        if (pruned(root)) return;

        walk(root);
    }

private:
    void walk(const std::filesystem::path& directory) {
        std::error_code error;
        std::filesystem::directory_iterator entry{directory, error};
        if (error) { announceCannotOpen(directory); return; }

        const std::filesystem::directory_iterator end;
        for (; entry != end; entry.increment(error)) {
            if (error) { announceCannotOpen(directory); return; }
            const std::filesystem::path& path = entry->path();

            std::error_code kind;
            const bool link = entry->is_symlink(kind);
            if (kind) { announceCannotOpen(path); continue; }
            if (link) continue;

            const bool folder = entry->is_directory(kind);
            if (kind) { announceCannotOpen(path); continue; }
            if (folder) {
                if (commands_.recurse && !pruned(path)) walk(path);
                continue;
            }

            const bool file = entry->is_regular_file(kind);
            if (kind) { announceCannotOpen(path); continue; }
            if (file) examine(path);
            else announceCannotOpen(path);
        }
    }

    void examine(const std::filesystem::path& file) {
        if (!selected(file)) return;

        std::error_code error;
        const std::uintmax_t size = std::filesystem::file_size(file, error);
        if (error) { announceCannotOpen(file); return; }
        if (size > sizeLimit) { emit("too large " + displayPath(file)); return; }

        std::ifstream input{file, std::ios::binary};
        if (!input) { announceCannotOpen(file); return; }

        std::string bytes(static_cast<std::size_t>(size), '\0');
        input.read(bytes.data(), static_cast<std::streamsize>(size));
        if (input.bad()) { announceCannotOpen(file); return; }
        bytes.resize(static_cast<std::size_t>(input.gcount()));

        if (bytes.find('\0') != std::string::npos || !validUtf8(bytes)) {
            announceFile("skipped " + displayPath(file));
            return;
        }
        if (bytes.starts_with("\xEF\xBB\xBF")) bytes.erase(0, 3);

        announceFile("searched " + displayPath(file));
        scan(file, bytes);
    }

    void scan(const std::filesystem::path& file, const std::string& bytes) {
        const std::string path = displayPath(file);
        std::size_t number = 0;
        for (std::string_view line : splitLines(bytes)) {
            ++number;
            if (!std::regex_search(line.begin(), line.end(), expression_)) continue;

            std::string record = path;
            if (commands_.lineNumbers) record += " - " + std::to_string(number);
            if (commands_.matchedLine) record += " - " + std::string{line};
            emit(record);
        }
    }

    bool selected(const std::filesystem::path& file) const {
        if (commands_.extensions.empty()) return true;

        const std::string name = baseName(file);
        const std::size_t dot = name.rfind('.');
        if (dot == std::string::npos) return false;

        const std::string_view extension{name.data() + dot + 1, name.size() - dot - 1};
        return std::ranges::any_of(commands_.extensions,
                                   [&](const std::string& item) { return sameName(item, extension); });
    }

    bool pruned(const std::filesystem::path& directory) const {
        const std::string name = baseName(directory);
        return std::ranges::any_of(skips_,
                                   [&](const std::string& item) { return sameName(item, name); });
    }

    void emit(const std::string& text) { out_.output(text); }
    void announceFile(const std::string& text) { if (!commands_.suppressNoMatch) emit(text); }
    void announceCannotOpen(const std::filesystem::path& path) { emit("cannot open " + displayPath(path)); }

    Out&                    out_;
    const SkipList&         skips_;
    const ProgramCommands&  commands_;
    std::regex              expression_;
};
