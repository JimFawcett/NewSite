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
            if (string.IsNullOrEmpty(raw)) return [];
            return raw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
    }

    public string HelpText => """
        CsTextFinder — search a directory tree for files whose content matches a regex

        Usage:
          CsTextFinder [/P <path>] [/p <exts>] [/s <bool>] [/H <bool>]
                       [/r <regex>] [/v] [/h]

        Options:
          /P <path>    Root path for the search              (default: ".")
          /p <exts>    Comma-separated file extensions,
                       e.g. "cs,txt"                         (default: all files)
          /s <bool>    Recurse into subdirectories           (default: true)
          /H <bool>    true  = print directory only when it
                       contains a match (clean output).
                       false = print every directory entered  (default: true)
          /r <regex>   Regular expression matched against
                       file content                          (default: ".")
          /v           Verbose: echo all options before searching
          /h           Print this help text and exit
        """;

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
        _options.TryAdd("P", ".");
        _options.TryAdd("r", ".");
        _options.TryAdd("s", "true");
        _options.TryAdd("H", "true");
    }

    private string Get(string key) =>
        _options.GetValueOrDefault(key, string.Empty)!;
}
