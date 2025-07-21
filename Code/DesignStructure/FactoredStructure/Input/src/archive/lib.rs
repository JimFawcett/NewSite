/////////////////////////////////////////////////////////////
// FactoredStructure::Input::lib.rs                        //
//   - Input attempts to open named file and return File   //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////

use std::fs::*;
use file_utils::open_file_for_read;

#[allow(dead_code)]
#[derive(Debug)]
pub struct Input {
  name: String,
}
impl Input {
  pub fn new() -> Input {
    Input {
      name: String::new(),
    }
  }
  pub fn do_input(&mut self, name: &str) -> Option<File> {
    let rslt = open_file_for_read(name);
    if let Ok(file) = rslt {
      return Some(file);
    } else {
      print!("\n  can't open file {:?}", name);
      return None;
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use file_utils::{write_string_to_file, read_file_to_string};

  #[test]
  fn test1() {
    /* test set up */
    let rslt = write_string_to_file("test1", "test1.txt");
    if let Err(_err) = rslt {
      assert!(true);
    }
    let file = open_file_for_read("test1.txt");
    assert!(file.is_ok());
 
    /* run test */
    let mut inp = Input::new();
    let rslt = inp.do_input("test1.txt");
    if let None = rslt {
      assert!(false);
    }
    else {
      let txt_result = read_file_to_string(&mut rslt.unwrap());
      if let Err(ref _err) = txt_result {
        assert!(false);
      }
      assert_eq!(txt_result.unwrap(), "test1");
    }
  }
}
