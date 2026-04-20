namespace DirNav;

public class DirNav
{
    public bool Recurse { get; set; }
    private readonly HashSet<string> _skipList;
    private readonly HashSet<string> _patterns =
        new(StringComparer.OrdinalIgnoreCase);
    private int _fileCount;
    private int _dirCount;

    public Action<string>? DirHandler  { get; set; }
    public Action<string>? FileHandler { get; set; }
    public int FileCount => _fileCount;
    public int DirCount  => _dirCount;

    public DirNav(bool recurse = true)
    {
        Recurse   = recurse;
        _skipList = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            // C#/.NET
            "bin", "obj",
            // Rust
            "target",
            // C++
            "build", "out",
            // Python
            "__pycache__", ".venv", "venv", "dist",
            // common VCS / IDE metadata
            ".git", ".vs", ".idea",
            // archives
            "archive",
        };
    }

    public void AddPattern(string ext) => _patterns.Add(ext.TrimStart('.'));
    public void AddSkip(string name)   => _skipList.Add(name);

    public bool Visit(string root)
    {
        if (!Directory.Exists(root)) return false;
        _fileCount = 0;
        _dirCount  = 0;
        VisitImpl(root);
        return true;
    }

    private void VisitImpl(string dir)
    {
        _dirCount++;
        DirHandler?.Invoke(Normalize(dir));

        try
        {
            foreach (string file in Directory.EnumerateFiles(dir))
            {
                if (ExtensionMatches(file))
                {
                    _fileCount++;
                    FileHandler?.Invoke(Path.GetFileName(file));
                }
            }

            if (Recurse)
            {
                foreach (string sub in Directory.EnumerateDirectories(dir))
                {
                    string name = Path.GetFileName(sub);
                    if (!_skipList.Contains(name))
                        VisitImpl(sub);
                }
            }
        }
        catch (IOException) { }
        catch (UnauthorizedAccessException) { }
    }

    private bool ExtensionMatches(string file)
    {
        if (_patterns.Count == 0) return true;
        string ext = Path.GetExtension(file).TrimStart('.');
        return _patterns.Contains(ext);
    }

    private static string Normalize(string path) => path.Replace('\\', '/');
}
