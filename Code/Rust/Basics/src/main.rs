use std::fmt::*;

fn main() {
  println!("Rust Basics");
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
  outln(&sum1, "i as i32 + j");

  let sum2 = i + j as u8;
  outln(&sum2, "i + j as u8");

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
  outln(&div2, "(d as f64)/e");

  nl();
  show_op("arrays of primitives");
  let arr1:[i32; 3] = [1, 2, 3];
  show_type(&arr1, "arr1");

  let arr2 = [1i64, 2, 3];
  show_type(&arr2, "arr2");

  let arr3 = [1.0, 2.0, 3.0];
  show_type(&arr3, "arr3");

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
/*-- show_type --------------------------------------------
  Shows compiler recognized type and data value
*/
fn libtypes() {
  show_note("std::lib types");

}
/*-- show_type --------------------------------------------
  Shows compiler recognized type and data value
*/
fn usertypes() {
  show_note("user-defined types");

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
  let typename = std::any::type_name::<T>();
  println!("  {name} = {t:?}{}", typename);
}

pub fn nl() {
  print!("\n");
}
