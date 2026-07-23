namespace CommandLine;

public static class Tests
{
    public static int RunAll()
    {
        int pass = 0, fail = 0;
        void Check(string name, Func<bool> test)
        {
            if (Run(name, test)) pass++; else fail++;
        }

        Check("DefaultPath",        () => new CmdLine([]).Path    == ".");
        Check("DefaultRegex",       () => new CmdLine([]).Regex   == ".");
        Check("DefaultRecurse",     () => new CmdLine([]).Recurse);
        Check("DefaultHide",        () => new CmdLine([]).Hide);
        Check("DefaultVerbose",     () => !new CmdLine([]).Verbose);
        Check("DefaultHelp",        () => !new CmdLine([]).Help);
        Check("DefaultPatterns",    () => new CmdLine([]).Patterns.Count == 0);
        Check("SetPath",            () => new CmdLine(["-P", "/tmp"]).Path == "/tmp");
        Check("SetRegex",           () => new CmdLine(["-r", "foo"]).Regex == "foo");
        Check("SetRecurseFalse",    () => !new CmdLine(["-s", "false"]).Recurse);
        Check("SetHideFalse",       () => !new CmdLine(["-H", "false"]).Hide);
        Check("VerboseFlag",        () => new CmdLine(["-v"]).Verbose);
        Check("HelpFlag",           () => new CmdLine(["-h"]).Help);
        Check("PatternsFlag",       () =>
        {
            var cl = new CmdLine(["-p", "cs,txt"]);
            return cl.Patterns.Count == 2 && cl.Patterns[0] == "cs" && cl.Patterns[1] == "txt";
        });
        Check("ImplicitTrue",       () => new CmdLine(["-v", "-h"]).Verbose);
        Check("SlashPrefix",        () => new CmdLine(["/h"]).Help);
        Check("HelpTextNotEmpty",   () => new CmdLine([]).HelpText.Length > 0);
        Check("UnknownTokenIgnored",() => new CmdLine(["unknown"]).Path == ".");
        Print(pass, fail);
        return fail;
    }

    private static bool Run(string name, Func<bool> test)
    {
        bool ok = false;
        try   { ok = test(); }
        catch (Exception ex) { Console.WriteLine($"    exception: {ex.Message}"); }
        Console.WriteLine($"  {(ok ? "PASS" : "FAIL")}  {name}");
        return ok;
    }

    private static void Print(int pass, int fail) =>
        Console.WriteLine($"  {pass} passed, {fail} failed");
}
