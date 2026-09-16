// Dirnav.cs - traversal, admission, matching, and emission per Spec_CSharp_TextFinder_Dirnav.md

using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using CSharp_TextFinder_Cmdline;

namespace CSharp_TextFinder_Dirnav;

public sealed class Dirnav<TOutput> where TOutput : IOutput
{
    // §7: the number Spec_TextFinder.md §3.3 fixes.
    private const long SizeLimit = 10_485_760;

    private static readonly char[] Separators = { '/', '\\' };

    // §7: Encoding.UTF8 substitutes U+FFFD and reports nothing, so every file would pass
    // the UTF-8 test. This encoding throws instead.
    private static readonly UTF8Encoding StrictUtf8 =
        new(encoderShouldEmitUTF8Identifier: false, throwOnInvalidBytes: true);

    private readonly TOutput _sink;
    private readonly IReadOnlyList<string> _skips;
    private readonly ProgramCommands _commands;
    private readonly Regex _expression;
    private readonly bool _pathLineOnly;

    // §8.1: never reset between roots.
    private long _files;
    private long _directories;

    // §6: a .NET assembly is built once and runs on both platforms, so the platform test
    // is made at run time where C++ and Rust make it at compile time.
    private readonly StringComparison _nameComparison =
        OperatingSystem.IsWindows() ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;

    // §4: RegexParseException propagates; CSharp_TextFinder_Entry catches that type and
    // writes the §5.2 diagnostic. RegexOptions.None, per §4.
    public Dirnav(TOutput output, IReadOnlyList<string> skips, ProgramCommands commands)
    {
        _sink = output;
        _skips = skips;
        _commands = commands;
        _expression = new Regex(commands.RegexText, RegexOptions.None);
        _pathLineOnly = commands.RegexText == "."
                        && !commands.LineNumbers
                        && !commands.MatchedLine;
    }

    // §5 rule 1: the root's kind comes from File.GetAttributes, which does not follow a link.
    public void Search(string root)
    {
        string display = Normalize(root);

        if (!TryAttributes(root, out FileAttributes attributes))
        {
            Announce("cannot open", display);
            return;
        }

        if ((attributes & FileAttributes.ReparsePoint) != 0)
        {
            Announce("cannot open", display);
        }
        else if ((attributes & FileAttributes.Directory) != 0)
        {
            Walk(root, display);
        }
        else if (Selected(LastComponent(display)))
        {
            Examine(root, display);
        }
    }

    // §8.1: the run summary of Spec_TextFinder.md §3.6, written once after the last root.
    public void EmitRunSummary()
    {
        _sink.Output(string.Format(
            CultureInfo.InvariantCulture,
            "accessed {0} files, {1} directories",
            _files,
            _directories));
    }

    // §5 rule 2: one level, lazily, in the order the platform yields.
    private void Walk(string directory, string display)
    {
        ++_directories;   // §8.1: counted before enumeration, so one that fails is counted too
        string prefix = display == "." ? string.Empty : display;

        IEnumerator<string> entries;
        try
        {
            entries = Directory.EnumerateFileSystemEntries(directory).GetEnumerator();
        }
        catch (Exception e) when (IsAccessFailure(e))
        {
            Announce("cannot open", display);
            return;
        }

        using (entries)
        {
            while (true)
            {
                // §5 rule 7: a directory that becomes unreadable part way through is
                // announced rather than silently truncated, so MoveNext is guarded too.
                try
                {
                    if (!entries.MoveNext()) break;
                }
                catch (Exception e) when (IsAccessFailure(e))
                {
                    Announce("cannot open", display);
                    return;
                }

                string entry = entries.Current;
                string name = LastComponent(entry);
                string child = Join(prefix, name);

                if (!TryAttributes(entry, out FileAttributes attributes))
                {
                    Announce("cannot open", child);
                    continue;
                }

                // §5 rule 5: tested first, and passed over without a word.
                if ((attributes & FileAttributes.ReparsePoint) != 0) continue;

                if ((attributes & FileAttributes.Directory) != 0)
                {
                    if (_commands.Recurse && !Skipped(name)) Walk(entry, child);
                }
                else if (Selected(name))
                {
                    Examine(entry, child);
                }
            }
        }
    }

