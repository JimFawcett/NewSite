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
#![allow(dead_code)]

use file_utils::read_file_to_string;
use std::fs::*;

pub trait Output {
  fn new() -> Self;
  fn do_output(&self, name: &str, lines: usize);
}

pub trait Compute {
  fn new() -> Self;
  fn do_compute(&mut self, name: &str, file: File);
  fn lines(&self) -> usize;
}

impl<Out: Output> Compute for ComputeImpl<Out> {
    fn new() -> Self {
        ComputeImpl::new()
    }
    fn do_compute(&mut self, name: &str, file: std::fs::File) {
        ComputeImpl::do_compute(self, name, file);
    }
    fn lines(&self) -> usize {
        ComputeImpl::lines(self)
    }
}

impl Output for OutputImpl {
    fn new() -> Self {
        OutputImpl::new()
    }
    fn do_output(&self, name: &str, lines: usize) {
        OutputImpl::do_output(self, name, lines);
    }
}

#[derive(Debug)]
pub struct ComputeImpl<Out: Output> {
  lines: usize,
  out: Out,
}
impl<Out: Output> ComputeImpl<Out> {
  fn new() -> ComputeImpl<Out> {
    ComputeImpl {
      lines: 0,
      out: Out::new(),
    }
  }
  fn do_compute(&mut self, name: &str, mut file: File) {
    let rslt = read_file_to_string(&mut file);
    if let Ok(contents) = rslt {
      self.lines = 1;
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
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
