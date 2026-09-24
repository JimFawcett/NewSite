# command_line.py - parses argv into ProgramCommands and renders help, usage, and option listing

from dataclasses import dataclass

from .program_commands import ProgramCommands


@dataclass(frozen=True)
class ParseFailure:
    diagnostic: str

_INTRODUCERS = "/-"
_SWITCH_LETTERS = "PprshvHnL"
_TRIM_CHARS = " \t\n\v\f\r"

_BOOL_ATTRIBUTES = {
    "s": "recurse",
    "h": "suppress_on_no_match",
    "v": "verbose",
    "H": "help",
    "n": "line_numbers",
    "L": "matched_line",
}

_SYNOPSIS = (
    'usage: Python_TextFinder [/P path] [/p "ext, ext"] [/r regex] [/s bool]'
    " [/h bool] [/v bool] [/H bool] [/n bool] [/L bool]"
)

_HELP_BODY = [
    "",
    "  /P  path (.)             root path for traversal; repeat to add more root paths",
    '  /p  "ext, ext" ()        comma-separated bare extensions to search; empty searches every file',
    "  /r  regex (.)            regular expression evaluated against each line",
    "  /s  true|false (true)    recurse into subdirectories",
    "  /h  true|false (true)    hide files that matched nothing; errors always appear",
    "  /v  true|false (false)   list the resolved option set before traversal",
    "  /H  true|false (false)   print this help and exit",
    "  /n  true|false (false)   add a detail line per match, carrying the line number",
    "  /L  true|false (false)   add a detail line per match, carrying the line text",
    "",
    "A matching file prints its path on one line; /n and /L add indented detail",
    "lines beneath it. A path is never printed twice. A search ends with a line",
    "counting the files and directories it reached.",
    "",
    "Switch introducers / and - are equivalent. Switch letters are case-sensitive,",
    "so /h and /H differ. Every switch takes exactly one argument; there are no bare",
    "flags. Arguments containing whitespace or commas must be quoted.",
    "",
    "Run with no switches at all to list the resolved options and exit without",
    "searching.",
]


def usage_line() -> str:
    return _SYNOPSIS + "\n"


def help_text() -> str:
    return usage_line() + "\n".join(_HELP_BODY) + "\n"


def options_text(commands: ProgramCommands) -> str:
    lines = [f"/P {root}" for root in commands.root_paths]
    if commands.extensions:
        lines.append("/p " + ", ".join(commands.extensions))
    else:
        lines.append("/p")
    lines.append(f"/r {commands.regex_text}")
    lines.append(f"/s {_bool_text(commands.recurse)}")
    lines.append(f"/h {_bool_text(commands.suppress_on_no_match)}")
    lines.append(f"/v {_bool_text(commands.verbose)}")
    lines.append(f"/H {_bool_text(commands.help)}")
    lines.append(f"/n {_bool_text(commands.line_numbers)}")
    lines.append(f"/L {_bool_text(commands.matched_line)}")
    return "\n".join(lines) + "\n"


def parse(argv: list[str]) -> ProgramCommands | ParseFailure:
    commands = ProgramCommands()
    root_seen = False
    index = 1
    while index < len(argv):
        token = argv[index]
        if not token or token[0] not in _INTRODUCERS:
            return _failure(f"not a switch: {token}")
        if len(token) != 2 or token[1] not in _SWITCH_LETTERS:
            return _failure(f"unrecognized switch: {token}")
        if index + 1 == len(argv):
            return _failure(f"missing argument for switch: {token}")

        letter = token[1]
        value = argv[index + 1]
        index += 2

        if letter in _BOOL_ATTRIBUTES:
            lowered = value.lower()
            if lowered != "true" and lowered != "false":
                return _failure(f"invalid boolean for {token}: {value}")
            setattr(commands, _BOOL_ATTRIBUTES[letter], lowered == "true")
        elif letter == "P":
            if not value:
                return _failure(f"empty root path for switch: {token}")
            if not root_seen:
                commands.root_paths = []
                root_seen = True
            commands.root_paths.append(value)
        elif letter == "r":
            if not value:
                return _failure(f"empty expression for switch: {token}")
            commands.regex_text = value
        else:
            commands.extensions = _normalize_extensions(value)

    return commands


def _normalize_extensions(token: str) -> list[str]:
    extensions = []
    for item in token.split(","):
        trimmed = item.strip(_TRIM_CHARS).removeprefix(".").strip(_TRIM_CHARS)
        if trimmed:
            extensions.append(trimmed)
    return extensions


def _bool_text(value: bool) -> str:
    return "true" if value else "false"


def _failure(reason: str) -> ParseFailure:
    return ParseFailure(reason + "\n" + usage_line())
