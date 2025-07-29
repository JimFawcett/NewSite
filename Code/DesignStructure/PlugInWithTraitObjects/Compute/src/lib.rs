/////////////////////////////////////////////////////////////
// PlugInWithTraitObjects::Compute::lib.rs                 //
//   - Attempts to read opened file to string, count lines //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    - creates instance of Output
    - attempts to read file to string and count its lines
    - sends results to Output
*/
use file_utils::read_file_to_string;
use input::Compute;
use std::fs::File;
// use output::console_output as OutputTrait;  // downstream abstraction from output crate

/// The trait you expect from any Output plugin.
pub trait Output {
  fn do_output(&self, name: &str, lines: usize);
}

/// Your ComputeImpl just holds a boxed Output.
pub struct ComputeImpl {
  lines: usize,
  out: Box<dyn Output>,
}

impl ComputeImpl {
  /// `out` is any implementor of OutputTrait.
  pub fn new(out: Box<dyn Output>) -> Self {
    ComputeImpl { lines: 0, out }
  }
}

impl Compute for ComputeImpl {
  fn do_compute(&mut self, name: &str, mut file: File) {
    match read_file_to_string(&mut file) {
      Ok(contents) => {
        // count lines
        let mut count = if contents.is_empty() { 0 } else { 1 };
        count += contents.chars().filter(|&c| c == '\n').count();
        self.lines = count;
        self.out.do_output(name, count);
      }
      Err(e) => eprintln!("\ncompute failed to read {:?}: {}\n", name, e),
    }
  }
  fn lines(&self) -> usize {
    self.lines
  }
}

// Re‑export Compute trait under its old name if you wish:
pub use input::Compute as ComputeTrait;

#[cfg(test)]
mod tests {
  use super::*; // brings in ComputeImpl, Output, Compute
  use std::cell::RefCell;
  use std::fs::File;
  use std::io::Write;
  use std::rc::Rc;
  use tempfile::NamedTempFile;

  /// A stub Output that records the last (name, lines) it was asked to output.
  struct StubOutput {
    record: Rc<RefCell<Option<(String, usize)>>>,
  }

  impl StubOutput {
    fn new(record: Rc<RefCell<Option<(String, usize)>>>) -> Self {
      StubOutput { record }
    }
  }

  impl Output for StubOutput {
    fn do_output(&self, name: &str, lines: usize) {
      *self.record.borrow_mut() = Some((name.to_string(), lines));
    }
  }

  /// Write `contents` to a temp file and reopen it for reading from the start.
  fn make_file(contents: &str) -> File {
    let mut tmp = NamedTempFile::new().expect("create temp file");
    write!(tmp, "{}", contents).expect("write temp file");
    tmp.flush().expect("flush temp file");
    tmp.reopen().expect("reopen temp file")
  }

  #[test]
  fn empty_file_emits_zero_and_reports_zero() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubOutput::new(Rc::clone(&record));
    let mut comp = ComputeImpl::new(Box::new(stub));

    let file = make_file("");
    comp.do_compute("empty.txt", file);

    assert_eq!(comp.lines(), 0);
    assert_eq!(*record.borrow(), Some(("empty.txt".to_string(), 0)));
  }

  #[test]
  fn single_line_emits_one_and_reports_one() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubOutput::new(Rc::clone(&record));
    let mut comp = ComputeImpl::new(Box::new(stub));

    let file = make_file("just one line");
    comp.do_compute("single.txt", file);

    assert_eq!(comp.lines(), 1);
    assert_eq!(*record.borrow(), Some(("single.txt".to_string(), 1)));
  }

  #[test]
  fn multiple_lines_counted_correctly() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubOutput::new(Rc::clone(&record));
    let mut comp = ComputeImpl::new(Box::new(stub));

    let file = make_file("a\nb\nc");
    comp.do_compute("multi.txt", file);

    assert_eq!(comp.lines(), 3);
    assert_eq!(*record.borrow(), Some(("multi.txt".to_string(), 3)));
  }

  #[test]
  fn trailing_newline_counts_empty_line() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubOutput::new(Rc::clone(&record));
    let mut comp = ComputeImpl::new(Box::new(stub));

    let file = make_file("x\ny\n");
    comp.do_compute("trail.txt", file);

    assert_eq!(comp.lines(), 3);
    assert_eq!(*record.borrow(), Some(("trail.txt".to_string(), 3)));
  }
}
