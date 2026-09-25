// UnitTests.cs - unit suite for CSharp_TextFinder_Cmdline, exercising Spec_CSharp_TextFinder_Cmdline.md
//
// Spec_TextFinder.md §6 admits no third-party package, so the harness is the Check class
// below. It is duplicated in each component's suite rather than shared, so that a
// component can be read, built, and tested alone.

using CSharp_TextFinder_Cmdline;

namespace CSharp_TextFinder_Cmdline_UnitTest;

internal sealed class Check
{
    private int _failures;
    private int _total;

    public void That(bool ok, string name) => Record(ok, name);

    public void Equal(string actual, string expected, string name)
    {
        bool ok = actual == expected;
        Record(ok, name);
        if (ok) return;
        Console.WriteLine("          expected: [" + Visible(expected) + "]");
        Console.WriteLine("          actual:   [" + Visible(actual) + "]");
    }

    private void Record(bool ok, string name)
    {
        ++_total;
        if (!ok) ++_failures;
        Console.WriteLine((ok ? "  PASS  " : "  FAIL  ") + name);
    }

    public int Report()
    {
        Console.WriteLine($"  {_total - _failures} of {_total} passed");
        Console.WriteLine(_failures == 0 ? "PASS" : "FAIL");
        return _failures;
    }

    // The CRLF failures of a first run look identical to their expected text without this.
    private static string Visible(string text) =>
        text.Replace("\r", "\\r").Replace("\n", "\\n");
}

internal static class UnitTests
{
    private static ProgramCommands Parsed(params string[] args)
    {
        if (!CommandLine.TryParse(args, out ProgramCommands? commands, out string? diagnostic))
        {
            throw new InvalidOperationException("expected success, got: " + diagnostic);
        }

        return commands;
    }

    private static string Reason(params string[] args)
    {
        if (CommandLine.TryParse(args, out _, out string? diagnostic))
        {
            throw new InvalidOperationException("expected a diagnostic, parse succeeded");
        }

        return diagnostic.Split('\n')[0];
    }

