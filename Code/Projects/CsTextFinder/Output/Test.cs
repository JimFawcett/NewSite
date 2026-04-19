namespace Output;

public static class Tests
{
    public static int RunAll()
    {
        int pass = 0, fail = 0;
        Run(ref pass, ref fail, "DefaultMatchCountZero",    TestDefaultMatchCountZero);
        Run(ref pass, ref fail, "MatchCountIncrements",     TestMatchCountIncrements);
        Run(ref pass, ref fail, "NoMatchNoCount",           TestNoMatchNoCount);
        Run(ref pass, ref fail, "RegexFiltersFiles",        TestRegexFiltersFiles);
        Run(ref pass, ref fail, "OnDirResetsAcrossDirs",    TestOnDirResetsAcrossDirs);
        Run(ref pass, ref fail, "UnreadableFileSkipped",    TestUnreadableFileSkipped);
        Run(ref pass, ref fail, "InvalidRegexFallsBack",    TestInvalidRegexFallsBack);
        Print(pass, fail);
        return fail;
    }

    private static bool TestDefaultMatchCountZero() =>
        new Output().MatchCount == 0;

    private static bool TestMatchCountIncrements()
    {
        string dir = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(dir, "f.txt"), "hello world");
            var out_ = new Output();
            out_.SetRegex("hello");
            return Quiet(() =>
            {
                out_.OnDir(dir.Replace('\\', '/'));
                out_.OnFile("f.txt");
                return out_.MatchCount == 1;
            });
        }
        finally { Directory.Delete(dir, true); }
    }

    private static bool TestNoMatchNoCount()
    {
        string dir = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(dir, "f.txt"), "hello world");
            var out_ = new Output();
            out_.SetRegex("zzz_nomatch_zzz");
            return Quiet(() =>
            {
                out_.OnDir(dir.Replace('\\', '/'));
                out_.OnFile("f.txt");
                return out_.MatchCount == 0;
            });
        }
        finally { Directory.Delete(dir, true); }
    }

    private static bool TestRegexFiltersFiles()
    {
        string dir = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(dir, "a.txt"), "apple");
            File.WriteAllText(Path.Combine(dir, "b.txt"), "banana");
            var out_ = new Output();
            out_.SetRegex("apple");
            return Quiet(() =>
            {
                out_.OnDir(dir.Replace('\\', '/'));
                out_.OnFile("a.txt");
                out_.OnFile("b.txt");
                return out_.MatchCount == 1;
            });
        }
        finally { Directory.Delete(dir, true); }
    }

    private static bool TestOnDirResetsAcrossDirs()
    {
        string dir1 = TempDir();
        string dir2 = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(dir1, "f1.txt"), "match");
            File.WriteAllText(Path.Combine(dir2, "f2.txt"), "match");
            var out_ = new Output();
            out_.SetRegex("match");
            return Quiet(() =>
            {
                out_.OnDir(dir1.Replace('\\', '/'));
                out_.OnFile("f1.txt");
                out_.OnDir(dir2.Replace('\\', '/'));
                out_.OnFile("f2.txt");
                return out_.MatchCount == 2;
            });
        }
        finally
        {
            Directory.Delete(dir1, true);
            Directory.Delete(dir2, true);
        }
    }

    private static bool TestUnreadableFileSkipped()
    {
        var out_ = new Output();
        out_.SetRegex(".");
        return Quiet(() =>
        {
            out_.OnDir("C:/");
            out_.OnFile("___nonexistent_xyz.txt");
            return out_.MatchCount == 0;
        });
    }

    private static bool TestInvalidRegexFallsBack()
    {
        string dir = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(dir, "f.txt"), "hello");
            var out_ = new Output();
            out_.SetRegex("[invalid");  // bad regex — should fall back to "."
            return Quiet(() =>
            {
                out_.OnDir(dir.Replace('\\', '/'));
                out_.OnFile("f.txt");
                // fallback "." matches everything non-empty
                return out_.MatchCount == 1;
            });
        }
        finally { Directory.Delete(dir, true); }
    }

    private static T Quiet<T>(Func<T> action)
    {
        var saved = Console.Out;
        Console.SetOut(TextWriter.Null);
        try   { return action(); }
        finally { Console.SetOut(saved); }
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
