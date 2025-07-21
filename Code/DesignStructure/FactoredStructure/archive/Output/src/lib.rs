/////////////////////////////////////////////////////////////
// FactoredStructure::Output::lib.rs                       //
//   - Output displays line count                          //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

#[derive(Debug)]
pub struct Output {}
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
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
