/*-----------------------------------------------
  Demonstrate Basic Rust values and operations
*/
#![allow(dead_code)]
#![allow(clippy::approx_constant)]

use std::fmt::*;

fn main() {
  println!("\nRust Basics");
  integrals();
  floats();
  literal_strings();
  enumerations();
  arrays();
  references();
  tuples();
  structs();
  libtypes();
  usertypes();
}
/*-----------------------------------------------
  integrals: boolean, byte, integer
*/
fn integrals() {

  show_note("integral types");
  
  nl();
  show_op("booleans");
/*---------------------------------------*/
  let b1 = true;
  show_type(&b1, "b1");

  let b2 = false;
  show_type(&b2, "b2");

  nl();
  let g = || println!("  value is true");
  b1.then(g);  // prints because b1 is true
  b2.then(g);  // does nothing because b2 is false

  nl();
  show_op("bytes");
/*-----------------------------------------
  bytes in Rust are just u8 integers
  - we can define an alternate name as here
*/
  type Byte = u8;  /* alternate type name */
  let b:Byte = 0x41;
  show_type(&b, "b");
  println!("  b = 0x{b:x}");

  nl();
  show_op("integers");
/*-----------------------------------------------
  i8, i16, i32, i64, i128, isize - signed
  u8, u16, u32, u64, u128, usize - unsigned
  literals:
  42 decimal, 0x2A hex, 0o52 octal, 
  0b10101 binary, b'A' byte
-----------------------------------------------*/
  let i = 42u8;     /* typed literal */
  show_type(&i, "i");

  let j:i32 = 42;       /* typed variable */
  show_type(&j, "j");

  let k = 42;      /* inferred type */
  show_type(&k, "k");
  
  nl();
  /* types must match exactly or be cast */
  show_op("casting");
  let sum1 = i as i32 + j;
  outln_type(&sum1, "i as i32 + j");

  let sum2 = i + j as u8;
  outln_type(&sum2, "i + j as u8");

  nl();
  show_op("std values");
  println!("  i32::MIN: {}", i32::MIN);
  println!("  i32::MAX: {}", i32::MAX);
}

fn floats() {

  show_note("floating point numbers");

/*-----------------------------------------
  types: f32, f64
  special values: 
    NAN, INFINITY, NEG_INFINITY
  operations:
    +, -, *, /
  functions:
    floor(), ceil(), round(), sin(),
    abs(), sqrt(), powf(), exp(), ln(),
    sin(), cos(), tan(), log()
-----------------------------------------*/  

let d:f32 = 3.1415927;
  show_type(&d, "d");

  let e:f64 = 3.1415927;
  show_type(&e, "e");

  nl();
  let div1 = d/(e as f32);
  outln(&div1, "d/(e as f32)");

  let div2 = (d as f64)/e;
  outln_type(&div2, "(d as f64)/e");
  nl();
  let f1 = 2.5f64;
  outln_type(&f1, "f1");
  let f2: f64 = f1.powf(2.0);
  outln_type(&f2, "f1.powf(2.0)");

}

fn literal_strings() {
  show_note("literal strings");
  /*---------------------------------------------
    &str type represents a reference to const 
    literal strings placed in static memory 
  ---------------------------------------------*/
  let ls = "a literal string"; /* reference to literal string */
  show_type(&ls, "ls");
}

fn enumerations() {
  show_note("enumerations");
  /*---------------------------------------------
    std enumerations:
      Option { Some(v), None, }
      Result { Ok(result), Err(error), }
      Duration { secs: u64, nanos: u32, }
  */
  let ie = Some(42);
  let ne: Option<i32> = None;
  let demo = ne;

  /* handle both cases */
  match demo {
    Some(value) => outln(&value, "value"),
    None => outln(&demo, "demo")
  }
  /* handle has value case, ignore no value case */
  if let Some(value) = ie {
    outln(&value, "value");
  }

  /* custom enumeration */
  #[derive(Debug)]
  enum Trip {
    Planning,
    Going,
    Arrived,
    Coming,
    Done,
  }

  let trip_status = Trip::Planning;
  outln(&trip_status, "trip_status");
}

