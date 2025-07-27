/////////////////////////////////////////////////////////////
// TypeErasureDataFlowStructure::Input::lib.rs             //
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
// input/src/lib.rs
use file_utils::open_file_for_read;
use std::fs::File;

/// Down‑stream abstraction: Input only needs to know about "Compute" behavior.
pub trait Compute {
  fn do_compute(&mut self, name: &str, file: File);
  fn lines(&self) -> usize;
}

/// The Input implementation only “owns” a Box<dyn Compute>.
pub struct InputImpl {
  name: String,
  compute: Box<dyn Compute>,
}

impl InputImpl {
  /// Caller wires in any Compute-impl with factory function new.
  pub fn new(compute: Box<dyn Compute>) -> Self {
    InputImpl {
      name: String::new(),
      compute,
    }
  }

  /// Opens the file, hands it to compute, and returns the line count.
  pub fn do_input(&mut self, name: &str) -> usize {
    self.name = name.to_string();
    if let Ok(file) = open_file_for_read(name) {
      self.compute.do_compute(name, file);
      self.compute.lines()
    } else {
      eprintln!("can't open {:?}", name);
      0
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*; // brings in Compute and InputImpl
  use std::cell::RefCell;
  use std::fs::File;
  use std::io::Write;
  use std::rc::Rc;
  use tempfile::NamedTempFile;

  /// A test‐stub Compute that records the last name it was handed,
  /// and returns a preconfigured `desired` line count.
  struct TestCompute {
    last: Rc<RefCell<Option<String>>>,
    desired: usize,
  }

  impl Compute for TestCompute {
    fn do_compute(&mut self, name: &str, _file: File) {
      *self.last.borrow_mut() = Some(name.to_string());
    }
    fn lines(&self) -> usize {
      self.desired
    }
  }

  #[test]
  fn missing_file_returns_zero_and_compute_not_called() {
    let last = Rc::new(RefCell::new(None));
    let stub = TestCompute {
      last: Rc::clone(&last),
      desired: 42,
    };
    let mut inp = InputImpl::new(Box::new(stub));

    let count = inp.do_input("definitely_not_a_file.rs");
    assert_eq!(count, 0, "should return 0 for missing file");
    assert!(last.borrow().is_none(), "compute should not be called");
  }

  #[test]
  fn existing_file_calls_compute_and_returns_desired() {
    let last = Rc::new(RefCell::new(None));
    let stub = TestCompute {
      last: Rc::clone(&last),
      desired: 7,
    };
    let mut inp = InputImpl::new(Box::new(stub));

    // create a real temp file so open succeeds
    let mut tmp = NamedTempFile::new().expect("create temp file");
    write!(tmp, "ignored contents").expect("write temp file");
    tmp.flush().expect("flush temp file");
    let path = tmp.path().to_str().unwrap().to_string();

    let count = inp.do_input(&path);
    assert_eq!(count, 7, "should return stub's desired count");

    // verify that compute.do_compute was called with the same path
    assert_eq!(
      last.borrow().as_ref(),
      Some(&path),
      "compute should be called with the file name"
    );
  }
}
