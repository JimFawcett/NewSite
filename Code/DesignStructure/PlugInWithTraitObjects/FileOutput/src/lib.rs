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
    use super::*;
    use compute::Output as ComputeOutput;
    use tempfile::NamedTempFile;
    use std::fs;
    use std::io::Read;

    /// Helper to read the entire contents of a file into a String.
    fn read_file_to_string(path: &str) -> String {
        let mut s = String::new();
        let mut f = fs::File::open(path).expect("failed to open output file for reading");
        f.read_to_string(&mut s).expect("failed to read output file");
        s
    }

    #[test]
    fn new_creates_file_and_do_output_writes_expected_line() {
        // Create a temporary file and get its path
        let tmp = NamedTempFile::new().expect("failed to create temp file");
        let path = tmp.path().to_str().unwrap();

        // Instantiate FileOutput on that path
        let fo = FileOutput::new(path).expect("FileOutput::new failed");

        // Write a test line
        fo.do_output("test.rs", 7);

        // Read back the file contents
        let contents = read_file_to_string(path);

        // Expect exactly one line in the format: "name -> lines\n"
        assert_eq!(contents, "test.rs -> 7 lines\n");
    }

    #[test]
    fn multiple_do_output_appends_lines() {
        let tmp = NamedTempFile::new().expect("failed to create temp file");
        let path = tmp.path().to_str().unwrap();

        let fo = FileOutput::new(path).expect("FileOutput::new failed");

        fo.do_output("a.rs", 1);
        fo.do_output("b.rs", 2);
        fo.do_output("c.rs", 3);

        let contents = read_file_to_string(path);
        let expected = "\
a.rs -> 1 lines
b.rs -> 2 lines
c.rs -> 3 lines
";
        assert_eq!(contents, expected);
    }
}
