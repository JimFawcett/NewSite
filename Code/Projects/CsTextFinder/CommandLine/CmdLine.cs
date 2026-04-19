namespace CommandLine;

public class CmdLine
{
    private readonly Dictionary<string, string> _options = new();

    public CmdLine(string[] args)
    {
        Parse(args);
        ApplyDefaults();
    }

    public string Path    => Get("P");
    public string Regex   => Get("r");
    public bool   Recurse => Get("s") == "true";
    public bool   Hide    => Get("H") == "true";
    public bool   Verbose => _options.ContainsKey("v");
    public bool   Help    => _options.ContainsKey("h");

    public IReadOnlyList<string> Patterns
    {
        get
        {
            string raw = Get("p");
            if (string.IsNullOrEmpty(raw)) return Array.Empty<string>();
            return raw.Split(',', StringSplitOptions.RemoveEmptyEntries);
        }
    }

    public string HelpText =>
        "CsTextFinder — search a directory tree for files whose content matches a regex\n" +
        "\n" +
        "Usage:\n" +
        "  CsTextFinder [/P <path>] [/p <exts>] [/s <bool>] [/H <bool>]\n" +
        "               [/r <regex>] [/v] [/h]\n" +
        "\n" +
        "Options:\n" +
        "  /P <path>    Root path for the search              (default: \".\")\n" +
        "  /p <exts>    Comma-separated file extensions,\n" +
        "               e.g. \"cs,txt\"                         (default: all files)\n" +
        "  /s <bool>    Recurse into subdirectories           (default: true)\n" +
        "  /H <bool>    true  = print directory only when it\n" +
        "               contains a match (clean output).\n" +
        "               false = print every directory entered  (default: true)\n" +
        "  /r <regex>   Regular expression matched against\n" +
        "               file content                          (default: \".\")\n" +
        "  /v           Verbose: echo all options before searching\n" +
        "  /h           Print this help text and exit\n";

    private void Parse(string[] args)
    {
        int i = 0;
        while (i < args.Length)
        {
            string token = args[i];
            if (IsFlag(token))
            {
                string key = token[1..];
                if (i + 1 < args.Length && !IsFlag(args[i + 1]))
                {
                    _options[key] = args[i + 1];
                    i += 2;
                }
                else
                {
                    _options[key] = "true";
                    i++;
                }
            }
            else
            {
                i++;
            }
        }
    }

    private static bool IsFlag(string token) =>
        token.Length == 2 && (token[0] == '/' || token[0] == '-') && char.IsLetter(token[1]);

    private void ApplyDefaults()
    {
        if (!_options.ContainsKey("P")) _options["P"] = ".";
        if (!_options.ContainsKey("r")) _options["r"] = ".";
        if (!_options.ContainsKey("s")) _options["s"] = "true";
        if (!_options.ContainsKey("H")) _options["H"] = "true";
    }

    private string Get(string key) =>
        _options.TryGetValue(key, out string? v) ? v : string.Empty;
}
