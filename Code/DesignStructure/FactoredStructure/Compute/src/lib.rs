/////////////////////////////////////////////////////////////
// FactoredStructure::Compute::lib.rs                      //
//   - Input attempts to read File to string & count lines //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

use std::fs::*;
use file_utils::read_file_to_string;

#[derive(Debug)]
pub struct Compute {
  lines: usize,
}
impl Compute {
  pub fn new() -> Compute {
    Compute { lines: 0 }
  }
  /*-- read file, count lines and save count --*/
  pub fn do_compute(&mut self, name: &str, mut file: File) {
    let rslt = read_file_to_string(&mut file);
    if let Ok(contents) = rslt {
      self.lines = 1;
      for ch in contents.chars() {
        if ch == '\n' {
          self.lines += 1;
        }
      }
    } else {
      print!("\n  couldn't open {:?}", name);
    }
  }
  /*-- return saved line count --*/
  pub fn lines(&self) -> usize {
    self.lines
  }
}
#[cfg(test)]
mod tests {
    use super::*;
    use file_utils::{write_string_to_file, open_file_for_read};

    #[test]
    fn read_and_compute() {
        write_string_to_file("test1", "test1.txt")
          .expect("Failed to write test file");
        let file = open_file_for_read("test1.txt")
          .expect("Failed to open test file for read");

        let mut comp = Compute::new();
        comp.do_compute("test1.txt", file);
        assert_eq!(comp.lines(), 1);
    }
}
