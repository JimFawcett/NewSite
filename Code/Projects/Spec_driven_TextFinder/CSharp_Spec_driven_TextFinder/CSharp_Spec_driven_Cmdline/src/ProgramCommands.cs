// ProgramCommands.cs - the resolved option set, per Spec_CSharp_TextFinder_Cmdline.md

namespace CSharp_TextFinder_Cmdline;

// §4: the property initializers are the sole authority in code for the defaults of
// Spec_TextFinder.md §5, so a newly constructed instance equals the result of parsing
// an empty argument array. The four false properties carry no initializer: default(bool)
// is already false, and writing it would suggest a choice where the others show one.
public sealed class ProgramCommands
{
    public List<string> RootPaths { get; set; } = new() { "." };  // /P
    public List<string> Extensions { get; set; } = new();         // /p
    public string RegexText { get; set; } = ".";                  // /r
    public bool Recurse { get; set; } = true;                     // /s
    public bool SuppressOnNoMatch { get; set; } = true;           // /h
    public bool Verbose { get; set; }                             // /v
    public bool Help { get; set; }                                // /H
    public bool LineNumbers { get; set; }                         // /n
    public bool MatchedLine { get; set; }                         // /L
}
