/////////////////////////////////////////////////////////////
// TypeErasureDataFlowStructure::Executive::main.rs        //
//   - Executive creates and uses all lower level parts    //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    Executive creates trait objects for Output and Compute
    and wires them into a dataflow pipeline with InputImpl.
    None of the other components use concrete types. 
*/
// executive/src/main.rs
use compute::ComputeImpl;
use input::InputImpl;
use output::OutputImpl;

fn main() {
  println!("\n-- Type‑Erasure Pipeline via dyn --\n");

  // Wire the chain up, but only in `main`
  let output: Box<dyn compute::Output> = Box::new(OutputImpl::new());
  let compute: Box<dyn input::Compute> = Box::new(ComputeImpl::new(output));
  let mut input: InputImpl = InputImpl::new(compute);

  // Use it generically:
  let mut total = 0;
  for path in &[
    "./src/main.rs",
    "../Input/src/lib.rs",
    "../Compute/src/lib.rs",
    "../Output/src/lib.rs",
    "../Fileutils/src/lib.rs"
  ] {
    total += input.do_input(path);
    println!();
  }

  println!("total lines: {}", total);
  println!("\nThat's all Folks!\n");
}
