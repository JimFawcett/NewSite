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
use file_utils::read_file_to_string;
use input::Compute;
use std::fs::*;

pub trait Output {
  fn new() -> Self;
  fn do_output(&self, name: &str, lines: usize);
}

#[derive(Debug)]
pub struct ComputeImpl<Out: Output> {
  lines: usize,
  out: Out,
}
impl<Out: Output> Compute for ComputeImpl<Out> {
  fn new() -> ComputeImpl<Out> {
    ComputeImpl {
      lines: 0,
      out: Out::new(),
    }
  }
  fn do_compute(&mut self, name: &str, mut file: File) {
    let rslt = read_file_to_string(&mut file);
    if let Ok(contents) = rslt {
      if contents.is_empty() {
        self.lines = 0;
      } else {
        self.lines = 1;
      }
      for ch in contents.chars() {
        if ch == '\n' {
          self.lines += 1;
        }
      }
      self.out.do_output(name, self.lines);
    } else {
      print!("\n  could not read {:?}", name);
    }
  }
  fn lines(&self) -> usize {
    self.lines
  }
}
#[cfg(test)]
mod tests {
  use super::*;
  use std::cell::RefCell;
  use std::fs::File;
  use std::io::Write;
  use std::rc::Rc;
  use tempfile::NamedTempFile;

  /// A stub Output that records the last (name, lines) it was given.
  struct StubOutput {
    last: Rc<RefCell<Option<(String, usize)>>>,
  }

  impl Output for StubOutput {
    fn new() -> Self {
      // We never call this in tests; we construct StubOutput by hand.
      unreachable!("StubOutput::new should not be used in tests");
    }

    fn do_output(&self, name: &str, lines: usize) {
      *self.last.borrow_mut() = Some((name.to_string(), lines));
    }
  }

  /// Write `contents` into a temp file and reopen it so reads start at the beginning.
  fn make_file(contents: &str) -> File {
    let mut tmp = NamedTempFile::new().expect("create temp file");
    write!(tmp, "{}", contents).expect("write to temp file");
    tmp.flush().expect("flush temp file");
    tmp.reopen().expect("reopen temp file")
  }

  #[test]
  fn empty_file_emits_zero_and_reports_zero() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubOutput {
      last: Rc::clone(&record),
    };
    // Construct ComputeImpl directly, bypassing ComputeImpl::new()
    let mut comp = ComputeImpl {
      lines: 0,
      out: stub,
    };

    let file = make_file("");
    comp.do_compute("empty", file);

    // internal count
    assert_eq!(comp.lines(), 0);
    // output called with ("empty", 0)
    assert_eq!(*record.borrow(), Some(("empty".to_string(), 0)));
  }

  #[test]
  fn no_newline_emits_one_and_reports_one() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubOutput {
      last: Rc::clone(&record),
    };
    let mut comp = ComputeImpl {
      lines: 0,
      out: stub,
    };

    let file = make_file("single line");
    comp.do_compute("single", file);

    assert_eq!(comp.lines(), 1);
    assert_eq!(*record.borrow(), Some(("single".to_string(), 1)));
  }

  #[test]
  fn multiple_lines_counted_correctly() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubOutput {
      last: Rc::clone(&record),
    };
    let mut comp = ComputeImpl {
      lines: 0,
      out: stub,
    };

    let file = make_file("l1\nl2\nl3");
    comp.do_compute("multi", file);

    assert_eq!(comp.lines(), 3);
    assert_eq!(*record.borrow(), Some(("multi".to_string(), 3)));
  }

  #[test]
  fn trailing_newline_adds_empty_line() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubOutput {
      last: Rc::clone(&record),
    };
    let mut comp = ComputeImpl {
      lines: 0,
      out: stub,
    };

    let file = make_file("a\nb\n");
    comp.do_compute("trail", file);

    assert_eq!(comp.lines(), 3);
    assert_eq!(*record.borrow(), Some(("trail".to_string(), 3)));
  }
}
