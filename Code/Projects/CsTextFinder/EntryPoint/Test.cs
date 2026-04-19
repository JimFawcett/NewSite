public static class IntegrationTests
{
    public static int RunAll()
    {
        int pass = 0, fail = 0;
        Run(ref pass, ref fail, "FindMatchingFiles",       TestFindMatchingFiles);
        Run(ref pass, ref fail, "PatternFiltersExtensions", TestPatternFiltering);
        Run(ref pass, ref fail, "NoMatchYieldsZero",       TestNoMatchYieldsZero);
        Run(ref pass, ref fail, "NoRecurseStaysShallow",   TestNoRecurseStaysShallow);
        Run(ref pass, ref fail, "DefaultSkipsApplied",     TestDefaultSkipsApplied);
        Run(ref pass, ref fail, "MultipleMatchesAccumulate", TestMultipleMatchesAccumulate);
        Print(pass, fail);
        return fail;
    }

    private static bool TestFindMatchingFiles()
    {
        string root = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(root, "a.cs"), "needle");
            File.WriteAllText(Path.Combine(root, "b.cs"), "haystack");
            var (visited, matched) = Run(root, "needle");
            return visited == 2 && matched == 1;
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestPatternFiltering()
    {
        string root = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(root, "code.cs"),  "needle");
            File.WriteAllText(Path.Combine(root, "notes.md"), "needle");
            var (visited, matched) = Run(root, "needle", pattern: "cs");
            return visited == 1 && matched == 1;
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestNoMatchYieldsZero()
    {
        string root = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(root, "a.txt"), "nothing here");
            var (_, matched) = Run(root, "zzz_nomatch_zzz");
            return matched == 0;
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestNoRecurseStaysShallow()
    {
        string root = TempDir();
        try
        {
            string sub = Directory.CreateDirectory(Path.Combine(root, "sub")).FullName;
            File.WriteAllText(Path.Combine(root, "top.cs"),  "needle");
            File.WriteAllText(Path.Combine(sub,  "deep.cs"), "needle");
            var (visited, matched) = Run(root, "needle", recurse: false);
            return visited == 1 && matched == 1;
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestDefaultSkipsApplied()
    {
        string root = TempDir();
        try
        {
            string bin = Directory.CreateDirectory(Path.Combine(root, "bin")).FullName;
            File.WriteAllText(Path.Combine(bin,  "hidden.cs"),  "needle");
            File.WriteAllText(Path.Combine(root, "visible.cs"), "needle");
            var (visited, matched) = Run(root, "needle");
            return visited == 1 && matched == 1;
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestMultipleMatchesAccumulate()
    {
        string root = TempDir();
        try
        {
            for (int i = 0; i < 4; i++)
                File.WriteAllText(Path.Combine(root, $"f{i}.txt"), "needle");
            var (visited, matched) = Run(root, "needle");
            return visited == 4 && matched == 4;
        }
        finally { Directory.Delete(root, true); }
    }

    private static (int visited, int matched) Run(
        string root, string regex, string? pattern = null, bool recurse = true)
    {
        var output = new Output.Output(hide: true);
        output.SetRegex(regex);
        var dn = new DirNav.DirNav(recurse)
        {
            DirHandler  = dir  => output.OnDir(dir),
            FileHandler = file => output.OnFile(file)
        };
        if (pattern is not null) dn.AddPattern(pattern);

        var saved = Console.Out;
        Console.SetOut(TextWriter.Null);
        try   { dn.Visit(root); }
        finally { Console.SetOut(saved); }

        return (dn.FileCount, output.MatchCount);
    }

    private static string TempDir()
    {
        string dir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
        Directory.CreateDirectory(dir);
        return dir;
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
