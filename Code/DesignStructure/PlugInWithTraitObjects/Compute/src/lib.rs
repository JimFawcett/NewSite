/////////////////////////////////////////////////////////////
// PlugInWithTraitObjects::Compute::lib.rs                 //
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
use std::fs::File;
// use output::console_output as OutputTrait;  // downstream abstraction from output crate

/// The trait you expect from any Output plugin.
pub trait Output {
  fn do_output(&self, name: &str, lines: usize);
}

/// Your ComputeImpl just holds a boxed Output.
pub struct ComputeImpl {
  lines: usize,
  out: Box<dyn Output>,
}

impl ComputeImpl {
  /// `out` is any implementor of OutputTrait.
  pub fn new(out: Box<dyn Output>) -> Self {
    ComputeImpl { lines: 0, out }
  }
}

impl Compute for ComputeImpl {
  fn do_compute(&mut self, name: &str, mut file: File) {
    match read_file_to_string(&mut file) {
      Ok(contents) => {
        // count lines
        let mut count = if contents.is_empty() { 0 } else { 1 };
        count += contents.chars().filter(|&c| c == '\n').count();
        self.lines = count;
        self.out.do_output(name, count);
      }
      Err(e) => eprintln!("\ncompute failed to read {:?}: {}\n", name, e),
    }
  }
  fn lines(&self) -> usize {
    self.lines
  }
}

// Re‑export Compute trait under its old name if you wish:
pub use input::Compute as ComputeTrait;
#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
