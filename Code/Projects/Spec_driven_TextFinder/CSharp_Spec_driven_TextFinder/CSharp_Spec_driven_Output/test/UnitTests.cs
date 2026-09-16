// UnitTests.cs - unit suite for CSharp_TextFinder_Output, exercising Spec_CSharp_TextFinder_Output.md
//
// The sink owns the process's only writer over standard output, which is the one thing
// this suite cannot redirect. It therefore checks the properties that do not depend on
// reading the stream back: the one-sink rule, the release of that right on disposal, and
// the absence of any thrown or reported failure. What reaches stdout is checked by the
// integration suite, which runs the built executable and captures it.

using CSharp_TextFinder_Dirnav;
using CSharp_TextFinder_Output;

namespace CSharp_TextFinder_Output_UnitTest;

internal sealed class Check
{
    private int _failures;
    private int _total;

    public void That(bool ok, string name) => Record(ok, name);

    private void Record(bool ok, string name)
    {
        ++_total;
        if (!ok) ++_failures;
        Console.Error.WriteLine((ok ? "  PASS  " : "  FAIL  ") + name);
    }

    public int Report()
    {
        Console.Error.WriteLine($"  {_total - _failures} of {_total} passed");
        Console.Error.WriteLine(_failures == 0 ? "PASS" : "FAIL");
        return _failures;
    }
}

internal static class UnitTests
{
    private static int Main()
    {
        var check = new Check();

        // The suite's own report goes to stderr, since the type under test writes to
        // stdout and interleaving the two would make neither readable.
        Console.Error.WriteLine("CSharp_TextFinder_Output unit tests");

        // --- §4: the one-sink rule ---
        var first = new StdoutSink();
        bool refused = false;
        try
        {
            _ = new StdoutSink();
        }
        catch (InvalidOperationException)
        {
            refused = true;
        }

        check.That(refused, "a second sink is refused while the first lives");
        first.Dispose();

        // --- §7: disposal releases the right ---
        bool madeAgain;
        using (var second = new StdoutSink())
        {
            madeAgain = true;
            check.That(second is IOutput, "the sink is the IOutput implementation Dirnav binds to");

            // §4: both write methods, and neither reports nor throws.
            second.WriteText("verbatim text, already terminated\n");
            second.Output("one line, terminator added by the sink");
            second.Output(string.Empty);
            second.Flush();
            check.That(true, "writing through both methods reports nothing and throws nothing");
        }

        check.That(madeAgain, "a sink disposed releases the right to make one");

        // --- §7: disposal is idempotent ---
        var third = new StdoutSink();
        third.Dispose();
        third.Dispose();
        check.That(true, "disposing twice is safe");

        // --- §4: the interface is the only thing Dirnav knows about this type ---
        using (var fourth = new StdoutSink())
        {
            Emit(fourth);
            check.That(true, "the interface method is reached through a generic constraint");
        }

        // §4: writing after disposal is discarded rather than throwing.
        var fifth = new StdoutSink();
        fifth.Dispose();
        fifth.Output("discarded");
        fifth.Flush();
        check.That(true, "a write after disposal is discarded and reports nothing");

        return check.Report();
    }

    private static void Emit<TOutput>(TOutput sink) where TOutput : IOutput =>
        sink.Output("reached through the constraint");
}
