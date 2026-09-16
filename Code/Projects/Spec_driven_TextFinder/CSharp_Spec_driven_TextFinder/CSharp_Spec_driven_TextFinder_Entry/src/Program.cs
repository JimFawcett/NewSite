// Program.cs - CSharp_TextFinder entry point, per Spec_CSharp_TextFinder_Entry.md

using System.Text.RegularExpressions;
using CSharp_TextFinder_Cmdline;
using CSharp_TextFinder_Dirnav;
using CSharp_TextFinder_Output;

namespace CSharp_TextFinder_Entry;

internal static class Program
{
    // §5: the defaults of Spec_TextFinder.md §3.2, owned by the binary. A List needs no
    // interior-mutability type and no lock to be extended from a static method, so the
    // RefCell and thread_local pair the Rust implementation requires has no counterpart.
    private static readonly List<string> SkipList = new()
    {
        "archive", ".git", ".svn", ".hg", "build", "out",
        "target", "bin", "obj", "__pycache__", "node_modules",
    };

    private static readonly StringComparison NameComparison =
        OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;

    // §5: the build-time extension point of Spec_TextFinder.md §3.5. Private and declared
    // here, so no library and no test can call it; calls are compiled in alongside it.
    private static void AddSkipDirectory(string name)
    {
        foreach (string held in SkipList)
        {
            if (string.Equals(held, name, NameComparison)) return;
        }

        SkipList.Add(name);
    }

    // §5: every call compiled in here runs before traversal begins. None is at present,
    // so AddSkipDirectory above has no caller until a build adds one.
    private static void ExtendSkipList()
    {
    }

    // §4: the startup sequence, in order. Every exit below returns from Main, never
    // Environment.Exit, so the using statement disposes the sink on every path out.
    private static int Main(string[] args)
    {
        // Step 1. No decoding step precedes this one: the runtime hands Main a string[].
        if (!CommandLine.TryParse(args, out ProgramCommands? commands, out string? diagnostic))
        {
            Console.Error.Write(diagnostic);
            return 1;
        }

        // Step 2. Before anything reaches stdout, since the sink owns the only writer
        // over it. The construction sits outside the using statement so that a catch
        // can reach it and the disposal is still guaranteed.
        StdoutSink sink;
        try
        {
            sink = new StdoutSink();
        }
        catch (Exception e) when (e is InvalidOperationException or IOException)
        {
            Console.Error.Write("cannot initialize output\n");
            return 2;
        }

        using (sink)
        {
            // Step 3.
            if (commands.Help)
            {
                sink.WriteText(CommandLine.HelpText());
                return 0;
            }

            // Step 4. Spec_TextFinder.md §3.1: a command line bearing no switch at all
            // names no work. args holds the arguments alone, so the test is a length of
            // 0 where C++ tests argc == 1. No element of args is inspected.
            if (args.Length == 0)
            {
                sink.WriteText(CommandLine.OptionsText(commands));
                return 0;
            }

            // Step 5. Mutually exclusive with step 4: a command line bearing /v is not empty.
            if (commands.Verbose) sink.WriteText(CommandLine.OptionsText(commands));

            // Step 6.
            ExtendSkipList();

            Dirnav<StdoutSink> navigator;
            try
            {
                navigator = new Dirnav<StdoutSink>(sink, SkipList, commands);
            }
            catch (RegexParseException)
            {
                // Spec_TextFinder.md §5.2: the listing goes to stdout whatever /v says, so
                // the /r line shows the expression that failed, and is not repeated when
                // /v produced it. The framework's own message is not written.
                if (!commands.Verbose) sink.WriteText(CommandLine.OptionsText(commands));
                sink.Flush();   // ahead of stderr, since the sink defers its writes
                Console.Error.Write("invalid regex for switch: /r\n" + CommandLine.UsageLine());
                return 1;
            }

            // Step 7. One reused instance, one root path at a time, in the order /P gave
            // them. Every root-path failure is announced by Dirnav and affects nothing here.
            foreach (string root in commands.RootPaths)
            {
                navigator.Search(root);
            }

            // Step 8. Only Main knows the last root path has returned.
            navigator.EmitRunSummary();

            // Step 9.
            return 0;
        }
    }
}
