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
use file_utils::open_file_for_read;
use std::fs::*;

pub trait Compute {
  fn new() -> Self;  // factory function
  fn do_compute(&mut self, name: &str, file: File);
  fn lines(&self) -> usize;
}

#[derive(Debug)]
pub struct Input<T: Compute> {
  name: String,
  compute: T,
}
impl<T: Compute> Default for Input<T> {
  fn default() -> Self {
    Self::new()
  }
}
impl<T: Compute> Input<T> {
  pub fn new() -> Input<T> {
    Input {
      name: String::new(),
      compute: T::new(),    // factory function
    }
  }
  pub fn do_input(&mut self, name: &str) -> usize {
    let mut lines: usize = 0;
    self.name = name.to_string();
    let rslt = open_file_for_read(name);
    if let Ok(file) = rslt {
      self.compute.do_compute(name, file);
      lines = self.compute.lines();
    } else {
      print!("\n  can't open file {:?}", name);
    }
    lines
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use std::io::Write;
  use tempfile::NamedTempFile;

  /// A Compute stub: tracks if do_compute() was invoked,
  /// and always reports 42 lines.
  struct StubCompute {
    called: bool,
    return_lines: usize,
  }

  impl Compute for StubCompute {
    fn new() -> Self {
      StubCompute {
        called: false,
        return_lines: 42,
      }
    }

    fn do_compute(&mut self, _name: &str, _file: File) {
      self.called = true;
    }

    fn lines(&self) -> usize {
      self.return_lines
    }
  }

  #[test]
  fn missing_file_returns_zero_and_skips_compute() {
    let mut inp: Input<StubCompute> = Input::new();
    let count = inp.do_input("definitely_not_a_file.txt");
    assert_eq!(count, 0, "should return 0 when file open fails");
    assert!(!inp.compute.called, "do_compute must not be called");
  }

  #[test]
  fn existing_file_invokes_compute_and_returns_stub_value() {
    // create a real temp file so open_file_for_read succeeds
    let mut tmp = NamedTempFile::new().expect("create temp file");
    write!(tmp, "ignored contents").expect("write to temp file");
    tmp.flush().expect("flush temp file");
    let path = tmp.path().to_str().unwrap();

    let mut inp: Input<StubCompute> = Input::new();
    let count = inp.do_input(path);

    assert_eq!(count, 42, "should return the stub's return_lines value");
    assert!(
      inp.compute.called,
      "do_compute must be called for existing file"
    );
  }
}
