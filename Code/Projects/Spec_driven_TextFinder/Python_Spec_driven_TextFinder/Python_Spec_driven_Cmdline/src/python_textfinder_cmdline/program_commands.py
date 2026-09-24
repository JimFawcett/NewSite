# program_commands.py - resolved option set, its field defaults the defaults of Spec_TextFinder.md §5

from dataclasses import dataclass, field


@dataclass
class ProgramCommands:
    root_paths: list[str] = field(default_factory=lambda: ["."])  # /P
    extensions: list[str] = field(default_factory=list)           # /p
    regex_text: str = "."                                         # /r
    recurse: bool = True                                          # /s
    suppress_on_no_match: bool = True                             # /h
    verbose: bool = False                                         # /v
    help: bool = False                                            # /H
    line_numbers: bool = False                                    # /n
    matched_line: bool = False                                    # /L
