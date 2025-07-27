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
#![allow(non_snake_case)]

use std::fs::*;
use file_utils::open_file_for_read;

pub trait Compute {
  fn new() -> Self;
  fn do_compute(&mut self, name: &str, file: File);
  fn lines(&self) -> usize;
}

#[derive(Debug)]
pub struct InputImpl<C: Compute> {
  name: String,
  Compute: C,
}
impl<C: Compute> InputImpl<C> {
  pub fn new() -> InputImpl<C> {
    InputImpl {
      name: String::new(),
      Compute: C::new(),
    }
  }
  pub fn do_input(&mut self, name: &str) -> usize {
    let mut lines: usize = 0;
    self.name = name.to_string();
    let rslt = open_file_for_read(name);
    if let Ok(file) = rslt {
      self.Compute.do_compute(name, file);
      lines = self.Compute.lines();
    } else {
      print!("\n  can't open file {:?}", name);
    }
    lines
  }
}

#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
