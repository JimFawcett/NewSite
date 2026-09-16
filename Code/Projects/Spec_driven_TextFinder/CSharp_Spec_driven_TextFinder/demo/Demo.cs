// Demo.cs - runs CSharp_TextFinder against this project's own tree and shows what it
// produces, per Spec_TextFinder.md §6.2. It asserts nothing and fails nothing; its
// output moves as the tree changes, so a capture states the date it was taken.
//
// Run through run_demo.bat.

using System.Diagnostics;
using System.Globalization;
using System.Text;

namespace CSharp_TextFinder_Demo;

internal static class Demo
{
    private const string Extensions = "md, ixx, cpp, rs, cs";
    private const int Shown = 14;

    private static string _executable = string.Empty;
    private static string _projectRoot = string.Empty;

    private static string SolutionRoot()
    {
        DirectoryInfo? directory = new(AppContext.BaseDirectory);
        while (directory is not null && directory.Name != "CSharp_Spec_driven_TextFinder")
        {
            directory = directory.Parent;
        }

        if (directory is null) throw new InvalidOperationException("solution root not found");
        return directory.FullName;
    }

    private static string Forward(string path) => path.Replace('\\', '/');

    // The local date when run_demo.bat supplies it, the UTC civil date otherwise, so that
    // a capture dates itself however the demonstration was started.
    private static string Today()
    {
        string? supplied = Environment.GetEnvironmentVariable("TEXTFINDER_DEMO_DATE");
        if (!string.IsNullOrEmpty(supplied)) return supplied;
        return DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    }

    // Restores the quotes the shell removed, so the echoed command line can be retyped.
    private static string Quoted(string argument) =>
        argument.Contains(' ') || argument.Contains(',') ? "\"" + argument + "\"" : argument;

    private static void Case(int number, string[] note, params string[] args)
    {
        string indent = new(' ', number.ToString(CultureInfo.InvariantCulture).Length + 2);
        Console.WriteLine($"{number}. " + string.Join("\n" + indent, note));
        Console.WriteLine(("  $ CSharp_TextFinder " + string.Join(" ", args.Select(Quoted))).TrimEnd());
        Console.WriteLine();

        var start = new ProcessStartInfo(_executable)
        {
            WorkingDirectory = _projectRoot,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };

        foreach (string argument in args) start.ArgumentList.Add(argument);

        using Process process = Process.Start(start)
                                ?? throw new InvalidOperationException("the executable could not be run");

        string stdout = process.StandardOutput.ReadToEnd();
        string stderr = process.StandardError.ReadToEnd();
        process.WaitForExit();

        var lines = new List<string>(
            stdout.Length == 0 ? Array.Empty<string>() : stdout.TrimEnd('\n').Split('\n'));
        int emitted = lines.Count;

        foreach (string line in stderr.Length == 0
                     ? Array.Empty<string>()
                     : stderr.TrimEnd('\n').Split('\n'))
        {
            lines.Add("[stderr] " + line);
        }

        foreach (string line in lines.Take(Shown))
        {
            Console.WriteLine(line.Length == 0 ? string.Empty : "      " + line);
        }

        if (lines.Count > Shown)
        {
            Console.WriteLine($"      ... {lines.Count - Shown} more");

            // Page_Structure.md §7.2 part 4: the run summary is the last line a traversing run
            // writes, so the excerpt above never reaches it. Show it rather than withhold it.
            if (emitted > Shown && lines[emitted - 1].StartsWith("accessed ", StringComparison.Ordinal))
            {
                Console.WriteLine("      " + lines[emitted - 1]);
            }
        }

        Console.WriteLine();
        Console.WriteLine($"  {emitted} line(s), exit {process.ExitCode}");
        Console.WriteLine();
    }

    private static int Main()
    {
        string solution = SolutionRoot();
        string name = OperatingSystem.IsWindows() ? "CSharp_TextFinder.exe" : "CSharp_TextFinder";
        _executable = Path.Combine(solution, "CSharp_Spec_driven_TextFinder_Entry",
            "bin", "Debug", "net8.0", name);
        _projectRoot = Directory.GetParent(solution)!.FullName;

        Console.OutputEncoding = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false);

        Console.WriteLine();
        Console.WriteLine("CSharp_TextFinder demonstration");
        Console.WriteLine("  date:       " + Today());
        Console.WriteLine("  executable: " + Forward(_executable));
        Console.WriteLine("  root:       " + Forward(_projectRoot));
        Console.WriteLine("  extensions: \"" + Extensions + "\"");
        Console.WriteLine();

        Case(1, new[]
        {
            "No switch at all. The command line names no work, so CSharp_TextFinder lists",
            "the options a real invocation would start from and exits 0 (Spec_TextFinder.md §3.1).",
        });

        Case(2, new[]
        {
            "Default expression. The default /r of . with no /n or /L needs no file content,",
            "so each selected file is reported by its path line alone (Spec_TextFinder.md §3.3).",
        }, "-P", ".", "-p", Extensions);

        Case(3, new[]
        {
            "The two-level block of §3.4: a path written once, then an indented detail line",
            "per match carrying the line number and the line's text.",
        }, "-P", ".", "-p", Extensions, "-r", "too large", "-n", "true", "-L", "true");

        Case(4, new[]
        {
            "The same search with /L false, leaving the line number alone on each detail line.",
        }, "-P", ".", "-p", Extensions, "-r", "too large", "-n", "true");

        Case(5, new[]
        {
            "Which documents cite the parent specification. Neither /n nor /L, so every block",
            "is its path line and no path is written twice.",
        }, "-P", ".", "-p", Extensions, "-r", "Spec_TextFinder\\.md");

        Case(6, new[]
        {
            "The same search one level deep, /s false entering no subdirectory.",
        }, "-P", ".", "-p", Extensions, "-r", "Spec_TextFinder\\.md", "-s", "false");

        Case(7, new[]
        {
            "/h false adds a line for each file that matched nothing - the files case 5 left",
            "silent - alongside the resolved option set from /v true.",
        }, "-P", ".", "-p", Extensions, "-r", "Spec_TextFinder\\.md", "-h", "false", "-v", "true");

        Case(8, new[]
        {
            "Two roots, traversed in the order /P gave them. Each path begins with the root",
            "whose subtree holds it, and the skip list prunes bin/ and obj/ beneath both.",
        }, "-P", "CSharp_Spec_driven_TextFinder/CSharp_Spec_driven_Cmdline",
           "-P", "CSharp_Spec_driven_TextFinder/CSharp_Spec_driven_Output",
           "-p", "cs", "-r", "^public ", "-n", "true", "-L", "true");

        Case(9, new[]
        {
            "A root path that cannot be opened is announced and the run still exits 0, while",
            "an error announcement ignores /h true.",
        }, "-P", "no_such_directory",
           "-P", "CSharp_Spec_driven_TextFinder/CSharp_TextFinder_Structure.md", "-r", "interface");

        Case(10, new[]
        {
            "A malformed expression. §5.2 puts the option listing on stdout first, so the /r",
            "line shows what failed, then the diagnostic on stderr, and the exit code is 1.",
        }, "-P", ".", "-p", Extensions, "-r", "public (");

        Case(11, new[]
        {
            "The help text of §5.1, written to stdout under /H, traversing nothing.",
        }, "/H", "true");

        Console.WriteLine("demonstration complete");
        return 0;
    }
}