fn arrays() {

  show_note("arrays of primitives");
  /*---------------------------------------------*/  
  let arr1:[i32; 3] = [1, 2, 3];
    show_type(&arr1, "arr1");
  
    let arr2 = [1i64, 2, 3];
    show_type(&arr2, "arr2");
  
    let arr3 = [1.0, 2.0, 3.0];
    show_type(&arr3, "arr3");
}
fn references() {
    show_note("references");
    /*---------------------------------------------
      - &t is a const pointer to the value t:T
      - &mut t is a reference to a value that may
        be mutated.
      - Rust does not allow shared mutation using
        references. More on that later.
    */
    let mut arr:[i32; 4] = [1, 2, 3, 4];
    outln_type(&arr, "arr");
  
    show_op("let val = arr[1]");
    let val = arr[1];
    outln(&val, "val");
  
    /* take mutable reference */
    show_op("let r1 = &mut arr");
    let r1 = &mut arr;
    outln_type(r1, "r1");
  
    show_op("r1[1] = -2");
    r1[1] = -2;
    outln(r1, "r1");
  
    /* take immutable reference */
    show_op("let r2 = &arr");
    let r2 = &arr;
    outln(r2, "r2");
    outln(&r2[1], "r2[1]");
    /*
      statement below fails to compile:
        outln(r1, "r1");
      not allowed because mutable reference must have 
      exclusive access.
    */    
}

fn tuples() {
  
  show_note("tuples");
/*---------------------------------------*/  
  let mut tup = (42, 3.1415927, [1, 2, 3]);
  show_type(&tup, "tup");
  show_op("tup.1 = 1.2");
  tup.1 = 1.2;  /* access element by position */
  show_type(&tup, "tup");
}

fn structs() {
  show_note("structs");
  /*---------------------------------------------*/  
    #[derive(Debug)]
    struct Demo { i:i32, d:f64, c:char }
    
    /* use Demo */
    let mut s1 = Demo { i:1, d:2.5, c:'z'};
    show_type(&s1, "s1"); 
  
    s1.d = -2.5;  /* access element by name */
    show_op("s1.d = -2.5");
    show_type(&s1, "s1");  
}

/*-- demo collections -------------------------------------
  Demonstrate std::lib collection types, e.g.:
    - String, Vec<T>, VecDeque<T>, HashMap<K, V>
  Other std::lib collection types not covered here:
    - BTreeMap<K,T>, BinaryHeap<T>, LinkedList<T>, 
      HashSet<T>, BTreeSet<T>, Rc<T>, Arc<T>
*/
use std::collections::*;

fn libtypes() {

  show_note("std::lib collection types");

  nl();
  show_op("String");
/*---------------------------------------*/  
  let s1:String = "this is a string".to_string();
  show_type(&s1, "s1");

  show_op("let first = s1.chars().next()");
  let first = s1.chars().next();
  let mut ch = first.unwrap_or(' ');
  show_type(&ch, "ch");

  show_op("let second = s1.chars().nth(1)");
  let second = s1.chars().nth(1);
  ch = second.unwrap_or(' ');
  outln_type(&ch, "ch");
  
  show_op("let s2 = s1.clone()");
  let s2 = s1.clone();
  outln_type(&s2, "s2");
  
  show_op("let s3 = s1 + \" and more\"");
  let s3 = s1 + " and more";
  outln(&s3, "s3");

  nl();
  show_op("Vec<T>");
/*---------------------------------------*/  
  let mut v1:Vec<i32> = vec![1, 2, 3];
  show_type(&v1, "v1");
  
  /* basic Vec<T> operations */
  show_op("v1.push(0)");
  v1.push(0);
  outln(&v1, "v1");

  show_op("v1.insert(0, 42)");
  v1.insert(0, 42);
  outln(&v1, "v1");
  
  show_op("v1.pop()");
  v1.pop();
  outln(&v1, "v1");

  /* using mutable reference */
  show_op("let r = &mut v1[1]; *r = -42;");
  let r = &mut v1[1];
  *r = -42;
  outln(&v1, "v1");

  nl();
  show_op("VecDeque<T>");
/*---------------------------------------*/  
  let mut vd1 = VecDeque::<f64>::new();
  vd1.extend([1.0, 1.5, 2.0]);
  show_type(&vd1, "vd1");

  show_op("vd1.push_front(0.5)");
  vd1.push_front(0.5);
  outln(&vd1, "vd1");
  
  show_op("vd1.pop_back()");
  vd1.pop_back();
  outln(&vd1, "vd1");

  nl();
  show_op("HashMap<K, V>");
/*---------------------------------------*/  
  let mut hm1 = HashMap::<&str, i32>::new();
  hm1.extend(
    [
      ("one", 1), ("two", 2), ("three", 3)
    ]
  );
  show_type(&hm1, "hm1");
  
  show_op("hm1.insert(('zero', 0))");
  hm1.insert("zero", 0);
  outln(&hm1, "hm1");
  
  show_op("hm1.get(\"two\")");
  let mut key = "two";
  let value = hm1.get(key);
  outln(&value, "Some(value)");
  if let Some(val) = value {
    outln(&val, "value");
  }
  else {
    println!("  {key}: invalid key");
  };
  show_op("hm1.get(\"foo\")");
  key = "foo";
  let value = hm1.get(key);
  outln(&value, "Some(value)");
  if let Some(val) = value {
    outln(&val, "value");
  }
  else {
    println!("  {key}: invalid key");
  };

}

