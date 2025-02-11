#![allow(dead_code)]

use std::fmt::*;

fn main() {
  println!("\nRust Basics");
  primitives();
  libtypes();
  usertypes();
}
/*-- demo primitives --------------------------------------
  Demonstrate primitive types, e.g.:
    - integers, floats, arrays, &strs, structs
    - type declarations and inference
*/
fn primitives() {
  show_note("primitive types");
  
  nl();
  show_op("boolean");
/*---------------------------------------*/
  let b1 = true;
  show_type(&b1, "b1");

  let b2 = false;
  show_type(&b2, "b2");

  nl();
  show_op("integers");
/*---------------------------------------*/
  let i = 42u8;     /* typed literal */
  show_type(&i, "i");

  let j:i32 = 42;       /* typed variable */
  show_type(&j, "j");

  let k = 42;      /* inferred type */
  show_type(&k, "k");
  
  nl();
  /* types must match exactly or be cast */
 
  let sum1 = i as i32 + j;
  outln_type(&sum1, "i as i32 + j");

  let sum2 = i + j as u8;
  outln_type(&sum2, "i + j as u8");

  nl();
  show_op("floating point numbers");
/*---------------------------------------*/  
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
  show_op("literal strings");
  /* 
    the &str type represents const literal strings 
    placed in static memory 
  */
  let ls = "a literal string"; /* reference to literal string */
  show_type(&ls, "ls");

  nl();
  show_op("arrays of primitives");
/*---------------------------------------*/  
let arr1:[i32; 3] = [1, 2, 3];
  show_type(&arr1, "arr1");

  let arr2 = [1i64, 2, 3];
  show_type(&arr2, "arr2");

  let arr3 = [1.0, 2.0, 3.0];
  show_type(&arr3, "arr3");

  nl();
  show_op("structs");
  /* define type Demo */
  #[derive(Debug)]
  struct Demo { i:i32, d:f64, c:char }
  
  /* use type Demo */
  let mut s1 = Demo { i:1, d:2.5, c:'z'};
  show_type(&s1, "s1"); 

  s1.d = -2.5;  /* access element by name */
  show_op("s1.d = -2.5");
  show_type(&s1, "s1");

  nl();
  show_op("tuples");
/*---------------------------------------*/  
  let mut tup = (42, 3.1415927, [1, 2, 3]);
  show_type(&tup, "tup");
  show_op("tup.1 = 1.2");
  tup.1 = 1.2;  /* access element by position */
  show_type(&tup, "tup");


  nl();
  show_op("mutating operations");
  let mut arr4 = arr3;
  arr4[1] = -2.5;
  show_type(&arr4, "arr4");

  let ref4 = &mut arr4;
  ref4[0] = -0.5;
  show_type(&ref4, "ref4");

  arr4[2] = 6.5;
  show_type(&arr4, "arr4");

/*--------------------------------------------- 
  next operation fails to compile since
  its target has mutated
*/
// let second = ref4[1];

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
  
  /* basic String operations */
  show_op("String");
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
  /* vectors */
  show_op("Vec<T>");
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
/*-- show_type --------------------------------------------
  Shows compiler recognized type and data value
*/
fn usertypes() {

  show_note("user-defined types");
  nl();
  show_op("Demo");
  #[derive(Debug, Clone)]
  pub struct Demo {
    name:String,
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
    /* retrieve name */
    pub fn get(&self) -> String {
      self.name.clone()
    }
    /* modify name */
    pub fn set(&mut self, st:&str) {
      self.name = st.to_string();
    }
  }
  
  show_op("let mut d = Demo::new().init(\"Joe\")");
  let mut d = Demo::new().init("Joe");
  show_type(&d, "d");

  show_op("d.set(\"Frank\")");
  d.set("Frank");
  outln(&d, "d");

  show_op("let name = d.get()");
  let name = d.get();
  outln(&name, "name");

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

pub fn out<T:Debug>(t: &T, name: &str) {
  print!("  {name} = {t:?}");
}

pub fn outln<T:Debug>(t: &T, name: &str) {
  print!("  {name} = {t:?}\n");
}

pub fn outln_type<T:Debug>(t: &T, name: &str) {
  let typename = std::any::type_name::<T>();
  println!("  {name} = {t:?}{}", typename);
}

pub fn nl() {
  print!("\n");
}