    // §7: size from metadata, then the NUL and UTF-8 tests over the bytes.
    private void Examine(string path, string display)
    {
        ++_files;   // §8.1: reached only after the /p test, ahead of every later outcome

        long length;
        try
        {
            length = new FileInfo(path).Length;
        }
        catch (Exception e) when (IsAccessFailure(e))
        {
            Announce("cannot open", display);
            return;
        }

        if (length > SizeLimit)
        {
            Announce("too large", display);
            return;
        }

        // §7: the no-content case of Spec_TextFinder.md §3.3. The file is never opened.
        if (_pathLineOnly)
        {
            if (length > 0) _sink.Output(display);
            return;
        }

        byte[] bytes;
        try
        {
            bytes = File.ReadAllBytes(path);
        }
        catch (Exception e) when (IsAccessFailure(e))
        {
            Announce("cannot open", display);
            return;
        }

        if (Array.IndexOf(bytes, (byte)0) >= 0)
        {
            FileAnnouncement("skipped", display);
            return;
        }

        string text;
        try
        {
            text = StrictUtf8.GetString(bytes);
        }
        catch (DecoderFallbackException)
        {
            FileAnnouncement("skipped", display);
            return;
        }

        // §7: stripped after the admission tests, so its three bytes counted toward both.
        if (text.Length > 0 && text[0] == (char)0xFEFF) text = text[1..];

        bool details = _commands.LineNumbers || _commands.MatchedLine;
        bool pathWritten = false;
        int number = 0;

        // §7: TextReader.ReadLine already implements §3.3's three terminators and its
        // unterminated final run, so this library writes no splitter of its own.
        using var reader = new StringReader(text);
        while (reader.ReadLine() is { } line)
        {
            ++number;
            if (!_expression.IsMatch(line)) continue;

            if (!pathWritten)
            {
                _sink.Output(display);
                pathWritten = true;
            }

            // §8 rule 2: with neither /n nor /L the first match settles the file.
            if (!details) return;

            _sink.Output(Detail(number, line));
        }

        if (!pathWritten) FileAnnouncement("searched", display);
    }

    // §8: two spaces of indent, then the fields /n and /L select.
    private string Detail(int number, string line)
    {
        var text = new StringBuilder("  ");

        if (_commands.LineNumbers)
        {
            text.Append(number.ToString(CultureInfo.InvariantCulture));
            if (_commands.MatchedLine) text.Append(" - ");
        }

        if (_commands.MatchedLine) text.Append(line);

        return text.ToString();
    }

    // §6: the extension is the text after the last dot in the name, dot-files included.
    private bool Selected(string name)
    {
        if (_commands.Extensions.Count == 0) return true;

        int dot = name.LastIndexOf('.');
        if (dot < 0) return false;

        string extension = name[(dot + 1)..];
        foreach (string candidate in _commands.Extensions)
        {
            if (string.Equals(candidate, extension, _nameComparison)) return true;
        }

        return false;
    }

    // §5 rule 4: the same comparison the extension test uses, since §3.2 and §5 fix one.
    private bool Skipped(string name)
    {
        foreach (string skip in _skips)
        {
            if (string.Equals(skip, name, _nameComparison)) return true;
        }

        return false;
    }

    private void Announce(string kind, string path) => _sink.Output(kind + " " + path);

    private void FileAnnouncement(string kind, string path)
    {
        if (!_commands.SuppressOnNoMatch) Announce(kind, path);
    }

    private static bool TryAttributes(string path, out FileAttributes attributes)
    {
        try
        {
            attributes = File.GetAttributes(path);
            return true;
        }
        catch (Exception e) when (IsAccessFailure(e))
        {
            attributes = default;
            return false;
        }
    }

    // §5 rule 7: the three the filesystem calls of this library document.
    private static bool IsAccessFailure(Exception e) =>
        e is IOException or UnauthorizedAccessException or ArgumentException;

    // §8: Spec_TextFinder.md §3.4 renders every path with / on every platform, the
    // root's own text included. Path.Combine would join with the platform separator.
    private static string Normalize(string text) => text.Replace('\\', '/');

    private static string Join(string prefix, string name)
    {
        if (prefix.Length == 0) return name;
        return prefix.EndsWith('/') ? prefix + name : prefix + "/" + name;
    }

    private static string LastComponent(string path)
    {
        int cut = path.LastIndexOfAny(Separators);
        return cut < 0 ? path : path[(cut + 1)..];
    }
}
