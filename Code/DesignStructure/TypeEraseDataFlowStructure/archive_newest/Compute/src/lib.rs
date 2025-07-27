/////////////////////////////////////////////////////////////
// TypeErasureDataFlowStructure::Compute::lib.rs           //
//   - Attempts to read opened file to string, count lines //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    - creates instance of Output
    - attempts to read file to string and count its lines
    - sends results to Output
*/
// compute/src/lib.rs
use file_utils::read_file_to_string;
use input::Compute;
use std::fs::File; // import the trait from input

/// Down‑stream abstraction: Compute only needs to know about "Output".
pub trait Output {
  fn do_output(&self, name: &str, lines: usize);
}

/// Concrete Compute implementation, type‑erased over any Output.
pub struct ComputeImpl {
  lines: usize,
  out: Box<dyn Output>,
}

impl ComputeImpl {
  /// Caller wires in any Output‑impl.
  pub fn new(out: Box<dyn Output>) -> Self {
    ComputeImpl { lines: 0, out }
  }
}

impl Compute for ComputeImpl {
  fn do_compute(&mut self, name: &str, mut file: File) {
    match read_file_to_string(&mut file) {
      Ok(contents) => {
        // count lines in contents
        let mut count = if contents.is_empty() { 0 } else { 1 };
        count += contents.chars().filter(|&c| c == '\n').count();
        self.lines = count;
        self.out.do_output(name, count);
      }
      Err(_) => eprintln!("could not read {:?}", name),
    }
  }

  fn lines(&self) -> usize {
    self.lines
  }
}
#[cfg(test)]
mod tests {
  use super::*; // brings in ComputeImpl and Output
  use std::cell::RefCell;
  use std::fs::File;
  use std::io::Write;
  use std::rc::Rc;
  use tempfile::NamedTempFile;

  /// A test‐output that records the last (name, lines) it was asked to print.
  struct TestOutput {
    record: Rc<RefCell<Option<(String, usize)>>>,
  }

  impl TestOutput {
    fn new(record: Rc<RefCell<Option<(String, usize)>>>) -> Self {
      TestOutput { record }
    }
  }

  impl Output for TestOutput {
    fn do_output(&self, name: &str, lines: usize) {
      *self.record.borrow_mut() = Some((name.to_string(), lines));
    }
  }

  /// Helper: write `contents` into a temp file, then reopen so reading starts at 0.
  fn make_file(contents: &str) -> File {
    let mut tmp = NamedTempFile::new().expect("create temp file");
    write!(tmp, "{}", contents).expect("write temp file");
    tmp.flush().expect("flush temp file");
    tmp.reopen().expect("reopen temp file")
  }

  #[test]
  fn empty_file_emits_zero() {
    let record = Rc::new(RefCell::new(None));
    let out = TestOutput::new(Rc::clone(&record));
    let mut comp = ComputeImpl::new(Box::new(out));

    let file = make_file("");
    comp.do_compute("empty", file);

    assert_eq!(comp.lines(), 0);
    assert_eq!(*record.borrow(), Some(("empty".to_string(), 0)));
  }

  #[test]
  fn single_line_emits_one() {
    let record = Rc::new(RefCell::new(None));
    let out = TestOutput::new(Rc::clone(&record));
    let mut comp = ComputeImpl::new(Box::new(out));

    let file = make_file("just one line");
    comp.do_compute("single", file);

    assert_eq!(comp.lines(), 1);
    assert_eq!(*record.borrow(), Some(("single".to_string(), 1)));
  }

  #[test]
  fn multiple_lines_counted_correctly() {
    let record = Rc::new(RefCell::new(None));
    let out = TestOutput::new(Rc::clone(&record));
    let mut comp = ComputeImpl::new(Box::new(out));

    let file = make_file("a\nb\nc");
    comp.do_compute("multi", file);

    assert_eq!(comp.lines(), 3);
    assert_eq!(*record.borrow(), Some(("multi".to_string(), 3)));
  }

  #[test]
  fn trailing_newline_adds_empty_line() {
    let record = Rc::new(RefCell::new(None));
    let out = TestOutput::new(Rc::clone(&record));
    let mut comp = ComputeImpl::new(Box::new(out));

    let file = make_file("x\ny\n");
    comp.do_compute("trail", file);

    assert_eq!(comp.lines(), 3);
    assert_eq!(*record.borrow(), Some(("trail".to_string(), 3)));
  }
}
