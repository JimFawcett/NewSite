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
  use super::*;
  use compute::Output as ComputeOutput;
  use std::any::{Any, TypeId};

  /// new() and default() both produce the same ConsoleOutput type.
  #[test]
  fn new_and_default_same_type() {
    let a = ConsoleOutput::new();
    let b: ConsoleOutput = ConsoleOutput::default();

    // `type_id()` comes from the Any trait, so import it.
    assert_eq!(TypeId::of::<ConsoleOutput>(), a.type_id());
    assert_eq!(TypeId::of::<ConsoleOutput>(), b.type_id());
  }

  /// do_output() returns the unit value and never panics.
  #[test]
  fn do_output_returns_unit() {
    let out = ConsoleOutput::new();
    let ret = out.do_output("example.rs", 7);
    assert_eq!(ret, ());
  }

  /// It still works via a Box<dyn ComputeOutput> trait object.
  #[test]
  fn trait_object_dispatches() {
    let obj: Box<dyn ComputeOutput> = Box::new(ConsoleOutput::new());
    let ret = obj.do_output("foo.rs", 13);
    assert_eq!(ret, ());
  }
}
