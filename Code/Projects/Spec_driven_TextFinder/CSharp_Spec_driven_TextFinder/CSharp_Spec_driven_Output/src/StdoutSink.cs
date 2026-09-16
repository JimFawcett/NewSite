// StdoutSink.cs - the process's one stdout writer, per Spec_CSharp_TextFinder_Output.md

using System.Text;
using CSharp_TextFinder_Dirnav;

namespace CSharp_TextFinder_Output;

// §4: sealed, so no subclass can override the emission order Spec_TextFinder.md §3.4 fixes.
public sealed class StdoutSink : IOutput, IDisposable
{
    // §4: the one-sink rule. A static field needs no lock here: one process holds one
    // standard output handle, and this is read and written on one thread before any
    // other could exist. Rust needs a thread_local Cell for the same rule because a
    // plain static there must be Sync; C# places no such bound on a static field.
    private static bool _taken;

    private readonly StreamWriter _writer;
    private bool _failed;
    private bool _disposed;

    public StdoutSink()
    {
        if (_taken)
        {
            throw new InvalidOperationException("a StdoutSink already exists");
        }

        // §5: Console.WriteLine terminates with Environment.NewLine, CRLF on Windows, so
        // this writer is built over the standard output stream with NewLine fixed to LF.
        // Encoding.UTF8 would emit a byte-order mark; this encoding does not.
        Stream standardOutput = Console.OpenStandardOutput();
        _writer = new StreamWriter(standardOutput, new UTF8Encoding(encoderShouldEmitUTF8Identifier: false))
        {
            AutoFlush = false,
            NewLine = "\n",
        };

        _taken = true;
    }

    // §4: the interface method. The string, then the single LF §3.4 fixes.
    public void Output(string text) => Emit(text, terminate: true);

    // §4: declared on the class and not on IOutput, so Dirnav cannot emit unterminated text.
    public void WriteText(string text) => Emit(text, terminate: false);

    // §7: for the one case that needs the buffer drained before the process ends.
    public void Flush()
    {
        if (_failed || _disposed) return;

        try
        {
            _writer.Flush();
        }
        catch (Exception e) when (IsWriteFailure(e))
        {
            Fail();
        }
    }

    // §7: disposal is the whole of the flush mechanism. C# has no scope-exit destructor,
    // and a finalizer may never run, so the caller's using statement carries the guarantee.
    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;

        if (!_failed)
        {
            try
            {
                _writer.Flush();
            }
            catch (Exception e) when (IsWriteFailure(e))
            {
                // §6: the final flush is the write most likely to be the first that fails.
                _failed = true;
                Console.Error.Write("output failed\n");
            }
        }

        try
        {
            _writer.Dispose();
        }
        catch (Exception e) when (IsWriteFailure(e))
        {
            // Dispose flushes again; the notice above already reported the failure.
        }

        _taken = false;
    }

    private void Emit(string text, bool terminate)
    {
        if (_failed || _disposed) return;

        try
        {
            if (terminate)
            {
                _writer.WriteLine(text);
            }
            else
            {
                _writer.Write(text);
            }
        }
        catch (Exception e) when (IsWriteFailure(e))
        {
            Fail();
        }
    }

    // §6: flush first, then one notice, then discard everything after. The flush is
    // best-effort, since whatever broke the write may break it too.
    private void Fail()
    {
        _failed = true;

        try
        {
            _writer.Flush();
        }
        catch (Exception e) when (IsWriteFailure(e))
        {
        }

        Console.Error.Write("output failed\n");
    }

    // §6: the two the framework's stream writes document. A broader catch would hide a
    // defect in this library behind a notice about output.
    private static bool IsWriteFailure(Exception e) =>
        e is IOException or ObjectDisposedException;
}
