//! Unit suite for rust_textfinder_output, exercising Spec_Rust_TextFinder_Output.md.
//!
//! The sink owns stdout, so these tests check the properties that do not depend on
//! reading the stream back: the one-sink rule, the release of that right on drop, and
//! the absence of any panic or reported failure. What reaches stdout is checked by the
//! integration suite, which runs the built executable and captures it.

use super::*;

fn sink_is_available() -> bool {
    SINK_TAKEN.with(|taken| !taken.get())
}

#[test]
fn a_second_sink_is_refused_while_the_first_lives() {
    assert!(sink_is_available());
    let first = StdoutSink::new();
    assert!(first.is_some());
    assert!(StdoutSink::new().is_none());
    assert!(StdoutSink::new().is_none());
    drop(first);
}

#[test]
fn dropping_a_sink_releases_the_right_to_make_one() {
    assert!(sink_is_available());
    {
        let sink = StdoutSink::new();
        assert!(sink.is_some());
    }
    assert!(sink_is_available());
    let again = StdoutSink::new();
    assert!(again.is_some());
    drop(again);
    assert!(sink_is_available());
}

#[test]
fn writing_through_both_methods_reports_nothing_and_panics_on_nothing() {
    assert!(sink_is_available());
    let mut sink = match StdoutSink::new() {
        Some(sink) => sink,
        None => panic!("the sink must be available to this thread"),
    };
    sink.write_text("verbatim text, already terminated\n");
    sink.output("one line, terminator added by the sink");
    sink.output("");
    sink.flush();
    drop(sink);
    assert!(sink_is_available());
}

#[test]
fn the_sink_is_the_output_trait_implementation_dirnav_binds_to() {
    fn emit<O: Output>(out: &mut O) {
        out.output("reached through the trait");
    }
    assert!(sink_is_available());
    let mut sink = match StdoutSink::new() {
        Some(sink) => sink,
        None => panic!("the sink must be available to this thread"),
    };
    emit(&mut sink);
    drop(sink);
}
