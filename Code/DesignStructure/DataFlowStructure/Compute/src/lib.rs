/////////////////////////////////////////////////////////////
// DataFlowStructure::Compute::lib.rs                      //
//   - Attempts to read opened file to string, count lines //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    - creates instance of Output
    - attempts to read file to string and count its lines
    - sends results to Output
*/
use output::Output;
use std::fs::*;

use file_utils::read_file_to_string;

#[derive(Debug)]
pub struct Compute {
  lines: usize,
  out: Output,
}
impl Compute {
  pub fn new() -> Compute {
    Compute {
      lines: 0,
      out: Output::new(),
    }
  }
  pub fn do_compute(&mut self, name: &str, mut file: File) {
    let rslt = read_file_to_string(&mut file);
    if let Ok(contents) = rslt {
      if contents.len() == 0 {
        self.lines = 0;
      }
      else {
        self.lines = 1;
      }
      for ch in contents.chars() {
        if ch == '\n' {
          self.lines += 1;
        }
      }
      self.out.do_output(name, self.lines);
    } else {
      print!("\n  could not read {:?}", name);
    }
  }
  pub fn lines(&self) -> usize {
    self.lines
  }
}

/// unit tests generated using ChatGPT 4o

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::NamedTempFile;
    use std::io::{Write};

    /// Helper to write `contents` into a NamedTempFile and
    /// return a fresh File handle opened at the start.
    fn make_file(contents: &str) -> std::fs::File {
        let mut tmp = NamedTempFile::new().expect("failed to create temp file");
        write!(tmp, "{}", contents).expect("failed to write to temp file");
        tmp.flush().expect("failed to flush temp file");
        // Re-open so that the read pointer is at the start
        tmp.reopen().expect("failed to reopen temp file")
    }

    #[test]
    fn empty_file_has_zero_lines() {
        let file = make_file("");
        let mut comp = Compute::new();
        comp.do_compute("empty", file);
        assert_eq!(comp.lines(), 0);
    }

    #[test]
    fn file_without_newlines_has_one_line() {
        let file = make_file("just one line");
        let mut comp = Compute::new();
        comp.do_compute("single", file);
        assert_eq!(comp.lines(), 1);
    }

    #[test]
    fn file_with_multiple_lines_counts_correctly() {
        // Three logical lines separated by two '\n's, no trailing newline
        let file = make_file("line1\nline2\nline3");
        let mut comp = Compute::new();
        comp.do_compute("three", file);
        assert_eq!(comp.lines(), 3);
    }

    #[test]
    fn file_with_trailing_newline_counts_empty_line() {
        // Two content lines + trailing '\n' → counts as 3 lines
        let file = make_file("foo\nbar\n");
        let mut comp = Compute::new();
        comp.do_compute("trailing", file);
        assert_eq!(comp.lines(), 3);
    }
}
