// CommandLine.cs - converts an argument array into ProgramCommands per Spec_CSharp_TextFinder_Cmdline.md

using System.Diagnostics.CodeAnalysis;
using System.Text;

namespace CSharp_TextFinder_Cmdline;

// §4: a static class, because C# has no free functions and all four members render or
// read the one option set.
public static class CommandLine
{
    private const string Executable = "CSharp_TextFinder";

    // §5 rule 1: the nine letters of Spec_TextFinder.md §5, in that table's order.
    private const string SwitchLetters = "PprshvHnL";

    // §7: the six characters Spec_TextFinder.md §5 names, and no others:
    // space, horizontal tab, line feed, vertical tab, form feed, carriage return.
    // Written as code points, since §5 names them that way and three of the six
    // have no readable literal form.
    private static readonly char[] Trimmed =
        { (char)0x20, (char)0x09, (char)0x0A, (char)0x0B, (char)0x0C, (char)0x0D };

    // §8: the text of Spec_TextFinder.md §5.1 below its usage line, one element per line.
    // Held as an array rather than a raw string literal so that the terminator is this
    // library's decision and not a property of how this file happens to be stored.
    private static readonly string[] HelpBody =
    {
        "",
        "  /P  path (.)             root path for traversal; repeat to add more root paths",
        "  /p  \"ext, ext\" ()        comma-separated bare extensions to search; empty searches every file",
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
    };

    public static string UsageLine() =>
        $"usage: {Executable} [/P path] [/p \"ext, ext\"] [/r regex] [/s bool] [/h bool] " +
        "[/v bool] [/H bool] [/n bool] [/L bool]\n";

    // §8: built from UsageLine, so the synopsis has one definition.
    public static string HelpText() => UsageLine() + string.Join("\n", HelpBody) + "\n";

    // §8: the form Spec_TextFinder.md §5.3 fixes. This method chooses none of it.
    public static string OptionsText(ProgramCommands commands)
    {
        var text = new StringBuilder();

        foreach (string root in commands.RootPaths)
        {
            text.Append("/P ").Append(root).Append('\n');
        }

        if (commands.Extensions.Count == 0)
        {
            text.Append("/p\n");
        }
        else
        {
            text.Append("/p ").Append(string.Join(", ", commands.Extensions)).Append('\n');
        }

        text.Append("/r ").Append(commands.RegexText).Append('\n');

        // §8: bool.ToString returns "True" and "False", which §5.3 forbids.
        foreach ((string letter, bool value) in new[]
                 {
                     ("/s", commands.Recurse),
                     ("/h", commands.SuppressOnNoMatch),
                     ("/v", commands.Verbose),
                     ("/H", commands.Help),
                     ("/n", commands.LineNumbers),
                     ("/L", commands.MatchedLine),
                 })
        {
            text.Append(letter).Append(' ').Append(value ? "true" : "false").Append('\n');
        }

        return text.ToString();
    }

    // §5: scans args from index 0, alternating switch token and argument token, stopping
    // at the first violation with no partial result. Index 0 and not 1: Main's array holds
    // the arguments alone, with no program name to skip.
    public static bool TryParse(
        string[] args,
        [NotNullWhen(true)] out ProgramCommands? commands,
        [NotNullWhen(false)] out string? diagnostic)
    {
        var parsed = new ProgramCommands();
        bool rootsSupplied = false;

        for (int index = 0; index < args.Length; ++index)
        {
            string token = args[index];

            if (!SwitchLetter(token, out char letter))
            {
                commands = null;
                diagnostic = Diagnostic(token.Length > 0 && (token[0] == '/' || token[0] == '-')
                    ? $"unrecognized switch: {token}"
                    : $"not a switch: {token}");
                return false;
            }

            if (index + 1 >= args.Length)
            {
                commands = null;
                diagnostic = Diagnostic($"missing argument for switch: {token}");
                return false;
            }

            string value = args[++index];

            switch (letter)
            {
                case 'P':
                    if (value.Length == 0)
                    {
                        commands = null;
                        diagnostic = Diagnostic($"empty root path for switch: {token}");
                        return false;
                    }

                    if (!rootsSupplied)
                    {
                        // §5 rule 4: a local flag, since -P . cannot be told from the default by value.
                        parsed.RootPaths.Clear();
                        rootsSupplied = true;
                    }

                    parsed.RootPaths.Add(value);
                    break;

                case 'p':
                    parsed.Extensions = NormalizeExtensions(value);
                    break;

                case 'r':
                    if (value.Length == 0)
                    {
                        commands = null;
                        diagnostic = Diagnostic($"empty expression for switch: {token}");
                        return false;
                    }

                    parsed.RegexText = value;
                    break;

                default:
                    if (!Boolean(value, out bool flag))
                    {
                        commands = null;
                        diagnostic = Diagnostic($"invalid boolean for {token}: {value}");
                        return false;
                    }

                    switch (letter)
                    {
                        case 's': parsed.Recurse = flag; break;
                        case 'h': parsed.SuppressOnNoMatch = flag; break;
                        case 'v': parsed.Verbose = flag; break;
                        case 'H': parsed.Help = flag; break;
                        case 'n': parsed.LineNumbers = flag; break;
                        default: parsed.MatchedLine = flag; break;
                    }

                    break;
            }
        }

        commands = parsed;
        diagnostic = null;
        return true;
    }

    // §5 rule 1: exactly two characters, an introducer then one of the nine letters.
    private static bool SwitchLetter(string token, out char letter)
    {
        letter = '\0';
        if (token.Length != 2) return false;
        if (token[0] != '/' && token[0] != '-') return false;
        if (!SwitchLetters.Contains(token[1], StringComparison.Ordinal)) return false;
        letter = token[1];
        return true;
    }

    // §5 rule 3: true or false only. bool.TryParse trims and accepts more, so it is not used.
    private static bool Boolean(string value, out bool flag)
    {
        if (string.Equals(value, "true", StringComparison.OrdinalIgnoreCase))
        {
            flag = true;
            return true;
        }

        if (string.Equals(value, "false", StringComparison.OrdinalIgnoreCase))
        {
            flag = false;
            return true;
        }

        flag = false;
        return false;
    }

    // §6: a reason line, a newline, then the usage line.
    private static string Diagnostic(string reason) => reason + "\n" + UsageLine();

    // §7: split on commas, trim the six named characters, strip one leading dot,
    // discard empties, keep order and duplicates.
    private static List<string> NormalizeExtensions(string argument)
    {
        var items = new List<string>();

        foreach (string part in argument.Split(','))
        {
            string item = part.Trim(Trimmed);

            // §7: TrimStart('.') would strip every leading dot, where §5 strips one.
            if (item.Length > 0 && item[0] == '.') item = item[1..];

            if (item.Length > 0) items.Add(item);
        }

        return items;
    }
}
