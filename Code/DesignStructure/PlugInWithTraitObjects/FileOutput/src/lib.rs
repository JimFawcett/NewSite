/////////////////////////////////////////////////////////////
// PlugInWithTraitObjects::FileOutput::lib.rs              //
//   - Sends results to console                            //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

use compute::Output as ComputeOutput;
use std::fs::File;
use std::io::Write;

/// Writes each output line into a file.
pub struct FileOutput {
  file: File,
}

impl FileOutput {
  pub fn new(path: &str) -> std::io::Result<Self> {
    let f = File::create(path)?;
    Ok(FileOutput { file: f })
  }
}

impl ComputeOutput for FileOutput {
  fn do_output(&self, name: &str, lines: usize) {
    writeln!(&self.file, "{} -> {} lines", name, lines).expect("failed to write to output file");
  }
}
#[cfg(test)]
mod tests {
  #[test]
  fn it_works() {
    assert_eq!(2 + 2, 4);
  }
}
