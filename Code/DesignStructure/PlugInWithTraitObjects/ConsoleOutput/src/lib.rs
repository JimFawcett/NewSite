/////////////////////////////////////////////////////////////
// PlugInWithTraitObjects::ConsoleOutput::lib.rs           //
//   - Sends results to console                            //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

use compute::Output as ComputeOutput;

/// A trivial console printer
pub struct ConsoleOutput;

impl ConsoleOutput {
  pub fn new() -> Self {
    ConsoleOutput
  }
}

impl Default for ConsoleOutput {
  fn default() -> ConsoleOutput {
    Self::new()
  }
}

impl ComputeOutput for ConsoleOutput {
  fn do_output(&self, name: &str, lines: usize) {
    println!("\n{}: {} lines", name, lines);
  }
}
#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