    private static int Main()
    {
        var check = new Check();
        Console.WriteLine("CSharp_TextFinder_Cmdline unit tests");

        // --- defaults, §4 ---
        ProgramCommands defaults = Parsed();
        check.That(defaults.RootPaths.Count == 1 && defaults.RootPaths[0] == ".", "default /P is .");
        check.That(defaults.Extensions.Count == 0, "default /p is empty");
        check.Equal(defaults.RegexText, ".", "default /r is .");
        check.That(defaults.Recurse, "default /s is true");
        check.That(defaults.SuppressOnNoMatch, "default /h is true");
        check.That(!defaults.Verbose, "default /v is false");
        check.That(!defaults.Help, "default /H is false");
        check.That(!defaults.LineNumbers, "default /n is false");
        check.That(!defaults.MatchedLine, "default /L is false");
        check.That(new ProgramCommands().RegexText == defaults.RegexText,
            "a new ProgramCommands equals the result of parsing an empty array");

        // --- §5: the scan begins at index 0 ---
        check.Equal(Parsed("-r", "alpha").RegexText, "alpha", "the first element is a switch, not a program name");
        check.Equal(Reason("CSharp_TextFinder", "-r", "alpha"), "not a switch: CSharp_TextFinder",
            "a program name in args[0] is refused, since Main's array carries none");

        // --- §5 rules 1 through 3 ---
        check.That(Parsed("-s", "false").Recurse == false && Parsed("/s", "false").Recurse == false,
            "introducers / and - are equivalent");
        check.That(Parsed("-s", "FALSE").Recurse == false && Parsed("-s", "True").Recurse,
            "boolean values fold case");
        check.That(Parsed("-h", "false").SuppressOnNoMatch == false && !Parsed("-H", "false").Help,
            "/h and /H are distinct switches");
        check.Equal(Parsed("-r", "one", "-r", "two").RegexText, "two", "last occurrence wins for /r");
        check.Equal(Parsed("-r", "-n").RegexText, "-n",
            "an argument beginning with an introducer is taken verbatim");

        // --- §5 rule 4 ---
        ProgramCommands roots = Parsed("-P", "one", "-P", "two");
        check.That(roots.RootPaths.Count == 2 && roots.RootPaths[0] == "one" && roots.RootPaths[1] == "two",
            "/P accumulates in the order given");
        ProgramCommands dot = Parsed("-P", ".");
        check.That(dot.RootPaths.Count == 1, "the first /P replaces the default even when equal to it");

        // --- §7: normalization ---
        check.Equal(string.Join("|", Parsed("-p", " .cs , , txt ").Extensions), "cs|txt",
            "items are split, trimmed, and stripped of one dot, and empties discarded");
        check.Equal(string.Join("|", Parsed("-p", "..cs").Extensions), ".cs",
            "only one leading dot is stripped");
        check.Equal(string.Join("|", Parsed("-p", ". cs, .\ttxt ").Extensions), "cs|txt",
            "an item is trimmed again after its dot is stripped");
        check.That(CommandLine.OptionsText(Parsed("-p", ". cs")).Contains("\n/p cs\n"),
            "the second trim keeps stray whitespace out of the §5.3 listing line");
        check.Equal(string.Join("|", Parsed("-p", ".cs, cs").Extensions), "cs|cs",
            "duplicates are retained");
        check.That(Parsed("-p", " , , ").Extensions.Count == 0, "an all-separator list is empty");
        check.Equal(string.Join("|", Parsed("-p", "CS").Extensions), "CS",
            "extension case is not folded by the parser");
        check.Equal(
            string.Join("|", Parsed("-p", "a" + (char)0x0B + ",\tb\n,\rc ,d" + (char)0x0C).Extensions),
            "a|b|c|d",
            "the six characters §5 names are trimmed");
        check.Equal(string.Join("|", Parsed("-p", "\u00a0cs").Extensions), "\u00a0cs",
            "no-break space is not trimmed, since §5 does not name it");

        // --- §6: the six reason lines ---
        check.Equal(Reason("P", "."), "not a switch: P", "not a switch");
        check.Equal(Reason("/x", "1"), "unrecognized switch: /x", "unrecognized switch");
        check.Equal(Reason("/ss", "1"), "unrecognized switch: /ss", "an over-long token is unrecognized");
        check.Equal(Reason("/", "1"), "unrecognized switch: /", "a bare introducer is unrecognized");
        check.Equal(Reason("/P"), "missing argument for switch: /P", "missing argument");
        check.Equal(Reason("-s", "yes"), "invalid boolean for -s: yes", "invalid boolean");
        check.Equal(Reason("/P", ""), "empty root path for switch: /P", "empty root path");
        check.Equal(Reason("/r", ""), "empty expression for switch: /r", "empty expression");
        check.Equal(Reason("-s", "yes", "/x", "1"), "invalid boolean for -s: yes",
            "parsing stops at the first violation");

        CommandLine.TryParse(new[] { "/P" }, out _, out string? diagnostic);
        check.That(diagnostic!.EndsWith(CommandLine.UsageLine(), StringComparison.Ordinal),
            "every diagnostic ends with the usage line");
        check.That(!diagnostic.Contains('\r'), "a diagnostic carries LF and no CR");

        // --- §8: help text ---
        string help = CommandLine.HelpText();
        check.That(help.StartsWith(CommandLine.UsageLine(), StringComparison.Ordinal),
            "the help text begins with the usage line");
        check.That(help.Contains("usage: CSharp_TextFinder [", StringComparison.Ordinal),
            "the usage line names the executable");
        check.That(help.EndsWith("searching.\n", StringComparison.Ordinal), "the help text ends with a newline");
        check.That(!help.Contains('\r'), "the help text carries LF and no CR");
        check.That(help.Split('\n').Length - 1 == 22, "the help text is the 22 lines §5.1 fixes");
        check.That(help.Contains("counting the files and directories it reached.", StringComparison.Ordinal),
            "help names the run summary of §3.6");
        foreach (string letter in new[] { "/P", "/p", "/r", "/s", "/h", "/v", "/H", "/n", "/L" })
        {
            check.That(help.Contains("  " + letter + "  ", StringComparison.Ordinal), "help lists " + letter);
        }

        check.That(CommandLine.UsageLine().Split('\n').Length - 1 == 1,
            "the usage line is one line");

        // --- §8: option listing ---
        check.Equal(CommandLine.OptionsText(new ProgramCommands()),
            "/P .\n/p\n/r .\n/s true\n/h true\n/v false\n/H false\n/n false\n/L false\n",
            "the listing of the defaults is the nine lines of §5.3, with /v false");
        check.Equal(CommandLine.OptionsText(Parsed("-v", "true")),
            "/P .\n/p\n/r .\n/s true\n/h true\n/v true\n/H false\n/n false\n/L false\n",
            "the listing of a bare -v true is the nine lines §5.3 gives");
        check.Equal(CommandLine.OptionsText(Parsed("-P", "one", "-P", "two", "-p", "cs, md")).Split('\n')[0],
            "/P one", "one /P line per root path, in traversal order");
        check.That(CommandLine.OptionsText(Parsed("-p", "cs, md")).Contains("/p cs, md", StringComparison.Ordinal),
            "the extension list is joined by comma and space");
        check.That(!CommandLine.OptionsText(new ProgramCommands()).Contains("True", StringComparison.Ordinal),
            "booleans render lower case, so bool.ToString is not used");
        string listing = CommandLine.OptionsText(Parsed("-r", "a b"));
        foreach (string line in listing.Split('\n'))
        {
            if (line.Length == 0) continue;
            check.That(line.Trim() == line, "no line of the listing ends in whitespace: [" + line + "]");
        }

        check.That(CommandLine.OptionsText(Parsed("-r", "a\\.b")).Contains("/r a\\.b", StringComparison.Ordinal),
            "/r renders the expression verbatim, backslash included");

        return check.Report();
    }
}
