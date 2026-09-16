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

inline constexpr std::string_view replacement{"\xEF\xBF\xBD"};   // U+FFFD, per §8

// §7: the length of the valid UTF-8 sequence beginning at i, or 0 if none does. Rejects
// truncated sequences, overlong encodings, encoded surrogates, and values above U+10FFFF.
inline std::size_t utf8Sequence(std::string_view bytes, std::size_t i) {
    const auto lead = static_cast<unsigned char>(bytes[i]);
    std::size_t trailing = 0;
    char32_t point = 0;

    if (lead < 0x80) return 1;
    else if ((lead & 0xE0) == 0xC0) { trailing = 1; point = lead & 0x1Fu; }
    else if ((lead & 0xF0) == 0xE0) { trailing = 2; point = lead & 0x0Fu; }
    else if ((lead & 0xF8) == 0xF0) { trailing = 3; point = lead & 0x07u; }
    else return 0;

    if (i + trailing >= bytes.size()) return 0;
    for (std::size_t k = 1; k <= trailing; ++k) {
        const auto next = static_cast<unsigned char>(bytes[i + k]);
        if ((next & 0xC0) != 0x80) return 0;
        point = (point << 6) | (next & 0x3Fu);
    }

    if (trailing == 1 && point < 0x80) return 0;        // overlong
    if (trailing == 2 && point < 0x800) return 0;       // overlong
    if (trailing == 3 && point < 0x10000) return 0;     // overlong
    if (point > 0x10FFFF) return 0;                     // beyond Unicode
    if (point >= 0xD800 && point <= 0xDFFF) return 0;   // encoded surrogate

    return trailing + 1;
}

// §7: the admission test of Spec_TextFinder.md §3.3, over the same sequence rule §8 renders with.
inline bool validUtf8(std::string_view bytes) {
    for (std::size_t i = 0; i < bytes.size();) {
        const std::size_t length = utf8Sequence(bytes, i);
        if (length == 0) return false;
        i += length;
    }
    return true;
}

#ifdef _WIN32
inline void appendUtf8(std::string& text, char32_t point) {
    if (point < 0x80) text += static_cast<char>(point);
    else if (point < 0x800) {
        text += static_cast<char>(0xC0 | (point >> 6));
        text += static_cast<char>(0x80 | (point & 0x3F));
    }
    else if (point < 0x10000) {
        text += static_cast<char>(0xE0 | (point >> 12));
        text += static_cast<char>(0x80 | ((point >> 6) & 0x3F));
        text += static_cast<char>(0x80 | (point & 0x3F));
    }
    else {
        text += static_cast<char>(0xF0 | (point >> 18));
        text += static_cast<char>(0x80 | ((point >> 12) & 0x3F));
        text += static_cast<char>(0x80 | ((point >> 6) & 0x3F));
        text += static_cast<char>(0x80 | (point & 0x3F));
    }
}
#endif

// §8: the generic form Spec_TextFinder.md §3.4 fixes, with U+FFFD for each unit that will not
// render and a report of whether any was substituted. Calls neither generic_string() nor
// filename().string(): on Windows both convert and can throw out of the walk, and on POSIX
// both pass invalid bytes through unexamined, so neither reports the condition §3.4 defines.
inline std::string renderPath(const std::filesystem::path& path, bool& lossy) {
    lossy = false;
    std::string text;

#ifdef _WIN32
    // The native string is UTF-16. Walk its units, mapping the separator and encoding each
    // scalar value, and substitute for a surrogate that is not part of a pair.
    const std::wstring& native = path.native();
    for (std::size_t i = 0; i < native.size(); ++i) {
        char32_t point = static_cast<unsigned short>(native[i]);
        if (point == L'\\') point = U'/';

        if (point >= 0xD800 && point <= 0xDBFF) {
            const bool paired = i + 1 < native.size() &&
                                static_cast<unsigned short>(native[i + 1]) >= 0xDC00 &&
                                static_cast<unsigned short>(native[i + 1]) <= 0xDFFF;
            if (!paired) { text += replacement; lossy = true; continue; }
            const char32_t low = static_cast<unsigned short>(native[++i]);
            point = 0x10000 + ((point - 0xD800) << 10) + (low - 0xDC00);
        }
        else if (point >= 0xDC00 && point <= 0xDFFF) { text += replacement; lossy = true; continue; }

        appendUtf8(text, point);
    }
#else
    // The native string is bytes and the separator is already /. Copy each valid sequence and
    // substitute for each byte that begins none.
    const std::string& native = path.native();
    for (std::size_t i = 0; i < native.size();) {
        const std::size_t length = utf8Sequence(native, i);
        if (length == 0) { text += replacement; lossy = true; ++i; continue; }
        text.append(native, i, length);
        i += length;
    }
#endif

    if (text.starts_with("./")) text.erase(0, 2);   // a root of . contributes no leading ./
    return text;
}

inline std::string baseName(const std::filesystem::path& path) {
    const std::filesystem::path base = path.has_filename() ? path : path.parent_path();
    bool lossy = false;
    return renderPath(base.filename(), lossy);
}

inline std::string displayPath(const std::filesystem::path& path) {
    bool lossy = false;
    return renderPath(path, lossy);
}

