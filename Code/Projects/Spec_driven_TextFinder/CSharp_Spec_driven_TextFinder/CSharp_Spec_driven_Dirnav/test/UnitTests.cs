// UnitTests.cs - unit suite for CSharp_TextFinder_Dirnav, exercising Spec_CSharp_TextFinder_Dirnav.md

using System.Text.RegularExpressions;
using CSharp_TextFinder_Cmdline;
using CSharp_TextFinder_Dirnav;

namespace CSharp_TextFinder_Dirnav_UnitTest;

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

// §4: the suite's own IOutput, which satisfies the same bound the real sink does and so
// shows that the generic parameter binds to any implementation of the interface.
internal sealed class Recorder : IOutput
{
    public List<string> Lines { get; } = new();

    public void Output(string text) => Lines.Add(text);
}

internal sealed class TempTree : IDisposable
{
    private static int _counter;

    public string Root { get; }

    public TempTree(string tag)
    {
        int unique = Interlocked.Increment(ref _counter);
        Root = Path.Combine(Path.GetTempPath(),
            $"csharp_textfinder_dirnav_{tag}_{Environment.ProcessId}_{unique}");
        if (Directory.Exists(Root)) Directory.Delete(Root, recursive: true);
        Directory.CreateDirectory(Root);
    }

