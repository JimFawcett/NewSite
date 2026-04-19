if (args.Contains("-T") || args.Contains("/T"))
{
    int failures = 0;
    Console.WriteLine("=== CommandLine ===");
    failures += CommandLine.Tests.RunAll();
    Console.WriteLine("=== DirNav ===");
    failures += DirNav.Tests.RunAll();
    Console.WriteLine("=== Output ===");
    failures += Output.Tests.RunAll();
    Console.WriteLine("=== EntryPoint (integration) ===");
    failures += IntegrationTests.RunAll();
    Console.WriteLine($"\nTotal: {failures} failure(s)");
    Environment.Exit(failures > 0 ? 1 : 0);
    return;
}

var cl = new CommandLine.CmdLine(args);

if (args.Length == 0 || cl.Help)
{
    Console.Write(cl.HelpText);
    return;
}

if (cl.Verbose)
{
    string pats = cl.Patterns.Count > 0 ? string.Join(",", cl.Patterns) : "(all files)";
    Console.WriteLine("Options:");
    Console.WriteLine($"  /P  {cl.Path}");
    Console.WriteLine($"  /r  {cl.Regex}");
    Console.WriteLine($"  /s  {cl.Recurse}");
    Console.WriteLine($"  /H  {cl.Hide}");
    Console.WriteLine($"  /p  {pats}");
    Console.WriteLine();
}

if (!Directory.Exists(cl.Path))
{
    Console.Error.WriteLine($"error: path does not exist: {cl.Path}");
    Environment.Exit(1);
}

var output = new Output.Output(cl.Hide);
output.SetRegex(cl.Regex);

var dn = new DirNav.DirNav(cl.Recurse)
{
    DirHandler  = dir  => output.OnDir(dir),
    FileHandler = file => output.OnFile(file)
};

foreach (string pat in cl.Patterns)
    dn.AddPattern(pat);

bool ok = dn.Visit(cl.Path);
if (!ok)
{
    Console.Error.WriteLine($"error: could not traverse: {cl.Path}");
    Environment.Exit(1);
}

Console.WriteLine($"\n{dn.FileCount} file(s) visited, {output.MatchCount} file(s) matched");
