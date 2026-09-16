// IntegrationTests.cs - integration suite for the CSharp_TextFinder binary, per
// Spec_TextFinder.md §6.2. It drives the built executable end to end: startup sequence,
// exit codes, and stream routing, which no unit suite reaches. Expected stdout is
// compared byte for byte, after decoding, and the raw bytes are checked for CR.

using System.Diagnostics;
using System.Text;
using CSharp_TextFinder_Cmdline;

namespace CSharp_TextFinder_IntegrationTest;

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

    private static string Visible(string text) =>
        text.Replace("\r", "\\r").Replace("\n", "\\n");
}

internal sealed class Run
{
    public string Stdout { get; init; } = string.Empty;
    public string Stderr { get; init; } = string.Empty;
    public byte[] RawStdout { get; init; } = Array.Empty<byte>();
    public int Code { get; init; }

    public string[] Lines =>
        Stdout.Length == 0 ? Array.Empty<string>() : Stdout.TrimEnd('\n').Split('\n');

    public string Sorted()
    {
        string[] lines = Lines;
        Array.Sort(lines, StringComparer.Ordinal);
        return string.Join("|", lines);
    }
}

internal sealed class TempTree : IDisposable
{
    private static int _counter;

    public string Root { get; }

    public TempTree(string tag)
    {
        int unique = Interlocked.Increment(ref _counter);
        Root = Path.Combine(Path.GetTempPath(),
            $"csharp_textfinder_integration_{tag}_{Environment.ProcessId}_{unique}");
        if (Directory.Exists(Root)) Directory.Delete(Root, recursive: true);
        Directory.CreateDirectory(Root);
    }

    public void File(string relative, byte[] bytes)
    {
        string path = Path.Combine(Root, relative.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        System.IO.File.WriteAllBytes(path, bytes);
    }

    public void File(string relative, string text) => File(relative, Encoding.UTF8.GetBytes(text));

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(Root)) Directory.Delete(Root, recursive: true);
        }
        catch (IOException)
        {
        }
    }
}

internal static class IntegrationTests
{
    private const string DefaultListing =
        "/P .\n/p\n/r .\n/s true\n/h true\n/v false\n/H false\n/n false\n/L false\n";

    private static string _executable = string.Empty;

    // The layout CSharp_TextFinder_Structure.md fixes is what makes this resolvable: the
    // suite sits at the solution root, the binary in its own component folder. A
    // command-line argument overrides it, so a binary built elsewhere can be tested.
    private static string Locate(string[] args)
    {
        if (args.Length > 0) return args[0];

        DirectoryInfo? directory = new(AppContext.BaseDirectory);
        while (directory is not null && directory.Name != "CSharp_Spec_driven_TextFinder")
        {
            directory = directory.Parent;
        }

        if (directory is null) throw new InvalidOperationException("solution root not found");

        string name = OperatingSystem.IsWindows() ? "CSharp_TextFinder.exe" : "CSharp_TextFinder";
        return Path.Combine(directory.FullName, "CSharp_Spec_driven_TextFinder_Entry",
            "bin", "Debug", "net8.0", name);
    }

    private static Run Invoke(string workingDirectory, params string[] args)
    {
        var start = new ProcessStartInfo(_executable)
        {
            WorkingDirectory = workingDirectory,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };

        foreach (string argument in args) start.ArgumentList.Add(argument);

        using Process process = Process.Start(start)
                                ?? throw new InvalidOperationException("the built executable must be runnable");

        using var stdout = new MemoryStream();
        using var stderr = new MemoryStream();
        Task copyOut = process.StandardOutput.BaseStream.CopyToAsync(stdout);
        Task copyErr = process.StandardError.BaseStream.CopyToAsync(stderr);
        process.WaitForExit();
        Task.WaitAll(copyOut, copyErr);

        byte[] raw = stdout.ToArray();
        return new Run
        {
            RawStdout = raw,
            Stdout = Encoding.UTF8.GetString(raw),
            Stderr = Encoding.UTF8.GetString(stderr.ToArray()),
            Code = process.ExitCode,
        };
    }

