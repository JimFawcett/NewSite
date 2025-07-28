/////////////////////////////////////////////////////////////
// FactoredStructure::Output::lib.rs                       //
//   - Output displays line count                          //
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
    print!("\n  {:4} lines in file {:?}", lines, name);
  }
}
#[cfg(test)]
mod tests {
  use super::*;

  /// new() + Debug should produce the struct name
  #[test]
  fn new_and_debug() {
    let out = Output::new();
    // Debug derive on `struct Output {}` prints just "Output"
    assert_eq!(format!("{:?}", out), "Output");
  }

  /// do_output() should return () and never panic
  #[test]
  fn do_output_does_not_panic() {
    let out = Output::new();
    // We're not capturing stdout here (that requires an external crate
    // or reworking the API), but at least we ensure it runs cleanly.
    let unit = out.do_output("foo.rs", 7);
    let () = unit; // type‐check that we got the unit value back
  }
}
