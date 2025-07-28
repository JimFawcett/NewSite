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
pub struct Basic {
  name: String,
  file: Option<File>,
  lines: usize,
}

impl Default for Basic {
  fn default() -> Self {
    Self::new()
  }
}
impl Basic {
  pub fn new() -> Basic {
    Basic {
      name: String::new(),
      file: None,
      lines: 0,
    }
  }
  /*-----------------------------------------------------
    Input processing
  */
  pub fn parse_cmdln() -> Vec<String> {
    let cl_iter = std::env::args();
    let args: Vec<String> = cl_iter.skip(1).collect();
    args
  }
  pub fn show_cmdln(args: &[String]) {
    if args.is_empty() {
      return;
    }
    print!("\n  {}", args[0]);
    for arg in &args[1..] {
      print!(", {}", arg);
    }
  }
  /*-------------------------------------------------------
    Input processing
  */
  pub fn input(&mut self, name: &str) {
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
  pub fn compute(&mut self) {
    if let Some(file) = &mut self.file {
      let rslt = read_file_to_string(file);
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
      }
    }
  }
  /*-----------------------------------------------------
    Output processing
  */
  pub fn output(&self) {
    print!("\n  {:4} lines in {:?}", self.lines, self.name);
  }
}
/*---------------------------------------------------------
  Executive processing
    cargo run -q <filename1>, <filename2>, ... -q
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
