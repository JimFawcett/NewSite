/////////////////////////////////////////////////////////////
// TypeErasureDataFlowStructure::Output::lib.rs            //
//   - Sends results to console                            //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

use compute::Output;

#[derive(Debug)]
pub struct OutputImpl {}
impl Output for OutputImpl {
  fn new() -> OutputImpl {
    OutputImpl {}
  }
  fn do_output(&self, name: &str, lines: usize) {
    print!("\n  file {:?}: {:?} lines\n", name, lines);
  }
}
#[cfg(test)]
mod tests {
  use super::*;

  /// `new()` + `Debug` should yield the type name.
  #[test]
  fn new_and_debug() {
    let out = OutputImpl::new();
    // The derived Debug for an empty struct prints exactly "OutputImpl"
    assert_eq!(format!("{:?}", out), "OutputImpl");
  }

  /// `do_output()` returns unit and never panics.
  #[test]
  fn do_output_returns_unit() {
    let out = OutputImpl::new();
    // We don’t capture stdout here; we just ensure it runs successfully and returns ()
    let ret = out.do_output("example.rs", 123);
    assert_eq!(ret, ());
  }
}
