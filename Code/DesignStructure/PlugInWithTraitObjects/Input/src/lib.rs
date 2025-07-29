/////////////////////////////////////////////////////////////
// PlugInWithTraitObjects::Input::lib.rs                   //
//   - Attempts to return line count from file             //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    - Input owns and instantiates Compute.
    - It attempts to open file and pass to Compute for
      processing.
    - Returns line count if successful
*/
use file_utils::open_file_for_read;
use std::fs::File;

/// The trait for anything that can count lines.
pub trait Compute {
  fn do_compute(&mut self, name: &str, file: File);
  fn lines(&self) -> usize;
}

/// Your InputImpl just needs a boxed Compute.
pub struct InputImpl {
  compute: Box<dyn Compute>,
}

impl InputImpl {
  /// `compute` is any implementor of the Compute trait.
  pub fn new(compute: Box<dyn Compute>) -> Self {
    InputImpl { compute }
  }

  /// Opens `name`, hands it to compute, returns the line count.
  pub fn do_input(&mut self, name: &str) -> usize {
    if let Ok(f) = open_file_for_read(name) {
      self.compute.do_compute(name, f);
      self.compute.lines()
    } else {
      eprintln!("could not open {:?}", name);
      0
    }
  }
}
#[cfg(test)]
mod tests {
  use super::*;
  use std::cell::RefCell;
  use std::io::Write;
  use std::rc::Rc;
  use tempfile::NamedTempFile;

  /// Stub Compute that records the last filename it saw
  /// and returns a fixed line count.
  struct StubCompute {
    last_name: Rc<RefCell<Option<String>>>,
    return_lines: usize,
  }

  impl StubCompute {
    fn new(record: Rc<RefCell<Option<String>>>, return_lines: usize) -> Self {
      StubCompute {
        last_name: record,
        return_lines,
      }
    }
  }

  impl Compute for StubCompute {
    fn do_compute(&mut self, name: &str, _file: File) {
      *self.last_name.borrow_mut() = Some(name.to_string());
    }
    fn lines(&self) -> usize {
      self.return_lines
    }
  }

  #[test]
  fn missing_file_returns_zero_and_skips_compute() {
    let record = Rc::new(RefCell::new(None));
    let stub = StubCompute::new(Rc::clone(&record), 99);
    let mut inp = InputImpl::new(Box::new(stub));

    let count = inp.do_input("definitely_not_a_file.txt");
    assert_eq!(count, 0, "should return 0 for missing file");
    assert!(record.borrow().is_none(), "do_compute should not be called");
  }

  #[test]
  fn existing_file_calls_compute_and_returns_stub_value() {
    // prepare a real file so open_file_for_read succeeds
    let mut tmp = NamedTempFile::new().expect("create temp file");
    write!(tmp, "ignored").expect("write to temp file");
    tmp.flush().expect("flush temp file");
    let path = tmp.path().to_str().unwrap().to_string();

    let record = Rc::new(RefCell::new(None));
    let stub = StubCompute::new(Rc::clone(&record), 7);
    let mut inp = InputImpl::new(Box::new(stub));

    let count = inp.do_input(&path);
    assert_eq!(count, 7, "should return the stub's line count");
    assert_eq!(
      record.borrow().as_ref(),
      Some(&path),
      "do_compute should be called with the file name"
    );
  }
}
