namespace CommandLine;

public static class Tests
{
    public static int RunAll()
    {
        int pass = 0, fail = 0;
        Run(ref pass, ref fail, "DefaultPath",       () => new CmdLine([]).Path    == ".");
        Run(ref pass, ref fail, "DefaultRegex",      () => new CmdLine([]).Regex   == ".");
        Run(ref pass, ref fail, "DefaultRecurse",    () => new CmdLine([]).Recurse == true);
        Run(ref pass, ref fail, "DefaultHide",       () => new CmdLine([]).Hide    == true);
        Run(ref pass, ref fail, "DefaultVerbose",    () => new CmdLine([]).Verbose == false);
        Run(ref pass, ref fail, "DefaultHelp",       () => new CmdLine([]).Help    == false);
        Run(ref pass, ref fail, "DefaultPatterns",   () => new CmdLine([]).Patterns.Count == 0);
        Run(ref pass, ref fail, "SetPath",           () => new CmdLine(["-P", "/tmp"]).Path == "/tmp");
        Run(ref pass, ref fail, "SetRegex",          () => new CmdLine(["-r", "foo"]).Regex == "foo");
        Run(ref pass, ref fail, "SetRecurseFalse",   () => new CmdLine(["-s", "false"]).Recurse == false);
        Run(ref pass, ref fail, "SetHideFalse",      () => new CmdLine(["-H", "false"]).Hide == false);
        Run(ref pass, ref fail, "VerboseFlag",       () => new CmdLine(["-v"]).Verbose == true);
        Run(ref pass, ref fail, "HelpFlag",          () => new CmdLine(["-h"]).Help == true);
        Run(ref pass, ref fail, "PatternsFlag",      () =>
        {
            var cl = new CmdLine(["-p", "cs,txt"]);
            return cl.Patterns.Count == 2 && cl.Patterns[0] == "cs" && cl.Patterns[1] == "txt";
        });
        Run(ref pass, ref fail, "ImplicitTrue",      () => new CmdLine(["-v", "-h"]).Verbose == true);
        Run(ref pass, ref fail, "SlashPrefix",       () => new CmdLine(["/h"]).Help == true);
        Run(ref pass, ref fail, "HelpTextNotEmpty",  () => new CmdLine([]).HelpText.Length > 0);
        Run(ref pass, ref fail, "UnknownTokenIgnored", () => new CmdLine(["unknown"]).Path == ".");
        Print(pass, fail);
        return fail;
    }

    private static void Run(ref int pass, ref int fail, string name, Func<bool> test)
    {
        bool ok = false;
        try   { ok = test(); }
        catch (Exception ex) { Console.WriteLine($"    exception: {ex.Message}"); }
        Console.WriteLine($"  {(ok ? "PASS" : "FAIL")}  {name}");
        if (ok) pass++; else fail++;
    }

    private static void Print(int pass, int fail) =>
        Console.WriteLine($"  {pass} passed, {fail} failed");
}