    private static int Main(string[] args)
    {
        _executable = Locate(args);
        var check = new Check();
        Console.WriteLine("CSharp_TextFinder integration tests");

        if (!File.Exists(_executable))
        {
            Console.WriteLine("  FAIL  the executable under test exists");
            Console.WriteLine("        not built: " + _executable);
            Console.WriteLine("  0 of 1 passed");
            Console.WriteLine("FAIL");
            return 1;
        }

        string temp = Path.GetTempPath();

        // --- §4 startup sequence ---
        using (var tree = new TempTree("bare"))
        {
            tree.File("ignored.txt", "nothing is searched\n");
            Run bare = Invoke(tree.Root);
            check.Equal(bare.Stdout, DefaultListing, "a bare command line lists every default, with /v false");
            check.That(bare.Stderr.Length == 0, "a bare command line writes nothing to stderr");
            check.That(bare.Code == 0, "a bare command line exits 0");
        }

        Run help = Invoke(temp, "/H", "true");
        check.Equal(help.Stdout, CommandLine.HelpText(), "/H prints the text §5.1 fixes");
        check.That(help.Code == 0, "/H exits 0");
        check.That(help.Stderr.Length == 0, "/H writes nothing to stderr");
        check.That(!help.Stdout.Contains('\r'), "the help text carries LF only");
        check.That(help.RawStdout.Length > 2 && !(help.RawStdout[0] == 0xEF && help.RawStdout[1] == 0xBB),
            "stdout carries no byte-order mark");

        using (var tree = new TempTree("helpfirst"))
        {
            tree.File("a.txt", "alpha\n");
            Run first = Invoke(tree.Root, "/H", "true", "/P", ".");
            check.Equal(first.Stdout, CommandLine.HelpText(), "/H is taken before any traversal");
        }

        using (var tree = new TempTree("verbose"))
        {
            tree.File("a.txt", "alpha\n");
            Run verbose = Invoke(tree.Root, "-v", "true");
            check.That(verbose.Stdout.StartsWith(
                    "/P .\n/p\n/r .\n/s true\n/h true\n/v true\n/H false\n/n false\n/L false\n",
                    StringComparison.Ordinal),
                "/v lists the resolved options before the search output");
            check.Equal(verbose.Lines[^2], "a.txt", "the search output follows the /v listing");
            check.Equal(verbose.Lines[^1], "accessed 1 files, 1 directories",
                "the run summary closes the output, per §3.6");
        }

        // Spec_TextFinder.md §3.6: only a run that traversed writes the summary.
        using (var tree = new TempTree("nosummary"))
        {
            tree.File("a.txt", "alpha\n");
            check.That(!Invoke(tree.Root).Stdout.Contains("accessed ", StringComparison.Ordinal),
                "a bare command line traverses nothing and writes no run summary");
            check.That(!Invoke(tree.Root, "/H", "true").Stdout.Contains("accessed ", StringComparison.Ordinal),
                "/H traverses nothing and writes no run summary");
            check.That(!Invoke(tree.Root, "/r", "a(b").Stdout.Contains("accessed ", StringComparison.Ordinal),
                "a malformed expression traverses nothing and writes no run summary");
        }

        // --- §5.2 usage diagnostics ---
        foreach ((string[] argv, string reason) in new[]
                 {
                     (new[] { "P", "." }, "not a switch: P"),
                     (new[] { "/x", "1" }, "unrecognized switch: /x"),
                     (new[] { "/P" }, "missing argument for switch: /P"),
                     (new[] { "-s", "yes" }, "invalid boolean for -s: yes"),
                     (new[] { "/P", "" }, "empty root path for switch: /P"),
                     (new[] { "/r", "" }, "empty expression for switch: /r"),
                 })
        {
            Run failed = Invoke(temp, argv);
            check.Equal(failed.Stderr, reason + "\n" + CommandLine.UsageLine(), reason + " diagnostic");
            check.That(failed.Code == 1, reason + " exits 1");
            check.That(failed.Stdout.Length == 0, reason + " leaves stdout empty");
        }

        Run malformed = Invoke(temp, "/r", "a(b");
        check.Equal(malformed.Stdout,
            "/P .\n/p\n/r a(b\n/s true\n/h true\n/v false\n/H false\n/n false\n/L false\n",
            "a malformed expression puts the option listing on stdout first");
        check.Equal(malformed.Stderr, "invalid regex for switch: /r\n" + CommandLine.UsageLine(),
            "the malformed-expression diagnostic follows on stderr");
        check.That(malformed.Code == 1, "a malformed expression exits 1");

        Run malformedVerbose = Invoke(temp, "/r", "a(b", "/v", "true");
        check.That(CountOf(malformedVerbose.Stdout, "\n/r a(b\n") == 1,
            "under /v the listing is written once, not twice");

        // --- §3.4 block form ---
        using (var tree = new TempTree("block"))
        {
            tree.File("solo.txt", "alpha\nbeta\nalpha again\n");
            Run block = Invoke(tree.Root, "/P", ".", "/r", "alpha", "/n", "true", "/L", "true");
            check.Equal(block.Stdout,
                "solo.txt\n  1 - alpha\n  3 - alpha again\naccessed 1 files, 1 directories\n",
                "a block carries its path once and its detail lines beneath it");
            check.That(block.Code == 0, "a normal search exits 0");
            check.That(block.Stderr.Length == 0, "a normal search writes nothing to stderr");
        }

        using (var tree = new TempTree("dotroot"))
        {
            tree.File("sub/leaf.txt", "alpha\n");
            check.Equal(Invoke(tree.Root, "/P", ".").Stdout,
                "sub/leaf.txt\naccessed 1 files, 2 directories\n",
                "a root of . contributes no leading ./");
        }

        using (var tree = new TempTree("namedroot"))
        {
            tree.File("sub/deeper/leaf.txt", "alpha\n");
            check.Equal(Invoke(tree.Root, "/P", "sub\\deeper").Stdout,
                "sub/deeper/leaf.txt\naccessed 1 files, 1 directories\n",
                "a named root is part of every path and its separators are normalized");
        }

        using (var tree = new TempTree("roots"))
        {
            tree.File("one/a.txt", "alpha\n");
            tree.File("two/b.txt", "alpha\n");
            check.Equal(Invoke(tree.Root, "/P", "one", "/P", "two").Stdout,
                "one/a.txt\ntwo/b.txt\naccessed 2 files, 2 directories\n",
                "roots are traversed in the order given");
            check.Equal(Invoke(tree.Root, "/P", "two", "/P", "one").Stdout,
                "two/b.txt\none/a.txt\naccessed 2 files, 2 directories\n",
                "reversing the roots reverses the output");
        }

        using (var tree = new TempTree("skips"))
        {
            tree.File("kept.txt", "alpha\n");
            tree.File("obj/pruned.txt", "alpha\n");
            tree.File("node_modules/pruned.txt", "alpha\n");
            tree.File(".git/pruned.txt", "alpha\n");
            check.Equal(Invoke(tree.Root, "/P", ".").Stdout,
                "kept.txt\naccessed 1 files, 1 directories\n",
                "the compiled skip list prunes a matching directory");
        }

        using (var tree = new TempTree("norecurse"))
        {
            tree.File("top.txt", "alpha\n");
            tree.File("sub/under.txt", "alpha\n");
            check.Equal(Invoke(tree.Root, "/P", ".", "/s", "false").Stdout,
                "top.txt\naccessed 1 files, 1 directories\n",
                "/s false enters no subdirectory");
        }

        using (var tree = new TempTree("extensions"))
        {
            tree.File("a.cs", "alpha\n");
            tree.File("b.txt", "alpha\n");
            tree.File("noext", "alpha\n");
            check.Equal(Invoke(tree.Root, "/P", ".", "/p", " .cs , ").Stdout,
                "a.cs\naccessed 1 files, 1 directories\n",
                "/p filters by extension after normalization");
        }

        // --- §3.4 announcements ---
        using (var tree = new TempTree("announce"))
        {
            tree.File("hit.txt", "alpha\n");
            tree.File("miss.txt", "gamma\n");
            tree.File("binary.dat", new byte[] { (byte)'a', 0, (byte)'b' });
            Run announced = Invoke(tree.Root, "/P", ".", "/r", "alpha", "/h", "false");
            check.Equal(announced.Sorted(),
                "accessed 3 files, 1 directories|hit.txt|searched miss.txt|skipped binary.dat",
                "/h false announces every examined file exactly once");
            check.Equal(Invoke(tree.Root, "/P", ".", "/r", "alpha").Stdout,
                "hit.txt\naccessed 3 files, 1 directories\n",
                "the default /h hides only the files that matched nothing");
        }

        using (var tree = new TempTree("missingroot"))
        {
            tree.File("a.txt", "alpha\n");
            Run missing = Invoke(tree.Root, "/P", "no_such_directory", "/P", ".");
            check.Equal(missing.Stdout,
                "cannot open no_such_directory\na.txt\naccessed 1 files, 1 directories\n",
                "an unopenable root is announced through the output component");
            check.That(missing.Code == 0, "an unopenable root does not affect the exit code");
            check.That(missing.Stderr.Length == 0, "an unopenable root writes nothing to stderr");
        }

        using (var tree = new TempTree("nocontent"))
        {
            tree.File("binary.dat", new byte[] { 0, 1, 2 });
            tree.File("empty.txt", Array.Empty<byte>());
            tree.File("text.txt", "alpha\n");
            check.Equal(Invoke(tree.Root, "/P", ".", "/h", "false").Sorted(),
                "accessed 3 files, 1 directories|binary.dat|text.txt",
                "the no-content case reports a binary file and omits an empty one");
        }

        // --- §3.4 terminators ---
        using (var tree = new TempTree("terminators"))
        {
            tree.File("a.txt", "alpha\n");
            Run run = Invoke(tree.Root, "/P", ".", "/r", "alpha", "/L", "true", "/v", "true");
            check.That(Array.IndexOf(run.RawStdout, (byte)13) < 0, "stdout carries no CR byte on any platform");
            check.That(run.Stdout.EndsWith('\n'), "stdout ends with a terminator");
        }

        using (var tree = new TempTree("crlffile"))
        {
            tree.File("dos.txt", "alpha\r\nbeta\r\n");
            check.Equal(Invoke(tree.Root, "/P", ".", "/r", "alpha", "/L", "true").Stdout,
                "dos.txt\n  alpha\naccessed 1 files, 1 directories\n",
                "a CRLF file yields lines free of the carriage return");
        }

        return check.Report();
    }

    private static int CountOf(string text, string needle)
    {
        int count = 0;
        int at = text.IndexOf(needle, StringComparison.Ordinal);
        while (at >= 0)
        {
            ++count;
            at = text.IndexOf(needle, at + 1, StringComparison.Ordinal);
        }

        return count;
    }
}
