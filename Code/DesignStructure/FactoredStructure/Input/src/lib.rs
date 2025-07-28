/////////////////////////////////////////////////////////////
// FactoredStructure::Input::lib.rs                        //
//   - Input attempts to open named file and return File   //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

use file_utils::open_file_for_read;
use std::fs::*;

#[allow(dead_code)]
#[derive(Debug)]
pub struct Input {
  // no data members
}
impl Default for Input {
  fn default() -> Self {
    Self::new()
  }
}
impl Input {
  pub fn new() -> Input {
    Input {}
  }
  pub fn do_input(&mut self, name: &str) -> Option<File> {
    let rslt = open_file_for_read(name);
    if let Ok(file) = rslt {
      Some(file)
    } else {
      print!("\n  can't open file {:?}", name);
      None
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use file_utils::{read_file_to_string, write_string_to_file};

  // fn test1() has been refactored by Perplexity AI from my
  // original test code.  Now more consise.

  #[test]
  fn test1() {
    // Test setup: create test file
    write_string_to_file("test1", "test1.txt").expect("Failed to write test file");

    // Check: file is readable
    let _file = open_file_for_read("test1.txt").expect("File should be readable");

    // Test Input::do_input opens file successfully
    let mut inp = Input::new();
    let file_option = inp.do_input("test1.txt");
    let mut file = file_option.expect("Input::do_input should return Some(file)");

    // The file content is as expected
    let content = read_file_to_string(&mut file).expect("Should read file content");
    assert_eq!(content, "test1");
  }
}