fn usertypes() {

  show_note("user-defined types");

  nl();
  show_op("Demo");
/*---------------------------------------*/  

  #[derive(Debug, Clone)]
  pub struct Demo {
    /* pub name provides direct access to data */
    pub name:String,
  }
  impl Demo {
    /* create instance */
    pub fn new() -> Self {
      Self {
        name:"no name".to_string(),
      }
    }
    /* replace instance with modified version */
    pub fn init(self, st:&str) -> Self {
      Demo { name: st.to_string() }
    }
    /* retrieve name, uses method instead of direct access*/
    pub fn get(&self) -> String {
      self.name.clone()
    }
    /* modify name, uses method instead of direct access */
    pub fn set(&mut self, st:&str) {
      self.name = st.to_string();
    }
  }
  
  show_op("let mut d = Demo::new().init(\"Joe\")");
  let mut d = Demo::new().init("Joe");
  show_type(&d, "d");

  /* access through methods doesn't need public data */
  show_op("d.set(\"Frank\")");
  d.set("Frank");
  outln(&d, "d");

  show_op("let name = d.get()");
  let name = d.get();
  outln(&name, "name");

  /* direct access to public data */
  show_op("let d_name = d.name;");
  let d_name = d.name;
  outln(&d_name, "d_name");

  show_op("let d.name = Alexa;");
  d.name = "Alexa".to_string();
  outln(&d, "d");

  nl();
}

/*-- show_type --------------------------------------------
  Shows compiler recognized type and data value
*/
pub fn show_type<T: Debug>(t: &T, nm: &str) {
  let typename = std::any::type_name::<T>();
  print!("  {nm}, {typename}");
  println!(
    "\n  value: {:?}, size: {}",  // smart formatting {:?}
    t, std::mem::size_of::<T>()   // handles both scalars
  );                              // and collections
}
/*---------------------------------------------------------
  show string wrapped with dotted lines above and below 
*/
pub fn show_note(note: &str) {
  print!("\n-------------------------\n");
  print!(" {note}");
  print!("\n-------------------------\n");
}
/*---------------------------------------------------------
  show string wrapped in short lines
*/
pub fn show_op(opt: &str) {
  println!("--- {opt} ---");
}
/*---------------------------------------------------------
  functions compress output expressions
*/
pub fn out<T:Debug>(t: &T, name: &str) {
  print!("  {name} = {t:?}");
}

pub fn outln<T:Debug>(t: &T, name: &str) {
  println!("  {name} = {t:?}");
}

pub fn outln_type<T:Debug>(t: &T, name: &str) {
  let typename = std::any::type_name::<T>();
  println!("  {name} = {t:?}{}", typename);
}

pub fn nl() {
  println!();
}
