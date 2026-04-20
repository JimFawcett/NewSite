namespace Output;

public static class Tests
{
    public static int RunAll()
    {
        int pass = 0, fail = 0;
        void Check(string name, Func<bool> test)
        {
            if (Run(name, test)) pass++; else fail++;
        }

        Check("DefaultMatchCountZero", TestDefaultMatchCountZero);
        Check("MatchCountIncrements",  TestMatchCountIncrements);
        Check("NoMatchNoCount",        TestNoMatchNoCount);
        Check("RegexFiltersFiles",     TestRegexFiltersFiles);
        Check("OnDirResetsAcrossDirs", TestOnDirResetsAcrossDirs);
        Check("UnreadableFileSkipped", TestUnreadableFileSkipped);
        Check("InvalidRegexFallsBack", TestInvalidRegexFallsBack);
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
            var sut = new Output();
            sut.SetRegex("hello");
            return Quiet(() =>
            {
                sut.OnDir(dir.Replace('\\', '/'));
                sut.OnFile("f.txt");
                return sut.MatchCount == 1;
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
            var sut = new Output();
            sut.SetRegex("zzz_nomatch_zzz");
            return Quiet(() =>
            {
                sut.OnDir(dir.Replace('\\', '/'));
                sut.OnFile("f.txt");
                return sut.MatchCount == 0;
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
            var sut = new Output();
            sut.SetRegex("apple");
            return Quiet(() =>
            {
                sut.OnDir(dir.Replace('\\', '/'));
                sut.OnFile("a.txt");
                sut.OnFile("b.txt");
                return sut.MatchCount == 1;
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
            var sut = new Output();
            sut.SetRegex("match");
            return Quiet(() =>
            {
                sut.OnDir(dir1.Replace('\\', '/'));
                sut.OnFile("f1.txt");
                sut.OnDir(dir2.Replace('\\', '/'));
                sut.OnFile("f2.txt");
                return sut.MatchCount == 2;
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
        var sut = new Output();
        sut.SetRegex(".");
        return Quiet(() =>
        {
            sut.OnDir("C:/");
            sut.OnFile("___nonexistent_xyz.txt");
            return sut.MatchCount == 0;
        });
    }

    private static bool TestInvalidRegexFallsBack()
    {
        string dir = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(dir, "f.txt"), "hello");
            var sut = new Output();
            sut.SetRegex("[invalid");  // bad regex — should fall back to "."
            return Quiet(() =>
            {
                sut.OnDir(dir.Replace('\\', '/'));
                sut.OnFile("f.txt");
                // fallback "." matches everything non-empty
                return sut.MatchCount == 1;
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
