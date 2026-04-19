namespace Output;

using System.Text;
using System.Text.RegularExpressions;

public class Output
{
    private bool   _hide;
    private bool   _dirPrinted;
    private int    _matchCount;
    private string _currentDir = string.Empty;
    private Regex  _regex = new(".");

    public int MatchCount => _matchCount;

    public Output(bool hide = true) => _hide = hide;

    public void SetHide(bool hide) => _hide = hide;

    public void SetRegex(string pattern)
    {
        try   { _regex = new Regex(pattern); }
        catch { _regex = new Regex("."); }
    }

    public void OnDir(string dirPath)
    {
        _currentDir = dirPath;
        _dirPrinted = false;
        if (!_hide)
        {
            Console.WriteLine($"\n  {_currentDir}");
            Console.Out.Flush();
            _dirPrinted = true;
        }
    }

    public void OnFile(string fileName)
    {
        string fullPath = _currentDir + "/" + fileName;
        if (!Find(fullPath)) return;

        if (_hide && !_dirPrinted)
        {
            Console.WriteLine($"\n  {_currentDir}");
            _dirPrinted = true;
        }
        Console.WriteLine($"      {fileName}");
        Console.Out.Flush();
        _matchCount++;
    }

    private bool Find(string filePath)
    {
        try
        {
            string contents;
            try   { contents = File.ReadAllText(filePath); }
            catch { contents = Encoding.Latin1.GetString(File.ReadAllBytes(filePath)); }
            return _regex.IsMatch(contents);
        }
        catch { return false; }
    }
}
