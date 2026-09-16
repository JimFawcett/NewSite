//! rust_textfinder_output - the process's one stdout sink.
//! Implements Spec_Rust_TextFinder_Output.md.

use rust_textfinder_dirnav::Output;
use std::cell::Cell;
use std::io::{BufWriter, Stdout, Write};

#[cfg(test)]
mod unit_tests;

thread_local! {
    static SINK_TAKEN: Cell<bool> = Cell::new(false);
}

pub struct StdoutSink {
    writer: BufWriter<Stdout>,
    failed: bool,
}

impl StdoutSink {
    pub fn new() -> Option<Self> {
        let available = SINK_TAKEN.with(|taken| {
            let free = !taken.get();
            taken.set(true);
            free
        });
        if available {
            Some(StdoutSink { writer: BufWriter::new(std::io::stdout()), failed: false })
        } else {
            None
        }
    }

    /// Writes the text verbatim. The help text and option listing arrive already terminated.
    pub fn write_text(&mut self, text: &str) {
        self.emit(text, false);
    }

    pub fn flush(&mut self) {
        if self.failed {
            return;
        }
        if self.writer.flush().is_err() {
            self.fail();
        }
    }

    fn emit(&mut self, text: &str, terminate: bool) {
        if self.failed {
            return;
        }
        let mut wrote = self.writer.write_all(text.as_bytes());
        if wrote.is_ok() && terminate {
            wrote = self.writer.write_all(b"\n");
        }
        if wrote.is_err() {
            self.fail();
        }
    }

    /// Spec section 6: flush what is buffered, then write one notice, then discard everything after.
    fn fail(&mut self) {
        self.failed = true;
        let _ = self.writer.flush();
        let _ = writeln!(std::io::stderr(), "output failed");
    }
}

impl Output for StdoutSink {
    fn output(&mut self, text: &str) {
        self.emit(text, true);
    }
}

impl Drop for StdoutSink {
    fn drop(&mut self) {
        if !self.failed && self.writer.flush().is_err() {
            self.failed = true;
            let _ = writeln!(std::io::stderr(), "output failed");
        }
        SINK_TAKEN.with(|taken| taken.set(false));
    }
}