// §5 rule 6: whether this entry's own name renders without substitution.
inline bool renderable(const std::filesystem::path& path) {
    bool lossy = false;
    renderPath(path, lossy);
    return !lossy;
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
    // §4: all three arguments are retained by reference and outlive this instance. The
    // expression is compiled once here; std::regex_error propagates to Cpp_TextFinder_Entry.
    Cpp_TextFinder_Dirnav(Out& out, const SkipList& skips, const ProgramCommands& commands)
        : out_{out}, skips_{skips}, commands_{commands},
          expression_{commands.regexText, std::regex_constants::ECMAScript},
          pathOnly_{!commands.lineNumbers && !commands.matchedLine},
          contentNotNeeded_{pathOnly_ && commands.regexText == "."} {}

    // §5 rule 1. Carries no state from one call to the next.
    void search(const std::filesystem::path& root) {
        std::error_code error;

        const bool link = std::filesystem::is_symlink(root, error);
        if (error || link) { announceCannotOpen(root); return; }

        // §5 rule 6: a root whose text will not render is announced and not traversed.
        if (!renderable(root)) { announceCannotOpen(root); return; }

        const std::filesystem::file_status status = std::filesystem::status(root, error);
        if (error) { announceCannotOpen(root); return; }

        if (std::filesystem::is_regular_file(status)) { examine(root); return; }
        if (!std::filesystem::is_directory(status)) { announceCannotOpen(root); return; }

        // §5 rule 4: the skip list is never consulted for a root path.
        walk(root);
    }

    // §8.1: the run summary of Spec_TextFinder.md §3.6, written once after the last root.
    void emitRunSummary() {
        emit("accessed " + std::to_string(files_) + " files, " +
             std::to_string(directories_) + " directories");
    }

private:
    // §5 rule 2: one level per call, entries taken as directory_iterator yields them -
    // neither collected nor reordered - with explicit recursion into each subdirectory entered.
    void walk(const std::filesystem::path& directory) {
        ++directories_;   // §8.1: counted before enumeration, so one that fails is counted too

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
            if (link) continue;   // §5 rule 5: passed over silently, never opened

            // §5 rule 6: after the link test and before the skip list, the extension filter,
            // and any open, so a name that will not render is announced whatever /p holds.
            if (!renderable(path.filename())) { announceCannotOpen(path); continue; }

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

    // §7: the three admission tests of Spec_TextFinder.md §3.3.
    void examine(const std::filesystem::path& file) {
        if (!selected(file)) return;
        ++files_;   // §8.1: after the /p test admits it, ahead of every later outcome

        std::error_code error;
        const std::uintmax_t size = std::filesystem::file_size(file, error);
        if (error) { announceCannotOpen(file); return; }
        if (size > sizeLimit) { emit("too large " + displayPath(file)); return; }

        // §7: with the default expression and neither /n nor /L, every non-empty file
        // matches and its block is the path line, so no file is opened and - nothing
        // having been read or rejected - no file announcement arises under either /h.
        if (contentNotNeeded_) {
            if (size == 0) return;
            emit(displayPath(file));
            return;
        }

        std::ifstream input{file, std::ios::binary};
        if (!input) { announceCannotOpen(file); return; }

        // Read in full, so a file failing a later test is skipped entirely, not searched in part.
        std::string bytes(static_cast<std::size_t>(size), '\0');
        input.read(bytes.data(), static_cast<std::streamsize>(size));
        if (input.bad()) { announceCannotOpen(file); return; }
        bytes.resize(static_cast<std::size_t>(input.gcount()));

        if (bytes.find('\0') != std::string::npos || !validUtf8(bytes)) {
            announceNoMatch("skipped " + displayPath(file));
            return;
        }
        if (bytes.starts_with("\xEF\xBB\xBF")) bytes.erase(0, 3);

        // §8: a file that matched names itself in its block, so only one that did not is announced.
        if (!scan(file, bytes)) announceNoMatch("searched " + displayPath(file));
    }

    // §8: writes the block of Spec_TextFinder.md §3.4 and answers whether the file matched.
    bool scan(const std::filesystem::path& file, const std::string& bytes) {
        bool opened = false;
        std::size_t number = 0;

        for (std::string_view line : splitLines(bytes)) {
            ++number;
            if (!std::regex_search(line.begin(), line.end(), expression_)) continue;

            if (!opened) {
                emit(displayPath(file));   // the block's path line, written once
                opened = true;

                // With neither /n nor /L the block has no detail lines, so the first
                // match settles the file.
                if (pathOnly_) return true;
            }

            std::string detail = "  ";
            if (commands_.lineNumbers) detail += std::to_string(number);
            if (commands_.lineNumbers && commands_.matchedLine) detail += " - ";
            if (commands_.matchedLine) detail += std::string{line};
            emit(detail);
        }

        return opened;
    }

    // §6: the extension is the text after the last dot in the file name, dot-files included.
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
    void announceNoMatch(const std::string& text) { if (!commands_.suppressOnNoMatch) emit(text); }
    void announceCannotOpen(const std::filesystem::path& path) { emit("cannot open " + displayPath(path)); }

    Out&                    out_;
    const SkipList&         skips_;
    const ProgramCommands&  commands_;
    std::regex              expression_;
    bool                    pathOnly_;
    bool                    contentNotNeeded_;
    std::size_t             files_{0};          // §8.1: never reset between roots
    std::size_t             directories_{0};
};
