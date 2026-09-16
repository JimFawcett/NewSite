// IOutput.cs - the seam between traversal and the sink, per CSharp_TextFinder_Structure.md

namespace CSharp_TextFinder_Dirnav;

// Declared here and not in the Output library, which is what puts CSharp_TextFinder_Output
// downstream of this project in the reference chain.
public interface IOutput
{
    void Output(string text);
}
