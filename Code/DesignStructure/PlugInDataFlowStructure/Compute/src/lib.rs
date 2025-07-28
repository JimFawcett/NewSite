/////////////////////////////////////////////////////////////
// PlugInDataFlowStructure::Compute::lib.rs                //
//   - Attempts to read opened file to string, count lines //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    - creates instance of Output
    - attempts to read file to string and count its lines
    - sends results to Output
*/
use input::Compute;
use std::fs::*;

/*---------------------------------------------------------
  PlugIns require use of Trait Objects
-----------------------------------------------------------
  Trait objects cannot:
    - have functions that return Self
    - have generic functions
*/
pub trait Output {
  // fn new() -> Self;
  fn do_output(&self, name: &str, lines: usize);
}

mod file_utilities;
use file_utilities::read_file_to_string;

pub struct ComputeImpl {
  lines: usize,
  out: Option<Box<dyn Output>>, // will hold trait object
}
impl Compute for ComputeImpl {
  fn new() -> ComputeImpl {
    ComputeImpl {
      lines: 0,
      out: None,
    }
  }
  fn do_compute(&mut self, name: &str, mut file: File) {
    let rslt = read_file_to_string(&mut file);
    if let Ok(contents) = rslt {
      if contents.len() == 0 {
        self.lines = 0;
      }
      else {
        self.lines = 1;
      }
      for ch in contents.chars() {
        if ch == '\n' {
          self.lines += 1;
        }
      }
      if let Some(plug) = &self.out {
        plug.do_output(name, self.lines);
      }
    } else {
      print!("\n  could not read {:?}", name);
    }
  }
  fn lines(&self) -> usize {
    self.lines
  }
}

impl ComputeImpl {
  pub fn set_output(&mut self, out: Box<dyn Output>) {
    let _ = &self.out.replace(out);
  }
}
#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
