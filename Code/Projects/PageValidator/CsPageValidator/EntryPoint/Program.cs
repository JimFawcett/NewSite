using PageValidator;

// ---------------------------------------------------------------------------
// Skip list and file helpers
// ---------------------------------------------------------------------------

static bool ShouldSkip(string path)
{
    string[] skipDirs =
    [
        "target", "bin", "obj", "build", "out",
        "__pycache__", ".venv", "venv", "dist",
        ".git", ".vs", ".idea", "archive",
    ];
    return skipDirs.Contains(Path.GetFileName(path), StringComparer.OrdinalIgnoreCase);
}

static bool IsHtml(string path)
{
    string ext = Path.GetExtension(path).ToLowerInvariant();
    return ext == ".html" || ext == ".htm";
}

static void CollectHtmlFiles(string path, bool recursive, List<string> files)
{
    if (File.Exists(path))
    {
        if (IsHtml(path)) files.Add(path);
        return;
    }
    if (!Directory.Exists(path)) return;

    string[] entries;
    try { entries = Directory.GetFileSystemEntries(path); }
    catch (Exception e)
    {
        Console.Error.WriteLine($"ERROR cannot read directory {path}: {e.Message}");
        return;
    }

    var subdirs = new List<string>();
    foreach (var entry in entries)
    {
        if (File.Exists(entry))
        {
            if (IsHtml(entry)) files.Add(entry);
        }
        else if (recursive && Directory.Exists(entry) && !ShouldSkip(entry))
        {
            subdirs.Add(entry);
        }
    }
    foreach (var subdir in subdirs)
        CollectHtmlFiles(subdir, recursive, files);
}

// ---------------------------------------------------------------------------
// Report printing
// ---------------------------------------------------------------------------

static void PrintReport(Report report, bool quiet)
{
    if (report.IsValid)
    {
        if (!quiet)
            Console.WriteLine($"PASS  {report.File}");
    }
    else
    {
        Console.WriteLine($"FAIL  {report.File}");
        foreach (var e in report.Errors)
            Console.WriteLine($"      [{e.Rule}] {e.Line}:{e.Col} — {e.Message}");
    }
    Console.Out.Flush();
}

// ---------------------------------------------------------------------------
// Help text
// ---------------------------------------------------------------------------

const string HelpText = """
    page_validator — validate HTML files for structural correctness

    Usage:
      page_validator [options] <path>...

    Arguments:
      <path>...    HTML files or directories to validate

    Options:
      -r, --recursive    Descend into subdirectories
      -q, --quiet        Print only files with errors
      -s, --summary      Print a pass/fail count after all files
      -h, --help         Print this help and exit

    Rules checked:
      doctype       document begins with <!DOCTYPE html>
      root-element  exactly one <html> element
      head-required <head> present and contains <title>
      body-required <body> present
      tag-nesting   every open tag has a matching close tag
      void-elements void elements carry no close tag
      attr-quotes   all attribute values are quoted
      duplicate-id  id values are unique within the document

    Exit status: 0 = all files pass, 1 = one or more files fail.
    """;

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

bool recursive  = false;
bool quiet      = false;
bool summary    = false;
var  inputPaths = new List<string>();

foreach (var arg in args)
{
    switch (arg)
    {
        case "-r": case "--recursive": recursive = true;  break;
        case "-q": case "--quiet":     quiet     = true;  break;
        case "-s": case "--summary":   summary   = true;  break;
        case "-h": case "--help":      Console.Write(HelpText); return 0;
        default:                       inputPaths.Add(arg); break;
    }
}

if (inputPaths.Count == 0)
{
    Console.Write(HelpText);
    return 0;
}

var files = new List<string>();
foreach (var p in inputPaths)
    CollectHtmlFiles(p, recursive, files);

if (files.Count == 0)
{
    Console.Error.WriteLine("no HTML files found");
    return 1;
}

int pass = 0, fail = 0, readErrors = 0;

foreach (var file in files)
{
    string src;
    try
    {
        src = File.ReadAllText(file);
    }
    catch (Exception e)
    {
        Console.Error.WriteLine($"ERROR {file} — {e.Message}");
        readErrors++;
        continue;
    }

    var report = Validator.Validate(src, file);
    if (report.IsValid) pass++; else fail++;
    PrintReport(report, quiet);
}

if (summary)
    Console.WriteLine($"\n{pass} passed, {fail} failed");

return (fail > 0 || readErrors > 0) ? 1 : 0;
