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
use std::fs::*;

// mod file_utilities;
use file_utils::open_file_for_read;

pub trait Compute {
  fn new() -> Self;
  fn do_compute(&mut self, name: &str, file: File);
  fn lines(&self) -> usize;
}

#[derive(Debug)]
pub struct Input<T: Compute> {
  name: String,
  compute: T,
}
impl<T: Compute> Input<T> {
  pub fn new() -> Input<T> {
    Input {
      name: String::new(),
      compute: T::new(),
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
    use tempfile::NamedTempFile;
    use std::io::Write;

    /// Helper to create a temp file with arbitrary contents
    /// and return its filesystem path.
    fn make_path(contents: &str) -> String {
        let mut tmp = NamedTempFile::new().expect("create temp file");
        write!(tmp, "{}", contents).expect("write to temp file");
        tmp.flush().expect("flush");
        let path = tmp.into_temp_path();
        let s = path.to_str().unwrap().to_string();
        // Keep the file around for the duration of the test suite
        path.keep().unwrap();
        s
    }

    #[test]
    fn missing_file_returns_zero() {
        let mut inp = Input::new();
        let lines = inp.do_input("definitely_not_a_file.txt");
        assert_eq!(lines, 0, "should return 0 when the file can't be opened");
    }

    #[test]
    fn existing_file_invokes_compute() {
        // we don't assert an exact count here—just that it
        // recognized the file and returned >0 for nonempty contents.
        let path = make_path("anything");
        let mut inp = Input::new();
        let lines = inp.do_input(&path);
        assert!(lines > 0, "should return a positive count for an existing file");
    }
}