    public string File(string relative, byte[] bytes)
    {
        string path = Path.Combine(Root, relative.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        System.IO.File.WriteAllBytes(path, bytes);
        return path;
    }

    public string File(string relative, string text) =>
        File(relative, System.Text.Encoding.UTF8.GetBytes(text));

    public string Directory_(string relative)
    {
        string path = Path.Combine(Root, relative);
        Directory.CreateDirectory(path);
        return path;
    }

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

internal static class UnitTests
{
    private static readonly IReadOnlyList<string> NoSkips = Array.Empty<string>();

    private static List<string> Run(string root, ProgramCommands commands, IReadOnlyList<string>? skips = null)
    {
        var recorder = new Recorder();
        var navigator = new Dirnav<Recorder>(recorder, skips ?? NoSkips, commands);
        navigator.Search(root);
        return recorder.Lines;
    }

    // Paths are reported relative to the temp root, so a fixture can name what it expects.
    private static string Relative(TempTree tree, IEnumerable<string> lines)
    {
        string prefix = tree.Root.Replace('\\', '/') + "/";
        List<string> trimmed = lines.Select(line => line.Replace(prefix, string.Empty)).ToList();
        trimmed.Sort(StringComparer.Ordinal);
        return string.Join("|", trimmed);
    }

    private static string Ordered(TempTree tree, IEnumerable<string> lines)
    {
        string prefix = tree.Root.Replace('\\', '/') + "/";
        return string.Join("|", lines.Select(line => line.Replace(prefix, string.Empty)));
    }

    // §8.1: the summary line alone, from a run over the given roots. One instance serves
    // them all, as CSharp_TextFinder_Entry uses it, so the counts accumulate.
    private static string SummaryOf(string[] roots, ProgramCommands commands,
        IReadOnlyList<string>? skips = null)
    {
        var recorder = new Recorder();
        var navigator = new Dirnav<Recorder>(recorder, skips ?? NoSkips, commands);
        foreach (string root in roots) navigator.Search(root);
        navigator.EmitRunSummary();
        return recorder.Lines[^1];
    }

    private static ProgramCommands Commands(string regex = ".", bool recurse = true,
        bool suppress = true, bool numbers = false, bool matched = false, params string[] extensions)
    {
        return new ProgramCommands
        {
            RegexText = regex,
            Recurse = recurse,
            SuppressOnNoMatch = suppress,
            LineNumbers = numbers,
            MatchedLine = matched,
            Extensions = extensions.ToList(),
        };
    }

    private static int Main()
    {
        var check = new Check();
        Console.WriteLine("CSharp_TextFinder_Dirnav unit tests");

        // --- §4: construction ---
        bool threw = false;
        try
        {
            _ = new Dirnav<Recorder>(new Recorder(), NoSkips, Commands("a(b"));
        }
        catch (RegexParseException)
        {
            threw = true;
        }

        check.That(threw, "a malformed expression throws RegexParseException from the constructor");

        // --- §5 rule 4: the skip list ---
        using (var tree = new TempTree("skips"))
        {
            tree.File("kept.txt", "alpha\n");
            tree.File("obj/pruned.txt", "alpha\n");
            tree.File("sub/kept2.txt", "alpha\n");
            check.Equal(Relative(tree, Run(tree.Root, Commands(), new[] { "obj" })),
                "kept.txt|sub/kept2.txt", "a skip-list directory is pruned silently");
        }

        using (var tree = new TempTree("rootskip"))
        {
            string root = tree.Directory_("obj");
            System.IO.File.WriteAllText(Path.Combine(root, "top.txt"), "alpha\n");
            Directory.CreateDirectory(Path.Combine(root, "obj"));
            System.IO.File.WriteAllText(Path.Combine(root, "obj", "deep.txt"), "alpha\n");
            List<string> lines = Run(root, Commands(), new[] { "obj" });
            check.That(lines.Count == 1 && lines[0].EndsWith("top.txt", StringComparison.Ordinal),
                "a root named in the skip list is traversed, and pruning resumes below it");
        }

        // --- §5 rule 3: recursion ---
        using (var tree = new TempTree("norecurse"))
        {
            tree.File("top.txt", "alpha\n");
            tree.File("sub/under.txt", "alpha\n");
            check.Equal(Relative(tree, Run(tree.Root, Commands(recurse: false))), "top.txt",
                "/s false searches the root's own files and enters no subdirectory");
        }

        // --- §6: selection ---
        using (var tree = new TempTree("select"))
        {
            tree.File("a.cs", "alpha\n");
            tree.File("b.txt", "alpha\n");
            tree.File("noext", "alpha\n");
            tree.File(".gitignore", "alpha\n");
            check.Equal(Relative(tree, Run(tree.Root, Commands())), ".gitignore|a.cs|b.txt|noext",
                "an empty /p list selects every file, files without an extension included");
            check.Equal(Relative(tree, Run(tree.Root, Commands(extensions: new[] { "cs" }))), "a.cs",
                "a non-empty /p list selects by last dot suffix and excludes a file without one");
            check.Equal(Relative(tree, Run(tree.Root, Commands(extensions: new[] { "gitignore" }))), ".gitignore",
                "a dot-file's extension is its last dot-suffix");
        }

        using (var tree = new TempTree("rootfile"))
        {
            string file = tree.File("only.cs", "alpha\n");
            check.That(Run(file, Commands()).Count == 1, "a root path that is a regular file is searched");
            check.That(Run(file, Commands(extensions: new[] { "md" })).Count == 0,
                "a root path that is a regular file is filtered by /p like any other");
        }

        // --- §7: admission and the no-content case ---
        using (var tree = new TempTree("nocontent"))
        {
            tree.File("text.txt", "alpha\n");
            tree.File("binary.dat", new byte[] { 0, 1, 2 });
            tree.File("empty.txt", Array.Empty<byte>());
            check.Equal(Relative(tree, Run(tree.Root, Commands(suppress: false))), "binary.dat|text.txt",
                "the default command line reports every non-empty file without opening it");
        }

        using (var tree = new TempTree("content"))
        {
            tree.File("nul.txt", new byte[] { (byte)'a', 0, (byte)'b' });
            tree.File("bad.txt", new byte[] { 0xC3, 0x28 });
            tree.File("hit.txt", "alpha\n");
            tree.File("miss.txt", "gamma\n");
            check.Equal(Relative(tree, Run(tree.Root, Commands("alpha"))), "hit.txt",
                "the default /h leaves only the matching file's block");
            check.Equal(Relative(tree, Run(tree.Root, Commands("alpha", suppress: false))),
                "hit.txt|searched miss.txt|skipped bad.txt|skipped nul.txt",
                "/h false announces every examined file exactly once");
        }

        using (var tree = new TempTree("limit"))
        {
            tree.File("big.txt", new byte[10_485_761]);
            tree.File("edge.txt", new byte[10_485_760]);
            check.Equal(Relative(tree, Run(tree.Root, Commands("alpha"))).Split('|')[0],
                "too large big.txt", "a file above the limit draws an error announcement under /h true");
            check.That(!Relative(tree, Run(tree.Root, Commands("alpha"))).Contains("too large edge.txt"),
                "a file exactly at the limit is searched");
        }

        // --- §7: line splitting ---
        using (var tree = new TempTree("lines"))
        {
            tree.File("lf.txt", "one\ntwo\n");
            tree.File("crlf.txt", "one\r\ntwo\r\n");
            tree.File("cr.txt", "one\rtwo\r");
            tree.File("bare.txt", "one\ntwo");
            check.Equal(Ordered(tree, Run(Path.Combine(tree.Root, "lf.txt"), Commands("two", matched: true))),
                "lf.txt|  two", "LF terminates a line");
            check.Equal(Ordered(tree, Run(Path.Combine(tree.Root, "crlf.txt"), Commands("two", matched: true))),
                "crlf.txt|  two", "CRLF terminates a line and the CR is not part of it");
            check.Equal(Ordered(tree, Run(Path.Combine(tree.Root, "cr.txt"), Commands("two", matched: true))),
                "cr.txt|  two", "a bare CR terminates a line");
            check.Equal(Ordered(tree, Run(Path.Combine(tree.Root, "bare.txt"), Commands("two", numbers: true))),
                "bare.txt|  2", "a final unterminated run is a line");
        }

        using (var tree = new TempTree("bom"))
        {
            tree.File("bom.txt", new byte[] { 0xEF, 0xBB, 0xBF, (byte)'a', (byte)'l', (byte)'p', (byte)'h', (byte)'a', 0x0A });
            check.Equal(Ordered(tree, Run(Path.Combine(tree.Root, "bom.txt"), Commands("^alpha", matched: true))),
                "bom.txt|  alpha", "a leading BOM is not part of the first line");
        }

        // --- §8: the block form ---
        using (var tree = new TempTree("block"))
        {
            tree.File("solo.txt", "alpha\nbeta\nalpha again\n");
            string path = Path.Combine(tree.Root, "solo.txt");
            check.Equal(Ordered(tree, Run(path, Commands("alpha", numbers: true, matched: true))),
                "solo.txt|  1 - alpha|  3 - alpha again",
                "/n and /L true give a path line and a number-and-text detail line per match");
            check.Equal(Ordered(tree, Run(path, Commands("alpha", numbers: true))),
                "solo.txt|  1|  3", "/L false leaves the number alone on the detail line");
            check.Equal(Ordered(tree, Run(path, Commands("alpha", matched: true))),
                "solo.txt|  alpha|  alpha again", "/n false leaves the text alone on the detail line");
            check.Equal(Ordered(tree, Run(path, Commands("alpha"))), "solo.txt",
                "with neither /n nor /L a block is its path line alone");
            check.Equal(Ordered(tree, Run(path, Commands("a", numbers: true))), "solo.txt|  1|  2|  3",
                "line numbers count every matching line in line order");
        }

        using (var tree = new TempTree("once"))
        {
            tree.File("many.txt", "alpha alpha alpha\n");
            check.Equal(Ordered(tree, Run(Path.Combine(tree.Root, "many.txt"), Commands("alpha", numbers: true))),
                "many.txt|  1", "a matching line yields one detail line however many occurrences it holds");
        }

        // --- §8: path rendering ---
        using (var tree = new TempTree("paths"))
        {
            tree.File("sub/deep/leaf.txt", "alpha\n");
            List<string> lines = Run(tree.Root, Commands());
            check.That(lines.Count == 1 && !lines[0].Contains('\\'),
                "every path is rendered with forward separators");
            check.That(lines[0].StartsWith(tree.Root.Replace('\\', '/'), StringComparison.Ordinal),
                "every path begins with the root it was reached through");
            check.Equal(Ordered(tree, Run(tree.Root + Path.DirectorySeparatorChar + "sub", Commands())),
                "sub/deep/leaf.txt", "a separator the user typed in a root path is normalized");
        }

        // --- §5 rule 7: error announcements ---
        using (var tree = new TempTree("missing"))
        {
            string missing = Path.Combine(tree.Root, "no_such_directory");
            check.Equal(Ordered(tree, Run(missing, Commands())), "cannot open no_such_directory",
                "a root path that cannot be opened is announced");
            check.Equal(Ordered(tree, Run(missing, Commands(suppress: true))), "cannot open no_such_directory",
                "an error announcement is not gated on /h");
        }

        // --- §4: one instance serves every root path ---
        using (var tree = new TempTree("reuse"))
        {
            tree.File("one/a.txt", "alpha\n");
            tree.File("two/b.txt", "alpha\n");
            var recorder = new Recorder();
            var navigator = new Dirnav<Recorder>(recorder, NoSkips, Commands());
            navigator.Search(Path.Combine(tree.Root, "one"));
            navigator.Search(Path.Combine(tree.Root, "two"));
            check.Equal(Ordered(tree, recorder.Lines), "one/a.txt|two/b.txt",
                "one navigator serves every root path, in the order given");
        }

        // --- §8.1: the run summary ---
        using (var tree = new TempTree("summary"))
        {
            tree.File("a.cs", "alpha\n");
            tree.File("notes.txt", "alpha\n");
            tree.File("sub/b.cs", "alpha\n");
            tree.File("obj/pruned.cs", "alpha\n");

            string[] root = { tree.Root };
            IReadOnlyList<string> prune = new[] { "obj" };

            check.Equal(SummaryOf(root, Commands(), prune), "accessed 3 files, 2 directories",
                "every examined file and every entered directory is counted");
            check.Equal(SummaryOf(root, Commands(extensions: new[] { "cs" }), prune),
                "accessed 2 files, 2 directories",
                "a file the /p list excluded is not counted");
            check.Equal(SummaryOf(root, Commands(extensions: new[] { "nosuchextension" }), prune),
                "accessed 0 files, 2 directories",
                "a directory holding no selected file is still counted");
            check.Equal(SummaryOf(root, Commands()), "accessed 4 files, 3 directories",
                "a pruned directory and its files are counted once the list no longer prunes it");
            check.Equal(SummaryOf(root, Commands(recurse: false)), "accessed 2 files, 1 directories",
                "under /s false no subdirectory is counted");
            check.Equal(SummaryOf(new[] { Path.Combine(tree.Root, "a.cs") }, Commands()),
                "accessed 1 files, 0 directories",
                "a root that is a regular file counts as a file, and neither noun is inflected");
            check.Equal(SummaryOf(new[] { Path.Combine(tree.Root, "no_such_directory") }, Commands()),
                "accessed 0 files, 0 directories",
                "a root that cannot be opened is counted as neither");

            string sub = Path.Combine(tree.Root, "sub");
            check.Equal(SummaryOf(new[] { sub, Path.Combine(tree.Root, "a.cs") }, Commands()),
                "accessed 2 files, 1 directories",
                "the counts are of the whole run, not of one root");
            check.Equal(SummaryOf(new[] { sub, sub }, Commands()), "accessed 2 files, 2 directories",
                "an entry reached under two roots counts once for each");
            check.Equal(SummaryOf(root, Commands(suppress: false)), SummaryOf(root, Commands()),
                "the summary is not gated on /h");
        }

        return check.Report();
    }
}
