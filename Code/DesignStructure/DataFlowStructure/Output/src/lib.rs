/////////////////////////////////////////////////////////////
// DataFlowStructure::Output::lib.rs                       //
//   - Sends results to console                            //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

#[derive(Debug)]
pub struct Output {}
impl Default for Output {
  fn default() -> Self {
    Self::new()
  }
}
impl Output {
  pub fn new() -> Output {
    Output {}
  }
  pub fn do_output(&self, name: &str, lines: usize) {
    print!("\n  file {:?} has {} lines of code", name, lines);
  }
}
#[cfg(test)]
mod tests {
  use super::*;

  /// `new()` + `Debug` should yield the struct name.
  #[test]
  fn new_and_debug() {
    let out = Output::new();
    // Debug derive on `struct Output {}` prints just "Output"
    assert_eq!(format!("{:?}", out), "Output");
  }

  /// `do_output()` returns `()`, and never panics.
  #[test]
  fn do_output_returns_unit() {
    let out = Output::new();
    let result = out.do_output("my_file.rs", 42);
    // The only thing do_output returns is the unit value.
    assert_eq!(result, ());
  }
}
