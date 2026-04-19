namespace DirNav;

public static class Tests
{
    public static int RunAll()
    {
        int pass = 0, fail = 0;
        Run(ref pass, ref fail, "VisitNonExistent",      TestVisitNonExistent);
        Run(ref pass, ref fail, "VisitExistingDir",      TestVisitExistingDir);
        Run(ref pass, ref fail, "DirHandlerFires",       TestDirHandlerFires);
        Run(ref pass, ref fail, "FileHandlerFires",      TestFileHandlerFires);
        Run(ref pass, ref fail, "PatternFiltering",      TestPatternFiltering);
        Run(ref pass, ref fail, "DefaultSkipsBin",       TestDefaultSkipsBin);
        Run(ref pass, ref fail, "DefaultSkipsTarget",    TestDefaultSkipsTarget);
        Run(ref pass, ref fail, "DefaultSkipsPycache",   TestDefaultSkipsPycache);
        Run(ref pass, ref fail, "AddSkipWorks",          TestAddSkipWorks);
        Run(ref pass, ref fail, "NoRecurse",             TestNoRecurse);
        Run(ref pass, ref fail, "CountersAreReset",      TestCountersAreReset);
        Run(ref pass, ref fail, "FileCountCorrect",      TestFileCountCorrect);
        Print(pass, fail);
        return fail;
    }

    private static bool TestVisitNonExistent()
    {
        var dn = new DirNav();
        return !dn.Visit(Path.Combine(Path.GetTempPath(), "___nonexistent___xyz_999"));
    }

    private static bool TestVisitExistingDir()
    {
        string dir = TempDir();
        try   { return new DirNav().Visit(dir); }
        finally { Directory.Delete(dir, true); }
    }

    private static bool TestDirHandlerFires()
    {
        string root = TempDir();
        try
        {
            var dirs = new List<string>();
            var dn = new DirNav { DirHandler = d => dirs.Add(d) };
            dn.Visit(root);
            return dirs.Count == 1 && dirs[0] == root.Replace('\\', '/');
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestFileHandlerFires()
    {
        string root = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(root, "a.txt"), "a");
            File.WriteAllText(Path.Combine(root, "b.txt"), "b");
            var files = new List<string>();
            new DirNav { FileHandler = f => files.Add(f) }.Visit(root);
            return files.Count == 2;
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestPatternFiltering()
    {
        string root = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(root, "a.cs"),  "");
            File.WriteAllText(Path.Combine(root, "b.txt"), "");
            File.WriteAllText(Path.Combine(root, "c.md"),  "");
            var files = new List<string>();
            var dn = new DirNav { FileHandler = f => files.Add(f) };
            dn.AddPattern("cs");
            dn.Visit(root);
            return files.Count == 1 && files[0] == "a.cs";
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestDefaultSkipsBin()    => TestSkipsDir("bin");
    private static bool TestDefaultSkipsTarget() => TestSkipsDir("target");
    private static bool TestDefaultSkipsPycache() => TestSkipsDir("__pycache__");

    private static bool TestSkipsDir(string skipName)
    {
        string root = TempDir();
        try
        {
            string skip = Directory.CreateDirectory(Path.Combine(root, skipName)).FullName;
            File.WriteAllText(Path.Combine(skip, "hidden.cs"), "");
            File.WriteAllText(Path.Combine(root,  "visible.cs"), "");
            var files = new List<string>();
            new DirNav { FileHandler = f => files.Add(f) }.Visit(root);
            return files.Count == 1 && files[0] == "visible.cs";
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestAddSkipWorks()
    {
        string root = TempDir();
        try
        {
            string sub = Directory.CreateDirectory(Path.Combine(root, "custom_skip")).FullName;
            File.WriteAllText(Path.Combine(sub,  "hidden.cs"),  "");
            File.WriteAllText(Path.Combine(root, "visible.cs"), "");
            var files = new List<string>();
            var dn = new DirNav { FileHandler = f => files.Add(f) };
            dn.AddSkip("custom_skip");
            dn.Visit(root);
            return files.Count == 1 && files[0] == "visible.cs";
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestNoRecurse()
    {
        string root = TempDir();
        try
        {
            string sub = Directory.CreateDirectory(Path.Combine(root, "sub")).FullName;
            File.WriteAllText(Path.Combine(sub,  "deep.cs"), "");
            File.WriteAllText(Path.Combine(root, "top.cs"),  "");
            var files = new List<string>();
            new DirNav(recurse: false) { FileHandler = f => files.Add(f) }.Visit(root);
            return files.Count == 1 && files[0] == "top.cs";
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestCountersAreReset()
    {
        string root = TempDir();
        try
        {
            File.WriteAllText(Path.Combine(root, "a.cs"), "");
            var dn = new DirNav();
            dn.Visit(root);
            int first = dn.FileCount;
            dn.Visit(root);
            return dn.FileCount == first;
        }
        finally { Directory.Delete(root, true); }
    }

    private static bool TestFileCountCorrect()
    {
        string root = TempDir();
        try
        {
            for (int i = 0; i < 5; i++)
                File.WriteAllText(Path.Combine(root, $"f{i}.txt"), "");
            var dn = new DirNav();
            dn.Visit(root);
            return dn.FileCount == 5;
        }
        finally { Directory.Delete(root, true); }
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
