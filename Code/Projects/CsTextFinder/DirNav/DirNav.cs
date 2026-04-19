namespace DirNav;

public class DirNav
{
    private bool _recurse;
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
        _recurse  = recurse;
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
        };
    }

    public void AddPattern(string ext) => _patterns.Add(ext.TrimStart('.'));
    public void AddSkip(string name)   => _skipList.Add(name);
    public void SetRecurse(bool r)     => _recurse = r;

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
        DirHandler?.Invoke(Normalise(dir));

        try
        {
            foreach (string file in Directory.GetFiles(dir))
            {
                if (ExtensionMatches(file))
                {
                    _fileCount++;
                    FileHandler?.Invoke(Path.GetFileName(file));
                }
            }

            if (_recurse)
            {
                foreach (string sub in Directory.GetDirectories(dir))
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

    private static string Normalise(string path) => path.Replace('\\', '/');
}
