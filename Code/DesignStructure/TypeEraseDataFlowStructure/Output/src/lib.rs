/////////////////////////////////////////////////////////////
// TypeErasureDataFlowStructure::Output::lib.rs            //
//   - Sends results to console                            //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

// use std::fs::File;

// output/src/lib.rs
use compute::Output as ComputeOutput; // rename to avoid conflict

/// Concrete Output implementation.
#[derive(Debug)]
pub struct OutputImpl;

impl OutputImpl {
  pub fn new() -> Self {
    OutputImpl
  }
  pub fn do_output(&self, name: &str, lines: usize) {
    println!("{} => {} lines", name, lines);
  }
}
impl Default for OutputImpl {
  fn default() -> Self {
    Self::new()
  }
}

// Hook the Compute::Output trait from the compute crate to this impl:
impl ComputeOutput for OutputImpl {
  fn do_output(&self, name: &str, lines: usize) {
    self.do_output(name, lines)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use compute::Output as ComputeOutput;

  #[test]
  fn new_creates_instance_and_debugs() {
    let out = OutputImpl::new();
    // Debug must print the struct name:
    assert_eq!(format!("{:?}", out), "OutputImpl");
  }

  #[test]
  fn do_output_does_not_panic() {
    let out = OutputImpl::new();
    // Simply ensure calling do_output is safe
    out.do_output("some_file.rs", 7);
  }

  #[test]
  fn trait_object_dispatches_correctly() {
    // Box it as the compute::Output trait
    let out_obj: Box<dyn ComputeOutput> = Box::new(OutputImpl::new());
    // Must still work through the trait
    out_obj.do_output("foo.rs", 13);
  }
}
