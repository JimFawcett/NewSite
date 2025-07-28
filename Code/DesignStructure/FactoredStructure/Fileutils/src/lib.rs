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
  let wfile = OpenOptions::new()
    .write(true)
    .create(true)
    .truncate(true)
    .open(file_name);
  wfile
}

pub fn write_string_to_file_handle(s: &str, mut f: std::fs::File) -> std::io::Result<()> {
  f.write_all(s.as_bytes())?;
  f.flush()?;
  Ok(())
}

pub fn write_string_to_file(s: &str, file_name: &str) -> std::io::Result<()> {
  std::fs::write(file_name, s)?;
  Ok(())
}

#[cfg(test)]
mod tests {
  use super::*;
  use tempfile::NamedTempFile;

  /// Test the `write_string_to_file` + `open_file_for_read` + `read_file_to_string` path.
  #[test]
  fn write_and_read_via_filename() {
    // create a temp file path but don't write to it yet
    let tmp = NamedTempFile::new().expect("create temp file");
    let path = tmp.path().to_str().unwrap();

    let test_string = "hello filename!";
    // write via filename API
    write_string_to_file(test_string, path).expect("write_string_to_file failed");

    // now read it back
    let mut f = open_file_for_read(path).expect("open_file_for_read failed");
    let contents = read_file_to_string(&mut f).expect("read_file_to_string failed");

    assert_eq!(contents, test_string);
  }

  /// Test the `open_file_for_write` + `write_string_to_file_handle` + read path.
  #[test]
  fn write_and_read_via_handle() {
    let tmp = NamedTempFile::new().expect("create temp file");
    let path = tmp.path().to_str().unwrap();

    let test_string = "hello handle!";
    // open for write (creates & truncates), then write via handle
    let wfile = open_file_for_write(path).expect("open_file_for_write failed");
    write_string_to_file_handle(test_string, wfile).expect("write_string_to_file_handle failed");

    // read it back
    let mut f2 = open_file_for_read(path).expect("open_file_for_read failed");
    let contents2 = read_file_to_string(&mut f2).expect("read_file_to_string failed");

    assert_eq!(contents2, test_string);
  }
}
