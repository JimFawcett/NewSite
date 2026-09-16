// Cpp_TextFinder_Cmdline.ixx - converts argc/argv into ProgramCommands per Spec_Cpp_TextFinder_Cmdline.md

export module Cpp_TextFinder_Cmdline;

import std;

// §4: the initializers are the sole authority in code for the defaults of Spec_TextFinder.md §5,
// so a default-constructed ProgramCommands equals the result of parsing an empty command line.
export struct ProgramCommands {
    std::vector<std::string> rootPaths{"."};          // /P
    std::vector<std::string> extensions{};            // /p
    std::string              regexText{"."};          // /r
    bool                     recurse{true};           // /s
    bool                     suppressOnNoMatch{true}; // /h
    bool                     verbose{false};          // /v
    bool                     help{false};             // /H
    bool                     lineNumbers{false};      // /n
    bool                     matchedLine{false};      // /L
};

export std::expected<ProgramCommands, std::string> parse(int argc, char* argv[]);
export std::string usageLine();
export std::string helpText();
export std::string optionsText(const ProgramCommands& commands);

namespace {

// §5 rule 1: the nine letters of Spec_TextFinder.md §5, in that table's order.
constexpr std::string_view switchLetters = "PprshvHnL";

// §7: whitespace is what std::isspace reports in the C locale.
bool isSpace(char c) { return std::isspace(static_cast<unsigned char>(c)) != 0; }

std::string trim(std::string_view text) {
    while (!text.empty() && isSpace(text.front())) text.remove_prefix(1);
    while (!text.empty() && isSpace(text.back())) text.remove_suffix(1);
    return std::string{text};
}

// §7: split on commas, trim, strip one leading dot, discard empties, keep order and duplicates.
std::vector<std::string> normalizeExtensions(std::string_view argument) {
    std::vector<std::string> items;
    for (std::size_t pos = 0; pos <= argument.size();) {
        const std::size_t comma = argument.find(',', pos);
        const std::size_t end = (comma == std::string_view::npos) ? argument.size() : comma;

        std::string item = trim(argument.substr(pos, end - pos));
        if (!item.empty() && item.front() == '.') item.erase(0, 1);
        if (!item.empty()) items.push_back(std::move(item));

        if (comma == std::string_view::npos) break;
        pos = comma + 1;
    }
    return items;
}

// §5 rule 3: true or false only, under ASCII case folding.
std::optional<bool> toBool(std::string_view token) {
    std::string folded;
    for (char c : token) folded += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    if (folded == "true") return true;
    if (folded == "false") return false;
    return std::nullopt;
}

// §6: a reason line from Spec_TextFinder.md §5.2, a newline, then the usage line.
std::string diagnostic(std::string_view reason) { return std::string{reason} + "\n" + usageLine(); }

} // namespace

std::string usageLine() {
    return R"(usage: Cpp_TextFinder [/P path] [/p "ext, ext"] [/r regex] [/s bool] [/h bool] [/v bool] [/H bool] [/n bool] [/L bool])"
           "\n";
}

// §8: the text Spec_TextFinder.md §5.1 fixes, with <executable> replaced by Cpp_TextFinder.
std::string helpText() {
    return usageLine() + R"HELP(
  /P  path (.)             root path for traversal; repeat to add more root paths
  /p  "ext, ext" ()        comma-separated bare extensions to search; empty searches every file
  /r  regex (.)            regular expression evaluated against each line
  /s  true|false (true)    recurse into subdirectories
  /h  true|false (true)    hide files that matched nothing; errors always appear
  /v  true|false (false)   list the resolved option set before traversal
  /H  true|false (false)   print this help and exit
  /n  true|false (false)   add a detail line per match, carrying the line number
  /L  true|false (false)   add a detail line per match, carrying the line text

A matching file prints its path on one line; /n and /L add indented detail
lines beneath it. A path is never printed twice. A search ends with a line
counting the files and directories it reached.

Switch introducers / and - are equivalent. Switch letters are case-sensitive,
so /h and /H differ. Every switch takes exactly one argument; there are no bare
flags. Arguments containing whitespace or commas must be quoted.

Run with no switches at all to list the resolved options and exit without
searching.
)HELP";
}

// §8: the form Spec_TextFinder.md §5.3 fixes. This function chooses none of it.
std::string optionsText(const ProgramCommands& commands) {
    const auto boolText = [](bool value) { return value ? "true" : "false"; };

    std::string text;
    for (const std::string& path : commands.rootPaths) text += "/P " + path + "\n";

    text += "/p";
    for (std::size_t i = 0; i < commands.extensions.size(); ++i) {
        text += (i == 0) ? " " : ", ";
        text += commands.extensions[i];
    }
    text += "\n";

    text += "/r " + commands.regexText + "\n";
    text += std::string{"/s "} + boolText(commands.recurse) + "\n";
    text += std::string{"/h "} + boolText(commands.suppressOnNoMatch) + "\n";
    text += std::string{"/v "} + boolText(commands.verbose) + "\n";
    text += std::string{"/H "} + boolText(commands.help) + "\n";
    text += std::string{"/n "} + boolText(commands.lineNumbers) + "\n";
    text += std::string{"/L "} + boolText(commands.matchedLine) + "\n";
    return text;
}

// §5: scans left to right, alternating switch token and argument token, stopping at the
// first violation with no partial result. Touches no filesystem.
std::expected<ProgramCommands, std::string> parse(int argc, char* argv[]) {
    ProgramCommands commands;
    bool sawRootPath = false;

    for (int i = 1; i < argc; ++i) {
        const std::string token = argv[i];

        if (token.empty() || (token.front() != '/' && token.front() != '-'))
            return std::unexpected(diagnostic("not a switch: " + token));
        if (token.size() != 2 || switchLetters.find(token[1]) == std::string_view::npos)
            return std::unexpected(diagnostic("unrecognized switch: " + token));
        if (i + 1 >= argc)
            return std::unexpected(diagnostic("missing argument for switch: " + token));

        const std::string argument = argv[++i];

        const auto asBool = [&](bool& field) -> std::optional<std::string> {
            const std::optional<bool> value = toBool(argument);
            if (!value) return diagnostic("invalid boolean for " + token + ": " + argument);
            field = *value;
            return std::nullopt;
        };

        std::optional<std::string> failure;
        switch (token[1]) {
        case 'P':
            if (argument.empty()) {
                failure = diagnostic("empty root path for switch: " + token);
                break;
            }
            // §5 rule 4: the first /P clears the default, later ones append in argv order.
            if (!sawRootPath) {
                commands.rootPaths.clear();
                sawRootPath = true;
            }
            commands.rootPaths.push_back(argument);
            break;
        case 'p':
            commands.extensions = normalizeExtensions(argument);
            break;
        case 'r':
            if (argument.empty()) {
                failure = diagnostic("empty expression for switch: " + token);
                break;
            }
            commands.regexText = argument;   // verbatim; Cpp_TextFinder_Dirnav compiles it
            break;
        case 's': failure = asBool(commands.recurse); break;
        case 'h': failure = asBool(commands.suppressOnNoMatch); break;
        case 'v': failure = asBool(commands.verbose); break;
        case 'H': failure = asBool(commands.help); break;
        case 'n': failure = asBool(commands.lineNumbers); break;
        case 'L': failure = asBool(commands.matchedLine); break;
        }

        if (failure) return std::unexpected(*failure);
    }

    return commands;
}
