class CmdLine:
    def __init__(self, args: list[str]) -> None:
        self._options: dict[str, str] = {}
        self._parse(args)
        self._apply_defaults()

    @property
    def path(self) -> str:
        return self._get("P")

    @property
    def regex(self) -> str:
        return self._get("r")

    @property
    def patterns(self) -> list[str]:
        raw = self._get("p")
        if not raw:
            return []
        return [p for p in (s.strip() for s in raw.split(",")) if p]

    @property
    def recurse(self) -> bool:
        return self._get("s") == "true"

    @property
    def hide(self) -> bool:
        return self._get("H") == "true"

    @property
    def verbose(self) -> bool:
        return "v" in self._options

    @property
    def help(self) -> bool:
        return "h" in self._options

    @property
    def help_text(self) -> str:
        return (
            "PyTextFinder — search a directory tree for files whose content matches a regex\n"
            "\n"
            "Usage:\n"
            "  python EntryPoint/main.py [/P <path>] [/p <exts>] [/s <bool>] [/H <bool>]\n"
            "                            [/r <regex>] [/v] [/h]\n"
            "\n"
            "Options:\n"
            "  /P <path>    Root path for the search              (default: \".\")\n"
            "  /p <exts>    Comma-separated file extensions,\n"
            "               e.g. \"py,txt\"                         (default: all files)\n"
            "  /s <bool>    Recurse into subdirectories           (default: true)\n"
            "  /H <bool>    true  = print directory only when it\n"
            "               contains a match (clean output).\n"
            "               false = print every directory entered  (default: true)\n"
            "  /r <regex>   Regular expression matched against\n"
            "               file content                          (default: \".\")\n"
            "  /v           Verbose: echo all options before searching\n"
            "  /h           Print this help text and exit\n"
            "\n"
            "Git Bash note: use - prefix instead of / to avoid path expansion,\n"
            "  e.g. -P . -p py -r \"def \"\n"
        )

    @staticmethod
    def _is_flag(token: str) -> bool:
        return len(token) == 2 and token[0] in ("/" , "-") and token[1].isalpha()

    def _parse(self, args: list[str]) -> None:
        i = 0
        while i < len(args):
            token = args[i]
            if self._is_flag(token):
                key = token[1]
                if i + 1 < len(args) and not self._is_flag(args[i + 1]):
                    self._options[key] = args[i + 1]
                    i += 2
                else:
                    self._options[key] = "true"
                    i += 1
            else:
                i += 1

    def _apply_defaults(self) -> None:
        self._options.setdefault("P", ".")
        self._options.setdefault("r", ".")
        self._options.setdefault("s", "true")
        self._options.setdefault("H", "true")

    def _get(self, key: str) -> str:
        return self._options.get(key, "")
