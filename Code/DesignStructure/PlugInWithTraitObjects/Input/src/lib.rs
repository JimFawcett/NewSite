/////////////////////////////////////////////////////////////
// PlugInWithTraitObjects::Input::lib.rs                   //
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
use file_utils::open_file_for_read;
use std::fs::File;

/// The trait for anything that can count lines.
pub trait Compute {
  fn do_compute(&mut self, name: &str, file: File);
  fn lines(&self) -> usize;
}

/// Your InputImpl just needs a boxed Compute.
pub struct InputImpl {
  compute: Box<dyn Compute>,
}

impl InputImpl {
  /// `compute` is any implementor of the Compute trait.
  pub fn new(compute: Box<dyn Compute>) -> Self {
    InputImpl { compute }
  }

  /// Opens `name`, hands it to compute, returns the line count.
  pub fn do_input(&mut self, name: &str) -> usize {
    if let Ok(f) = open_file_for_read(name) {
      self.compute.do_compute(name, f);
      self.compute.lines()
    } else {
      eprintln!("⛔ could not open {:?}", name);
      0
    }
  }
}
#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
