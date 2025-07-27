/////////////////////////////////////////////////////////////
// TypeErasureDataFlowStructure::Executive::main.rs        //
//   - Executive creates and uses all lower level parts    //
// Jim Fawcett, https://JimFawcett.github.io, 04 Mar 2021  //
/////////////////////////////////////////////////////////////
/*
  Note:
    Executive only creates Input instance.  The rest of
    the pipeline self installs, e.g., Input creates Compute,
    and Compute creates Output.
*/
use std::fs::File;
use input::*;
use compute::*;
use output::*;

// tell Rust that ComputeImpl implements the trait Compute
// impl Output for OutputImpl {
//     fn new() -> Self {
//         OutputImpl::new()
//     }
//     fn do_output(&self, name: &str, lines: usize) {
//         OutputImpl::do_output(self, name, lines);
//     }
// }

// // tell Rust that ComputeImpl implements the trait Compute
// impl Compute for ComputeImpl<OutputImpl> {
//     fn new() -> Self {
//         ComputeImpl::<OutputImpl>::new()
//     }
//     fn do_compute(&mut self, name: &str, file: File) {
//         ComputeImpl::<OutputImpl>::do_compute(self, name, file)
//     }
//     fn lines(&self) -> usize {
//         ComputeImpl::<OutputImpl>::lines(self)
//     }
// }

fn main() {
  let putln = || println!();

  print!("\n  -- TypeErasureDataFlowStructure::Executive --\n");

  let mut inp = InputImpl::<ComputeImpl<OutputImpl>>::new();

  let mut lines = 0;
  let name = "./src/main.rs";
  lines += inp.do_input(name);
  putln();

  let name = "../Input/src/lib.rs";
  lines += inp.do_input(name);
  let name = "../Input/examples/test1.rs";
  lines += inp.do_input(name);
  putln();

  let name = "../Compute/src/lib.rs";
  lines += inp.do_input(name);
  let name = "../Compute/examples/test1.rs";
  lines += inp.do_input(name);
  putln();

  let name = "../Output/src/lib.rs";
  lines += inp.do_input(name);
  let name = "../Output/examples/test1.rs";
  lines += inp.do_input(name);
  putln();

  print!("\n  total lines: {}", lines);

  print!("\n\n  That's all Folks!\n\n");
}
