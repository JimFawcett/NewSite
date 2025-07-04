/////////////////////////////////////////////////////////////
// basic_structure::main.rs                                //
//                                                         //
// Jim Fawcett, https://JimFawcett.github.io, 07 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  BasicStructure
  - Demonstrates simplest form of structure: everything, e.g.,
    input, computation, and output, in one package.
  - It counts the number of lines in a file specified on the
    command line.
  - Simple so we can focus on code structure.
*/
#![allow(dead_code)]
use std::fs::*;
use std::io::{Error, ErrorKind, Read};

/*-- part of input processing --*/
fn open_file_for_read(file_name: &str) -> Result<File, std::io::Error> {
  let rfile = OpenOptions::new().read(true).open(file_name);
  rfile
}
/*-- part of compute processing --*/
fn read_file_to_string(f: &mut File) -> Result<String, std::io::Error> {
  let mut contents = String::new();
  let bytes_rslt = f.read_to_string(&mut contents);
  if bytes_rslt.is_ok() {
    Ok(contents)
  } else {
    Err(Error::new(ErrorKind::Other, "read error"))
  }
}

#[derive(Debug)]
struct Basic {
  name: String,
  file: Option<File>,
  lines: usize,
}
impl Basic {
  fn new() -> Basic {
    Basic {
      name: String::new(),
      file: None,
      lines: 0,
    }
  }
  /*-----------------------------------------------------
    Input processing
  */
  fn parse_cmdln() -> Vec<String> {
    let cl_iter = std::env::args();
    let args: Vec<String> = cl_iter.skip(1).collect();
    args
  }
  fn show_cmdln(args: &[String]) {
    if args.is_empty() {
      return;
    }
    print!("\n  {}", args[0]);
    for arg in &args[1..] {
      print!(", {}", arg);
    }
  }
  fn input(&mut self, name: &str) {
    self.name = name.to_string();
    let rslt = open_file_for_read(name);
    if let Ok(file) = rslt {
      self.file = Option::Some(file);
    } else {
      print!("\n  can't open file {:?}", name);
    }
  }
  /*-----------------------------------------------------
    Compute processing
  */
  fn compute(&mut self) {
    if let Some(file) = &mut self.file {
      let rslt = read_file_to_string(file);
      if let Ok(contents) = rslt {
        self.lines = 1;
        for ch in contents.chars() {
          if ch == '\n' {
            self.lines += 1;
          }
        }
      }
    }
  }
  /*-----------------------------------------------------
    Output processing
  */
  fn output(&self) {
    print!("\n  {:4} lines in {:?}", self.lines, self.name);
  }
}
/*---------------------------------------------------------
  Executive processing
*/
fn main() {
  print!("\n  -- counting lines in files --\n");

  let mut basic = Basic::new();
  let args = Basic::parse_cmdln();

  for name in args {
    basic.input(&name);
    basic.compute();
    basic.output();
  }

  println!("\n\n  That's all Folks!\n\n");
}
