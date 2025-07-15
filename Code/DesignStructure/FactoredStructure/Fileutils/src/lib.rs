/////////////////////////////////////////////////////////////
// FactoredStructure::Fileutils::file_utilities.rs         //
//   - Input attempts to open named file and return File   //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  This code may be useful for other programs so it is
  factored into a module here.
*/
#![allow(dead_code)]

use std::fs::*;
use std::io::{Error, ErrorKind, Read, Write};

pub fn open_file_for_read(file_name: &str) -> Result<File, std::io::Error> {
  let rfile = OpenOptions::new().read(true).open(file_name);
  rfile
}

pub fn read_file_to_string(f: &mut File) -> Result<String, std::io::Error> {
  let mut contents = String::new();
  let bytes_rslt = f.read_to_string(&mut contents);
  if bytes_rslt.is_ok() {
    Ok(contents)
  } else {
    Err(Error::new(ErrorKind::Other, "read error"))
  }
}

pub fn open_file_for_write(file_name: &str) -> Result<File, std::io::Error> {
  let wfile = OpenOptions::new().write(true).truncate(true).open(file_name);
  wfile
}

pub fn write_string_to_file_handle(s:&str, mut f:std::fs::File) -> std::io::Result<()> {
  f.write_all(s.as_bytes())?;
  f.flush()?;
  Ok(())
}

pub fn write_string_to_file(s:&str, file_name:&str) -> std::io::Result<()> {
  std::fs::write(file_name, s)?;
  Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn file_name_write_read() {

      let file_name = "temp.txt";
      let test_string = "test string";

      let res = open_file_for_write(file_name);
      if let Err(err) = res {
        eprintln!("open for write failed:\n{}", err);
        return;
      }
      let _wfile = res.unwrap();

      let _ = write_string_to_file(test_string, file_name);

      let ropen = open_file_for_read(file_name);
      if let Err(err) = ropen {
        eprintln!("open for read failed:\n{}", err);
        return;
      }
      let mut rfile = ropen.unwrap();

      let r_string_res = read_file_to_string(&mut rfile);
      if let Err(err) = r_string_res {
        eprintln!("read to string failed:\n{}", err);
        return;
      }
      let r_string = r_string_res.unwrap();

      assert_eq!(r_string, test_string);
    }

    #[test]
    fn file_handle_write_read() {

      let file_name = "temp.txt";
      let test_string = "test string";

      let res = open_file_for_write(file_name);
      if let Err(err) = res {
        eprintln!("open for write failed:\n{}", err);
        return;
      }
      let wfile = res.unwrap();

      let wres = write_string_to_file_handle(test_string, wfile);
      if let Err(err) = wres {
        eprintln!("write string failed:\n{}", err);
        return;
      }

      let ropen = open_file_for_read(file_name);
      if let Err(err) = ropen {
        eprintln!("open for read failed:\n{}", err);
        return;
      }
      let mut rfile = ropen.unwrap();

      let r_string_res = read_file_to_string(&mut rfile);
      if let Err(err) = r_string_res {
        eprintln!("read to string failed:\n{}", err);
        return;
      }
      let r_string = r_string_res.unwrap();

      assert_eq!(r_string, test_string);
    }

}
