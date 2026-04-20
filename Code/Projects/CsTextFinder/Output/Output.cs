using System.Text;
using System.Text.RegularExpressions;

namespace Output;

public class Output
{
    private readonly bool _hide;
    private bool   _dirPrinted;
    private int    _matchCount;
    private string _currentDir = string.Empty;
    private Regex  _regex = new(".");

    public int MatchCount => _matchCount;

    public Output(bool hide = true) => _hide = hide;

    public void SetRegex(string pattern)
    {
        try   { _regex = new Regex(pattern); }
        catch (ArgumentException) { _regex = new Regex("."); }
    }

    public void OnDir(string dirPath)
    {
        _currentDir = dirPath;
        _dirPrinted = false;
        if (!_hide)
        {
            Console.WriteLine($"\n  {_currentDir}");
            _dirPrinted = true;
        }
    }

    public void OnFile(string fileName)
    {
        string fullPath = $"{_currentDir}/{fileName}";
        if (!Find(fullPath)) return;

        if (_hide && !_dirPrinted)
        {
            Console.WriteLine($"\n  {_currentDir}");
            _dirPrinted = true;
        }
        Console.WriteLine($"      {fileName}");
        _matchCount++;
    }

    private bool Find(string filePath)
    {
        string? contents = ReadFile(filePath);
        return contents is not null && _regex.IsMatch(contents);
    }

    private static string? ReadFile(string filePath)
    {
        try { return File.ReadAllText(filePath); }
        catch (UnauthorizedAccessException) { return null; }  // won't succeed on retry
        catch (IOException) { }                               // retry as Latin-1 for binary content
        try { return Encoding.Latin1.GetString(File.ReadAllBytes(filePath)); }
        catch (Exception) { return null; }
    }
}
